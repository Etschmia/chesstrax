import { ILLMService } from './llmService';
import type { AnalysisReportData } from '../types';
import type { SupportedLanguage } from './shared';

class AnthropicService implements ILLMService {
  public async analyzeGames(
    _pgn: string,
    _apiKey: string,
    _lichessUser: string,
    _language: SupportedLanguage
  ): Promise<AnalysisReportData> {
    throw new Error("Anthropic provider is not yet implemented.");
  }
}

export default new AnthropicService();
