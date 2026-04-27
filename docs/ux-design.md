# Snake Game — UX & Visual Design Document

## 1. Visual Identity

### Design Philosophy
**"Retro soul, modern polish."** The game should feel like a love letter to 80s/90s arcade games — pixel art, chunky UI, CRT-inspired touches — but with modern mobile UX: smooth animations, clear touch targets, readable typography, and intuitive navigation. Think: *a pixel art game that a professional designer made in 2025*.

### Colour Palette

| Swatch | Name | Hex | Usage |
|---|---|---|---|
| Dark | **Void Black** | `#0f0e17` | Primary background, app chrome |
| Dark Alt | **Deep Navy** | `#1a1a2e` | Card backgrounds, secondary panels |
| Primary | **Neon Green** | `#00ff41` | Snake body, primary actions, success states, score text |
| Accent | **Electric Blue** | `#00d4ff` | Links, highlights, UI focus rings, portal glow |
| Warm | **Pixel Gold** | `#ffc800` | Stars, coins, XP, golden apple, achievements |
| Danger | **Retro Red** | `#ff3333` | Hearts/lives, death, poison, errors |
| Soft | **Dust White** | `#e8e8e8` | Body text, secondary labels |
| Muted | **Stone Grey** | `#555568` | Disabled states, inactive tabs, wall colour |
| World 1 | **Meadow Green** | `#2d5a27` | World 1 theme tint |
| World 2 | **Temple Sand** | `#c4a35a` | World 2 theme tint |
| World 3 | **Ice Cyan** | `#7fdbda` | World 3 theme tint |
| World 4 | **Shadow Purple** | `#6b3fa0` | World 4 theme tint |
| World 5 | **Cosmic Violet** | `#9d4edd` | World 5 theme tint |

The UI uses a dark theme throughout. Dark backgrounds let the neon pixel art pop. Colour is used sparingly for meaning — green = good/go, red = danger/life, gold = reward.

### Typography

| Role | Font | Weight | Size (mobile) | Notes |
|---|---|---|---|---|
| **Display / Logo** | Press Start 2P (Google Fonts) | Regular | 24-32px | All-caps. Used for game title, world names, "GAME OVER". The retro font. |
| **Headings** | Press Start 2P | Regular | 14-18px | Level names, section headers. Keep short — this font is wide. |
| **Body / UI** | Inter or system sans-serif | 500-700 | 14-16px | Menus, descriptions, settings labels. Clean and readable. |
| **Score / HUD** | Press Start 2P | Regular | 12-14px | In-game score, timer, lives counter. Monospaced feel. |
| **Buttons** | Inter | 700 (Bold) | 14-16px | All-caps with letter-spacing. Modern but chunky feel. |

The contrast is intentional: Press Start 2P for anything that should feel *retro and game-like*, Inter for anything that should feel *usable and clear*. Never use the pixel font for long text or small labels — it becomes unreadable.

### Pixel Art Grid
All game elements (snake, food, walls, obstacles) are drawn on a **16x16 pixel** tile grid. Art is rendered at integer scale (2x, 3x, 4x depending on screen size) so pixels are always crisp — no sub-pixel blurring. Anti-aliasing is off for game sprites.

UI elements (buttons, cards, modals) are NOT pixel art — they use standard rounded-rect styling with the dark theme. This separation keeps the retro feel inside the game board while the surrounding UI remains polished and usable.

---

## 2. The Snake

### Anatomy
The snake is drawn on the pixel grid. It consists of:
- **Head**: 16x16 tile, slightly larger visual than body segments. Has two small dot eyes that face the movement direction. A subtle pixel "tongue" flickers out every few seconds (2-frame animation).
- **Body segments**: 16x16 tiles. Rounded-corner pixel blocks that connect smoothly to adjacent segments. Alternate very slightly between two shades of neon green for a segmented caterpillar look.
- **Tail**: 16x16 tile, tapers to a point in the movement direction of the last segment.

