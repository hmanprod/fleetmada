"use client"

import { useState, useEffect, useCallback } from 'react'
import { serviceAPI, ServiceEntryComment, ServiceEntryCommentData, ServiceEntryCommentUpdateData } from '@/lib/services/service-api'

interface UseServiceEntryCommentsReturn {
    comments: ServiceEntryComment[]
    loading: boolean
    error: string | null
    fetchComments: (serviceEntryId: string) => Promise<void>
    addComment: (serviceEntryId: string, data: ServiceEntryCommentData) => Promise<ServiceEntryComment>
    updateComment: (serviceEntryId: string, commentId: string, data: ServiceEntryCommentUpdateData) => Promise<ServiceEntryComment>
    deleteComment: (serviceEntryId: string, commentId: string) => Promise<void>
    clearError: () => void
    refetch: () => Promise<void>
}

export function useServiceEntryComments(serviceEntryId: string | null): UseServiceEntryCommentsReturn {
    const [comments, setComments] = useState<ServiceEntryComment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchComments = useCallback(async (id: string) => {
        if (!id) {
            setComments([])
            return
        }

        try {
            setLoading(true)
            setError(null)

            const commentsData = await serviceAPI.getServiceEntryComments(id)
            setComments(commentsData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des commentaires'
            setError(errorMessage)
            setComments([])
            console.error('Erreur useServiceEntryComments:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const addComment = useCallback(async (id: string, data: ServiceEntryCommentData): Promise<ServiceEntryComment> => {
        try {
            setError(null)
            const newComment = await serviceAPI.addServiceEntryComment(id, data)

            setComments(prev => [...prev, newComment])

            return newComment
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire'
            setError(errorMessage)
            throw err
        }
    }, [])

    const updateComment = useCallback(async (serviceEntryId: string, commentId: string, data: ServiceEntryCommentUpdateData): Promise<ServiceEntryComment> => {
        try {
            setError(null)
            const updatedComment = await serviceAPI.updateServiceEntryComment(serviceEntryId, commentId, data)

            setComments(prev => prev.map(comment =>
                comment.id === commentId ? updatedComment : comment
            ))

            return updatedComment
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du commentaire'
            setError(errorMessage)
            throw err
        }
    }, [])

    const deleteComment = useCallback(async (serviceEntryId: string, commentId: string): Promise<void> => {
        try {
            setError(null)
            await serviceAPI.deleteServiceEntryComment(serviceEntryId, commentId)

            setComments(prev => prev.filter(comment => comment.id !== commentId))
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire'
            setError(errorMessage)
            throw err
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const refetch = useCallback(async () => {
        if (serviceEntryId) {
            await fetchComments(serviceEntryId)
        }
    }, [serviceEntryId, fetchComments])

    useEffect(() => {
        if (serviceEntryId) {
            fetchComments(serviceEntryId)
        } else {
            setComments([])
            setError(null)
        }
    }, [serviceEntryId, fetchComments])

    return {
        comments,
        loading,
        error,
        fetchComments,
        addComment,
        updateComment,
        deleteComment,
        clearError,
        refetch
    }
}
