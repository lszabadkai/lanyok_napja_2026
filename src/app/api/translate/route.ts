import { NextRequest, NextResponse } from "next/server";

// MyMemory Translation API — free, no key required
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

async function translateWord(
  word: string,
  source: string,
  target: string
): Promise<string> {
  const langpair = `${source}|${target}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(word)}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetch(url);
  if (!res.ok) return word;

  const data = await res.json();
  return data?.responseData?.translatedText?.toLowerCase() || word;
}

export async function POST(request: NextRequest) {
  try {
    const { words, source, target } = await request.json();

    if (!Array.isArray(words) || !source || !target) {
      return NextResponse.json(
        { error: "Missing required fields: words (array), source, target" },
        { status: 400 }
      );
    }

    // Translate words in parallel batches of 10 to respect rate limits
    const BATCH_SIZE = 10;
    const result: Record<string, string> = {};

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);
      const translations = await Promise.all(
        batch.map((word: string) => translateWord(word, source, target))
      );
      batch.forEach((word: string, idx: number) => {
        result[word] = translations[idx];
      });
    }

    return NextResponse.json({ translations: result });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate words" },
      { status: 500 }
    );
  }
}
