'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ServiceProgram {
    id: number;
    name: string;
    vehiclesCount: number;
    schedulesCount: number;
    primaryMeter: string;
    secondaryMeter: string;
}

const mockPrograms: ServiceProgram[] = [
    { id: 1, name: 'Basic Vehicle Maintenance', vehiclesCount: 1, schedulesCount: 3, primaryMeter: 'Miles', secondaryMeter: '—' },
];

export default function ServiceProgramsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [showBanner, setShowBanner] = useState(true);

    const handleAddProgram = () => {
        router.push('/service/programs/create');
    };

    const handleProgramClick = (id: number) => {
        router.push(`/service/programs/${id}`);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Service Programs</h1>
                    <button className="text-[#008751] hover:underline text-sm font-medium flex items-center gap-1">
                        Learn More <span className="transform -rotate-45">➜</span>
                    </button>
                </div>
                <button
                    onClick={handleAddProgram}
                    className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <Plus size={20} /> Add Service Program
                </button>
            </div>

            {showBanner && (
                <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#0B3B32] to-[#115E50] text-white p-8 flex items-center shadow-md">
                    <button
                        onClick={() => setShowBanner(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <div className="z-10 relative max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Preventative Maintenance for Transportation</h2>
                        <ul className="space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Keep PMs on schedule w/ proactive maintenance alerts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Identify issues before they become major breakdowns
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Prevent costly vehicle downtime
                            </li>
                        </ul>
                    </div>
                    {/* Abstract Background Shapes - Simplified representation */}
                    <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 bg-[url('https://source.unsplash.com/random/800x200/?trucks')] bg-cover bg-center mix-blend-overlay"></div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        OEM Service Program <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter size={14} /> Filters
                    </button>
                </div>
                <div className="flex-1 text-right text-sm text-gray-500">
                    1 - 1 of 1
                </div>
                <div className="flex gap-1">
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-700 bg-white ml-2"><MoreHorizontal size={16} /></button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                                Service Program <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-gray-900"></div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Vehicles</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Schedules</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Primary Meter</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Secondary Meter</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockPrograms.map((program) => (
                            <tr
                                key={program.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleProgramClick(program.id)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-400 text-white text-xs font-bold px-1 rounded">BAS</span>
                                        <span className="text-sm font-medium text-gray-900">{program.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium hover:underline">
                                    {program.vehiclesCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium hover:underline">
                                    {program.schedulesCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {program.primaryMeter}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {program.secondaryMeter}
                                </td>
                            </tr>
                        ))}
                        {/* Empty rows to simulate full table look */}
                        {[...Array(5)].map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="px-6 py-8"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
