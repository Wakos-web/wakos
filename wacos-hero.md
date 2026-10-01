# The WACOS Home Hero — Video Playlist Technique

*How the homepage hero plays curated school videos, and every mechanism behind it — written so the next agent can clone the pattern for any other media section without rediscovering the lessons.*

Live result: a fullscreen, auto-playing, crossfading video playlist on `/`, curated by non-technical staff from Admin → Settings, with per-clip posters, captions, duration/size badges, focal-point cropping for phones, data-saver behaviour, drag **and** keyboard reordering — all persisted instantly to Supabase and served through the service-role proxy.

---

## 1. Architecture at a glance

```
                         ┌────────────────────────────────────────────┐
 Admin dashboard         │ HeroPlaylistManager (admin.tsx ~L1777)     │
 (staff, cookie session) │  • upload/swap/posters/crop/focus/reorder  │
                         │  • writes JSON via supabase-js             │
                         └──────────────┬─────────────────────────────┘
                                        │ fetch swapped by admin-client.ts
                                        ▼
                    ┌───────────────────────────────────────┐
                    │ adminProxy (admin-server.ts ~L578)    │  server function
                    │  • httpOnly staff-session cookie      │
                    │  • SSRF guard + role/table allowlist  │
                    │  • replays with SERVICE-ROLE key      │
                    └──────────────┬────────────────────────┘
                                   ▼
              Supabase Storage (bucket: hero-media, public)   +   site_settings
                                                              (key/value JSON)
                                   ▲                                   │
   Public visitors                 │                                   │ anon read (RLS)
                                   │                                   ▼
                         ┌────────────────────────────────────────────┐
                         │ HeroSection (index.tsx) + getSettings()    │
                         │  • two-layer crossfade player              │
                         │  • data-saver, watchdog, focal point       │
                         └────────────────────────────────────────────┘
```

**The single most important decision:** the hero playlist is **not a table**. It is one JSON document in the key/value table `site_settings` under key `hero_playlist`. Ordered media lists that are always read whole and written whole (≤ dozens of entries) don't need SQL rows, migrations, or RLS per-row policies — one upsert persists everything. The media *files* live in Storage; the JSON stores their public URLs plus curator metadata.

---

## 2. Data model

### 2.1 Storage: the `hero-media` bucket

- Dedicated bucket (the general `uploads` bucket is image-only by policy) allowing **mp4/webm up to 100 MB per object**; the code stays just under at 95 MB (`HERO_VIDEO_MAX_MB`).
- Objects are **public** — `getPublicUrl()` URLs are stored in the JSON, no signed URLs, no runtime auth.
- Path scheme (collision-free, sortable by timestamp, no user-controlled path parts):
  - clips: `hero/<Date.now()>-<6 rand chars>.<ext>`
  - posters: `hero/posters/<ts>-<rand>.<ext>`
  - uncropped poster originals: `hero/posters/originals/<ts>-<rand>.<ext>`
- Uploads always pass `contentType: file.type` and `cacheControl: UPLOAD_CACHE_CONTROL` (= `"604800"`, 7 days, from `src/lib/upload-guide.ts`).
- Every upload call checks **`.error`**, not the response object — supabase-js `upload()` resolves `{ data, error }` even on success; truthiness of the response object is always truthy.

### 2.2 `site_settings.hero_playlist` (JSON)

```
[
  {
    "src":             "https://…/storage/v1/object/public/hero-media/hero/1712…-a3f9.mp4",
    "name":            "Championship final",        // original filename, shown in admin
    "poster":          "https://…/hero-media/hero/posters/1712….jpg",
    "poster_original": "https://…/hero-media/hero/posters/originals/….jpg",
    "caption":         "Busoga Champions 2026",     // shown on the hero while the clip loads
    "size":            14561280,                    // bytes — powers the "heavy" badge
    "duration":        12.4,                        // seconds — powers the "heavy" badge
    "focus":           { "x": 50, "y": 38 }         // PERCENT object-position for phone crops
  }
]
```

Notes:
- All URLs validated client-side with `startsWith("http")` before use — legacy/garbage rows are silently dropped rather than crashing the hero.
- `focus` is **percentages**, not pixels: the same numbers work for every crop (desktop 16/7 → phone 9/16).
- `size`/`duration` were added later; legacy entries without them are probed live in the admin (HEAD request for size, `loadedmetadata` for duration) instead of requiring a data migration.

### 2.3 Fallback single-video mode (SettingsTab)

Classic settings keys beside the playlist:
- `hero_video`, `hero_poster` — the bundled hero when the playlist is empty
- `hero_video_focus` — `"50 38"` (space-separated string, the one legacy quirk)
- `hero_title`, `hero_subtitle` — hero chrome text
- `hero_poster_original` — re-croppable fallback poster

