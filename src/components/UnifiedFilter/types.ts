// ============================================================================
// UNIFIED FILTER SYSTEM - TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript types for the unified filter component.
// These types power the command palette, query builder, and filter panel.
// ============================================================================

// ----------------------------------------------------------------------------
// DATA TYPES - Determine operators and value input components
// ----------------------------------------------------------------------------

/**
 * Data types that define how a filter attribute behaves.
 * Each data type has associated operators and value input components.
 */
export type DataType =
    | 'SINGLE_SELECT'   // Pick one value from predefined list
    | 'MULTI_SELECT'    // Pick multiple values from predefined list
    | 'USER_PICKER'     // Select user(s) from workspace
    | 'TEAM_PICKER'     // Select team(s) from workspace
    | 'TEXT'            // Free text input
    | 'NUMBER'          // Numeric value
    | 'BOOLEAN'         // True/False toggle
    | 'DATE'            // Date or date range
    | 'HIERARCHICAL'    // Parent-child relationship (e.g., Category)
    | 'LOCATION'        // Location-based picker (Country → State → City)
    | 'TAG_PICKER';     // Select from dynamic tags

// ----------------------------------------------------------------------------
// OPERATORS - Define how values are matched
// ----------------------------------------------------------------------------

/**
 * All possible operator keys used in filter conditions.
 */
export type OperatorKey =
    // Equality operators
    | 'is'
    | 'is_not'
    | 'is_any_of'
    | 'is_none_of'
    // Text operators
    | 'contains'
    | 'not_contains'
    | 'contains_any'
    | 'contains_all'
    | 'starts_with'
    | 'ends_with'
    | 'matches_regex'
    // Number operators
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'greater_than_or_equal'
    | 'less_than_or_equal'
    | 'between'
    // Boolean operators
    | 'is_true'
    | 'is_false'
    // Date operators
    | 'is_before'
    | 'is_after'
    | 'is_between'
    | 'is_relative'
    // Existence operators
    | 'is_set'
    | 'is_not_set'
    // Special operators
    | 'is_current_user'
    | 'is_current_team'
    | 'is_unassigned'
    | 'is_under'; // For hierarchical (includes children)

/**
 * Operator definition with display label and value requirements.
 */
export interface Operator {
    key: OperatorKey;
    label: string;
    valueRequired: boolean;
    valueCount?: 1 | 2;  // 'between' needs 2 values
}

/**
 * Operators grouped by data type.
 */
