"use client";
import { useState, useRef, useCallback } from "react";

export function useAudioAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Track playback state for queued audio chunks
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const leftoverByteRef = useRef<number | null>(null);
  
  // Web-call handshake: server must send 'ack' before we stream audio
  const ackReceivedRef = useRef<boolean>(false);

  // Helpers
  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const connect = useCallback(async () => {
    try {
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
      if (!agentId) throw new Error("Missing NEXT_PUBLIC_AGENT_ID");
      
      const apiKey = process.env.NEXT_PUBLIC_BOLNA_API_KEY;
      if (!apiKey) throw new Error("Missing NEXT_PUBLIC_BOLNA_API_KEY");
      
      ackReceivedRef.current = false;
      let audioDebugCount = 0;

      // Use device default sample rate for output — the PCM buffers are created at 16kHz,
      // the browser resamples automatically. Forcing 16kHz on the context itself can
      // cause device incompatibility on some systems.
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      
      // Must resume context following browser autoplay policies
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      nextPlayTimeRef.current = audioCtx.currentTime;

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup WebSocket — use /web-call/v1/ endpoint with query-param auth (browser-compatible)
      const wsUrl = `wss://api.bolna.ai/web-call/v1/${agentId}?auth_token=${apiKey}&user_agent=web-call&enforce_streaming=true`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Bolna WebSocket");
        
        // Step 1: Send init packet — server will respond with 'ack' before we can stream audio
        ws.send(JSON.stringify({
          type: "init",
          meta_data: { context_data: {} }
        }));
        console.log("Sent init packet, waiting for ack...");
      };
      
      // Helper to start mic processing — called after 'ack' is received
      const startMicCapture = () => {
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // Use a silent GainNode (gain=0) so onaudioprocess fires without
        // routing mic audio to speakers (which would cause echo feedback)
        const silentGain = audioCtx.createGain();
        silentGain.gain.value = 0;
        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && ackReceivedRef.current) {
            const inputData = e.inputBuffer.getChannelData(0);

            // AudioContext runs at device default rate (e.g. 48kHz).
            // Bolna expects 16kHz PCM — downsample by picking every Nth sample.
            const deviceRate = audioCtx.sampleRate;
            const targetRate = 16000;

            let samples: Float32Array;
            if (deviceRate !== targetRate) {
              const ratio = deviceRate / targetRate;
              const newLength = Math.floor(inputData.length / ratio);
              samples = new Float32Array(newLength);
              for (let i = 0; i < newLength; i++) {
                samples[i] = inputData[Math.floor(i * ratio)];
              }
            } else {
              samples = inputData;
            }

            const pcmBuffer = floatTo16BitPCM(samples);
            const base64Data = arrayBufferToBase64(pcmBuffer);
            ws.send(JSON.stringify({ type: "audio", data: base64Data }));
          }
        };
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        // Handle ack — server is ready, start mic capture
        if (msg.type === "ack") {
          console.log("Ack received — starting mic capture");
          ackReceivedRef.current = true;
          setIsConnected(true);
          startMicCapture();
        }
        // Handle interruption
        else if (msg.type === "clear") {
          console.log("Interrupt received! Clearing audio.");
          activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch(e) {}
          });
          activeSourcesRef.current = [];
          nextPlayTimeRef.current = audioCtx.currentTime;
          leftoverByteRef.current = null;
        }
        // Handle mark — echo back to server for playback tracking
        else if (msg.type === "mark") {
          console.log("Echoing mark event back to server");
          ws.send(JSON.stringify(msg));
        }
        // Handle audio playback
        // CONFIRMED FORMAT (debug_audio.py diagnostic):
        // Bolna hosted API sends G.711 mu-law, 8-bit, 8000 Hz.
        // Each byte = one sample. No byte-stitching needed (1 byte per sample).
        // EOF markers are also 1-byte \x00 packets — skip those specifically.
        else if (msg.type === "audio" && msg.data) {
          const bytes = new Uint8Array(base64ToArrayBuffer(msg.data));

          // Skip 1-byte \x00 EOF/stream markers
          if (bytes.length === 1 && bytes[0] === 0x00) {
            return;
          }
          if (bytes.length === 0) return;

          console.log(`Decoding ${bytes.length} bytes as G.711 mu-law @ 8000Hz`);

          // G.711 mu-law decode: each byte → 16-bit linear PCM sample
          const float32Array = new Float32Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) {
            // Standard G.711 mu-law expansion
            let muLaw = ~bytes[i];                        // invert all bits
            const sign     = muLaw & 0x80;
            const exponent = (muLaw >> 4) & 0x07;
            const mantissa = muLaw & 0x0f;
            let linear = ((mantissa << 3) + 132) << exponent;
            linear -= 132;
            float32Array[i] = (sign ? -linear : linear) / 32768.0;
          }

          // Create buffer at 8000 Hz — browser resamples to device rate
          const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 8000);
          audioBuffer.getChannelData(0).set(float32Array);

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          const scheduleTime = Math.max(audioCtx.currentTime, nextPlayTimeRef.current);
          source.start(scheduleTime);
          nextPlayTimeRef.current = scheduleTime + audioBuffer.duration;

          activeSourcesRef.current.push(source);
          source.onended = () => {
            activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
          };
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        disconnect();
      };

    } catch (err) {
      console.error("Failed to start audio agent", err);
      disconnect();
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    leftoverByteRef.current = null;
  }, []);

  return { isConnected, connect, disconnect };
}
