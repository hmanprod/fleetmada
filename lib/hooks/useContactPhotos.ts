import { useState, useCallback } from 'react';
import { Photo } from '@/types/photos';

export function useContactPhotos(contactId: string) {
    // Return empty state for now as backend support is pending
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addPhoto = async (files: FileList) => {
        console.warn('Contact photos API not implemented');
    };

    const deletePhoto = async (id: string) => {
        console.warn('Contact photos API not implemented');
    };

    return {
        photos,
        loading,
        error,
        addPhoto,
        deletePhoto,
        refreshPhotos: () => { }
    };
}