export const OPERATORS_BY_TYPE: Record<DataType, Operator[]> = {
    SINGLE_SELECT: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'is_any_of', label: 'is any of', valueRequired: true },
        { key: 'is_none_of', label: 'is none of', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    MULTI_SELECT: [
        { key: 'contains_any', label: 'contains any of', valueRequired: true },
        { key: 'contains_all', label: 'contains all of', valueRequired: true },
        { key: 'not_contains', label: 'does not contain', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    USER_PICKER: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'is_any_of', label: 'is any of', valueRequired: true },
        { key: 'is_none_of', label: 'is none of', valueRequired: true },
        { key: 'is_current_user', label: 'is me', valueRequired: false },
        { key: 'is_unassigned', label: 'is unassigned', valueRequired: false },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    TEAM_PICKER: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'is_any_of', label: 'is any of', valueRequired: true },
        { key: 'is_current_team', label: 'is my team', valueRequired: false },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    TEXT: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'contains', label: 'contains', valueRequired: true },
        { key: 'not_contains', label: 'does not contain', valueRequired: true },
        { key: 'starts_with', label: 'starts with', valueRequired: true },
        { key: 'ends_with', label: 'ends with', valueRequired: true },
        { key: 'matches_regex', label: 'matches pattern', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    NUMBER: [
        { key: 'equals', label: '=', valueRequired: true, valueCount: 1 },
        { key: 'not_equals', label: '≠', valueRequired: true, valueCount: 1 },
        { key: 'greater_than', label: '>', valueRequired: true, valueCount: 1 },
        { key: 'less_than', label: '<', valueRequired: true, valueCount: 1 },
        { key: 'greater_than_or_equal', label: '≥', valueRequired: true, valueCount: 1 },
        { key: 'less_than_or_equal', label: '≤', valueRequired: true, valueCount: 1 },
        { key: 'between', label: 'is between', valueRequired: true, valueCount: 2 },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    BOOLEAN: [
        { key: 'is_true', label: 'is Yes', valueRequired: false },
        { key: 'is_false', label: 'is No', valueRequired: false },
    ],
    DATE: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_before', label: 'is before', valueRequired: true },
        { key: 'is_after', label: 'is after', valueRequired: true },
        { key: 'is_between', label: 'is between', valueRequired: true, valueCount: 2 },
        { key: 'is_relative', label: 'is in the last', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    HIERARCHICAL: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'is_any_of', label: 'is any of', valueRequired: true },
        { key: 'is_under', label: 'is under (includes children)', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    LOCATION: [
        { key: 'is', label: 'is', valueRequired: true },
        { key: 'is_not', label: 'is not', valueRequired: true },
        { key: 'is_any_of', label: 'is any of', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
    TAG_PICKER: [
        { key: 'contains_any', label: 'contains any of', valueRequired: true },
        { key: 'contains_all', label: 'contains all of', valueRequired: true },
        { key: 'not_contains', label: 'does not contain', valueRequired: true },
        { key: 'is_set', label: 'is set', valueRequired: false },
        { key: 'is_not_set', label: 'is not set', valueRequired: false },
    ],
};

// ----------------------------------------------------------------------------
// VALUE CONFIGURATION - Define how values are input
// ----------------------------------------------------------------------------

/**
 * Input types for value selection.
 */
export type ValueInputType =
    | 'dropdown'
    | 'checkbox_list'
    | 'text'
    | 'number'
    | 'toggle'
    | 'date_picker'
    | 'date_range_picker'
    | 'user_search'
    | 'team_dropdown'
    | 'tree_picker'
    | 'cascading_dropdown'
    | 'tag_input'
    | 'slider';

/**
 * Option for select-based inputs.
 */
export interface SelectOption {
    value: string;
    label: string;
    color?: string;           // For visual indicators (sentiment, priority)
    icon?: string;            // Icon name or emoji
    children?: SelectOption[]; // For hierarchical options
}

/**
 * Date preset for quick date selection.
 */
export interface DatePreset {
    label: string;
    value: {
        type: 'relative' | 'absolute';
        amount?: number;
        unit?: 'days' | 'weeks' | 'months' | 'years';
        start?: string;
        end?: string;
    };
}

/**
 * Configuration for value input component.
 */
export interface ValueConfig {
    inputType: ValueInputType;
    options?: SelectOption[];
    optionsEndpoint?: string;     // For dynamic options from API
    allowMultiple?: boolean;
    placeholder?: string;
    min?: number;                 // For number inputs
    max?: number;
    step?: number;
    presets?: DatePreset[];       // For date pickers
    searchable?: boolean;         // Show search in dropdown
}

// ----------------------------------------------------------------------------
// FILTER ATTRIBUTES - Define individual filterable fields
// ----------------------------------------------------------------------------

/**
 * Complete filter attribute definition.
 */
export interface FilterAttribute {
    id: string;
    name: string;
    family: string;
    dataType: DataType;
    operators: Operator[];
    defaultOperator: Operator;
    valueConfig: ValueConfig;
    dependencies?: FilterDependency[];  // For hierarchical filters
    slashCommand?: string;              // e.g., '/sentiment'
    searchable?: boolean;               // Show in command palette search
    quickFilter?: boolean;              // Show in quick filter bar
    description?: string;               // Help text
}

/**
 * Dependency between filter attributes.
 */
export interface FilterDependency {
    attribute: string;                    // Parent attribute ID
    type: 'filter_options' | 'require';   // Filter options or require parent first
}

// ----------------------------------------------------------------------------
// FILTER FAMILIES - Group related attributes
// ----------------------------------------------------------------------------

/**
 * Filter family grouping related attributes.
 */
export interface FilterFamily {
    id: string;
    name: string;
    icon: string;           // Emoji or icon name
    description?: string;
    attributes: FilterAttribute[];
}

// ----------------------------------------------------------------------------
// FILTER CONDITIONS - Runtime filter state
// ----------------------------------------------------------------------------

/**
 * A single filter condition.
 */
export interface FilterCondition {
    id: string;
    attributeId: string;
    operator: OperatorKey;
    value: FilterValue;
}

/**
 * Possible filter values.
 */
export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | DateValue
    | null;

/**
 * Date value for date filters.
 */
export interface DateValue {
    type: 'absolute' | 'relative';
    start?: string;           // ISO date string
    end?: string;             // ISO date string
    amount?: number;          // For relative dates
    unit?: 'days' | 'weeks' | 'months' | 'years';
}

/**
 * A group of filter conditions with logic.
 */
export interface FilterGroup {
    id: string;
    logic: 'AND' | 'OR';
    conditions: (FilterCondition | FilterGroup)[];
}

// ----------------------------------------------------------------------------
// SAVED FILTERS - Persistent filter configurations
// ----------------------------------------------------------------------------

/**
 * A saved filter configuration.
 */
export interface SavedFilter {
    id: string;
    name: string;
    description?: string;
    filter: FilterGroup;
    createdAt: string;
    updatedAt: string;
    isQuickFilter: boolean;
    isDefault?: boolean;
    createdBy?: string;
}

// ----------------------------------------------------------------------------
// NLP PARSING - Natural language filter parsing
// ----------------------------------------------------------------------------

/**
 * Result of natural language parsing.
 */
export interface NLPParseResult {
    success: boolean;
    confidence: number;       // 0-1 confidence score
    conditions: ParsedCondition[];
    rawQuery: string;
    suggestions?: string[];   // Alternative interpretations
}

/**
 * A parsed condition from natural language.
 */
export interface ParsedCondition {
    attributeId: string;
    attributeName: string;
    operator: OperatorKey;
    operatorLabel: string;
    value: FilterValue;
    valueLabel: string;
    confidence: number;
}

// ----------------------------------------------------------------------------
// SLASH COMMANDS - Quick filter access
// ----------------------------------------------------------------------------

/**
 * Slash command definition.
 */
export interface SlashCommand {
    command: string;          // e.g., '/sentiment'
    attributeId: string;
    label: string;
    description: string;
    icon?: string;
}

// ----------------------------------------------------------------------------
// FILTER CONTEXT - React context state
// ----------------------------------------------------------------------------

/**
 * Filter context value for React context.
 */
export interface FilterContextValue {
    // UI State
    isCommandPaletteOpen: boolean;
    isPanelOpen: boolean;
    searchQuery: string;

    // Filter State
    activeFilters: FilterGroup;
    recentFilters: SavedFilter[];
    savedFilters: SavedFilter[];

    // Configuration
    filterFamilies: FilterFamily[];
    slashCommands: SlashCommand[];

    // Actions
    openCommandPalette: () => void;
    closeCommandPalette: () => void;
    openPanel: () => void;
    closePanel: () => void;
    setSearchQuery: (query: string) => void;

    // Filter Actions
    addCondition: (attributeId: string) => void;
    updateCondition: (conditionId: string, updates: Partial<FilterCondition>) => void;
    removeCondition: (conditionId: string) => void;
    addGroup: (parentGroupId?: string) => void;
    toggleGroupLogic: (groupId: string) => void;

    // Apply/Save Actions
    applyFilters: () => void;
    clearFilters: () => void;
    saveFilter: (name: string, description?: string) => void;
    loadFilter: (filterId: string) => void;
    deleteFilter: (filterId: string) => void;

    // NLP
    parseNaturalLanguage: (query: string) => NLPParseResult;
    applyNLPResult: (result: NLPParseResult) => void;
}

// ----------------------------------------------------------------------------
// COMPONENT PROPS - Props for filter components
// ----------------------------------------------------------------------------

/**
 * Props for CommandPalette component.
 */
export interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenPanel: () => void;
    onApplyFilters?: (filters: FilterGroup) => void;
}

/**
 * Props for FilterPanel component.
 */
export interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    initialFilters?: FilterGroup;
    onApplyFilters?: (filters: FilterGroup) => void;
    onSaveFilter?: (name: string, filters: FilterGroup) => void;
}

/**
 * Props for QueryBuilder component.
 */
export interface QueryBuilderProps {
    group: FilterGroup;
    onChange: (group: FilterGroup) => void;
    filterFamilies: FilterFamily[];
    isRoot?: boolean;
}

/**
 * Props for ValueInput component.
 */
export interface ValueInputProps {
    attribute: FilterAttribute;
    operator: Operator;
    value: FilterValue;
    onChange: (value: FilterValue) => void;
}

/**
 * Props for FilterFamilyAccordion component.
 */
export interface FilterFamilyAccordionProps {
    family: FilterFamily;
    isExpanded: boolean;
    onToggle: () => void;
    onSelectAttribute: (attributeId: string) => void;
}
