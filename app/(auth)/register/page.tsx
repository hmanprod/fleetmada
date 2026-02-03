"use client";

import React, { useState } from 'react';
import { Car, Mail, Lock, User, Building, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';

import useAuthFlow from '../../components/AuthFlow';

const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // Activer le flux d'authentification
  useAuthFlow('register');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas");
      setFormData(prev => ({ ...prev, confirmPassword: '' }));
      return;
    }

    if (!formData.termsAccepted) {
      setLocalError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password
      });
      // La redirection se fera automatiquement vers l'onboarding
    } catch (error) {
      // L'erreur est gérée par le contexte
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="p-2 rounded-lg relative w-48 h-16">
            <Image
              src="/img/logo-dark.png"
              alt="FleetMada Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
          Commencez la gestion de votre flotte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <button onClick={handleNavigateToLogin} className="font-medium text-[#008751] hover:text-[#007043]">
            Se connecter
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{error || localError}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="block w-full pl-9 sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="block w-full sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="block w-full pl-9 sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="Logistique Acme"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-9 sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="vous@entreprise.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-9 sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="block w-full pl-9 sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="h-4 w-4 text-[#008751] focus:ring-[#008751] border-gray-300 rounded"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  J'accepte les <a href="#" className="text-[#008751] hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-[#008751] hover:underline">Politique de confidentialité</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008751] hover:bg-[#007043] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008751] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Inscription...
                </>
              ) : (
                <>
                  Commencer <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Aucune carte de crédit requise. Annulez à tout moment.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;