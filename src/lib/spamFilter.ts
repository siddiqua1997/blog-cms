/**
 * Spam Filter for Comments
 *
 * Rule-based spam detection system for blog comments.
 * Designed for future AI integration (GPT, Claude, etc.)
 *
 * Strategy:
 * 1. Quick rule-based checks (fast, free)
 * 2. If passes rules, mark as PENDING for review
 * 3. If fails rules, mark as SPAM
 * 4. Future: Add AI-based scoring for borderline cases
 */

import { CommentStatus } from '@prisma/client';

/**
 * Spam detection result
 */
export interface SpamCheckResult {
  status: CommentStatus;
  score: number; // 0 = definitely not spam, 1 = definitely spam
  reasons: string[]; // Human-readable reasons for the score
  flagged: boolean; // Whether the comment was flagged for review
}

/**
 * Comment data for spam checking
 */
export interface CommentData {
  name: string;
  email?: string | null;
  content: string;
  ipAddress?: string;
}

/**
 * Configuration for spam detection
 */
export interface SpamFilterConfig {
  maxLinks?: number; // Max number of links allowed (default: 2)
  minContentLength?: number; // Minimum content length (default: 10)
  maxContentLength?: number; // Maximum content length (default: 2000)
}

// Common spam keywords and patterns
// These are weighted by severity
const SPAM_PATTERNS = {
  // High severity - immediate spam flag
  high: [
    /\b(viagra|cialis|casino|lottery|jackpot|prize\s+winner)\b/i,
    /\b(buy\s+now|order\s+now|limited\s+offer|act\s+now|don't\s+miss)\b/i,
    /\b(click\s+here|visit\s+my\s+(site|website|blog))\b/i,
    /\b(free\s+(money|gift|trial|offer)|earn\s+(cash|money))\b/i,
    /\b(cryptocurrency|bitcoin\s+investment|crypto\s+gains)\b/i,
    /\b(weight\s+loss|lose\s+\d+\s*(pounds?|kg|lbs?))\b/i,
    /\b(work\s+from\s+home|make\s+\$?\d+\s*(per|a)\s*(day|week|hour))\b/i,
  ],

  // Medium severity - increases spam score
  medium: [
    /\b(cheap|discount|promo|sale|deal)\b/i,
    /\b(subscribe|follow\s+me|check\s+out)\b/i,
    /(.)\1{4,}/, // Repeated characters (4+)
    /!!!+|[?!]{3,}/, // Excessive punctuation
  ],

  // Low severity - slight increase
  low: [
    /\b(amazing|incredible|unbelievable|best\s+ever)\b/i,
    /^(great|nice|good|awesome)\s*(post|article|blog)?\s*[!.]*$/i, // Generic low-effort comments
  ],
};

// URL pattern for detecting links
const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+|\[url\]|\[link\]/gi;

// Email pattern for validation
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Suspicious email domains (disposable email services)
const SUSPICIOUS_EMAIL_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'mailinator.com',
  'yopmail.com',
];

/**
 * Check a comment for spam
 *
 * @param comment - Comment data to check
 * @param config - Optional configuration
 * @returns SpamCheckResult with status and reasoning
 */
