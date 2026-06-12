"use client";

import type { VoiceState } from "@/lib/types";

interface VoiceOrbProps {
  state: VoiceState;
}

export default function VoiceOrb({ state }: VoiceOrbProps) {
  const isOffline = state === "offline";
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  return (
    <div className="orb-container">
      {/* Sonar rings — only visible when listening */}
      <div className="orb-rings-wrapper" aria-hidden="true">
        {isListening && (
          <>
            <div className="sonar-ring ring-1" />
            <div className="sonar-ring ring-2" />
            <div className="sonar-ring ring-3" />
          </>
        )}
      </div>

      {/* The orb itself */}
      <div
        className={`orb ${state}`}
        role="status"
        aria-label={`Voice agent is ${state}`}
      >
        {/* Inner glow layer */}
        <div className="orb-glow" />

        {/* Equalizer bars — only visible when speaking */}
        {isSpeaking && (
          <div className="eq-bars" aria-hidden="true">
            <div className="eq-bar bar-1" />
            <div className="eq-bar bar-2" />
            <div className="eq-bar bar-3" />
            <div className="eq-bar bar-4" />
            <div className="eq-bar bar-5" />
          </div>
        )}

        {/* Center dot — listening indicator */}
        {isListening && <div className="orb-center-dot" />}

        {/* Offline icon */}
        {isOffline && <div className="orb-offline-icon" />}
      </div>

      {/* Status label */}
      <span className={`orb-status-label ${state}`}>
        {isOffline && "Offline"}
        {isListening && "Listening..."}
        {isSpeaking && "Speaking..."}
      </span>

      <style jsx>{`
        .orb-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-5) 0 var(--space-2);
        }

        /* ── Sonar Rings ── */
        .orb-rings-wrapper {
          position: absolute;
          top: var(--space-5);
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 80px;
          pointer-events: none;
        }

        .sonar-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid var(--signal-vitals);
          opacity: 0;
          animation: sonar-ring 2.4s ease-out infinite;
        }

        .ring-1 { animation-delay: 0s; }
        .ring-2 { animation-delay: 0.8s; }
        .ring-3 { animation-delay: 1.6s; }

        /* ── The Orb ── */
        .orb {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--surface-elevated);
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition:
            border-color 0.5s ease,
            box-shadow 0.5s ease,
            background 0.5s ease;
          z-index: 1;
        }

        /* Offline */
        .orb.offline {
          border-color: var(--border-subtle);
          box-shadow: none;
        }

        /* Listening */
        .orb.listening {
          border-color: var(--signal-vitals);
          box-shadow:
            0 0 24px var(--signal-vitals-glow),
            0 0 48px rgba(0, 212, 170, 0.06);
          animation: orb-breathe 4s ease-in-out infinite;
        }

        /* Speaking */
        .orb.speaking {
          border-color: var(--voice-orb-speak);
          box-shadow:
            0 0 24px var(--signal-info-dim),
            0 0 48px rgba(77, 171, 247, 0.06);
          animation: orb-breathe 2.5s ease-in-out infinite;
        }

        /* ── Inner Glow ── */
        .orb-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          transition: opacity 0.5s ease;
          opacity: 0;
        }

        .orb.listening .orb-glow {
          opacity: 1;
          background: radial-gradient(
            circle at center,
            rgba(0, 212, 170, 0.15) 0%,
            rgba(0, 212, 170, 0.05) 50%,
            transparent 70%
          );
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .orb.speaking .orb-glow {
          opacity: 1;
          background: radial-gradient(
            circle at center,
            rgba(77, 171, 247, 0.15) 0%,
            rgba(77, 171, 247, 0.05) 50%,
            transparent 70%
          );
        }

        /* ── Center Dot (listening) ── */
        .orb-center-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--signal-vitals);
          box-shadow: 0 0 12px var(--signal-vitals-dim);
          z-index: 2;
          animation: orb-breathe 2s ease-in-out infinite;
        }

        /* ── Offline Icon (small circle outline) ── */
        .orb-offline-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--text-muted);
          position: relative;
        }

        .orb-offline-icon::after {
          content: '';
          position: absolute;
          top: 50%;
          left: -3px;
          right: -3px;
          height: 2px;
          background: var(--text-muted);
          transform: rotate(-45deg);
          transform-origin: center;
        }

        /* ── Equalizer Bars (speaking) ── */
        .eq-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 40px;
          z-index: 2;
        }

        .eq-bar {
          width: 4px;
          border-radius: 2px;
          background: var(--voice-orb-speak);
          height: 20%;
        }

        .bar-1 {
          animation: eq-bar-1 0.8s ease-in-out infinite;
          animation-delay: 0s;
        }
        .bar-2 {
          animation: eq-bar-2 0.6s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        .bar-3 {
          animation: eq-bar-3 0.7s ease-in-out infinite;
          animation-delay: 0.05s;
        }
        .bar-4 {
          animation: eq-bar-4 0.65s ease-in-out infinite;
          animation-delay: 0.15s;
        }
        .bar-5 {
          animation: eq-bar-5 0.75s ease-in-out infinite;
          animation-delay: 0.08s;
        }

        /* ── Status Label ── */
        .orb-status-label {
          font-family: var(--font-data);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.4s ease;
        }

        .orb-status-label.offline {
          color: var(--text-muted);
        }

        .orb-status-label.listening {
          color: var(--signal-vitals);
        }

        .orb-status-label.speaking {
          color: var(--voice-orb-speak);
        }
      `}</style>
    </div>
  );
}