### Colour
- Default skin: Neon Green (`#00ff41`) body with slightly darker green (`#00cc33`) alternating segments. Eyes are white dots with black pupils.
- The head has a 1-pixel bright highlight on top (lighter green) to catch the eye.

### Movement Animation
- **Smooth glide**: The snake does NOT teleport tile-to-tile. It smoothly interpolates between tiles over the tick duration. Each segment follows the path of the one ahead of it, creating a fluid slithering motion.
- **Turn animation**: When the head changes direction, the corner segment smoothly rounds the turn (no instant 90-degree snap). The body follows the exact path the head took.
- **Eating animation**: When the head eats food, the head briefly scales up ~20% (2-frame "chomp" for 150ms) and the new tail segment slides out from the current tail position.
- **Growing flash**: A brief green glow pulse ripples from head to tail when a new segment is added (200ms).
- **Death animation**: The snake flashes red/white 3 times (300ms), then segments scatter outward from the point of collision and fade out, pixel by pixel, in a small "explosion" of green particles. Takes ~800ms total.
- **Speed boost visual**: When on a speed pad, the snake leaves a faint neon green motion trail (afterimage that fades over 4-5 tiles behind).
- **Slow visual**: When on a slow pad, subtle blue tint overlays the snake and small "zzz" pixel particles float up.
- **Ice slide visual**: On ice, the snake's body has a subtle blue shimmer and small ice particle effects trail behind.

---

## 3. Lives System

### Overview
The player has a pool of **lives** that persist across levels within a play session. Losing all lives forces a restart from a checkpoint.

### Rules
- **Starting lives**: 3 (shown as pixel hearts in HUD)
- **Max lives**: 5
- **Losing a life**: Snake dies (wall collision, obstacle hit, poison death, self-collision). The current level restarts. One heart is removed from the HUD with a shatter animation.
- **Gaining a life**: Earned as rewards — completing a world grants +1 life. 3-starring a level grants +1 life. Finding a hidden **Heart Pickup** on certain levels grants +1 life (rare, max 1 per world).
- **Game Over (0 lives)**: "GAME OVER" screen. Player can continue from the start of the current world (lives reset to 3) or return to the main menu.
- **Heart Pickup element**: A small pixel heart item that can appear on select levels. Not required to complete the level — optional bonus. Placed in moderately risky spots.

### HUD Display
Lives shown as pixel heart icons in the top-right of the game HUD. Full hearts = Retro Red. Lost hearts = dark empty outline. When a life is lost, the rightmost full heart cracks and shatters (pixel particle animation, 400ms).

When the player is down to 1 life, the last heart subtly pulses (throb animation) as a warning.

---

## 4. Screen Map

### Screen Flow

```
[Splash] → [Main Menu] → [World Map] → [Level Select] → [Level Intro] → [Gameplay]
                │              │                                │              │
                │              │                                │         [Pause Menu]
                │              │                                │              │
                │              │                                │         [Gameplay]
                │              │                                │              │
                │              │                                │    ┌─────────┴──────────┐
                │              │                                │    │                     │
                │              │                                │ [Level Complete]    [Death Screen]
                │              │                                │    │                     │
                │              │                                │    │              ┌──────┴───────┐
                │              │                                │    │              │              │
                │              │                                │    │         [Retry Level]  [Game Over]
                │              │                                │    │                         (0 lives)
                │              │                                │    │                             │
                │              ←────────────────────────────────┘    │              [Continue from World Start]
                │                                                    │                    or
                ←────────────────────────────────────────────────────┘              [Main Menu]
                │
           [Settings]
           [Stats / Achievements]
```

---

## 5. Screen Designs

### 5.1 Splash Screen
**Purpose**: Brand moment. Shown for 2 seconds on app open.