Precedence in `HeroSection`: **playlist.length > 0 → playlist; else single looping `hero_video`**. One clip behaves exactly like the old single video (`loop` is set when `list.length <= 1`).

---

## 3. Public renderer — `HeroSection` in `src/routes/index.tsx`

### 3.1 SSR preload discipline (`Route.head`)

`fetchHeroPlaylistHead()` (`src/lib/cms.ts`) reads `hero_playlist` server-side during SSR and returns only `[{src, poster}]`. Then:

- **Playlist exists** → `<link rel="preload" as="image">` for the first two clips' *posters*, and the multi-MB default video is **never** preloaded. (Old bug fixed here: visitors downloaded the default video the player would never show.)
- **No playlist** → preload the default video as before.
- Returns `[]` on any failure so the page always renders.

The playlist *data itself* hydrates client-side from `getSettings()` (cached module-level in `src/lib/content.ts`); only the preload hints are SSR.

### 3.2 Two-layer crossfade player

Two stacked `<video>` elements (`layerRefs[0]`, `[1]`), never remounted — only their src/poster/classes change:

1. `advance()` picks `nextIdx = (current + 1) % list.length`, assigns the clip to the **back** layer, plays it muted, sets `fading` → back layer gets `opacity-100 z-20`, front `opacity-0 z-0` over `transition-opacity duration-1000`.
2. After **1100 ms** the layers swap (`setActiveLayer(back)`), the old front pauses, and the *now-hidden* layer is preloaded with the **clip after next** so the following transition never stalls (desktop/Wi-Fi only — see data-saver).
3. `fadingRef` guards re-entry; the previous clip stays frozen underneath the fade so there is **never a black flash**.

Lessons encoded in the guards:
- `userPausedRef` — a visitor pause is respected forever; the watchdog won't fight them.
- `data-starting` attribute marks the initial autoplay attempt so the watchdog doesn't advance on a video that is merely still starting.
- A **4 s watchdog interval** covers mobile browsers that suspend background video and never fire `ended`: it advances when `v.ended || (v.paused && v.readyState >= 2 && !v.hasAttribute("data-starting"))`.

### 3.3 Data-saver mode

Chosen by `?saver=1` (QA can reproduce phone behaviour on desktop), else heuristics: `navigator.connection.saveData`, `effectiveType` `slow-2g`/`2g`, or an `Android|iPhone|iPad|iPod` UA. Effect:

- Hidden layer mounts **without `src`** (`preload="none"`), poster only — zero clip bytes until its moment.
- At transition time `advance()` assigns `back.src` — the fetch starts exactly then.
- Preload-ahead of the *next-next* clip is skipped in this mode (`dataSaverRef`).

### 3.4 Focal point → CSS

The clip's `focus` (percentages) becomes `object-position: "50% 38%"`; per-clip `focus` wins, else the fallback `hero_video_focus`, else `50% 50%`. That's the entire crop mechanism — `object-cover` + percentage object-position. No server-side transcoding, no image manipulation. Phones crop the sides hard; the focus dot decides **what survives**.

### 3.5 Captions

The current clip's `caption` renders in the clear upper-left band (`top-24 sm:top-28 lg:left-16`) so it can never collide with the bottom-left title/CTAs or the bottom-right controls; it fades out during transitions (`fading ? "opacity-0"`).

---

## 4. Admin authoring — `HeroPlaylistManager` (in `src/routes/admin.tsx` ~L1777)

### 4.1 The persistence model: every action saves immediately

```
persist(next, okMessage):
  upsert { key: "hero_playlist", value: JSON.stringify(next) } onConflict "key"
  lastSavedRef.current = json     // ← the autosave loop's sync point
  setItems(next)
```

- Same model as the story-media manager: a stray refresh can never lose a curator's work; there is no "Save" button to forget.
- **Captions autosave** via a 700 ms debounce effect that skips when `json === lastSavedRef.current` — structural actions go through `persist()`, which updates `lastSavedRef`, so the debounced effect is a no-op right after them (no double-write).
- `exactOptionalPropertyTypes` is on: when removing an optional field, **rebuild the object without the key** rather than assigning `undefined`.

### 4.2 Uploads and validation

- `addFiles`: type check (`\.mp4|\.webm` extension **or** MIME), size check (95 MB), `MAX_HERO_VIDEOS = 6`, `readVideoDuration()` probe, upload, `getPublicUrl`, append, persist.
- `readVideoDuration(file)`: object URL + hidden `<video preload="metadata">`, `onloadedmetadata`, 4 s timeout, always revokes the URL.
- Heavy badge thresholds: >20 MB or >45 s flagged "heavy — consider a shorter, smaller clip" (phones pay for it). A playlist total line reminds that phones stream one clip at a time.
- **Swap video**: replaces the file behind a clip while *keeping caption/poster/position*; name/size/duration update from the new file. Old object deleted only **after** the new list persists.

