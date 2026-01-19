import OpenAI from 'openai';
import type { AnalysisReportData } from '../types';
import { ILLMService } from './llmService';
import {
  SupportedLanguage,
  buildSystemPrompt,
  buildUserPrompt,
  withRetry,
  parseAnalysisResponse
} from './shared';

class GrokService implements ILLMService {
  public async analyzeGames(
    pgnOfLostGames: string,
    apiKey: string,
    lichessUser: string,
    language: SupportedLanguage
  ): Promise<AnalysisReportData> {
    const grok = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      dangerouslyAllowBrowser: true
    });

    const systemPrompt = buildSystemPrompt(language);
    const userPrompt = buildUserPrompt(pgnOfLostGames, lichessUser);

    return withRetry(
      async () => {
        const response = await grok.chat.completions.create({
          model: 'grok-1',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        });

        return parseAnalysisResponse(response.choices[0]?.message?.content);
      },
      {
        isRetryableError: (e) => e.message.includes('503') || e.message.includes('429'),
        onRetry: (attempt, delay) =>
          console.log(`Model is overloaded or rate limited. Retrying in ${Math.round(delay / 1000)}s...`)
      }
    );
  }
}

export default new GrokService();
