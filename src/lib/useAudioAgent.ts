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

      // Setup WebSocket
      const wsUrl = `wss://api.bolna.ai/chat/v1/${agentId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Bolna WebSocket");
        setIsConnected(true);
        
        // Start processing mic data
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        // ScriptProcessor is technically deprecated but perfect for hackathon audio downsampling
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBuffer = floatTo16BitPCM(inputData);
            const base64Data = arrayBufferToBase64(pcmBuffer);
            ws.send(JSON.stringify({ type: "audio", data: base64Data }));
          }
        };
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "clear") {
          console.log("Interrupt received! Clearing audio.");
          activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch(e) {}
          });
          activeSourcesRef.current = [];
          // Reset playhead to current time so next audio starts immediately
          nextPlayTimeRef.current = audioCtx.currentTime;
        } 
        else if (msg.type === "audio" && msg.data) {
          const arrayBuffer = base64ToArrayBuffer(msg.data);
          try {
            // Convert Int16 buffer back to Float32 for Web Audio API playback
            const int16Array = new Int16Array(arrayBuffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
              float32Array[i] = int16Array[i] / (int16Array[i] >= 0 ? 32767 : 32768);
            }

            const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 16000);
            audioBuffer.copyToChannel(float32Array, 0);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            
            // Queue playback gaplessly
            const scheduleTime = Math.max(audioCtx.currentTime, nextPlayTimeRef.current);
            source.start(scheduleTime);
            nextPlayTimeRef.current = scheduleTime + audioBuffer.duration;
            
            // Keep track of active sources so we can stop them if interrupted
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
