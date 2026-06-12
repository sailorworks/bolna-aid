"use client";

import { useEffect, useState, useRef } from "react";

interface TopBarProps {
  patientName: string | null;
  patientAge: number | null;
  patientSex: string | null;
  isConnected: boolean;
  sessionStartTime: Date | null;
}

export default function TopBar({
  patientName,
  patientAge,
  patientSex,
  isConnected,
  sessionStartTime,
}: TopBarProps) {
  const [elapsed, setElapsed] = useState("00:00");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Triage timer — counts up from session start
  useEffect(() => {
    if (!sessionStartTime) {
      setElapsed("00:00");
      return;
    }

    const tick = () => {
      const diff = Math.floor(
        (Date.now() - sessionStartTime.getTime()) / 1000
      );
      const mins = String(Math.floor(diff / 60)).padStart(2, "0");
      const secs = String(diff % 60).padStart(2, "0");
      setElapsed(`${mins}:${secs}`);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionStartTime]);

  return (
    <header className="topbar">
      {/* Left — Wordmark */}
      <div className="topbar-left">
        <span className="topbar-wordmark">Bolna-Aid</span>
        <span className="topbar-subtitle">ED Triage Console</span>
      </div>

      {/* Center — Patient Badge */}
      <div className="topbar-center">
        {patientName ? (
          <div className={`patient-badge ${isConnected ? "active" : ""}`}>
            <div className="patient-badge-dot" />
            <span className="patient-badge-name">
              {patientName}, {patientAge}
              {patientSex}
            </span>
          </div>
        ) : (
          <div className="patient-badge empty">
            <span className="patient-badge-name">No active patient</span>
          </div>
        )}
      </div>

      {/* Right — Timer + Connection */}
      <div className="topbar-right">
        <div className="topbar-timer-group">
          <span className="topbar-timer-label">ELAPSED</span>
          <div className="topbar-timer">
            {elapsed.split(":")[0]}
            <span className={isConnected ? "animate-timer-tick" : ""}>:</span>
            {elapsed.split(":")[1]}
          </div>
        </div>
        <div className="topbar-connection">
          <div
            className={`topbar-connection-dot ${isConnected ? "connected" : ""}`}
          />
          <span className="topbar-connection-text">
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Bottom shimmer line */}
      <div className="topbar-shimmer-track">
        <div
          className={`topbar-shimmer-line ${isConnected ? "animate-shimmer" : ""}`}
        />
      </div>

      <style jsx>{`
        .topbar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--topbar-height);
          padding: 0 var(--space-5);
          background: var(--surface-primary);
          border-bottom: 1px solid var(--border-subtle);
          z-index: 10;
        }

        /* ── Left: Wordmark ── */
        .topbar-left {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
          min-width: 200px;
        }

        .topbar-wordmark {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--signal-vitals);
          letter-spacing: -0.02em;
        }

        .topbar-subtitle {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Center: Patient Badge ── */
        .topbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .patient-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 6px 16px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 100px;
          border-left: 3px solid var(--border-subtle);
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .patient-badge.active {
          border-left-color: var(--signal-vitals);
          background: rgba(0, 212, 170, 0.04);
        }

        .patient-badge.empty {
          border-left-color: transparent;
        }

        .patient-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--signal-vitals);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .patient-badge.active .patient-badge-dot {
          opacity: 1;
          animation: orb-breathe 3s ease-in-out infinite;
        }

        .patient-badge-name {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .patient-badge.empty .patient-badge-name {
          color: var(--text-muted);
          font-weight: 400;
        }

        /* ── Right: Timer + Connection ── */
        .topbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          min-width: 200px;
          justify-content: flex-end;
        }

        .topbar-timer-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }

        .topbar-timer-label {
          font-family: var(--font-data);
          font-size: 0.55rem;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .topbar-timer {
          font-family: var(--font-data);
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .topbar-connection {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .topbar-connection-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-muted);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .topbar-connection-dot.connected {
          background: var(--signal-vitals);
          box-shadow: 0 0 8px var(--signal-vitals-dim);
        }

        .topbar-connection-text {
          font-family: var(--font-data);
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .topbar-connection-dot.connected + .topbar-connection-text {
          color: var(--signal-vitals);
        }

        /* ── Bottom Shimmer ── */
        .topbar-shimmer-track {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          overflow: hidden;
        }

        .topbar-shimmer-line {
          width: 40%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            var(--signal-vitals-dim),
            transparent
          );
          transform: translateX(-100%);
        }
      `}</style>
    </header>
  );
}
