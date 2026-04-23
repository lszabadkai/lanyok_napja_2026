"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextSourceTabs from "@/components/TextSourceTabs";
import { extractWords } from "@/lib/word-processor";
import { translateBatch } from "@/lib/translate";
import {
  createDeck,
  addCards,
  getCachedTranslation,
  setCachedTranslation,
  type Deck,
  type Card,
} from "@/lib/db";

type Difficulty = "beginner" | "intermediate" | "advanced";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleTextReady(text: string) {
    if (!title.trim()) {
      setError("Please enter a deck title first.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Extracting words...");

    try {
      const result = extractWords(text, difficulty);

      if (result.words.length === 0) {
        setError(
          `No words found after filtering. Found ${result.totalFound} unique words, ${result.afterStopWords} after removing stop words, 0 matching "${difficulty}" difficulty. Try a different difficulty level or more text.`
        );
        setLoading(false);
        return;
      }

      setStatus(
        `Found ${result.afterDifficulty} words. Translating...`
      );

      // Check cache first, then translate uncached words
      const translations: Record<string, string> = {};
      const uncached: string[] = [];

      for (const word of result.words) {
        const cached = await getCachedTranslation(word, "en", "hu");
        if (cached) {
          translations[word] = cached;
        } else {
          uncached.push(word);
        }
      }

      // Translate uncached words client-side via MyMemory API
      if (uncached.length > 0) {
        const batchResult = await translateBatch(
          uncached,
          "en",
          "hu",
          (done, total) => setStatus(`Translating... ${done}/${total} words`)
        );
        for (const [word, translation] of Object.entries(batchResult)) {
          translations[word] = translation;
          await setCachedTranslation(word, "en", "hu", translation);
        }
      }

      // Create deck
      const deckId = crypto.randomUUID();
      const deck: Deck = {
        id: deckId,
        title: title.trim(),
        sourceLang: "en",
        targetLang: "hu",
        difficulty,
        createdAt: Date.now(),
        cardCount: result.words.length,
      };

      const cards: Card[] = result.words.map((word) => ({
        id: crypto.randomUUID(),
        deckId,
        front: word,
        back: translations[word] || word,
        known: false,
        lastStudied: null,
        createdAt: Date.now(),
      }));

      setStatus("Saving deck...");
      await createDeck(deck);
      await addCards(cards);

      router.push(`/deck?id=${deckId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Deck</h1>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/70">
          Deck Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Kitchen Vocabulary"
          className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Language (fixed for now) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/70">
          Language Pair
        </label>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-sm text-foreground/50">
          English → Hungarian
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/70">
          Difficulty
        </label>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as Difficulty[]).map(
            (d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
                  difficulty === d
                    ? "bg-blue-500 text-white font-medium"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {d}
              </button>
            )
          )}
        </div>
        <p className="text-xs text-foreground/40">
          {difficulty === "beginner" && "Only the most common ~500 English words"}
          {difficulty === "intermediate" && "Common ~2000 English words"}
          {difficulty === "advanced" && "All words (no frequency filter)"}
        </p>
      </div>

      {/* Text Source */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/70">
          Text Source
        </label>
        <TextSourceTabs onTextReady={handleTextReady} loading={loading} />
      </div>

      {/* Status */}
      {status && (
        <div className="flex items-center gap-2 text-sm text-blue-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          {status}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
