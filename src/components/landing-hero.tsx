"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

interface LandingHeroProps {
  onSubmit: (text: string) => void;
}

export default function LandingHero({ onSubmit }: LandingHeroProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  };

  return (
    <div className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(56,189,248,.25),transparent_60%),radial-gradient(800px_400px_at_0%_100%,rgba(168,85,247,.15),transparent_60%),radial-gradient(800px_400px_at_100%_100%,rgba(34,197,94,.12),transparent_60%)]">
      {/* animated glows */}
      <div className="animate-float-slow pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="animate-float-slower pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="animate-float pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      {/* glass card */}
      <div className="relative z-10 mx-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-[0_0_1px_rgba(255,255,255,.25),0_30px_80px_-20px_rgba(0,0,0,.5)] backdrop-blur-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Stock Market Summary Bot
        </div>

        <h1 className="bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
          Stock Market Summary Bot
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-white/70 md:text-lg">
          A minimal AI agent built with Google ADK that summarizes stocks and
          market indices using yfinance, with a custom DuckDuckGo web search
          tool and an optional FastAPI server exposing CORS-enabled endpoints.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex w-full max-w-2xl items-end gap-3"
        >
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about a ticker (e.g., AAPL) or request a market overview…"
              className="min-h-[64px] resize-none border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            className="h-14 rounded-xl bg-white/20 px-6 text-white backdrop-blur transition hover:bg-white/30"
            disabled={!value.trim()}
          >
            Start
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Stock snapshot: price, day change, recent-period return, 52w range,
            market cap, volumes
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Market overview: S&P 500, Nasdaq, Dow (configurable)
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Company headlines: recent news for a ticker
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Web search: DuckDuckGo-powered web_search for supporting
            links/context
          </span>
        </div>
      </div>
    </div>
  );
}
