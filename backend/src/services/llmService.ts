import OpenAI from 'openai';
import { config } from '../config/environment';
import { logger } from '../config/logger';

interface LLMResponse {
  text: string;
  tokensUsed: number;
}

class LLMService {
  private openai: OpenAI | null = null;

  constructor() {
    // Only use real API key if it's not a placeholder
    if (config.llm.openai.apiKey && !config.llm.openai.apiKey.includes('your_') && !config.llm.openai.apiKey.includes('here')) {
      this.openai = new OpenAI({
        apiKey: config.llm.openai.apiKey,
      });
    }
  }

  async rewrite(prompt: string, model: string = 'gpt-3.5-turbo'): Promise<LLMResponse> {
    // For development without API keys, return a mock response
    if (!this.openai) {
      logger.warn('No OpenAI API key configured, returning mock response');
      
      return {
        text: `[MOCK REWRITE] This is a simulated tone-adjusted version of your text. 
               In production, this would use ${model} to apply the specified tone adjustments. 
               Configure OPENAI_API_KEY in .env to use real AI models.`,
        tokensUsed: 50
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.models.temperature,
        max_tokens: config.models.maxTokens,
      });

      const text = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        text,
        tokensUsed
      };

    } catch (error: any) {
      logger.error('LLM API error:', error);
      throw new Error(`Failed to get response from ${model}: ${error.message}`);
    }
  }
}

export const llmService = new LLMService();
