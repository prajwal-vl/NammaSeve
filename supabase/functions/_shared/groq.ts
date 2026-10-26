// Shared Groq Model Dynamic Resolver
// Automatically discovers and selects the best active chat model available on the user's Groq account

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

// Priority order for high-performance civic and JSON chat models on Groq
export const CANDIDATE_GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

function isUsableChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  if (
    lower.includes('guard') ||
    lower.includes('whisper') ||
    lower.includes('embed') ||
    lower.includes('moderation') ||
    lower.includes('safeguard') ||
    lower.includes('vision') ||
    lower.includes('orpheus') ||
    lower.includes('canopylabs') ||
    lower.includes('allam')
  ) {
    return false;
  }
  return true;
}

export interface GroqModelResolution {
  model: string;
  allAvailableChatModels: string[];
}

export async function resolveGroqModel(apiKey: string, preferredModel?: string): Promise<string> {
  const resolution = await resolveGroqModelDetails(apiKey, preferredModel);
  return resolution.model;
}

export async function resolveGroqModelDetails(apiKey: string, preferredModel?: string): Promise<GroqModelResolution> {
  const candidates = [
    preferredModel,
    ...CANDIDATE_GROQ_MODELS,
  ].filter(Boolean) as string[];

  let availableChatModels: string[] = [];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      const allModels = Array.isArray(data.data) ? data.data : [];
      availableChatModels = allModels
        .map((m: any) => String(m.id))
        .filter((id: string) => isUsableChatModel(id));

      const chatSet = new Set(availableChatModels);

      // Check candidates in order of preference
      for (const candidate of candidates) {
        if (chatSet.has(candidate)) {
          console.log(`[resolveGroqModel] Selected candidate model: ${candidate}`);
          return { model: candidate, allAvailableChatModels: availableChatModels };
        }
      }

      // If no candidate directly matched, pick the first usable chat model
      if (availableChatModels.length > 0) {
        const chosen = availableChatModels[0];
        console.log(`[resolveGroqModel] Fallback to available chat model: ${chosen}`);
        return { model: chosen, allAvailableChatModels: availableChatModels };
      }
    }
  } catch (err) {
    console.warn('[resolveGroqModel] Error querying models endpoint:', err);
  }

  const finalFallback = (preferredModel && isUsableChatModel(preferredModel)) ? preferredModel : 'openai/gpt-oss-120b';
  return { model: finalFallback, allAvailableChatModels: availableChatModels };
}
