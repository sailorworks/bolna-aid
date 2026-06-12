/* ─────────────────────────────────────────────
   Bolna-Aid — Shared TypeScript Interfaces
   ───────────────────────────────────────────── */

/** A single turn in the voice conversation */
export interface Turn {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

/** Patient demographics and clinical profile */
export interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F" | "Other";
  allergies: string[];
  medications: string[];
  chiefComplaint: string;
  medicalHistory: string[];
  arrivalTime: Date;
}

/** Vital sign readings */
export interface Vitals {
  hr: number | null;         // Heart rate (bpm)
  bp: string | null;         // Blood pressure (e.g. "180/95")
  rr: number | null;         // Respiratory rate
  spo2: number | null;       // Oxygen saturation (%)
  gcs: number | null;        // Glasgow Coma Scale (3-15)
  temp: number | null;       // Temperature (°F)
}

/** ESI triage level (1-5) with rationale */
export interface ESIRecommendation {
  level: 1 | 2 | 3 | 4 | 5;
  rationale: string;
}

/** A single step in a clinical protocol */
export interface ProtocolStep {
  number: number;
  text: string;
  status: "pending" | "active" | "done";
}

/** A clinical protocol (STEMI, Sepsis, etc.) */
export interface Protocol {
  id: string;
  name: string;
  category: "cardiac" | "sepsis" | "neuro" | "trauma" | "allergy" | "general";
  steps: ProtocolStep[];
}

/** Result of a drug safety check */
export interface DrugCheck {
  drug: string;
  status: "safe" | "alert" | "checking";
  message: string;
  dosage?: string;
  interactions?: string[];
}

/** A timestamped triage event log entry */
export interface LogEntry {
  id: string;
  timestamp: Date;
  text: string;
  category: "vitals" | "medication" | "assessment" | "documentation";
}

/** SBAR-formatted handoff summary */
export interface HandoffSummary {
  recipient: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  generatedAt: Date;
}

/** Voice connection state for the orb */
export type VoiceState = "offline" | "listening" | "speaking";
