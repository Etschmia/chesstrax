# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChessTrax is a personal chess coach web application that analyzes lost games from Lichess to identify recurring weaknesses. Users can enter their Lichess username to auto-fetch games or upload PGN files directly. The app uses LLM APIs (primarily Google Gemini) to analyze patterns in losses and generate personalized training recommendations.

## Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (Vite)
npm run build    # Create production build
npm run preview  # Preview production build
```

The dev server proxies `/api` requests to `localhost:3020` for the backend logging service.

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **i18next** for internationalization (de, en, hy)

### Project Structure (flat layout, not in src/)
```
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── types.ts             # TypeScript interfaces for analysis data
├── ApiKeyManager.tsx    # Gemini API key management UI
├── components/          # React components (AnalysisReport, FileUpload, Settings, dialogs)
├── services/            # LLM service implementations
├── hooks/               # React hooks (usePgnParser, useSettings, useVersionInfo)
├── public/locales/      # Translation JSON files (de/en/hy)
```

### LLM Service Architecture

The app uses a factory pattern (`services/serviceFactory.ts`) to dynamically load LLM services on demand:

- **ILLMService** interface (`services/llmService.ts`): Common contract for all providers
- **Provider implementations**: `geminiService.ts`, `openAIService.ts`, `anthropicService.ts`, `grokService.ts`, `openRouterService.ts`

Provider selection priority:
1. `OPENROUTER_API_KEY` env var → uses OpenRouter with Grok 4 Fast
2. User's custom Gemini key from localStorage
3. Settings-selected provider with stored API key
4. Default Gemini with bundled API key from `GEMINI_API_KEY` env var

### Key Hooks

- **usePgnParser**: Parses PGN content, detects user from game headers, filters lost games
- **useSettings**: Manages LLM provider selection and API keys via localStorage

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
- Lazy loading is used for heavy components (AnalysisReport, Settings, dialogs) to reduce initial bundle size
