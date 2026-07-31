"""Platform-native content specifications for Writer and Editor agents."""

from typing import Dict, List

VALID_PLATFORMS = frozenset({"x", "linkedin", "instagram", "tiktok", "threads"})

PLATFORM_SPECS: Dict[str, Dict[str, str]] = {
    "x": {
        "display_name": "X (Twitter)",
        "tone": "Punchy, provocative, conversational. Short sentences. Internet-native wit allowed.",
        "format": (
            "Single post OR numbered thread (1/5 format). "
            "Hook in first 8 words. No LinkedIn-style line breaks. "
            "Max 280 characters per tweet. 0-2 emojis max. No bullet lists."
        ),
        "structure": "Hook → insight → optional CTA or question. Threads: one idea per tweet.",
        "avoid": (
            "Corporate language, long paragraphs, LinkedIn-style white-space formatting, "
            "hashtag spam, 'Excited to announce' openers."
        ),
        "length": "280 chars per tweet; threads 3-5 tweets max.",
    },
    "linkedin": {
        "display_name": "LinkedIn",
        "tone": "Professional but human. Thought-leadership. First-person perspective welcome.",
        "format": (
            "Strong first-line hook (shows before 'see more'). "
            "Short paragraphs with blank lines between them. "
            "Use → or • bullet points for scannability. End with a discussion question or CTA."
        ),
        "structure": "Hook line → context/story → 3-5 bullet insights → CTA/question.",
        "avoid": (
            "Twitter brevity, TikTok script markers, excessive emojis, "
            "casual slang, hashtag blocks at the top."
        ),
        "length": "800-1300 characters ideal; max 3000.",
    },
    "instagram": {
        "display_name": "Instagram",
        "tone": "Visual-first storytelling. Relatable, aspirational, or educational. Emoji-friendly.",
        "format": (
            "Opening hook line (visible before 'more'). "
            "Short paragraphs with line breaks. Strategic emoji use as visual anchors. "
            "CTA (save, share, comment). Hashtag block at the very end (5-8 hashtags)."
        ),
        "structure": "Hook → story/value → CTA → blank line → hashtags.",
        "avoid": (
            "Thread numbering, professional jargon without context, "
            "TikTok [Visual] markers, LinkedIn bullet-heavy format."
        ),
        "length": "150-400 words caption; hashtags separate at end.",
    },
    "tiktok": {
        "display_name": "TikTok",
        "tone": "Casual, energetic, scroll-stopping. Speak directly to camera. Trend-aware.",
        "format": (
            "Video script ONLY with labeled sections:\n"
            "  [HOOK 0-3s] — pattern interrupt\n"
            "  [VISUAL/SCENE] — what viewer sees\n"
            "  [VOICEOVER] — spoken words (conversational)\n"
            "  [ON-SCREEN TEXT] — key phrases overlaid\n"
            "  [CTA] — follow, comment, link in bio\n"
            "  [AUDIO VIBE] — trending sound style suggestion"
        ),
        "structure": "Hook in first 2 seconds → value/demo → CTA. Total 15-60 seconds.",
        "avoid": (
            "Long-form prose, LinkedIn formatting, hashtag blocks, "
            "formal corporate tone, essay-style paragraphs."
        ),
        "length": "30-90 seconds spoken (~75-200 words voiceover).",
    },
    "threads": {
        "display_name": "Threads",
        "tone": "Intimate, conversational, community-oriented. Like texting a smart friend.",
        "format": (
            "Single flowing post or short 2-3 post thread. "
            "Personal angle ('I noticed…', 'Hot take:'). Minimal formatting. "
            "1-3 emojis. End with a question to spark replies."
        ),
        "structure": "Personal hook → opinion/observation → invite discussion.",
        "avoid": (
            "Corporate press-release tone, heavy bullet lists, "
            "TikTok script markers, LinkedIn thought-leadership structure."
        ),
        "length": "100-500 characters per post; threads max 3 posts.",
    },
}


def format_platform_instructions(platforms: List[str]) -> str:
    """Build per-platform writing instructions for LLM prompts."""
    lines = [
        "CRITICAL: Each platform post MUST be distinctly different in tone, structure, and format.",
        "Do NOT reuse the same copy across platforms — adapt the core message natively.",
        "",
    ]
    for platform in platforms:
        spec = PLATFORM_SPECS.get(platform)
        if not spec:
            continue
        lines.extend([
            f"=== {spec['display_name'].upper()} ===",
            f"Tone: {spec['tone']}",
            f"Format: {spec['format']}",
            f"Structure: {spec['structure']}",
            f"Length: {spec['length']}",
            f"NEVER do on this platform: {spec['avoid']}",
            "",
        ])
    return "\n".join(lines)
