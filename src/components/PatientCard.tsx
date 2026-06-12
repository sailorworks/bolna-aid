"use client";

import type { PatientData } from "@/lib/types";

interface PatientCardProps {
  patient: PatientData | null;
}

export default function PatientCard({ patient }: PatientCardProps) {
  if (!patient) {
    return (
      <div className="pc-empty">
        <div className="pc-empty-icon">👤</div>
        <p className="panel-empty-text">
          Say a patient name to load profile
        </p>

        <style jsx>{`
          .pc-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: var(--space-2);
            animation: pulse-border 2s ease-in-out infinite;
            border: 1px dashed var(--border-subtle);
            border-radius: var(--radius-md);
            margin: var(--space-2);
          }
          .pc-empty-icon {
            font-size: 1.8rem;
            opacity: 0.4;
          }
        `}</style>
      </div>
    );
  }

  const rows = [
    { label: "Name", value: patient.name },
    { label: "Age / Sex", value: `${patient.age} / ${patient.sex}` },
    { label: "ID", value: patient.id },
    {
      label: "Allergies",
      value: patient.allergies.length > 0 ? patient.allergies.join(", ") : "NKDA",
      isWarning: patient.allergies.length > 0,
    },
    { label: "Medications", value: patient.medications.join(", ") || "None" },
    { label: "Chief Complaint", value: patient.chiefComplaint, isFullWidth: true },
    {
      label: "History",
      value: patient.medicalHistory.join(" • "),
      isFullWidth: true,
    },
  ];

  return (
    <div className="pc-loaded">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`pc-row animate-slide-left stagger-${i + 1} ${row.isWarning ? "warning" : ""} ${row.isFullWidth ? "full-width" : ""}`}
        >
          <span className="pc-label">{row.label}</span>
          <span className={`pc-value ${row.isWarning ? "text-signal-warning" : ""}`}>
            {row.value}
          </span>
        </div>
      ))}

      <style jsx>{`
        .pc-loaded {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-top: var(--space-1);
        }

        .pc-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-3);
          padding: 6px var(--space-3);
          border-radius: var(--radius-sm);
          transition: background 0.15s ease;
        }

        .pc-row:hover {
          background: var(--surface-hover);
        }

        .pc-row.warning {
          background: var(--signal-warning-dim);
          border-left: 2px solid var(--signal-warning);
          padding-left: calc(var(--space-3) - 2px);
        }

        .pc-row.full-width {
          flex-direction: column;
          gap: 2px;
        }

        .pc-label {
          font-family: var(--font-data);
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
          min-width: 80px;
        }

        .pc-value {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          text-align: right;
          line-height: 1.35;
        }

        .pc-row.full-width .pc-value {
          text-align: left;
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
