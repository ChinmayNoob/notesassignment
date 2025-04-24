'use client'
import { useDeleteNote, useNotes } from '@/lib/hooks/use-notes'
import { useUser } from '@/lib/hooks/user'
import { useRouter } from 'next/navigation'
import React from 'react'
import LoadingScreen from './loading-screen'
import { Button } from './ui/button'
import { FileText, LogOut, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/api/auth/actions'


const stripHtmlTags = (html: string) => {
  return html?.replace(/<[^>]*>/g, '')
}

const Dashboard = () => {
  const { data: notes = [], isLoading } = useNotes()
  const router = useRouter()
  const deleteNote = useDeleteNote()
  const { data: user } = useUser()

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(uuid)
    }
  }

  const handleSummary = (uuid: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/note/${uuid}/summary`)
  }

  const handleCreateNote = () => {
    router.push('/note')
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-black/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Crollo
          </h1>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <p className="text-sm text-zinc-400 hidden sm:block">
              Hi, <span className="font-medium text-white">{displayName}</span>
            </p>

            <Button
              onClick={handleCreateNote}
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full h-9 px-4 text-sm"
            >
              <Plus size={16} className="mr-1" />
              Create
            </Button>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-9 w-9 p-0"
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mobile welcome banner */}
        <div className="sm:hidden mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <p className="text-sm text-zinc-400">
            Welcome back, <span className="font-medium text-white">{displayName}</span>
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 max-w-md">
              <h2 className="text-xl font-medium mb-2">No notes yet</h2>
              <p className="text-zinc-400 mb-4">Start by creating your first note</p>
              <Button
                onClick={handleCreateNote}
                className="bg-white hover:bg-zinc-200 text-black rounded-full"
              >
                <Plus size={16} className="mr-1" />
                Create Note
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((note) => (
                <Link
                  href={`/note/${note.uuid}`}
                  key={note.uuid}
                  className="block group"
                >
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all h-[200px] flex flex-col relative overflow-hidden">
                    <div className="flex-1">
                      <h2 className="text-lg font-medium mb-2 line-clamp-1">{note.title || "Untitled Note"}</h2>
                      <p className="text-zinc-400 text-sm line-clamp-3">{stripHtmlTags(note.notes)}</p>
                    </div>

                    <div className="text-xs text-zinc-500 mt-2">
                      {new Date(note.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-zinc-900/80 backdrop-blur-sm rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700"
                        onClick={(e) => handleSummary(note.uuid, e)}
                        title="Summarize"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-700"
                        onClick={(e) => handleDelete(note.uuid, e)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard