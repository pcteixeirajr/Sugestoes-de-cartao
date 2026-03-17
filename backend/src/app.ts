import cors from '@fastify/cors';
import Fastify from 'fastify';
import { config } from './config.js';
import { GeminiClient } from './services/geminiClient.js';
import { OpenAiClient } from './services/openAiClient.js';
import { MessageSuggestionService } from './services/messageSuggestionService.js';
import type { SuggestionRequest } from './types.js';

function buildPlaygroundHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gift Card Message Suggester</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f1e8;
        --panel: #ffffff;
        --text: #1f2937;
        --muted: #5b6472;
        --primary: #0b6e4f;
        --primary-dark: #145a32;
        --border: #e7dbc5;
        --warning-bg: #fff4dd;
        --warning-border: #f2d7a4;
        --error-bg: #fdecec;
        --error-border: #f0c9c9;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background:
          radial-gradient(circle at top left, rgba(217, 164, 65, 0.18), transparent 28%),
          linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
        color: var(--text);
      }

      .page {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }

      .hero {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: #fff;
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 20px 60px rgba(11, 110, 79, 0.18);
      }

      .hero h1 {
        margin: 0 0 10px;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .hero p {
        margin: 0;
        max-width: 680px;
        line-height: 1.6;
      }

      .panel {
        margin-top: 24px;
        background: var(--panel);
        border: 1px solid rgba(231, 219, 197, 0.8);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 16px 40px rgba(54, 62, 72, 0.08);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 16px;
      }

      .chip {
        border: 1px solid var(--border);
        background: #fbf7ef;
        border-radius: 999px;
        padding: 10px 14px;
        font-size: 0.95rem;
        cursor: pointer;
      }

      label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px 16px;
        font-size: 1rem;
      }

      button {
        margin-top: 20px;
        border: 0;
        border-radius: 14px;
        background: var(--primary);
        color: white;
        font-size: 1rem;
        font-weight: 700;
        padding: 16px 20px;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.7;
        cursor: progress;
      }

      .secondary-button {
        background: #edf5f1;
        color: var(--primary);
        border: 1px solid #cfe1d8;
        margin-top: 0;
      }

      .status,
      .warning,
      .error,
      .result {
        border-radius: 18px;
        padding: 18px;
        margin-top: 16px;
      }

      .status,
      .result {
        background: #eff6f2;
        border: 1px solid #d6e8de;
      }

      .warning {
        background: var(--warning-bg);
        border: 1px solid var(--warning-border);
      }

      .error {
        background: var(--error-bg);
        border: 1px solid var(--error-border);
      }

      ol {
        margin: 12px 0 0;
        padding-left: 20px;
      }

      li + li {
        margin-top: 10px;
      }

      .muted {
        color: var(--muted);
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 16px;
      }

      .meta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 0.95rem;
        margin-bottom: 12px;
      }

      .copy-status {
        font-size: 0.92rem;
        color: var(--muted);
        margin-top: 8px;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <h1>Sugestões de mensagem com IA</h1>
        <p>Playground local para testar o desafio técnico sem depender do Flutter. Preencha a ocasião e a relação, envie para a API e veja a resposta real do backend.</p>
      </section>

      <section class="panel">
        <form id="suggestion-form">
          <div class="grid">
            <div>
              <label for="occasion">Ocasião</label>
              <input id="occasion" name="occasion" value="Aniversario" maxlength="60" required />
            </div>
            <div>
              <label for="relationship">Relação</label>
              <input id="relationship" name="relationship" value="Amiga" maxlength="60" required />
            </div>
          </div>
          <div class="chip-row">
            <button class="chip" type="button" data-occasion="Aniversario" data-relationship="Amiga">Aniversário + Amiga</button>
            <button class="chip" type="button" data-occasion="Casamento" data-relationship="Irmão">Casamento + Irmão</button>
            <button class="chip" type="button" data-occasion="Agradecimento" data-relationship="Colega de trabalho">Agradecimento + Colega</button>
          </div>
          <button id="submit-button" type="submit">Gerar sugestões</button>
        </form>

        <div class="status muted" id="idle-box">
          Fluxo recomendado para começar: <strong>Aniversário + Amiga</strong>.
        </div>

        <div id="feedback"></div>
      </section>
    </main>

    <script>
      const form = document.getElementById('suggestion-form');
      const feedback = document.getElementById('feedback');
      const button = document.getElementById('submit-button');
      const idleBox = document.getElementById('idle-box');
      const occasionInput = document.getElementById('occasion');
      const relationshipInput = document.getElementById('relationship');
      const chips = Array.from(document.querySelectorAll('[data-occasion][data-relationship]'));

      function setFeedback(html) {
        feedback.innerHTML = html;
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

      async function copySuggestions() {
        const items = Array.from(document.querySelectorAll('[data-suggestion-item]'))
          .map((item) => item.textContent.trim())
          .filter(Boolean);

        if (!items.length) {
          return;
        }

        await navigator.clipboard.writeText(items.join('\\n\\n'));
      }

      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          occasionInput.value = chip.dataset.occasion || '';
          relationshipInput.value = chip.dataset.relationship || '';
        });
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        idleBox.style.display = 'none';
        button.disabled = true;
        button.textContent = 'Gerando...';
        setFeedback('<div class="status">Consultando o backend e preparando as sugestões.</div>');

        const formData = new FormData(form);
        const payload = {
          occasion: String(formData.get('occasion') || '').trim(),
          relationship: String(formData.get('relationship') || '').trim(),
        };

        try {
          const response = await fetch('/api/v1/message-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Não foi possível gerar sugestões.');
          }

          const warningHtml = data.warning
            ? '<div class="warning"><strong>Aviso:</strong> ' + escapeHtml(data.warning) + '</div>'
            : '';

          const items = (data.suggestions || [])
            .map((item) => '<li data-suggestion-item>' + escapeHtml(item) + '</li>')
            .join('');

          setFeedback(
            warningHtml +
            '<div class="result">' +
            '<div class="meta">' +
            '<span><strong>Origem:</strong> ' + escapeHtml(data.source) + '</span>' +
            '<span><strong>Request ID:</strong> ' + escapeHtml(data.requestId) + '</span>' +
            '</div>' +
            '<ol>' + items + '</ol>' +
            '<div class="actions">' +
            '<button class="secondary-button" type="button" id="copy-button">Copiar sugestões</button>' +
            '</div>' +
            '<div class="copy-status" id="copy-status"></div>' +
            '</div>'
          );

          const copyButton = document.getElementById('copy-button');
          const copyStatus = document.getElementById('copy-status');
          if (copyButton) {
            copyButton.addEventListener('click', async () => {
              try {
                await copySuggestions();
                copyButton.textContent = 'Copiado';
                if (copyStatus) {
                  copyStatus.textContent = 'Sugestões copiadas para a área de transferência.';
                }
                setTimeout(() => {
                  copyButton.textContent = 'Copiar sugestões';
                  if (copyStatus) {
                    copyStatus.textContent = '';
                  }
                }, 1200);
              } catch {
                copyButton.textContent = 'Não foi possível copiar';
                if (copyStatus) {
                  copyStatus.textContent = 'Não foi possível copiar neste navegador.';
                }
              }
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro inesperado.';
          setFeedback('<div class="error"><strong>Erro:</strong> ' + escapeHtml(message) + '</div>');
        } finally {
          button.disabled = false;
          button.textContent = 'Gerar sugestões';
        }
      });
    </script>
  </body>
