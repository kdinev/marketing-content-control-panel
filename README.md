# Marketing Content Control Panel

An AI-powered marketing content management application built with Angular 21 and [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). It combines a RAG (Retrieval-Augmented Generation) knowledge base with real LLM APIs to help marketing teams plan, generate, review, and publish content across multiple channels.

## Features

- **Dashboard** — KPI cards and an overview of recent content across all product areas
- **Product Area Analytics** — per-area engagement charts (impressions, reactions, shares, clicks), content rankings, and medium breakdowns for Dev Tools, Reveal, and Slingshot
- **5-Step Content Creation Wizard**
  1. **Setup** — choose a product area, target mediums, write a prompt, and optionally supply API keys
  2. **Augment** — query the RAG knowledge base to enrich the prompt with product-specific context
  3. **Model** — select the LLM model to use for generation
  4. **Generate** — AI generates channel-optimised copy for every selected medium in parallel
  5. **Review & Publish** — edit generated content, then publish immediately or schedule

### Supported LLM models

| Provider | Models |
|---|---|
| OpenAI | GPT-5o, GPT-5 Turbo |
| Anthropic | Claude 4.5 Sonnet, Claude 4 Haiku |
| Google | Gemini 3.1 Pro |

API keys are entered in-app (Step 1 of the wizard). If no key is supplied the app falls back to mock content so you can explore the full workflow without credentials.

### Supported content channels

Blog Post · Forum Post · Facebook · LinkedIn · X (Twitter)

## Tech stack

- **Angular 21** with SSR (`@angular/ssr`) and standalone components
- **Ignite UI for Angular 21** — UI components (stepper, tabs, cards, chips, inputs, charts)
- **Ignite UI Charts** — `IgxCategoryChart` for analytics visualisations
- Signals + `ChangeDetectionStrategy.OnPush` throughout
- RAG API: Infragistics AI Agent Gateway (Bearer token auth)

## Getting started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 11

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
```

Open `http://localhost:4200/`. The app reloads automatically on file changes.

### Production build

```bash
npm run build
```

Artifacts are written to `dist/`. The SSR server entry point is:

```bash
npm run serve:ssr:marketing-content-control-panel
```

### Unit tests

```bash
npm test
```

Uses [Vitest](https://vitest.dev/).

## API keys

The wizard accepts optional credentials in Step 1 — **Setup**:

| Field | Used for |
|---|---|
| RAG API Token | Infragistics AI Agent Gateway (product knowledge base) |
| OpenAI API Key | GPT-5o, GPT-5 Turbo (`sk-...`) |
| Anthropic API Key | Claude 4.5 Sonnet, Claude 4 Haiku (`sk-ant-...`) |
| Google AI API Key | Gemini 3.1 Pro (`AIza...`) |

All keys are stored only in memory for the duration of the browser session — they are never persisted or sent anywhere other than the respective provider's API endpoint.

## Project structure

```
src/
  app/
    components/
      content-creator/   # 5-step content creation wizard
      dashboard/          # KPI overview and recent content list
      product-area/       # Per-area analytics and charts
    models/
      content.model.ts    # Domain types, enums, and label maps
    services/
      content.service.ts  # Mock content data and analytics
      llm.service.ts      # OpenAI / Anthropic / Google API calls (+ mock fallback)
      rag.service.ts      # RAG knowledge base API calls (+ mock fallback)
    app.routes.ts         # Lazy-loaded feature routes
    app.config.ts         # App-wide providers (HttpClient, Router, animations)
```
