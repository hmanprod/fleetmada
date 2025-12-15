"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { AuthStep } from '../../types/auth';

interface AuthFlowState {
  currentStep: AuthStep;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
}

interface AuthFlowActions {
  navigateToRegister: () => void;
  navigateToLogin: () => void;
  navigateToOnboarding: () => void;
  handleOnboardingComplete: () => void;
}

// Hook personnalisé pour gérer le flux d'authentification
export const useAuthFlow = (initialStep: AuthStep = 'login'): AuthFlowState & AuthFlowActions => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);

  // Gestion des redirections basées sur l'état d'authentification
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, vérifier s'il a terminé l'onboarding
        if (!user || !user.companyId) {
          // Onboarding non complété : rediriger vers onboarding
          setCurrentStep('onboarding');
          router.replace('/onboarding');
        } else {
          // Onboarding complété : rediriger vers dashboard
          setCurrentStep('dashboard');
          router.replace('/dashboard');
        }
      } else {
        // Si non authentifié, rediriger vers login seulement si on était sur une page protégée
        if (currentStep === 'onboarding' || currentStep === 'dashboard') {
          setCurrentStep('login');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, currentStep, router]);

  const navigateToRegister = () => {
    setCurrentStep('register');
    router.push('/register');
  };

  const navigateToLogin = () => {
    setCurrentStep('login');
    router.push('/login');
  };

  const navigateToOnboarding = () => {
    setCurrentStep('onboarding');
    router.push('/onboarding');
  };

  const handleOnboardingComplete = () => {
    // Redirection vers le dashboard principal
    router.replace('/dashboard');
  };

  return {
    currentStep,
    isAuthenticated,
    isLoading,
    user,
    navigateToRegister,
    navigateToLogin,
    navigateToOnboarding,
    handleOnboardingComplete
  };
};

export default useAuthFlow;