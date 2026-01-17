import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, User, ChevronDown, Check } from 'lucide-react';
import { type Contact } from '@/lib/services/contacts-api';

interface ContactSelectProps {
    contacts: Contact[];
    selectedContactId?: string;
    onSelect: (contactId: string) => void;
    className?: string;
    loading?: boolean;
    placeholder?: string;
}

export function ContactSelect({
    contacts,
    selectedContactId,
    onSelect,
    className,
    loading,
    placeholder = "Veuillez sélectionner"
}: ContactSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedContact = useMemo(() =>
        contacts.find(c => c.id === selectedContactId),
        [contacts, selectedContactId]
    );

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        const term = searchTerm.toLowerCase();
        return contacts.filter(c =>
            (c.firstName && c.firstName.toLowerCase().includes(term)) ||
            (c.lastName && c.lastName.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term))
        );
    }, [contacts, searchTerm]);

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
                ) : selectedContact ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                            {selectedContact.firstName.charAt(0)}{selectedContact.lastName.charAt(0)}
                        </div>
                        <span className="truncate text-gray-900 font-medium">
                            {selectedContact.firstName} {selectedContact.lastName}
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
                                placeholder="Rechercher un contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => {
                                        onSelect(contact.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 ${selectedContactId === contact.id ? 'bg-green-50' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium text-gray-900 truncate">
                                                {contact.firstName} {contact.lastName}
                                            </span>
                                            {contact.email && (
                                                <span className="text-[11px] text-gray-500 truncate">
                                                    {contact.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedContactId === contact.id && <Check size={14} className="text-[#008751] shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                Aucun contact trouvé pour "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
