export type SuggestionSource = 'llm' | 'fallback';

export interface SuggestionRequest {
  occasion: string;
  relationship: string;
}

export interface SuggestionResponse {
  suggestions: string[];
  source: SuggestionSource;
  requestId: string;
  warning?: string;
}

export interface LlmSuggestionResult {
  suggestions: string[];
}

export interface LlmClient {
  generateSuggestions(input: SuggestionRequest): Promise<LlmSuggestionResult>;
}
