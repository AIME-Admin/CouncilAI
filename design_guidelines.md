# Council Consensus Engine - Design Guidelines

## Design Approach
**Hybrid Approach**: Drawing inspiration from modern AI interfaces (Perplexity, ChatGPT) and productivity tools (Linear, Notion) to create a technical yet visually compelling experience that emphasizes trust, transparency, and data clarity.

**Core Principle**: Visualize AI consensus as a transparent, auditable process where complexity is revealed progressively through clear information hierarchy.

---

## Color Palette

### Dark Mode (Primary)
- **Background**: 222 15% 8% (deep charcoal)
- **Surface**: 222 15% 12% (elevated panels)
- **Surface Elevated**: 222 15% 16% (cards, modals)
- **Border**: 222 10% 25% (subtle divisions)

### Accent Colors
- **Primary (Consensus)**: 220 90% 56% (vibrant blue - represents agreement)
- **Success (High Confidence)**: 142 71% 45% (emerald - for 80%+ confidence)
- **Warning (Medium Confidence)**: 38 92% 50% (amber - for 50-79% confidence)
- **Danger (Low Confidence)**: 0 84% 60% (red - for <50% confidence)
- **Dissent**: 280 65% 60% (purple - highlights disagreement)

### Text
- **Primary**: 0 0% 98% (near white)
- **Secondary**: 0 0% 72% (muted)
- **Tertiary**: 0 0% 52% (de-emphasized)

---

## Typography

### Font Families
- **Primary**: Inter (via Google Fonts) - clean, readable for data
- **Mono**: JetBrains Mono (for code, logs, citations)

### Scale
- **Hero/Question Input**: text-2xl md:text-3xl font-semibold
- **Section Headers**: text-xl font-semibold
- **Body Text**: text-base leading-relaxed
- **Confidence Scores**: text-4xl font-bold tabular-nums
- **Labels/Meta**: text-sm text-secondary

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: space-y-8 to space-y-12
- Grid gaps: gap-4 to gap-6

### Container Strategy
- **Max Width**: max-w-5xl mx-auto (optimal for reading consensus data)
- **Padding**: px-6 md:px-8
- **Query Input**: max-w-3xl (centered, focused)

---

## Component Library

### A. Question Input Section
- Large centered textarea with gradient border on focus
- "Ask Council" button with gradient background (primary blue to lighter shade)
- Placeholder: "Ask a question to get consensus from 4 leading AI models..."
- Real-time character count and estimated processing time

### B. Loading State
- Animated sequence showing 4 AI avatars/icons pulsing in sequence
- Progress text: "Querying GPT-5... Claude... Gemini... Perplexity..."
- Visual timeline showing: Draft → Critique → Synthesis phases

### C. Results Tabbed Interface
**Tab Navigation** (horizontal, sticky on scroll):
- Three tabs: "Answer" | "Receipts" | "Dissent"
- Active tab: border-b-2 with primary blue, bold text
- Inactive: text-secondary, hover transitions

**Answer Tab**:
- Confidence score displayed as large circular progress indicator (0-100%)
  - Color-coded by range (green 80%+, amber 50-79%, red <50%)
- Final synthesis in card with generous padding
- AI model agreement visualization: 4 colored dots showing alignment
- Expandable "How we reached consensus" section

**Receipts Tab** (Decision Log):
- Timeline-style layout showing decision process
- Each entry: icon (✓ kept, ✗ dropped) + claim text + reasoning
- Citations as clickable chips with external link icons
- "Reviewed by" badges showing which AI models validated each claim

**Dissent Tab**:
- Warning banner if significant disagreement exists
- Cards for each dissent point with purple accent border
- Show which models disagreed (avatar icons)
- Expandable details for full context

### D. Model Response Cards (Optional Deep Dive)
- Collapsible section showing individual AI responses
- Each model gets branded card (subtle color coding):
  - GPT-5: teal accent
  - Claude: orange accent
  - Gemini: blue accent
  - Perplexity: purple accent
- Display: original claims, confidence, supporting citations

### E. Metadata Footer
- Query stats: Processing time, total tokens, cost estimate (if shown)
- Timestamp and query ID for auditability
- "Share Results" and "New Query" actions

---

## Visual Elements

### Icons
- **Library**: Heroicons (via CDN)
- **Usage**: 
  - AI model avatars (sparkle, cpu, brain icons)
  - Check/cross for decision log
  - External link for citations
  - Alert triangle for dissent
  - Info circle for confidence tooltips

### Confidence Visualization
- Circular progress ring (100px diameter)
- Percentage in center (large, bold, color-coded)
- Subtle glow effect matching confidence color
- Micro-animation on reveal

### Agreement Indicators
- Four dots representing each AI model
- Connected by lines when in agreement
- Pulsing effect for complete consensus
- Grayscale + reduced opacity for dissenting models

---

## Interaction Patterns

### Input Focus
- Gradient border animation (blue to cyan)
- Subtle lift shadow
- Expand textarea height smoothly

### Tab Transitions
- Fade content in/out (100ms)
- Slide indicator bar (200ms ease-out)
- Maintain scroll position

### Collapsible Sections
- Smooth height transitions
- Rotate chevron icon 180deg
- Reveal with subtle fade-in

### Loading States
- Skeleton screens for result cards
- Pulsing animation for AI model indicators
- No jarring content shifts

---

## Animations

**Sparingly Used**:
- Confidence ring fill animation (once, on reveal) - 800ms ease-out
- Tab indicator slide - 200ms
- Model agreement line connections - sequential 400ms
- All other transitions: simple fades and height changes

---

## Images

**Hero Section**: 
No traditional hero image. Instead, the question input IS the hero - large, centered, with subtle animated gradient background pattern (geometric shapes representing AI consensus).

**Model Avatars**:
Use simple geometric icon representations:
- GPT-5: Concentric circles
- Claude: Triangle with dot
- Gemini: Diamond shape
- Perplexity: Hexagon

Place avatars in the loading sequence and result headers.

---

## Accessibility

- High contrast ratios (4.5:1 minimum)
- Keyboard navigation for all tabs
- ARIA labels for confidence scores
- Screen reader announcements for state changes
- Focus visible indicators (2px blue ring)

---

## Responsive Behavior

**Mobile** (< 768px):
- Stack tabs vertically if needed
- Reduce confidence ring to 80px
- Single column for all content
- Sticky query input at top

**Desktop** (≥ 768px):
- Horizontal tabs
- Two-column layout for Receipts (timeline + details)
- Larger confidence visualization
- Side-by-side model cards