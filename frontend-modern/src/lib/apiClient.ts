import { AskResponse, ClassificationResult, ChatMessage, Jurisdiction, StatutoryCitation } from './types';

// Environment Variable with resilient fallback, HTTPS upgrade, and automatic /api/v1 normalization
export function getApiBase(): string {
  let base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  base = base.trim().replace(/\/+$/, '');

  // Prevent Mixed Content errors on Vercel: upgrade non-localhost http to https in production
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    base.startsWith('http://') &&
    !base.includes('localhost') &&
    !base.includes('127.0.0.1')
  ) {
    base = base.replace('http://', 'https://');
  }

  if (!base.endsWith('/api/v1')) {
    base = `${base}/api/v1`;
  }
  return base;
}

export async function checkBackendHealth(): Promise<{
  ok: boolean;
  status: string;
  database_health?: Record<string, string>;
}> {
  try {
    const base = getApiBase();
    // Render health check is available at both /health and /api/v1/health
    const res = await fetch(`${base}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, status: data.status || 'ok', database_health: data.database_health };
    }
    return { ok: false, status: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, status: err.message || 'offline' };
  }
}

export async function askLegalQuestion(
  query: string, 
  jurisdiction: Jurisdiction, 
  language: string = 'en',
  sessionId?: string,
  context?: Partial<ClassificationResult> | null
): Promise<ChatMessage> {
  const base = getApiBase();
  const jurParam: 'IN' | 'INTL' = jurisdiction === 'INTL' ? 'INTL' : 'IN';
  const effectiveSessionId = sessionId || 'session_' + Math.random().toString(36).substring(7);

  const res = await fetch(`${base}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      jurisdiction: jurParam,
      language,
      session_id: effectiveSessionId,
      context: context ? {
        category: context.category,
        title: context.title,
        statute: context.statute,
        authority: context.authority,
        patentability: context.patentability,
        section_3_risk: context.section_3_risk,
        patent_risk_description: context.patentRiskDescription,
        tkdl_status: context.tkdl_status,
        abs_posture: context.abs_posture,
        clinical_requirements: context.clinical_requirements,
        claims_rule: context.claims_rule,
      } : null,
      session_metadata: context ? {
        triage_completed: true,
        category: context.category,
        section_3_risk: context.section_3_risk,
        statute: context.statute,
        authority: context.authority,
      } : {
        triage_completed: false,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Backend error (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  const rawCitations: any[] = Array.isArray(data.citations) ? data.citations : [];
  
  // Parse dynamic citations strictly without hardcoded fallback URLs
  const parsedCitations: StatutoryCitation[] = rawCitations.map((c, idx) => {
    if (typeof c === 'string') {
      return {
        id: `cit-${idx}`,
        act: c.includes('Patent') ? 'The Patents Act, 1970' : 'Biological Diversity Act, 2023',
        section: c,
        description: `Statutory citation extracted by LangGraph agent: ${c}`,
        snippet: c,
        url: undefined,
        jurisdiction: jurParam,
      };
    }
    return {
      id: c.id || `cit-${idx}`,
      act: c.statute_name || c.act || 'The Patents Act, 1970',
      section: c.section || 'General Provision',
      description: c.snippet || c.description || '',
      snippet: c.snippet || c.description || '',
      url: c.url || c.source_url || undefined,
      jurisdiction: jurParam,
    };
  });

  return {
    id: 'bot_' + Date.now(),
    sender: 'assistant',
    text: data.answer || '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    jurisdiction,
    confidenceScore: data.confidence_score ?? 0.95,
    requiresEscalation: data.requires_escalation ?? false,
    citations: parsedCitations,
    detectedLanguage: data.detected_language === 'hi' ? 'hi' : 'en',
  };
}

export async function translateLegalText(text: string, targetLanguage: 'en' | 'hi'): Promise<string> {
  const base = getApiBase();
  const res = await fetch(`${base}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      target_language: targetLanguage,
    }),
  });

  if (!res.ok) {
    throw new Error(`Translation failed on backend with HTTP ${res.status} (${res.statusText})`);
  }

  const data = await res.json();
  return data.translated_text || text;
}

export async function uploadVoiceRecording(blob: Blob): Promise<string> {
  const base = getApiBase();
  const formData = new FormData();
  formData.append('audio', blob, 'speech.webm');

  const res = await fetch(`${base}/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Voice transcription failed on backend with HTTP ${res.status} (${res.statusText})`);
  }

  const data = await res.json();
  const text = data.translated_english_text || data.transcription || data.text;
  if (!text) {
    throw new Error('Backend returned empty transcription.');
  }
  return text;
}
