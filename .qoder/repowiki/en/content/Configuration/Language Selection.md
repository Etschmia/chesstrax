# Language Selection

<cite>
**Referenced Files in This Document**   
- [i18n.ts](file://public/i18n.ts)
- [App.tsx](file://App.tsx)
- [Settings.tsx](file://components/Settings.tsx)
- [translation.json](file://public/locales/en/translation.json)
- [translation.json](file://public/locales/de/translation.json)
- [translation.json](file://public/locales/hy/translation.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [i18next Initialization](#i18next-initialization)
3. [Translation File Structure](#translation-file-structure)
4. [Component Integration](#component-integration)
5. [Language Switching Mechanism](#language-switching-mechanism)
6. [Error Handling and Fallbacks](#error-handling-and-fallbacks)
7. [Best Practices](#best-practices)

## Introduction
ChessTrax implements a multilingual interface using the i18next internationalization framework to support English, German, and Armenian languages. The system enables users to switch between languages through a simple UI interface, with translations applied consistently across all components. This documentation details the implementation of the language selection feature, covering configuration, file structure, component integration, and error handling mechanisms.

## i18next Initialization
The i18next framework is initialized in the public/i18n.ts file, where the core configuration establishes the foundation for multilingual support. The initialization process imports essential modules including the main i18next library, react-i18next for React integration, i18next-browser-languagedetector for automatic language detection, and i18next-http-backend for loading translation files.

The configuration specifies 'en' as the fallback language and explicitly defines supported languages as 'en', 'de', and 'hy' (English, German, and Armenian). Translation files are loaded from the /locales/{{lng}}/translation.json path, where {{lng}} is dynamically replaced with the current language code. The load: 'languageOnly' setting ensures that only language codes (without region variants) are considered when loading resources. Interpolation is configured with escapeValue set to false, as React handles HTML escaping by default, preventing double-escaping of content.

[SPEC SYMBOL](file://public/i18n.ts#L1-L25)

## Translation File Structure
Translation resources are organized in JSON format under the public/locales directory, with separate subdirectories for each supported language: en (English), de (German), and hy (Armenian). Each language directory contains a translation.json file that houses all translatable strings for the application.

The JSON structure uses a hierarchical key system that groups related translations by functional area, such as "settings", "help", "about", and "error". This organization enables maintainable and scalable translation management. Message formatting supports variable interpolation through the {{variable}} syntax, allowing dynamic content insertion in translated strings. For example, error messages can incorporate specific details like usernames or error codes while maintaining proper language context.

The translation files contain comprehensive coverage of the application's UI elements, including button labels, form fields, error messages, dialog content, and instructional text. Each key-value pair represents a translatable unit, with identical key structures maintained across all language files to ensure consistency.

[SPEC SYMBOL](file://public/locales/en/translation.json#L1-L122)
[SPEC SYMBOL](file://public/locales/de/translation.json#L1-L122)
[SPEC SYMBOL](file://public/locales/hy/translation.json#L1-L121)

## Component Integration
Components access translated text through the useTranslation hook from react-i18next, which provides the t function for retrieving translations. The App component is wrapped with I18nextProvider in index.tsx, making the i18n instance available throughout the component tree via React's context API.

Components import the useTranslation hook and call it to obtain the t function, which is then used to retrieve translated strings by key. For example, Settings.tsx uses t('settings.title') to get the localized title for the settings panel. The hook automatically re-renders components when the language changes, ensuring UI consistency.

Message formatting with dynamic variables is implemented using the {{}} syntax in translation values. When calling the t function, an object with variable values can be passed as a second parameter. For instance, t('error.userNotFound', { user: username }) replaces {{user}} in the translation with the actual username value. This approach maintains proper grammatical structure in each language while incorporating dynamic content.

[SPEC SYMBOL](file://App.tsx#L0-L380)
[SPEC SYMBOL](file://components/Settings.tsx#L0-L105)

## Language Switching Mechanism
The language switching functionality is implemented directly in the App component through a set of UI buttons in the header that represent each supported language (EN, DE, HY). When a user clicks on a language button, the changeLanguage method of the i18n instance is called with the corresponding language code.

The current language state is tracked by checking i18n.language, which returns the active language code. The UI reflects the currently selected language by applying an accent background color to the corresponding button, providing visual feedback to the user. This implementation ensures immediate language switching without requiring a page reload, as the i18next context triggers re-renders of all components using the useTranslation hook.

Language preference is not explicitly persisted to localStorage or other storage mechanisms in the current implementation. Instead, the browser's language detection feature (via i18next-browser-languagedetector) automatically sets the initial language based on the user's browser settings. When users manually select a language, the choice remains active for the current session but resets to the detected browser language upon subsequent visits.

[SPEC SYMBOL](file://App.tsx#L347-L360)

## Error Handling and Fallbacks
The internationalization system implements robust error handling and fallback mechanisms to ensure usability even when translations are missing or resources fail to load. The primary fallback strategy is configured in i18n.ts with fallbackLng set to 'en', ensuring that English text is displayed when a requested translation is unavailable in the selected language.

When a translation key is not found in the current language's JSON file, i18next automatically attempts to retrieve it from the fallback language (English). If the key is missing in both the current and fallback languages, the key itself is returned as the displayed text, which helps identify missing translations during development and testing.

Locale file loading errors are handled by the i18next-http-backend, which manages network requests for translation JSON files. If a language file fails to load (e.g., due to network issues), the system falls back to the configured fallback language. The debug mode is enabled in development, providing console output for translation lookup operations, missing keys, and loading status, which aids in troubleshooting internationalization issues.

Common issues such as missing translations can be addressed by ensuring all language JSON files contain identical key sets. Developers should verify that new features include corresponding translation entries in all supported languages. Loading errors can be mitigated by validating file paths and ensuring proper server configuration for serving static JSON files.

[SPEC SYMBOL](file://public/i18n.ts#L1-L25)

## Best Practices
When adding new languages to ChessTrax, create a new directory under public/locales using the appropriate language code (e.g., 'fr' for French) and copy the structure of existing translation.json files. Add the new language code to the supportedLngs array in i18n.ts and update the UI to include a button for the new language in the header.

To maintain translation consistency, follow a standardized key naming convention using lowercase letters, numbers, and periods to separate namespace levels (e.g., "settings.title", "error.fileRead"). Group related translations under common prefixes to facilitate organization and maintenance. When modifying existing translations, ensure changes are applied consistently across all language files to prevent missing keys.

For message formatting with variables, use descriptive variable names within the {{}} syntax (e.g., {{username}} rather than {{u}}) to improve readability and maintainability. Test translations with various input lengths, as text expansion in different languages can affect UI layout (e.g., German text is often longer than English).

Regularly audit translation files to identify and remove unused keys, and verify that all UI elements are properly internationalized by temporarily setting the language to a less-complete translation and checking for raw key values in the interface. This approach helps maintain high-quality multilingual support across the application.