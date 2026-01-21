import type { MessageInsights } from '../components/TicketHeader'

// All possible badge IDs (18 total)
export const BADGE_IDS = [
  'sentiment',
  'entity',
  'emotion',
  'intent',
  'category',
  'aspects',
  'aspectGroups',
  'reasonSurfaced',
  'essentials.customerName',
  'essentials.avatar',
  'essentials.handleAndFollowers',
  'essentials.platformAndType',
  'essentials.timestamp',
  'essentials.messageSnippet',
  'essentials.messageCount',
  'essentials.priorityBadge',
  'essentials.slaStatus',
  'essentials.unreadCount',
] as const

export type BadgeId = (typeof BADGE_IDS)[number]

/**
 * Default badge order prioritized by user value
 *
 * Order Philosophy:
 * - Actionable first: Priority, SLA, sentiment
 * - Context second: Entity, intent, emotion
 * - Details third: Categories, aspects
 * - Supporting last: Message metadata
 */
export const DEFAULT_BADGE_ORDER: BadgeId[] = [
  'sentiment', // 1. Immediate emotional context
  'essentials.priorityBadge', // 2. Action urgency
  'essentials.slaStatus', // 3. Time sensitivity
  'entity', // 4. What customer is talking about
  'intent', // 5. What customer wants
  'emotion', // 6. How customer feels
  'category', // 7. Classification
  'aspectGroups', // 8. Grouped details
  'aspects', // 9. Individual details
  'essentials.messageCount', // 10. Conversation depth
  'essentials.unreadCount', // 11. Action needed
  'reasonSurfaced', // 12. Why it's visible
  'essentials.customerName', // 13. Who
  'essentials.avatar', // 14. Visual ID
  'essentials.handleAndFollowers', // 15. Social context
  'essentials.platformAndType', // 16. Channel context
  'essentials.timestamp', // 17. When
  'essentials.messageSnippet', // 18. What they said
]

export interface EnabledBadges {
  [key: string]: boolean | string | number | null | undefined
}

/**
 * Get badges in user-defined order, filtered by which are enabled and have values
 *
 * @param badgeOrder - User's preferred badge order
 * @param enabledBadges - Object mapping badge IDs to their values (falsy = disabled)
 * @returns Array of badge IDs in render order
 */
export function getBadgeRenderOrder(
  badgeOrder: string[],
  enabledBadges: EnabledBadges
): string[] {
  return badgeOrder.filter((badgeId) => {
    const value = enabledBadges[badgeId]
    // Include badge if it has a truthy value or is explicitly true
    return value !== undefined && value !== null && value !== false && value !== ''
  })
}

/**
 * Initialize or migrate badgeOrder in MessageInsights state
 * Handles users upgrading from Phase 1 without badgeOrder
 *
 * @param messageInsights - Current MessageInsights state
 * @returns MessageInsights with badgeOrder initialized
 */
export function initializeBadgeOrder(
  messageInsights: MessageInsights
): MessageInsights {
  // If badgeOrder doesn't exist (old state), initialize it
  if (!messageInsights.badgeOrder) {
    return {
      ...messageInsights,
      badgeOrder: [...DEFAULT_BADGE_ORDER],
    }
  }

  // If badgeOrder exists but is missing new badges, append them
  const missingBadges = BADGE_IDS.filter(
    (id) => !messageInsights.badgeOrder!.includes(id)
  )

  if (missingBadges.length > 0) {
    return {
      ...messageInsights,
      badgeOrder: [...messageInsights.badgeOrder, ...missingBadges],
    }
  }

  return messageInsights
}

/**
 * Move a badge from one position to another in the order array
 *
 * @param order - Current badge order
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New order array with badge moved
 */
export function moveBadgeInOrder(
  order: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const newOrder = [...order]
  const [movedItem] = newOrder.splice(fromIndex, 1)
  newOrder.splice(toIndex, 0, movedItem)
  return newOrder
}

/**
 * Helper to reorder array (used by drag-and-drop)
 * More generic than moveBadgeInOrder
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array]
  const item = newArray.splice(from, 1)[0]
  newArray.splice(to, 0, item)
  return newArray
}

/**
 * Validate that a badge ID is valid
 */
export function isValidBadgeId(id: string): id is BadgeId {
  return BADGE_IDS.includes(id as BadgeId)
}

/**
 * Get section for a badge ID (for section-level select all)
 */
export function getBadgeSection(badgeId: string): string {
  if (badgeId.startsWith('essentials.')) return 'essentials'
  if (['sentiment', 'entity', 'emotion', 'intent'].includes(badgeId)) return 'ai'
  if (['category', 'aspects', 'aspectGroups'].includes(badgeId))
    return 'categories'
  if (badgeId === 'reasonSurfaced') return 'special'
  return 'unknown'
}

/**
 * Get all badge IDs for a given section
 */
export function getBadgesInSection(section: string): BadgeId[] {
  return BADGE_IDS.filter((id) => getBadgeSection(id) === section)
}
