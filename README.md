# Bolna-Aid: Clinical Triage Voice Agent

Bolna-Aid is an Emergency Department (ED) triage co-pilot built with Next.js and the [Bolna Voice AI platform](https://www.bolna.ai/). 

It uses a direct browser-to-Bolna WebSocket audio bridge to allow medical staff to speak naturally with an AI agent. The agent is configured with the Cartesia TTS provider (using a British female voice) and Deepgram for fast, accurate speech-to-text.

## Features

- **Direct Browser Audio Bridge:** Uses the Web Audio API and WebSockets to stream 16kHz PCM audio directly to Bolna, without needing SIP trunking or telephony providers.
- **Low Latency:** Configured with `gpt-4o-mini` and `sonic-english` for near-instant conversational responses.
- **Hackathon Scaffold:** Built as part of the Voc-a-thon to demonstrate real-time AI in clinical settings.

## Prerequisites

1. Node.js 18+
2. A Bolna API Key
3. A configured Bolna Agent ID (using Cartesia)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sailorworks/bolna-aid.git
   cd bolna-aid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Your Bolna API Key
   BOLNA_API_KEY=your_bolna_api_key

   # The Bolna API URL (must be exactly this for v2 API)
   BOLNA_API_URL=https://api.bolna.ai

   # Your registered Agent ID
   NEXT_PUBLIC_AGENT_ID=your_agent_id
   ```

   *Note: If you don't have an agent registered, use the provided `agent-config.json` payload to create one via `POST https://api.bolna.ai/v2/agent`.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Test the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser. Click **Start Triage**, allow microphone access, and begin speaking to the agent.

## Architecture

- `src/app/page.tsx`: The main UI console for the triage dashboard.
- `src/lib/useAudioAgent.ts`: A custom React hook that manages the `AudioContext`, downsamples float32 mic data to 16kHz int16 PCM, handles the base64-encoded JSON WebSocket protocol for Bolna, and manages gapless audio playback and interruptions.
- `agent-config.json`: The exact payload schema used to configure the Bolna agent via the v2 API.

## Technical Notes
- The Bolna WebSocket endpoint (`wss://api.bolna.ai/chat/v1/{agent_id}`) expects payloads in the format `{"type": "audio", "data": "<base64>"}`.
- Native browser `WebSocket` APIs cannot pass `Authorization: Bearer` headers. 
- Browsers record at 44.1kHz or 48kHz, so `useAudioAgent.ts` uses an `AudioContext` with `sampleRate: 16000` to force the browser to downsample before we encode the buffers.
