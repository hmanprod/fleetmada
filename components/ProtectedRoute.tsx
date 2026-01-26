"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Car, AlertTriangle, ShieldAlert } from 'lucide-react';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirection vers login avec message d'erreur si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Construire l'URL de redirection avec un message d'erreur
      const currentPath = window.location.pathname;
      const errorMessage = encodeURIComponent('Vous devez être connecté pour accéder à cette page.');
      const redirectUrl = `/login?error=${errorMessage}&from=${encodeURIComponent(currentPath)}`;

      // Redirection immédiate
      router.replace(redirectUrl);
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

  // Pendant la redirection, afficher un message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-[#0f4c3a] p-2 rounded-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#0f4c3a] tracking-tight">FleetMada</span>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Redirection en cours...</h2>
          <p className="text-gray-600">Vous allez être redirigé vers la page de connexion.</p>
          <p className="text-sm text-gray-500 mt-4">
            Accès non autorisé - Authentification requise
          </p>
        </div>
      </div>
    );
  }

  // Vérification du rôle si spécifié
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-[#0f4c3a] p-2 rounded-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#0f4c3a] tracking-tight">FleetMada</span>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <div className="flex items-center justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-6">
            Votre profil (**{user.role}**) ne dispose pas des permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-[#008751] text-white rounded-lg font-semibold hover:bg-[#007043] transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;