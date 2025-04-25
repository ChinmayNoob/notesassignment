"use client";

import { useNote } from "@/lib/hooks/use-notes";
import { useEffect, use, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Loader2, RefreshCw, Save, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGenerateSummary, useModels, useSummary } from "@/lib/hooks/summary";

export default function Page({
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const { uuid } = use(params);
    const { data: note, isLoading } = useNote(uuid);
    const supabase = createClient();

    // Fetch initial summary if needed
    const { data: initialSummary } = useSummary(
        uuid,
        note && !note.summary ? note.notes : undefined
    );

    // For generating new summaries
    const generateSummary = useGenerateSummary(uuid);

    // Fetch available AI models
    const { data: models = [], isLoading: isLoadingModels } = useModels();

    // Form state
    const [selectedModel, setSelectedModel] = useState<string>("gemini-1.5-pro");
    const [summaryLength, setSummaryLength] = useState<string>("medium");
    const [summaryTone, setSummaryTone] = useState<string>("neutral");

    // Auth check
    useEffect(() => {
        async function checkAuth() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                redirect("/login");
            }
        }
        checkAuth();
    }, []);

    // Determine current summary
    const currentSummary = note?.summary || initialSummary || "";
    const newSummary = generateSummary.data?.summary || "";
    const isGenerating = generateSummary.isPending;

    const handleGenerateSummary = (shouldSave: boolean = false) => {
        if (!note?.notes) return;

        generateSummary.mutate({
            text: note.notes,
            model: selectedModel,
            length: summaryLength,
            tone: summaryTone,
            shouldSave
        });
    };

    const handleSaveNewSummary = () => {
        if (!newSummary || !note) return;

        generateSummary.mutate({
            text: note.notes,
            model: selectedModel,
            length: summaryLength,
            tone: summaryTone,
            shouldSave: true
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-xl">Loading note...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-black text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <Link
                        href={`/`}
                        className="flex items-center text-zinc-400 hover:text-white mr-4 transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        <span className="text-sm">Back to Dashboard</span>
                    </Link>
                    <h1 className="text-3xl font-bold">Note Summary</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Model Selector */}
                    <div className="flex flex-col">
                        <label htmlFor="model-select" className="text-xs text-zinc-400 mb-1">Model</label>
                        <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={isLoadingModels || isGenerating}
                            className="w-[250px] px-3 py-2 rounded-md text-white bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        >
                            {isLoadingModels ? (
                                <option>Loading models...</option>
                            ) : (
                                models.map((model: { id: string }) => (
                                    <option key={model.id} value={model.id}>
                                        {model.id}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Length Selector */}
                    <div className="flex flex-col">
                        <label htmlFor="length-select" className="text-xs text-zinc-400 mb-1">Length</label>
                        <select
                            id="length-select"
                            value={summaryLength}
                            onChange={(e) => setSummaryLength(e.target.value)}
                            disabled={isGenerating}
                            className="w-[150px] px-3 py-2 rounded-md text-white bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="detailed">Detailed</option>
                        </select>
                    </div>

                    {/* Tone Selector */}
                    <div className="flex flex-col">
                        <label htmlFor="tone-select" className="text-xs text-zinc-400 mb-1">Tone</label>
                        <select
                            id="tone-select"
                            value={summaryTone}
                            onChange={(e) => setSummaryTone(e.target.value)}
                            disabled={isGenerating}
                            className="w-[150px] px-3 py-2 rounded-md text-white bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="neutral">Neutral</option>
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Technical</option>
                            <option value="simple">Simple</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateSummary(false)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 mt-6"
                    >
                        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate Summary
                    </Button>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">
                        {note?.title || "Untitled Note"}
                    </h2>
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-lg font-medium mb-2">Current Summary</h3>
                        {currentSummary ? (
                            <div className="bg-zinc-800 p-4 rounded-md">
                                <div className="prose prose-invert">
                                    {currentSummary}
                                </div>
                            </div>
                        ) : (
                            <div>No summary available yet.</div>
                        )}
                    </div>
                </div>

                {(isGenerating || newSummary) && (
                    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">New Summary</h3>
                            {newSummary && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSaveNewSummary}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Save New Summary
                                </Button>
                            )}
                        </div>
                        {isGenerating ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Generating new summary...</span>
                            </div>
                        ) : newSummary ? (
                            <div className="prose prose-invert max-w-none">
                                <div className="bg-zinc-800 p-4 rounded-md">
                                    <div className="prose prose-invert">
                                        {newSummary}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}