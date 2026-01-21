// ============================================================================
// UNIFIED FILTER SYSTEM - REACT CONTEXT
// ============================================================================
// This file provides the global filter state and actions via React Context.
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
    FilterContextValue,
    FilterGroup,
    FilterCondition,
    SavedFilter,
    NLPParseResult,
    ParsedCondition,
    OperatorKey,
} from './types';
import { FILTER_FAMILIES, SLASH_COMMANDS, getAttributeById } from './filterConfig';

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyFilterGroup(): FilterGroup {
    return {
        id: generateId(),
        logic: 'AND',
        conditions: [],
    };
}

// Simple NLP parsing (mock implementation for demo)
function parseNaturalLanguageQuery(query: string): NLPParseResult {
    const normalizedQuery = query.toLowerCase();
    const conditions: ParsedCondition[] = [];

    // Sentiment detection
    if (normalizedQuery.includes('negative')) {
        conditions.push({
            attributeId: 'sentiment',
            attributeName: 'Sentiment',
            operator: 'is',
            operatorLabel: 'is',
            value: 'negative',
            valueLabel: 'Negative',
            confidence: 0.95,
        });
    } else if (normalizedQuery.includes('positive')) {
        conditions.push({
            attributeId: 'sentiment',
            attributeName: 'Sentiment',
            operator: 'is',
            operatorLabel: 'is',
            value: 'positive',
            valueLabel: 'Positive',
            confidence: 0.95,
        });
    } else if (normalizedQuery.includes('neutral')) {
        conditions.push({
            attributeId: 'sentiment',
            attributeName: 'Sentiment',
            operator: 'is',
            operatorLabel: 'is',
            value: 'neutral',
            valueLabel: 'Neutral',
            confidence: 0.95,
        });
    }

    // Status detection
    if (normalizedQuery.includes('open')) {
        conditions.push({
            attributeId: 'ticket_status',
            attributeName: 'Ticket Status',
            operator: 'is',
            operatorLabel: 'is',
            value: 'open',
            valueLabel: 'Open',
            confidence: 0.9,
        });
    } else if (normalizedQuery.includes('closed')) {
        conditions.push({
            attributeId: 'ticket_status',
            attributeName: 'Ticket Status',
            operator: 'is',
            operatorLabel: 'is',
            value: 'closed',
            valueLabel: 'Closed',
            confidence: 0.9,
        });
    } else if (normalizedQuery.includes('pending')) {
        conditions.push({
            attributeId: 'ticket_status',
            attributeName: 'Ticket Status',
            operator: 'is',
            operatorLabel: 'is',
            value: 'pending',
            valueLabel: 'Pending',
            confidence: 0.9,
        });
    }

    // Priority detection
    if (normalizedQuery.includes('critical')) {
        conditions.push({
            attributeId: 'priority',
            attributeName: 'Priority',
            operator: 'is',
            operatorLabel: 'is',
            value: 'critical',
            valueLabel: 'Critical',
            confidence: 0.9,
        });
    } else if (normalizedQuery.includes('high priority') || normalizedQuery.includes('high-priority')) {
        conditions.push({
            attributeId: 'priority',
            attributeName: 'Priority',
            operator: 'is',
            operatorLabel: 'is',
            value: 'high',
            valueLabel: 'High',
            confidence: 0.9,
        });
    }

    // Assignment detection
    if (normalizedQuery.includes('assigned to me') || normalizedQuery.includes('my tickets')) {
        conditions.push({
            attributeId: 'assigned_to',
            attributeName: 'Assigned To',
            operator: 'is_current_user',
            operatorLabel: 'is me',
            value: null,
            valueLabel: 'Me',
            confidence: 0.85,
        });
    } else if (normalizedQuery.includes('unassigned')) {
        conditions.push({
            attributeId: 'assigned_to',
            attributeName: 'Assigned To',
            operator: 'is_unassigned',
            operatorLabel: 'is unassigned',
            value: null,
            valueLabel: 'Unassigned',
            confidence: 0.9,
        });
    }

    // Date detection
    if (normalizedQuery.includes('today')) {
        conditions.push({
            attributeId: 'created_date',
            attributeName: 'Created Date',
            operator: 'is_relative',
            operatorLabel: 'is in the last',
            value: { type: 'relative', amount: 0, unit: 'days' },
            valueLabel: 'Today',
            confidence: 0.85,
        });
    } else if (normalizedQuery.includes('yesterday')) {
        conditions.push({
            attributeId: 'created_date',
            attributeName: 'Created Date',
            operator: 'is_relative',
            operatorLabel: 'is in the last',
            value: { type: 'relative', amount: 1, unit: 'days' },
            valueLabel: 'Yesterday',
            confidence: 0.85,
        });
    } else if (normalizedQuery.includes('last week') || normalizedQuery.includes('last 7 days')) {
        conditions.push({
            attributeId: 'created_date',
            attributeName: 'Created Date',
            operator: 'is_relative',
            operatorLabel: 'is in the last',
            value: { type: 'relative', amount: 7, unit: 'days' },
            valueLabel: 'Last 7 days',
            confidence: 0.85,
        });
    }

    // Channel detection
    if (normalizedQuery.includes('twitter') || normalizedQuery.includes('x.com')) {
        conditions.push({
            attributeId: 'channel',
            attributeName: 'Channel',
            operator: 'contains_any',
            operatorLabel: 'contains any of',
            value: ['twitter'],
            valueLabel: 'Twitter',
            confidence: 0.9,
        });
    } else if (normalizedQuery.includes('facebook')) {
        conditions.push({
            attributeId: 'channel',
            attributeName: 'Channel',
            operator: 'contains_any',
            operatorLabel: 'contains any of',
            value: ['facebook'],
            valueLabel: 'Facebook',
            confidence: 0.9,
        });
    } else if (normalizedQuery.includes('instagram')) {
        conditions.push({
            attributeId: 'channel',
            attributeName: 'Channel',
            operator: 'contains_any',
            operatorLabel: 'contains any of',
            value: ['instagram'],
            valueLabel: 'Instagram',
            confidence: 0.9,
        });
    }

    // Keyword extraction (simple approach - look for quoted strings or "about" phrases)
    const quotedMatch = query.match(/"([^"]+)"/);
    const aboutMatch = query.match(/about\s+(\w+)/i);

    if (quotedMatch) {
        conditions.push({
            attributeId: 'keyword',
            attributeName: 'Keyword',
            operator: 'contains',
            operatorLabel: 'contains',
            value: quotedMatch[1],
            valueLabel: `"${quotedMatch[1]}"`,
            confidence: 0.95,
        });
    } else if (aboutMatch) {
        conditions.push({
            attributeId: 'keyword',
            attributeName: 'Keyword',
            operator: 'contains',
            operatorLabel: 'contains',
            value: aboutMatch[1],
            valueLabel: `"${aboutMatch[1]}"`,
            confidence: 0.7,
        });
    }

    // SLA detection
    if (normalizedQuery.includes('sla breach') || normalizedQuery.includes('breached')) {
        conditions.push({
            attributeId: 'sla_breach',
            attributeName: 'SLA Breach',
            operator: 'is',
            operatorLabel: 'is',
            value: 'breached',
            valueLabel: 'Breached',
            confidence: 0.85,
        });
    }

    const overallConfidence = conditions.length > 0
        ? conditions.reduce((sum, c) => sum + c.confidence, 0) / conditions.length
        : 0;

    return {
        success: conditions.length > 0,
        confidence: overallConfidence,
        conditions,
        rawQuery: query,
        suggestions: conditions.length === 0
            ? ['Try using keywords like "negative", "open", "high priority", or channel names']
            : undefined,
    };
}

