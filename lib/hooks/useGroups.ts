import { useState, useCallback, useEffect } from 'react';
import { groupsAPI, Group } from '@/lib/services/contacts-api';

export type { Group };

export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await groupsAPI.getGroups();
            setGroups(data);
        } catch (err) {
            setError('Erreur lors de la récupération des groupes');
        } finally {
            setLoading(false);
        }
    }, []);

    const createGroup = async (name: string, color?: string) => {
        setIsSaving(true);
        try {
            const result = await groupsAPI.createGroup(name, color);
            if (result.success) {
                await fetchGroups();
                return { success: true, data: result.data };
            }
            return { success: false, error: result.error };
        } catch (err) {
            return { success: false, error: 'Erreur lors de la création du groupe' };
        } finally {
            setIsSaving(false);
        }
    };

    const updateGroup = async (id: string, name: string, color?: string) => {
        setIsSaving(true);
        try {
            const result = await groupsAPI.updateGroup(id, name, color);
            if (result.success) {
                await fetchGroups();
                return { success: true, data: result.data };
            }
            return { success: false, error: result.error };
        } catch (err) {
            return { success: false, error: 'Erreur lors de la mise à jour du groupe' };
        } finally {
            setIsSaving(false);
        }
    };

    const deleteGroup = async (id: string) => {
        setLoading(true);
        try {
            const result = await groupsAPI.deleteGroup(id);
            if (result.success) {
                await fetchGroups();
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (err) {
            return { success: false, error: 'Erreur lors de la suppression du groupe' };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return {
        groups,
        loading,
        error,
        isSaving,
        fetchGroups,
        createGroup,
        updateGroup,
        deleteGroup
    };
}
