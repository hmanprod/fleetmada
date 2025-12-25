"use client";

import React, { useState, useEffect } from 'react';
import { Car, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

import useAuthFlow from '../../components/AuthFlow';

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Activer le flux d'authentification pour gérer les redirections
  useAuthFlow('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Récupérer l'erreur depuis l'URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const fromParam = searchParams.get('from');
    
    if (errorParam) {
      try {
        const decodedError = decodeURIComponent(errorParam);
        setUrlError(decodedError);
        
        // Nettoyer l'URL après avoir récupéré l'erreur
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('from');
        window.history.replaceState({}, '', newUrl.toString());
      } catch (e) {
        console.warn('Erreur lors du décodage du message d\'erreur:', e);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      // La redirection se fera automatiquement via le hook useAuthFlow ou la page d'accueil
    } catch (error) {
      // L'erreur est gérée par le contexte
    }
  };

  const handleNavigateToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-[#0f4c3a] p-2 rounded-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#0f4c3a] tracking-tight">FleetMada</span>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
          Connectez-vous à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <button onClick={handleNavigateToRegister} className="font-medium text-[#008751] hover:text-[#007043]">
            commencez votre essai gratuit de 14 jours
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          {(error || urlError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{error || urlError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="email-input"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-[#008751] focus:border-[#008751] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  data-testid="password-input"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-[#008751] focus:border-[#008751] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#008751] focus:ring-[#008751] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#008751] hover:text-[#007043]">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                data-testid="login-button"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008751] hover:bg-[#007043] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008751] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Nouveau dans la gestion de flotte ?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={handleNavigateToRegister}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;