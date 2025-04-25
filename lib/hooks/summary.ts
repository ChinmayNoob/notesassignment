// lib/hooks/use-summary.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUpdateNote } from './use-notes'

interface SummaryOptions {
  text: string
  model: string
  length: string
  tone: string
}

export function useSummary(uuid: string, noteText?: string) {
  const updateNote = useUpdateNote()

  return useQuery({
    queryKey: ['summary', uuid],
    queryFn: async () => {
      if (!noteText) throw new Error('No note content')
      
      // Generate a new summary
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: noteText,
          model: 'gemini-1.5-pro',
          length: 'medium',
          tone: 'neutral'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate initial summary')
      }

      const data = await response.json()
      
      // Save the initial summary
      await updateNote.mutateAsync({
        uuid,
        notes: noteText,
        summary: data.summary,
      })
      
      return data.summary
    },
    enabled: !!uuid && !!noteText,
  })
}

export function useGenerateSummary(uuid: string) {
  const updateNote = useUpdateNote()

  return useMutation({
    mutationFn: async ({
      text,
      model,
      length,
      tone,
      shouldSave = false
    }: SummaryOptions & { shouldSave?: boolean }) => {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model, length, tone }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      return { summary: data.summary, shouldSave }
    },
    onSuccess: ({ summary, shouldSave }, variables) => {
      if (shouldSave) {
        updateNote.mutate({
          uuid,
          notes: variables.text,
          summary: summary,
        })
        toast.success('Summary generated and saved successfully')
      } else {
        toast.success('New summary generated successfully')
      }
    },
    onError: (error, variables) => {
      console.error('Error generating summary:', error)
      toast.error(
        variables.shouldSave
          ? 'Failed to generate and save summary'
          : 'Failed to generate new summary'
      )
    }
  })
}

export function useModels() {
  return useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const response = await fetch('/api/ai/models')
      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }
      const { data } = await response.json()
      return data
    }
  })
}