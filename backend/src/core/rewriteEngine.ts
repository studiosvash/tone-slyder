import { 
  RewriteRequest, 
  RewriteResponse, 
  SliderWeight, 
  ConflictResolution,
  ToneInstruction,
  Guardrails 
} from '@tone-slyder/shared/types';
import { logger } from '../config/logger';

/**
 * Phase 1: Input Processing & Tone Vector Normalization
 * Convert slider values (10-90%) to normalized weights (-1.0 to +1.0)
 */
export function normalizeSliderValue(sliderValue: number): number {
  // Clamp to valid range
  const clampedValue = Math.max(10, Math.min(90, sliderValue));
  // Convert 10-90% range to -1.0 to +1.0 scale
  return (clampedValue - 50) / 40;
}

/**
 * Phase 1: Instruction Mapping Engine (Bucket Mapping)
 * Convert normalized weights to qualitative instructions
 */
export function mapWeightToInstruction(weight: number): string {
  const absWeight = Math.abs(weight);
  
  if (absWeight <= 0.2) return 'moderate';
  if (absWeight <= 0.5) return weight < 0 ? 'low' : 'high';
  return weight < 0 ? 'very low' : 'very high';
}

/**
 * Phase 2: Conflict Resolution & Prioritization Logic
 * Handle conflicting slider settings by prioritizing top weights
 */
export function resolveSliderConflicts(sliderValues: Record<string, number>): ConflictResolution {
  // Convert slider values to weights with instructions
  const weights: SliderWeight[] = Object.entries(sliderValues)
    .map(([dimension, value]) => {
      const weight = normalizeSliderValue(value);
      const instruction = mapWeightToInstruction(weight);
      return {
        dimension,
        weight,
        instruction
      };
    })
    .filter(w => Math.abs(w.weight) > 0.1) // Filter out near-neutral values
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)); // Sort by absolute weight

  return {
    primary: weights.slice(0, 3), // Top 3 strongest weights
    secondary: weights.slice(3)   // Remaining weights
  };
}

/**
 * Phase 1: Core Prompt Generation System
 * Assemble complete prompts with tone instructions and guardrails
 */
export function generatePrompt(
  originalText: string, 
  conflicts: ConflictResolution, 
  guardrails: Guardrails
): string {
  let prompt = 'You are an expert writing assistant specializing in tone adjustment. ';
  prompt += 'Your task is to rewrite the provided text according to the specified tone instructions while maintaining the original meaning and intent.\n\n';

  // Add tone instructions
  if (conflicts.primary.length > 0) {
    prompt += 'PRIMARY TONE INSTRUCTIONS (highest priority):\n';
    conflicts.primary.forEach(weight => {
      prompt += `- ${weight.dimension}: ${weight.instruction}\n`;
    });
    prompt += '\n';
  }

  if (conflicts.secondary.length > 0) {
    prompt += 'SECONDARY TONE ADJUSTMENTS (apply if compatible with primary):\n';
    conflicts.secondary.forEach(weight => {
      prompt += `- ${weight.dimension}: ${weight.instruction}\n`;
    });
    prompt += '\n';
  }

  // Add guardrails
  if (guardrails.required.length > 0) {
    prompt += 'REQUIRED WORDS/PHRASES (must remain unchanged):\n';
    prompt += guardrails.required.map(word => `- "${word}"`).join('\n');
    prompt += '\n\n';
  }

  if (guardrails.banned.length > 0) {
    prompt += 'BANNED WORDS/PHRASES (must not appear in output):\n';
    prompt += guardrails.banned.map(word => `- "${word}"`).join('\n');
    prompt += '\n\n';
  }

  // Add rewriting instructions
  prompt += 'REWRITING GUIDELINES:\n';
  prompt += '- Maintain the original meaning and factual content\n';
  prompt += '- Apply tone changes naturally and coherently\n';
  prompt += '- If instructions conflict, prioritize PRIMARY over SECONDARY\n';
  prompt += '- Ensure guardrails are strictly followed\n';
  prompt += '- Return only the rewritten text, no explanations\n\n';

  prompt += 'ORIGINAL TEXT TO REWRITE:\n';
  prompt += `"${originalText}"\n\n`;

  prompt += 'REWRITTEN TEXT:';

  return prompt;
}

