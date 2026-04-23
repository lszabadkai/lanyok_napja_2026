"use client";

import { useEffect, useState } from "react";
import { getAllDecks, deleteDeck, type Deck } from "@/lib/db";
import DeckCard from "@/components/DeckCard";
import Link from "next/link";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllDecks().then((d) => {
      setDecks(d);
      setLoaded(true);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-foreground/40">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Decks</h1>
        <Link
          href="/create"
          className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          + New Deck
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-4xl">📚</p>
          <p className="text-foreground/50">No decks yet</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Create your first deck
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
