"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon?: any;
}

interface VehicleTabsProps {
    visibleTabs: Tab[];
    moreTabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isMoreMenuOpen: boolean;
    onMoreMenuToggle: () => void;
}

export function VehicleTabs({
    visibleTabs,
    moreTabs,
    activeTab,
    onTabChange,
    isMoreMenuOpen,
    onMoreMenuToggle
}: VehicleTabsProps) {
    const isActiveInMore = moreTabs.some(t => t.id === activeTab);

    return (
        <div className="bg-white border-b border-gray-200 px-8">
            <div className="max-w-7xl mx-auto flex items-center">
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        data-testid={`tab-${tab.id}`}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-[#008751] text-[#008751]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
                <div className="relative">
                    <button
                        data-testid="more-tabs-button"
                        onClick={onMoreMenuToggle}
                        className={`py-4 px-4 flex items-center gap-1 border-b-2 font-medium text-sm transition-colors ${isActiveInMore
                            ? 'border-[#008751] text-[#008751]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Plus <ChevronDown size={14} />
                    </button>
                    {isMoreMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={onMoreMenuToggle}
                            />
                            <div className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                {moreTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            onTabChange(tab.id);
                                            onMoreMenuToggle();
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${activeTab === tab.id
                                            ? 'bg-green-50 text-[#008751]'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab.icon && React.createElement(tab.icon, { size: 14 })}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}