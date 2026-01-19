import type { AnalysisReportData } from '../types';

export type SupportedLanguage = 'en' | 'de' | 'hy';

/**
 * JSON Schema for OpenAI-compatible APIs (Grok, OpenRouter)
 */
export const analysisJsonSchema = {
  type: "object",
  properties: {
    openingAnalysis: {
      type: "object",
      description: "Analysis of opening performance for White and Black.",
      properties: {
        asWhite: { type: "string", description: "Detailed analysis of opening struggles as White, with concrete suggestions for improvement or alternative openings. Mention specific opening names." },
        asBlack: { type: "string", description: "Detailed analysis of opening struggles as Black, with concrete suggestions for lines to study. Mention specific opening names." },
      },
      required: ["asWhite", "asBlack"]
    },
    tacticalMotifs: {
      type: "array",
      description: "A list of recurring tactical motifs the user misses.",
      items: {
        type: "object",
        properties: {
          motif: { type: "string", description: "The name of the tactical motif (e.g., Fork, Pin, Skewer)." },
          explanation: { type: "string", description: "A brief explanation of why the user struggles with this motif." },
        },
        required: ["motif", "explanation"]
      },
    },
    strategicWeaknesses: {
      type: "array",
      description: "A list of common strategic errors.",
      items: {
        type: "object",
        properties: {
          weakness: { type: "string", description: "The name of the strategic weakness (e.g., Poor Pawn Structure, Bad Piece Activity)." },
          explanation: { type: "string", description: "A brief explanation of the strategic error and its consequences." },
        },
        required: ["weakness", "explanation"]
      },
    },
    endgamePractice: {
      type: "array",
      description: "Recommended endgame types for practice.",
      items: {
        type: "object",
        properties: {
          endgameType: { type: "string", description: "The type of endgame to study (e.g., Rook and Pawn Endgames)." },
          explanation: { type: "string", description: "Why this endgame type is important for the user based on their games." },
        },
        required: ["endgameType", "explanation"]
      },
    },
    summary: {
      type: "string",
      description: "A short, encouraging summary of the analysis and a suggestion for the single most important area to focus on first."
    }
  },
  required: ["openingAnalysis", "tacticalMotifs", "strategicWeaknesses", "endgamePractice", "summary"]
} as const;

/**
 * Convert language code to full language name
 */
export function getLanguageName(language: SupportedLanguage): string {
  switch (language) {
    case 'de':
      return 'German';
    case 'hy':
      return 'Armenian';
    default:
      return 'English';
  }
}

/**
 * Get tone instruction based on language
 */
export function getToneInstruction(language: SupportedLanguage): string {
  return language === 'de'
    ? 'Always address the user with the informal German "Du". Use a friendly and encouraging tone.'
    : 'Use a friendly and encouraging tone.';
}

/**
 * Execute an async function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    isRetryableError?: (error: Error) => boolean;
    onRetry?: (attempt: number, delay: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    isRetryableError = (e) => e.message.includes('503') || e.message.includes('429'),
    onRetry = (attempt, delay) => console.log(`Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt})`)
  } = options;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (error instanceof Error && isRetryableError(error) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000;
        onRetry(attempt, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to get analysis from AI: ${error.message}`);
      }
      throw new Error("An unknown error occurred while analyzing games.");
    }
  }

  throw new Error("Failed to get analysis from AI after multiple retries.");
}

/**
 * Parse and validate API response
 */
export function parseAnalysisResponse(jsonText: string | null | undefined): AnalysisReportData {
  if (!jsonText) {
    throw new Error('API response was empty.');
  }

  const cleanJsonText = jsonText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleanJsonText) as AnalysisReportData;
}

/**
 * Build the user prompt for chess analysis
 */
export function buildUserPrompt(pgnOfLostGames: string, lichessUser: string): string {
  return `
Analyze the following chess games that I, Lichess user "${lichessUser}", have lost.
Based on these games, create a personalized training plan.
Identify recurring patterns in my mistakes. Do not comment on individual blunders unless they exemplify a recurring pattern.
Focus on actionable advice.

Here are the PGNs of my lost games:
---
${pgnOfLostGames}
---

Please provide the analysis in the structured JSON format as requested. Be concise but insightful.
`;
}

/**
 * Build the system prompt for OpenAI-compatible APIs
 */
export function buildSystemPrompt(language: SupportedLanguage): string {
  const languageName = getLanguageName(language);
  const toneInstruction = getToneInstruction(language);
  const schemaJson = JSON.stringify(analysisJsonSchema, null, 2);

  return `
You are a helpful and insightful chess coach. Your task is to analyze a set of chess games from a user and provide a personalized training plan.
The user wants the output in a specific JSON format.
The entire analysis and all text in the final JSON object must be in ${languageName}.

**Tone and Formatting Rules:**
1. ${toneInstruction}
2. When you list example games, you MUST precede the list with the keyword "GameId". For example: "... (e.g., GameId abcdefgh, ijklmnop)".
3. The output must be a valid JSON object conforming exactly to this schema, with no additional text or explanations outside the JSON:
\`\`\`json
${schemaJson}
\`\`\`
`;
}
