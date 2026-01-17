import { useState, useEffect, useCallback } from 'react';
import { serviceAPI, ServiceEntryPhoto } from '@/lib/services/service-api';
import { Photo } from '@/types/photos';

export function useServiceEntryPhotos(serviceEntryId: string) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        if (!serviceEntryId) return;
        setLoading(true);
        setError(null);
        try {
            const images = await serviceAPI.getServiceEntryPhotos(serviceEntryId);
            // Map ServiceEntryPhoto to Photo
            const mappedPhotos: Photo[] = images.map(img => ({
                id: img.id,
                filePath: img.filePath,
                fileName: img.fileName,
                fileSize: img.fileSize,
                description: img.fileName,
                createdAt: new Date(img.createdAt),
                entityType: 'serviceEntry',
                entityId: serviceEntryId,
                locationType: 'other',
                mimeType: img.mimeType || 'image/jpeg',
                userId: 'unknown',
                userName: 'System',
                isPublic: true,
                updatedAt: new Date(img.createdAt)
            }));
            setPhotos(mappedPhotos);
        } catch (err) {
            console.error('Failed to fetch service entry photos:', err);
            setError('Failed to load photos');
        } finally {
            setLoading(false);
        }
    }, [serviceEntryId]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const addPhoto = async (files: FileList, locationType?: string) => {
        if (!serviceEntryId) return;
        try {
            const fileArray = Array.from(files);
            const newImages = await serviceAPI.uploadServiceEntryPhotos(serviceEntryId, fileArray);
            // Optimistic update or refresh
            const mappedNewPhotos: Photo[] = newImages.map(img => ({
                id: img.id,
                filePath: img.filePath,
                fileName: img.fileName,
                fileSize: img.fileSize,
                description: img.fileName,
                createdAt: new Date(img.createdAt),
                entityType: 'serviceEntry',
                entityId: serviceEntryId,
                locationType: (locationType as any) || 'other',
                mimeType: img.mimeType || 'image/jpeg',
                userId: 'unknown',
                userName: 'System',
                isPublic: true,
                updatedAt: new Date(img.createdAt)
            }));
            setPhotos(prev => [...mappedNewPhotos, ...prev]);
        } catch (err) {
            console.error('Failed to upload photos:', err);
            throw err;
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!serviceEntryId) return;
        try {
            await serviceAPI.deleteServiceEntryPhoto(serviceEntryId, photoId);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) {
            console.error('Failed to delete photo:', err);
            throw err;
        }
    };

    return {
        photos,
        loading,
        error,
        addPhoto,
        deletePhoto,
        refreshPhotos: fetchPhotos
    };
}
