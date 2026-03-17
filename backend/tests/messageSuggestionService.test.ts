import assert from 'node:assert/strict';
import { MessageSuggestionService } from '../src/services/messageSuggestionService.js';
import type { LlmClient } from '../src/types.js';

async function run() {
  const failingClient: LlmClient = {
    async generateSuggestions() {
      throw new Error('timeout');
    },
  };

  const service = new MessageSuggestionService(failingClient);

  const result = await service.suggestMessages({
    occasion: 'aniversário',
    relationship: 'amiga',
  });

  assert.equal(result.source, 'fallback');
  assert.equal(result.suggestions.length, 3);
  assert.match(result.warning ?? '', /Não foi possível/);
  console.log('messageSuggestionService.test.ts: ok');
}

run().catch((error) => {
  console.error('messageSuggestionService.test.ts: failed');
  console.error(error);
  process.exit(1);
});
