"use client";

import { useState, useCallback } from "react";
import { Search, ExternalLink, Globe, Zap, AlertCircle } from "lucide-react";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source?: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  error?: string;
}

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery || query.trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setSearched(true);
    setLastQuery(q);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(q)}`
      );
      const data: SearchResponse = await response.json();

      if (data.error && data.results.length === 0) {
        setError(data.error);
      } else {
        setResults(data.results);
        if (data.results.length === 0) {
          setError("No results found in global databases for that query.");
        }
      }
    } catch {
      setError("Network failure. Unable to establish connection to external databases.");
    } finally {
      setIsSearching(false);
    }
  }, [query, isSearching]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const suggestedSearches = [
    "latest technology news",
    "artificial intelligence",
    "quantum computing",
    "space exploration",
    "renewable energy",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-4 border-b border-hud-cyan/20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-muted/60 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search global networks..."
              className="w-full hud-input rounded pl-9 pr-3 py-2 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_8px_rgba(0,212,255,0.2)]"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="hud-btn px-3 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isSearching ? (
              <>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </>
            ) : (
              <>
                <Zap size={14} />
                SCAN
              </>
            )}
          </button>
        </div>

        <div className="mt-2 text-[10px] text-hud-muted/50 font-mono">
          POWERED BY DUCKDUCKGO INSTANT ANSWERS • GLOBAL NETWORK ACCESS
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading state */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-hud-cyan/20 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-hud-cyan rounded-full animate-spin" />
              <Globe
                size={24}
                className="absolute inset-0 m-auto text-hud-cyan animate-pulse"
              />
            </div>
            <div className="text-hud-cyan text-sm font-mono animate-pulse">
              SEARCHING GLOBAL NETWORKS...
            </div>
            <div className="text-hud-muted text-xs font-mono">
              Query: &quot;{lastQuery}&quot;
            </div>
          </div>
        )}

        {/* Error state */}
        {!isSearching && error && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle size={32} className="text-hud-orange/60" />
            <p className="text-hud-orange text-sm font-mono text-center max-w-xs">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] text-hud-muted font-mono flex items-center gap-2 mb-3">
              <span className="text-hud-cyan">{results.length} RESULTS</span>
              <span>FOR</span>
              <span className="text-hud-text">&quot;{lastQuery}&quot;</span>
            </div>

            {results.map((result, index) => (
              <ResultCard key={index} result={result} getDomain={getDomain} index={index} />
            ))}
          </div>
        )}

        {/* Empty / initial state */}
        {!isSearching && !searched && results.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="relative w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#00d4ff"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="10 5"
                  className="animate-rotate-slow"
                  style={{ transformOrigin: "50px 50px" }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="28"
                  stroke="#0088cc"
                  strokeWidth="1"
                  fill="none"
                  className="animate-rotate-slow-reverse"
                  style={{ transformOrigin: "50px 50px" }}
                />
                <circle cx="50" cy="50" r="4" fill="#00d4ff" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.3" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-hud-muted text-sm font-mono mb-1">
                NETWORK SCANNER READY
              </p>
              <p className="text-hud-muted/50 text-xs font-mono">
                Enter a query to scan global databases
              </p>
            </div>

            {/* Suggested searches */}
            <div className="w-full">
              <p className="text-[10px] text-hud-muted/60 font-mono mb-2 text-center">
                SUGGESTED QUERIES:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      handleSearch(s);
                    }}
                    className="text-[11px] px-2 py-1 rounded border border-hud-cyan/20 text-hud-cyan/70 hover:border-hud-cyan/50 hover:text-hud-cyan hover:bg-cyan-900/10 font-mono transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  getDomain,
  index,
}: {
  result: SearchResult;
  getDomain: (url: string) => string;
  index: number;
}) {
  return (
    <div
      className="p-3 rounded border border-hud-cyan/20 bg-cyan-900/5 hover:border-hud-cyan/40 hover:bg-cyan-900/10 transition-all animate-fade-in-up group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-hud-cyan text-sm font-mono font-bold truncate mb-1 group-hover:text-glow-cyan">
            {result.title}
          </h3>
          <p className="text-hud-text/80 text-xs font-mono leading-relaxed mb-2 line-clamp-3">
            {result.snippet}
          </p>
          <div className="flex items-center gap-1 text-hud-muted/60 text-[10px] font-mono">
            <Globe size={10} />
            <span className="truncate">{getDomain(result.url)}</span>
            {result.source && (
              <>
                <span className="opacity-40">•</span>
                <span className="text-hud-cyan/50">{result.source}</span>
              </>
            )}
          </div>
        </div>

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1.5 rounded border border-hud-cyan/20 text-hud-muted hover:text-hud-cyan hover:border-hud-cyan/50 transition-all mt-0.5"
          title="Open in new tab"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
