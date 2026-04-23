const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

export async function translateWord(
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

export async function translateBatch(
  words: string[],
  source: string,
  target: string,
  onProgress?: (done: number, total: number) => void
): Promise<Record<string, string>> {
  const BATCH_SIZE = 10;
  const result: Record<string, string> = {};
  let done = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const translations = await Promise.all(
      batch.map((word) => translateWord(word, source, target))
    );
    batch.forEach((word, idx) => {
      result[word] = translations[idx];
    });
    done += batch.length;
    onProgress?.(done, words.length);
  }

  return result;
}
