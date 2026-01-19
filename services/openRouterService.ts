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
    _apiKey: string,
    lichessUser: string,
    language: SupportedLanguage
  ): Promise<AnalysisReportData> {
    const openrouter = new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true
    });

    const systemPrompt = buildSystemPrompt(language);
    const userPrompt = buildUserPrompt(pgnOfLostGames, lichessUser);

    return withRetry(
      async () => {
        const response = await openrouter.chat.completions.create({
          model: 'x-ai/grok-4-fast:free',
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

export default new OpenRouterService();
