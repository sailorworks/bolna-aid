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

      // Initialize AudioContext forcing 16kHz
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
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

        source.connect(processor);
        processor.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && ackReceivedRef.current) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBuffer = floatTo16BitPCM(inputData);
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
        }
        // Handle mark — echo back to server for playback tracking
        else if (msg.type === "mark") {
          console.log("Echoing mark event back to server");
          ws.send(JSON.stringify(msg));
        }
        // Handle audio playback
        else if (msg.type === "audio" && msg.data) {
          const arrayBuffer = base64ToArrayBuffer(msg.data);
          
          // Bolna sends a 1-byte null packet (\x00) as an end-of-stream marker.
          // Raw PCM 16-bit requires an even number of bytes. Skip odd-length buffers.
          if (arrayBuffer.byteLength % 2 !== 0) {
            console.log("Skipping non-PCM packet (likely stream marker), length:", arrayBuffer.byteLength);
            return;
          }
          
          console.log(`Received valid audio packet, length: ${arrayBuffer.byteLength} bytes`);
          
          try {
            // Decode raw 16-bit PCM manually as it lacks a WAV header
            const int16Array = new Int16Array(arrayBuffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
              float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 32768 : 32767);
            }
            const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 16000);
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

          } catch (err) {
            console.error("Audio decode error", err);
          }
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
  }, []);

  return { isConnected, connect, disconnect };
}
