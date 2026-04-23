"use client";

import { useState } from "react";
import { fetchUrlText } from "@/lib/fetch-url";
import { assetPath } from "@/lib/base-path";

type Source = "paste" | "url" | "file" | "bundled";

interface TextSourceTabsProps {
  onTextReady: (text: string) => void;
  loading: boolean;
}

const BUNDLED_TEXTS = [
  { id: "common-words", label: "Common 500 Words", file: "/texts/common-words.json" },
  { id: "travel", label: "Travel Phrases", file: "/texts/travel.json" },
  { id: "food", label: "Food & Kitchen", file: "/texts/food.json" },
];

export default function TextSourceTabs({
  onTextReady,
  loading,
}: TextSourceTabsProps) {
  const [source, setSource] = useState<Source>("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [error, setError] = useState("");

  const tabs: { id: Source; label: string }[] = [
    { id: "paste", label: "Paste" },
    { id: "url", label: "URL" },
    { id: "file", label: "File" },
    { id: "bundled", label: "Bundled" },
  ];

  function handleSubmitText() {
    if (text.trim().length < 10) {
      setError("Please enter at least 10 characters of text.");
      return;
    }
    setError("");
    onTextReady(text.trim());
  }

  async function handleFetchUrl() {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    setError("");
    setFetchingUrl(true);
    try {
      const text = await fetchUrlText(url.trim());
      onTextReady(text);
    } catch {
      setError("Failed to fetch URL content.");
    } finally {
      setFetchingUrl(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      if (content.trim().length < 10) {
        setError("File content is too short.");
        return;
      }
      onTextReady(content.trim());
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  }

  async function handleBundled(file: string) {
    setError("");
    try {
      const res = await fetch(assetPath(file));
      const data = await res.json();
      onTextReady(data.text);
    } catch {
      setError("Failed to load bundled text.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-foreground/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSource(tab.id);
              setError("");
            }}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              source === tab.id
                ? "bg-background shadow text-foreground font-medium"
                : "text-foreground/50 hover:text-foreground/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {source === "paste" && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type English text here..."
            className="w-full h-40 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleSubmitText}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Extract Words"}
          </button>
        </div>
      )}

      {source === "url" && (
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleFetchUrl}
            disabled={loading || fetchingUrl}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {fetchingUrl ? "Fetching..." : loading ? "Processing..." : "Fetch & Extract"}
          </button>
        </div>
      )}

      {source === "file" && (
        <div className="space-y-3">
          <label className="block w-full py-8 rounded-xl border-2 border-dashed border-foreground/20 hover:border-foreground/40 transition-colors cursor-pointer text-center">
            <span className="text-foreground/50 text-sm">
              Tap to upload a .txt file
            </span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {source === "bundled" && (
        <div className="space-y-2">
          {BUNDLED_TEXTS.map((bt) => (
            <button
              key={bt.id}
              onClick={() => handleBundled(bt.file)}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/5 text-left text-sm transition-colors disabled:opacity-50"
            >
              {bt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
