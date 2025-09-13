# Getting Started

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [vite.config.ts](file://vite.config.ts)
- [index.tsx](file://index.tsx)
- [App.tsx](file://App.tsx)
- [README.md](file://README.md)
- [geminiService.ts](file://services/geminiService.ts)
- [llmService.ts](file://services/llmService.ts)
- [types.ts](file://types.ts)
- [usePgnParser.ts](file://hooks/usePgnParser.ts)
- [lichessService.ts](file://services/lichessService.ts)
</cite>

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation and Setup](#installation-and-setup)
3. [Running the Development Server](#running-the-development-server)
4. [Application Entry Point and Structure](#application-entry-point-and-structure)
5. [Basic Usage](#basic-usage)
6. [Development Environment Configuration](#development-environment-configuration)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Prerequisites

Before setting up ChessTrax, ensure your system meets the following requirements:

- **Node.js**: Version 18 or higher must be installed. You can verify your installation by running `node --version` in your terminal.
- **npm (Node Package Manager)**: This is typically included with Node.js. Verify with `npm --version`.
- **Internet Connection**: Required for downloading dependencies and accessing external APIs.
- **Lichess Account (Optional)**: To analyze games from your Lichess profile.
- **API Keys (Optional)**: For using alternative LLM providers such as OpenAI, Anthropic, or xAI Grok. A free Gemini API key from [Google AI Studio](https://aistudio.google.com/) can also be used to avoid rate limits.

**Section sources**
- [README.md](file://README.md#L20-L21)

## Installation and Setup

To get started with ChessTrax, follow these steps to clone the repository and install the required dependencies.

### Step 1: Clone the Repository
Open your terminal and run the following command to clone the ChessTrax repository:

```bash
git clone https://github.com/tobiasbrendler/chesstrax.git
cd chesstrax
```

### Step 2: Install Dependencies
Once inside the project directory, install all necessary packages listed in `package.json` using npm:

```bash
npm install
```

This command installs both production and development dependencies, including React, Vite, i18next for internationalization, and various LLM integration libraries such as `@google/genai`, `openai`, and others.

The `package.json` file defines the project's metadata and scripts, ensuring compatibility and ease of setup across environments.

**Section sources**
- [package.json](file://package.json#L0-L32)
- [README.md](file://README.md#L59-L61)

## Running the Development Server

After installing dependencies, you can start the development server using Vite, a fast build tool optimized for modern web applications.

Run the following command:

```bash
npm run dev
```

This executes the `dev` script defined in `package.json`, which invokes `vite`. The server will start and typically be available at `http://localhost:5173`. Any changes made to the source code will trigger hot module replacement (HMR), allowing real-time updates without a full page reload.

You can also use the following scripts for different workflows:
- `npm run build`: Compiles the app for production.
- `npm run preview`: Locally previews the production build.

**Section sources**
- [package.json](file://package.json#L5-L8)
- [README.md](file://README.md#L62-L64)

## Application Entry Point and Structure

ChessTrax is a React-based single-page application (SPA) with a clear entry point and component hierarchy.

### Entry Point: index.tsx
The application starts in `index.tsx`, which renders the root React component into the DOM element with ID `root` from `index.html`. It wraps the `App` component with `I18nextProvider` to enable multilingual support via i18next.

```tsx
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);
```

This setup ensures that translation functionality is available throughout the component tree.

### Main Component: App.tsx
The `App` component orchestrates the core UI and logic:
- Manages state for PGN content, analysis reports, errors, and user input.
- Handles two data sources: uploading a PGN file or fetching games via a Lichess username.
- Integrates with LLM services (`geminiService`, `openAIService`, etc.) through a unified interface `ILLMService`.
- Provides UI controls for settings, API key management, language selection, and help dialogs.

When an analysis is triggered, it routes the PGN data to the selected LLM provider for processing and displays the resulting `AnalysisReport`.

**Section sources**
- [index.tsx](file://index.tsx#L0-L19)
- [App.tsx](file://App.tsx#L0-L380)

## Basic Usage

Once the app is running, you can begin analyzing your chess games using one of two methods.

### Option 1: Analyze via Lichess Username
1. Enter your Lichess username in the input field.
2. Click **"Create My Training Plan"**.
3. The app fetches your last 2000 games from Lichess using the `/api/games/user/{username}` endpoint.
4. It filters out only the games you lost and sends up to 50 of them to the LLM for analysis.
5. A detailed report is generated, highlighting recurring tactical, strategic, and opening weaknesses.

### Option 2: Upload a PGN File
1. Click the **"Upload PGN File"** button and select a `.pgn` file.
2. The app automatically detects the most frequent player in the file.
3. Lost games for that player are extracted and analyzed.
4. Results are displayed in a structured format, including recommendations for improvement.

The analysis is powered by Google Gemini by default, but you can switch to other models if you provide your own API key.

**Section sources**
- [App.tsx](file://App.tsx#L200-L300)
- [usePgnParser.ts](file://hooks/usePgnParser.ts#L0-L104)
- [lichessService.ts](file://services/lichessService.ts#L0-L28)
- [geminiService.ts](file://services/geminiService.ts#L0-L165)

## Development Environment Configuration

The development environment is configured using Vite, with custom settings defined in `vite.config.ts`.

Key configurations include:
- **Environment Variables**: Loads `GEMINI_API_KEY` from `.env` files or uses a fallback key stored in `process.env`.
- **Build Metadata**: Injects version, build date, and time into the app using `define` for runtime access.
- **Aliases**: Sets up `@` as an alias for the project root to simplify imports.
- **Server Hosts**: Allows specific hosts like `app.3z5.de` and `chesstrax-ai-coach.vercel.app` for preview deployments.

```ts
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  '__APP_VERSION__': JSON.stringify(version),
  '__BUILD_DATE__': JSON.stringify(buildDate)
}
```

This configuration enables secure and flexible deployment while maintaining visibility into the build context.

**Section sources**
- [vite.config.ts](file://vite.config.ts#L0-L35)

## Troubleshooting Common Issues

Here are solutions to common problems encountered during setup and usage.

### Missing Dependencies
If `npm install` fails:
- Ensure you are in the correct project directory.
- Delete `node_modules` and `package-lock.json`, then re-run `npm install`.
- Check your internet connection and npm registry access.

### Build or Runtime Errors
- **"Could not find root element"**: Verify that `index.html` contains a `<div id="root"></div>` element.
- **Module resolution errors**: Confirm that TypeScript and Vite configurations are correct. Ensure `tsconfig.json` includes proper paths.

### API Key Errors
- If you see "API key is missing", click the key icon in the header to enter your own Gemini API key.
- Keys are stored only in your browser’s `localStorage` and never transmitted to any server.
- For other LLMs, ensure the correct provider is selected and the key is valid.

### Lichess Fetch Failures
- A 404 error indicates the username does not exist or has no public games.
- Ensure the username is spelled correctly and the account is active.

### Analysis Fails with Timeout or 503
- The Gemini API may be temporarily overloaded. The app automatically retries up to three times with exponential backoff.
- Consider using your own API key to avoid shared quota limits.

For further assistance, refer to the [README.md](file://README.md) or visit the live demo at [https://chesstrax-ai-coach.vercel.app/](https://chesstrax-ai-coach.vercel.app/).

**Section sources**
- [App.tsx](file://App.tsx#L100-L150)
- [geminiService.ts](file://services/geminiService.ts#L100-L165)
- [README.md](file://README.md#L0-L65)