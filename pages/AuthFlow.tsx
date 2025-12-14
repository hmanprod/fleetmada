"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import Login from './auth/Login';
import Register from './auth/Register';
import Onboarding from './auth/Onboarding';
import ProtectedRoute from '../components/ProtectedRoute';

type AuthStep = 'login' | 'register' | 'onboarding' | 'dashboard';

const AuthFlow: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');

  // Gestion des redirections basées sur l'état d'authentification
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, vérifier s'il a terminé l'onboarding
        // Si pas d'utilisateur ou pas d'onboarding complété, aller à l'onboarding
        if (!user || !user.companyId) {
          setCurrentStep('onboarding');
        } else {
          setCurrentStep('dashboard');
        }
      } else {
        setCurrentStep('login');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handleLogin = () => {
    // Le login est géré par le contexte auth
    // La redirection se fera automatiquement via useEffect
  };

  const handleRegister = () => {
    // Le register est géré par le contexte auth
    // La redirection se fera automatiquement via useEffect
  };

  const handleOnboardingComplete = () => {
    // Redirection vers le dashboard principal
    router.push('/app/(main)');
  };

  const navigateToRegister = () => {
    setCurrentStep('register');
  };

  const navigateToLogin = () => {
    setCurrentStep('login');
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  // Rendu conditionnel basé sur l'étape actuelle
  switch (currentStep) {
    case 'login':
      return <Login onNavigateToRegister={navigateToRegister} />;
    
    case 'register':
      return <Register onNavigateToLogin={navigateToLogin} />;
    
    case 'onboarding':
      return (
        <ProtectedRoute>
          <Onboarding onComplete={handleOnboardingComplete} />
        </ProtectedRoute>
      );
    
    case 'dashboard':
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
            <p className="mt-4 text-gray-600">Redirection vers le tableau de bord...</p>
          </div>
        </ProtectedRoute>
      );
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
          <p className="text-gray-600">Erreur de navigation</p>
        </div>
      );
  }
};

export default AuthFlow;