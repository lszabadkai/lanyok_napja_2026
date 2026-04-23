import { STOP_WORDS } from "./stop-words";

// Common English words ranked by frequency (top ~500)
const COMMON_500 = new Set([
  "time", "year", "people", "way", "day", "man", "woman", "child", "world",
  "life", "hand", "part", "place", "case", "week", "company", "system",
  "program", "question", "work", "government", "number", "night", "point",
  "home", "water", "room", "mother", "area", "money", "story", "fact", "month",
  "lot", "right", "study", "book", "eye", "job", "word", "business", "issue",
  "side", "kind", "head", "house", "service", "friend", "father", "power",
  "hour", "game", "line", "end", "member", "law", "car", "city", "community",
  "name", "president", "team", "minute", "idea", "body", "information", "back",
  "parent", "face", "others", "level", "office", "door", "health", "person",
  "art", "war", "history", "party", "result", "change", "morning", "reason",
  "research", "girl", "guy", "moment", "air", "teacher", "force", "education",
  "food", "dog", "cat", "sun", "moon", "tree", "flower", "bird", "fish",
  "color", "red", "blue", "green", "white", "black", "big", "small", "old",
  "new", "good", "bad", "happy", "sad", "fast", "slow", "hot", "cold",
  "long", "short", "high", "low", "open", "close", "left", "right", "first",
  "last", "next", "early", "late", "young", "free", "run", "walk", "eat",
  "drink", "read", "write", "speak", "listen", "see", "hear", "think", "know",
  "want", "need", "help", "love", "take", "give", "tell", "say", "come", "go",
  "look", "find", "use", "try", "ask", "put", "call", "keep", "turn", "start",
  "show", "play", "move", "live", "believe", "bring", "happen", "set", "sit",
  "stand", "lose", "pay", "meet", "include", "continue", "learn", "hold",
  "lead", "understand", "watch", "follow", "stop", "create", "speak", "allow",
  "add", "grow", "begin", "seem", "carry", "die", "build", "fall", "cut",
  "reach", "kill", "remain", "suggest", "raise", "pass", "sell", "require",
  "report", "pull", "develop", "leave", "school", "table", "chair", "window",
  "music", "family", "baby", "animal", "street", "kitchen", "garden", "rain",
  "snow", "summer", "winter", "spring", "market", "bread", "milk", "apple",
  "orange", "banana", "chicken", "rice", "coffee", "tea", "sugar", "salt",
  "butter", "cheese", "egg", "meat", "soup", "cake", "dinner", "lunch",
  "breakfast", "hat", "shirt", "shoes", "dress", "coat", "bag", "key",
  "phone", "clock", "bed", "light", "paper", "pen", "map", "star",
]);

