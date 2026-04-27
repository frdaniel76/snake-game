# Snake Game — Level Design Document

## 1. Level Design Principles

### What Makes a Good Level

**Safe Spawn Rule**
The player must never die within the first 2-3 seconds of a level. The spawn area is always a clear open space with no obstacles, moving enemies, or tight corridors within at least 4 tiles in every direction from the snake's starting position. The snake always starts facing a safe direction (toward open space, never toward a wall).

**Every Element Earns Its Place**
If a mechanic appears on the board, it must be necessary to complete the level. No decorative walls, no portals that go nowhere, no keys without gates. If a player sees it, they should use it. This trains the player to pay attention to the board and builds trust that the design is intentional.

**Solvable by a Human**
Every level must have at least one clear solution path. No pixel-perfect timing windows (timing windows are generous — at least 2 seconds of margin). No luck-based outcomes. No solutions that require superhuman reaction speed. If a level has multiple solutions, that's a bonus, not a requirement.

**Teach Before Testing**
Every new mechanic is introduced in a dedicated tutorial level. This level is simple — one new element in an otherwise easy environment. The player learns what it does by interacting with it in a low-stakes setting. Only after this introduction does the mechanic appear in combination with others.

**Visual Clarity**
Every element must be immediately understandable from its pixel art appearance. A key looks like a key. A portal looks like a swirling vortex. A breakable wall has visible cracks. The player should never need a text explanation — the visuals teach. Colour coding is used consistently (e.g. red key always opens red gate).

**Difficulty Curve**
Difficulty follows a sawtooth pattern: gradual ramp up, then a breather level, then ramp again. The pattern is: **teach → apply → combine → challenge → breathe → repeat**. Hard levels are never placed back-to-back. After a particularly challenging level, the next one should feel like a reward — simple, satisfying, confidence-building.

**Goal Clarity**
Each level clearly communicates its objective at the start. A brief overlay shows: "Eat all apples" or "Reach the exit" or "Collect the key, then reach the exit." The goal type is also reinforced visually — exit doors glow when available, remaining apple count is shown on-screen.

---

## 2. Board & Camera System

### Grid Sizes

| Board Type | Dimensions | Use Case |
|---|---|---|
| **Standard** | 15 x 20 cells | Fits a mobile phone screen in portrait. Used for most early levels. |
| **Wide** | 20 x 20 cells | Square arena. Good for open exploration levels. |
| **Large** | 25 x 30 cells | Requires camera follow. Multi-room layouts. |
| **Extra Large** | 30 x 40+ cells | Connected rooms, corridors. Full camera scrolling. |

### Camera Behaviour
- **Standard boards** (15x20): static, full board visible, no scrolling.
- **Large boards**: camera smoothly follows the snake's head, keeping it roughly centred. The camera leads slightly in the direction of movement so the player can see what's ahead. Edge clamping prevents showing area outside the board.

### Layout Archetypes

- **Open Arena** — Mostly empty space with scattered walls. Tests navigation and length management. Used early.
- **Tight Maze** — Dense wall corridors with few open areas. Tests precise movement. Used mid-game.
- **Multi-Room** — Several distinct rooms connected by 1-cell-wide passages. Tests planning — entering a room with a long snake can trap you. Used from World 2 onwards.
- **Spiral** — Board wraps inward in a spiral path. One-way journey inward. Tests commitment and length awareness.
- **L-Shape / T-Shape** — Non-rectangular play area (walls block off corners to create shapes). Adds visual variety.
- **Connected Fields** — Two or more large open areas linked by narrow corridors or portals. Used in later worlds.

