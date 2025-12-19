"use client"

import { useState, useEffect, useCallback } from 'react'
import issuesAPI, { Comment, IssueCommentData, IssueCommentUpdateData } from '@/lib/services/issues-api'

interface UseIssueCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  fetchComments: (issueId: string) => Promise<void>
  addComment: (issueId: string, data: IssueCommentData) => Promise<Comment>
  updateComment: (issueId: string, commentId: string, data: IssueCommentUpdateData) => Promise<Comment>
  deleteComment: (issueId: string, commentId: string) => Promise<void>
  clearError: () => void
  refetch: () => Promise<void>
}

export function useIssueComments(issueId: string | null): UseIssueCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
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
      
      const commentsData = await issuesAPI.getIssueComments(id)
      setComments(commentsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des commentaires'
      setError(errorMessage)
      setComments([])
      console.error('Erreur useIssueComments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addComment = useCallback(async (id: string, data: IssueCommentData): Promise<Comment> => {
    try {
      setError(null)
      const newComment = await issuesAPI.addIssueComment(id, data)
      
      // Ajouter le commentaire à la liste locale
      setComments(prev => [...prev, newComment])
      
      return newComment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateComment = useCallback(async (issueId: string, commentId: string, data: IssueCommentUpdateData): Promise<Comment> => {
    try {
      setError(null)
      const updatedComment = await issuesAPI.updateIssueComment(issueId, commentId, data)
      
      // Mettre à jour le commentaire dans la liste locale
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

  const deleteComment = useCallback(async (issueId: string, commentId: string): Promise<void> => {
    try {
      setError(null)
      await issuesAPI.deleteIssueComment(issueId, commentId)
      
      // Supprimer le commentaire de la liste locale
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
    if (issueId) {
      await fetchComments(issueId)
    }
  }, [issueId, fetchComments])

  // Charger les commentaires quand issueId change
  useEffect(() => {
    if (issueId) {
      fetchComments(issueId)
    } else {
      setComments([])
      setError(null)
    }
  }, [issueId, fetchComments])

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

export default useIssueComments