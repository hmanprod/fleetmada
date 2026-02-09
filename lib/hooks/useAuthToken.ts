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
  const controller = options.signal ? null : new AbortController();
  const timeoutMs = 30000;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      throw new Error(`Délai d'attente dépassé (${timeoutMs} ms) pour ${url}`);
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const statusText =
      response.status === 400 ? 'Requête invalide' :
        response.status === 401 ? 'Non autorisé' :
          response.status === 403 ? 'Accès interdit' :
            response.status === 404 ? 'Ressource introuvable' :
              response.status === 409 ? 'Conflit' :
                response.status === 429 ? 'Trop de requêtes' :
                  response.status >= 500 ? 'Erreur interne du serveur' :
                    response.statusText || 'Erreur inconnue';
    throw new Error(`Erreur API : ${response.status} ${statusText}`);
  }

  return response.json();
}
