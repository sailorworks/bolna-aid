"use client";

import { useState, useCallback } from "react";
import { useAudioAgent } from "@/lib/useAudioAgent";
import TopBar from "@/components/TopBar";
import { Mic, Square } from "lucide-react";

export default function Home() {
  const { isConnected, connect, disconnect } = useAudioAgent();

  // Session state
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Demo patient state (will be populated by voice commands in later phases)
  const [patientName] = useState<string | null>(null);
  const [patientAge] = useState<number | null>(null);
  const [patientSex] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setSessionStartTime(new Date());
    await connect();
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    setSessionStartTime(null);
    disconnect();
  }, [disconnect]);

  return (
    <div className="console-root">
      {/* Top Bar */}
      <TopBar
        patientName={patientName}
        patientAge={patientAge}
        patientSex={patientSex}
        isConnected={isConnected}
        sessionStartTime={sessionStartTime}
      />

      {/* Main Grid */}
      <main className="console-grid">
        {/* Row 1, Col 1 — Patient Card */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-1"
          style={{ gridArea: "patient" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">👤</span>
            Patient Profile
          </div>
          <div className="panel-empty-text">
            Say a patient name to load profile
          </div>
        </section>

        {/* Row 1, Col 2 — Protocol Viewer */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-2"
          style={{ gridArea: "protocol" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">📋</span>
            Protocol Viewer
          </div>
          <div className="panel-empty-text">No active protocol</div>
        </section>

        {/* Row 1-2, Col 3 — Voice Command Center */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-3 voice-column"
          style={{ gridArea: "voice" }}
        >
          <div className="voice-column-inner">
            {/* Orb placeholder */}
            <div className="orb-placeholder">
              <div
                className={`orb-circle ${isConnected ? "active" : ""}`}
              />
              <span className="orb-label">
                {isConnected ? "Listening..." : "Offline"}
              </span>
            </div>

            {/* Start/End button */}
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={`triage-btn ${isConnected ? "end" : "start"}`}
            >
              {isConnected ? (
                <Square size={16} />
              ) : (
                <Mic size={16} />
              )}
              {isConnected ? "End Session" : "Start Triage"}
            </button>

            {/* Transcript placeholder */}
            <div className="transcript-placeholder">
              <div className="panel-header">
                <span className="panel-header-icon">💬</span>
                Live Transcript
              </div>
              {isConnected ? (
                <p className="transcript-waiting">
                  Waiting for conversation...
                </p>
              ) : (
                <p className="panel-empty-text" style={{ padding: "var(--space-4)" }}>
                  Start a session to see transcript
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Row 2, Col 1 — Vitals + ESI */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-4"
          style={{ gridArea: "vitals" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">🫀</span>
            Vitals & ESI Level
          </div>
          <div className="vitals-placeholder-grid">
            <div className="vital-slot">
              <span className="vital-label">ESI</span>
              <span className="vital-value">--</span>
            </div>
            <div className="vital-slot">
              <span className="vital-label">HR</span>
              <span className="vital-value">--</span>
            </div>
            <div className="vital-slot">
              <span className="vital-label">BP</span>
              <span className="vital-value">--</span>
            </div>
            <div className="vital-slot">
              <span className="vital-label">RR</span>
              <span className="vital-value">--</span>
            </div>
            <div className="vital-slot">
              <span className="vital-label">SpO2</span>
              <span className="vital-value">--</span>
            </div>
            <div className="vital-slot">
              <span className="vital-label">GCS</span>
              <span className="vital-value">--</span>
            </div>
          </div>
        </section>

        {/* Row 2, Col 2 — Drug Safety */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-5"
          style={{ gridArea: "drug" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">💊</span>
            Drug Safety Check
          </div>
          <div className="panel-empty-text">
            Ask &quot;Is [drug] safe?&quot; to check
          </div>
        </section>

        {/* Row 3, Col 1-2 — Triage Event Log */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-6"
          style={{ gridArea: "log" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">📝</span>
            Triage Log
            <span className="log-count-badge">0</span>
          </div>
          <div className="panel-empty-text">
            Events will appear here as triage progresses
          </div>
        </section>

        {/* Row 3, Col 3 — Handoff Summary */}
        <section
          className="panel noise-overlay animate-panel-enter panel-stagger-7"
          style={{ gridArea: "handoff" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">📄</span>
            Handoff Summary
          </div>
          <div className="panel-empty-text">
            Say &quot;prepare handoff&quot; to generate
          </div>
        </section>
      </main>

      <style jsx>{`
        .console-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--surface-void);
          overflow: hidden;
        }

        /* ── Main Grid ── */
        .console-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 340px;
          grid-template-rows: 1fr 1fr 240px;
          grid-template-areas:
            "patient  protocol voice"
            "vitals   drug     voice"
            "log      log      handoff";
          gap: var(--panel-gap);
          padding: var(--panel-gap);
          min-height: 0;
        }

        /* ── Voice Column (right side) ── */
        .voice-column {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .voice-column-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          padding: var(--space-5) var(--space-4);
          gap: var(--space-4);
        }

        /* ── Orb Placeholder ── */
        .orb-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding-top: var(--space-5);
        }

        .orb-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--surface-elevated);
          border: 2px solid var(--border-subtle);
          transition: all 0.5s ease;
        }

        .orb-circle.active {
          border-color: var(--signal-vitals);
          box-shadow: 0 0 30px var(--signal-vitals-dim),
            0 0 60px var(--signal-vitals-glow);
          animation: orb-breathe 4s ease-in-out infinite;
        }

        .orb-label {
          font-family: var(--font-data);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          transition: color 0.3s ease;
        }

        .orb-circle.active + .orb-label {
          color: var(--signal-vitals);
        }

        /* ── Triage Button ── */
        .triage-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 10px 24px;
          border: none;
          border-radius: 100px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.02em;
        }

        .triage-btn.start {
          background: var(--signal-vitals);
          color: var(--surface-void);
          box-shadow: 0 0 20px var(--signal-vitals-glow);
        }

        .triage-btn.start:hover {
          box-shadow: 0 0 30px var(--signal-vitals-dim);
          transform: translateY(-1px);
        }

        .triage-btn.end {
          background: var(--signal-critical);
          color: white;
          box-shadow: 0 0 20px var(--signal-critical-dim);
        }

        .triage-btn.end:hover {
          box-shadow: 0 0 30px rgba(255, 71, 87, 0.3);
          transform: translateY(-1px);
        }

        /* ── Transcript Placeholder ── */
        .transcript-placeholder {
          width: 100%;
          flex: 1;
          min-height: 0;
          padding: var(--space-3);
          border-top: 1px solid var(--border-subtle);
          overflow: hidden;
        }

        .transcript-waiting {
          font-family: var(--font-data);
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          padding: var(--space-4);
          animation: orb-breathe 3s ease-in-out infinite;
        }

        /* ── Vitals Placeholder Grid ── */
        .vitals-placeholder-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
          padding: var(--space-2) 0;
        }

        .vital-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-2) var(--space-1);
          background: var(--surface-elevated);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .vital-label {
          font-family: var(--font-data);
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .vital-value {
          font-family: var(--font-data);
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* ── Log Count Badge ── */
        .log-count-badge {
          font-family: var(--font-data);
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--surface-elevated);
          padding: 1px 8px;
          border-radius: 100px;
          border: 1px solid var(--border-subtle);
          margin-left: auto;
        }

        /* ── Panel header icon ── */
        .panel-header-icon {
          font-size: 0.85rem;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
