# 🚀 IP-SAKTI Sahayak: Front-End Collaborator Onboarding & UI/UX Master Specification

**Welcome to IP-SAKTI Sahayak (SIH 045).** 
You have been brought on to lead the **Frontend Engineering & Client Architecture**. Your partner, Soumadipta, is handling the Backend AI Orchestration (FastAPI, LangGraph, Qdrant, Neo4j). 

This massive document contains absolutely everything you need to understand the product, your specific responsibilities, the API contracts, and the exact React/Next.js code components you need to build. 

---

## 📑 TABLE OF CONTENTS
1. [The Grand Vision & Your Role](#1-the-grand-vision--your-role)
2. [Division of Labor](#2-division-of-labor)
3. [The Technology Stack (Frontend)](#3-the-technology-stack-frontend)
4. [Project Setup Instructions](#4-project-setup-instructions)
5. [API Contracts & Data Models](#5-api-contracts--data-models)
6. [Component 1: The Bhashini Voice Interface](#6-component-1-the-bhashini-voice-interface)
7. [Component 2: The Formulation Classification Wizard](#7-component-2-the-formulation-classification-wizard)
8. [Component 3: The Graph-RAG Citation Viewer](#8-component-3-the-graph-rag-citation-viewer)
9. [UI/UX & Accessibility Guidelines (GIGW)](#9-uiux--accessibility-guidelines)
10. [State Management & Data Fetching](#10-state-management--data-fetching)

---

## 1. The Grand Vision & Your Role

Ayurvedic startups routinely fail because they don't understand IP law. If they mix ginger and honey (a classical recipe) and try to patent it, they get rejected under **Section 3(p) of the Patents Act**. If they try to export it, they get sued for Biopiracy under the **Biological Diversity Act**.

Our backend uses an advanced "Multi-Agent Graph-RAG" to read these laws and provide exact answers. 
**YOUR JOB** is to make this complex legal AI accessible to a 50-year-old traditional healer in rural India. You will build a beautiful, Government-compliant (GIGW), accessible UI with real-time **Voice Input in Hindi/Malayalam** (using Bhashini).

---

## 2. Division of Labor

### 👨‍💻 Your Responsibilities (Frontend Lead):
1. **Next.js 14 App Router Setup:** Initialize the frontend architecture.
2. **Shadcn UI & Tailwind CSS:** Build a glassmorphic, highly responsive design system.
3. **The Formulation Wizard:** Build the interactive step-by-step diagnostic tool (code provided below).
4. **Bhashini Integration:** Implement the Web Audio API to capture microphone input, stream it to our backend, and play back the translated audio.
5. **Citation Interactive UI:** When the backend returns a legal citation (e.g., `[Patents Act, Sec 3(p)]`), render it as a hoverable badge that expands to show the raw legal text.

### 👨‍💻 Soumadipta's Responsibilities (Backend Lead):
1. **FastAPI Gateway:** Exposing the REST endpoints you will consume.
2. **LangGraph AI Agents:** Managing the LLM logic, guardrails, and query decomposition.
3. **Database Architecture:** Qdrant (Vectors) and Neo4j (Graph) deployment via Docker.
4. **Data Ingestion:** Parsing the government PDFs via PyMuPDF.

---

## 3. The Technology Stack (Frontend)

You MUST strictly adhere to this stack to ensure low latency and high maintainability:
- **Core Framework:** Next.js 14 (App Router, Server Components where possible)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS (Utility-first) + Shadcn UI (Headless accessible components)
- **Animation:** Framer Motion (Micro-interactions for the Voice Assistant UI)
- **State Management:** Zustand (for global wizard state) + React Query (for API caching)
- **Voice API:** Browser native Web Audio API (MediaRecorder) sending blobs to backend.

---

## 4. Project Setup Instructions

Run these exact commands to scaffold your side of the project. Make sure you are in the root `ip-sakti-sahayak` folder when you start.

```bash
# 1. Scaffold Next.js
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Enter the directory
cd frontend

# 3. Initialize Shadcn UI
npx shadcn-ui@latest init
# Choose: Default style, Slate color, CSS variables: yes

# 4. Install required Shadcn components
npx shadcn-ui@latest add button card dialog badge scroll-area tooltip

# 5. Install Animation & State Libs
npm install framer-motion zustand @tanstack/react-query lucide-react

# 6. Run the Dev Server
npm run dev
```

---

## 5. API Contracts & Data Models

Soumadipta will expose the following endpoints from the FastAPI backend. You need to write TypeScript interfaces for these.

### A. The Core Query Endpoint (Graph-RAG)
**Endpoint:** `POST /api/v1/ask`
**Purpose:** Sends the user's text or voice transcription to the AI.

**Request (JSON):**
```typescript
interface AskRequest {
  query: string;
  jurisdiction: "INDIA" | "INTERNATIONAL";
  session_id: string; // Used for chat history
}
```

**Response (JSON):**
```typescript
interface AskResponse {
  answer: string; // The markdown formatted answer
  confidence_score: number; // 0.0 to 1.0
  requires_escalation: boolean; // If true, show the "Talk to Human" button
  citations: Array<{
    id: string;
    statute_name: string;
    section: string;
    snippet: string;
    url: string;
  }>;
}
```

---

## 6. Component 1: The Bhashini Voice Interface

This is the most critical feature for accessibility. The user clicks a microphone, speaks in Hindi, and the app records the blob. 
*Note: We will send the raw Audio Blob to FastAPI, which will handle the Bhashini API translation.*

**File:** `frontend/src/components/AudioRecorder.tsx`

```tsx
'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioRecorder({ onTranscription }: { onTranscription: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        
        // Upload to Backend (Soumadipta's FastAPI route)
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        try {
          const res = await fetch('http://localhost:8000/api/v1/transcribe', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          onTranscription(data.translated_english_text);
        } catch (err) {
          console.error("Voice processing failed", err);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      {isProcessing ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader2 className="w-8 h-8 text-emerald-500" />
        </motion.div>
      ) : isRecording ? (
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={stopRecording}
          className="p-4 bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/50"
        >
          <Square className="w-6 h-6 text-white" />
        </motion.button>
      ) : (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
        >
          <Mic className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </div>
  );
}
```

---

## 7. Component 2: The Formulation Classification Wizard

Before users ask free-form questions, they must go through the "Formulation Triage". This classifies their Ayurvedic product into 1 of 6 legal buckets (e.g., Phytopharmaceutical, Ayurveda-Aahar, Classical).

**File:** `frontend/src/components/FormulationWizard.tsx`

*I have already written the complete logic matrix for this in the PRD, but here is the exact UI component implementation you must use.*

```tsx
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, BookOpen, Leaf, Stethoscope, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormulationWizard() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const recordAnswer = (key: string, value: any, nextStep: number) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setStep(nextStep);
  };

  const ResultCard = () => {
    // Deterministic Classification Engine based on PRD Rule Matrix
    const isClassical = answers.isFirstSchedule === true;
    const isModified = answers.isModified === true;
    const isFood = answers.intendedUse === 'food';
    const isPurified = answers.isPurified === true;

    let title, patentRisk, absStatus;

    if (isClassical && !isModified) {
        title = "Generic Classical Medicine";
        patentRisk = "BARRED (Section 3p). Protected by TKDL.";
        absStatus = "Exempt from prior SBB intimation.";
    } else if (isPurified) {
        title = "Phytopharmaceutical Drug (Rule 122-E)";
        patentRisk = "HIGHLY PATENTABLE. Complies with Sec 3(d).";
        absStatus = "Mandatory NBA Approval required.";
    } else if (isFood) {
        title = "Ayurveda-Aahar (Nutraceutical)";
        patentRisk = "Recipe Not Patentable. Use Trademarks.";
        absStatus = "Standard SBB reporting.";
    } else {
        title = "Patent-or-Proprietary (P&P) Medicine";
        patentRisk = "High Sec 3(e) risk unless clinical synergy proven.";
        absStatus = "SBB Intimation Mandatory.";
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-2xl font-bold text-emerald-400">Diagnostic Result</h2>
        <Card className="p-6 bg-slate-900 border-emerald-500/30">
          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Patentability</p>
              <p className="text-xs text-slate-400 mt-1">{patentRisk}</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Biodiversity (ABS)</p>
              <p className="text-xs text-slate-400 mt-1">{absStatus}</p>
            </div>
          </div>
          
          <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500" onClick={() => setStep(1)}>
            Start New Triage
          </Button>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-xl font-bold text-white mb-4">Q1: Textual Origin</h2>
            <p className="text-slate-400 mb-6">Is the recipe drawn directly from an authoritative 1st Schedule classical text (e.g., Charaka Samhita)?</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isFirstSchedule', true, 2)}>
                <BookOpen className="mr-3 text-emerald-500" /> YES - Exact Classical Recipe
              </Button>
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isFirstSchedule', false, 3)}>
                <ArrowRight className="mr-3 text-amber-500" /> NO - Derived or Novel Formulation
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-xl font-bold text-white mb-4">Q2: Modifications</h2>
            <p className="text-slate-400 mb-6">Has any ingredient ratio or delivery method (e.g., made into capsules) been modified from the original text?</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isModified', false, 100)}>
                NO - Pure Classical
              </Button>
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isModified', true, 100)}>
                YES - Modified Delivery/Ratio
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-xl font-bold text-white mb-4">Q2: Intended Use</h2>
            <p className="text-slate-400 mb-6">What is the primary target for this formulation?</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('intendedUse', 'medicinal', 4)}>
                <Stethoscope className="mr-3 text-blue-500" /> Therapeutic / Medicinal Treatment
              </Button>
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('intendedUse', 'food', 100)}>
                Dietary Supplement (Ayurveda-Aahar)
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-xl font-bold text-white mb-4">Q3: Scientific Nature</h2>
            <p className="text-slate-400 mb-6">Is this a highly purified, fractionated botanical extract containing ≥4 bioactive markers?</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isPurified', true, 100)}>
                YES - Standardized Purified Fraction
              </Button>
              <Button variant="outline" className="w-full justify-start h-16 bg-slate-900" onClick={() => recordAnswer('isPurified', false, 100)}>
                NO - Multi-Herb Blend
              </Button>
            </div>
          </motion.div>
        )}

        {step === 100 && <ResultCard key="result" />}
      </AnimatePresence>
    </div>
  );
}
```

---

## 8. Component 3: The Graph-RAG Citation Viewer

When Soumadipta's LangGraph agent streams back a text answer, it will contain citation markers like `[1]` or `[Patents Act, Sec 3]`. You must intercept these markers using a custom Markdown parser (e.g., `react-markdown` with a custom component) and wrap them in a Shadcn `Tooltip` or `HoverCard`.

**Hover Card Content Schema:**
- **Title:** `Patents Act, 1970`
- **Section:** `Section 3(p)`
- **Snippet:** `"an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components."`
- **Link:** Official India Code URL.

This ensures the app fulfills our strict "Zero Hallucination, 100% Provenance" guarantee.

---

## 9. UI/UX & Accessibility Guidelines (GIGW)

Because this tool targets government regulators and rural MSMEs, it MUST comply with GIGW (Guidelines for Indian Government Websites):
1. **Contrast Ratios:** Use Tailwind's `text-slate-100` on `bg-slate-950`. Ensure all buttons have WCAG AAA contrast.
2. **Typography:** Use an Indic-friendly font (e.g., `Inter` or `Noto Sans`).
3. **Screen Readers:** Every interactive element MUST have an `aria-label`. The Bhashini voice button must have `aria-label="Start Voice Recording"`.
4. **Jurisdiction Themeing:**
   - When the user toggles "India 🇮🇳", use Emerald/Saffron accent colors.
   - When the user toggles "International 🌐", use Blue/Indigo accent colors.

---

## 10. State Management & Next Steps

1. Clone the repository Soumadipta will provide you.
2. Follow the setup commands in **Section 4**.
3. Create the `frontend/` directory structure exactly as shown.
4. Hook up the `Zustand` store to save the user's `Jurisdiction` preference globally so it persists across page navigations.
5. Message Soumadipta when you have the Voice Recorder UI successfully console-logging a `.webm` audio blob!

**Godspeed, Frontend Lead. Let's build the future of Ayurvedic IP Protection!**
