import { useState, useEffect, useCallback } from 'react';
import { issuesAPI, IssueImage } from '@/lib/services/issues-api';
import { Photo } from '@/types/photos';

export function useIssuePhotos(issueId: string) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        if (!issueId) return;
        setLoading(true);
        setError(null);
        try {
            const images = await issuesAPI.getIssueImages(issueId);
            // Map IssueImage to Photo
            const mappedPhotos: Photo[] = images.map(img => ({
                id: img.id,
                filePath: img.filePath,
                fileName: img.fileName,
                fileSize: img.fileSize,
                description: img.fileName, // Use filename as description fallback
                createdAt: img.createdAt,
                entityType: 'issue',
                entityId: issueId,
                locationType: 'other',
                mimeType: img.mimeType || 'image/jpeg',
                userId: 'unknown',
                userName: 'System',
                isPublic: true,
                updatedAt: img.createdAt
            }));
            setPhotos(mappedPhotos);
        } catch (err) {
            console.error('Failed to fetch issue photos:', err);
            setError('Failed to load photos');
        } finally {
            setLoading(false);
        }
    }, [issueId]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const addPhoto = async (files: FileList, locationType?: string) => {
        if (!issueId) return;
        try {
            const fileArray = Array.from(files);
            const newImages = await issuesAPI.uploadIssueImages(issueId, fileArray);
            // Optimistic update or refresh
            const mappedNewPhotos: Photo[] = newImages.map(img => ({
                id: img.id,
                filePath: img.filePath,
                fileName: img.fileName,
                fileSize: img.fileSize,
                description: img.fileName,
                createdAt: img.createdAt,
                entityType: 'issue',
                entityId: issueId,
                locationType: (locationType as any) || 'other',
                mimeType: img.mimeType || 'image/jpeg',
                userId: 'unknown',
                userName: 'System',
                isPublic: true,
                updatedAt: img.createdAt
            }));
            setPhotos(prev => [...mappedNewPhotos, ...prev]);
        } catch (err) {
            console.error('Failed to upload photos:', err);
            throw err;
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!issueId) return;
        try {
            await issuesAPI.deleteIssueImage(issueId, photoId);
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
