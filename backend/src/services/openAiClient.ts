import type { LlmClient, LlmSuggestionResult, SuggestionRequest } from '../types.js';

interface OpenAiClientOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

interface OpenAiResponse {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

export class OpenAiClient implements LlmClient {
  constructor(private readonly options: OpenAiClientOptions) {}

  async generateSuggestions(input: SuggestionRequest): Promise<LlmSuggestionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          input: [
            {
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text: [
                    'You create short, warm and natural gift card messages.',
                    'Always answer in Brazilian Portuguese.',
                    'Return valid JSON only in the shape {"suggestions":["...", "...", "..."]}.',
                    'Generate 3 suggestions with 1 or 2 sentences each.',
                    'Avoid cliches, emojis, hashtags, markdown and quotes.',
                  ].join(' '),
                },
              ],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: `Occasion: ${input.occasion}\nRelationship: ${input.relationship}`,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const data = (await response.json()) as OpenAiResponse;
      const text = data.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === 'output_text')
        ?.text;

      if (!text) {
        throw new Error('OpenAI response did not contain output_text');
      }

      const parsed = JSON.parse(text) as { suggestions?: unknown };
      if (!Array.isArray(parsed.suggestions)) {
        throw new Error('OpenAI response JSON does not contain suggestions array');
      }

      const suggestions = parsed.suggestions
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .slice(0, 3);

      if (suggestions.length < 2) {
        throw new Error('OpenAI response did not contain enough suggestions');
      }

      return { suggestions };
    } finally {
      clearTimeout(timeout);
    }
  }
}
