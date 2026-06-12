"use client";

import type { PatientData, Vitals, ESIRecommendation } from "@/lib/types";

interface HandoffSummaryProps {
  patient: PatientData | null;
  vitals: Vitals | null;
  esi: ESIRecommendation | null;
  isGenerated: boolean;
}

/** Generate SBAR sections from patient data */
function buildSBAR(
  patient: PatientData,
  vitals: Vitals | null,
  esi: ESIRecommendation | null
) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    situation: `${patient.name}, ${patient.age}${patient.sex}, presenting with ${patient.chiefComplaint}. Arrived at ${patient.arrivalTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}.`,

    background: [
      patient.allergies.length > 0
        ? `Allergies: ${patient.allergies.join(", ")}`
        : "NKDA",
      patient.medications.length > 0
        ? `Current meds: ${patient.medications.join(", ")}`
        : "No current medications",
      patient.medicalHistory.length > 0
        ? `PMH: ${patient.medicalHistory.join(", ")}`
        : "No significant PMH",
    ].join(". "),

    assessment: [
      esi ? `ESI Level ${esi.level} — ${esi.rationale}` : "ESI not yet determined",
      vitals
        ? `Vitals: HR ${vitals.hr ?? "--"}, BP ${vitals.bp ?? "--"}, RR ${vitals.rr ?? "--"}, SpO2 ${vitals.spo2 ?? "--"}%, GCS ${vitals.gcs ?? "--"}, Temp ${vitals.temp ?? "--"}°F`
        : "Vitals pending",
    ].join(". "),

    recommendation: `Continue monitoring per protocol. Re-assess in 15 minutes. Handoff generated at ${timeStr}.`,
  };
}

export default function HandoffSummary({
  patient,
  vitals,
  esi,
  isGenerated,
}: HandoffSummaryProps) {
  if (!isGenerated || !patient) {
    return (
      <div className="hs-empty">
        <div className="hs-empty-icon">📄</div>
        <p className="panel-empty-text">
          Click &quot;Generate Handoff&quot; to create SBAR summary
        </p>

        <style jsx>{`
          .hs-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: var(--space-2);
            border: 1px dashed var(--border-subtle);
            border-radius: var(--radius-md);
            margin: var(--space-2);
            animation: pulse-border 2s ease-in-out infinite;
          }
          .hs-empty-icon {
            font-size: 1.8rem;
            opacity: 0.4;
          }
        `}</style>
      </div>
    );
  }

  const sbar = buildSBAR(patient, vitals, esi);

  const sections = [
    { key: "S", title: "Situation", content: sbar.situation },
    { key: "B", title: "Background", content: sbar.background },
    { key: "A", title: "Assessment", content: sbar.assessment },
    { key: "R", title: "Recommendation", content: sbar.recommendation },
  ];

  return (
    <div className="hs-generated">
      {sections.map((s, i) => (
        <div
          key={s.key}
          className={`hs-section animate-cascade stagger-${(i + 1) * 2}`}
        >
          <div className="hs-section-header">
            <span className="hs-section-key">{s.key}</span>
            <span className="hs-section-title">{s.title}</span>
          </div>
          <p className="hs-section-content">{s.content}</p>
        </div>
      ))}

      <style jsx>{`
        .hs-generated {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          overflow-y: auto;
          padding-right: var(--space-1);
        }

        .hs-section {
          border-left: 3px solid var(--signal-info);
          padding: var(--space-2) var(--space-3);
          background: var(--surface-elevated);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          transition: background 0.15s ease;
        }

        .hs-section:hover {
          background: var(--surface-hover);
        }

        .hs-section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: 4px;
        }

        .hs-section-key {
          font-family: var(--font-data);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--signal-info);
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--signal-info-dim);
          border-radius: 3px;
          flex-shrink: 0;
        }

        .hs-section-title {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hs-section-content {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
