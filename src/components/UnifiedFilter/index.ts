// ============================================================================
// UNIFIED FILTER SYSTEM - PUBLIC EXPORTS
// ============================================================================
// This file exports all public components and utilities for the filter system.
// ============================================================================

// Main components
export { UnifiedFilter } from './UnifiedFilter';
export { CommandPalette } from './CommandPalette';
export { FilterPanel } from './FilterPanel';

// Context and hook
export { FilterProvider, useFilter } from './FilterContext';

// Configuration
export {
    FILTER_FAMILIES,
    SLASH_COMMANDS,
    DATE_PRESETS,
    getAllAttributes,
    getAttributeById,
    getFamilyById,
    getSlashCommand,
    searchAttributes,
    getQuickFilterAttributes,
} from './filterConfig';

// Types
export type {
    // Data types
    DataType,
    OperatorKey,
    ValueInputType,

    // Core types
    Operator,
    SelectOption,
    DatePreset,
    ValueConfig,
    FilterAttribute,
    FilterDependency,
    FilterFamily,

    // Runtime types
    FilterCondition,
    FilterValue,
    DateValue,
    FilterGroup,
    SavedFilter,

    // NLP types
    NLPParseResult,
    ParsedCondition,

    // Slash command
    SlashCommand,

    // Context
    FilterContextValue,

    // Props
    CommandPaletteProps,
    FilterPanelProps,
    QueryBuilderProps,
    ValueInputProps,
    FilterFamilyAccordionProps,
} from './types';

// Operators by type (for custom implementations)
export { OPERATORS_BY_TYPE } from './types';
