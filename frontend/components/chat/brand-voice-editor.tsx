"use client";

import { useState, useEffect } from "react";
import { X, Save, Sparkles, AlertCircle, Check, ShieldAlert, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandProfile } from "@/types/chat";

interface BrandVoiceEditorProps {
  brandId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: BrandProfile) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function BrandVoiceEditorModal({ brandId, isOpen, onClose, onSaved }: BrandVoiceEditorProps) {
  const [formData, setFormData] = useState<BrandProfile>({
    id: brandId || "default",
    name: "Claire AI",
    tagline: "The Autonomous AI Social Media Manager",
    tone_of_voice: "Authoritative, empathetic, engaging, data-backed, zero fluff",
    target_audience: "Founders, Marketers, Creators, and Growth Teams",
    content_pillars: ["AI & Automation", "Social Media Strategy", "Growth Analytics", "Content Creation"],
    style_guidelines: "Use strong hooks, short crisp paragraphs, high formatting readability, clear call-to-actions.",
    visual_style: "Modern minimalist, high-tech dark mode aesthetic, vibrant accents, sleek typography",
    do_not_use: ["synergy", "paradigm shift", "leverage", "buzzwords without context"],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && brandId) {
      fetchBrand();
    }
  }, [isOpen, brandId]);

  const fetchBrand = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/brands/${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          id: data.id || brandId,
          name: data.name || "Claire AI",
          tagline: data.tagline || "",
          tone_of_voice: data.tone_of_voice || "",
          target_audience: data.target_audience || "",
          content_pillars: Array.isArray(data.content_pillars) ? data.content_pillars : [],
          style_guidelines: data.style_guidelines || "",
          visual_style: data.visual_style || "",
          do_not_use: Array.isArray(data.do_not_use) ? data.do_not_use : [],
        });
      }
    } catch (err) {
      console.warn("Could not fetch brand profile, using defaults:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/v1/brands/${brandId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save brand profile.");
      }

      const data = await res.json();
      setSaveSuccess(true);
      if (onSaved) onSaved(data.brand_profile || formData);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update brand voice profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Brand Voice & Persona Rules</h2>
              <p className="text-xs text-muted-foreground">Stored in Supabase and strictly enforced by the Editor agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          {/* Brand Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Brand Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background/60 text-xs"
                placeholder="e.g. Claire AI"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Tagline</label>
              <Input
                value={formData.tagline || ""}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="bg-background/60 text-xs"
                placeholder="e.g. Autonomous AI Growth Manager"
              />
            </div>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="font-semibold text-foreground block mb-1 flex items-center justify-between">
              <span>Tone of Voice</span>
              <span className="text-[10px] font-normal text-muted-foreground">Editor Agent Rule</span>
            </label>
            <textarea
              rows={2}
              value={formData.tone_of_voice}
              onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
              className="w-full rounded-xl border border-border/80 bg-background/60 p-2.5 text-xs text-foreground focus:ring-1 focus:ring-purple-500"
              placeholder="e.g. Authoritative, direct, engaging, data-backed..."
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="font-semibold text-foreground block mb-1">Target Audience</label>
            <textarea
              rows={2}
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              className="w-full rounded-xl border border-border/80 bg-background/60 p-2.5 text-xs text-foreground focus:ring-1 focus:ring-purple-500"
              placeholder="e.g. Founders, Marketers, Growth Leaders..."
            />
          </div>

          {/* Content Pillars */}
          <div>
            <label className="font-semibold text-foreground block mb-1">
              Content Pillars <span className="font-normal text-muted-foreground">(comma separated)</span>
            </label>
            <Input
              value={(formData.content_pillars || []).join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content_pillars: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="bg-background/60 text-xs"
              placeholder="e.g. AI & Automation, Social Media Strategy, Growth Analytics"
            />
          </div>

          {/* Style Guidelines */}
          <div>
            <label className="font-semibold text-foreground block mb-1">Style Guidelines</label>
            <textarea
              rows={2}
              value={formData.style_guidelines || ""}
              onChange={(e) => setFormData({ ...formData, style_guidelines: e.target.value })}
              className="w-full rounded-xl border border-border/80 bg-background/60 p-2.5 text-xs text-foreground focus:ring-1 focus:ring-purple-500"
              placeholder="e.g. Short crisp paragraphs, high readability, bullet points..."
            />
          </div>

          {/* Banned Words / Do Not Use List */}
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
            <label className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Banned Words & Phrases (Do Not Use)</span>
            </label>
            <p className="text-[10px] text-muted-foreground">
              The Editor agent will flag and remove these words with zero tolerance.
            </p>
            <Input
              value={(formData.do_not_use || []).join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  do_not_use: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="bg-background/80 text-xs border-rose-500/30 text-rose-200"
              placeholder="e.g. synergy, paradigm shift, leverage"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-[11px] text-muted-foreground">
            {saveSuccess ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to Supabase
              </span>
            ) : (
              "Changes apply automatically to all agent runs"
            )}
          </span>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save Brand Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
