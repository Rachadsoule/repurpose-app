"use client";

import React, { useState } from "react";
import { Radio, Copy, Check, Loader2, Sparkles } from "lucide-react";

const PALETTE = {
  bg: "#102826",
  bgDeep: "#0B1E1C",
  panel: "#163631",
  panelLine: "#234A43",
  ink: "#F2EEE2",
  inkDim: "#9FB8B0",
  amber: "#E0934B",
  signal: "#7FD9C4",
};

const FORMATS = [
  { id: "thread", freq: "88.1", name: "Thread X", band: "MICRO / RAFALE" },
  { id: "linkedin", freq: "94.5", name: "LinkedIn", band: "PRO / NARRATIF" },
  { id: "insta", freq: "101.2", name: "Légende Insta", band: "VISUEL / COURT" },
  { id: "short", freq: "107.8", name: "Script Short", band: "VIDÉO / 30s" },
  { id: "newsletter", freq: "112.3", name: "Newsletter", band: "LONG / FIDÈLE" },
];

function Waveform({ active }) {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const base = Math.sin(i * 0.5) * 0.5 + 0.5;
    return 8 + base * 32 + (i % 5 === 0 ? 10 : 0);
  });

  return (
    <div className="flex items-end gap-[3px] h-16 w-full overflow-hidden" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            height: `${h}px`,
            width: "4px",
            borderRadius: "2px",
            background: active
              ? `linear-gradient(180deg, ${PALETTE.signal}, ${PALETTE.amber})`
              : PALETTE.panelLine,
            transition: "height 0.4s ease, background 0.6s ease",
            transitionDelay: `${i * 8}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(["thread", "linkedin", "insta"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const toggleFormat = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!input.trim() || selected.length === 0) return;
    setLoading(true);
    setError("");
    setResults({});

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, formats: selected }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError("La génération a échoué. Vérifie le contenu collé et réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `radial-gradient(ellipse at top, ${PALETTE.bg}, ${PALETTE.bgDeep})`,
        color: PALETTE.ink,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <header className="px-6 pt-12 pb-10 md:px-12 md:pt-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Radio size={18} style={{ color: PALETTE.amber }} />
          <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: PALETTE.inkDim }}>
            Repurpose · Studio de diffusion
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">
          Un signal.
          <br />
          <span style={{ color: PALETTE.amber }}>Toutes les fréquences.</span>
        </h1>
        <p className="max-w-xl text-base md:text-lg" style={{ color: PALETTE.inkDim }}>
          Colle ton contenu une fois. Règle le cadran sur les formats dont tu as besoin.
          Repurpose le retransmet, adapté à chaque antenne.
        </p>
      </header>

      <main className="px-6 pb-20 md:px-12 max-w-5xl mx-auto">
        <section
          className="rounded-2xl p-5 md:p-7 mb-6"
          style={{ background: PALETTE.panel, border: `1px solid ${PALETTE.panelLine}` }}
        >
          <label className="font-mono text-xs tracking-[0.2em] uppercase block mb-3" style={{ color: PALETTE.amber }}>
            Signal source
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Colle ton article, ton script ou ton post le plus long ici…"
            rows={6}
            className="w-full bg-transparent outline-none resize-none text-base leading-relaxed placeholder:opacity-50"
            style={{ color: PALETTE.ink }}
          />
          <div className="mt-3">
            <Waveform active={loading} />
          </div>
        </section>

        <section className="mb-6">
          <span className="font-mono text-xs tracking-[0.2em] uppercase block mb-3" style={{ color: PALETTE.inkDim }}>
            Cadran de fréquences — choisis tes antennes
          </span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FORMATS.map((f) => {
              const active = selected.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFormat(f.id)}
                  className="text-left rounded-xl px-3 py-3 transition-all"
                  style={{
                    background: active ? PALETTE.bgDeep : "transparent",
                    border: `1px solid ${active ? PALETTE.amber : PALETTE.panelLine}`,
                  }}
                >
                  <div className="font-mono text-lg" style={{ color: active ? PALETTE.amber : PALETTE.inkDim }}>
                    {f.freq}
                  </div>
                  <div className="text-sm font-medium mt-1">{f.name}</div>
                  <div className="font-mono text-[10px] tracking-wider mt-1" style={{ color: PALETTE.inkDim }}>
                    {f.band}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim() || selected.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-opacity disabled:opacity-40"
          style={{ background: PALETTE.amber, color: PALETTE.bgDeep }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Diffusion en cours…" : "Diffuser sur ces fréquences"}
        </button>

        {error && (
          <p className="mt-4 text-sm" style={{ color: "#E08A8A" }}>
            {error}
          </p>
        )}

        {Object.keys(results).length > 0 && (
          <section className="mt-10 space-y-4">
            <span className="font-mono text-xs tracking-[0.2em] uppercase block mb-1" style={{ color: PALETTE.inkDim }}>
              Réception
            </span>
            {FORMATS.filter((f) => results[f.id]).map((f) => (
              <div
                key={f.id}
                className="rounded-2xl p-5"
                style={{ background: PALETTE.panel, border: `1px solid ${PALETTE.panelLine}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm" style={{ color: PALETTE.amber }}>
                      {f.freq}
                    </span>
                    <span className="text-sm font-medium">{f.name}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(f.id, results[f.id])}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{ border: `1px solid ${PALETTE.panelLine}`, color: PALETTE.inkDim }}
                  >
                    {copiedId === f.id ? (
                      <>
                        <Check size={12} /> Copié
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copier
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: PALETTE.ink }}>
                  {results[f.id]}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
