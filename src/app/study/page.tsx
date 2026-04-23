"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FlashCard from "@/components/FlashCard";
import { getDeck, getCardsByDeck, updateCard, type Deck, type Card } from "@/lib/db";
import { playChime } from "@/lib/audio";

function StudyContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId") ?? "";
  const reverse = searchParams.get("reverse") === "1";

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!deckId) {
      setLoaded(true);
      return;
    }
    Promise.all([getDeck(deckId), getCardsByDeck(deckId)]).then(([d, c]) => {
      setDeck(d ?? null);
      const unknownCards = c.filter((card) => !card.known);
      setCards(unknownCards);
      setLoaded(true);
      if (unknownCards.length === 0) setCompleted(true);
    });
  }, [deckId]);

  const shuffle = useCallback(() => {
    setCards((prev) => {
      const s = [...prev];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    });
    setCurrentIndex(0);
    setFlipped(false);
    setShuffled(true);
  }, []);

  function handleFlip() {
    setFlipped((f) => !f);
  }

  async function handleCorrect() {
    const card = cards[currentIndex];
    const updatedCard = { ...card, known: true, lastStudied: Date.now() };
    await updateCard(updatedCard);
    playChime();

    const remaining = cards.filter((_, i) => i !== currentIndex);
    setCards(remaining);

    if (remaining.length === 0) {
      setCompleted(true);
    } else {
      setCurrentIndex((prev) => (prev >= remaining.length ? 0 : prev));
    }
    setFlipped(false);
  }

  function handleIncorrect() {
    const nextIdx = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIdx);
    setFlipped(false);
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

  if (completed) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-bold">All done!</h2>
        <p className="text-foreground/50">
          You&apos;ve marked all cards in &quot;{deck.title}&quot; as known.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/deck?id=${deckId}`}
            className="px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
          >
            View Deck
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/deck?id=${deckId}`}
          className="text-sm text-foreground/40 hover:text-foreground/60"
        >
          ← {deck.title}
        </Link>
        <div className="flex items-center gap-3">
          {reverse && (
            <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full">
              HU → EN
            </span>
          )}
          <button
            onClick={shuffle}
            className="text-sm text-foreground/40 hover:text-foreground/60"
          >
            🔀 Shuffle
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-foreground/50">
          <span>Remaining</span>
          <span>{cards.length} cards left</span>
        </div>
        <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="pt-4">
        <FlashCard
          front={reverse ? card.back : card.front}
          back={reverse ? card.front : card.back}
          flipped={flipped}
          onFlip={handleFlip}
        />
      </div>

      {!flipped ? (
        <p className="text-center text-sm text-foreground/30">
          Tap the card to reveal
        </p>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleIncorrect}
            className="flex-1 py-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/5 text-foreground/70 font-medium transition-colors"
          >
            ✗ Still learning
          </button>
          <button
            onClick={handleCorrect}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
          >
            ✓ I knew it
          </button>
        </div>
      )}

      {shuffled && (
        <p className="text-center text-xs text-foreground/30">Cards shuffled</p>
      )}
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-foreground/40">Loading...</p></div>}>
      <StudyContent />
    </Suspense>
  );
}
