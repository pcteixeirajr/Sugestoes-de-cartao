export interface AppConfig {
  port: number;
  llmProvider: 'openai' | 'gemini';
  openAiApiKey?: string;
  openAiModel: string;
  openAiTimeoutMs: number;
  geminiApiKey?: string;
  geminiModel: string;
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config: AppConfig = {
  port: readNumber(process.env.PORT, 3000),
  llmProvider: process.env.LLM_PROVIDER === 'gemini' ? 'gemini' : 'openai',
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  openAiTimeoutMs: readNumber(process.env.OPENAI_TIMEOUT_MS, 8000),
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
};
