// ============================================================================
// FILTER PANEL COMPONENT (SIDEBAR)
// ============================================================================
// Right-side sliding panel with query builder, filter families, and saved filters
// ============================================================================

import { useState, useMemo } from 'react';
import {
    X,
    Search,
    Plus,
    Save,
    Trash2,
    ChevronDown,
} from 'lucide-react';
import { useFilter } from './FilterContext';
import { getAttributeById } from './filterConfig';
import type { FilterGroup, FilterCondition, FilterFamily } from './types';

// ----------------------------------------------------------------------------
// QUERY BUILDER COMPONENTS
// ----------------------------------------------------------------------------

interface QueryRowProps {
    condition: FilterCondition;
    onUpdate: (updates: Partial<FilterCondition>) => void;
    onRemove: () => void;
}

function QueryRow({ condition, onUpdate, onRemove }: QueryRowProps) {
    const attribute = getAttributeById(condition.attributeId);

    if (!attribute) {
        return null;
    }

    const currentOperator = attribute.operators.find(op => op.key === condition.operator);

    // Render value display
    const renderValue = () => {
        if (!currentOperator?.valueRequired) {
            return null;
        }

        if (condition.value === null || condition.value === undefined) {
            return (
                <input
                    type="text"
                    className="query-value-input"
                    placeholder="Enter value..."
                    onBlur={(e) => onUpdate({ value: e.target.value })}
                />
            );
        }

        // For select types, show as chip
        if (attribute.dataType === 'SINGLE_SELECT' || attribute.dataType === 'MULTI_SELECT') {
            const options = attribute.valueConfig.options || [];
            const values = Array.isArray(condition.value) ? condition.value : [condition.value];
            const labels = values.map(v => {
                const opt = options.find(o => o.value === v);
                return opt?.label || v;
            });

            return (
                <div className="query-value">
                    {labels.map((label, i) => (
                        <span
                            key={i}
                            className="query-value-chip"
                            style={options.find(o => o.label === label)?.color ? {
                                color: options.find(o => o.label === label)?.color
                            } : undefined}
                        >
                            {String(label)}
                        </span>
                    ))}
                </div>
            );
        }

        // For text/number/date, show input (convert complex types to string)
        const displayValue = typeof condition.value === 'object' && condition.value !== null
            ? JSON.stringify(condition.value)
            : String(condition.value || '');

        return (
            <input
                type={attribute.dataType === 'NUMBER' ? 'number' : 'text'}
                className="query-value-input"
                value={displayValue}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder={attribute.valueConfig.placeholder}
            />
        );
    };

    return (
        <div className="query-row">
            <span className="query-field">{attribute.name}</span>

            <select
                className="query-operator"
                value={condition.operator}
                onChange={(e) => onUpdate({ operator: e.target.value as any })}
            >
                {attribute.operators.map(op => (
                    <option key={op.key} value={op.key}>{op.label}</option>
                ))}
            </select>

            {renderValue()}

            <button className="query-remove" onClick={onRemove}>
                <Trash2 size={16} />
            </button>
        </div>
    );
}

interface QueryBuilderProps {
    group: FilterGroup;
    onUpdate: (group: FilterGroup) => void;
    isRoot?: boolean;
}

