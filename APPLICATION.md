# Slingshot-EXPO — Application Overview

A **Next.js 15** web game built for the **180DC Club Expo** at VIT Chennai. The "0" is missing from the "180DC" logo — visitors use a slingshot to launch it back into place. Hits appear on a live "Wall of Consultants."

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5.7 |
| UI | React 19, Tailwind CSS 3.4 |
| Game Engine | Phaser 3.87 (CANVAS mode, client-only) |
| Database | PostgreSQL via Prisma 6.2 (Neon serverless) |
| Audio | Web Audio API oscillators (no audio files) |
| Deployment | Vercel (region: bom1 / Mumbai) |
| Fonts | Google Fonts: Poppins (display) + Inter (body) |

---

## Directory Structure

```
Slingshot-EXPO/
├── app/
│   ├── globals.css               # Global styles, Tailwind layers, keyframe animations
│   ├── layout.tsx                # Root <html>, metadata, viewport
│   ├── page.tsx                  # Home page — "PLAY NOW" CTA
│   ├── play/
│   │   ├── page.tsx              # /play route shell
│   │   └── PlayClient.tsx        # Game orchestrator — state machine
│   ├── wall/
│   │   ├── page.tsx              # /wall route shell
│   │   └── WallClient.tsx        # Wall of Consultants page
│   └── api/
│       ├── bubbles/route.ts      # GET — fetch bubbles + player count
│       └── session/route.ts      # POST — save player + session
│
├── components/
│   ├── AnimatedBackground.tsx    # Canvas particle network background
│   ├── AudioManager.tsx          # Web Audio synth + mute toggle
│   ├── GameCanvas.tsx            # Phaser 3 game scene (core)
│   ├── NameModal.tsx             # Post-hit name entry modal
│   ├── ResultScreen.tsx          # Hit/miss result overlay
│   └── SpeechBubble.tsx          # Floating bubble wall component
│
├── lib/
│   ├── messages.ts               # 20 hit messages, 20 miss messages
│   ├── prisma.ts                 # Prisma singleton (Vercel-safe)
│   └── utils.ts                  # calculateScore, validateName, checkRateLimit
│
├── prisma/
│   ├── schema.prisma             # Player + Session models
│   └── seed.mjs                  # Seeds 10 demo players
│
├── public/images/
│   └── image.svg                 # Background pattern
│
├── next.config.ts                # Security headers
├── tailwind.config.ts            # Custom colors, fonts, animations
├── vercel.json                   # Deploy config (Mumbai region)
└── .env                          # DATABASE_URL (Neon PostgreSQL)
```

---

## Pages & Routes

### `/` — Home Page
- Dark navy background with particle network animation
- Floating 180DC logo card with green neon accent
- Headline: "Restore the Missing Zero"
- "PLAY NOW" button → `/play`
- "Wall of Consultants" link → `/wall`

### `/play` — Game Page
- State machine: `playing` → `name` | `result` → reset
- Renders the Phaser 3 game canvas (dynamically imported, no SSR)
- On hit: calculates score → shows NameModal → ResultScreen
- On miss: shows ResultScreen with miss message
- "Play Again" resets the game via key increment (full remount)

### `/wall` — Wall of Consultants
- Floating speech bubbles showing player names + hit messages
- Live user count (top-right) with "+1" animation
- Polls `/api/bubbles` every 10 seconds
- Bottom nav: PLAY / HOME
- Keyboard shortcuts: `Ctrl+P` (hide nav), `Ctrl+M` (hide title) for kiosk mode

### `GET /api/bubbles`
- Returns latest 100 sessions with player names
- Returns `totalPlayers` count
- Response: `{ bubbles: [{ id, name, comment, score, createdAt }], totalPlayers }`

### `POST /api/session`
- Accepts `{ name, distance }`
- Rate limits by IP (15s cooldown)
- Validates name (required, ≤20 chars, letters+spaces only)
- Recalculates score server-side from distance
- Creates Player + Session records
- Returns: `{ id, name, score, comment, createdAt }`

---

## Components

### AnimatedBackground
Full-screen `<canvas>` with 35 drifting white dots connected by green lines when within 120px. Accepts `active` prop — when false, drawing is skipped (used during gameplay for performance).

### AudioManager
React Context provider with `useAudio()` hook exposing `{ muted, toggleMute, play }`. Synthesizes sounds via Web Audio API oscillators:

| Sound | Type | Description |
|-------|------|-------------|
| `launch` | sine | Upward sweep 200→700 Hz, 0.2s |
| `hit` | triangle | Major chord (C5+E5+G5), 0.5s |
| `miss` | square | Downward sweep 200→80 Hz, 0.4s |
| `click` | square | Short blip at 800 Hz, 0.05s |

Renders a floating mute button (top-left). Persists preference in `localStorage`.

### GameCanvas (core game — ~930 lines)
Phaser 3 scene rendered on a `<canvas>`. All visuals are procedural (no image assets for gameplay).

