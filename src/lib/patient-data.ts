import type { PatientData, Vitals, ESIRecommendation } from "./types";

/* ─────────────────────────────────────────────
   Synthetic patient records for the hackathon demo.
   Aligned with the Bolna Knowledge Base PDF documents.
   ───────────────────────────────────────────── */

export interface DemoPatient {
  patient: PatientData;
  vitals: Vitals;
  esi: ESIRecommendation;
}

export const DEMO_PATIENTS: Record<string, DemoPatient> = {
  seema: {
    patient: {
      id: "PT-SHARMA-001",
      name: "Seema Sharma",
      age: 45,
      sex: "F",
      allergies: ["Penicillin"],
      medications: [
        "Telmisartan 40 mg once daily",
        "Metformin 500 mg twice daily",
        "Atorvastatin 20 mg once daily"
      ],
      chiefComplaint: "Severe retrosternal chest pain radiating to left arm and jaw, heavy sweating (diaphoresis), mild shortness of breath",
      medicalHistory: [
        "Hypertension (5 yr)",
        "Type 2 Diabetes (8 yr)",
        "Hyperlipidemia",
        "Family history of early CAD"
      ],
      arrivalTime: new Date()
    },
    vitals: {
      hr: 98,
      bp: "148/92",
      rr: 20,
      spo2: 94,
      gcs: 15,
      temp: 98.4
    },
    esi: {
      level: 2,
      rationale: "High-risk chest pain radiating to arm and jaw with associated dyspnea and diaphoresis. Meets ESI-2 criteria: emergent."
    }
  },

  rohan: {
    patient: {
      id: "PT-MEHTA-002",
      name: "Rohan Mehta",
      age: 28,
      sex: "M",
      allergies: ["Dust mites", "pollen"],
      medications: [
        "Salbutamol inhaler 100mcg as needed",
        "Fluticasone nasal spray daily"
      ],
      chiefComplaint: "Sudden onset of severe shortness of breath, audible wheezing, chest tightness, dry cough following dust exposure",
      medicalHistory: [
        "Bronchial Asthma since childhood",
        "Allergic rhinitis"
      ],
      arrivalTime: new Date()
    },
    vitals: {
      hr: 110,
      bp: "122/80",
      rr: 26,
      spo2: 91,
      gcs: 15,
      temp: 98.6
    },
    esi: {
      level: 2,
      rationale: "Acute asthma exacerbation with moderate-to-severe respiratory distress, tachypnea (RR 26), and hypoxemia (SpO2 91%). Meets ESI-2."
    }
  },

  rakesh: {
    patient: {
      id: "PT-PATEL-003",
      name: "Rakesh Patel",
      age: 62,
      sex: "M",
      allergies: ["Sulfa drugs"],
      medications: [
        "Tamsulosin 0.4 mg once daily"
      ],
      chiefComplaint: "High-grade fever with rigors, painful and frequent urination, progressive confusion and lethargy over last 24 hours",
      medicalHistory: [
        "Benign Prostatic Hyperplasia (BPH)",
        "Chronic Kidney Disease (CKD Stage III)"
      ],
      arrivalTime: new Date()
    },
    vitals: {
      hr: 115,
      bp: "94/58",
      rr: 24,
      spo2: 93,
      gcs: 13,
      temp: 103.1
    },
    esi: {
      level: 2,
      rationale: "Meets SIRS/qSOFA criteria for severe sepsis (altered mental status, RR 24, hypotension SBP 94). High risk for septic shock."
    }
  },

  priya: {
    patient: {
      id: "PT-IYER-004",
      name: "Priya Iyer",
      age: 34,
      sex: "F",
      allergies: [],
      medications: [
        "Dicyclomine 10 mg as needed"
      ],
      chiefComplaint: "Severe abdominal pain starting peri-umbilically and shifting to Right Lower Quadrant (RLQ), nausea, anorexia, vomiting",
      medicalHistory: [
        "Mild Irritable Bowel Syndrome (IBS-C)"
      ],
      arrivalTime: new Date()
    },
    vitals: {
      hr: 88,
      bp: "110/72",
      rr: 16,
      spo2: 99,
      gcs: 15,
      temp: 100.2
    },
    esi: {
      level: 3,
      rationale: "Suspected acute appendicitis. Patient is hemodynamically stable but requires multiple resources (labs, IV access, imaging, surgery consult)."
    }
  }
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