function QueryBuilder({ group, onUpdate }: QueryBuilderProps) {
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleRemoveCondition = (id: string) => {
        onUpdate({
            ...group,
            conditions: group.conditions.filter(c => c.id !== id),
        });
    };

    const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
        onUpdate({
            ...group,
            conditions: group.conditions.map(c =>
                c.id === id ? { ...c, ...updates } : c
            ) as (FilterCondition | FilterGroup)[],
        });
    };

    const handleToggleLogic = () => {
        onUpdate({
            ...group,
            logic: group.logic === 'AND' ? 'OR' : 'AND',
        });
    };

    return (
        <div className="query-builder">
            {group.conditions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-text">No filters applied yet</div>
                </div>
            ) : (
                <>
                    {group.conditions.map((item, index) => {
                        if ('conditions' in item) {
                            // Nested group
                            return (
                                <div key={item.id}>
                                    {index > 0 && (
                                        <div className="logic-toggle">
                                            <button
                                                className={`logic-btn ${group.logic === 'AND' ? 'active' : ''}`}
                                                onClick={handleToggleLogic}
                                            >
                                                AND
                                            </button>
                                            <button
                                                className={`logic-btn ${group.logic === 'OR' ? 'active' : ''}`}
                                                onClick={handleToggleLogic}
                                            >
                                                OR
                                            </button>
                                        </div>
                                    )}
                                    <QueryBuilder
                                        group={item}
                                        onUpdate={(updated) => {
                                            onUpdate({
                                                ...group,
                                                conditions: group.conditions.map(c =>
                                                    c.id === item.id ? updated : c
                                                ) as (FilterCondition | FilterGroup)[],
                                            });
                                        }}
                                        isRoot={false}
                                    />
                                </div>
                            );
                        }

                        // Regular condition
                        return (
                            <div key={item.id}>
                                {index > 0 && (
                                    <div className="logic-toggle">
                                        <button
                                            className={`logic-btn ${group.logic === 'AND' ? 'active' : ''}`}
                                            onClick={handleToggleLogic}
                                        >
                                            AND
                                        </button>
                                        <button
                                            className={`logic-btn ${group.logic === 'OR' ? 'active' : ''}`}
                                            onClick={handleToggleLogic}
                                        >
                                            OR
                                        </button>
                                    </div>
                                )}
                                <QueryRow
                                    condition={item}
                                    onUpdate={(updates) => handleUpdateCondition(item.id, updates)}
                                    onRemove={() => handleRemoveCondition(item.id)}
                                />
                            </div>
                        );
                    })}
                </>
            )}

            <button
                className="add-filter-btn"
                onClick={() => setShowAddMenu(!showAddMenu)}
            >
                <Plus size={16} />
                Add Filter
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------------
// FILTER FAMILY ACCORDION
// ----------------------------------------------------------------------------

interface FilterFamilyAccordionProps {
    family: FilterFamily;
    isExpanded: boolean;
    onToggle: () => void;
    onSelectAttribute: (attributeId: string) => void;
}

