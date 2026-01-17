import { useState, useEffect, useCallback } from 'react';
import { serviceAPI, ServiceEntry } from '@/lib/services/service-api';

export function useServiceEntry(id: string) {
    const [entry, setEntry] = useState<ServiceEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEntry = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await serviceAPI.getServiceEntry(id);
            if (response.success) {
                setEntry(response.data);
            } else {
                setError(response.message || 'Failed to fetch service entry');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEntry();
    }, [fetchEntry]);

    return { entry, loading, error, refetch: fetchEntry };
}