- **Background**: Void Black with a slow-moving starfield (tiny pixel dots scrolling upward)
- **Centre**: Game logo — "SNAKE" in Press Start 2P, large (32px), Neon Green with a subtle pixel drop shadow. Below it, smaller: "LEVEL QUEST" or game subtitle in Electric Blue.
- **Bottom**: Small "Tap to start" text, blinking on/off every 800ms (classic arcade prompt). Dust White, 12px Press Start 2P.
- **Animation**: Logo fades in from black (400ms), then the starfield starts moving. After 2 seconds or on tap, transitions to Main Menu with a quick fade-to-black (200ms).
- **Sound**: A short retro synth chord on logo appear (8-bit style).

### 5.2 Main Menu
**Purpose**: Hub screen. Navigate to play, settings, or stats.

- **Background**: Void Black with subtle animated starfield (same as splash, slower)
- **Top**: Game logo (smaller than splash, 24px). Pixel snake mascot coiled beneath it — small idle animation (tongue flicker, gentle sway).
- **Centre**: Stacked buttons with generous touch targets (min 48px height, full width minus padding):
  - **"PLAY"** — Large, Neon Green background, black text. Primary action. Slight pixel border glow animation (pulsing).
  - **"SETTINGS"** — Dark Navy background, Dust White text, Stone Grey border.
  - **"STATS"** — Dark Navy background, Dust White text, Stone Grey border.
- **Bottom**: Lives display — 3 pixel hearts (or current count). Small "x3" label next to hearts.
- **Corners**: Total stars collected (top-left, gold star icon + count). High score / XP (top-right).
- **Transitions**: Buttons have a quick press animation — scale down 95% on touch, back to 100% on release, then navigate (150ms).

### 5.3 World Map
**Purpose**: Show the 5 worlds and overall progress.

- **Background**: Dark background with world-themed colour gradient shifts as the user scrolls.
- **Layout**: Vertical scroll. Each world is a large card/banner:
  - World name in Press Start 2P (16px)
  - World theme illustration (pixel art banner — meadow, temple, ice cave, forest, cosmos)
  - Progress bar: "5/7 levels completed" with star count "12/21 stars"
  - If locked: greyed out with a pixel lock icon and "Complete World X to unlock" label
- **Current world**: Highlighted with a subtle neon border glow matching the world's theme colour.
- **Tap**: Opens that world's Level Select screen.
- **Transition**: Card expands and morphs into the Level Select screen (300ms ease-out).

### 5.4 Level Select
**Purpose**: Choose a level within a world.

- **Background**: World theme colour gradient (dark-to-darker). Subtle pixel pattern overlay (e.g. grass tiles for World 1, stone for World 2).
- **Top bar**: Back arrow (←), World name in Press Start 2P (14px), Star count for this world.
- **Layout**: Grid of level nodes (3 columns). Each node is a circle/rounded square:
  - **Unlocked + not completed**: World theme colour, level number in centre (Press Start 2P, 14px)
  - **Completed**: Shows 1-3 star icons below. Border becomes Neon Green.
  - **Locked**: Stone Grey, pixel lock icon, no number.
  - **Current (next to play)**: Pulsing glow border. Slightly larger than others.
- **Node size**: ~64x64px with 16px gaps. Touch-friendly.
- **Tap unlocked level**: Opens Level Intro screen.
- **Scroll**: Vertical if more than 9 levels (3x3 visible).

### 5.5 Level Intro Screen
**Purpose**: Brief the player before starting. Show the goal, elements in play, and level name.

- **Background**: Dimmed gameplay board (the actual level, frozen, slightly blurred/darkened at 60% opacity).
- **Overlay card** (centred, rounded 16px corners, Deep Navy bg, 80% screen width):
  - **World + Level label**: "WORLD 1 — LEVEL 3" in Press Start 2P (12px), world theme colour.
  - **Level name**: "Find the Door" in Press Start 2P (16px), Dust White.
  - **Goal line**: Icon + text. e.g. Apple icon + "Eat all apples" or Door icon + "Reach the exit". Inter 600, 14px.
  - **New mechanic badge** (if applicable): Yellow banner — "NEW: Exit Door" with a small pixel preview of the element. Brief 1-line explanation.
  - **Star targets**: "★ Complete | ★★ Under 30s | ★★★ Perfect (no segments lost)" — Inter 500, 12px, Stone Grey.
  - **Lives**: Heart icons showing current lives.
  - **Button**: "START" — full width, Neon Green bg, black text, large (52px height). Press to begin.
