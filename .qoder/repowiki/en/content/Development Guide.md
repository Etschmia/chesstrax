# Development Guide

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [vite.config.ts](file://vite.config.ts)
- [tsconfig.json](file://tsconfig.json)
- [README.md](file://README.md)
- [llmProviders.ts](file://llmProviders.ts)
- [useSettings.ts](file://hooks/useSettings.ts)
- [Settings.tsx](file://components/Settings.tsx)
- [App.tsx](file://App.tsx)
- [anthropicService.ts](file://services/anthropicService.ts)
- [geminiService.ts](file://services/geminiService.ts)
- [openAIService.ts](file://services/openAIService.ts)
- [grokService.ts](file://services/grokService.ts)
- [versionService.ts](file://services/versionService.ts)
- [api/log-usage.ts](file://api/log-usage.ts)
</cite>

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Build and Running Process](#build-and-running-process)
3. [Development Workflow](#development-workflow)
4. [Testing Strategies](#testing-strategies)
5. [Contributing Guidelines](#contributing-guidelines)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)

## Development Environment Setup

To set up the ChessTrax development environment, ensure you have Node.js installed on your system. The project does not specify a minimum Node.js version, but it is recommended to use a recent LTS version (18.x or 20.x) for compatibility with modern JavaScript features and dependencies.

Install project dependencies using npm by running:
```bash
npm install
```

The project uses TypeScript for type safety and enhanced development experience. The TypeScript configuration is defined in `tsconfig.json` with target ES2020 and strict type checking enabled. IDEs such as Visual Studio Code will automatically recognize this configuration and provide appropriate TypeScript support including syntax highlighting, error detection, and code completion.

The project structure follows a component-based architecture with separate directories for components, hooks, services, and public assets. Key configuration files include `package.json` for dependencies and scripts, `vite.config.ts` for Vite build configuration, and `tsconfig.json` for TypeScript settings.

**Section sources**
- [package.json](file://package.json#L0-L31)
- [tsconfig.json](file://tsconfig.json#L0-L30)
- [README.md](file://README.md#L43-L65)

## Build and Running Process

ChessTrax uses Vite as its build tool and development server. The build and running process is managed through npm scripts defined in the `package.json` file.

To start the development server with hot module replacement:
```bash
npm run dev
```

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

The Vite configuration in `vite.config.ts` includes several important features. It defines a `@` alias pointing to the project root for easier imports. The configuration also injects build-time variables including the application version, build date, and build time, which are used for version tracking and debugging. Environment variables are loaded from the local environment, with special handling for the GEMINI_API_KEY which is made available to the application through the define configuration.

The development server is configured to allow specific hosts for CORS purposes, including the production domain and a development domain. This ensures that the application can be accessed from different environments while maintaining security.

**Section sources**
- [package.json](file://package.json#L5-L10)
- [vite.config.ts](file://vite.config.ts#L0-L35)
- [README.md](file://README.md#L43-L65)

## Development Workflow

The development workflow for ChessTrax follows standard practices for React applications with TypeScript. Code formatting and linting are not explicitly configured in the provided files, but the project structure and dependencies suggest a modern development workflow.

The application uses React 19 with React Hooks for state management and side effects. TypeScript provides type safety throughout the codebase, with interfaces defined for key data structures such as LLM providers and analysis reports. The project uses ESM (ECMAScript Modules) as indicated by the `"type": "module"` field in package.json.

For debugging, developers can use browser developer tools to inspect the application state and component hierarchy. The use of localStorage for storing user settings (as seen in the useSettings hook) can be inspected and modified directly in the browser's Application tab. API calls to LLM services can be monitored in the Network tab to verify request/response payloads.

The versionService component demonstrates the use of build-time variable injection, which can be useful for debugging and tracking different builds. The getCurrentVersion method retrieves version information that is embedded during the build process, allowing developers and users to identify exactly which version of the application they are running.

**Section sources**
- [tsconfig.json](file://tsconfig.json#L0-L30)
- [useSettings.ts](file://hooks/useSettings.ts#L0-L37)
- [versionService.ts](file://services/versionService.ts#L0-L42)

## Testing Strategies

While the provided codebase does not include explicit test files or testing configurations, the architecture supports several testing approaches. The modular design with separate service classes for each LLM provider enables unit testing of individual components.

The LLM service implementations follow a consistent interface (ILLMService) that could be easily mocked for testing. For example, the AnthropicService class implements a placeholder analyzeGames method that could be replaced with test implementations. Similarly, the useSettings hook encapsulates localStorage operations, making it easier to test settings functionality without relying on browser storage.

Integration testing could focus on key user flows such as:
- Loading games from Lichess by username
- Uploading PGN files
- Analyzing games with different LLM providers
- Generating and exporting analysis reports

End-to-end testing could verify the complete workflow from input to report generation. The application's reliance on external APIs (Lichess, LLM providers) would require appropriate mocking strategies to ensure reliable and fast tests.

**Section sources**
- [anthropicService.ts](file://services/anthropicService.ts#L0-L16)
- [useSettings.ts](file://hooks/useSettings.ts#L0-L37)
- [App.tsx](file://App.tsx#L125-L158)

## Contributing Guidelines

Contributions to ChessTrax are welcome. When submitting bug reports, please include detailed information about the issue, steps to reproduce, expected behavior, and actual behavior. For feature requests, provide a clear description of the proposed functionality and its benefits to users.

When submitting pull requests:
1. Fork the repository and create a feature branch
2. Ensure your code follows the existing code style and TypeScript conventions
3. Make sure the application builds successfully with `npm run build`
4. Test your changes thoroughly in the development environment
5. Include appropriate comments for complex logic
6. Update documentation if necessary

Commit messages should be clear and descriptive, following conventional commit guidelines when possible. For example:
- `feat: add support for new LLM provider`
- `fix: resolve issue with PGN parsing`
- `docs: update development guide`

The project uses localStorage for user settings persistence, so any changes to the settings structure should maintain backward compatibility or include appropriate migration logic.

**Section sources**
- [llmProviders.ts](file://llmProviders.ts#L0-L28)
- [useSettings.ts](file://hooks/useSettings.ts#L0-L37)
- [Settings.tsx](file://components/Settings.tsx#L0-L38)

## Common Development Tasks

### Adding a New LLM Provider

To add a new LLM provider, follow these steps:

1. Add the provider configuration to `llmProviders.ts`:
```typescript
{
  id: 'newprovider',
  name: 'New Provider Name',
  apiKeyName: 'New Provider API Key',
  documentationUrl: 'https://example.com/api-keys',
}
```

2. Create a new service file in the `services` directory that implements the `ILLMService` interface:
```typescript
// services/newProviderService.ts
import { ILLMService } from './llmService';
import type { AnalysisReportData } from '../types';

class NewProviderService implements ILLMService {
  public async analyzeGames(
    pgn: string,
    apiKey: string,
    lichessUser: string,
    language: "en" | "de" | "hy"
  ): Promise<AnalysisReportData> {
    // Implementation using the new provider's API
  }
}

export default new NewProviderService();
```

3. Import and register the new service in the main application logic.

**Section sources**
- [llmProviders.ts](file://llmProviders.ts#L0-L28)
- [anthropicService.ts](file://services/anthropicService.ts#L0-L16)

### Implementing a New UI Component

To implement a new UI component:

1. Create a new file in the `components` directory with a descriptive name and `.tsx` extension.

2. Define the component using React and TypeScript:
```typescript
// components/NewComponent.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NewComponentProps {
  // Define component props
}

const NewComponent: React.FC<NewComponentProps> = ({ /* props */ }) => {
  const { t } = useTranslation();
  
  return (
    // Component JSX
  );
};

export default NewComponent;
```

3. Style the component using the existing Tailwind CSS configuration as seen in `index.html`.

4. Connect the component to application state using appropriate hooks.

**Section sources**
- [index.html](file://index.html#L0-L38)
- [components/Linkify.tsx](file://components/Linkify.tsx#L0-L20)

## Troubleshooting

### Hot-Reload Failures

If the Vite development server fails to hot-reload changes:

1. Check the terminal output for any error messages from Vite
2. Verify that the file changes are being saved correctly
3. Try restarting the development server with `npm run dev`
4. Clear the Vite cache by deleting the `node_modules/.vite` directory
5. Ensure that file watchers are not limited by your operating system (this is common on Linux systems with many files)

### Type Errors

When encountering TypeScript errors:

1. Verify that all imported modules have appropriate type definitions
2. Check that component props and state are properly typed
3. Ensure that API responses are correctly typed in interfaces
4. Run `npm run build` to see all type errors in context
5. Consult the TypeScript documentation for specific error codes

### API Key Issues

If LLM provider API keys are not working:

1. Verify that the API key is correctly entered in the settings panel
2. Check that the key has the necessary permissions for the required API
3. Ensure the key is stored in localStorage under the correct key name as defined in `llmProviders.ts`
4. Test the API key directly with the provider's API to confirm it works
5. Check browser console for any network errors when making API calls

### Build Failures

If the production build fails:

1. Check that all required environment variables are available
2. Verify that all dependencies are installed with `npm install`
3. Ensure that the Vite configuration is correct
4. Check for any TypeScript compilation errors
5. Review the build output for specific error messages

**Section sources**
- [vite.config.ts](file://vite.config.ts#L0-L35)
- [tsconfig.json](file://tsconfig.json#L0-L30)
- [useSettings.ts](file://hooks/useSettings.ts#L0-L37)
- [api/log-usage.ts](file://api/log-usage.ts#L34-L66)