export function checkSpam(
  comment: CommentData,
  config: SpamFilterConfig = {}
): SpamCheckResult {
  const {
    maxLinks = 2,
    minContentLength = 10,
    maxContentLength = 2000,
  } = config;

  const reasons: string[] = [];
  let score = 0;

  const content = comment.content.trim();
  const name = comment.name.trim();

  // Check content length
  if (content.length < minContentLength) {
    reasons.push('Comment too short');
    score += 0.3;
  }

  if (content.length > maxContentLength) {
    reasons.push('Comment exceeds maximum length');
    score += 0.5;
  }

  // Check for excessive links
  const links = content.match(URL_PATTERN) || [];
  if (links.length > maxLinks) {
    reasons.push(`Too many links (${links.length})`);
    score += 0.4 + links.length * 0.1;
  }

  // Check for spam patterns - high severity
  for (const pattern of SPAM_PATTERNS.high) {
    if (pattern.test(content) || pattern.test(name)) {
      reasons.push('Contains spam keywords');
      score += 0.6;
      break; // One match is enough for high severity
    }
  }

  // Check for spam patterns - medium severity
  let mediumMatches = 0;
  for (const pattern of SPAM_PATTERNS.medium) {
    if (pattern.test(content)) {
      mediumMatches++;
    }
  }
  if (mediumMatches > 0) {
    reasons.push('Contains suspicious patterns');
    score += mediumMatches * 0.15;
  }

  // Check for spam patterns - low severity
  let lowMatches = 0;
  for (const pattern of SPAM_PATTERNS.low) {
    if (pattern.test(content)) {
      lowMatches++;
    }
  }
  if (lowMatches > 0) {
    score += lowMatches * 0.05;
  }

  // Check email if provided
  if (comment.email) {
    const email = comment.email.toLowerCase();

    // Validate email format
    if (!EMAIL_PATTERN.test(email)) {
      reasons.push('Invalid email format');
      score += 0.2;
    }

    // Check for suspicious domains
    const domain = email.split('@')[1];
    if (SUSPICIOUS_EMAIL_DOMAINS.includes(domain)) {
      reasons.push('Disposable email detected');
      score += 0.3;
    }
  }

  // Check for all caps content
  const upperRatio =
    (content.match(/[A-Z]/g)?.length || 0) /
    (content.match(/[a-zA-Z]/g)?.length || 1);
  if (upperRatio > 0.7 && content.length > 20) {
    reasons.push('Excessive use of capital letters');
    score += 0.2;
  }

  // Check name for spam patterns
  if (URL_PATTERN.test(name)) {
    reasons.push('URL in name');
    score += 0.5;
  }

  // Normalize score to 0-1 range
  score = Math.min(1, Math.max(0, score));

  // Determine status based on score
  let status: CommentStatus;
  if (score >= 0.7) {
    status = 'SPAM';
  } else {
    status = 'PENDING';
  }

  return {
    status,
    score,
    reasons,
    flagged: score >= 0.7,
  };
}

/**
 * Sanitize comment content
 *
 * Removes potentially dangerous content while preserving legitimate text.
 * Run this AFTER spam check but BEFORE storing.
 */
export function sanitizeComment(content: string): string {
  return content
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove other HTML tags
    .replace(/<[^>]+>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Future: AI-based spam detection interface
 *
 * This interface allows plugging in AI-based spam detection services.
 * Implement this interface to add GPT, Claude, or custom ML models.
 */
export interface AISpamDetector {
  /**
   * Check if content is spam using AI
   * @param content - Text content to analyze
   * @returns Promise with spam probability (0-1) and reasoning
   */
  analyze(content: string): Promise<{
    isSpam: boolean;
    confidence: number;
    reasoning?: string;
  }>;
}

/**
 * Enhanced spam check with AI integration (placeholder)
 *
 * Use this when you have an AI spam detector configured:
 *
 * ```ts
 * const result = await checkSpamWithAI(comment, {
 *   aiDetector: myGPTDetector,
 *   aiThreshold: 0.7,
 * });
 * ```
 */
export async function checkSpamWithAI(
  comment: CommentData,
  options: {
    aiDetector?: AISpamDetector;
    aiThreshold?: number;
    config?: SpamFilterConfig;
  } = {}
): Promise<SpamCheckResult> {
  const { aiDetector, aiThreshold = 0.7, config } = options;

  // First, run rule-based checks
  const ruleResult = checkSpam(comment, config);

  // If clearly spam or clearly not spam by rules, skip AI
  if (ruleResult.score >= 0.8 || ruleResult.score <= 0.1) {
    return ruleResult;
  }

  // If AI detector is configured, use it for borderline cases
  if (aiDetector) {
    try {
      const aiResult = await aiDetector.analyze(comment.content);

      // Combine rule-based and AI scores
      const combinedScore = ruleResult.score * 0.4 + aiResult.confidence * 0.6;

      return {
        status: combinedScore >= aiThreshold ? 'SPAM' : 'PENDING',
        score: combinedScore,
        reasons: [
          ...ruleResult.reasons,
          aiResult.reasoning
            ? `AI: ${aiResult.reasoning}`
            : `AI confidence: ${aiResult.confidence}`,
        ],
        flagged: combinedScore >= aiThreshold,
      };
    } catch (error) {
      console.error('AI spam detection failed:', error);
      // Fall back to rule-based result
    }
  }

  return ruleResult;
}
