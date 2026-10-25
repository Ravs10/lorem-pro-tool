"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "twitter"
  | "facebook";

type Theme = "light" | "dark";
type DifficultyFilter = "All" | "Low" | "Medium" | "High";
type SortMode = "viral" | "difficulty" | "alphabetical";

type HashtagMeta = {
  tag: string;
  viral: number;
  difficulty: "Low" | "Medium" | "High";
  posts: string;
  banned: boolean;
};

type HistoryEntry = {
  id: number;
  input: string;
  platform: Platform;
  tags: HashtagMeta[];
  date: string;
};

const TRENDING_DB: Record<string, HashtagMeta[]> = {
  travel: [
    { tag: "#travel", viral: 98, difficulty: "High", posts: "650M", banned: false },
    { tag: "#wanderlust", viral: 92, difficulty: "High", posts: "150M", banned: false },
    { tag: "#travelgram", viral: 88, difficulty: "Medium", posts: "80M", banned: false },
    { tag: "#travelreels2026", viral: 95, difficulty: "Low", posts: "2.3M", banned: false },
    { tag: "#travelphotography", viral: 85, difficulty: "Medium", posts: "45M", banned: false },
  ],
  food: [
    { tag: "#foodie", viral: 96, difficulty: "High", posts: "120M", banned: false },
    { tag: "#foodporn", viral: 94, difficulty: "Medium", posts: "90M", banned: false },
    { tag: "#foodreels", viral: 93, difficulty: "Low", posts: "5M", banned: false },
  ],
  fitness: [
    { tag: "#fitness", viral: 97, difficulty: "High", posts: "500M", banned: false },
    { tag: "#gymtok", viral: 94, difficulty: "Low", posts: "3M", banned: false },
  ],
};

const KEYWORD_TAGS: Record<string, string[]> = {
  travel: ["travel", "travelgram", "wanderlust", "travelphotography", "travelreels", "explore", "adventure", "vacation", "nature", "trip"],
  food: ["food", "foodie", "foodlover", "foodreels", "recipe", "homemade", "streetfood", "yummy", "cooking", "foodphotography"],
  fitness: ["fitness", "gym", "workout", "fitlife", "health", "motivation", "training", "gymlife", "strength", "wellness"],
  cricket: ["cricket", "cricketlover", "cricketnews", "cricketfans", "sports", "ipl", "t20", "teamindia", "cricketreels", "sportsnews"],
  chess: ["chess", "chessgame", "chesslover", "chesspuzzle", "checkmate", "chesslife", "strategy", "chessplayer", "grandmaster", "chessreels"],
  tech: ["tech", "technology", "gadgets", "innovation", "ai", "coding", "programming", "digital", "techtips", "technews"],
  business: ["business", "entrepreneur", "startup", "marketing", "success", "smallbusiness", "leadership", "growth", "branding", "productivity"],
  fashion: ["fashion", "style", "ootd", "fashionstyle", "streetstyle", "beauty", "outfit", "trendy", "fashionblogger", "lookbook"],
  music: ["music", "musician", "newmusic", "song", "musiclover", "singer", "beats", "livemusic", "musicvideo", "nowplaying"],
  nature: ["nature", "naturephotography", "wildlife", "landscape", "outdoors", "earth", "green", "flowers", "sunset", "scenery"],
  motivation: ["motivation", "mindset", "inspiration", "success", "goals", "discipline", "selfimprovement", "growthmindset", "dailyquotes", "positivevibes"],
  gaming: ["gaming", "gamer", "gameplay", "esports", "videogames", "gamingcommunity", "streamer", "pcgaming", "mobilegaming", "letsplay"],
  photography: ["photography", "photooftheday", "photographer", "portraitphotography", "streetphotography", "camera", "photoshoot", "visualstorytelling", "photoart", "creative"],
  youtube: ["youtube", "youtuber", "youtubecreator", "newvideo", "subscribe", "contentcreator", "shorts", "youtubecommunity", "video", "creator"],
  reels: ["reels", "reelsinstagram", "reelvideo", "reelsviral", "instagramreels", "shortvideo", "contentcreator", "viralreels", "explorepage", "trendingreels"],
};

