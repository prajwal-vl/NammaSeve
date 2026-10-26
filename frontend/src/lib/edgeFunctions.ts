// Client-side Interface for Supabase Edge Functions Calling Groq AI
import { isSupabaseConfigured } from './supabase';
import { Scheme } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface ExplainResponse {
  explanation: string;
  verified_facts?: {
    name: string;
    department: string;
    official_url: string;
    benefits: string[];
    documents_required: string[];
  };
  sources?: Array<{ publisher: string; source_url: string; verification_status: string }>;
  model?: string;
  is_ai_generated: boolean;
  notice?: string;
}

export async function callExplainScheme(
  schemeId: string,
  question?: string,
  language: 'en' | 'kn' = 'en',
  schemeFallback?: Scheme
): Promise<ExplainResponse> {
  if (!isSupabaseConfigured) {
    // Graceful offline fallback when live Edge Function is not connected yet
    const name = language === 'kn' && schemeFallback?.kannada_name ? schemeFallback.kannada_name : (schemeFallback?.name || 'Selected Scheme');
    const desc = language === 'kn' && schemeFallback?.kannada_description ? schemeFallback.kannada_description : (schemeFallback?.description || 'Government welfare initiative');
    const eligibility = language === 'kn' && schemeFallback?.kannada_eligibility_summary ? schemeFallback.kannada_eligibility_summary : (schemeFallback?.eligibility_summary || 'Refer to official guidelines');

    return {
      explanation: language === 'kn'
        ? `【ಯೋಜನಾ ಸಾರಾಂಶ】 ${name}: ${desc}\n\n【ಅರ್ಹತಾ ಮಾಹಿತಿ】: ${eligibility}\n\n【ಅಧಿಕೃತ ಪೋರ್ಟಲ್】: ${schemeFallback?.official_application_url || 'ಸರ್ಕಾರಿ ಅಧಿಕೃತ ಪೋರ್ಟಲ್'}`
        : `[Scheme Overview] ${name}: ${desc}\n\n[Eligibility Criteria]: ${eligibility}\n\n[Official Portal]: ${schemeFallback?.official_application_url || 'Official government portal'}`,
      verified_facts: schemeFallback ? {
        name: schemeFallback.name,
        department: schemeFallback.department,
        official_url: schemeFallback.official_application_url,
        benefits: schemeFallback.benefits,
        documents_required: schemeFallback.documents_required,
      } : undefined,
      sources: schemeFallback?.sources?.map(s => ({
        publisher: s.publisher,
        source_url: s.source_url,
        verification_status: s.verification_status,
      })) || [],
      model: 'deterministic-verified-facts',
      is_ai_generated: false,
      notice: 'Supabase URL/Key not configured in frontend/.env. Displaying verified local scheme facts.',
    };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/explain-scheme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ scheme_id: schemeId, question, language }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Edge function request failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Edge Function explain-scheme failed, falling back:', msg);
    return {
      explanation: language === 'kn'
        ? 'ಕ್ಷಮಿಸಿ, AI ಸಂಪರ್ಕ ಲಭ್ಯವಿಲ್ಲ. ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಮೂಲಗಳನ್ನು ಕೆಳಗೆ ಪರಿಶೀಲಿಸಿ.'
        : 'AI service temporarily unreachable. Official verified facts and government sources are shown below.',
      is_ai_generated: false,
      notice: `Fallback: ${msg}`,
    };
  }
}

export async function callTranslateExplanation(
  text: string,
  target_language: 'en' | 'kn'
): Promise<{ translated_text: string; is_ai_translated: boolean }> {
  if (!isSupabaseConfigured) {
    return { translated_text: text, is_ai_translated: false };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/translate-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ text, target_language }),
    });

    if (!response.ok) throw new Error('Translation failed');
    return await response.json();
  } catch {
    return { translated_text: text, is_ai_translated: false };
  }
}
