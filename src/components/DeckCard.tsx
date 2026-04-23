"use client";

import Link from "next/link";
import type { Deck } from "@/lib/db";

interface DeckCardProps {
  deck: Deck;
  onDelete: (id: string) => void;
}

export default function DeckCard({ deck, onDelete }: DeckCardProps) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{deck.title}</h3>
          <p className="text-sm text-foreground/50">
            {deck.cardCount} cards &middot;{" "}
            {deck.sourceLang.toUpperCase()} → {deck.targetLang.toUpperCase()} &middot;{" "}
            {deck.difficulty}
          </p>
          <p className="text-xs text-foreground/30 mt-1">
            {new Date(deck.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(deck.id);
          }}
          className="text-red-400 hover:text-red-500 text-sm px-2 py-1"
          aria-label="Delete deck"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-1">
        <Link
          href={`/deck?id=${deck.id}`}
          className="flex-1 text-center py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm transition-colors"
        >
          View
        </Link>
        <Link
          href={`/study?deckId=${deck.id}`}
          className="flex-1 text-center py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
        >
          Study
        </Link>
      </div>
    </div>
  );
}
