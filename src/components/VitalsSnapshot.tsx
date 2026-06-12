"use client";

import type { Vitals, ESIRecommendation } from "@/lib/types";

interface VitalsSnapshotProps {
  vitals: Vitals | null;
  esi: ESIRecommendation | null;
}

/** Color for ESI level badge */
function esiColor(level: number): string {
  return "var(--text-primary)";
}

/** Color for ESI glow */
function esiGlow(level: number): string {
  return "transparent";
}

/** Determine if a vital value is abnormal */
function vitalStatus(label: string, value: number | string | null): "normal" | "warning" | "critical" {
  if (value === null) return "normal";
  const n = typeof value === "string" ? parseFloat(value) : value;

  switch (label) {
    case "HR":
      if (n > 120 || n < 50) return "critical";
      if (n > 100 || n < 60) return "warning";
      return "normal";
    case "RR":
      if (n > 24 || n < 10) return "critical";
      if (n > 20 || n < 12) return "warning";
      return "normal";
    case "SpO2":
      if (n < 90) return "critical";
      if (n < 95) return "warning";
      return "normal";
    case "GCS":
      if (n < 9) return "critical";
      if (n < 14) return "warning";
      return "normal";
    case "Temp":
      if (n > 103 || n < 95) return "critical";
      if (n > 100.4 || n < 96.8) return "warning";
      return "normal";
    case "BP": {
      // Parse systolic from "180/95"
      const sys = parseInt(String(value).split("/")[0], 10);
      if (sys > 180 || sys < 90) return "critical";
      if (sys > 140 || sys < 100) return "warning";
      return "normal";
    }
    default:
      return "normal";
  }
}

export default function VitalsSnapshot({ vitals, esi }: VitalsSnapshotProps) {
  const vitalEntries: { label: string; value: string; unit?: string }[] = vitals
    ? [
        { label: "HR", value: String(vitals.hr ?? "--"), unit: "bpm" },
        { label: "BP", value: vitals.bp ?? "--", unit: "mmHg" },
        { label: "RR", value: String(vitals.rr ?? "--"), unit: "/min" },
        { label: "SpO2", value: String(vitals.spo2 ?? "--"), unit: "%" },
        { label: "GCS", value: String(vitals.gcs ?? "--"), unit: "/15" },
        { label: "Temp", value: String(vitals.temp ?? "--"), unit: "°F" },
      ]
    : [
        { label: "HR", value: "--" },
        { label: "BP", value: "--" },
        { label: "RR", value: "--" },
        { label: "SpO2", value: "--" },
        { label: "GCS", value: "--" },
        { label: "Temp", value: "--" },
      ];

  return (
    <div className="vs-root">
      {/* ESI Level Hero */}
      <div className="esi-hero">
        <span className="esi-label">ESI LEVEL</span>
        <div
          className={`esi-number ${esi ? "animate-scale-in" : ""}`}
          style={{
            color: esi ? esiColor(esi.level) : "var(--text-muted)",
            textShadow: esi ? `0 0 20px ${esiGlow(esi.level)}` : "none",
          }}
        >
          {esi ? esi.level : "--"}
        </div>
        {esi && (
          <p className="esi-rationale animate-slide-up">
            {esi.rationale}
          </p>
        )}
      </div>

      {/* Vitals Grid */}
      <div className="vs-grid">
        {vitalEntries.map((v, i) => {
          const rawVal = vitals
            ? (vitals as unknown as Record<string, number | string | null>)[v.label.toLowerCase()] ?? null
            : null;
          const status = vitalStatus(v.label, rawVal);
          return (
            <div
              key={v.label}
              className={`vs-cell ${status} ${vitals ? `animate-scale-in stagger-${i + 1}` : ""}`}
            >
              <span className="vs-cell-label">{v.label}</span>
              <span className="vs-cell-value">{v.value}</span>
              {v.unit && vitals && v.value !== "--" && (
                <span className="vs-cell-unit">{v.unit}</span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .vs-root {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          height: 100%;
        }

        /* ── ESI Hero ── */
        .esi-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-2) 0;
        }

        .esi-label {
          font-family: var(--font-data);
          font-size: 0.55rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .esi-number {
          font-family: var(--font-data);
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
          transition: color 0.5s ease;
        }

        .esi-rationale {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.4;
          margin: 0;
          padding: 0 var(--space-2);
          max-width: 100%;
        }

        /* ── Vitals Grid ── */
        .vs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
        }

        .vs-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          padding: var(--space-2) var(--space-1);
          background: var(--surface-elevated);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .vs-cell.warning {
          background: var(--surface-elevated);
          border-color: #000000;
          border-width: 1.5px;
        }

        .vs-cell.critical {
          background: #000000;
          border-color: #000000;
          border-width: 1.5px;
        }

        .vs-cell-label {
          font-family: var(--font-data);
          font-size: 0.55rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: color 0.3s ease;
        }

        .vs-cell.critical .vs-cell-label {
          color: #ffffff;
        }

        .vs-cell-value {
          font-family: var(--font-data);
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
          transition: color 0.3s ease;
        }

        .vs-cell.warning .vs-cell-value {
          color: #000000;
        }

        .vs-cell.critical .vs-cell-value {
          color: #ffffff;
        }

        .vs-cell-unit {
          font-family: var(--font-data);
          font-size: 0.5rem;
          color: var(--text-muted);
          transition: color 0.3s ease;
        }

        .vs-cell.critical .vs-cell-unit {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}
