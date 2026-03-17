import type { LlmClient, LlmSuggestionResult, SuggestionRequest } from '../types.js';

interface GeminiClientOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export class GeminiClient implements LlmClient {
  constructor(private readonly options: GeminiClientOptions) {}

  async generateSuggestions(input: SuggestionRequest): Promise<LlmSuggestionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.options.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.options.apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: [
                    'Você escreve mensagens curtas, calorosas e naturais para cartões-presente.',
                    'Responda sempre em português do Brasil.',
                    'Retorne apenas JSON válido no formato {"suggestions":["...", "...", "..."]}.',
                    'Gere 3 sugestões com 1 ou 2 frases cada.',
                    'Evite emojis, hashtags, markdown e aspas desnecessárias.',
                  ].join(' '),
                },
              ],
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Occasion: ${input.occasion}\nRelationship: ${input.relationship}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
                required: ['suggestions'],
              },
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini response did not contain text content');
      }

      const parsed = JSON.parse(text) as { suggestions?: unknown };
      if (!Array.isArray(parsed.suggestions)) {
        throw new Error('Gemini response JSON does not contain suggestions array');
      }

      const suggestions = parsed.suggestions
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .slice(0, 3);

      if (suggestions.length < 2) {
        throw new Error('Gemini response did not contain enough suggestions');
      }

      return { suggestions };
    } finally {
      clearTimeout(timeout);
    }
  }
}
