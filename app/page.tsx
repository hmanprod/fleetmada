"use client";

import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Car } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Rediriger vers le dashboard si authentifié
        router.replace('/dashboard');
      } else {
        // Rediriger vers login si non authentifié
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-[#0f4c3a] p-2 rounded-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#0f4c3a] tracking-tight">FleetMada</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  // Cette page ne devrait pas être visible longtemps car les redirections se font automatiquement
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-[#0f4c3a] p-2 rounded-lg">
          <Car className="h-8 w-8 text-white" />
        </div>
        <span className="text-3xl font-bold text-[#0f4c3a] tracking-tight">FleetMada</span>
      </div>
      <p className="text-gray-600">Redirection en cours...</p>
    </div>
  );
}