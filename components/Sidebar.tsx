"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  Hammer,
  Users,
  Store,
  Fuel,
  Box,
  MapPin,
  FileText,
  Grid,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView?: ViewState;
  setView?: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['vehicles', 'service', 'reminders', 'fuel']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Helper to check if a route is active
  const isActive = (path: string, view?: ViewState) => {
    if (setView && currentView !== undefined && view !== undefined) {
      return currentView === view;
    }
    return pathname === path;
  };

  const isParentActive = (subItems: { href: string, view?: ViewState }[]) => {
    if (setView && currentView !== undefined) {
      return subItems.some(item => item.view !== undefined && item.view === currentView);
    }
    return subItems.some(item => pathname === item.href);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/', view: ViewState.DASHBOARD },
    {
      id: 'vehicles',
      label: 'Véhicules',
      icon: Car,
      href: null,
      subItems: [
        { id: 'vehicles-list', label: 'Liste des véhicules', href: '/vehicles', view: ViewState.VEHICLES_LIST },
        { id: 'vehicle-assignments', label: 'Affectations', href: '/vehicles/assignments', view: ViewState.VEHICLE_ASSIGNMENTS },
        { id: 'meter-history', label: 'Historique compteur', href: '/vehicles/meter-history', view: ViewState.METER_HISTORY },
        { id: 'replacement-analysis', label: 'Analyse remplacement', href: '/vehicles/replacement-analysis', view: ViewState.REPLACEMENT_ANALYSIS },
      ]
    },
    { id: 'tools', label: 'Outils', icon: Wrench, href: '/tools', view: undefined },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck, href: '/inspections', view: ViewState.INSPECTIONS_LIST },
    { id: 'issues', label: 'Problèmes', icon: AlertTriangle, href: '/issues', view: ViewState.ISSUES_LIST },
    {
      id: 'reminders',
      label: 'Rappels',
      icon: Clock,
      href: null,
      subItems: [
        { id: 'service-reminders', label: 'Rappels d\'entretien', href: '/reminders/service', view: ViewState.SERVICE_REMINDERS },
        { id: 'vehicle-renewals', label: 'Renouvellements véhicules', href: '/reminders/vehicle-renewals', view: ViewState.VEHICLE_RENEWALS },
        { id: 'contact-renewals', label: 'Renouvellements contacts', href: '/reminders/contact', view: ViewState.CONTACT_RENEWALS },
      ]
    },
    {
      id: 'service',
      label: 'Entretien',
      icon: Hammer,
      href: null,
      subItems: [
        { id: 'service-history', label: 'Historique d\'entretien', href: '/service/history', view: ViewState.SERVICE_HISTORY },
        { id: 'work-orders', label: 'Ordres de travail', href: '/service/work-orders', view: ViewState.WORK_ORDERS },
        { id: 'service-tasks', label: 'Tâches d\'entretien', href: '/service/tasks', view: ViewState.SERVICE_TASKS },
        { id: 'service-programs', label: 'Programmes d\'entretien', href: '/service/programs', view: ViewState.SERVICE_PROGRAMS },
      ]
    },
    { id: 'contacts', label: 'Contacts', icon: Users, href: '/contacts', view: ViewState.CONTACTS_LIST },
    { id: 'vendors', label: 'Fournisseurs', icon: Store, href: '/vendors', view: ViewState.VENDORS_LIST },
    {
      id: 'fuel',
      label: 'Carburant & Énergie',
      icon: Fuel,
      href: null,
      subItems: [
        { id: 'fuel-history', label: 'Historique carburant', href: '/fuel/history', view: ViewState.FUEL_HISTORY },
        { id: 'charging-history', label: 'Historique recharge', href: '/fuel/charging', view: ViewState.CHARGING_HISTORY },
      ]
    },
    { id: 'parts', label: 'Pièces', icon: Box, href: '/parts', view: ViewState.PARTS_LIST },
    { id: 'places', label: 'Lieux', icon: MapPin, href: '/places', view: ViewState.PLACES_LIST },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents', view: ViewState.DOCUMENTS_LIST },
    { id: 'integrations', label: 'Intégrations', icon: Grid, href: '/integrations', view: undefined },
    { id: 'reports', label: 'Rapports', icon: BarChart3, href: '/reports', view: ViewState.REPORTS_LIST },
  ];

  return (
    <div className="sidebar w-64 bg-[#0f4c3a] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-green-700">
      <div className="p-4 flex items-center gap-2 border-b border-[#1b6a50] sticky top-0 bg-[#0f4c3a] z-20">
        <Car className="h-8 w-8 text-white" />
        <span className="text-xl font-bold tracking-tight">FleetMada</span>
      </div>

      <div className="flex-1 py-4 pb-20">
        <div className="px-4 mb-2 text-xs font-semibold text-green-200 uppercase tracking-wider">
          Commencer
        </div>

        {menuItems.map((item) => {
          const isExpanded = expandedItems.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const active = item.href ? isActive(item.href, item.view) : (hasSubItems && isParentActive(item.subItems || []));

          return (
            <div key={item.id}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  data-testid={`sidebar-${item.id}`}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${active
                    ? 'bg-[#1b9a59] text-white border-l-4 border-white'
                    : 'text-gray-300 hover:bg-[#1b6a50] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                setView && item.view !== undefined ? (
                  <button
                    onClick={() => setView(item.view!)}
                    data-testid={`sidebar-${item.id}`}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${active
                      ? 'bg-[#1b9a59] text-white border-l-4 border-white'
                      : 'text-gray-300 hover:bg-[#1b6a50] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href || '#'}
                    data-testid={`sidebar-${item.id}`}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${active
                      ? 'bg-[#1b9a59] text-white border-l-4 border-white'
                      : 'text-gray-300 hover:bg-[#1b6a50] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                  </Link>
                )
              )}

              {hasSubItems && isExpanded && (
                <div className="bg-[#0b3d2e] py-1">
                  {item.subItems?.map((subItem) => (
                    setView && subItem.view !== undefined ? (
                      <button
                        key={subItem.label}
                        onClick={() => setView(subItem.view!)}
                        data-testid={`sidebar-${subItem.id || subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`w-full flex items-center pl-12 pr-4 py-2 text-sm transition-colors text-left ${isActive(subItem.href, subItem.view)
                          ? 'text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                          }`}
                      >
                        {subItem.label}
                      </button>
                    ) : (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        data-testid={`sidebar-${subItem.id || subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`w-full flex items-center pl-12 pr-4 py-2 text-sm transition-colors ${isActive(subItem.href, subItem.view)
                          ? 'text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                          }`}
                      >
                        {subItem.label}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-8 border-t border-[#1b6a50] pt-4 px-2">
          {setView ? (
            <button
              onClick={() => setView(ViewState.SETTINGS_GENERAL)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#1b6a50] hover:text-white rounded"
            >
              <Settings size={18} />
              Paramètres
            </button>
          ) : (
            <Link
              href="/settings/general"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#1b6a50] hover:text-white rounded"
            >
              <Settings size={18} />
              Paramètres
            </Link>
          )}
          <button
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#1b6a50] hover:text-white rounded"
          >
            <HelpCircle size={18} />
            Aide & Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;