- **Transition**: Card slides up and fades out (200ms), game unblurs and starts.

### 5.6 Gameplay Screen (HUD)
**Purpose**: The actual game. Minimal HUD — maximum board visibility.

- **Board**: Fills as much screen as possible. Dark background (world-themed). Grid lines are very subtle (1px, 8% opacity) or invisible — walls and elements define the space.
- **Top HUD bar** (semi-transparent dark overlay, 44px tall):
  - **Left**: Pause button (pixel "II" icon, 36x36px touch target)
  - **Centre**: Level name — small, Press Start 2P 10px, 50% opacity. Unobtrusive.
  - **Right**: Lives (pixel hearts) + Score (Neon Green, Press Start 2P 12px)
- **Goal reminder** (below HUD bar, only for first 3 seconds then fades out): "Eat all apples (3 remaining)" — Inter 500, 12px, fades to 0 opacity over 1 second.
- **Apple counter** (persistent, bottom-left): Small apple icon + "3/6" — only shown in "eat all" levels. Press Start 2P, 10px.
- **Timer** (if applicable): Top-centre below HUD, Press Start 2P, 12px. Ticks up. Turns Retro Red when past target time for ★★.
- **Key inventory** (if keys in level): Bottom-right, small icons of collected keys. Empty key silhouettes for uncollected ones.
- **Timed food countdown**: Shown as a circular ring around the timed food tile itself (depletes clockwise). Also a small countdown number above the food.

**Touch Controls (active during gameplay)**:
- **Swipe**: Anywhere on screen. Swipe direction = turn direction. Minimum swipe distance: 20px to avoid accidental triggers.
- **Tap**: Tap left half of screen = turn left (relative to snake direction). Tap right half = turn right. A very subtle dividing line flashes on first use only (tutorial).
- **D-pad** (if enabled in settings): Semi-transparent pixel D-pad in bottom-right corner. 120x120px, 30% opacity, becomes 60% opacity on touch.

### 5.7 Pause Menu
**Purpose**: Pause gameplay, access settings, or quit.

- **Trigger**: Tap pause button (top-left HUD) or swipe down from top edge.
- **Background**: Game board freezes, dark overlay (70% opacity) slides down.
- **Overlay card** (centred, Deep Navy, rounded):
  - **"PAUSED"** — Press Start 2P, 18px, Dust White.
  - **Buttons** (stacked, full width):
    - "RESUME" — Neon Green bg, black text.
    - "RESTART LEVEL" — Dark bg, Dust White text.
    - "SETTINGS" — Dark bg, Stone Grey text.
    - "QUIT TO MENU" — Dark bg, Retro Red text.
  - **Current lives display** beneath buttons.
- **Resume transition**: Overlay slides up (200ms), game resumes with a "3-2-1" countdown (each number shown for 600ms in Press Start 2P 32px, Neon Green, centre screen) before movement resumes.

### 5.8 Death Screen
**Purpose**: Show what happened, give options.

- **Trigger**: Snake dies. Death animation plays (800ms), then this screen appears.
- **Background**: Game board frozen at death moment, dark overlay (80% opacity).
- **Overlay card**:
  - **Cause of death** (brief): "Hit a wall!" / "Poison!" / "Caught by obstacle!" — Press Start 2P, 14px, Retro Red.
  - **Life lost indicator**: Heart icon cracks and shatters animation. "2 lives remaining" — Inter 600, 14px.
  - **Buttons**:
    - "RETRY" — Neon Green bg, prominent. Restarts the level.
    - "QUIT" — Dark bg, Stone Grey text. Returns to level select.
