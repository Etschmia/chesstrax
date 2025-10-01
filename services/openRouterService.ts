import OpenAI from 'openai';
import type { AnalysisReportData } from '../types';
import { ILLMService } from './llmService';

const analysisSchema = {
    "type": "object",
    "properties": {
        "openingAnalysis": {
            "type": "object",
            "description": "Analysis of opening performance for White and Black.",
            "properties": {
                "asWhite": { "type": "string", "description": "Detailed analysis of opening struggles as White, with concrete suggestions for improvement or alternative openings. Mention specific opening names." },
                "asBlack": { "type": "string", "description": "Detailed analysis of opening struggles as Black, with concrete suggestions for lines to study. Mention specific opening names." },
            },
            "required": ["asWhite", "asBlack"]
        },
        "tacticalMotifs": {
            "type": "array",
            "description": "A list of recurring tactical motifs the user misses.",
            "items": {
                "type": "object",
                "properties": {
                    "motif": { "type": "string", "description": "The name of the tactical motif (e.g., Fork, Pin, Skewer)." },
                    "explanation": { "type": "string", "description": "A brief explanation of why the user struggles with this motif." },
                },
                "required": ["motif", "explanation"]
            },
        },
        "strategicWeaknesses": {
            "type": "array",
            "description": "A list of common strategic errors.",
            "items": {
                "type": "object",
                "properties": {
                    "weakness": { "type": "string", "description": "The name of the strategic weakness (e.g., Poor Pawn Structure, Bad Piece Activity)." },
                    "explanation": { "type": "string", "description": "A brief explanation of the strategic error and its consequences." },
                },
                "required": ["weakness", "explanation"]
            },
        },
        "endgamePractice": {
            "type": "array",
            "description": "Recommended endgame types for practice.",
            "items": {
                "type": "object",
                "properties": {
                    "endgameType": { "type": "string", "description": "The type of endgame to study (e.g., Rook and Pawn Endgames)." },
                    "explanation": { "type": "string", "description": "Why this endgame type is important for the user based on their games." },
                },
                "required": ["endgameType", "explanation"]
            },
        },
        "summary": {
            "type": "string",
            "description": "A short, encouraging summary of the analysis and a suggestion for the single most important area to focus on first."
        }
    },
    "required": ["openingAnalysis", "tacticalMotifs", "strategicWeaknesses", "endgamePractice", "summary"]
};

class OpenRouterService implements ILLMService {
  private getApiKey(): string {
    const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured in the environment. Use VITE_OPENROUTER_API_KEY in .env.local for client-side access.");
    }
    return apiKey;
  }

  public async analyzeGames(
    pgnOfLostGames: string,
    _apiKey: string, // Ignored, uses env key
    lichessUser: string,
    language: 'en' | 'de' | 'hy'
  ): Promise<AnalysisReportData> {
    const openrouter = new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true
    });

    let languageName: string;
    switch (language) {
      case 'de':
        languageName = 'German';
        break;
      case 'hy':
        languageName = 'Armenian';
        break;
      default:
        languageName = 'English';
    }
    
    const toneInstruction = language === 'de' ? '1. Always address the user with the informal German "Du". Use a friendly and encouraging tone.' : '1. Use a friendly and encouraging tone.';
    const schemaJson = JSON.stringify(analysisSchema, null, 2);
    
    const systemPrompt = `
      You are a helpful and insightful chess coach. Your task is to analyze a set of chess games from a user and provide a personalized training plan.
      The user wants the output in a specific JSON format.
      The entire analysis and all text in the final JSON object must be in ${languageName}.
      
      **Tone and Formatting Rules:**
      ${toneInstruction}
      2. When you list example games, you MUST precede the list with the keyword "GameId". For example: "... (e.g., GameId abcdefgh, ijklmnop)".
      3. The output must be a valid JSON object conforming exactly to this schema, with no additional text or explanations outside the JSON:
      \`\`\`json
      ${schemaJson}
      \`\`\`
    `;

    const userPrompt = `
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

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await openrouter.chat.completions.create({
          model: 'x-ai/grok-4-fast:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        });

        const jsonText = response.choices[0]?.message?.content;
        if (!jsonText) {
          throw new Error('API response was empty.');
        }

        const parsedData: AnalysisReportData = JSON.parse(jsonText);
        return parsedData;

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        const isOverloadedError = error instanceof Error && (error.message.includes('503') || error.message.includes('429'));

        if (isOverloadedError && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`Model is overloaded or rate limited. Retrying in ${Math.round(delay / 1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
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
}

export default new OpenRouterService();