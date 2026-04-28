import llmConfig from './llm.config.json';

export type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'grok' | 'openrouter';

export interface LLMProvider {
  id: ProviderId;
  name: string;
  apiKeyName: string;
  documentationUrl: string;
  model: string;
}

interface RawProvider {
  name: string;
  apiKeyName: string;
  documentationUrl: string;
  model: string;
}

const rawProviders = llmConfig.providers as Record<ProviderId, RawProvider>;

export const providers: LLMProvider[] = (Object.keys(rawProviders) as ProviderId[]).map(id => ({
  id,
  ...rawProviders[id],
}));

export const getProvider = (id: ProviderId): LLMProvider => {
  const p = providers.find(prov => prov.id === id);
  if (!p) throw new Error(`Unknown LLM provider: ${id}`);
  return p;
};

export const getModel = (id: ProviderId): string => getProvider(id).model;

export const lichessDefaults = {
  defaultGameCount: llmConfig.lichess.defaultGameCount,
  maxGameCount: llmConfig.lichess.maxGameCount,
};

export const analysisDefaults = {
  maxLostGamesForLlm: llmConfig.analysis.maxLostGamesForLlm,
};
