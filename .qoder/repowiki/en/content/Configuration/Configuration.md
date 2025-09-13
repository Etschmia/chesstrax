# Configuration

<cite>
**Referenced Files in This Document**   
- [useSettings.ts](file://hooks/useSettings.ts)
- [i18n.ts](file://public/i18n.ts)
- [llmProviders.ts](file://llmProviders.ts)
- [Settings.tsx](file://components/Settings.tsx)
- [App.tsx](file://App.tsx)
- [MCP_KONZEPT.md](file://MCP_KONZEPT.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Settings Management with useSettings.ts](#settings-management-with-usesettingsts)
3. [Internationalization with i18next](#internationalization-with-i18next)
4. [LLM Provider Configuration](#llm-provider-configuration)
5. [Component Integration and Usage](#component-integration-and-usage)
6. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
7. [Conclusion](#conclusion)

## Introduction
The ChessTrax application features a modular configuration system that enables users to customize key aspects of the application, including AI provider selection, API key management, and language preferences. This document details the architecture and implementation of the configuration system, focusing on three core components: user settings persistence via `useSettings.ts`, internationalization using `i18next`, and dynamic LLM provider configuration through `llmProviders.ts`. The system is designed to be extensible, secure, and user-friendly, supporting both technical and non-technical users.

## Settings Management with useSettings.ts

The `useSettings` custom React hook provides a centralized mechanism for managing user preferences in ChessTrax. It encapsulates the logic for reading and writing settings to the browser's `localStorage`, ensuring persistence across sessions. The hook exposes a `SettingsState` interface that defines two primary properties: `selectedProviderId`, which stores the ID of the currently selected AI provider, and `apiKeys`, a record object that maps provider IDs to their respective API keys.

Upon initialization, the hook attempts to retrieve existing settings from `localStorage` under the key `chesstrax_settings`. If no saved settings are found or an error occurs during parsing, default values are applied: `selectedProviderId` is set to `null`, and API keys for OpenAI, Anthropic, and Grok are initialized as empty strings. The `saveSettings` function handles both updating the internal state and persisting the new settings to `localStorage`, wrapped in try-catch blocks to gracefully handle potential storage errors.

This design ensures that sensitive API keys remain confined to the user's browser, enhancing security by avoiding server-side storage. The hook also exports the `providers` array, allowing components to access provider metadata without importing it separately.

**Section sources**
- [useSettings.ts](file://hooks/useSettings.ts#L1-L38)
- [Settings.tsx](file://components/Settings.tsx#L1-L105)

## Internationalization with i18next

ChessTrax supports multiple languages through a robust internationalization (i18n) system built on `i18next`. The configuration is initialized in `public/i18n.ts`, where `i18next` is set up with the `HttpBackend` for dynamic loading of translation files and `LanguageDetector` to automatically detect the user's preferred language from the browser settings.

The system supports three languages: English (`en`), German (`de`), and Armenian (`hy`). These are defined in the `supportedLngs` array, with English serving as the fallback language if the user's preference is not available. Translation files are stored in the `public/locales` directory, organized by language code, with each containing a `translation.json` file. The `loadPath` configuration specifies the route pattern `/locales/{{lng}}/translation.json`, enabling dynamic loading based on the active language.

The `interpolation.escapeValue: false` setting disables HTML escaping, which is safe in React due to its built-in XSS protection. This allows translation strings to include HTML markup when necessary. The i18n instance is then provided to the React application via `I18nextProvider` in `index.tsx`, making the `t` function available throughout the component tree for translating UI text.

**Section sources**
- [i18n.ts](file://public/i18n.ts#L1-L25)
- [index.tsx](file://index.tsx#L1-L18)

## LLM Provider Configuration

The `llmProviders.ts` file defines the available AI providers that users can select for game analysis. It exports an `LLMProvider` interface specifying the structure of each provider, including a unique `id`, display `name`, `apiKeyName` for UI labeling, and `documentationUrl` linking to instructions for obtaining an API key.

Currently, three providers are supported: OpenAI GPT-4, xAI Grok, and Anthropic Claude 3. Each is listed in the `providers` array with its corresponding metadata. Notably, while the interface includes `'gemini'` as a possible ID, it is not present in the current provider list, suggesting a potential configuration or implementation gap.

This modular design allows for easy extension—new providers can be added to the array without modifying core application logic. The provider selection directly influences which backend service is used for analysis, with the application dynamically routing requests based on the `selectedProviderId`. This abstraction enables seamless integration of new AI models in the future.

**Section sources**
- [llmProviders.ts](file://llmProviders.ts#L1-L28)
- [MCP_KONZEPT.md](file://MCP_KONZEPT.md#L13-L71)

## Component Integration and Usage

The configuration system is integrated into the UI through the `Settings` component, which provides a form for users to select their preferred LLM provider and enter API keys. The component uses the `useSettings` hook to access current settings and the `saveSettings` function to persist changes. When a provider is selected, the corresponding API key field is dynamically rendered using the `apiKeyName` from the provider configuration.

Language switching is handled automatically by the i18next system, with UI text translated using the `useTranslation` hook. Components like `HelpDialog` and `LLMProviderDialog` leverage this to display content in the user's preferred language. The `App.tsx` file orchestrates the overall flow, conditionally rendering the settings panel and managing state for UI controls.

The architecture follows a clear separation of concerns: `useSettings` manages state persistence, `llmProviders.ts` defines available services, and `i18n.ts` handles language localization. This modularity ensures that changes in one area do not cascade into others, facilitating maintenance and scalability.

```mermaid
flowchart TD
A[User Opens Settings] --> B[Settings Component]
B --> C{Use useSettings Hook?}
C --> |Yes| D[Load from localStorage]
D --> E[Display Current Settings]
E --> F[User Changes Provider/API Key]
F --> G[Call saveSettings]
G --> H[Update State & localStorage]
H --> I[Settings Persisted]
J[User Loads Page] --> K[i18n Initialization]
K --> L[Detect Browser Language]
L --> M{Supported?}
M --> |Yes| N[Load translation.json]
M --> |No| O[Use Fallback (en)]
N --> P[Render Translated UI]
O --> P
```

**Diagram sources**
- [Settings.tsx](file://components/Settings.tsx#L1-L105)
- [i18n.ts](file://public/i18n.ts#L1-L25)

**Section sources**
- [Settings.tsx](file://components/Settings.tsx#L1-L105)
- [App.tsx](file://App.tsx#L315-L345)
- [MCP_KONZEPT.md](file://MCP_KONZEPT.md#L123-L132)

## Common Issues and Troubleshooting

### Settings Not Persisting
If user settings do not persist across sessions, the issue may stem from browser restrictions on `localStorage`. Ensure that the browser allows local storage for the site and that no extensions are blocking it. Additionally, check the browser console for errors related to `localStorage` access, which may indicate quota limits or security policies.

### Language Files Not Loading
When translations fail to load, verify that the `locales` directory contains valid JSON files for the requested language and that the file paths match the `loadPath` pattern in `i18n.ts`. Network issues or incorrect server configuration may prevent the JSON files from being served. Enable `debug: true` in the i18next configuration to get detailed logs about loading attempts.

### Missing Provider Options
If certain providers (e.g., Gemini) are expected but not appearing in the UI, confirm that they are correctly defined in the `providers` array in `llmProviders.ts`. Also, ensure that the corresponding service implementation (e.g., `geminiService.ts`) exists and is properly integrated, as noted in the `MCP_KONZEPT.md` documentation.

**Section sources**
- [useSettings.ts](file://hooks/useSettings.ts#L1-L38)
- [i18n.ts](file://public/i18n.ts#L1-L25)
- [MCP_KONZEPT.md](file://MCP_KONZEPT.md#L134-L139)

## Conclusion
The configuration system in ChessTrax effectively balances user customization with security and maintainability. By leveraging `localStorage` for settings persistence, `i18next` for internationalization, and a modular provider configuration, the application provides a flexible and scalable foundation for AI-powered chess analysis. Future enhancements could include validation for API keys, improved error handling, and support for additional languages and AI providers, further enriching the user experience.