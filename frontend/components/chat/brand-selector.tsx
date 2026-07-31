"use client";

import { useState } from "react";
import { Building2, ChevronDown, Check, Sliders } from "lucide-react";
import { BrandProfile } from "@/types/chat";
import { BrandVoiceEditorModal } from "@/components/chat/brand-voice-editor";

export const PRESET_BRANDS: BrandProfile[] = [
  {
    id: "default",
    name: "Claire Global Brand",
    tagline: "AI-Powered Social Media Management",
    tone_of_voice: "Professional, Engaging, Authoritative",
    target_audience: "Tech Founders, Content Creators, Marketers",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "tech_startup",
    name: "Pulse AI (Tech SaaS)",
    tagline: "Next-gen Developer Analytics",
    tone_of_voice: "Visionary, Concise, High-Tech",
    target_audience: "Developers, CTOs, Tech Enthusiasts",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "lifestyle_brand",
    name: "Aura Living (Lifestyle)",
    tagline: "Minimalist Mindful Living",
    tone_of_voice: "Warm, Inspiring, Aesthetic",
    target_audience: "Gen Z & Millennial Creators",
    color: "from-pink-500 to-rose-400",
  },
  {
    id: "b2b_enterprise",
    name: "Apex Global (Enterprise)",
    tagline: "Cloud Strategy & Automation",
    tone_of_voice: "Polished, Thoughtful, Data-driven",
    target_audience: "Executives, Marketing Directors",
    color: "from-emerald-500 to-teal-600",
  },
];

interface BrandSelectorProps {
  selectedBrandId: string;
  onSelectBrand: (brandId: string) => void;
}

export function BrandSelector({ selectedBrandId, onSelectBrand }: BrandSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const activeBrand =
    PRESET_BRANDS.find((b) => b.id === selectedBrandId) || PRESET_BRANDS[0];

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/50 transition-all text-left shadow-sm group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeBrand.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate group-hover:text-purple-300 transition-colors">
              {activeBrand.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate font-sans">
              {activeBrand.tone_of_voice}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border/80 rounded-xl p-1.5 shadow-xl space-y-1 backdrop-blur-xl max-h-64 overflow-y-auto">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2.5 py-1 tracking-wider">
              Select Active Brand Profile
            </div>

            {PRESET_BRANDS.map((brand) => {
              const isSelected = brand.id === activeBrand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    onSelectBrand(brand.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${isSelected
                      ? "bg-purple-500/15 text-purple-200 border border-purple-500/30"
                      : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded bg-gradient-to-tr ${brand.color || "from-purple-500 to-indigo-500"} shrink-0`} />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{brand.name}</div>
                      <div className="text-[10px] text-muted-foreground/80 truncate">{brand.tagline}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                </button>
              );
            })}

            <div className="pt-1 border-t border-border/40 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEditorOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Brand Voice Rules</span>
              </button>
            </div>
          </div>
        </>
      )}

      <BrandVoiceEditorModal
        brandId={selectedBrandId}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