### Walls
Outer boundary walls are always present (solid border around the board) except in levels that use Warp Edges (element #15), where edges wrap around instead.

---

## 3. Level Elements — 15 Mechanics

### Element 1: Wall
- **Visual**: Dark grey stone block, 1x1 tile, subtle brick texture
- **Behaviour**: Static. Impassable. Permanent.
- **Snake Interaction**: Snake dies on head collision. Body cannot overlap.
- **Design Notes**: The foundational obstacle. Used to create corridors, rooms, mazes, and barriers. Always present as the board boundary.
- **Introduced**: Level 1 (boundary walls), Level 2 (interior walls)

### Element 2: Food (Apple)
- **Visual**: Bright red pixel apple with a small green leaf, 1x1 tile
- **Behaviour**: Static. Disappears when eaten. New apple may spawn (in collect-all levels, all apples are pre-placed).
- **Snake Interaction**: Head touches apple → apple consumed, snake grows +1 segment, score +10
- **Design Notes**: The core mechanic. Every level has at least one. In "eat all food" levels, the count of remaining apples is shown on-screen.
- **Introduced**: Level 1

### Element 3: Golden Apple
- **Visual**: Gold/yellow shimmering apple, slightly larger pixel sprite than regular apple, sparkle animation
- **Behaviour**: Static. Disappears when eaten. Rare — typically 1 per level.
- **Snake Interaction**: Head touches → consumed, snake grows +3 segments, score +50
- **Design Notes**: Risk/reward element. Growing +3 makes navigation harder, but the score bonus is significant. Often placed in hard-to-reach spots. Counts toward "eat all food" goals.
- **Introduced**: Level 5

### Element 4: Exit Door
- **Visual**: Green pixel door frame (2 tiles tall or 1x1 archway). Starts dim/locked. Glows bright green when activated.
- **Behaviour**: Inactive until level requirements are met (all food eaten, key collected, etc.). Once active, it glows and the player can enter it.
- **Snake Interaction**: Head enters active exit → level complete. Head hits inactive exit → treated as wall (blocked).
- **Design Notes**: Used in "reach the exit" levels. Position creates the final navigation challenge — player must plan their path so they can reach the door without being trapped by their own body.
- **Introduced**: Level 3

### Element 5: Portal Pair
- **Visual**: Two matching coloured swirl tiles (e.g. both blue, both orange). Animated rotating pixel spiral. Each pair has a unique colour.
- **Behaviour**: Always comes in pairs. Bidirectional — enter either one to exit the other.
- **Snake Interaction**: Head enters portal A → head instantly appears at portal B, continuing in the same direction. The snake's body follows through the portal over subsequent ticks (it doesn't teleport the whole snake at once).
- **Design Notes**: Creates spatial shortcuts and puzzles. The body-follows-through mechanic means long snakes create a "tether" between portals. Multiple portal pairs (different colours) can exist in one level.
- **Introduced**: Level 7

### Element 6: Key & Gate
- **Visual**: Key = small pixel key shape in a specific colour (red, blue, yellow). Gate = solid coloured block matching the key, with a keyhole icon.
- **Behaviour**: Key is a collectible item (like food but doesn't grow the snake). Collecting a key instantly dissolves all gates of that colour. Multiple key/gate colours can coexist.
- **Snake Interaction**: Head touches key → key collected (no growth), matching gates disappear. Head hits gate → blocked (treated as wall) until matching key is collected.
- **Design Notes**: Creates sequencing puzzles — must collect keys in the right order. A red key might be behind a blue gate, requiring blue key first. Max 3 colours per level to keep it readable.
- **Introduced**: Level 9

### Element 7: Breakable Wall
- **Visual**: Stone block with visible cracks/fractures. Lighter colour than regular walls. Subtle "damaged" look.
- **Behaviour**: Static until hit. Destroyed on snake head collision.
- **Snake Interaction**: Head hits breakable wall → wall is destroyed (tile becomes empty), BUT snake loses 1 segment from its tail. If snake length is 1 (just the head), hitting a breakable wall = game over.
- **Design Notes**: Risk/cost mechanic. Sometimes breaking through is the only path, sometimes it's a shortcut. Player must manage their length — eating more food gives "health" for breaking walls. Creates tension between growing (harder to navigate) and staying small (can't break walls).
- **Introduced**: Level 11