- **If 0 lives**: Different layout — see Game Over screen.

### 5.9 Game Over Screen (0 Lives)
**Purpose**: All lives lost. Offer continue or quit.

- **Background**: Void Black. Slow red pixel static / scan line effect.
- **Centre**:
  - **"GAME OVER"** — Press Start 2P, 28px, Retro Red. Flickers on with a CRT turn-on effect (horizontal line expands to full text, 400ms).
  - Pixel snake mascot lying on its back, X's for eyes (pixel art, small idle animation — subtle leg twitch).
  - **Stats**: "You reached Level 14" / "Best streak: 5 levels" — Inter 500, 14px, Stone Grey.
- **Buttons** (after 1.5 second delay — prevents accidental tap-through):
  - "CONTINUE FROM WORLD START" — Electric Blue bg, white text. Resets lives to 3, returns to the first level of the current world.
  - "MAIN MENU" — Dark bg, Dust White text.
- **Sound**: Low retro "game over" jingle (descending 8-bit tones, 1.5 seconds).

### 5.10 Level Complete Screen
**Purpose**: Celebrate completion, show stars earned.

- **Trigger**: Level goal achieved. Brief celebration animation on the board (confetti / sparkle particles, 600ms), then this screen slides up.
- **Background**: Game board (completed state), dark overlay (60% opacity).
- **Overlay card** (generous size, Deep Navy):
  - **"LEVEL COMPLETE!"** — Press Start 2P, 16px, Neon Green. Bounces in.
  - **Star display**: 3 large star outlines. Stars fill in one at a time with a gold burst animation (each star 300ms, total ~1s). Unfilled stars remain as dark outlines. Satisfying sparkle particle effect on each fill.
  - **Stats breakdown** (Inter 500, 13px):
    - Time: "00:42" (green if under target, white if over)
    - Segments lost: "0" (green if 0, red if > 0)
    - Score: "+120"
  - **New best indicator**: If this beats the previous star count, a "NEW BEST!" badge bounces in (Pixel Gold, Press Start 2P 10px).
  - **Extra life earned** (if 3 stars): "+1 LIFE" with heart icon, small celebration.
  - **Buttons** (after star animation completes):
    - "NEXT LEVEL" — Neon Green bg, large. Arrow icon (→).
    - "RETRY" — Dark bg, Dust White. For players wanting a better score.
    - "LEVEL SELECT" — Dark bg, Stone Grey. Small.
- **Sound**: Ascending 8-bit celebration jingle. Extra fanfare if 3 stars.

### 5.11 World Complete Screen
**Purpose**: Celebrate finishing all levels in a world. Unlock next world.

- **Trigger**: Completing the final level of a world.
- **Background**: Void Black with world-themed particle effects (e.g. falling leaves for Meadow, floating ice crystals for Ice Cavern).
- **Centre**:
  - **"WORLD 2 COMPLETE!"** — Press Start 2P, 20px, world theme colour. CRT flicker-in.
  - World banner art (same as world map, but larger).
  - **World stats**: Total stars, best level, total score — Inter 500, 14px.
  - **"+1 LIFE"** badge with heart animation.
  - **"WORLD 3 UNLOCKED"** — Electric Blue, Press Start 2P 14px, with a pixel lock opening animation.
- **Buttons** (after animations):
  - "CONTINUE TO WORLD 3" — Neon Green bg.
  - "MAIN MENU" — Dark bg.

### 5.12 Settings Screen
**Purpose**: Configure controls, audio, and preferences.

