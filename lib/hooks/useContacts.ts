// Hooks React pour la gestion des contacts
'use client';

import { useState, useEffect } from 'react';
import { contactsAPI, type Contact, type ContactFilters, type CreateContactRequest, type UpdateContactRequest } from '@/lib/services/contacts-api';

export interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  fetchContacts: (filters?: ContactFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

// Hook pour récupérer la liste des contacts avec filtres et pagination
export function useContacts(initialFilters: ContactFilters = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseContactsReturn['pagination']>(null);
  const [currentFilters, setCurrentFilters] = useState<ContactFilters>(initialFilters);

  const fetchContacts = async (filters: ContactFilters = currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactsAPI.getContacts(filters);
      
      setContacts(response.data.contacts);
      setPagination(response.data.pagination);
      setCurrentFilters(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchContacts();
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    pagination,
    fetchContacts,
    refetch,
  };
}

// Hook pour récupérer un contact spécifique
export function useContact(contactId: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactsAPI.getContact(contactId);
      setContact(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du contact');
      console.error('Error fetching contact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  return { contact, loading, error, refetch: fetchContact };
}

// Hook pour créer un contact
export function useCreateContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createContact = async (data: CreateContactRequest): Promise<Contact | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await contactsAPI.createContact(data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du contact';
      setError(errorMessage);
      console.error('Error creating contact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { createContact, loading, error, success, reset };
}

// Hook pour mettre à jour un contact
export function useUpdateContact(contactId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateContact = async (data: UpdateContactRequest): Promise<Contact | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await contactsAPI.updateContact(contactId, data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du contact';
      setError(errorMessage);
      console.error('Error updating contact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { updateContact, loading, error, success, reset };
}

// Hook pour supprimer un contact
export function useDeleteContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteContact = async (contactId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await contactsAPI.deleteContact(contactId);
      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du contact';
      setError(errorMessage);
      console.error('Error deleting contact:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { deleteContact, loading, error, success, reset };
}

// Hook pour la recherche de contacts
export function useContactSearch() {
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContacts = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await contactsAPI.searchContacts(query);
      setResults(response.data.contacts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      console.error('Error searching contacts:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, searchContacts, clearResults };
}

// Hook pour les assignments de véhicules d'un contact
export function useContactAssignments(contactId: string) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactsAPI.getContact(contactId);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des assignments');
      console.error('Error fetching contact assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [contactId]);

  return { assignments, loading, error, refetch: fetchAssignments };
}