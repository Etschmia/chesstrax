import { ILLMService } from './llmService';
import type { AnalysisReportData } from '../types';

class AnthropicService implements ILLMService {
  public async analyzeGames(
    pgn: string,
    apiKey: string,
    lichessUser: string,
    language: "en" | "de" | "hy"
  ): Promise<AnalysisReportData> {
    // This is a placeholder implementation.
    console.log("Using Anthropic Service (placeholder)", { pgn, apiKey, lichessUser, language });
    throw new Error("Anthropic provider is not yet implemented.");
  }
}

export default new AnthropicService();
