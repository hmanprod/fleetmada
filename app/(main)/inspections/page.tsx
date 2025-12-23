'use client';

import React from 'react';
import {
  ClipboardList,
  Calendar,
  History,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionsHubPage() {
  const router = useRouter();

  const navigationCards = [
    {
      title: 'Historique',
      description: 'Consultez les inspections passées et les rapports détaillés.',
      icon: History,
      path: '/inspections/history',
      color: 'bg-blue-50 text-blue-600',
      stats: '150+ terminées'
    },
    {
      title: 'Planifications',
      description: 'Gérez et organisez les inspections à venir.',
      icon: Calendar,
      path: '/inspections/schedules',
      color: 'bg-purple-50 text-purple-600',
      stats: '12 à venir'
    },
    {
      title: 'Formulaires',
      description: 'Créez et personnalisez vos modèles d\'inspection.',
      icon: ClipboardList,
      path: '/inspections/forms',
      color: 'bg-green-50 text-green-600',
      stats: '8 modèles actifs'
    }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Inspections</h1>
          <p className="text-gray-500 mt-2 text-lg">Gérez la conformité et la sécurité de votre flotte.</p>
        </div>
        <button
          onClick={() => router.push('/inspections/history/create')}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/10 active:scale-95"
        >
          <Plus size={20} /> Nouvelle Inspection
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Taux de Conformité</p>
            <p className="text-2xl font-bold text-gray-900">94.2%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inspections en cours</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Échecs Critiques</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {navigationCards.map((card) => (
          <button
            key={card.path}
            onClick={() => router.push(card.path)}
            className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h2>
            <p className="text-gray-500 leading-relaxed mb-6">{card.description}</p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-sm font-semibold text-gray-400">{card.stats}</span>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#008751] group-hover:text-white transition-colors duration-300">
                <ChevronRight size={20} />
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
          </button>
        ))}
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Activité Récente</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 italic font-bold">V{i}</div>
                <div>
                  <p className="font-bold text-gray-900 italic">Inspection Quotidienne - Camion #{100 + i}</p>
                  <p className="text-xs text-gray-500">Terminée par Jean Dupont • Il y a {i * 2} heures</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">CONFORME</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}