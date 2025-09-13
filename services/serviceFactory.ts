import { ILLMService } from './llmService';

// Cache for loaded services to avoid multiple imports
const serviceCache = new Map<string, ILLMService>();

/**
 * Dynamically loads LLM services on demand to reduce initial bundle size
 */
export class ServiceFactory {
  static async getService(providerId: string): Promise<ILLMService> {
    // Return cached service if already loaded
    if (serviceCache.has(providerId)) {
      return serviceCache.get(providerId)!;
    }

    let service: ILLMService;

    switch (providerId) {
      case 'gemini':
        const geminiModule = await import('./geminiService');
        service = geminiModule.default;
        break;
      case 'openai':
        const openaiModule = await import('./openAIService');
        service = openaiModule.default;
        break;
      case 'grok':
        const grokModule = await import('./grokService');
        service = grokModule.default;
        break;
      case 'anthropic':
        const anthropicModule = await import('./anthropicService');
        service = anthropicModule.default;
        break;
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }

    // Cache the loaded service
    serviceCache.set(providerId, service);
    return service;
  }

  /**
   * Preload a service for better user experience
   */
  static async preloadService(providerId: string): Promise<void> {
    try {
      await this.getService(providerId);
    } catch (error) {
      console.warn(`Failed to preload service ${providerId}:`, error);
    }
  }

  /**
   * Clear the service cache (useful for testing or memory management)
   */
  static clearCache(): void {
    serviceCache.clear();
  }
}