- **Background**: Void Black.
- **Top bar**: Back arrow (←), "SETTINGS" in Press Start 2P 14px.
- **Sections** (scrollable, grouped with section headers in Press Start 2P 11px, Neon Green):

  **CONTROLS**
  - "Control Scheme" — Segmented toggle: Swipe | Tap | D-pad. All three visible, currently selected one is highlighted Neon Green. Description text below explains the selected scheme.
  - "Swipe Sensitivity" — Slider (Low / Medium / High). Default: Medium.

  **AUDIO**
  - "Music" — Toggle switch (on/off) + volume slider.
  - "Sound Effects" — Toggle switch + volume slider.
  - "Vibration" — Toggle switch (haptic feedback on death, eating).

  **DISPLAY**
  - "Show Grid Lines" — Toggle (default off).
  - "Screen Shake" — Toggle (default on). Subtle shake on death and wall break.

  **DATA**
  - "Reset All Progress" — Retro Red text button. Confirmation modal before executing.

- **Toggle style**: Pill-shaped toggle, Neon Green when on, Stone Grey when off. Smooth slide animation (150ms).

### 5.13 Stats / Achievements Screen
**Purpose**: Show overall progress and achievement milestones.

- **Background**: Void Black.
- **Top bar**: Back arrow, "STATS" in Press Start 2P 14px.
- **Stats grid** (2 columns):
  - Total levels completed
  - Total stars earned (out of max)
  - Total apples eaten
  - Total deaths
  - Total play time
  - Longest snake achieved
  - Levels 3-starred
  - Current world
- **Style**: Each stat in a Dark Navy card, number in Press Start 2P (Neon Green, 20px), label in Inter 500 (Stone Grey, 12px).

---

## 6. Animations Catalogue

### Game Board Animations

| Animation | Duration | Description |
|---|---|---|
| **Snake move** | Per tick (~150-300ms depending on speed) | Smooth interpolation between tiles. Body follows head path. |
| **Snake turn** | Same as tick | Corner segment rounds smoothly, no 90-degree snap. |
| **Eat food** | 150ms | Head scales to 120%, chomps, returns. Green pulse ripples to tail. |
| **Snake death** | 800ms | 3x red/white flash (300ms), then pixel particle scatter from collision point. |
| **Segment lost** (breakable wall / poison) | 400ms | Tail segment pops off with small green particle burst. Snake flashes yellow once. |
| **Portal enter/exit** | 200ms | Head shrinks into portal tile (100ms), appears at exit tile expanding back (100ms). Swirl particle effect on both portals. |
| **Key collect** | 300ms | Key floats up to HUD inventory position. Matching gates shimmer and dissolve tile by tile (100ms per tile). |
| **Breakable wall break** | 300ms | Crack spreads from impact point, wall crumbles into pixel rubble that falls and fades. |
| **Moving obstacle** | Continuous | Smooth glide between patrol points. Subtle red glow pulses. |
| **Timed food countdown** | 5-10s | Ring depletes clockwise. At 2s remaining, food and ring flash red. At 0, food shrinks to nothing with a poof. |
| **Ice slide** | Continuous while on ice | Blue shimmer on snake, ice particle trail, slight motion blur. |
| **Speed boost** | 3s duration | Neon green afterimage trail (4-5 tiles). Faint motion lines. |
| **Slow effect** | 3s duration | Blue tint overlay on snake. Pixel "zzz" particles rise. |
| **Exit door activate** | 500ms | Door shifts from dim grey to bright green. Glow expands. Particle sparkles. |
| **Warp edge cross** | 150ms | Snake head exits edge with a brief stretch/compress effect, appears on opposite side. Subtle purple flash on both edges. |

### UI Animations

