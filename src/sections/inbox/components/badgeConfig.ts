import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Building2,
  Target,
  Heart,
  MessageSquare,
  Tag,
  Folder,
  Hash,
  Calendar,
  Mail,
  Bell,
  BarChart3,
  Zap,
  Moon,
  type LucideIcon,
} from 'lucide-react'

export interface BadgeVariantConfig {
  icon: string // Emoji
  lucide: LucideIcon // Lucide icon component
  description: string
}

export interface BadgeTypeConfig {
  [key: string]: BadgeVariantConfig
}

export const BADGE_CONFIG: Record<string, BadgeTypeConfig | BadgeVariantConfig> = {
  // AI Classifications
  sentiment: {
    positive: {
      icon: '😊',
      lucide: TrendingUp,
      description: 'Customer is satisfied with the interaction',
    },
    negative: {
      icon: '😞',
      lucide: TrendingDown,
      description: 'Customer is dissatisfied with the interaction',
    },
    neutral: {
      icon: '😐',
      lucide: Minus,
      description: 'Customer sentiment is neutral',
    },
  },
  entity: {
    default: {
      icon: '🏢',
      lucide: Building2,
      description: 'The primary entity or subject being discussed',
    },
  },
  intent: {
    default: {
      icon: '🎯',
      lucide: Target,
      description: "The customer's intended outcome or purpose",
    },
  },
  emotion: {
    default: {
      icon: '❤️',
      lucide: Heart,
      description: "The customer's emotional state",
    },
  },

  // Categories & Aspects
  category: {
    default: {
      icon: '🏷️',
      lucide: Tag,
      description: 'Primary classification category',
    },
  },
  aspects: {
    default: {
      icon: '🔖',
      lucide: Hash,
      description: 'Individual aspects mentioned',
    },
  },
  aspectGroups: {
    default: {
      icon: '📁',
      lucide: Folder,
      description: 'Grouped aspects for better organization',
    },
  },

  // Special Element
  signalSense: {
    default: {
      icon: '🔔',
      lucide: Bell,
      description: 'AI-powered signals detected in this conversation',
    },
  },

  // Essentials
  essentials: {
    customerName: {
      default: {
        icon: '👤',
        lucide: User,
        description: 'Customer name',
      },
    },
    avatar: {
      default: {
        icon: '🖼️',
        lucide: User,
        description: 'Customer avatar',
      },
    },
    handleAndFollowers: {
      default: {
        icon: '📊',
        lucide: BarChart3,
        description: 'Social media handle and follower count',
      },
    },
    platformAndType: {
      default: {
        icon: '💬',
        lucide: MessageSquare,
        description: 'Platform and conversation type',
      },
    },
    timestamp: {
      default: {
        icon: '📅',
        lucide: Calendar,
        description: 'When the message was sent',
      },
    },
    messageSnippet: {
      default: {
        icon: '✉️',
        lucide: Mail,
        description: 'Preview of the message content',
      },
    },
    messageCount: {
      default: {
        icon: '💬',
        lucide: MessageSquare,
        description: 'Total number of messages in conversation',
      },
    },
    priorityBadge: {
      high: {
        icon: '⚠️',
        lucide: AlertCircle,
        description: 'High priority - urgent attention needed',
      },
      medium: {
        icon: '⚡',
        lucide: Zap,
        description: 'Medium priority - moderate attention needed',
      },
      low: {
        icon: '💤',
        lucide: Moon,
        description: 'Low priority - can be addressed later',
      },
      default: {
        icon: '📌',
        lucide: Hash,
        description: 'Priority level',
      },
    },
    slaStatus: {
      'at-risk': {
        icon: '⏱️',
        lucide: Clock,
        description: 'SLA is at risk - approaching deadline',
      },
      breached: {
        icon: '🔴',
        lucide: AlertCircle,
        description: 'SLA breached - deadline exceeded',
      },
      'on-track': {
        icon: '✅',
        lucide: CheckCircle2,
        description: 'SLA on track - within target time',
      },
      default: {
        icon: '⏰',
        lucide: Clock,
        description: 'SLA status',
      },
    },
    unreadCount: {
      default: {
        icon: '🔔',
        lucide: Bell,
        description: 'Number of unread messages',
      },
    },
  },
}

/**
 * Get badge configuration for a given badge ID and value
 */
export function getBadgeConfig(
  badgeId: string,
  value?: string
): BadgeVariantConfig | undefined {
  // Handle essentials badges (e.g., "essentials.priorityBadge")
  if (badgeId.startsWith('essentials.')) {
    const essentialType = badgeId.replace('essentials.', '')
    const essentialConfig = BADGE_CONFIG.essentials?.[essentialType]

    if (!essentialConfig) return undefined

    // Check if this is a flat config (has icon/lucide/description directly)
    if ('icon' in essentialConfig && 'lucide' in essentialConfig && 'description' in essentialConfig) {
      return essentialConfig as BadgeVariantConfig
    }

    // Otherwise it's a variant config - look up the value
    const variants = essentialConfig as BadgeTypeConfig
    if (!value) {
      // No value provided - try to get default or first variant
      return variants.default || Object.values(variants)[0]
    }

    // Normalize value to match variant keys (lowercase with hyphens)
    const normalizedValue = value.toLowerCase().replace(/\s+/g, '-')
    return variants[normalizedValue] || variants[value.toLowerCase()] || variants[value] || variants.default
  }

  // Handle top-level badges
  const config = BADGE_CONFIG[badgeId]
  if (!config) return undefined

  // Check if this is a flat config (has icon/lucide/description directly)
  if ('icon' in config && 'lucide' in config && 'description' in config) {
    return config as BadgeVariantConfig
  }

  // Otherwise it's a variant config - look up the value
  const variants = config as BadgeTypeConfig
  if (!value) {
    // No value provided - try to get default or first variant
    return variants.default || Object.values(variants)[0]
  }

  // Normalize value to match variant keys (lowercase with hyphens)
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-')
  return variants[normalizedValue] || variants[value.toLowerCase()] || variants[value] || variants.default
}

/**
 * Get human-readable label for a badge ID
 */
export function getBadgeLabel(badgeId: string): string {
  const labels: Record<string, string> = {
    sentiment: 'Sentiment',
    entity: 'Entity Type',
    intent: 'Intent',
    emotion: 'Emotion',
    category: 'Categories',
    aspects: 'Aspects',
    aspectGroups: 'Aspect Groups',
    signalSense: 'Signal Sense',
    'essentials.customerName': 'Customer Name',
    'essentials.avatar': 'Avatar',
    'essentials.handleAndFollowers': 'Handle & Followers',
    'essentials.platformAndType': 'Platform & Type',
    'essentials.timestamp': 'Timestamp',
    'essentials.messageSnippet': 'Message Snippet',
    'essentials.messageCount': 'Message Count',
    'essentials.priorityBadge': 'Priority',
    'essentials.slaStatus': 'SLA Status',
    'essentials.unreadCount': 'Unread Count',
  }

  return labels[badgeId] || badgeId
}
