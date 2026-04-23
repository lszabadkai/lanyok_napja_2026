import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "mixed";

export interface Deck {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  difficulty: Difficulty;
  createdAt: number;
  cardCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  known: boolean;
  lastStudied: number | null;
  createdAt: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface CachedTranslation {
  key: string; // `${sourceLang}:${targetLang}:${word}`
  word: string;
  sourceLang: string;
  targetLang: string;
  translation: string;
}

interface FlashCardDB extends DBSchema {
  decks: {
    key: string;
    value: Deck;
  };
  cards: {
    key: string;
    value: Card;
    indexes: { "by-deck": string };
  };
  translationCache: {
    key: string;
    value: CachedTranslation;
  };
}

let dbPromise: Promise<IDBPDatabase<FlashCardDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FlashCardDB>("flashcards-db", 1, {
      upgrade(db) {
        db.createObjectStore("decks", { keyPath: "id" });
        const cardStore = db.createObjectStore("cards", { keyPath: "id" });
        cardStore.createIndex("by-deck", "deckId");
        db.createObjectStore("translationCache", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

// --- Decks ---

export async function createDeck(deck: Deck): Promise<void> {
  const db = await getDB();
  await db.put("decks", deck);
}

export async function getAllDecks(): Promise<Deck[]> {
  const db = await getDB();
  const decks = await db.getAll("decks");
  return decks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const db = await getDB();
  return db.get("decks", id);
}

export async function deleteDeck(id: string): Promise<void> {
  const db = await getDB();
  // Delete all cards in this deck
  const cards = await db.getAllFromIndex("cards", "by-deck", id);
  const tx = db.transaction("cards", "readwrite");
  for (const card of cards) {
    await tx.store.delete(card.id);
  }
  await tx.done;
  await db.delete("decks", id);
}

// --- Cards ---

export async function addCards(cards: Card[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("cards", "readwrite");
  for (const card of cards) {
    await tx.store.put(card);
  }
  await tx.done;
}

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  const db = await getDB();
  return db.getAllFromIndex("cards", "by-deck", deckId);
}

export async function updateCard(card: Card): Promise<void> {
  const db = await getDB();
  await db.put("cards", card);
}

// --- Translation Cache ---

function cacheKey(word: string, sourceLang: string, targetLang: string) {
  return `${sourceLang}:${targetLang}:${word.toLowerCase()}`;
}

export async function getCachedTranslation(
  word: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const db = await getDB();
  const entry = await db.get(
    "translationCache",
    cacheKey(word, sourceLang, targetLang)
  );
  return entry?.translation ?? null;
}

export async function setCachedTranslation(
  word: string,
  sourceLang: string,
  targetLang: string,
  translation: string
): Promise<void> {
  const db = await getDB();
  await db.put("translationCache", {
    key: cacheKey(word, sourceLang, targetLang),
    word: word.toLowerCase(),
    sourceLang,
    targetLang,
    translation,
  });
}