function FilterFamilyAccordion({
    family,
    isExpanded,
    onToggle,
    onSelectAttribute
}: FilterFamilyAccordionProps) {
    return (
        <div className={`family-item ${isExpanded ? 'expanded' : ''}`}>
            <div className="family-header" onClick={onToggle}>
                <div className="family-icon">{family.icon}</div>
                <span className="family-name">{family.name}</span>
                <span className="family-count">{family.attributes.length} filters</span>
                <ChevronDown className="family-chevron" size={20} />
            </div>
            <div className="family-content">
                {family.attributes.map(attr => (
                    <div
                        key={attr.id}
                        className="attr-item"
                        onClick={() => onSelectAttribute(attr.id)}
                    >
                        <span className="attr-name">{attr.name}</span>
                        {attr.slashCommand && (
                            <span className="attr-slash">{attr.slashCommand}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// SAVED FILTERS
// ----------------------------------------------------------------------------

interface SavedFiltersListProps {
    onSaveNew: () => void;
}

function SavedFiltersList({ onSaveNew }: SavedFiltersListProps) {
    const { savedFilters, loadFilter, deleteFilter } = useFilter();

    return (
        <div className="saved-filters">
            <div className="section-header">
                <span className="section-title">Saved Filters</span>
            </div>

            {savedFilters.map(filter => (
                <div
                    key={filter.id}
                    className="saved-item"
                    onClick={() => loadFilter(filter.id)}
                >
                    <div className="saved-icon">💾</div>
                    <div className="saved-content">
                        <div className="saved-name">{filter.name}</div>
                        <div className="saved-desc">
                            {filter.description || `${filter.filter.conditions.length} condition(s)`}
                        </div>
                    </div>
                    <button
                        className="query-remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteFilter(filter.id);
                        }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}

            <div className="saved-item" onClick={onSaveNew}>
                <div className="saved-icon">➕</div>
                <div className="saved-content">
                    <div className="saved-name" style={{ color: 'var(--filter-accent)' }}>
                        Save current filter
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// SAVE FILTER DIALOG
// ----------------------------------------------------------------------------

interface SaveFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description?: string) => void;
}

function SaveFilterDialog({ isOpen, onClose, onSave }: SaveFilterDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 500,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--filter-bg-primary)',
                    borderRadius: 12,
                    padding: 24,
                    width: 400,
                    maxWidth: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
                    Save Filter
                </h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Filter name..."
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--filter-border)',
                        borderRadius: 8,
                        marginBottom: 12,
                        fontSize: 14,
                        background: 'var(--filter-bg-secondary)',
                        color: 'var(--filter-text-primary)',
                    }}
                    autoFocus
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)..."
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--filter-border)',
                        borderRadius: 8,
                        marginBottom: 16,
                        fontSize: 14,
                        resize: 'none',
                        height: 80,
                        background: 'var(--filter-bg-secondary)',
                        color: 'var(--filter-text-primary)',
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                        className="clear-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="apply-btn"
                        disabled={!name.trim()}
                        onClick={() => {
                            onSave(name.trim(), description.trim() || undefined);
                            setName('');
                            setDescription('');
                            onClose();
                        }}
                    >
                        Save Filter
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// MAIN FILTER PANEL COMPONENT
// ----------------------------------------------------------------------------

export function FilterPanel() {
    const {
        isPanelOpen,
        closePanel,
        activeFilters,
        filterFamilies,
        addCondition,
        applyFilters,
        clearFilters,
        saveFilter,
    } = useFilter();

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFamilies, setExpandedFamilies] = useState<string[]>(['tickets_mentions']);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Filter families by search
    const filteredFamilies = useMemo(() => {
        if (!searchQuery) return filterFamilies;

        const query = searchQuery.toLowerCase();
        return filterFamilies
            .map(family => ({
                ...family,
                attributes: family.attributes.filter(attr =>
                    attr.name.toLowerCase().includes(query) ||
                    attr.slashCommand?.toLowerCase().includes(query)
                ),
            }))
            .filter(family => family.attributes.length > 0);
    }, [filterFamilies, searchQuery]);

    const toggleFamily = (familyId: string) => {
        setExpandedFamilies(prev =>
            prev.includes(familyId)
                ? prev.filter(id => id !== familyId)
                : [...prev, familyId]
        );
    };

    const handleSelectAttribute = (attributeId: string) => {
        addCondition(attributeId);
    };

    const handleUpdateActiveFilters = (_group: FilterGroup) => {
        // This would update the entire filter group
        // For now, individual updates are handled by updateCondition and removeCondition
    };

    const conditionCount = activeFilters.conditions.length;

    if (!isPanelOpen) return null;

    return (
        <div className="filter-panel active unified-filter">
            {/* Header */}
            <div className="panel-header">
                <h2>Filters</h2>
                <button className="panel-close" onClick={closePanel}>
                    <X size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="panel-search">
                <div className="panel-search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        className="panel-search-input"
                        placeholder="Search filters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="panel-content">
                {/* Active Filters / Query Builder */}
                <div className="active-filters">
                    <div className="section-header">
                        <span className="section-title">Active Filters</span>
                        {conditionCount > 0 && (
                            <span className="section-count">{conditionCount}</span>
                        )}
                    </div>

                    <QueryBuilder
                        group={activeFilters}
                        onUpdate={handleUpdateActiveFilters}
                    />
                </div>

                {/* Filter Families */}
                <div className="filter-families">
                    <div className="section-header">
                        <span className="section-title">Filter Families</span>
                    </div>

                    {filteredFamilies.map(family => (
                        <FilterFamilyAccordion
                            key={family.id}
                            family={family}
                            isExpanded={expandedFamilies.includes(family.id)}
                            onToggle={() => toggleFamily(family.id)}
                            onSelectAttribute={handleSelectAttribute}
                        />
                    ))}
                </div>

                {/* Saved Filters */}
                <SavedFiltersList onSaveNew={() => setShowSaveDialog(true)} />
            </div>

            {/* Footer */}
            <div className="panel-footer">
                <button className="clear-btn" onClick={clearFilters}>
                    Clear All
                </button>
                <div className="footer-actions">
                    <button
                        className="save-btn"
                        onClick={() => setShowSaveDialog(true)}
                        disabled={conditionCount === 0}
                    >
                        <Save size={16} />
                        Save
                    </button>
                    <button
                        className="apply-btn"
                        onClick={applyFilters}
                        disabled={conditionCount === 0}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Save Dialog */}
            <SaveFilterDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={saveFilter}
            />
        </div>
    );
}