/**
 * Phase 1: Guardrail Enforcement System (Stage 2: Post-Processing Verification)
 * Verify that the output complies with guardrails
 */
export function validateGuardrails(
  originalText: string,
  rewrittenText: string, 
  guardrails: Guardrails
): string[] {
  const violations: string[] = [];

  // Check required words
  guardrails.required.forEach(requiredWord => {
    const originalCount = (originalText.toLowerCase().match(new RegExp(requiredWord.toLowerCase(), 'g')) || []).length;
    const rewrittenCount = (rewrittenText.toLowerCase().match(new RegExp(requiredWord.toLowerCase(), 'g')) || []).length;
    
    if (originalCount > 0 && rewrittenCount === 0) {
      violations.push(`Required word/phrase "${requiredWord}" was removed`);
    }
  });

  // Check banned words
  guardrails.banned.forEach(bannedWord => {
    const regex = new RegExp(bannedWord.toLowerCase(), 'gi');
    if (regex.test(rewrittenText.toLowerCase())) {
      violations.push(`Banned word/phrase "${bannedWord}" appears in output`);
    }
  });

  return violations;
}

/**
 * Phase 2: Request Deduplication Cache Key Generation
 * Generate unique cache keys for identical requests
 */
export function generateCacheKey(request: RewriteRequest): string {
  const { originalText, sliderValues, guardrails, model = 'gpt-3.5-turbo' } = request;
  
  const keyObject = {
    text: originalText.trim().toLowerCase(),
    sliders: Object.keys(sliderValues)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = sliderValues[key];
        return sorted;
      }, {} as Record<string, number>),
    guardrails: {
      required: [...guardrails.required].sort(),
      banned: [...guardrails.banned].sort()
    },
    model
  };

  return Buffer.from(JSON.stringify(keyObject)).toString('base64');
}

/**
 * Main Rewrite Engine
 * Orchestrates the complete rewriting process
 */
export class RewriteEngine {
  /**
   * Process a rewrite request through the complete pipeline
   */
  async processRequest(request: RewriteRequest): Promise<{
    prompt: string;
    conflicts: ConflictResolution;
    cacheKey: string;
    guardrailViolations?: string[];
  }> {
    const startTime = Date.now();

    try {
      // Phase 1: Normalize and resolve conflicts
      const conflicts = resolveSliderConflicts(request.sliderValues);
      
      // Phase 1: Generate prompt
      const prompt = generatePrompt(request.originalText, conflicts, request.guardrails);
      
      // Phase 2: Generate cache key
      const cacheKey = generateCacheKey(request);

      logger.info('Rewrite request processed', {
        originalTextLength: request.originalText.length,
        primaryInstructions: conflicts.primary.length,
        secondaryInstructions: conflicts.secondary.length,
        requiredWords: request.guardrails.required.length,
        bannedWords: request.guardrails.banned.length,
        processingTime: Date.now() - startTime
      });

      return {
        prompt,
        conflicts,
        cacheKey
      };

    } catch (error) {
      logger.error('Error processing rewrite request', { error, request });
      throw error;
    }
  }

  /**
   * Validate rewritten text against original request
   */
  validateOutput(
    originalText: string,
    rewrittenText: string,
    guardrails: Guardrails
  ): string[] {
    return validateGuardrails(originalText, rewrittenText, guardrails);
  }

  /**
   * Calculate processing metrics
   */
  calculateMetrics(request: RewriteRequest, response: string, processingTime: number) {
    const originalWords = request.originalText.split(/\s+/).length;
    const rewrittenWords = response.split(/\s+/).length;
    const estimatedTokens = Math.ceil((request.originalText.length + response.length) / 4);

    return {
      originalWords,
      rewrittenWords,
      wordChangeRatio: rewrittenWords / originalWords,
      estimatedTokens,
      processingTime
    };
  }
}

// Export singleton instance
export const rewriteEngine = new RewriteEngine();
