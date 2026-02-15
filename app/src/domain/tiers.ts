/**
 * Elite tier system and feature gating
 *
 * Free tier: Basic performance tracking
 * Elite tier (€2-3/month): Advanced features, groups, history
 */

import type { UserTier, TierFeatures } from './types'

/**
 * Get tier features based on user's tier
 */
export function getTierFeatures(tier: UserTier): TierFeatures {
  if (tier === 'elite') {
    return {
      historyDays: 90, // 90-day trend graph
      canJoinGroups: true, // Private performance groups
      hasDetailedBreakdown: true, // Performance Index breakdown
      hasMonthlyReport: true, // Monthly performance report
    }
  }

  // Free tier
  return {
    historyDays: 7, // 1 week history only
    canJoinGroups: false, // No group access
    hasDetailedBreakdown: false, // Basic index only
    hasMonthlyReport: false, // No reports
  }
}

/**
 * Check if user has access to a specific feature
 */
export function hasAccess(tier: UserTier, feature: keyof TierFeatures): boolean {
  const features = getTierFeatures(tier)
  return Boolean(features[feature])
}

/**
 * Get tier display name
 */
export function getTierName(tier: UserTier): string {
  return tier === 'elite' ? 'Elite' : 'Free'
}

/**
 * Get tier price (monthly)
 */
export function getTierPrice(tier: UserTier): number {
  return tier === 'elite' ? 2.5 : 0
}

/**
 * Feature comparison for upgrade prompts
 */
export interface TierComparison {
  feature: string
  free: string | boolean
  elite: string | boolean
}

export function getTierComparison(): TierComparison[] {
  return [
    {
      feature: 'Performance Index',
      free: 'Basic (0-100)',
      elite: 'Full breakdown',
    },
    {
      feature: 'History',
      free: '7 days',
      elite: '90 days',
    },
    {
      feature: 'Performance Groups',
      free: false,
      elite: 'Up to 5 groups',
    },
    {
      feature: 'Monthly Report',
      free: false,
      elite: true,
    },
    {
      feature: 'Trend Analysis',
      free: 'Week-over-week',
      elite: 'Full 90-day trends',
    },
  ]
}

/**
 * Elite value proposition messages
 */
export function getEliteValueProp(): string[] {
  return [
    'Track 90 days of performance history',
    'Join private study groups (compare index only)',
    'See detailed Performance Index breakdown',
    'Monthly performance reports',
    '€2.50/month — Cancel anytime',
  ]
}