### Element 8: One-Way Gate
- **Visual**: Tile with a large pixel arrow pointing in one direction. Arrow colour is green (passable side) to red (blocked sides). Slightly transparent look.
- **Behaviour**: Static. Passable only from the direction the arrow points FROM (i.e. you move in the arrow's direction to pass through). Solid wall from all other directions.
- **Snake Interaction**: Head approaches from the allowed direction → passes through normally. Head approaches from any other direction → blocked (treated as wall, snake dies).
- **Design Notes**: Creates one-way paths and forces commitment. Once you pass through, you can't go back. Used to create routing puzzles where the player must plan their path through a series of one-way gates. The arrow clearly shows the allowed direction.
- **Introduced**: Level 13

### Element 9: Ice Patch
- **Visual**: Light blue/cyan tiles with a shine/gloss effect. Cluster of tiles forming an icy area (never just 1 tile).
- **Behaviour**: Static floor tile. Affects snake movement when the head is on it.
- **Snake Interaction**: When the snake's head is on ice, directional input is ignored — the snake continues sliding in its current direction until the head reaches a non-ice tile or hits a wall (and dies). The snake cannot turn while on ice.
- **Design Notes**: Creates commitment zones — must enter ice patches at the right angle. Combined with walls, creates "billiard" puzzles where the snake slides and bounces. Always provide at least one safe slide path (no unavoidable death).
- **Introduced**: Level 15

### Element 10: Speed Pad
- **Visual**: Orange tile with forward-pointing chevron arrows (>>). Subtle pulse animation.
- **Behaviour**: Static floor tile. Temporary speed effect.
- **Snake Interaction**: Head crosses speed pad → snake speed increases by ~50% for 3 seconds. Effect doesn't stack. Timer resets if another speed pad is crossed.
- **Design Notes**: Raises intensity momentarily. Can be placed to make a section feel thrilling or to create timing puzzles (need to be fast to reach timed food). Often paired with long straight corridors.
- **Introduced**: Level 17

### Element 11: Slow Pad
- **Visual**: Blue tile with backward-pointing chevron arrows (<<). Calming pulse animation.
- **Behaviour**: Static floor tile. Temporary slow effect.
- **Snake Interaction**: Head crosses slow pad → snake speed decreases by ~40% for 3 seconds. Effect doesn't stack.
- **Design Notes**: Gives the player breathing room in complex sections. Can be placed before tricky turns or maze sections as a mercy mechanic. Also used strategically — sometimes you NEED to be slow to time a moving obstacle gap.
- **Introduced**: Level 18

### Element 12: Poison Apple
- **Visual**: Purple/dark sickly apple with a small skull or drip detail. Clearly different from regular red apples.
- **Behaviour**: Static. Disappears when eaten. Cannot be destroyed otherwise.
- **Snake Interaction**: Head touches poison apple → snake shrinks by 2 segments from the tail. If snake length would go below 1 → game over. Does NOT count toward "eat all food" goals — player must avoid these.
- **Design Notes**: Negative item that punishes carelessness. Always visually distinct from food. Used sparingly — max 2-3 per level. Never placed directly in the only path (player must always have an avoidance option). Combined with tight corridors, adds tension.
- **Introduced**: Level 20

### Element 13: Moving Obstacle
- **Visual**: Animated dark stone block with a subtle red glow or pixel "eye". Moves along a visible dotted-line path.
- **Behaviour**: Patrols a fixed path of 2-6 tiles, moving back and forth at a constant speed. Path is always visible (dotted line on the ground) so the player can predict movement.
- **Snake Interaction**: Snake head or body collides with moving obstacle → game over. The obstacle moves independently of the snake — it's always in motion.
- **Design Notes**: First true "enemy" element. Timing-based — player must observe the patrol pattern and move through gaps. Patrol paths are always shown visually. Speed is moderate — always gives a fair window (at least 2 seconds) to pass. Max 3 per level initially.
- **Introduced**: Level 22

### Element 14: Timed Food
- **Visual**: Regular apple but flashing/blinking with a circular countdown ring around it. Ring depletes clockwise. When nearly expired, flashes red rapidly.
- **Behaviour**: Appears with a timer (5-10 seconds depending on difficulty). If not eaten before the timer expires, it disappears permanently. If it was required to complete the level, the level becomes impossible and auto-resets (with a "Time's up! Try again" message).
- **Snake Interaction**: Same as regular food when eaten — +1 segment, score +10. The pressure is getting there in time.
- **Design Notes**: Adds urgency to specific moments. Forces the player to commit to a direction quickly. Timer is always generous enough that a reasonable path exists. Never combined with ice patches in the same required path (sliding + timing = unfair). Multiple timed foods never have overlapping timers.
- **Introduced**: Level 25

### Element 15: Warp Edges
- **Visual**: Board edges glow with a subtle purple/cosmic shimmer instead of normal walls. Small arrow indicators show the wrap direction.
- **Behaviour**: Replaces the normal boundary walls on some or all edges. The snake exits one side and immediately appears on the opposite side at the corresponding position, maintaining direction.
- **Snake Interaction**: Head exits the right edge → appears on the left edge (same row). Same for top/bottom. The body follows through naturally — no teleportation, it streams through.
- **Design Notes**: Opens up the entire board for creative navigation. Changes how the player thinks about space — dead ends don't exist in the same way. Can be on all 4 edges or selectively (e.g. only left/right wrap, top/bottom are walls). Combines powerfully with portals for spatial puzzles.
- **Introduced**: Level 28

---

## 4. Level Progression

### Difficulty Rating Scale
- ★☆☆☆☆ (1) — Tutorial / breather. Impossible to fail if paying attention.
- ★★☆☆☆ (2) — Easy. One or two things to think about.
- ★★★☆☆ (3) — Medium. Requires planning. Most players need 1-2 attempts.
- ★★★★☆ (4) — Hard. Requires careful planning and execution. Multiple attempts expected.
- ★★★★★ (5) — Expert. Combines multiple mechanics. Demands mastery.

---

### World 1: Green Meadow (Levels 1-7)
*Theme: Bright green grass, wooden fences, sunny countryside. Teaches core snake mechanics.*

**Level 1 — "First Steps"**
- Board: 15x20 (standard)
- Elements: Walls (boundary only), 3 Apples
- Goal: Eat all apples
- Difficulty: ★☆☆☆☆
- Layout: Wide open field. 3 apples placed in a generous line. Snake starts in the centre facing right. Nothing can go wrong — pure tutorial. Teaches movement and eating.

**Level 2 — "Garden Walls"**
- Board: 15x20
- Elements: Walls (boundary + interior), 5 Apples
- Goal: Eat all apples
- Difficulty: ★☆☆☆☆
- Layout: A few short interior walls creating wide corridors. Apples placed in different corridors. Teaches that walls kill and that the player must navigate around them.

**Level 3 — "Find the Door"**
- Board: 15x20
- Elements: Walls, 3 Apples, 1 Exit Door
- Goal: Eat all apples, then reach the exit
- Difficulty: ★☆☆☆☆
- Layout: Open arena with exit door on the far side. Apples between spawn and exit. Teaches the exit door mechanic — door is dim until all apples are eaten, then glows green.

**Level 4 — "Growing Pains"**
- Board: 15x20
- Elements: Walls (more interior), 8 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: U-shaped corridor with apples along the path. By the time the player eats all apples, their snake is long enough that navigation becomes a consideration. First level where the player might trap themselves if careless.

**Level 5 — "Golden Prize"**
- Board: 15x20
- Elements: Walls, 4 Apples, 1 Golden Apple, 1 Exit Door
- Goal: Eat all apples (including golden), reach exit
- Difficulty: ★★☆☆☆
- Layout: Open field with the golden apple tucked in a small alcove surrounded by walls. Teaches golden apple (+3 growth) and the trade-off of becoming longer. Exit is easy to reach.

**Level 6 — "The Maze Begins"**
- Board: 15x20
- Elements: Walls (simple maze), 6 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Simple maze with wide corridors (3 tiles wide). Apples at dead ends. Teaches planning ahead — don't enter a dead end headfirst if you're too long to turn around.

**Level 7 — "No Rush"**
- Board: 15x20
- Elements: Walls (light), 10 Apples, 1 Exit Door
- Goal: Eat all apples, reach exit
- Difficulty: ★★★☆☆
- Layout: Larger open space with island walls. 10 apples make the snake quite long by the end. Exit is in a corner — player must plan their final approach carefully. First real "thinking" level. Breather before World 2.

---

### World 2: Ancient Temple (Levels 8-14)
*Theme: Sand-coloured stone, torches, hieroglyphic walls. Introduces portals, keys, and breakable walls.*

**Level 8 — "Portal 101"**
- Board: 15x20
- Elements: Walls, 3 Apples, 1 Portal Pair (blue)
- Goal: Eat all apples
- Difficulty: ★☆☆☆☆
- Layout: Wall divides the board in half. One portal on each side. Apples on both sides. The only way across is through the portal. Pure tutorial — teaches portal entry/exit.

**Level 9 — "Lock and Key"**
- Board: 15x20
- Elements: Walls, 1 Red Key, 1 Red Gate, 3 Apples, 1 Exit Door
- Goal: Collect key, eat apples, reach exit
- Difficulty: ★★☆☆☆
- Layout: Key is in an open area. Gate blocks the path to the exit. Simple sequence: get key → gate opens → eat apples → exit. Teaches key/gate mechanic.

**Level 10 — "Portal Run"**
- Board: 15x20
- Elements: Walls (corridors), 2 Portal Pairs (blue + orange), 6 Apples
- Goal: Eat all apples
- Difficulty: ★★★☆☆
- Layout: Three rooms connected only by portals. Apples spread across all rooms. Player must portal between rooms, managing their growing length through the teleportation.

**Level 11 — "Crack the Wall"**
- Board: 15x20
- Elements: Walls, Breakable Walls (3), 5 Apples, 1 Exit Door
- Goal: Eat apples, break through to exit
- Difficulty: ★★☆☆☆
- Layout: Direct path to exit is blocked by breakable walls. Apples are placed before the breakable section, so the player grows long enough to afford breaking through (losing segments). Teaches breakable wall cost/benefit.

**Level 12 — "Temple Chambers"**
- Board: 20x25 (first camera-follow level)
- Elements: Walls, 1 Portal Pair, 1 Blue Key, 1 Blue Gate, 8 Apples
- Goal: Eat all apples, reach exit
- Difficulty: ★★★☆☆
- Layout: Multi-room temple. Key in one room, gate blocking another. Portal connects distant rooms. First level larger than the screen — introduces camera follow. Generous room sizes.

**Level 13 — "One Way Only"**
- Board: 15x20
- Elements: Walls, One-Way Gates (4), 5 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Open arena with one-way gates creating a clockwise flow pattern. Apples placed along the one-way route. Teaches one-way gates in a forgiving layout where the natural path works.

**Level 14 — "Temple Gauntlet"**
- Board: 20x25
- Elements: Walls, Breakable Walls (2), 1 Portal Pair, 1 Red Key, 1 Red Gate, One-Way Gates (2), 8 Apples, 1 Golden Apple, 1 Exit Door
- Goal: Eat all food, reach exit
- Difficulty: ★★★★☆
- Layout: Multi-room temple combining all World 2 mechanics. Red key behind a one-way gate (must commit to that path). Breakable walls offer a shortcut. Golden apple in a risky alcove. This is the World 2 "boss" level.

---

### World 3: Ice Cavern (Levels 15-21)
*Theme: Blue/cyan ice walls, crystalline tiles, frozen underground. Introduces movement modifiers.*

**Level 15 — "Slippery Slope"**
- Board: 15x20
- Elements: Walls, Ice Patches (one large patch), 3 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Open room with a large ice patch in the centre. Apples on the far side of the ice. Player must enter the ice at the right angle to slide toward the apples. Safe walls to catch the slide. Pure ice tutorial.

**Level 16 — "Ice Corridors"**
- Board: 15x20
- Elements: Walls, Ice Patches (multiple), One-Way Gates (2), 6 Apples
- Goal: Eat all apples
- Difficulty: ★★★☆☆
- Layout: Corridors alternating between normal floor and ice patches. One-way gates force a specific route. Player must plan which direction to be facing before hitting each ice section.

**Level 17 — "Speed Boost"**
- Board: 15x20
- Elements: Walls, Speed Pads (3), 5 Apples, 1 Exit Door
- Goal: Eat apples, reach exit
- Difficulty: ★★☆☆☆
- Layout: Long straight corridors with speed pads. Apples at the end of speed corridors. Teaches the speed boost — exciting but manageable. Exit at the end of a fun speed run.

**Level 18 — "Take It Slow"**
- Board: 15x20
- Elements: Walls (tight maze), Slow Pads (3), 6 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Tight maze with slow pads before the tricky turns. Teaches that slow pads are helpful — a mercy mechanic. Apples in tight spots that would be hard at normal speed but easy when slowed.

**Level 19 — "Ice and Fire"**
- Board: 20x20
- Elements: Walls, Ice Patches, Speed Pads, Slow Pads, 8 Apples
- Goal: Eat all apples
- Difficulty: ★★★☆☆
- Layout: Arena split into zones: icy zone, speed zone, slow zone. Apples in each zone. Combines all movement modifiers. Transitions between zones are the challenge.

**Level 20 — "Frozen Temple"**
- Board: 20x25
- Elements: Walls, Ice Patches, 1 Portal Pair, 1 Blue Key, 1 Blue Gate, Breakable Walls (2), 7 Apples, 1 Exit Door
- Goal: Collect key, eat apples, reach exit
- Difficulty: ★★★★☆
- Layout: Combines World 2 and World 3 mechanics. Ice patches guard the key. Portal needed to reach the exit. Breakable walls offer an alternative route but cost segments.

**Level 21 — "Crystal Breather"**
- Board: 15x20
- Elements: Walls (open), Slow Pads (2), 4 Apples, 1 Golden Apple
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Relaxed open level with gentle obstacles. Slow pads before corners. Golden apple in a slightly tricky spot. Meant to be a breather and confidence builder after the intensity of levels 19-20.

---

### World 4: Shadow Forest (Levels 22-28)
*Theme: Dark green/purple, twisted trees, glowing mushrooms, fog effects. Introduces danger elements.*

**Level 22 — "The Patrol"**
- Board: 15x20
- Elements: Walls, Moving Obstacles (1), 4 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Open arena with one moving obstacle patrolling a horizontal path across the middle. Apples on both sides. Player must time their crossing. Dotted patrol path is clearly visible. Pure moving obstacle tutorial.

**Level 23 — "Shadow Maze"**
- Board: 15x20
- Elements: Walls (maze), Moving Obstacles (2), 6 Apples, 1 Exit Door
- Goal: Eat apples, reach exit
- Difficulty: ★★★☆☆
- Layout: Simple maze with two moving obstacles patrolling key corridors. Player must time movement through watched corridors. Generous timing windows.

**Level 24 — "Forest Gauntlet"**
- Board: 20x20
- Elements: Walls, Moving Obstacles (2), One-Way Gates (3), Speed Pads (2), 7 Apples
- Goal: Eat all apples
- Difficulty: ★★★★☆
- Layout: One-way route through a forest path with moving obstacles. Speed pads add excitement. Must plan the full route because one-way gates prevent backtracking.

**Level 25 — "Race the Clock"**
- Board: 15x20
- Elements: Walls, Timed Food (3), 2 regular Apples
- Goal: Eat all food (including timed)
- Difficulty: ★★☆☆☆
- Layout: Open arena. Timed apples appear one at a time (the next appears only after the previous is eaten or expires). Each has a generous 8-second timer. Teaches timed food in a low-pressure environment. Regular apples are easy pickups.

**Level 26 — "Ticking Forest"**
- Board: 20x25
- Elements: Walls, Moving Obstacles (2), Timed Food (3), 5 Apples, Slow Pads (2)
- Goal: Eat all food
- Difficulty: ★★★★☆
- Layout: Forest path with moving obstacles. Timed food placed behind obstacle patrol routes — must time entry correctly and grab the food before it vanishes. Slow pads are placed helpfully before tricky sections.

**Level 27 — "Poison Garden"**
- Board: 15x20
- Elements: Walls, Poison Apples (2), 6 Apples, 1 Golden Apple, 1 Exit Door
- Goal: Eat all (non-poison) food, reach exit
- Difficulty: ★★★☆☆
- Layout: Garden-like open space. Poison apples placed near regular apples — player must navigate carefully to eat the good food while avoiding the poison. Golden apple is near a poison apple, creating a risk decision.

**Level 28 — "Shadow Realm"**
- Board: 25x30
- Elements: Walls, Moving Obstacles (3), Poison Apples (2), 1 Portal Pair, 1 Red Key, 1 Red Gate, Timed Food (2), 8 Apples, 1 Exit Door
- Goal: Collect key, eat all food, reach exit
- Difficulty: ★★★★★
- Layout: The World 4 "boss". Large multi-room forest. Moving obstacles patrol key corridors. Timed food creates urgency. Poison apples punish carelessness. Key is in a distant room accessible via portal. Gate blocks the exit. The ultimate test of everything learned so far.

---

### World 5: Void Realm (Levels 29-35)
*Theme: Dark cosmic space, purple/black, glowing edges, starfield background. Introduces warp edges and combines everything.*

**Level 29 — "Edge Walker"**
- Board: 15x20
- Elements: Warp Edges (all 4 sides), 4 Apples
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Open arena with warp edges instead of walls. Apples placed so the fastest path requires wrapping around edges. No interior walls. Pure warp tutorial — teaches the wrap mechanic.

**Level 30 — "Warp Maze"**
- Board: 15x20
- Elements: Warp Edges (left/right only, top/bottom are walls), Interior Walls, 6 Apples, 1 Exit Door
- Goal: Eat apples, reach exit
- Difficulty: ★★★☆☆
- Layout: Maze where the left/right edges wrap. Some paths require wrapping around to reach certain apples. Top/bottom are solid walls. Teaches selective warp edges.

**Level 31 — "Void Portals"**
- Board: 20x20
- Elements: Warp Edges, 2 Portal Pairs, Ice Patches, 7 Apples
- Goal: Eat all apples
- Difficulty: ★★★★☆
- Layout: Cosmic arena combining warp edges with portals and ice. Spatial reasoning challenge — wrapping edges + portals creates a mind-bending space. Ice patches add commitment. Multiple valid solution paths.

**Level 32 — "The Vault"**
- Board: 20x25
- Elements: Walls, Warp Edges (top/bottom), 2 Keys (Red, Blue), 2 Gates (Red, Blue), Breakable Walls (3), One-Way Gates (4), 6 Apples, 1 Exit Door
- Goal: Collect both keys, eat apples, reach exit
- Difficulty: ★★★★☆
- Layout: Vault-like structure with locked sections. Red key unlocks path to blue key. Breakable walls provide shortcuts at a cost. One-way gates force commitment. Warp edges on top/bottom add routing options.

**Level 33 — "Gauntlet of Elements"**
- Board: 25x30
- Elements: Walls, Ice Patches, Speed Pads, Slow Pads, Moving Obstacles (2), Poison Apples (2), 1 Portal Pair, 8 Apples, 1 Golden Apple, 1 Exit Door
- Goal: Eat all food, reach exit
- Difficulty: ★★★★★
- Layout: Long gauntlet-style level. Each section features a different mechanic: ice zone, speed zone, obstacle zone, poison zone. Portal connects the end back to a section you must revisit with a longer snake. Golden apple at the hardest point.

**Level 34 — "Cosmic Breather"**
- Board: 15x20
- Elements: Warp Edges, Slow Pads (3), 5 Apples, 1 Golden Apple
- Goal: Eat all apples
- Difficulty: ★★☆☆☆
- Layout: Relaxed cosmic arena. Warp edges, generous space, slow pads for comfort. A calm level before the final challenge. Reward level — easy golden apple.

**Level 35 — "The Final Feast"**
- Board: 30x40
- Elements: ALL mechanics — Walls, Warp Edges (selective), Ice Patches, Speed Pads, Slow Pads, 2 Portal Pairs, 2 Keys (Red, Yellow), 2 Gates, Breakable Walls (4), One-Way Gates (6), Moving Obstacles (3), Poison Apples (3), Timed Food (3), 12 Apples, 1 Golden Apple, 1 Exit Door
- Goal: Collect keys, eat all food, reach exit
- Difficulty: ★★★★★
- Layout: The ultimate level. Massive multi-room cosmic temple. Five distinct zones, each themed around a World's mechanics. Connected by portals and narrow corridors. Keys in distant zones. Moving obstacles patrol critical paths. Timed food creates urgency in the final stretch. The exit requires both keys and all food eaten. This is the victory lap that uses every single mechanic in the game.

---

## 5. Level Completion & Scoring

### Goal Types
Each level uses one of these goals, shown at level start:
- **"Eat all apples"** — All food items (regular, golden, timed) must be consumed.
- **"Reach the exit"** — Navigate to the exit door (which may require collecting keys or eating food to activate).
- **"Eat all apples and reach the exit"** — Combination of both. Most common in later levels.

### Star Rating (1-3 Stars)
Every level awards 1-3 stars based on performance:

| Stars | Criteria |
|---|---|
| ★ | Level completed (any performance) |
| ★★ | Completed within the target time AND lost no more than 2 segments |
| ★★★ | Completed within fast time AND lost 0 segments (perfect run) |

- **Target time**: Generous time based on an average player's completion. Shown as a subtle timer during gameplay.
- **Fast time**: Tighter time for skilled players. Not shown — a hidden challenge.
- **Segments lost**: Tracked when hitting breakable walls or poison apples.

### Progression & Unlocking
- Completing a level (1+ stars) unlocks the next level.
- World 2 unlocks after completing Level 7 (all of World 1).
- Each subsequent world unlocks after completing the previous world's final level.
- 3-starring a level awards a bonus XP/coin reward (cosmetics — future feature).
- Players can replay any completed level to improve their star rating.

### Lives System
- Player starts with **3 lives** (max 5). Lives persist across levels within a session.
- **Losing a life**: Snake dies (wall collision, obstacle hit, poison death, self-collision). Current level restarts. One heart removed from HUD.
- **Gaining a life**: +1 life for completing a world. +1 life for 3-starring a level. +1 life from rare Heart Pickup items on select levels.
- **Game Over (0 lives)**: Player can continue from the start of the current world (lives reset to 3) or return to main menu.
- **Retry**: After losing a life, "Retry" and "Quit" options appear. Retrying restarts the current level immediately.
- Players can replay any completed level to improve their star rating (replays still cost lives on death).
