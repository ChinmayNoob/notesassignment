// /components/Dashboard.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Trash2, FileText, Plus, Search } from "lucide-react";
import { useNotes, useDeleteNote } from "@/lib/hooks/use-notes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react"

const stripHtmlTags = (html: string) => {
    return html?.replace(/<[^>]*>/g, "");
};

export default function Dashboard() {
    const { data: notes = [], isLoading } = useNotes();
    const router = useRouter();
    const supabase = createClient();
    const deleteNote = useDeleteNote();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (error) console.error("Error fetching user:", error);
            if (user) setUser(user);
        }
        fetchUser();
    }, [supabase]);

    const displayName = user?.user_metadata?.full_name || user?.email || "User";
    const avatarUrl = user?.user_metadata?.avatar_url;
    const fallbackInitial = displayName.charAt(0).toUpperCase();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleDelete = async (uuid: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this note?")) {
            deleteNote.mutate(uuid);
        }
    };

    const handleSummarize = (uuid: string, e: React.MouseEvent) => {
        e.preventDefault();
        router.push(`/note/${uuid}/summary`);
    };

    const filteredNotes = notes.filter(
        (note) =>
            note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stripHtmlTags(note.notes)
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            My Notes
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search notes..."
                                className="pl-10 w-full bg-gray-900 border-gray-700 text-white rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Link href="/note">
                                <Plus className="h-4 w-4" /> New
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full border border-gray-700"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                        <AvatarFallback className="bg-blue-800">
                                            {fallbackInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-gray-900 border border-gray-800 text-white"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {displayName}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem
                                    className="text-red-400 cursor-pointer focus:bg-gray-800"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8 p-10 border border-dashed border-gray-700 rounded-lg">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-2">No notes found</h3>
                        <p>Create your first note to get started!</p>
                        <Button
                            asChild
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href="/note">Create Note</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredNotes
                            .sort(
                                (a, b) =>
                                    new Date(b.updated_at).getTime() -
                                    new Date(a.updated_at).getTime()
                            )
                            .map((note, index) => (
                                <motion.div
                                    key={note.uuid}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="border border-gray-800 bg-gray-900 rounded-lg p-5 hover:shadow-lg hover:shadow-blue-900/20 transition-all relative group h-[200px] overflow-hidden"
                                >
                                    <Link
                                        href={`/note/${note.uuid}`}
                                        className="h-full flex flex-col"
                                    >
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold mb-2 text-blue-300">
                                                {note.title || "Untitled Note"}
                                            </h2>
                                            <p className="text-gray-300 line-clamp-3">
                                                {stripHtmlTags(note.notes)}
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 self-end">
                                            Updated {new Date(note.updated_at).toLocaleDateString()}
                                        </div>
                                    </Link>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-full"
                                            onClick={(e) => handleSummarize(note.uuid, e)}
                                            title="Summarize"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-full"
                                            onClick={(e) => handleDelete(note.uuid, e)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}