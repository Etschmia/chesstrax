import type { AnalysisReportData } from '../types';
import type { SupportedLanguage } from './shared';

export interface ILLMService {
  analyzeGames(pgn: string, apiKey: string, lichessUser: string, language: SupportedLanguage): Promise<AnalysisReportData>;
}