**Visual elements:**
- Night sky with stars, hills, clouds, grass, trees, spotlights
- 180DC logo: white plaque with green border, "18" on left, "DC" on right, glowing empty slot in center
- Wooden slingshot Y-fork at bottom-center
- Green "0" projectile with pulsing glow aura
- Power bar with green→yellow→red gradient

**Gameplay flow:**
1. **Countdown:** 3-2-1-GO! (player cannot interact)
2. **Drag:** Touch/click and drag the zero. Rubber band lines, trajectory dots, power bar update in real-time. Max pull: 130px.
3. **Launch:** Zero fires with physics. Power multiplier: 0.22 (desktop) / 0.28 (mobile).
4. **Flight:** Projectile physics with gravity 0.18 (desktop) / 0.26 (mobile). Green trail dots follow. Within 140px of target, a gravitational pull curves trajectory inward.
5. **Hit:** Zero lands within 70px (desktop) / 90px (mobile) of slot center while falling. Triggers reveal animation.
6. **Miss:** Zero goes off-screen. Shows retry prompt.

**Scoring (distance from target center):**
| Distance | Score |
|----------|-------|
| ≤ 3px | 100 |
| ≤ 5px | 98 |
| ≤ 10px | 95 |
| ≤ 20px | 90 |
| ≤ 50px | 75 |
| ≤ 75px | 60 |
| ≤ 110px | 40 |
| ≤ 160px | 20 |
| ≤ 200px | 10 |
| > 200px | 0 |

**Hit animation:** White flash, camera shake, confetti (40 colored rectangles), particle burst (25 circles), "PERFECT!" text. Then transitions to NameModal.

**Miss animation:** Camera shake, expanding rings, "MISS" text, dark overlay. Arrow resets for retry.

### NameModal
Glass-morphism modal with name input (max 20 chars, letters+spaces). "ADD TO WALL" button and "Skip" link. Auto-focuses input after 400ms.

### ResultScreen
Two variants:
- **Hit:** Target emoji, typewriter message, score counter (counts up), "Welcome to the Wall, {name}!", 5s countdown before "PLAY AGAIN" activates. Links to 180DC shop and `/wall`.
- **Miss:** Typewriter message, "PLAY AGAIN" / "VISIT 180DC" / "SEE WHO HIT IT" buttons.

### SpeechBubble (FloatingWall)
Floating cloud-shaped bubbles with player names + comments. 5 size variants (xs→xl), 5 green color palettes. Random positions, rotations, wobble animations. Density scales down when >60 players. Max 80 bubbles (desktop) / 50 (mobile). Fetches from `/api/bubbles` every 10s.

---

## Database Schema

**PostgreSQL** via Prisma (Neon serverless with PgBouncer)

```
Player
├── id        String (UUID, auto)
├── name      String
├── createdAt DateTime (now)
└── sessions  Session[]

Session
├── id        String (UUID, auto)
├── playerId  String (FK → Player.id)
├── score     Int (0-100, calculated from distance)
├── comment   String (random hit message)
├── createdAt DateTime (now)
└── player    Player
```

---

## Configuration

### Tailwind (`tailwind.config.ts`)
- **Colors:** `180dc-green` (#2E7D32), `180dc-green-neon` (#7CFC00), `180dc-navy` (#0a1628)
- **Fonts:** `display` (Poppins), `body` (Inter)
- **Animations:** 13 custom keyframes (float, bounce-in, slide-up, scale-in, glow-breathe, etc.)

### Next.js (`next.config.ts`)
- Strict mode enabled
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### Vercel (`vercel.json`)
- Region: `bom1` (Mumbai)
- API function timeout: 15s for `/api/session` and `/api/bubbles`

### TypeScript (`tsconfig.json`)
- Target: ES2017, Strict mode, Incremental builds
- Path alias: `@/*` → `./*`
- Excludes `mobile/` directory

---

## Deployment

1. **Database:** Neon PostgreSQL (connection string in `.env`)
2. **Push schema:** `npm run db:push`
3. **Seed data:** `npm run db:seed`
4. **Deploy:** Push to `main` → Vercel auto-deploys
5. **Region:** Mumbai (`bom1`) for lowest latency at VIT Chennai

---

## Key Design Decisions

- **No audio files:** All sounds are Web Audio API oscillators — zero network requests for audio.
- **No image assets for gameplay:** The entire Phaser scene is procedurally drawn — stars, hills, clouds, logo, slingshot, zero projectile.
- **Client-only game:** Phaser is dynamically imported with `ssr: false` to prevent server-side rendering issues.
- **Mobile-adaptive:** Gravity, hit zone size, power multiplier, and all visual scales adjust based on `Math.min(w, h) < 600`.
- **Rate limiting:** In-memory IP-based limiter (15s cooldown) with auto-cleanup at 10k entries.
- **Singleton Prisma:** Prevents connection exhaustion in Vercel serverless warm instances.
