"use client";

import { useState } from "react";
import { Image as ImageIcon, Copy, Check, Wand2, X, RefreshCw, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePrompt } from "@/types/chat";

interface ImagePromptCardProps {
  prompts: ImagePrompt[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function ImagePromptCard({ prompts }: ImagePromptCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeModalPrompt, setActiveModalPrompt] = useState<ImagePrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"cloudflare" | "simulation" | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  if (!prompts || prompts.length === 0) return null;

  const handleCopy = (promptText: string, idx: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const generateImage = async (promptItem: ImagePrompt) => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setImageSource(null);
    setGenerateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptItem.prompt,
          aspect_ratio: promptItem.aspect_ratio,
          platform: promptItem.platform,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      setGeneratedImageUrl(data.image_url);
      setImageSource(data.source === "cloudflare" ? "cloudflare" : "simulation");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Image generation failed";
      setGenerateError(message);
      // Client-side simulation fallback
      setGeneratedImageUrl(
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
      );
      setImageSource("simulation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenGenerator = (promptItem: ImagePrompt) => {
    setActiveModalPrompt(promptItem);
    generateImage(promptItem);
  };

  const sourceLabel =
    imageSource === "cloudflare"
      ? "Cloudflare Workers AI"
      : imageSource === "simulation"
        ? "Preview simulation"
        : "AI Image Preview Studio";

  return (
    <div className="my-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <ImageIcon className="w-4 h-4 text-pink-400" />
        <span>Visual & Image Prompts</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {prompts.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border/60 bg-gradient-to-br from-card/80 to-purple-950/10 p-4 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                {item.platform && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-pink-500/10 text-pink-300 border border-pink-500/20 uppercase">
                    {item.platform}
                  </span>
                )}
                {item.aspect_ratio && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent text-muted-foreground">
                    {item.aspect_ratio}
                  </span>
                )}
                {item.style && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                    {item.style}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(item.prompt, idx)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedIdx === idx ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed font-mono bg-background/50 p-2.5 rounded-lg border border-border/30 my-2">
              {item.prompt}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground italic">
                Midjourney, Flux, DALL-E 3, or Cloudflare AI
              </span>
              <Button
                size="sm"
                onClick={() => handleOpenGenerator(item)}
                className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-pink-500/20 font-medium flex items-center gap-1.5 rounded-lg"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generate Image
              </Button>
            </div>
          </div>
        ))}
      </div>

      {activeModalPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModalPrompt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-foreground">AI Image Preview Studio</h3>
                <p className="text-xs text-muted-foreground">Powered by {sourceLabel}</p>
              </div>
            </div>

            <div className="p-3 bg-background/80 rounded-xl border border-border/50 text-xs font-mono text-muted-foreground">
              {activeModalPrompt.prompt}
            </div>

            {generateError && (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{generateError} — showing simulation fallback.</span>
              </div>
            )}

            <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted aspect-video flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-purple-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium text-foreground">Rendering visual...</span>
                  <span className="text-[10px] text-muted-foreground">
                    {imageSource === null ? "Trying Cloudflare Workers AI" : "Applying model"}
                  </span>
                </div>
              ) : generatedImageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={generatedImageUrl}
                    alt="Generated AI artwork"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs text-white font-medium">
                      {imageSource === "cloudflare" ? "Workers AI • PNG" : "Simulation • Preview"}
                    </span>
                    <a
                      href={generatedImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={imageSource === "cloudflare" ? "claire-generated.png" : undefined}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs backdrop-blur-md flex items-center gap-1.5 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeModalPrompt && generateImage(activeModalPrompt)}
                disabled={isGenerating}
                className="text-xs"
              >
                Re-generate
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveModalPrompt(null)}
                className="text-xs bg-primary text-primary-foreground"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