// Extends COMMON_500 with more intermediate words
const COMMON_2000_EXTRA = new Set([
  "accept", "achieve", "address", "admit", "affect", "afford", "agree", "aim",
  "announce", "appear", "apply", "argue", "arrange", "arrive", "attack",
  "attempt", "avoid", "base", "beat", "belong", "blame", "borrow", "break",
  "burn", "celebrate", "challenge", "charge", "check", "claim", "climb",
  "collect", "combine", "compare", "compete", "complain", "complete",
  "concentrate", "concern", "confirm", "connect", "consider", "consist",
  "contact", "contain", "contribute", "control", "convert", "cook", "copy",
  "correct", "count", "cover", "cross", "damage", "deal", "decide", "deliver",
  "demand", "depend", "describe", "design", "destroy", "determine", "disappear",
  "discover", "discuss", "divide", "double", "draw", "drive", "drop", "earn",
  "encourage", "enjoy", "examine", "exchange", "exist", "expand", "expect",
  "experience", "explain", "explore", "express", "extend", "fail", "feed",
  "fight", "fill", "fit", "fix", "fly", "fold", "force", "forget", "forgive",
  "gather", "handle", "hang", "hate", "head", "hide", "hit", "hope", "hurt",
  "identify", "ignore", "imagine", "improve", "increase", "indicate",
  "influence", "inform", "insist", "install", "intend", "introduce", "invest",
  "invite", "involve", "join", "judge", "jump", "kick", "knock", "lack",
  "land", "laugh", "launch", "lay", "lift", "limit", "link", "manage", "mark",
  "measure", "mention", "mind", "miss", "mix", "monitor", "notice", "obtain",
  "occur", "offer", "operate", "order", "organize", "own", "perform", "permit",
  "pick", "place", "plan", "plant", "point", "possess", "pour", "prefer",
  "prepare", "present", "press", "prevent", "produce", "promise", "protect",
  "prove", "provide", "publish", "push", "react", "receive", "recognize",
  "record", "reduce", "refer", "reflect", "refuse", "relate", "release",
  "rely", "remember", "remove", "repeat", "replace", "represent", "request",
  "resist", "resolve", "respond", "restore", "reveal", "ring", "rise", "roll",
  "rush", "save", "search", "select", "send", "separate", "serve", "settle",
  "shake", "shape", "share", "shoot", "sign", "sing", "slip", "smile", "solve",
  "sort", "spread", "steal", "stick", "stretch", "strike", "struggle",
  "succeed", "suffer", "supply", "support", "suppose", "survive", "suspect",
  "switch", "teach", "tend", "test", "thank", "throw", "touch", "train",
  "travel", "treat", "trust", "visit", "vote", "wait", "warn", "wash",
  "wear", "welcome", "win", "wish", "wonder", "worry", "wrap",
  // intermediate nouns
  "advantage", "advice", "amount", "argument", "atmosphere", "audience",
  "background", "balance", "bank", "battle", "beach", "behavior", "benefit",
  "border", "bottle", "brain", "bridge", "budget", "camp", "campaign",
  "cancer", "candidate", "capital", "career", "category", "cause", "cell",
  "center", "century", "chapter", "circle", "citizen", "climate", "coast",
  "collection", "college", "column", "comment", "commission", "committee",
  "communication", "competition", "complaint", "computer", "concept",
  "condition", "conference", "conflict", "connection", "consequence",
  "consumer", "content", "context", "contract", "conversation", "corner",
  "cost", "council", "count", "courage", "course", "court", "credit", "crime",
  "crisis", "criticism", "crowd", "culture", "currency", "customer", "cycle",
  "danger", "database", "debate", "debt", "decade", "decision", "defense",
  "definition", "degree", "delivery", "demand", "department", "depression",
  "description", "desire", "detail", "device", "diet", "difference",
  "difficulty", "direction", "discipline", "disease", "distance", "document",
  "doubt", "drama", "dream", "dress", "dust", "duty", "economy", "edge",
  "editor", "effect", "effort", "election", "emergency", "emotion", "emphasis",
  "employee", "employer", "energy", "engine", "entertainment", "environment",
  "equipment", "error", "escape", "essay", "estate", "event", "evidence",
  "exam", "example", "exception", "exchange", "exercise", "exhibition",
  "expense", "experiment", "expert", "expression", "extension", "extent",
  "factor", "failure", "farm", "fashion", "feature", "feedback", "feeling",
  "fiction", "field", "figure", "film", "finance", "finger", "flight",
  "flower", "focus", "foot", "frame", "freedom", "fruit", "fuel", "function",
  "future", "gap", "gate", "generation", "goal", "gold", "grade", "growth",
  "guard", "guide", "hair", "hall", "handle", "heart", "heat", "height",
  "hotel", "household", "housing", "hurt", "image", "impact", "impression",
  "income", "independence", "industry", "inflation", "injury", "innovation",
  "input", "instance", "institution", "instruction", "insurance",
  "intelligence", "intention", "interest", "internet", "interview",
  "introduction", "investigation", "investment", "island", "item", "journey",
  "judgment", "justice", "king", "knowledge", "label", "lack", "language",
  "layer", "leadership", "league", "lecture", "lesson", "letter", "library",
  "lift", "link", "list", "location", "loss", "luck", "machine", "magazine",
  "mail", "manager", "manner", "march", "mark", "master", "match", "material",
  "meal", "media", "medicine", "meeting", "memory", "message", "metal",
  "method", "middle", "mind", "mine", "minister", "mirror", "mission", "model",
  "mood", "mortgage", "mountain", "mouth", "movement", "movie", "muscle",
  "mystery", "nation", "nature", "neck", "network", "news", "noise", "novel",
  "nurse", "object", "occasion", "officer", "operation", "opinion",
  "opportunity", "option", "organization", "other", "outcome", "output",
  "package", "pain", "painting", "pair", "palace", "panel", "park",
  "parliament", "partner", "passage", "passenger", "path", "pattern",
  "payment", "peace", "pension", "performance", "period", "permission",
  "perspective", "phase", "philosophy", "photograph", "phrase", "picture",
  "pilot", "platform", "player", "pleasure", "pocket", "poetry", "policy",
  "politics", "pollution", "pool", "population", "position", "possession",
  "possibility", "post", "potato", "pound", "practice", "prayer", "presence",
  "president", "pressure", "price", "princess", "principle", "priority",
  "prison", "privacy", "prize", "problem", "procedure", "process",
  "production", "profession", "professor", "profit", "progress", "project",
  "promise", "property", "proposal", "protection", "protest", "province",
  "psychology", "purpose", "queen", "race", "range", "rate", "reaction",
  "reality", "recipe", "recommendation", "record", "recovery", "reference",
  "region", "register", "regulation", "relation", "relationship", "religion",
  "repeat", "replacement", "republic", "reputation", "request", "resource",
  "response", "responsibility", "restaurant", "revolution", "reward", "ring",
  "risk", "river", "road", "role", "roof", "root", "row", "rule", "safety",
  "sample", "sand", "satisfaction", "scale", "scene", "schedule", "scheme",
  "science", "screen", "season", "seat", "sector", "security", "selection",
  "sense", "sentence", "sequence", "series", "session", "setting", "sex",
  "shadow", "shape", "shelf", "shift", "shock", "shop", "shoulder", "signal",
  "significance", "silence", "silver", "situation", "skill", "skin", "sleep",
  "smoke", "society", "software", "soil", "soldier", "solution", "song",
  "soul", "source", "space", "specialist", "speech", "speed", "spirit",
  "sport", "spot", "square", "staff", "stage", "standard", "statement",
  "station", "status", "steel", "step", "stock", "stomach", "stone", "store",
  "storm", "strategy", "stream", "strength", "stress", "stretch", "strike",
  "string", "structure", "struggle", "studio", "style", "subject", "success",
  "supermarket", "surgery", "surprise", "survey", "swimming", "symbol",
  "sympathy", "talent", "tank", "target", "taste", "tax", "technique",
  "technology", "telephone", "television", "temperature", "tension", "term",
  "territory", "terror", "text", "theme", "theory", "thought", "throat",
  "ticket", "title", "tongue", "tool", "topic", "tour", "tourist", "tower",
  "track", "trade", "tradition", "traffic", "training", "transfer",
  "transition", "transport", "travel", "trend", "trial", "trick", "trip",
  "trouble", "trust", "truth", "unit", "university", "user", "valley",
  "value", "variety", "vehicle", "version", "victim", "view", "village",
  "violence", "virtue", "vision", "volume", "warning", "wave", "wealth",
  "weather", "wedding", "weight", "wing", "wood", "youth",
]);