const BANNED_TAGS = [
  "#adult",
  "#porn",
  "#nude",
  "#sexting",
  "#drugs",
];

const ALL_TAGS_POOL = [
  "#travel",
  "#food",
  "#fitness",
  "#fashion",
  "#business",
  "#tech",
  "#music",
  "#nature",
  "#viral",
  "#trending",
  "#explore",
  "#fyp",
  "#instagood",
  "#love",
  "#reels",
  "#foryou",
  "#instadaily",
  "#photooftheday",
  "#motivation",
  "#success",
];

const PLATFORMS = [
  { id: "instagram" as Platform, name: "Instagram", icon: "📸", limit: 30, best: "11 AM, 2 PM" },
  { id: "tiktok" as Platform, name: "TikTok", icon: "🎵", limit: 10, best: "7 PM, 9 PM" },
  { id: "youtube" as Platform, name: "YouTube", icon: "▶️", limit: 15, best: "2 PM, 4 PM" },
  { id: "linkedin" as Platform, name: "LinkedIn", icon: "💼", limit: 8, best: "9 AM, 12 PM" },
  { id: "twitter" as Platform, name: "Twitter / X", icon: "🐦", limit: 5, best: "8 AM, 6 PM" },
  { id: "facebook" as Platform, name: "Facebook", icon: "👍", limit: 10, best: "1 PM, 3 PM" },
];

