export async function fetchUrlText(url: string): Promise<string> {
  // Use a CORS proxy for client-side fetching
  // allorigins.win wraps the response so we can access it from the browser
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status}`);
  }

  const html = await res.text();

  // Strip HTML tags to get plain text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}
