
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisReportData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    openingAnalysis: {
      type: Type.OBJECT,
      description: "Analysis of opening performance for White and Black.",
      properties: {
        asWhite: { type: Type.STRING, description: "Detailed analysis of opening struggles as White, with concrete suggestions for improvement or alternative openings. Mention specific opening names." },
        asBlack: { type: Type.STRING, description: "Detailed analysis of opening struggles as Black, with concrete suggestions for lines to study. Mention specific opening names." },
      },
       required: ["asWhite", "asBlack"]
    },
    tacticalMotifs: {
      type: Type.ARRAY,
      description: "A list of recurring tactical motifs the user misses.",
      items: {
        type: Type.OBJECT,
        properties: {
          motif: { type: Type.STRING, description: "The name of the tactical motif (e.g., Fork, Pin, Skewer)." },
          explanation: { type: Type.STRING, description: "A brief explanation of why the user struggles with this motif." },
        },
        required: ["motif", "explanation"]
      },
    },
    strategicWeaknesses: {
      type: Type.ARRAY,
      description: "A list of common strategic errors.",
      items: {
        type: Type.OBJECT,
        properties: {
          weakness: { type: Type.STRING, description: "The name of the strategic weakness (e.g., Poor Pawn Structure, Bad Piece Activity)." },
          explanation: { type: Type.STRING, description: "A brief explanation of the strategic error and its consequences." },
        },
        required: ["weakness", "explanation"]
      },
    },
    endgamePractice: {
      type: Type.ARRAY,
      description: "Recommended endgame types for practice.",
      items: {
        type: Type.OBJECT,
        properties: {
          endgameType: { type: Type.STRING, description: "The type of endgame to study (e.g., Rook and Pawn Endgames)." },
          explanation: { type: Type.STRING, description: "Why this endgame type is important for the user based on their games." },
        },
        required: ["endgameType", "explanation"]
      },
    },
    summary: {
      type: Type.STRING,
      description: "A short, encouraging summary of the analysis and a suggestion for the single most important area to focus on first."
    }
  },
  required: ["openingAnalysis", "tacticalMotifs", "strategicWeaknesses", "endgamePractice", "summary"]
};


export const analyzeGames = async (pgnOfLostGames: string, lichessUser: string, language: 'en' | 'de'): Promise<AnalysisReportData> => {
  const model = "gemini-2.5-flash";

  const languageName = language === 'de' ? 'German' : 'English';

  const prompt = `
    Analyze the following chess games that I, Lichess user "${lichessUser}", have lost.
    Based on these games, create a personalized training plan.
    Identify recurring patterns in my mistakes. Do not comment on individual blunders unless they exemplify a recurring pattern.
    Focus on actionable advice.

    Here are the PGNs of my lost games:
    ---
    ${pgnOfLostGames}
    ---

    IMPORTANT: The user has requested the output in ${languageName}. Generate the entire analysis and all text in the final JSON object in ${languageName}.
    Provide the analysis in the structured JSON format as requested. Be concise but insightful.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });

        const jsonText = response.text.trim();
        // Sometimes the API might wrap the JSON in markdown backticks
        const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        
        const parsedData: AnalysisReportData = JSON.parse(cleanJsonText);
        return parsedData;

    } catch (error) {
        console.error("Error during Gemini API call or JSON parsing:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while analyzing games.");
    }
};
