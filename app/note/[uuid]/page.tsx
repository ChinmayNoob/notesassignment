"use client"

import { useNote } from "@/lib/hooks/use-notes"
import { createClient } from "@/lib/supabase/client"
import { useEffect, use } from "react" // Import 'use' from React
import { redirect } from "next/navigation"
import Note from "@/components/note/note"
import { useUser } from '@/lib/hooks/user'

export default function Page({
  params,
}: {
  params: Promise<{ uuid: string }> // Update the type to Promise
}) {
  const { uuid } = use(params) // Unwrap the params Promise
  const { data: note, isLoading: noteLoading, error } = useNote(uuid)
  const { data: user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        redirect("/login")
      }
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-md text-center">
          <h1 className="text-xl font-medium mb-2">Note not found</h1>
          <p className="text-zinc-400 mb-4">This note may have been deleted or doesn&apos;t exist.</p>
          <button
            onClick={() => redirect("/")}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (noteLoading || userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading note...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-4">
      {note && (
        <Note
          serverNotes={note.notes}
          uuid={uuid}
          title={note.title}
          email={note.email || user?.email || ""}
        />
      )}
    </div>
  )
}