# Desafio Técnico - Sugestões de Mensagem para Gift Card

Este repositório contém a minha solução para o desafio técnico de sugestão de mensagens com apoio de LLM.

A proposta foi dividir a entrega em duas partes:

- `backend/`: API em Node.js + TypeScript
- `flutter_app/`: app em Flutter consumindo a API

Também deixei uma rota web simples no backend para facilitar a avaliação em máquinas que não tenham o Flutter instalado.

## Estrutura

```text
.
├── backend/
└── flutter_app/
```

## Visão geral

O fluxo principal é este:

1. o usuário informa a ocasião e a relação com a pessoa;
2. o app Flutter envia esses dados para a API;
3. o backend chama um modelo de IA;
4. a API devolve 3 sugestões curtas de mensagem;
5. se a LLM falhar, o backend responde com sugestões locais de contingência.

## API

### Endpoint principal

`POST /api/v1/message-suggestions`

### Exemplo de requisição

```json
{
  "occasion": "Aniversário",
  "relationship": "Amiga"
}
```

### Exemplo de resposta com LLM

```json
{
  "requestId": "uuid",
  "source": "llm",
  "suggestions": [
    "Feliz aniversário! Que o seu novo ciclo seja leve, bonito e cheio de conquistas.",
    "Desejo um aniversário muito especial, com carinho, boas surpresas e momentos inesquecíveis.",
    "Que nunca faltem motivos para sorrir hoje e ao longo deste novo ano da sua vida."
  ]
}
```

### Exemplo de resposta com fallback

```json
{
  "requestId": "uuid",
  "source": "fallback",
  "warning": "Não foi possível gerar novas sugestões com IA neste momento. Exibindo alternativas seguras.",
  "suggestions": [
    "Que este Aniversário seja cheio de alegria, carinho e bons momentos...",
    "Desejo que este Aniversário traga motivos sinceros para sorrir e celebrar...",
    "Espero que esta lembrança deixe o seu Aniversário ainda mais bonito..."
  ]
}
```

## Como rodar o backend

### Pré-requisitos

- Node.js 20+
- uma chave de API da OpenAI ou do Gemini

### Passos

1. Entre na pasta:

```powershell
cd backend
```

2. Instale as dependências:

```powershell
cmd /c npm.cmd install
```

3. Crie um arquivo `.env` local a partir do `.env.example`

Exemplo com OpenAI:

```env
PORT=3000
LLM_PROVIDER=openai
OPENAI_API_KEY=sua_chave_openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=8000
```

Exemplo com Gemini:

```env
PORT=3000
LLM_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-2.5-flash
OPENAI_TIMEOUT_MS=8000
```

4. Suba a API:

```powershell
cmd /c npm.cmd run dev
```

5. Verifique:

```text
http://localhost:3000/health
```

## Como rodar o app Flutter

### Pré-requisitos

- Flutter 3.38+
- Dart 3.x

### Passos

1. Entre na pasta:

```powershell
cd flutter_app
```

2. Instale as dependências:

```powershell
flutter pub get
```

3. Rode o app apontando para o backend local

Android Emulator:

```powershell
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

Flutter Web ou desktop local:

```powershell
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

## Como testar sem Flutter

Basta subir o backend e abrir:

```text
http://localhost:3000/playground
```

Essa tela permite:

- preencher ocasião e relação;
- enviar requisições reais para a API;
- visualizar retorno com LLM ou fallback;
- copiar as mensagens geradas.

## Observação sobre credenciais

O arquivo `.env` é apenas local e não deve ser versionado.

Por segurança, a configuração do projeto fica somente no `.env.example`, e cada pessoa que for executar a aplicação precisa informar a própria chave.

## Organização do código

### Backend

- `src/app.ts`: inicialização da API e rotas
- `src/services/messageSuggestionService.ts`: fluxo principal da geração
- `src/services/openAiClient.ts`: integração com OpenAI
- `src/services/geminiClient.ts`: integração com Gemini
- `src/services/fallbackSuggestionService.ts`: fallback local

### Flutter

- `lib/src/data`: cliente HTTP
- `lib/src/domain`: modelos
- `lib/src/presentation/controllers`: estado da tela
- `lib/src/presentation/pages`: interface principal

## Tratamento de falhas

Considerei como falha da LLM:

- timeout;
- `429`;
- `5xx`;
- resposta inválida;
- problema de rede;
- retorno fora do formato esperado.

Nesses casos, a API não expõe erro bruto do provedor. Em vez disso, devolve:

- `source: "fallback"`
- `warning` amigável
- 3 sugestões locais seguras

Preferi esse caminho porque ele mantém a experiência estável e evita vazar detalhes desnecessários da integração.

## Rate limiting

Não implementei rate limiting nesta versão para manter o foco no fluxo principal e no fallback.

Se eu fosse evoluir esse projeto, colocaria limite por IP ou por usuário autenticado, com retorno `429` bem definido.

## Custo e cache

Nesta entrega eu não implementei cache.

Em produção, eu faria pelo menos:

- cache por combinação normalizada de `occasion + relationship`;
- TTL curto;
- monitoramento de latência e falhas;
- controle de tamanho de entrada;
- uso de modelo mais econômico para esse caso.

## Testes e validação

Backend:

```powershell
cd backend
cmd /c npm.cmd test
```

Flutter:

```powershell
cd flutter_app
flutter test
flutter analyze
```

Durante o desenvolvimento, validei:

- build do backend;
- teste de fallback no backend;
- análise estática do Flutter;
- teste de widget do Flutter;
- build web do Flutter;
- fluxo ponta a ponta com backend e frontend.

## Decisões principais

- usei Fastify por ser simples, rápido e direto para esse tipo de API;
- deixei os clients de OpenAI e Gemini separados para facilitar troca de provedor;
- mantive a validação de entrada próxima da rota para não exagerar na abstração;
- usei `ChangeNotifier` no Flutter porque uma tela única não pedia uma solução mais pesada;

## Se eu tivesse mais tempo

- adicionaria testes de rota com `app.inject`;
- ampliaria os testes de widget;
- colocaria rate limiting;
- adicionaria cache;
- incluiria métricas e logs mais completos.
# Sugestoes-de-cartao