### 4.3 Posters: two files + re-crop

- Crop happens in `ImageCropDialog` (drag-and-zoom, hero aspect); the **uncropped original** is uploaded to `hero/posters/originals/` alongside the crop so "Re-crop" never needs a re-upload.
- Fresh picks go straight to the dialog; re-crop passes the stored original URL. `finishCrop` distinguishes the two via `cropImageRef` (string URL = stored original).
- Everything image-shaped runs through `prepareImageForUpload` (`src/lib/image-convert.ts`): TIFF→JPEG conversion, HEIC rejection with a friendly message, size enforcement. Buckets accept jpeg/png/webp only and staff keep picking camera TIFFs — normalize **before** upload, not at render.

### 4.4 Storage cleanup by URL surgery

Replacement/removal deletes superseded objects with a marker split — no path bookkeeping needed:

```ts
const marker = "/storage/v1/object/public/hero-media/";
const path = url.split(marker)[1];            // object path inside the bucket
await supabase.storage.from("hero-media").remove([path]);   // best-effort, non-fatal
```

Rule: **persist the new state first, clean storage second** — a failed cleanup must never lose the playlist edit.

### 4.5 Reorder: drag + keyboard, one write

- Drag: `dataTransfer.setData("text/plain", String(idx))` + splice on drop → `persist(next)`.
- Keyboard: a real `<button>` grip handle; `ArrowUp`/`ArrowDown` swap with the neighbour → same `persist()`.
- **Never disable the focused reorder button while saving** — disabling a focused button blurs it and strands keyboard users mid-reorder; presses during a save simply no-op in `move()`'s busy guard.

### 4.6 Thumbnail affordances

- Click thumbnail → inline watchable preview (128×56).
- **Focus dot** on clips with a saved focus — rendered *pixel-exactly* like the hero overlay (verified 30/30 in the e2e audit).
- **Ghost dashed reticle** at centre for clips *without* focus — the empty spot that will be centred, honest about the default.
- Duration/size from metadata; legacy entries probed live (HEAD → `content-length`; thumbnail `loadedmetadata` → duration) and cached per-URL in `probedRef`.

### 4.7 Focal point + truthful preview (reusable components)

- `src/components/focus-picker.tsx` — 16/7 frame, pointer-capture drag, clamped % coords, works for video (`#t=0.5` frame) and image.
- `src/components/hero-preview-modal.tsx` — renders the **real hero chrome** (the same gradients, `hero_title`/`hero_subtitle` pulled live from `getSettings()`, the Admissions/Explore CTAs) over the media with the chosen `objectPosition`, in a **9/16 phone frame and a 16/7 desktop frame** side by side. Framing decisions are made against what visitors actually see, not a bare rectangle.
- The fallback video's focus/preview live in `SettingsTab` with `cropTarget "hero-poster"` for the fallback poster.

---

## 5. Backend mechanism — why the admin can write at all

### 5.1 The anon-RLS silent no-op (the lesson that started the proxy)

The public `supabase` client (anon key) can *read* published content, but **writes silently no-op**: RLS rejects the row, PostgREST reports success with **0 rows affected, no error**. This is the trap — "it succeeded" lies. Anything the dashboard writes must go through the service-role path.

### 5.2 `adminSupabase` (`src/lib/admin-client.ts`) — fetch swap, zero API change

A normal `createClient()` whose `global.fetch` intercepts calls:

- Only `${SUPABASE_URL}/rest/v1/` and `/storage/v1/` URLs are proxied (auth endpoints go straight out with the anon key).
- **JSON calls**: method, raw body string, and `Prefer` header forwarded to the `adminProxy` server function; the returned `{status, statusText, headers, bodyText}` is rebuilt into a real `Response` (204/205/304 must have `null` body).
- **Binary uploads**: supabase-js sends storage uploads as a raw `Blob` **or** `FormData` — both handled; the file is read as bytes, base64-chunked, and the **real MIME type** is forwarded (bucket policies reject octet-stream — forwarding the true content type is what makes jpeg/png/webp policies accept the upload).

Dashboard code keeps calling `.from(...)` / `.storage.from(...)` exactly as usual. `admin.tsx` imports it as `adminSupabase as supabase`.

### 5.3 `adminProxy` (`src/lib/admin-server.ts` ~L578) — the server gate

A TanStack `createServerFn` that replays each request:

1. **Session**: `readStaffSession()` — httpOnly cookie signed server-side; 401 without it.
2. **SSRF guard**: only this project's `/rest/v1/` or `/storage/v1/` URLs.
3. **Authorization**: `rolesForUid(uid)` live from `user_roles` (never cached); REST table names parsed from the URL and checked against a **role → table allowlist**; `club_patron` rows are additionally scope-gated to their own clubs.
4. **Replay**: `fetch(targetUrl)` with `apikey` + `Authorization: Bearer <SERVICE_ROLE_KEY>` (server env only — the key never ships in the client bundle), forwarding `Prefer` and returning `content-range` headers.

