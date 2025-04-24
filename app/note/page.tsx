"use client"

import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { useEffect } from "react"
import Note from "@/components/note/note"
import { useUser } from '@/lib/hooks/user'

export default function Page() {
  const supabase = createClient()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        redirect('/login')
      }
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-4">
      <Note email={user?.email || ""} />
    </div>
  )
}