// Convert NLP result to FilterGroup
function nlpResultToFilterGroup(result: NLPParseResult): FilterGroup {
    const conditions: FilterCondition[] = result.conditions.map(parsed => ({
        id: generateId(),
        attributeId: parsed.attributeId,
        operator: parsed.operator,
        value: parsed.value,
    }));

    return {
        id: generateId(),
        logic: 'AND',
        conditions,
    };
}

// ----------------------------------------------------------------------------
// CONTEXT DEFINITION
// ----------------------------------------------------------------------------

const FilterContext = createContext<FilterContextValue | null>(null);

// ----------------------------------------------------------------------------
// PROVIDER COMPONENT
// ----------------------------------------------------------------------------

interface FilterProviderProps {
    children: ReactNode;
    onFiltersApplied?: (filters: FilterGroup) => void;
}

export function FilterProvider({ children, onFiltersApplied }: FilterProviderProps) {
    // UI State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [activeFilters, setActiveFilters] = useState<FilterGroup>(createEmptyFilterGroup);
    const [recentFilters, setRecentFilters] = useState<SavedFilter[]>([]);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

    // Load saved filters from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('unified-filter-saved');
            if (stored) {
                setSavedFilters(JSON.parse(stored));
            }
            const storedRecent = localStorage.getItem('unified-filter-recent');
            if (storedRecent) {
                setRecentFilters(JSON.parse(storedRecent));
            }
        } catch (e) {
            console.error('Failed to load saved filters:', e);
        }
    }, []);

    // Save filters to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('unified-filter-saved', JSON.stringify(savedFilters));
        } catch (e) {
            console.error('Failed to save filters:', e);
        }
    }, [savedFilters]);

    useEffect(() => {
        try {
            localStorage.setItem('unified-filter-recent', JSON.stringify(recentFilters));
        } catch (e) {
            console.error('Failed to save recent filters:', e);
        }
    }, [recentFilters]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K to open command palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }

            // Cmd/Ctrl + Shift + F to open filter panel
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
                e.preventDefault();
                setIsPanelOpen(prev => !prev);
                setIsCommandPaletteOpen(false);
            }

            // Escape to close
            if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
                setIsPanelOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // UI Actions
    const openCommandPalette = useCallback(() => {
        setIsCommandPaletteOpen(true);
        setSearchQuery('');
    }, []);

    const closeCommandPalette = useCallback(() => {
        setIsCommandPaletteOpen(false);
        setSearchQuery('');
    }, []);

    const openPanel = useCallback(() => {
        setIsPanelOpen(true);
        setIsCommandPaletteOpen(false);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
    }, []);

    // Filter Actions
    const addCondition = useCallback((attributeId: string) => {
        const attribute = getAttributeById(attributeId);
        if (!attribute) return;

        const newCondition: FilterCondition = {
            id: generateId(),
            attributeId,
            operator: attribute.defaultOperator.key,
            value: null,
        };

        setActiveFilters(prev => ({
            ...prev,
            conditions: [...prev.conditions, newCondition],
        }));
    }, []);

    const updateCondition = useCallback((conditionId: string, updates: Partial<FilterCondition>) => {
        setActiveFilters(prev => {
            const updateInGroup = (group: FilterGroup): FilterGroup => ({
                ...group,
                conditions: group.conditions.map(item => {
                    if ('conditions' in item) {
                        return updateInGroup(item);
                    }
                    if (item.id === conditionId) {
                        return { ...item, ...updates };
                    }
                    return item;
                }),
            });
            return updateInGroup(prev);
        });
    }, []);

    const removeCondition = useCallback((conditionId: string) => {
        setActiveFilters(prev => {
            const removeFromGroup = (group: FilterGroup): FilterGroup => ({
                ...group,
                conditions: group.conditions
                    .filter(item => item.id !== conditionId)
                    .map(item => ('conditions' in item ? removeFromGroup(item) : item)),
            });
            return removeFromGroup(prev);
        });
    }, []);

    const addGroup = useCallback((parentGroupId?: string) => {
        const newGroup: FilterGroup = {
            id: generateId(),
            logic: 'AND',
            conditions: [],
        };

        if (!parentGroupId) {
            setActiveFilters(prev => ({
                ...prev,
                conditions: [...prev.conditions, newGroup],
            }));
        } else {
            setActiveFilters(prev => {
                const addToGroup = (group: FilterGroup): FilterGroup => {
                    if (group.id === parentGroupId) {
                        return {
                            ...group,
                            conditions: [...group.conditions, newGroup],
                        };
                    }
                    return {
                        ...group,
                        conditions: group.conditions.map(item =>
                            'conditions' in item ? addToGroup(item) : item
                        ),
                    };
                };
                return addToGroup(prev);
            });
        }
    }, []);

    const toggleGroupLogic = useCallback((groupId: string) => {
        setActiveFilters(prev => {
            const toggleInGroup = (group: FilterGroup): FilterGroup => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        logic: group.logic === 'AND' ? 'OR' : 'AND',
                    };
                }
                return {
                    ...group,
                    conditions: group.conditions.map(item =>
                        'conditions' in item ? toggleInGroup(item) : item
                    ),
                };
            };
            return toggleInGroup(prev);
        });
    }, []);

    // Apply/Save Actions
    const applyFilters = useCallback(() => {
        onFiltersApplied?.(activeFilters);

        // Add to recent filters if there are conditions
        if (activeFilters.conditions.length > 0) {
            const recentEntry: SavedFilter = {
                id: generateId(),
                name: 'Recent Filter',
                filter: activeFilters,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isQuickFilter: false,
            };

            setRecentFilters(prev => {
                const updated = [recentEntry, ...prev.slice(0, 4)];
                return updated;
            });
        }

        closeCommandPalette();
        closePanel();
    }, [activeFilters, onFiltersApplied, closeCommandPalette, closePanel]);

    const clearFilters = useCallback(() => {
        setActiveFilters(createEmptyFilterGroup());
    }, []);

    const saveFilter = useCallback((name: string, description?: string) => {
        const newFilter: SavedFilter = {
            id: generateId(),
            name,
            description,
            filter: activeFilters,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isQuickFilter: false,
        };

        setSavedFilters(prev => [...prev, newFilter]);
    }, [activeFilters]);

    const loadFilter = useCallback((filterId: string) => {
        const filter = savedFilters.find(f => f.id === filterId) ||
            recentFilters.find(f => f.id === filterId);
        if (filter) {
            setActiveFilters(filter.filter);
        }
    }, [savedFilters, recentFilters]);

    const deleteFilter = useCallback((filterId: string) => {
        setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    }, []);

    // NLP Actions
    const parseNaturalLanguage = useCallback((query: string): NLPParseResult => {
        return parseNaturalLanguageQuery(query);
    }, []);

    const applyNLPResult = useCallback((result: NLPParseResult) => {
        const filterGroup = nlpResultToFilterGroup(result);
        setActiveFilters(filterGroup);
    }, []);

    // Context Value
    const value: FilterContextValue = {
        // UI State
        isCommandPaletteOpen,
        isPanelOpen,
        searchQuery,

        // Filter State
        activeFilters,
        recentFilters,
        savedFilters,

        // Configuration
        filterFamilies: FILTER_FAMILIES,
        slashCommands: SLASH_COMMANDS,

        // UI Actions
        openCommandPalette,
        closeCommandPalette,
        openPanel,
        closePanel,
        setSearchQuery,

        // Filter Actions
        addCondition,
        updateCondition,
        removeCondition,
        addGroup,
        toggleGroupLogic,

        // Apply/Save Actions
        applyFilters,
        clearFilters,
        saveFilter,
        loadFilter,
        deleteFilter,

        // NLP
        parseNaturalLanguage,
        applyNLPResult,
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

// ----------------------------------------------------------------------------
// HOOK
// ----------------------------------------------------------------------------

export function useFilter(): FilterContextValue {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
}

export { FilterContext };