</html>`;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function validateBody(body: unknown): SuggestionRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const { occasion, relationship } = body as Record<string, unknown>;
  if (typeof occasion !== 'string' || typeof relationship !== 'string') {
    return null;
  }

  const normalizedOccasion = normalizeText(occasion);
  const normalizedRelationship = normalizeText(relationship);

  if (
    normalizedOccasion.length < 2 ||
    normalizedRelationship.length < 2 ||
    normalizedOccasion.length > 60 ||
    normalizedRelationship.length > 60
  ) {
    return null;
  }

  return {
    occasion: normalizedOccasion,
    relationship: normalizedRelationship,
  };
}

export function buildApp() {
  const llmClient =
    config.llmProvider === 'gemini'
      ? config.geminiApiKey
        ? new GeminiClient({
            apiKey: config.geminiApiKey,
            model: config.geminiModel,
            timeoutMs: config.openAiTimeoutMs,
          })
        : undefined
      : config.openAiApiKey
        ? new OpenAiClient({
            apiKey: config.openAiApiKey,
            model: config.openAiModel,
            timeoutMs: config.openAiTimeoutMs,
          })
        : undefined;

  const service = new MessageSuggestionService(llmClient);
  const app = Fastify({ logger: true });
  void app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = new Set([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5050',
        'http://127.0.0.1:5050',
      ]);

      callback(null, allowedOrigins.has(origin));
    },
  });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.get('/playground', async (_request, reply) => {
    return reply.type('text/html; charset=utf-8').send(buildPlaygroundHtml());
  });

  app.post('/api/v1/message-suggestions', async (request, reply) => {
    const input = validateBody(request.body);
    if (!input) {
      return reply.status(400).send({
        error: 'INVALID_INPUT',
        message:
          'Informe "occasion" e "relationship" com pelo menos 2 caracteres e no máximo 60 caracteres.',
      });
    }

    const result = await service.suggestMessages(input);
    return reply.status(200).send(result);
  });

  return app;
}
