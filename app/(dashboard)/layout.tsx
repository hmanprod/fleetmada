import React from 'react';
import { Metadata } from 'next';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export const metadata: Metadata = {
  title: 'Tableau de bord - FleetMada',
  description: 'Gestion de votre flotte de véhicules',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0 relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}