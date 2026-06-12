# Council - AI Consensus Engine

## Overview
Council is a five-model consensus engine that queries GPT-5.5, Claude Fable 5, Gemini 3.5 Flash, Perplexity Sonar Reasoning Pro, and Grok 4.3. It performs cross-critique analysis and returns one synthesized, auditable answer with citations, confidence scoring, and a per-model comparison breakdown.

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon serverless) via Drizzle ORM
- **AI Models**: GPT-5.5 (OpenAI), Claude Fable 5 (Anthropic), Gemini 3.5 Flash (Google), Perplexity Sonar Reasoning Pro, Grok 4.3 (xAI)

### Core Features
1. **Question Input**: Users ask questions through a gradient-focused textarea
2. **Consensus Pipeline**:
   - **Draft Phase**: All 5 models generate structured responses with claims and confidence scores
   - **Cross-Critique Phase**: Each model reviews others' drafts and flags issues
   - **Synthesis Phase**: Supervisor merges drafts, weighs agreement, and creates final answer
   - **Model Comparison Layer**: Per-model breakdown of agreed, unique, and contradicted claims
3. **Results Display**:
   - **Answer Tab**: Final summary, confidence ring visualization, model agreement indicators
   - **Model Breakdown Tab**: Per-model cards with confidence bars and claim diff analysis
   - **Receipts Tab**: Decision log showing what claims were kept/dropped, all citations
   - **Dissent Tab**: Points of disagreement among models
4. **Metadata**: Processing time, query ID, timestamp

## Data Model

### Draft Response
Each AI model returns:
```typescript
{
  agent: "gpt5" | "claude" | "gemini" | "perplexity" | "grok",
  claims: [{ text: string, support: string[] }],
  confidence: number (0-1)
}
```

### Critique
Models review each other:
```typescript
{
  reviewer: AIModel,
  target: AIModel,
  issues: string[]
}
```

### Synthesis (Final Output)
```typescript
{
  summary: string,
  confidence: number (0-1),
  citations: string[],
  decision_log: string[],
  dissent: [{ point: string, who: AIModel[] }],
  modelComparisons: [{
    agent: AIModel,
    summary: string,
    confidence: number,
    uniqueClaims: string[],
    agreedClaims: string[],
    contradictions: string[]
  }]
}
```

## API Endpoints

### POST /api/ask
Request:
```json
{ "question": "string" }
```

Response:
```json
{
  "synthesis": { ... },
  "drafts": [ ... ],
  "critiques": [ ... ],
  "processing_time_ms": number,
  "timestamp": "ISO string",
  "query_id": "uuid"
}
```

## Model Versions (as of June 2026)

| Agent | Model ID | Provider |
|-------|----------|----------|
| gpt5 | `gpt-5.5` | OpenAI |
| claude | `claude-fable-5` (draft), `claude-sonnet-4-6` (critique) | Anthropic |
| gemini | `gemini-3.5-flash` (draft), `gemini-2.5-flash` (critique) | Google |
| perplexity | `sonar-reasoning-pro` | Perplexity |
| grok | `grok-4.3` | xAI |

## Design System

### Colors (Dark Theme)
- **Background**: Deep charcoal (222 15% 8%)
- **Surface**: Elevated panels (222 15% 12%)
- **Primary**: Vibrant blue (220 90% 56%) - consensus/agreement
- **Success/High Confidence**: Emerald (142 71% 45%) - 80%+ confidence
- **Warning/Medium**: Amber (38 92% 50%) - 50-79% confidence
- **Danger/Low**: Red (0 84% 60%) - <50% confidence
- **Dissent**: Purple (280 65% 60%) - disagreement

### Typography
- **Primary Font**: Inter
- **Mono Font**: JetBrains Mono (for citations, code, IDs)

### Components
- **Confidence Ring**: Animated circular progress with color-coded glow
- **Model Avatars**: Geometric icons per provider
- **Loading Sequence**: Sequential AI model activation (5 models) with phase indicators
- **Tabs**: Horizontal navigation with sliding primary border indicator

## Environment Variables
- `OPENAI_API_KEY`: GPT-5.5 access
- `ANTHROPIC_API_KEY`: Claude Fable 5 access
- `GEMINI_API_KEY`: Gemini 3.5 Flash access
- `PERPLEXITY_API_KEY`: Perplexity Sonar access
- `XAI_API_KEY`: Grok 4.3 access
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Express session secret
- `STRIPE_SECRET_KEY`: Stripe payments
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook verification

## Development
```bash
npm run dev   # Starts both frontend and backend
npm run build # Production build
npm run db:push # Sync database schema
```

## File Structure
```
client/src/
  components/
    confidence-ring.tsx    # Animated confidence visualization
    model-avatar.tsx       # AI model icons (gpt5, claude, gemini, perplexity, grok)
    loading-sequence.tsx   # Loading animation (5-model sequence)
  pages/
    home.tsx              # Main question/answer interface with model breakdown tab
server/
  agents/                 # AI model adapters
    claude.ts             # claude-fable-5 / claude-sonnet-4-6
    gemini.ts             # gemini-3.5-flash / gemini-2.5-flash
    gpt5.ts               # gpt-5.5
    perplexity.ts         # sonar-reasoning-pro
    grok.ts               # grok-4.3
  orchestrator.ts         # 3-phase pipeline (draft → critique → synthesis)
  supervisor.ts           # Synthesis + model comparison layer
  routes.ts               # API endpoints
shared/
  schema.ts               # Type definitions, Zod schemas, DB tables
```
