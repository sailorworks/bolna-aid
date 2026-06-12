import type { PatientData, Vitals, ESIRecommendation } from "./types";

/* ─────────────────────────────────────────────
   Synthetic patient records for the hackathon demo.
   In production these would come from an EHR integration.
   ───────────────────────────────────────────── */

export interface DemoPatient {
  patient: PatientData;
  vitals: Vitals;
  esi: ESIRecommendation;
}

export const DEMO_PATIENTS: Record<string, DemoPatient> = {
  eleanor: {
    patient: {
      id: "PT-20250612-001",
      name: "Eleanor Vance",
      age: 68,
      sex: "F",
      allergies: ["Penicillin", "Sulfa drugs"],
      medications: ["Metoprolol 50mg BID", "Lisinopril 20mg daily", "Aspirin 81mg daily"],
      chiefComplaint: "Crushing substernal chest pain radiating to left arm × 45 min, diaphoresis, nausea",
      medicalHistory: [
        "Hypertension (12 yr)",
        "Type 2 Diabetes",
        "Hyperlipidemia",
        "Former smoker (quit 2019)",
      ],
      arrivalTime: new Date(),
    },
    vitals: {
      hr: 112,
      bp: "180/95",
      rr: 24,
      spo2: 94,
      gcs: 15,
      temp: 98.6,
    },
    esi: {
      level: 2,
      rationale:
        "High-risk chest pain with ST-segment changes, diaphoresis. Meets ESI-2 criteria: emergent — life/limb/organ threat.",
    },
  },

  marcus: {
    patient: {
      id: "PT-20250612-002",
      name: "Marcus Chen",
      age: 42,
      sex: "M",
      allergies: [],
      medications: [],
      chiefComplaint: "Fever 103.2°F × 2 days, productive cough, confusion, hypotension",
      medicalHistory: [
        "No significant PMH",
        "Social drinker",
        "No prior surgeries",
      ],
      arrivalTime: new Date(),
    },
    vitals: {
      hr: 128,
      bp: "88/52",
      rr: 26,
      spo2: 91,
      gcs: 13,
      temp: 103.2,
    },
    esi: {
      level: 1,
      rationale:
        "qSOFA score 3/3 (altered mentation, RR ≥22, SBP ≤100). Septic shock — requires immediate resuscitation.",
    },
  },

  priya: {
    patient: {
      id: "PT-20250612-003",
      name: "Priya Sharma",
      age: 29,
      sex: "F",
      allergies: ["Ibuprofen"],
      medications: ["Levothyroxine 75mcg daily"],
      chiefComplaint: "Right ankle twisting injury during morning run, swelling, unable to bear weight",
      medicalHistory: [
        "Hypothyroidism",
        "No prior fractures",
        "Recreational runner",
      ],
      arrivalTime: new Date(),
    },
    vitals: {
      hr: 82,
      bp: "118/72",
      rr: 16,
      spo2: 99,
      gcs: 15,
      temp: 98.4,
    },
    esi: {
      level: 4,
      rationale:
        "Isolated extremity injury, stable vitals, no neurovascular compromise. ESI-4: less urgent — one expected resource (X-ray).",
    },
  },
};

/** Look up a patient by first name (case-insensitive) */
export function findPatientByName(name: string): DemoPatient | null {
  const key = name.toLowerCase().trim();
  return DEMO_PATIENTS[key] ?? null;
}

/** Get all patient keys for the demo selector */
export function getPatientKeys(): string[] {
  return Object.keys(DEMO_PATIENTS);
}
