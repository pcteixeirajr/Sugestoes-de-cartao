import { randomUUID } from 'node:crypto';
import { buildFallbackSuggestions } from './fallbackSuggestionService.js';
import type { LlmClient, SuggestionRequest, SuggestionResponse } from '../types.js';

export class MessageSuggestionService {
  constructor(private readonly llmClient?: LlmClient) {}

  async suggestMessages(input: SuggestionRequest): Promise<SuggestionResponse> {
    const requestId = randomUUID();

    if (!this.llmClient) {
      return {
        requestId,
        source: 'fallback',
        suggestions: buildFallbackSuggestions(input),
        warning: 'Serviço de IA indisponível. Exibindo sugestões locais.',
      };
    }

    try {
      const result = await this.llmClient.generateSuggestions(input);

      return {
        requestId,
        source: 'llm',
        suggestions: result.suggestions,
      };
    } catch {
      return {
        requestId,
        source: 'fallback',
        suggestions: buildFallbackSuggestions(input),
        warning: 'Não foi possível gerar novas sugestões com IA neste momento. Exibindo alternativas seguras.',
      };
    }
  }
}