export interface TaggedWord {
  word: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ProcessedWords {
  words: TaggedWord[];
  totalFound: number;
  afterStopWords: number;
  afterDifficulty: number;
}

export function extractWords(
  text: string,
): ProcessedWords {
  // Tokenize: split on non-alpha, lowercase, deduplicate
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[a-z]/.test(w));

  // Count frequency
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  const totalFound = freq.size;

  // Remove stop words
  const filtered = [...freq.entries()].filter(([w]) => !STOP_WORDS.has(w));
  const afterStopWords = filtered.length;

  // Tag each word by difficulty tier
  const tagged: (TaggedWord & { freq: number })[] = filtered.map(([w, f]) => {
    let difficulty: "beginner" | "intermediate" | "advanced";
    if (COMMON_500.has(w)) {
      difficulty = "beginner";
    } else if (COMMON_2000_EXTRA.has(w)) {
      difficulty = "intermediate";
    } else {
      difficulty = "advanced";
    }
    return { word: w, difficulty, freq: f };
  });

  // Sort by frequency descending
  tagged.sort((a, b) => b.freq - a.freq);

  return {
    words: tagged.map(({ word, difficulty }) => ({ word, difficulty })),
    totalFound,
    afterStopWords,
    afterDifficulty: tagged.length,
  };
}
