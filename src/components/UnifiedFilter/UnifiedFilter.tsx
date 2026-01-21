// ============================================================================
// UNIFIED FILTER COMPONENT
// ============================================================================
// Main wrapper component that combines Command Palette and Filter Panel
// ============================================================================

import { type ReactNode } from 'react';
import { FilterProvider } from './FilterContext';
import { CommandPalette } from './CommandPalette';
import { FilterPanel } from './FilterPanel';
import type { FilterGroup } from './types';
import './styles.css';

// ----------------------------------------------------------------------------
// PROPS
// ----------------------------------------------------------------------------

interface UnifiedFilterProps {
    children?: ReactNode;
    onFiltersApplied?: (filters: FilterGroup) => void;
}

// ----------------------------------------------------------------------------
// FILTER TRIGGER BUTTON
// ----------------------------------------------------------------------------

interface FilterTriggerButtonProps {
    onClick: () => void;
    filterCount?: number;
}

export function FilterTriggerButton({ onClick, filterCount = 0 }: FilterTriggerButtonProps) {
    return (
        <button
            onClick={onClick}
            className="filter-trigger-btn"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'var(--filter-bg-primary, #fff)',
                border: '1px solid var(--filter-border, #e2e8f0)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--filter-text-primary, #0f172a)',
                transition: 'all 0.15s',
            }}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {filterCount > 0 && (
                <span
                    style={{
                        background: 'var(--filter-accent, #6366f1)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 10,
                    }}
                >
                    {filterCount}
                </span>
            )}
            <span
                style={{
                    marginLeft: 4,
                    padding: '2px 6px',
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'var(--filter-bg-tertiary, #f1f5f9)',
                    borderRadius: 4,
                    color: 'var(--filter-text-muted, #94a3b8)',
                }}
            >
                ⌘K
            </span>
        </button>
    );
}

// ----------------------------------------------------------------------------
// APPLIED FILTERS BAR
// ----------------------------------------------------------------------------

interface AppliedFiltersBarProps {
    filters: FilterGroup;
    onRemoveFilter: (conditionId: string) => void;
    onClearAll: () => void;
    onEditFilters: () => void;
}

export function AppliedFiltersBar({
    filters,
    onRemoveFilter,
    onClearAll,
    onEditFilters,
}: AppliedFiltersBarProps) {
    if (filters.conditions.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'var(--filter-bg-secondary, #f8fafc)',
                borderRadius: 8,
                flexWrap: 'wrap',
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--filter-text-muted, #94a3b8)',
                }}
            >
                Filters:
            </span>

            {filters.conditions.slice(0, 5).map((condition) => {
                if ('conditions' in condition) {
                    return (
                        <span
                            key={condition.id}
                            style={{
                                padding: '4px 8px',
                                background: 'var(--filter-accent-light, #eef2ff)',
                                color: 'var(--filter-accent, #6366f1)',
                                borderRadius: 16,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            Group ({condition.conditions.length})
                        </span>
                    );
                }

                return (
                    <span
                        key={condition.id}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            background: 'var(--filter-accent-light, #eef2ff)',
                            color: 'var(--filter-accent, #6366f1)',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        {condition.attributeId}: {String(condition.value || '...')}
                        <button
                            onClick={() => onRemoveFilter(condition.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                marginLeft: 2,
                                color: 'inherit',
                                fontSize: 14,
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </span>
                );
            })}

            {filters.conditions.length > 5 && (
                <span
                    style={{
                        fontSize: 12,
                        color: 'var(--filter-text-secondary, #64748b)',
                    }}
                >
                    +{filters.conditions.length - 5} more
                </span>
            )}

            <button
                onClick={onEditFilters}
                style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--filter-accent, #6366f1)',
                }}
            >
                Edit
            </button>

            <button
                onClick={onClearAll}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--filter-text-muted, #94a3b8)',
                }}
            >
                Clear all
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------

export function UnifiedFilter({ children, onFiltersApplied }: UnifiedFilterProps) {
    return (
        <FilterProvider onFiltersApplied={onFiltersApplied}>
            <div className="unified-filter">
                {children}
                <CommandPalette />
                <FilterPanel />
            </div>
        </FilterProvider>
    );
}

// ----------------------------------------------------------------------------
// HOOK FOR EXTERNAL USAGE
// ----------------------------------------------------------------------------

export { useFilter } from './FilterContext';
