// ============================================================================
// COMMAND PALETTE COMPONENT
// ============================================================================
// Central modal component for quick filter access via Cmd/Ctrl+K
// Supports plain text search, slash commands, and natural language queries
// ============================================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Filter, Command, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { useFilter } from './FilterContext';
import { searchAttributes, getSlashCommand } from './filterConfig';
import type { SlashCommand, FilterAttribute, NLPParseResult } from './types';

// ----------------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------------

interface SlashCommandListProps {
    commands: SlashCommand[];
    query: string;
    selectedIndex: number;
    onSelect: (command: SlashCommand) => void;
}

function SlashCommandList({ commands, query, selectedIndex, onSelect }: SlashCommandListProps) {
    const filteredCommands = useMemo(() => {
        const normalizedQuery = query.slice(1).toLowerCase();
        return commands.filter(cmd =>
            cmd.command.slice(1).toLowerCase().includes(normalizedQuery) ||
            cmd.label.toLowerCase().includes(normalizedQuery)
        );
    }, [commands, query]);

    if (filteredCommands.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">No commands found for "{query}"</div>
            </div>
        );
    }

    return (
        <div className="slash-dropdown">
            {filteredCommands.map((cmd, index) => (
                <div
                    key={cmd.command}
                    className={`slash-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => onSelect(cmd)}
                >
                    <span className="slash-icon">{cmd.icon}</span>
                    <span className="slash-command">{cmd.command}</span>
                    <span className="slash-desc">{cmd.description}</span>
                </div>
            ))}
        </div>
    );
}

interface NLPPreviewProps {
    result: NLPParseResult;
    onApply: () => void;
    onEdit: () => void;
    onRemoveCondition: (index: number) => void;
}

function NLPPreview({ result, onApply, onEdit, onRemoveCondition }: NLPPreviewProps) {
    return (
        <div className="nlp-preview">
            <div className="nlp-preview-header">
                <Sparkles size={16} />
                <span>Detected Filters ({result.conditions.length})</span>
            </div>
            <div className="nlp-filters">
                {result.conditions.map((condition, index) => (
                    <div key={index} className="nlp-chip">
                        <span className="nlp-chip-label">{condition.attributeName}:</span>
                        <span className="nlp-chip-value">{condition.valueLabel}</span>
                        <button
                            className="nlp-chip-remove"
                            onClick={() => onRemoveCondition(index)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div className="nlp-actions">
                <button className="nlp-btn nlp-btn-primary" onClick={onApply}>
                    Apply Filters
                </button>
                <button className="nlp-btn nlp-btn-secondary" onClick={onEdit}>
                    Edit in Query Builder →
                </button>
            </div>
        </div>
    );
}

interface InlinePickerProps {
    attribute: FilterAttribute;
    onSelect: (value: string | string[]) => void;
    onClose: () => void;
}

function InlinePicker({ attribute, onSelect, onClose }: InlinePickerProps) {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const isMulti = attribute.dataType === 'MULTI_SELECT';
    const options = attribute.valueConfig.options || [];

    const handleSelect = (value: string) => {
        if (isMulti) {
            const newValues = selectedValues.includes(value)
                ? selectedValues.filter(v => v !== value)
                : [...selectedValues, value];
            setSelectedValues(newValues);
        } else {
            onSelect(value);
        }
    };

    const handleApply = () => {
        if (isMulti) {
            onSelect(selectedValues);
        }
    };

    return (
        <div className="inline-picker">
            <div className="picker-header">
                <span className="picker-title">Select {attribute.name}</span>
                <button className="panel-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
            <div className="picker-options">
                {options.map(option => (
                    <div
                        key={option.value}
                        className={`picker-option ${isMulti
                                ? selectedValues.includes(option.value) ? 'selected' : ''
                                : ''
                            }`}
                        onClick={() => handleSelect(option.value)}
                        style={option.color ? { borderLeftColor: option.color, borderLeftWidth: 3 } : undefined}
                    >
                        <span className="option-indicator"></span>
                        <span className="option-label">
                            {option.icon && <span style={{ marginRight: 6 }}>{option.icon}</span>}
                            {option.label}
                        </span>
                    </div>
                ))}
            </div>
            {isMulti && selectedValues.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="nlp-btn nlp-btn-primary" onClick={handleApply}>
                        Apply ({selectedValues.length})
                    </button>
                </div>
            )}
        </div>
    );
}

interface RecentFilterItemProps {
    name: string;
    description: string;
    filterCount: number;
    isSelected: boolean;
    onClick: () => void;
}

function RecentFilterItem({ name, description, filterCount, isSelected, onClick }: RecentFilterItemProps) {
    return (
        <div
            className={`palette-item ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="palette-item-icon">
                <Clock size={18} />
            </div>
            <div className="palette-item-content">
                <div className="palette-item-title">{name}</div>
                <div className="palette-item-desc">{description}</div>
            </div>
            <span className="palette-item-badge">{filterCount} filter{filterCount !== 1 ? 's' : ''}</span>
        </div>
    );
}

// ----------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------

type PaletteMode = 'default' | 'slash' | 'nlp' | 'picker';

export function CommandPalette() {
    const {
        isCommandPaletteOpen,
        closeCommandPalette,
        openPanel,
        searchQuery,
        setSearchQuery,
        recentFilters,
        slashCommands,
        filterFamilies,
        parseNaturalLanguage,
        applyNLPResult,
        addCondition,
        updateCondition,
        applyFilters,
    } = useFilter();

    const [mode, setMode] = useState<PaletteMode>('default');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [nlpResult, setNlpResult] = useState<NLPParseResult | null>(null);
    const [selectedAttribute, setSelectedAttribute] = useState<FilterAttribute | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when palette opens
    useEffect(() => {
        if (isCommandPaletteOpen && inputRef.current) {
            inputRef.current.focus();
            setSearchQuery('');
            setMode('default');
            setSelectedIndex(0);
            setNlpResult(null);
            setSelectedAttribute(null);
        }
    }, [isCommandPaletteOpen, setSearchQuery]);

    // Handle input changes
    const handleInputChange = (value: string) => {
        setSearchQuery(value);
        setSelectedIndex(0);

        if (value === '') {
            setMode('default');
            setNlpResult(null);
        } else if (value.startsWith('/')) {
            setMode('slash');
            setNlpResult(null);
        } else if (value.length > 15) {
            // Try NLP parsing for longer queries
            const result = parseNaturalLanguage(value);
            if (result.success && result.conditions.length > 0) {
                setMode('nlp');
                setNlpResult(result);
            } else {
                setMode('default');
                setNlpResult(null);
            }
        } else {
            setMode('default');
            setNlpResult(null);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => prev + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleEnter();
        } else if (e.key === 'Escape') {
            if (mode === 'picker') {
                setMode('default');
                setSelectedAttribute(null);
            } else {
                closeCommandPalette();
            }
        }
    };

    const handleEnter = () => {
        if (mode === 'slash') {
            const filteredCommands = slashCommands.filter(cmd =>
                cmd.command.slice(1).toLowerCase().includes(searchQuery.slice(1).toLowerCase())
            );
            if (filteredCommands[selectedIndex]) {
                handleSlashCommandSelect(filteredCommands[selectedIndex]);
            }
        } else if (mode === 'nlp' && nlpResult) {
            applyNLPResult(nlpResult);
            applyFilters();
        } else if (searchQuery.trim()) {
            // Apply as keyword search
            addCondition('keyword');
            updateCondition('keyword', { value: searchQuery.trim() });
            applyFilters();
        }
    };

    const handleSlashCommandSelect = (command: SlashCommand) => {
        if (command.command === '/filters') {
            closeCommandPalette();
            openPanel();
            return;
        }

        // Find the attribute for this command
        const allAttributes = filterFamilies.flatMap(f => f.attributes);
        const attribute = allAttributes.find(a => a.id === command.attributeId);

        if (attribute) {
            if (attribute.valueConfig.options && attribute.valueConfig.options.length > 0) {
                setSelectedAttribute(attribute);
                setMode('picker');
            } else {
                // Add the condition and open panel for editing
                addCondition(attribute.id);
                closeCommandPalette();
                openPanel();
            }
        }
    };

    const handleInlinePickerSelect = (value: string | string[]) => {
        if (selectedAttribute) {
            addCondition(selectedAttribute.id);
            // The updateCondition would be called here with the value
            closeCommandPalette();
        }
    };

    const handleNLPApply = () => {
        if (nlpResult) {
            applyNLPResult(nlpResult);
            applyFilters();
        }
    };

    const handleNLPEdit = () => {
        if (nlpResult) {
            applyNLPResult(nlpResult);
            closeCommandPalette();
            openPanel();
        }
    };

    const handleNLPRemoveCondition = (index: number) => {
        if (nlpResult) {
            const newConditions = nlpResult.conditions.filter((_, i) => i !== index);
            setNlpResult({
                ...nlpResult,
                conditions: newConditions,
                success: newConditions.length > 0,
            });
            if (newConditions.length === 0) {
                setMode('default');
            }
        }
    };

    const handleRecentFilterClick = (filterId: string) => {
        const filter = recentFilters.find(f => f.id === filterId);
        if (filter) {
            // Load and apply the filter
            closeCommandPalette();
        }
    };

    // Quick filter attributes for suggestions
    const quickFilterAttributes = useMemo(() => {
        return filterFamilies
            .flatMap(f => f.attributes)
            .filter(a => a.slashCommand)
            .slice(0, 6);
    }, [filterFamilies]);

    if (!isCommandPaletteOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="filter-backdrop active"
                onClick={closeCommandPalette}
            />

            {/* Command Palette */}
            <div className="command-palette active unified-filter">
                {/* Search Input */}
                <div className="palette-search">
                    <Search className="palette-search-icon" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="palette-search-input"
                        placeholder="Search tickets, use /commands, or type naturally..."
                        value={searchQuery}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleInputChange('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                            <X size={16} style={{ color: 'var(--filter-text-muted)' }} />
                        </button>
                    )}
                </div>

                {/* Content based on mode */}
                <div className="palette-content">
                    {mode === 'slash' && (
                        <SlashCommandList
                            commands={slashCommands}
                            query={searchQuery}
                            selectedIndex={selectedIndex}
                            onSelect={handleSlashCommandSelect}
                        />
                    )}

                    {mode === 'nlp' && nlpResult && (
                        <NLPPreview
                            result={nlpResult}
                            onApply={handleNLPApply}
                            onEdit={handleNLPEdit}
                            onRemoveCondition={handleNLPRemoveCondition}
                        />
                    )}

                    {mode === 'picker' && selectedAttribute && (
                        <InlinePicker
                            attribute={selectedAttribute}
                            onSelect={handleInlinePickerSelect}
                            onClose={() => {
                                setMode('default');
                                setSelectedAttribute(null);
                            }}
                        />
                    )}

                    {mode === 'default' && (
                        <>
                            {/* Search results if query exists */}
                            {searchQuery && (
                                <div className="palette-section">
                                    <div className="palette-section-title">Filters matching "{searchQuery}"</div>
                                    {searchAttributes(searchQuery).slice(0, 5).map((attr, index) => (
                                        <div
                                            key={attr.id}
                                            className={`palette-item ${index === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => {
                                                addCondition(attr.id);
                                                closeCommandPalette();
                                                openPanel();
                                            }}
                                        >
                                            <div className="palette-item-icon">
                                                {filterFamilies.find(f => f.id === attr.family)?.icon || '🔍'}
                                            </div>
                                            <div className="palette-item-content">
                                                <div className="palette-item-title">{attr.name}</div>
                                                <div className="palette-item-desc">
                                                    {filterFamilies.find(f => f.id === attr.family)?.name}
                                                    {attr.slashCommand && ` • ${attr.slashCommand}`}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} style={{ color: 'var(--filter-text-muted)' }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent Filters */}
                            {!searchQuery && recentFilters.length > 0 && (
                                <div className="palette-section">
                                    <div className="palette-section-title">Recent Filters</div>
                                    {recentFilters.slice(0, 3).map((filter, index) => (
                                        <RecentFilterItem
                                            key={filter.id}
                                            name={filter.name}
                                            description={filter.description || 'Recently used filter'}
                                            filterCount={filter.filter.conditions.length}
                                            isSelected={index === selectedIndex}
                                            onClick={() => handleRecentFilterClick(filter.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Quick Commands */}
                            {!searchQuery && (
                                <div className="palette-section">
                                    <div className="palette-section-title">Quick Commands</div>
                                    {quickFilterAttributes.map((attr, index) => (
                                        <div
                                            key={attr.id}
                                            className={`palette-item ${index + (recentFilters.length > 0 ? 3 : 0) === selectedIndex ? 'selected' : ''
                                                }`}
                                            onClick={() => {
                                                if (attr.slashCommand) {
                                                    const cmd = getSlashCommand(attr.slashCommand);
                                                    if (cmd) handleSlashCommandSelect(cmd);
                                                }
                                            }}
                                        >
                                            <div className="palette-item-icon">
                                                {filterFamilies.find(f => f.id === attr.family)?.icon || '📋'}
                                            </div>
                                            <div className="palette-item-content">
                                                <div className="palette-item-title">
                                                    Type {attr.slashCommand} for {attr.name.toLowerCase()} filter
                                                </div>
                                                <div className="palette-item-desc">
                                                    {attr.valueConfig.options?.slice(0, 3).map(o => o.label).join(', ')}
                                                    {attr.valueConfig.options && attr.valueConfig.options.length > 3 && '...'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="palette-footer">
                    <div className="palette-footer-hints">
                        <span className="palette-footer-hint">
                            <span className="kbd">↑</span>
                            <span className="kbd">↓</span>
                            Navigate
                        </span>
                        <span className="palette-footer-hint">
                            <span className="kbd">↵</span>
                            Select
                        </span>
                        <span className="palette-footer-hint">
                            <span className="kbd">esc</span>
                            Close
                        </span>
                    </div>
                    <div
                        className="palette-footer-link"
                        onClick={() => {
                            closeCommandPalette();
                            openPanel();
                        }}
                    >
                        <Filter size={14} />
                        Open Advanced Filters
                        <span className="kbd">⌘⇧F</span>
                    </div>
                </div>
            </div>
        </>
    );
}
