"use client";

import React from 'react';
import { ArrowLeft, Search, HelpCircle, Building2, User, Users, Grid, Settings as SettingsIcon, LayoutDashboard, Car, ClipboardCheck, AlertTriangle, Clock, Hammer, Box, Fuel, BarChart3, ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const MenuItem = ({ label, href, icon: Icon }: { label: string, href: string | null, icon?: React.ElementType }) => (
    <button
      onClick={() => href && router.push(href)}
      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors mb-0.5 ${href && pathname === href
        ? 'bg-[#e6f4ea] text-[#008751] font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        {label}
      </div>
    </button>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon?: React.ElementType, title: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 mt-4 mb-1 text-xs font-bold text-gray-900 uppercase tracking-wider">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {title}
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Settings Sidebar */}
      <div className="w-64 bg-[#f9fafb] border-r border-gray-200 flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
        <div className="p-4 sticky top-0 bg-[#f9fafb] z-10">
          <Link
            href="/"
            className="flex items-center gap-1 text-[#008751] text-sm font-medium hover:underline mb-4"
          >
            <ArrowLeft size={16} /> Retour à FleetMada
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h1>

          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Rechercher"
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] bg-white"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs border border-gray-300 rounded px-1">/</div>
          </div> */}
        </div>

        <div className="px-2 pb-8">
          <SectionHeader icon={User} title="Hery RABOTOVAO" />
          <button className="w-full text-left px-3 py-1 text-xs text-red-600 hover:underline mb-2 pl-8">Se déconnecter</button>
          <MenuItem label="Profil utilisateur" href="/settings/user-profile" />
          <MenuItem label="Identifiant & Mot de passe" href="/settings/login-password" />

          <SectionHeader icon={Building2} title="ONNO" />
          <MenuItem label="Paramètres généraux" href="/settings/general" />

          {/* Add remaining sections similarly... */}
          <SectionHeader icon={Users} title="Accès utilisateur" />
          <div className="flex items-center justify-between pr-2">
            <MenuItem label="Gérer les utilisateurs" href={null} />
            <ExternalLink size={12} className="text-gray-400" />
          </div>
          <MenuItem label="Gérer les groupes" href="/settings/groups" />

          <SectionHeader icon={Package} title="Pièces" />
          <MenuItem label="Catégories de pièces" href="/settings/parts/categories" />
          <MenuItem label="Fabricants de pièces" href="/settings/parts/manufacturers" />
          <MenuItem label="Emplacements de stockage" href="/settings/parts/locations" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-10">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}