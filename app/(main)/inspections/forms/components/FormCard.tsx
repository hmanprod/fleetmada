'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutGrid,
    CheckCircle2,
    XCircle,
    Copy,
    Trash2,
    Edit,
    MoreHorizontal,
    List,
    Workflow,
    Car,
    Settings,
    Play,
    Share,
    Printer,
    Archive
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { InspectionTemplate } from '@/lib/services/inspections-api';

// Icon wrapper for consistency
function ClipboardCheck({ size = 16, className = "" }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <path d="m9 14 2 2 4-4"></path>
        </svg>
    );
}

interface FormCardProps {
    template: InspectionTemplate;
    onDuplicate: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function FormCard({ template, onDuplicate, onDelete, onToggleStatus }: FormCardProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleEdit = () => {
        router.push(`/inspections/forms/${template.id}/edit`);
    };

    const handleVehiclesAndSchedules = () => {
        // For now, redirect to a placeholder or the same edit page with a tab query
        router.push(`/inspections/forms/${template.id}/edit?tab=schedules`);
    };

    const handleStartInspection = () => {
        // Redirect to the new start inspection page
        router.push(`/inspections/forms/${template.id}/start`);
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#008751]/30 transition-all duration-300 flex flex-col relative">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4 relative">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${template.category === 'Sécurité' ? 'bg-orange-100 text-orange-700' :
                        template.category === 'Mécanique' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {template.category}
                    </span>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-sm animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Edit
                                </div>
                                <button onClick={() => { setIsMenuOpen(false); handleEdit(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                    <List size={16} /> Inspection Items
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 opacity-50 cursor-not-allowed" title="Coming Soon">
                                    <Workflow size={16} /> Workflows
                                </button>
                                <button onClick={() => { setIsMenuOpen(false); handleVehiclesAndSchedules(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                    <Car size={16} /> Vehicles & Schedules
                                </button>
                                <button onClick={() => { setIsMenuOpen(false); handleEdit(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                    <Edit size={16} /> Title and Settings
                                </button>

                                <div className="my-1 border-t border-gray-100"></div>

                                <button onClick={() => { setIsMenuOpen(false); handleStartInspection(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-900 font-medium">
                                    <Play size={16} /> Start Inspection
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 opacity-50 cursor-not-allowed">
                                    <Share size={16} /> Share Submission Link
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 opacity-50 cursor-not-allowed">
                                    <Printer size={16} /> Print
                                </button>
                                <button onClick={() => { setIsMenuOpen(false); onDuplicate(template.id, template.name); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                    <Copy size={16} /> Make a Copy
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 opacity-50 cursor-not-allowed">
                                    <Settings size={16} /> View History
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 opacity-50 cursor-not-allowed">
                                    <Archive size={16} /> Archive
                                </button>

                                <div className="my-1 border-t border-gray-100"></div>

                                <button onClick={() => { setIsMenuOpen(false); onDelete(template.id); }} className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#008751] transition-colors cursor-pointer" onClick={handleEdit}>{template.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{template.description || 'Aucune description fournie.'}</p>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <LayoutGrid size={14} className="text-[#008751]" />
                        <span>{template._count?.items || 0} éléments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClipboardCheck size={14} className="text-[#008751]" />
                        <span>{template._count?.inspections || 0} utilisations</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                    onClick={() => onToggleStatus(template.id, template.isActive)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${template.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {template.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {template.isActive ? 'Actif' : 'Inactif'}
                </button>

            </div>
        </div>
    );
}
