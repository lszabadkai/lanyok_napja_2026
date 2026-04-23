"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getDeck, getCardsByDeck, deleteDeck, type Deck, type Card } from "@/lib/db";

function DeckDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = searchParams.get("id") ?? "";

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!deckId) {
      setLoaded(true);
      return;
    }
    Promise.all([getDeck(deckId), getCardsByDeck(deckId)]).then(([d, c]) => {
      setDeck(d ?? null);
      setCards(c);
      setLoaded(true);
    });
  }, [deckId]);

  async function handleDelete() {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck(deckId);
    router.push("/");
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-foreground/40">Loading...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-foreground/50">Deck not found</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white">
          Back to Decks
        </Link>
      </div>
    );
  }

  const knownCount = cards.filter((c) => c.known).length;

  const difficultyStyles: Record<string, string> = {
    beginner: "border-l-green-500 bg-green-500/5",
    intermediate: "border-l-amber-500 bg-amber-500/5",
    advanced: "border-l-red-500 bg-red-500/5",
  };
  const cardAccent = difficultyStyles[deck?.difficulty ?? ""] ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-foreground/40 hover:text-foreground/60">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold mt-1">{deck.title}</h1>
          <p className="text-sm text-foreground/50 mt-1">
            {deck.cardCount} cards &middot;{" "}
            {deck.sourceLang.toUpperCase()} → {deck.targetLang.toUpperCase()} &middot;{" "}
            {deck.difficulty}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-500 text-sm px-3 py-1 rounded-lg border border-red-400/30"
        >
          Delete
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-foreground/50">
          <span>Known</span>
          <span>{knownCount} / {cards.length}</span>
        </div>
        <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: cards.length ? `${(knownCount / cards.length) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/study?deckId=${deckId}`}
          className="flex-1 text-center py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
        >
          Study EN → HU
        </Link>
        <Link
          href={`/study?deckId=${deckId}&reverse=1`}
          className="flex-1 text-center py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
        >
          Study HU → EN
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">All Cards</h2>
        <div className="space-y-1">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center justify-between py-2 px-3 rounded-lg border-l-2 ${
                card.known
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-l-green-500"
                  : `${cardAccent}`
              }`}
            >
              <span className="font-medium">{card.front}</span>
              <span className="text-foreground/50">{card.back}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DeckPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-foreground/40">Loading...</p></div>}>
      <DeckDetail />
    </Suspense>
  );
}
