"use client";

import { useState, useEffect, useMemo } from 'react';

// Utilitaire pour récupérer le token d'authentification
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le token depuis localStorage ou cookies
    const storedToken = localStorage.getItem('authToken') ||
      document.cookie.match(/authToken=([^;]*)/)?.[1];

    console.log('useAuthToken: Récupération du token depuis storage:', {
      hasLocalStorageToken: !!localStorage.getItem('authToken'),
      hasCookieToken: !!document.cookie.match(/authToken=([^;]*)/)?.[1],
      tokenLength: storedToken?.length || 0
    });

    if (storedToken) {
      setToken(storedToken);
      console.log('useAuthToken: Token défini avec succès');
    } else {
      console.log('useAuthToken: Aucun token trouvé');
    }
    setLoading(false);
  }, []);

  return useMemo(() => ({
    token,
    loading
  }), [token, loading]);
}

// Utilitaire pour les requêtes API authentifiées
export async function authenticatedFetch(
  url: string,
  token: string,
  options: RequestInit = {}
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}