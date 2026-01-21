import type { Categorization, Sentiment } from '@/../product/sections/inbox/types'

/**
 * Format a single categorization for display
 * Shows the full hierarchy with abbreviated parent paths
 * Examples:
 *   - "Delivery Issues" (1 level)
 *   - "OM > Delivery Issues" (2 levels)
 *   - "CS > OM > Delivery Issues" (3 levels)
 */
export function formatCategorization(cat: Categorization): string {
  const parts: string[] = []

  // Add category (abbreviated if there are subcategories)
  if (cat.category) {
    if (cat.subcategory || cat.subSubcategory) {
      // Abbreviate parent categories
      parts.push(abbreviateCategory(cat.category))
    } else {
      // Show full name if it's the only level
      parts.push(cat.category)
    }
  }

  // Add subcategory (abbreviated if there's a subSubcategory)
  if (cat.subcategory) {
    if (cat.subSubcategory) {
      parts.push(abbreviateCategory(cat.subcategory))
    } else {
      parts.push(cat.subcategory)
    }
  }

  // Always show the lowest level in full
  if (cat.subSubcategory) {
    parts.push(cat.subSubcategory)
  }

  return parts.join(' > ')
}

/**
 * Abbreviate a category name to initials or short form
 * Examples:
 *   - "Customer Service" -> "CS"
 *   - "Order Management" -> "OM"
 *   - "Product" -> "Prod"
 */
function abbreviateCategory(category: string): string {
  // Check for common multi-word categories
  const words = category.split(' ')

  if (words.length > 1) {
    // Use initials for multi-word categories
    return words.map(w => w[0].toUpperCase()).join('')
  }

  // For single-word categories, use first 3-4 chars if long enough
  if (category.length > 8) {
    return category.substring(0, 4)
  }

  return category
}

/**
 * Get sentiment color classes for a categorization badge
 * Handles both lowercase and capitalized sentiment values
 */
export function getCategoryColor(sentiment: Sentiment | string): string {
  const normalized = sentiment?.toLowerCase()
  switch (normalized) {
    case 'negative':
      return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    case 'positive':
      return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'neutral':
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

/**
 * Get border color for sentiment (for standalone borders)
 * Handles both lowercase and capitalized sentiment values
 */
export function getCategoryBorderColor(sentiment: Sentiment | string): string {
  const normalized = sentiment?.toLowerCase()
  switch (normalized) {
    case 'negative':
      return 'border-rose-300 dark:border-rose-700'
    case 'positive':
      return 'border-emerald-300 dark:border-emerald-700'
    case 'neutral':
    default:
      return 'border-slate-300 dark:border-slate-600'
  }
}
