"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { Car } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Attendre que l'état d'authentification soit chargé
    if (isLoading) {
      return;
    }

    // Redirection basée sur l'état d'authentification
    if (!isAuthenticated) {
      // Non authentifié : rediriger vers login
      router.replace('/auth/login');
      return;
    }

    // Authentifié : vérifier l'état de l'onboarding
    if (isAuthenticated) {
      if (!user || !user.companyId) {
        // Onboarding non complété : rediriger vers onboarding
        router.replace('/auth/onboarding');
        return;
      } else {
        // Onboarding complété : rediriger vers dashboard
        router.replace('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Affichage du chargement pendant la vérification d'authentification
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
