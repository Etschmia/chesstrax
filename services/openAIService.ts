import { ILLMService } from './llmService';
import type { AnalysisReportData } from '../types';
import type { SupportedLanguage } from './shared';

class OpenAIService implements ILLMService {
  public async analyzeGames(
    _pgn: string,
    _apiKey: string,
    _lichessUser: string,
    _language: SupportedLanguage
  ): Promise<AnalysisReportData> {
    throw new Error("OpenAI provider is not yet implemented.");
  }
}

export default new OpenAIService();