So: `hero_playlist` upserts and `hero-media` uploads from the dashboard are service-role writes, gated by a session the client cannot forge.

### 5.4 RLS still matters

`site_settings` is **public read, admin write** (migration `003_close_anon_holes.sql`, `public.is_admin()`; service-role bypasses RLS per `005`). The public hero reads with the anon key at zero cost; writes are impossible for anon even by hand-crafted REST calls. Storage `hero-media` is public-read; writes happen only via the proxy.

---

## 6. Recipe: reuse this technique for any media section

*(Already cloned successfully for club posts — `src/components/club-post-media-manager.tsx` — which takes a `db` client prop so club editors can use the proxy while public pages pass the anon client.)*

1. **Decide shape**: ≤ ~50 items, always read/write whole → JSON in `site_settings` (or a JSONB column on the owning row, as club posts do). Bigger/relational → real table + schema-drift test entry.
2. **Storage**: pick a bucket policy (image-only vs video-allowed), path scheme `<domain>/<ts>-<rand>.<ext>`, always `contentType` + `cacheControl: UPLOAD_CACHE_CONTROL`, check `.error`.
3. **Manager component**: local `items` state + `persist(next, msg)` writing the whole list; `lastSavedRef` sync point; debounce only for keystroke fields; validate type/size/count client-side with friendly copy.
4. **Keep originals** for anything cropped; delete superseded objects via the marker-split trick, **after** persist.
5. **UX affordances**: drag + keyboard reorder (grip handle, never disable focused buttons), click-to-preview thumbnails, honest default hints (ghost reticle), heavy/size badges.
6. **Crop + focus**: reuse `ImageCropDialog`, `FocusPicker`, `HeroPreviewModal` as-is; store focus as `{x, y}` percentages and render with `object-position`.
7. **Client plumbing**: admin writes through `adminSupabase` (fetch-swap proxy); public reads with the anon client; **never** judge a write by absence of error — check row counts (`e2e/admin-crud-audit.test.mjs` has the RLS no-op guard pattern).
8. **Test**: `node --env-file=.env.local --test e2e/<area>.test.mjs`. Gotchas: synthetic DragEvents need a real `new DataTransfer()`; React state flushes async (wait 150–900 ms between dispatch and read); confirm dialogs are `.fixed.inset-0.z-50` with a Confirm button (not `/cancel/i`); set input values via the prototype setter + `input` event.
9. **If you add columns/tables**: put the SQL in `supabase/migrations/NNN_name.sql`, apply via Supabase Management API (`POST /v1/projects/cykaheepeqcgmveckuru/database/query` with an `sbp_` token — see `e2e/schema-drift.test.mjs` for the drift gate that fails on unapplied migrations), then clear it from `EXPECTED_PENDING`.

---

## 7. File map

| File | Role |
|---|---|
| `src/routes/index.tsx` | `HeroSection` — two-layer crossfade player, data-saver, watchdog, captions, `Route.head` preload logic |
| `src/lib/cms.ts` | `fetchHeroPlaylistHead()` — SSR-safe playlist read for `head()` |
| `src/lib/content.ts` | `getSettings()` (module-cached), `HERO_VIDEO`/`HERO_POSTER` defaults |
| `src/routes/admin.tsx` | `HeroPlaylistManager` (~L1777): uploads, swap, posters, focus, reorder; `SettingsTab` fallback hero keys |
| `src/components/focus-picker.tsx` | Focal-point picker (percent coords) |
| `src/components/hero-preview-modal.tsx` | Truthful phone/desktop hero preview with live chrome |
| `src/components/image-crop-dialog.tsx` | Drag-and-zoom crop (hero aspect) |
| `src/lib/image-convert.ts` | `prepareImageForUpload` — TIFF→JPEG, HEIC rejection, size safety |
| `src/lib/upload-guide.ts` | `UPLOAD_CACHE_CONTROL`, image type/size constants |
| `src/lib/admin-client.ts` | `adminSupabase` — fetch-swap proxy client (binary + JSON paths) |
| `src/lib/admin-server.ts` | `adminProxy` (~L578) — session, SSRF guard, allowlist, service-role replay |
| `e2e/admin-crud-audit.test.mjs` | RLS silent-no-op guard + CRUD/stamps verification patterns |
| `e2e/schema-drift.test.mjs` | Migration↔live-DB drift gate |

## 8. QA shortcuts

- `/?saver=1` — force data-saver on desktop.
- Admin → Settings → Hero playlist — the manager itself (order, focus dots, reticles, heavy badges).
- Removing the playlist (`hero_playlist = []`) instantly reverts to the bundled single-video hero.
