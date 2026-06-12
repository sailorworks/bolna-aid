"use client";

import { useState, useCallback, useMemo } from "react";
import { useAudioAgent } from "@/lib/useAudioAgent";
import TopBar from "@/components/TopBar";
import VoiceOrb from "@/components/VoiceOrb";
import PatientCard from "@/components/PatientCard";
import VitalsSnapshot from "@/components/VitalsSnapshot";
import HandoffSummary from "@/components/HandoffSummary";
import { Mic, Square } from "lucide-react";
import type { VoiceState } from "@/lib/types";
import { DEMO_PATIENTS, type DemoPatient } from "@/lib/patient-data";

export default function Home() {
  const { isConnected, connect, disconnect } = useAudioAgent();

  // Session state
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Demo patient state
  const [activePatient, setActivePatient] = useState<DemoPatient | null>(null);

  // Handoff state
  const [handoffGenerated, setHandoffGenerated] = useState(false);

  const handleSelectPatient = useCallback((data: DemoPatient | null) => {
    setActivePatient(data);
    setHandoffGenerated(false); // reset handoff when patient changes
  }, []);

  const handleConnect = useCallback(async () => {
    setSessionStartTime(new Date());
    await connect();
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    setSessionStartTime(null);
    disconnect();
  }, [disconnect]);

  // Derive voice state for the orb
  // For now: offline when disconnected, listening when connected
  // Phase 4 will add isSpeaking from the hook to switch to 'speaking'
  const voiceState: VoiceState = useMemo(() => {
    if (!isConnected) return "offline";
    return "listening";
  }, [isConnected]);

  return (
    <div className="console-root">
      {/* Top Bar */}
      <TopBar
        patientName={activePatient?.patient.name ?? null}
        patientAge={activePatient?.patient.age ?? null}
        patientSex={activePatient?.patient.sex ?? null}
        isConnected={isConnected}
        sessionStartTime={sessionStartTime}
      />

      {/* Main Grid */}
      <main className="console-grid">
        {/* Row 1, Col 1 — Patient Card */}
        <section
          className={`panel noise-overlay animate-panel-enter panel-stagger-1 ${handoffGenerated ? "dimmed" : ""}`}
          style={{ gridArea: "patient" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">👤</span>
            Patient Profile
          </div>
          <PatientCard patient={activePatient?.patient ?? null} />
        </section>

        {/* Row 1, Col 2 — Protocol Viewer */}
        <section
          className={`panel noise-overlay animate-panel-enter panel-stagger-2 ${handoffGenerated ? "dimmed" : ""}`}
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
            {/* Voice Orb — the signature element */}
            <VoiceOrb state={voiceState} />

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

            {/* Demo Patient Selector */}
            <div className="demo-selector">
              <span className="demo-selector-label">Load Demo Patient</span>
              <div className="demo-selector-btns">
                {Object.entries(DEMO_PATIENTS).map(([key, data]) => (
                  <button
                    key={key}
                    className={`demo-btn ${activePatient?.patient.id === data.patient.id ? "active" : ""}`}
                    onClick={() => handleSelectPatient(data)}
                  >
                    {data.patient.name.split(" ")[0]}
                  </button>
                ))}
                {activePatient && (
                  <button
                    className="demo-btn clear"
                    onClick={() => handleSelectPatient(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Generate Handoff Button */}
            {activePatient && !handoffGenerated && (
              <button
                className="handoff-btn"
                onClick={() => setHandoffGenerated(true)}
              >
                📄 Generate Handoff
              </button>
            )}
          </div>
        </section>

        <section
          className={`panel noise-overlay animate-panel-enter panel-stagger-4 ${handoffGenerated ? "dimmed" : ""}`}
          style={{ gridArea: "vitals" }}
        >
          <div className="panel-header">
            <span className="panel-header-icon">🫀</span>
            Vitals & ESI Level
          </div>
          <VitalsSnapshot
            vitals={activePatient?.vitals ?? null}
            esi={activePatient?.esi ?? null}
          />
        </section>

        {/* Row 2, Col 2 — Drug Safety */}
        <section
          className={`panel noise-overlay animate-panel-enter panel-stagger-5 ${handoffGenerated ? "dimmed" : ""}`}
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
          className={`panel noise-overlay animate-panel-enter panel-stagger-6 ${handoffGenerated ? "dimmed" : ""}`}
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
          <HandoffSummary
            patient={activePatient?.patient ?? null}
            vitals={activePatient?.vitals ?? null}
            esi={activePatient?.esi ?? null}
            isGenerated={handoffGenerated}
          />
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

        /* Orb styles are self-contained in VoiceOrb.tsx */

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



        /* ── Demo Selector ── */
        .demo-selector {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-subtle);
        }

        .demo-selector-label {
          font-family: var(--font-data);
          font-size: 0.55rem;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .demo-selector-btns {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          justify-content: center;
        }

        .demo-btn {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid var(--border-subtle);
          background: var(--surface-elevated);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .demo-btn:hover {
          border-color: var(--border-active);
          color: var(--text-primary);
          background: var(--surface-hover);
        }

        .demo-btn.active {
          border-color: var(--signal-vitals);
          color: var(--signal-vitals);
          background: var(--signal-vitals-glow);
        }

        .demo-btn.clear {
          border-color: var(--signal-critical-dim);
          color: var(--signal-critical);
        }

        .demo-btn.clear:hover {
          background: var(--signal-critical-dim);
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

        /* ── Handoff Button ── */
        .handoff-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 8px 18px;
          border: 1px solid var(--signal-info);
          border-radius: 100px;
          background: var(--signal-info-dim);
          color: var(--signal-info);
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.02em;
        }

        .handoff-btn:hover {
          background: rgba(77, 171, 247, 0.2);
          box-shadow: 0 0 20px var(--signal-info-dim);
          transform: translateY(-1px);
        }

        /* ── Panel Dimming (when handoff is shown) ── */
        .dimmed {
          opacity: 0.5;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