| Animation | Duration | Description |
|---|---|---|
| **Screen transitions** | 200-300ms | Fade-to-black between screens. Cards slide up/down. |
| **Button press** | 150ms | Scale to 95% on press, back to 100% on release. |
| **Star fill** | 300ms each | Stars fill with gold colour, burst of gold particles, slight bounce (overshoot and settle). |
| **Heart loss** | 400ms | Heart icon cracks (2 frames), then pixel shards scatter and fade. |
| **Heart gain** | 400ms | Heart materialises from gold particles, settling into HUD position. |
| **Game Over text** | 400ms | CRT horizontal-line expand effect — thin line at centre expands to reveal full text. |
| **Number counters** | 300ms | Score/counter numbers roll up (slot machine style) to their target value. |
| **Level node unlock** | 500ms | Lock icon shatters, node colour fills in from centre outward, subtle pulse. |
| **3-2-1 countdown** | 1.8s total | Each number scales in from 200% to 100% and fades (600ms each). Neon Green. |
| **Confetti (level complete)** | 2s | Pixel-style confetti rectangles in palette colours, falling with slight sway. |
| **Toast notifications** | 300ms in / 200ms out | Slide down from top, auto-dismiss after 2s. Used for "+1 LIFE", "NEW BEST!". |

### Ambient / Idle Animations

| Animation | Loop | Description |
|---|---|---|
| **Starfield** (menus) | Infinite | Tiny white pixel dots scrolling slowly upward. Parallax layers (2 speeds). |
| **Snake mascot idle** | Infinite | Tongue flicker every 3s (2 frames). Gentle body sway (4s loop). Blink every 5s. |
| **Menu button glow** | Infinite | Primary "PLAY" button border pulses Neon Green glow (3s cycle, sine wave opacity). |
| **Level node pulse** | Infinite | Current (next-to-play) level node has a glow ring that expands and fades (2s cycle). |
| **Heart warning pulse** | Infinite | When at 1 life, the heart gently throbs (scale 100-110%, 1s cycle). |
| **CRT scan lines** (optional) | Infinite | Faint horizontal lines scroll slowly over the game board. Very subtle (5% opacity). Togglable in settings. |

---

## 7. Level Element Visuals

All elements are 16x16 pixel sprites at base resolution, scaled to the grid tile size.

| Element | Primary Colour | Key Visual Feature | Idle Animation |
|---|---|---|---|
| Wall | Stone Grey `#555568` | Brick texture (2x3 brick pattern) | None (static) |
| Food (Apple) | Retro Red `#ff3333` | Round apple shape, green leaf (2px) | Subtle bob up/down (2px, 1.5s loop) |
| Golden Apple | Pixel Gold `#ffc800` | Same as apple but gold, sparkle highlight | Bob + sparkle twinkle (2-frame, every 2s) |
| Exit Door | Neon Green `#00ff41` (active) / Grey (inactive) | Archway shape, glowing threshold | Inactive: none. Active: glow pulses, particles rise from threshold |
| Portal | Pair-specific colour (blue `#4488ff`, orange `#ff8844`, etc.) | Circular swirl pattern | Continuous rotation (4 frames, 800ms loop) |
| Key | Pair colour (red, blue, yellow) | Classic key silhouette (teeth + bow) | Gentle bob + rotate (slower than portals) |
| Gate | Pair colour, darker shade | Solid block with keyhole icon centred | Subtle shimmer on surface |
| Breakable Wall | Light grey `#888899` | Same brick as wall but with 3-4 visible crack lines | None (static) |
| One-Way Gate | Green (passable side) / Red (blocked) | Large arrow pointing in allowed direction | Arrow subtly pulses brighter (2s cycle) |
| Ice Patch | Ice Cyan `#7fdbda` | Flat tile with diagonal shine lines | Shine lines slowly shift position (4s loop) |
| Speed Pad | Orange `#ff8800` | Chevron arrows (>>) pointing in boost direction | Chevrons pulse forward (shift 2px, 500ms loop) |
| Slow Pad | Electric Blue `#00d4ff` | Reverse chevrons (<<) | Chevrons pulse slowly (shift 2px, 1s loop) |
| Poison Apple | Purple `#9933ff` | Apple shape with small skull overlay or drip | Drip animation (2-frame, every 3s). Faint purple particle. |
| Moving Obstacle | Dark stone `#333344` + red glow | Stone block with pixel "eye" (red dot) | Eye scans left/right (2s). Faint red pulse. |
| Timed Food | Retro Red (same as apple) + countdown ring | Apple with circular ring border | Ring depletes clockwise. Flashes red at < 2s. |
| Warp Edge | Cosmic Violet `#9d4edd` | Edge tiles glow purple, small arrow indicators | Glow waves travel along edge (continuous). |
| Heart Pickup | Retro Red `#ff3333` | Pixel heart shape (classic 2-bump top, pointed bottom) | Gentle bob + faint red glow pulse (2s loop) |

