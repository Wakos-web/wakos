# Video Hero Design — M.M College Wairaka

**Date:** 2026-09-03
**Status:** Approved
**Approach:** Center-crop portrait video with blurred pillarbox sides

## Overview

Replace the static image hero on the homepage with an auto-playing, muted, looping portrait (9:16) video. The video is centered in the viewport with blurred side panels filling the landscape gap, inspired by the WUR.nl full-bleed hero aesthetic.

## Assets

- **Video:** `public/hero-video.mp4` — 1.56 MB, portrait 9:16, from TikTok
- **Poster/Thumbnail:** `public/wacos-pillar.png` — 2 MB, school pillar image
- **Source files:** `C:\Users\KELVIN MUNJE\Downloads\wacos-site-main\mm college\`

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────┐
│  blurred    │   VIDEO (centered)   │ blurred │
│  sides      │   fills full height  │ sides   │
│  (blur 40px)│                      │         │
│             │                      │         │
│             │  ┌─────────────────┐ │         │
│             │  │  School tagline │ │         │
│             │  │  [play/pause]   │ │         │
│             │  └─────────────────┘ │         │
└─────────────────────────────────────────────┘
```

- Height: `85vh` (matching current hero)
- Video: `object-fit: cover`, centered, fills height
- Sides: Blurred copy of poster image or video frame, `filter: blur(40px) saturate(1.2)`
- Gradient overlay: `bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/40`
- Text: School tagline + play/pause button, centered at bottom

## Mobile Layout (<1024px)

- Video fills screen naturally (portrait = perfect phone fit)
- Same gradient overlay + tagline
- Play/pause control
- Keeps existing rounded card treatment + admissions CTA below

## Video Behavior

- `<video>` attributes: `autoPlay muted loop playsInline preload="metadata"`
- `poster` attribute: `/wacos-pillar.png`
- Play/pause button toggles `video.play()` / `video.pause()`
- CSS: `object-fit: cover` to fill container

## Implementation Steps

1. Copy video + thumbnail to `public/` folder
2. Add `HERO_VIDEO` and `HERO_POSTER` constants to `src/lib/content.ts`
3. Replace `HeroSection` in `src/routes/index.tsx` with video version
4. Desktop: layered layout with blurred background + centered video
5. Mobile: full-bleed video with overlay
6. Add play/pause state management
7. Build and deploy

## Performance Notes

- Video: 1.56 MB — no lazy loading needed
- Poster: 2 MB — acceptable for above-the-fold
- `preload="metadata"` to avoid loading full video before play
- No JavaScript video player library — native HTML5 `<video>`
