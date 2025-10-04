# Council - AI Consensus Engine

## Overview
Council is a four-LLM consensus engine that queries GPT-5, Claude, Gemini, and Perplexity, performs cross-critique analysis, and returns one synthesized, auditable answer with citations and confidence scoring.

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **AI Models**: GPT-5 (OpenAI), Claude (Anthropic), Gemini (Google), Perplexity

### Core Features
1. **Question Input**: Users ask questions through a gradient-focused textarea
2. **Consensus Pipeline**:
   - **Draft Phase**: All 4 models generate structured responses with claims and confidence scores
   - **Cross-Critique Phase**: Each model reviews others' drafts and flags issues
   - **Synthesis Phase**: Supervisor merges drafts, weighs agreement, and creates final answer
3. **Results Display**:
   - **Answer Tab**: Final summary, confidence ring visualization, model agreement indicators
   - **Receipts Tab**: Decision log showing what claims were kept/dropped, all citations
   - **Dissent Tab**: Points of disagreement among models
4. **Metadata**: Processing time, query ID, timestamp

## Data Model

### Draft Response
Each AI model returns:
```typescript
{
  agent: "gpt5" | "claude" | "gemini" | "perplexity",
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
  dissent: [{ point: string, who: AIModel[] }]
}
```

## API Endpoints

### POST /api/ask
Request:
```json
{
  "question": "string"
}
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
- **Model Avatars**: Geometric icons (circles for GPT-5, triangle for Claude, diamond for Gemini, hexagon for Perplexity)
- **Loading Sequence**: Sequential AI model activation with phase indicators
- **Tabs**: Horizontal navigation with sliding primary border indicator

## Recent Changes
- **2025-01-04**: Initial project setup with all frontend components and data schemas

## Environment Variables
- `OPENAI_API_KEY`: GPT-5 access
- `ANTHROPIC_API_KEY`: Claude access
- `GEMINI_API_KEY`: Gemini access
- `PERPLEXITY_API_KEY`: Perplexity access
- `SESSION_SECRET`: Express session secret

## Development
```bash
npm run dev  # Starts both frontend and backend
```

## File Structure
```
client/src/
  components/
    confidence-ring.tsx    # Animated confidence visualization
    model-avatar.tsx       # AI model icons
    loading-sequence.tsx   # Loading animation
  pages/
    home.tsx              # Main question/answer interface
server/
  agents/                 # AI model adapters (to be implemented)
  routes.ts              # API endpoints
shared/
  schema.ts              # Type definitions and validation
```