---

## 8. Audio Design (Brief)

### Music
- **Menu**: Chill lo-fi 8-bit loop (30-60s). Mellow, inviting.
- **Gameplay (per world)**: Each world has a unique chiptune track. Tempo matches the difficulty mood — World 1 is upbeat and simple, World 4 is tense, World 5 is epic/cosmic.
- **Game Over**: No music. Silence after the jingle.
- **Level Complete**: Short celebration jingle (1-2s), then the menu music resumes.

### Sound Effects
All sounds are 8-bit style (chip-tune synth):
- **Eat food**: Quick ascending "bip" (50ms)
- **Eat golden apple**: Richer ascending chord (150ms)
- **Death**: Descending "wah-wah" (300ms)
- **Key collect**: Metallic "ding" + gate dissolve "shhhh" (200ms)
- **Portal enter**: Whoosh/zap (100ms)
- **Breakable wall break**: Crumble/crunch (200ms)
- **Poison eat**: Low descending buzz (200ms)
- **Timer warning** (timed food < 2s): Rapid ticking beeps
- **Level complete**: Ascending fanfare arpeggio (500ms)
- **Star awarded**: Bright ping (per star, 100ms each)
- **Life gained**: Warm ascending chord (300ms)
- **Life lost**: Heart crack sound — glass break (200ms)
- **Game Over jingle**: Descending arpeggio, final low note (1.5s)
- **Button tap**: Soft click (50ms)
- **3-2-1 countdown**: Deep beep per number, higher beep on "GO" (if added)
- **UI navigation**: Very subtle soft click (30ms)

### Haptics (mobile)
- **Eat food**: Light tap
- **Death**: Strong double-tap
- **Breakable wall**: Medium tap
- **Poison**: Medium buzz
- **Level complete**: Success pattern (tap-tap-tap ascending)

---

## 9. Responsive Layout

### Portrait Mode (Primary)
The game is designed for **portrait orientation** on mobile phones. All screens assume portrait. The game board is positioned at the top of the screen, HUD overlays the top edge, and the lower area is reserved for touch input space (invisible — swipe/tap zone).

### Landscape Mode
Not blocked, but a gentle prompt suggests portrait: "Rotate for the best experience" overlay with a rotating phone icon. If the player continues in landscape, the board reflows to fit (wider, shorter) and the HUD repositions to the sides.

### Tablet / Large Screens
Board scales up (larger tiles) but caps at a maximum tile size to avoid the pixel art looking too chunky. HUD elements remain at fixed sizes. Extra space is filled with the dark background + starfield.

### Safe Areas
All interactive elements respect safe areas (notch, home indicator). HUD is inset from the top. Touch targets avoid the very bottom edge (home gesture zone).

---

## 10. Accessibility

- **Colour**: All element distinctions use both colour AND shape. Keys have unique shapes per colour, not just colour alone. Poison apples have a skull, not just purple.
- **Text size**: All critical information (score, lives, goal) meets minimum 12px at device scale.
- **Touch targets**: All buttons minimum 44x44px. In-game elements are 16x16 pixels * scale (typically 48-64px on device).
- **Motion**: "Reduce motion" option in settings disables CRT lines, screen shake, and reduces particle effects. Core animations (snake movement) remain.
- **Contrast**: Neon Green on Void Black exceeds WCAG AA contrast ratio. All text meets minimum readability standards.
