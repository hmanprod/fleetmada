"use client";

import React from 'react';
import { X, ChevronDown } from 'lucide-react';

export type FilterOperator =
    | 'is'
    | 'is_not'
    | 'is_any_of'
    | 'is_not_any_of'
    | 'is_blank'
    | 'is_not_blank'
    | 'contains'
    | 'does_not_contain'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'between';

export interface FilterCriterion {
    id: string;
    field: string;
    label: string;
    operator: FilterOperator;
    value: any; // Can be string, number, array, or { from: any, to: any }
}

interface FilterCardProps {
    criterion: FilterCriterion;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<FilterCriterion>) => void;
    options?: { value: string; label: string }[];
}

const operatorLabels: Partial<Record<FilterOperator, string>> = {
    is: 'is',
    is_not: 'is not',
    is_any_of: 'is any of',
    is_not_any_of: 'is not any of',
    is_blank: 'is blank',
    is_not_blank: 'is not blank',
    contains: 'contains',
    does_not_contain: 'does not contain',
    gt: 'is greater than',
    lt: 'is less than',
    gte: 'is greater than or equal to',
    lte: 'is less than or equal to',
    between: 'is between',
};

export function FilterCard({ criterion, onRemove, onUpdate, options }: FilterCardProps) {
    const isMultiSelect = criterion.operator === 'is_any_of' || criterion.operator === 'is_not_any_of';
    const noValueNeeded = criterion.operator === 'is_blank' || criterion.operator === 'is_not_blank';
    const isBetween = criterion.operator === 'between';

    // Helper to determine field type based on ID or metadata (ideally passed as prop)
    // For now we'll guess or assume some defaults
    const isDateField = criterion.field.toLowerCase().includes('date') || criterion.field.toLowerCase().includes('at');
    const isNumberField = ['value', 'meterReading', 'year', 'amount'].includes(criterion.field);

    const handleValueChange = (val: any) => {
        onUpdate(criterion.id, { value: val });
    };

    const handleBetweenChange = (key: 'from' | 'to', val: any) => {
        const currentValue = (criterion.value && typeof criterion.value === 'object') ? criterion.value : { from: '', to: '' };
        handleValueChange({ ...currentValue, [key]: val });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm group hover:border-[#008751] transition-all">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-900">{criterion.label}</span>
                <button
                    onClick={() => onRemove(criterion.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-3">
                {/* Operator Selector */}
                <div className="relative">
                    <select
                        value={criterion.operator}
                        onChange={(e) => {
                            const newOp = e.target.value as FilterOperator;
                            const newVal = newOp === 'between' ? { from: '', to: '' } : (isMultiSelect ? [] : '');
                            onUpdate(criterion.id, { operator: newOp, value: newVal });
                        }}
                        className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                    >
                        {Object.entries(operatorLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* Value Selector */}
                {!noValueNeeded && (
                    <div className="relative">
                        {isBetween ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type={isDateField ? "date" : "number"}
                                    value={criterion.value?.from || ''}
                                    onChange={(e) => handleBetweenChange('from', e.target.value)}
                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                    placeholder="From"
                                />
                                <span className="text-gray-400 text-xs">to</span>
                                <input
                                    type={isDateField ? "date" : "number"}
                                    value={criterion.value?.to || ''}
                                    onChange={(e) => handleBetweenChange('to', e.target.value)}
                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                    placeholder="To"
                                />
                            </div>
                        ) : options ? (
                            isMultiSelect ? (
                                <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                                    {options.map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(criterion.value) && criterion.value.includes(opt.value)}
                                                onChange={(e) => {
                                                    const currentVal = Array.isArray(criterion.value) ? criterion.value : [];
                                                    const newVal = e.target.checked
                                                        ? [...currentVal, opt.value]
                                                        : currentVal.filter(v => v !== opt.value);
                                                    handleValueChange(newVal);
                                                }}
                                                className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={typeof criterion.value === 'string' ? criterion.value : ''}
                                        onChange={(e) => handleValueChange(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                    >
                                        <option value="">Select Option</option>
                                        {options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            )
                        ) : (
                            <input
                                type={isDateField ? "date" : (isNumberField ? "number" : "text")}
                                value={typeof criterion.value === 'string' || typeof criterion.value === 'number' ? criterion.value : ''}
                                onChange={(e) => handleValueChange(e.target.value)}
                                placeholder={`Enter ${criterion.label.toLowerCase()}...`}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
