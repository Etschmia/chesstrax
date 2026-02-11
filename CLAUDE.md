# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChessTrax is a personal chess coach web application that analyzes lost games from Lichess to identify recurring weaknesses. Users can enter their Lichess username to auto-fetch up to 2000 games via streaming API, or upload PGN files directly. The app uses LLM APIs (primarily Google Gemini) to analyze patterns in losses and generate personalized training recommendations. Reports can be exported as PDF.

## Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (Vite)
npm run build    # Create production build
npm run preview  # Preview production build
```

The dev server proxies `/api` requests to `localhost:3020` for the backend logging service (`server.js`).

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite 7** for build tooling
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) for styling
- **i18next** for internationalization (de, en, hy)
- **Express 5** backend for usage logging (`server.js`)

### Key Dependencies
- `@google/genai` - Google Gemini SDK
- `openai` - OpenAI SDK (also used by Grok and OpenRouter services)
- `axios` - HTTP client (version checks, etc.)
- `html2canvas` + `jspdf` - PDF export of analysis reports
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icons

### Project Structure (flat layout, main code not in src/)
```
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── types.ts             # TypeScript interfaces for analysis data
├── ApiKeyManager.tsx    # API key management UI
├── llmProviders.ts      # LLM provider definitions (id, name, URLs)
├── server.js            # Express backend (POST /api/log, GET /api/health)
├── metadata.json        # App metadata
├── components/
│   ├── AnalysisReport.tsx   # Full analysis report display (lazy loaded)
│   ├── ReportCard.tsx       # Individual report card component
│   ├── FileUpload.tsx       # PGN file upload component
│   ├── Settings.tsx         # Settings panel (lazy loaded)
│   ├── LLMProviderDialog.tsx # LLM provider selection dialog (lazy loaded)
│   ├── HelpDialog.tsx       # Help dialog (lazy loaded)
│   ├── AboutDialog.tsx      # About dialog (lazy loaded)
│   ├── Spinner.tsx          # Loading spinner
│   ├── Linkify.tsx          # Auto-link text utility
│   └── GoogleAnalytics.tsx  # GA integration
├── services/
│   ├── llmService.ts        # ILLMService interface (common contract)
│   ├── serviceFactory.ts    # Factory pattern for dynamic provider loading
│   ├── shared.ts            # Shared JSON schema for structured LLM output
│   ├── geminiService.ts     # Google Gemini provider
│   ├── openAIService.ts     # OpenAI provider
│   ├── anthropicService.ts  # Anthropic Claude provider
│   ├── grokService.ts       # xAI Grok provider
│   ├── openRouterService.ts # OpenRouter provider (Grok 4 Fast)
│   ├── lichessService.ts    # Lichess API integration (streaming game fetch)
│   └── versionService.ts    # Version checking and auto-update via service worker
├── hooks/
│   ├── usePgnParser.ts      # Parses PGN, detects user, filters lost games
│   ├── useSettings.ts       # LLM provider selection and API keys (localStorage)
│   └── useVersionInfo.ts    # App version and update status
├── src/
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type declarations
├── public/locales/          # Translation JSON files (de/en/hy)
├── specs/                   # Specification and planning documents
└── docs/                    # GitHub Pages blog (Jekyll)
```

### LLM Service Architecture

The app uses a factory pattern (`services/serviceFactory.ts`) to dynamically load LLM services on demand:

- **ILLMService** interface (`services/llmService.ts`): Common contract for all providers
- **Shared schema** (`services/shared.ts`): JSON schema for structured output (used by OpenAI-compatible APIs)
- **Provider implementations**: `geminiService.ts`, `openAIService.ts`, `anthropicService.ts`, `grokService.ts`, `openRouterService.ts`

Provider selection priority:
1. `OPENROUTER_API_KEY` env var → uses OpenRouter with Grok 4 Fast
2. User's custom Gemini key from localStorage
3. Settings-selected provider with stored API key
4. Default Gemini with bundled API key from `GEMINI_API_KEY` env var

### Lichess Integration

`services/lichessService.ts` fetches games via the Lichess API with streaming support (`application/x-nd-pgn`). Fetches up to 2000 games across blitz, rapid, classical, correspondence, and standard time controls. Provides a progress callback for live game count updates during fetch.

### Build-Time Globals

Vite injects these globals via `define` in `vite.config.ts`:
- `__APP_VERSION__` - from `package.json` version
- `__BUILD_DATE__` / `__BUILD_TIME__` - build timestamp
- `process.env.GEMINI_API_KEY`, `process.env.OPENROUTER_API_KEY`, `process.env.VITE_GA_MEASUREMENT_ID`

### Key Hooks

- **usePgnParser**: Parses PGN content, detects user from game headers, filters lost games
- **useSettings**: Manages LLM provider selection and API keys via localStorage
- **useVersionInfo**: Provides current app version, build info, and update check functionality

### Environment Variables

Set in `.env.local`:
- `GEMINI_API_KEY` - Default Gemini API key
- `OPENROUTER_API_KEY` - If set, overrides all other providers with OpenRouter/Grok
- `MESS_ID` / `VITE_MESS_ID` - Google Analytics measurement ID (optional)

### Internationalization

Translations in `public/locales/{lang}/translation.json`. The `analyzeGames` service method accepts a language parameter ('en'|'de'|'hy') to generate analysis in the user's selected language.

## Notes

- The analysis processes only the **last 50 lost games** to keep prompt sizes manageable
- PGN parsing uses regex to split games by `[Event "` headers
- Lazy loading is used for heavy components (AnalysisReport, Settings, LLMProviderDialog, HelpDialog, AboutDialog) to reduce initial bundle size
- Deployment targets: Vercel (`chesstrax-ai-coach.vercel.app`) and self-hosted (`app.3z5.de`)