export default function HashtagGeneratorLevel12() {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [count, setCount] = useState(15);
  const [hashtags, setHashtags] = useState<HashtagMeta[]>([]);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [analytics, setAnalytics] = useState({ totalGen: 0, totalCopy: 0 });
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("viral");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [includeBroadTags, setIncludeBroadTags] = useState(true);
  const [customBanned, setCustomBanned] = useState("");

  const isDark = theme === "dark";
  const platformInfo = PLATFORMS.find((p) => p.id === platform)!;

  const panelClass = isDark
    ? "bg-white/[0.03] border-white/10"
    : "bg-white border-green-100 shadow-sm";

  const fieldClass = isDark
    ? "bg-black/40 border-white/10 text-white"
    : "bg-white border-green-100 text-[#0a2a12]";

  useEffect(() => {
    try {
      const storedHistory = JSON.parse(
        localStorage.getItem("hashtag_hist") || "[]"
      );

      const storedAnalytics = JSON.parse(
        localStorage.getItem("hashtag_analytics") ||
          '{"totalGen":0,"totalCopy":0}'
      );

      const storedFavorites = JSON.parse(
        localStorage.getItem("hashtag_favorites") || "[]"
      );

      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
      setAnalytics(storedAnalytics);
      setFavorites(Array.isArray(storedFavorites) ? storedFavorites : []);
    } catch {
      // Ignore invalid or unavailable local storage.
    }
  }, []);

  const playSound = (frequency: number) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);

      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.15
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);
      oscillator.onended = () => void context.close();
    } catch {
      // Audio is optional.
    }
  };

  const normalizeTag = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]/gu, "");

    return cleaned ? `#${cleaned}` : "";
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const generate = () => {
    if (!input.trim()) {
      showNotice("Please enter a topic or caption first.");
      return;
    }

    setLoading(true);
    setNotice("");
    playSound(600);

    window.setTimeout(() => {
      const topic = input.toLowerCase();

      const words = topic
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}\s#]/gu, " ")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 &&
            ![
              "the",
              "and",
              "for",
              "with",
              "from",
              "this",
              "that",
              "your",
              "you",
              "are",
              "hai",
              "aur",
              "ke",
              "ka",
              "ki",
              "mein",
              "se",
              "par",
            ].includes(word)
        );

      const raw: HashtagMeta[] = [];

      const customBlocklist = customBanned
        .split(/[\s,;]+/)
        .map(normalizeTag)
        .filter(Boolean);

      const bannedList = [...BANNED_TAGS, ...customBlocklist];

      const add = (
        tag: string,
        baseScore: number,
        posts: string,
        difficulty: HashtagMeta["difficulty"]
      ) => {
        const normalized = normalizeTag(tag);

        if (!normalized || raw.some((item) => item.tag === normalized)) {
          return;
        }

        const banned = bannedList.includes(normalized);

        const relevance = words.some((word) =>
          normalized.includes(word.replace(/^#/, ""))
        )
          ? 8
          : 0;

        raw.push({
          tag: normalized,
          viral: Math.max(35, Math.min(95, baseScore + relevance)),
          posts,
          difficulty,
          banned,
        });
      };

      Object.entries(TRENDING_DB).forEach(([keyword, tags]) => {
        if (topic.includes(keyword)) {
          tags.forEach((tag) =>
            add(tag.tag, tag.viral, tag.posts, tag.difficulty)
          );
        }
      });

      Object.entries(KEYWORD_TAGS).forEach(([keyword, tags]) => {
        if (topic.includes(keyword)) {
          tags.forEach((tag, index) =>
            add(
              tag,
              86 - index * 3,
              "Not verified",
              index < 3 ? "High" : index < 7 ? "Medium" : "Low"
            )
          );
        }
      });

      words.forEach((word, index) => {
        add(
          word,
          76 - Math.min(index * 2, 12),
          "Not verified",
          word.length <= 5 ? "Medium" : "Low"
        );

        if (includeBroadTags) {
          const suffixes = [
            "tips",
            "daily",
            "community",
            "lover",
            "reels",
            "ideas",
            "life",
          ];

          suffixes.forEach((suffix, suffixIndex) => {
            add(
              `${word}${suffix}`,
              72 - suffixIndex * 2,
              "Not verified",
              suffixIndex < 2 ? "Medium" : "Low"
            );
          });
        }
      });

      if (includeBroadTags) {
        ALL_TAGS_POOL.forEach((tag, index) =>
          add(
            tag,
            65 - Math.min(index, 15),
            "Not verified",
            index < 5 ? "High" : "Medium"
          )
        );
      }

      const effectiveCount = Math.min(count, platformInfo.limit);

      const result = raw
        .filter((tag) => !tag.banned)
        .sort((a, b) => b.viral - a.viral)
        .slice(0, effectiveCount);

      setHashtags(result);
      setSelectedTags(result.map((tag) => tag.tag));
      setLoading(false);

      setNotice(
        result.length < effectiveCount
          ? `Found ${result.length} unique safe tags. Try a broader topic for more results.`
          : `Generated ${result.length} suggestions. Scores and post counts are estimates, not live platform data.`
      );

      const entry: HistoryEntry = {
        id: Date.now(),
        input,
        platform,
        tags: result,
        date: new Date().toLocaleString(),
      };

      const nextHistory = [entry, ...history].slice(0, 10);

      const nextAnalytics = {
        totalGen: analytics.totalGen + 1,
        totalCopy: analytics.totalCopy,
      };

      setHistory(nextHistory);
      setAnalytics(nextAnalytics);

      try {
        localStorage.setItem("hashtag_hist", JSON.stringify(nextHistory));
        localStorage.setItem(
          "hashtag_analytics",
          JSON.stringify(nextAnalytics)
        );
      } catch {
        // Generation still works if local storage is unavailable.
      }
    }, 350);
  };

  const avgViral = useMemo(
    () =>
      hashtags.length
        ? Math.round(
            hashtags.reduce((total, tag) => total + tag.viral, 0) /
              hashtags.length
          )
        : 0,
    [hashtags]
  );

  const visibleHashtags = useMemo(() => {
    const filtered = hashtags.filter(
      (tag) =>
        tag.tag.toLowerCase().includes(query.toLowerCase()) &&
        (difficultyFilter === "All" ||
          tag.difficulty === difficultyFilter) &&
        (!showFavoritesOnly || favorites.includes(tag.tag))
    );

    return [...filtered].sort((a, b) => {
      if (sortMode === "alphabetical") {
        return a.tag.localeCompare(b.tag);
      }

      if (sortMode === "difficulty") {
        const rank = { Low: 0, Medium: 1, High: 2 };
        return rank[a.difficulty] - rank[b.difficulty];
      }

      return b.viral - a.viral;
    });
  }, [
    hashtags,
    query,
    difficultyFilter,
    sortMode,
    showFavoritesOnly,
    favorites,
  ]);

  const persistFavorites = (next: string[]) => {
    setFavorites(next);

    try {
      localStorage.setItem("hashtag_favorites", JSON.stringify(next));
    } catch {
      showNotice("Could not save favorites in this browser.");
    }
  };

  const toggleFavorite = (tag: string) => {
    const next = favorites.includes(tag)
      ? favorites.filter((item) => item !== tag)
      : [...favorites, tag];

    persistFavorites(next);
  };

  const toggleSelected = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag]
    );
  };

  const downloadFile = (
    filename: string,
    content: string,
    type = "text/plain;charset=utf-8"
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const exportTags = (format: "txt" | "json" | "csv") => {
    const rows = hashtags.filter((tag) => selectedTags.includes(tag.tag));

    if (!rows.length) {
      showNotice("Select at least one hashtag to export.");
      return;
    }

    if (format === "json") {
      downloadFile(
        "hashtag-results.json",
        JSON.stringify(rows, null, 2),
        "application/json;charset=utf-8"
      );
    } else if (format === "csv") {
      const header =
        "tag,viral_score,difficulty,post_count_estimate,banned";

      const csvRows = rows.map((tag) =>
        [
          tag.tag,
          tag.viral,
          tag.difficulty,
          tag.posts,
          tag.banned,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      );

      downloadFile(
        "hashtag-results.csv",
        [header, ...csvRows].join("\n"),
        "text/csv;charset=utf-8"
      );
    } else {
      downloadFile(
        "hashtag-results.txt",
        rows.map((tag) => tag.tag).join(" "),
        "text/plain;charset=utf-8"
      );
    }

    showNotice(
      `Exported ${rows.length} hashtags as ${format.toUpperCase()}.`
    );
  };

  const incrementCopyCount = () => {
    const next = {
      ...analytics,
      totalCopy: analytics.totalCopy + 1,
    };

    setAnalytics(next);

    try {
      localStorage.setItem("hashtag_analytics", JSON.stringify(next));
    } catch {
      // Ignore local storage errors.
    }
  };

  const copySelected = async () => {
    const text = hashtags
      .filter((tag) => selectedTags.includes(tag.tag))
      .map((tag) => tag.tag)
      .join(" ");

    if (!text) {
      showNotice("Select at least one hashtag first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      playSound(800);
      incrementCopyCount();
      showNotice("Selected hashtags copied.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showNotice("Clipboard access was blocked by your browser.");
    }
  };

  const copyAll = async () => {
    const selected = hashtags.filter((tag) =>
      selectedTags.includes(tag.tag)
    );

    const rows = selected.length ? selected : hashtags;
    const text = rows.map((tag) => tag.tag).join(" ");

    if (!text) {
      showNotice("There are no hashtags to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      playSound(800);
      incrementCopyCount();
      showNotice("Hashtags copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showNotice("Clipboard access was blocked by your browser.");
    }
  };

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem("hashtag_hist");
    } catch {
      // Ignore local storage errors.
    }

    showNotice("History cleared.");
  };

  const loadHistory = (entry: HistoryEntry) => {
    setInput(entry.input || "");
    setPlatform(entry.platform || "instagram");
    setHashtags(Array.isArray(entry.tags) ? entry.tags : []);
    setSelectedTags(
      Array.isArray(entry.tags)
        ? entry.tags.map((tag) => tag.tag)
        : []
    );

    showNotice("Previous result restored.");
  };

  return (
    <div
      className={`${
        isDark
          ? "bg-[#070710] text-white"
          : "bg-[#f6fff8] text-[#0a2a12]"
      } min-h-screen w-full overflow-x-hidden transition-all`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Free Hashtag Generator",
            description:
              "Generate hashtag suggestions for social platforms with filters, favorites and export tools.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur ${
          isDark
            ? "border-white/10 bg-black/80"
            : "border-green-100 bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-widest sm:text-xl">
              HASHTAG <span className="text-[#00C950]">#GEN 12.0</span>
            </h1>

            <p className="text-[9px] tracking-wider opacity-60">
              SMART SUGGESTIONS · FILTERS · FAVORITES · EXPORT · ANALYTICS
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`hidden gap-3 rounded-full px-3 py-1.5 text-[10px] lg:flex ${
                isDark ? "bg-white/10" : "bg-green-50"
              }`}
            >
              <span>🔥 {analytics.totalGen} Gen</span>
              <span>📋 {analytics.totalCopy} Copy</span>
              <span>⚡ {avgViral}% Score</span>
              <span>★ {favorites.length} Saved</span>
            </div>

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => {
                setTheme(isDark ? "light" : "dark");
                playSound(700);
              }}
              className={`flex h-7 w-11 items-center rounded-full p-1 ${
                isDark
                  ? "justify-end bg-white/20"
                  : "justify-start bg-green-900/20"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]">
                {isDark ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {PLATFORMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setPlatform(item.id);
                  setCount((previous) =>
                    Math.min(previous, item.limit)
                  );
                  playSound(350);
                }}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold ${
                  platform === item.id
                    ? "border-[#00C950] bg-[#00C950] text-white"
                    : "opacity-70"
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div
          className={`flex h-[70px] items-center justify-center rounded-xl border border-dashed text-[10px] opacity-50 ${
            isDark ? "bg-white/5" : "bg-green-50"
          }`}
        >
          AdSense Top Advertisement Placeholder
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-12">
        <section
          className={`col-span-1 min-w-0 rounded-2xl border p-4 sm:p-6 lg:col-span-7 ${panelClass}`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="hashtag-topic"
              className="text-[11px] font-bold opacity-60"
            >
              YOUR TOPIC OR CAPTION
            </label>

            <span className="rounded-full bg-[#00C950]/10 px-2 py-1 text-[10px] text-[#00C950]">
              Best time: {platformInfo.best}
            </span>
          </div>

          <textarea
            id="hashtag-topic"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. cricket news, chess tricks, travel, fitness, technology..."
            className={`h-[130px] w-full resize-y rounded-xl border p-3 text-sm outline-none focus:border-[#00C950] ${fieldClass}`}
          />

          <div className="mt-2 flex justify-between gap-2">
            <span className="text-[10px] opacity-60">
              {input.trim() ? input.trim().split(/\s+/).length : 0} words
            </span>

            <button
              type="button"
              onClick={() => {
                setInput("");
                setNotice("");
              }}
              className="text-[11px] underline opacity-70"
            >
              Clear topic
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] font-bold opacity-60">COUNT:</span>

            <input
              type="range"
              min={1}
              max={platformInfo.limit}
              value={Math.min(count, platformInfo.limit)}
              onChange={(event) => setCount(Number(event.target.value))}
              className="flex-1 accent-[#00C950]"
            />

            <span className="rounded-full bg-[#00C950] px-3 py-1 text-xs font-bold text-white">
              {Math.min(count, platformInfo.limit)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeBroadTags}
                onChange={(event) =>
                  setIncludeBroadTags(event.target.checked)
                }
              />
              Include broad/discovery tags
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-bold opacity-60">
                CUSTOM BLOCKLIST
              </span>

              <input
                value={customBanned}
                onChange={(event) => setCustomBanned(event.target.value)}
                placeholder="#spam, #myblockedtag"
                className={`rounded-lg border p-2 ${fieldClass}`}
              />
            </label>
          </div>

          <p className="mt-2 text-[10px] opacity-60">
            Platform limit: {platformInfo.limit} hashtags. Results are
            capped at this number.
          </p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={generate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[#00C950] to-[#00A63E] py-3.5 text-sm font-black tracking-wide text-white disabled:opacity-50"
          >
            {loading
              ? "🔍 Generating suggestions..."
              : `⚡ GENERATE FOR ${platform.toUpperCase()}`}
          </motion.button>

          {hashtags.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border bg-black/5 p-4 text-center">
              <div>
                <div className="text-xl font-black text-[#00C950]">
                  {avgViral}%
                </div>
                <div className="text-[10px] opacity-60">Avg Score</div>
              </div>

              <div>
                <div className="text-xl font-black">
                  {hashtags.filter((tag) => tag.difficulty === "Low").length}
                </div>
                <div className="text-[10px] opacity-60">Low Competition</div>
              </div>

              <div>
                <div className="text-xl font-black text-green-600">
                  {hashtags.length}
                </div>
                <div className="text-[10px] opacity-60">Suggestions</div>
              </div>
            </div>
          )}

          <div
            className={`mt-5 flex h-[100px] items-center justify-center rounded-xl border border-dashed text-[10px] opacity-50 ${
              isDark ? "bg-white/5" : "bg-green-50"
            }`}
          >
            AdSense In-Content Placeholder
          </div>
        </section>

        <section
          className={`col-span-1 flex min-w-0 flex-col rounded-2xl border p-4 sm:p-6 lg:col-span-5 ${panelClass}`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">
              Results {hashtags.length > 0 && `· ${avgViral}% Score`}
            </h2>

            {hashtags.length > 0 && (
              <button
                type="button"
                onClick={copyAll}
                className="rounded-full bg-[#00C950] px-3 py-1.5 text-[11px] font-bold text-white"
              >
                {copied ? "✓ Copied!" : "📋 Copy All"}
              </button>
            )}
          </div>

          {!hashtags.length && !loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center opacity-50">
              <div className="text-4xl">🚀</div>
              <p className="mt-2 text-sm font-bold">Level 12 Ready</p>
              <p className="mt-1 max-w-[220px] text-[11px]">
                Generate suggestions, filter results, save favorites and
                export hashtags.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00C950] border-t-transparent" />
              <p className="mt-3 text-xs opacity-60">
                Analysing topic and creating suggestions...
              </p>
            </div>
          )}

          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search results..."
              className={`min-w-0 rounded-lg border p-2 text-xs ${fieldClass}`}
            />

            <select
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value as DifficultyFilter)
              }
              className={`rounded-lg border p-2 text-xs ${fieldClass}`}
            >
              <option value="All">All difficulty</option>
              <option value="Low">Low competition</option>
              <option value="Medium">Medium competition</option>
              <option value="High">High competition</option>
            </select>

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as SortMode)
              }
              className={`rounded-lg border p-2 text-xs ${fieldClass}`}
            >
              <option value="viral">Sort: score</option>
              <option value="difficulty">Sort: difficulty</option>
              <option value="alphabetical">Sort: A–Z</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFavoritesOnly((value) => !value)}
              className={`rounded-lg border p-2 text-xs font-bold ${
                showFavoritesOnly
                  ? "bg-[#00C950] text-white"
                  : ""
              }`}
            >
              {showFavoritesOnly ? "★ Showing favorites" : "☆ Show favorites"}
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedTags(visibleHashtags.map((tag) => tag.tag))
              }
              className="rounded-full border px-3 py-1.5 text-[11px]"
            >
              Select visible
            </button>

            <button
              type="button"
              onClick={() => setSelectedTags([])}
              className="rounded-full border px-3 py-1.5 text-[11px]"
            >
              Deselect all
            </button>

            <button
              type="button"
              onClick={copySelected}
              className="rounded-full bg-[#00C950] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              Copy selected (
              {hashtags.filter((tag) => selectedTags.includes(tag.tag)).length}
              )
            </button>

            <button
              type="button"
              onClick={() => exportTags("txt")}
              className="rounded-full border px-3 py-1.5 text-[11px]"
            >
              TXT
            </button>

            <button
              type="button"
              onClick={() => exportTags("csv")}
              className="rounded-full border px-3 py-1.5 text-[11px]"
            >
              CSV
            </button>

            <button
              type="button"
              onClick={() => exportTags("json")}
              className="rounded-full border px-3 py-1.5 text-[11px]"
            >
              JSON
            </button>
          </div>

          {notice && (
            <p
              role="status"
              className="mb-3 rounded-lg border border-[#00C950]/30 bg-[#00C950]/10 p-2 text-xs"
            >
              {notice}
            </p>
          )}

          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {visibleHashtags.length === 0 && hashtags.length > 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs opacity-60">
                No tags match these filters. Change your search or filters.
              </div>
            )}

            {visibleHashtags.map((tag, index) => (
              <motion.div
                key={tag.tag}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-green-100 bg-green-50/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <input
                      aria-label={`Select ${tag.tag}`}
                      type="checkbox"
                      checked={selectedTags.includes(tag.tag)}
                      onChange={() => toggleSelected(tag.tag)}
                    />

                    <div className="truncate text-sm font-bold">
                      {tag.tag}
                    </div>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] opacity-70">
                    <span>📊 {tag.posts}</span>
                    <span
                      className={`font-bold ${
                        tag.difficulty === "Low"
                          ? "text-green-600"
                          : tag.difficulty === "Medium"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {tag.difficulty}
                    </span>
                    {tag.banned && (
                      <span className="text-red-500">Blocked</span>
                    )}
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Toggle favorite ${tag.tag}`}
                    onClick={() => toggleFavorite(tag.tag)}
                    className="text-lg"
                    title="Save favorite"
                  >
                    {favorites.includes(tag.tag) ? "★" : "☆"}
                  </button>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black ${
                        tag.viral > 90
                          ? "text-[#00C950]"
                          : tag.viral > 75
                          ? "text-yellow-600"
                          : "text-orange-500"
                      }`}
                    >
                      {tag.viral}%
                    </div>

                    <div className="mt-1 h-1.5 w-12 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#00C950]"
                        style={{ width: `${tag.viral}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] opacity-60">
                  Recent History — Local
                </p>

                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] text-red-500"
                >
                  Clear history
                </button>
              </div>

              <div className="space-y-1.5">
                {history.slice(0, 5).map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    onClick={() => loadHistory(entry)}
                    className="flex w-full items-center justify-between rounded-lg bg-black/5 p-2 text-left text-[11px] hover:bg-[#00C950]/10"
                  >
                    <span className="mr-2 truncate">{entry.input}</span>
                    <span className="shrink-0 font-bold text-[#00C950]">
                      {entry.tags.length} tags · Load
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`mt-4 flex h-[180px] items-center justify-center rounded-xl border border-dashed text-[10px] opacity-50 ${
              isDark ? "bg-white/5" : "bg-green-50"
            }`}
          >
            AdSense Sidebar Placeholder
          </div>
        </section>
      </main>

      <article className="mx-auto max-w-7xl px-4 py-8 text-sm leading-7 opacity-80">
        <h2 className="text-lg font-black">
          Advanced Hashtag Generator — Features and Usage
        </h2>

        <p className="mt-2">
          Generate topic-based hashtag suggestions for social media platforms.
          Search, filter, sort, select, save favorites and export your results.
        </p>

        <p>
          <strong>Suggestion score:</strong> The displayed score is a
          heuristic estimate used to organize suggestions. It is not a
          real-time virality prediction.
        </p>

        <p>
          <strong>Difficulty:</strong> Low, Medium and High are rough
          heuristic labels, not verified ranking probabilities.
        </p>

        <p>
          <strong>Blocklist:</strong> The built-in and custom lists filter
          matching hashtags. They cannot verify actual platform bans or
          shadowbans.
        </p>

        <p>
          <strong>Best time:</strong> These are generic starting points.
          Review your own audience analytics and timezone before scheduling.
        </p>

        <p>
          <strong>Analytics and history:</strong> Generation, copying,
          favorites and recent results are stored in this browser. Clearing
          browser storage may remove them.
        </p>

        <p>
          <strong>Data accuracy:</strong> This client-side version uses a
          local keyword database and estimates. It does not fetch live
          platform statistics.
        </p>
      </article>
    </div>
  );
}
