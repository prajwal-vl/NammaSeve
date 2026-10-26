// Supabase Edge Function: translate-explanation
// Translates scheme explanations or civic guidance between English and Kannada
// Preserves numerical figures, dates, official names, and strict factual bounds.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface TranslateRequestBody {
  text: string;
  target_language: 'en' | 'kn';
  context_type?: 'scheme_summary' | 'eligibility_rule' | 'application_step' | 'general';
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: TranslateRequestBody = await req.json();
    const { text, target_language, context_type = 'general' } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Missing or empty text field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['en', 'kn'].includes(target_language)) {
      return new Response(
        JSON.stringify({ error: 'target_language must be either "en" or "kn"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const groqModel = Deno.env.get('GROQ_MODEL') || DEFAULT_MODEL;

    // Graceful fallback if Groq API key is not configured yet
    if (!groqApiKey || groqApiKey.trim() === '' || groqApiKey === 'your_actual_key') {
      return new Response(
        JSON.stringify({
          translated_text: text, // Return original with notice
          notice: 'Live translation service requires configured Groq API key. Original text returned.',
          target_language,
          is_ai_translated: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional civic translator for NammaSeve (Karnataka & Indian Civic Portal).
Your task is to accurately translate government scheme content into ${target_language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : 'English'}.
RULES:
1. Preserve all official numbers, amounts (e.g. ₹2,000, 200 units, 180 days), dates, and official URLs exactly.
2. Keep official scheme acronyms and names recognizable.
3. Do not add advice or fabricate information not in the original text.
4. Output ONLY the translated text without conversational filler.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!groqResponse.ok) {
      return new Response(
        JSON.stringify({
          translated_text: text,
          notice: 'Translation provider temporarily unavailable. Original text preserved.',
          target_language,
          is_ai_translated: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqResponse.json();
    const translatedText = data.choices?.[0]?.message?.content || text;

    return new Response(
      JSON.stringify({
        translated_text: translatedText,
        target_language,
        is_ai_translated: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Translation error';
    return new Response(
      JSON.stringify({ error: 'Failed to translate', detail: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
