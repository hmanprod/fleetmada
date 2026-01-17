import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Wrench, ChevronDown, Check, Plus } from 'lucide-react';
import { type ServiceTask } from '@/lib/services/service-api';

interface ServiceTaskSelectProps {
    tasks: ServiceTask[];
    selectedTaskId?: string;
    onSelect: (taskId: string, taskName: string) => void;
    className?: string;
    loading?: boolean;
    placeholder?: string;
    fallbackTasks?: Array<{ id: string; name: string }>;
}

export function ServiceTaskSelect({
    tasks,
    selectedTaskId,
    onSelect,
    className,
    loading,
    placeholder = "Veuillez sélectionner une tâche",
    fallbackTasks = []
}: ServiceTaskSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const allOptions = useMemo(() => {
        // Combine API tasks and fallback tasks, preventing duplicates by ID if possible
        const combined = [...tasks];
        fallbackTasks.forEach(ft => {
            if (!combined.some(t => t.id === ft.id)) {
                combined.push(ft as any);
            }
        });
        return combined;
    }, [tasks, fallbackTasks]);

    const selectedTask = useMemo(() =>
        allOptions.find(t => t.id === selectedTaskId),
        [allOptions, selectedTaskId]
    );

    const filteredTasks = useMemo(() => {
        if (!searchTerm) return allOptions;
        const term = searchTerm.toLowerCase();
        return allOptions.filter(t =>
            (t.name && t.name.toLowerCase().includes(term)) ||
            (t.description && t.description.toLowerCase().includes(term))
        );
    }, [allOptions, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2.5 text-sm cursor-pointer bg-white hover:border-gray-400 focus-within:ring-1 focus-within:ring-[#008751] focus-within:border-[#008751]"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#008751] rounded-full animate-spin"></div>
                        <span className="text-gray-400 text-xs">Chargement...</span>
                    </div>
                ) : selectedTask ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Wrench size={16} className="text-gray-400 shrink-0" />
                        <span className="truncate text-gray-900 font-medium">
                            {selectedTask.name}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-500">{placeholder}</span>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-hidden flex flex-col max-h-64 animate-fade-in">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
                                placeholder="Rechercher une tâche..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => {
                                        onSelect(task.id, task.name);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 ${selectedTaskId === task.id ? 'bg-green-50' : ''}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            <Wrench size={14} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium text-gray-900 truncate">
                                                {task.name}
                                            </span>
                                            {task.description && (
                                                <span className="text-[11px] text-gray-500 truncate">
                                                    {task.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedTaskId === task.id && <Check size={14} className="text-[#008751] shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                <div className="mb-2">Aucune tâche trouvée pour "{searchTerm}"</div>
                                <button className="text-[#008751] font-bold text-xs flex items-center gap-1 mx-auto hover:underline">
                                    <Plus size={14} /> Créer "{searchTerm}"
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
