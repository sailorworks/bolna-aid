"use client";
import { useAudioAgent } from "@/lib/useAudioAgent";
import { Mic, Square } from "lucide-react";

export default function Home() {
  const { isConnected, connect, disconnect } = useAudioAgent();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-24">
      <h1 className="text-4xl font-bold mb-8">Bolna-Aid ED Triage Console</h1>
      
      <button 
        onClick={isConnected ? disconnect : connect}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }`}
      >
        {isConnected ? <Square size={20} /> : <Mic size={20} />}
        {isConnected ? 'End Session' : 'Start Triage'}
      </button>

      {/* Connection Status Indicator */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-zinc-400">
            {isConnected ? 'Agent connected & listening...' : 'Disconnected'}
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-4">Agent ID: {process.env.NEXT_PUBLIC_AGENT_ID}</p>
      </div>
    </main>
  );
}
