# Tank Defender 8

**English** | [简体中文](README.zh-CN.md)

NES-style tank defense game built as a static Canvas app.

This repository does not include original NES ROM data, original sprites, original audio, or original stage maps. Maps, sprites, and audio use free or custom replacement resources. The built-in enemy composition mirrors the publicly documented 35-stage Battle City enemy group table, and the engine remains data-driven so gameplay rules, enemy sequences, and stage packs can be tuned without changing the core code.

The project is currently in a dedicated architecture-refactor phase. New 1:1 gameplay work is frozen while the single-file runtime and smoke test are split into explicit browser modules, pure rule modules, shared test infrastructure, unit suites, and feature integration suites. The no-build static launch path remains a hard compatibility requirement throughout the migration.

## Run

Open `index.html` in a browser, or serve the folder locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/index.html`.

## Verify

```powershell
node --check src/core/battle-random.js
node --check src/core/frame-counter.js
node --check src/core/geometry.js
node --check src/stages/stage-grid.js
node --check src/game.js
node --check tools/build-free-stage-pack.js
node tests/run-tests.js
git diff --check
```

## Project Structure

```text
tank-defender-8/
|-- data/
|   |-- free-35-stage-pack.json
|   |-- free-audio-manifest.json
|   |-- free-sprite-manifest.json
|   |-- sample-quadrant-stage-pack.json
|   `-- sample-stage-pack.json
|-- src/
|   |-- core/
|   |   |-- battle-random.js
|   |   |-- frame-counter.js
|   |   `-- geometry.js
|   |-- stages/
|   |   `-- stage-grid.js
|   `-- game.js
|-- tests/
|   |-- helpers/
|   |   |-- browser-game-harness.js
|   |   `-- load-browser-scripts.js
|   |-- integration/
|   |   |-- collision.test.js
|   |   |-- frame-counter.test.js
|   |   `-- stage-grid.test.js
|   |-- unit/
|   |   |-- battle-random.test.js
|   |   |-- browser-entry.test.js
|   |   |-- frame-counter.test.js
|   |   |-- geometry.test.js
|   |   `-- stage-grid.test.js
|   `-- run-tests.js
|-- tools/
|   |-- build-free-stage-pack.js
|   |-- dev-server.js
|   `-- smoke-test.js
|-- index.html
|-- styles.css
|-- README.md
`-- README.zh-CN.md
```

`src/core/` contains pure browser-and-Node-compatible rules with no DOM or Canvas dependency; shared battle randomness, independent frame counters, and rectangle geometry now live there. `src/stages/` owns the stage domain, beginning with tile constants, brick-fragment state, grid mutation, validation, and 13x13/26x26 codecs in `stage-grid.js`. `src/game.js` remains the composition root and legacy runtime, and must shrink as behavior moves behind explicit module APIs. `tests/helpers/` owns reusable Canvas, audio, DOM, storage, input, and script-loading fakes. `tests/unit/` exercises pure modules directly, `tests/integration/` verifies extracted timing, collision, and stage-grid behavior through the real browser API, and `tests/run-tests.js` runs both before the remaining regression suite in `tools/smoke-test.js`.

The migration order is core timing/random/geometry, configuration and stage packs, gameplay entities and rules, input/editor, audio, rendering/screens, debug adapters, and finally the application bootstrap. Every extraction must keep the static no-build launch path, move its matching tests in the same commit, and pass the full regression suite before the next subsystem moves. New 1:1 gameplay work is paused until this refactor and test split are complete.

## Controls

- Title: arrow keys or `WASD` select `1 PLAYER`, `2 PLAYERS`, or `CONSTRUCTION`; `Enter`/`Space` activates the selected option. `1`, `2`, and `C`/`E` remain direct shortcuts. Leaving the untouched title idle for 640 frames starts the attract demo; `Enter`, `Space`, or `Escape` returns from the demo.
- Stage select: `Space`/`Z` acts as NES A and advances through stages 1-35; `F`/`X` acts as NES B and moves backward. A fresh press changes the stage on its first 60 Hz logic frame. Holding A or B repeats when the independent low frame counter reaches each eight-frame boundary, and every triggered input resets that low counter without changing the high counter. Selection remains clamped at stage 1 or 35 instead of wrapping. `Enter` starts the selected stage and `Escape` returns to the title.
- Player 1: arrow keys move, `Space` fires. In one-player mode, `WASD` also moves Player 1.
- Player 2: in two-player mode, `WASD` moves and `F` fires.
- Pause: during active battle, use `Enter` as the keyboard Start button, `P`, or toolbar `PAUSE`; stage intro and non-battle screens reject pause input. Entering pause starts a free single-pulse replacement phrase with six four-frame notes and a twelve-frame tail, for the original 36-display-frame lifetime. The phrase advances while battle time and other fixed-frame sounds remain frozen; an early resume lets its unfinished second-pulse cue keep channel priority, and entering pause again restarts it at frame zero. Pausing also clears queued fire presses and shows the unframed `PAUSE` lettering at the original coordinates for alternating 16-frame visible and hidden phases. If the final defeated enemy is detected while paused, the game leaves pause and starts the active stage-clear delay; that delay and the 39-frame base-destruction countdown reject further pause input. `Escape` is not a pause key.
- Game over: the in-field banner and following current-stage result count-up cannot be skipped. The separate full-screen `GAME OVER` interstitial follows that result; `Enter` acts as Start and `Escape` acts as Select, and either skips the remaining fanfare only on the full-screen segment.
- Reset: toolbar `RESET` returns to the title screen, restores the built-in original-style stage pack, and clears temporary gameplay/editor-test state.
- Construction: arrow keys or `WASD` move the tank cursor one 16x16 cell. `Space`/`Z` acts as NES A and advances through the original 14 block patterns; `F`/`X` acts as NES B and moves backward. The first A/B press after moving places the current pattern without changing it. `Enter` acts as Start, returns to the title, and installs the edited map as stage 1; clearing it continues to the normal stage 2. `TEST` or `E` starts an immediate one-stage test.
- Hidden message: enter and leave Construction seven times. On the title, hold Player 1 Down and press Player 2 A (`F`) eight times, then hold Player 1 Right and press Player 2 B (`G`) twelve times; press `Enter` as Start. The direction inputs are reserved for the code while the seventh-exit state is active.
- Editor extensions: number keys `0` through `5` select an 8px mouse brush for empty, brick, steel, water, forest, or ice. Click paints one 8px subtile, Shift-click paints the full 16x16 tile, and Alt-click cycles terrain. `SAVE` stores the map, `LOAD` restores it, `CLEAR` restores the original blank construction field and base wall, `EXPORT` copies/logs JSON, and `IMPORT` loads a stage pack. `Ctrl+S` and `Ctrl+X` mirror Save and Export.

## Implemented Mechanics

- 256x240 logical canvas with the original 16px left border, a 208x208 13x13 battlefield, and a 32px right status panel.
- Brick, steel, water, forest, and ice terrain. Water alternates its two animation frames every 32 gameplay frames. Forest renders as a top cover layer, and ice draws a projectile-cover layer that makes flying bullets harder to see.
- Tanks collide with solid terrain, the base, enemy tanks, and teammate tanks.
- Base defense and base destruction game over; shielding brick or steel absorbs bullets before the base can be hit. An exposed hit changes the base tile immediately, then runs the original `$27` countdown: 35 centered explosion frames in the `1-2-3-4-5-4-3-2-1` phase order followed by four destroyed-base-only frames. Player input is cleared while battle simulation continues, and the in-field GAME OVER banner starts only after all 39 updates.
- One-player and two-player modes.
- Original-style attract demo after 640 idle title frames (about 10.7 seconds at the fixed 60 Hz logic rate). The runtime now retains the original independent eight-bit low and high frame counters: the low counter advances every display frame and the high counter advances whenever the low counter reaches a 64-frame boundary. These counters continue during pause while battle simulation time stays frozen, and original reset sites can clear either counter without changing the other. The demo directly starts two AI-controlled players, displays stage 30 with the current free replacement stage data, keeps the four-active-enemy limit, prioritizes available power-ups, and applies combat effects without adding scores or result-table kills. Visiting Construction disables automatic demos until a normal game starts or the game is reset.
- Original hidden-message sequence using both controllers. After a 128-frame black pause, its four text rows and five trailing dots appear at 64-frame intervals. A free procedural green replacement object then morphs for 28 frames, falls from Y 30 through Y 248, and activates the currently selected title option on frame 887 (normally Construction for the documented sequence).
- Four enemy tank classes with different speed, reload, armor, and score.
- Enemy turning, blocked-path choices, firing, power-up types, and valid power-up locations now consume one shared eight-bit random state. Power-up placement consumes the next two position bytes before the type byte, matching the original call order while retaining the accessible-location filter. The state update reproduces the original `D44D` routine's three shifts, subtraction, high-frame addition, index increment, and retained carry into the sampled zero-page byte. The browser runtime projects modeled frame, spawn, and tank state into the corresponding zero-page addresses while leaving unmodeled scratch bytes at their cold-start value; this preserves the original stateful coupling without claiming a full NES RAM simulation. Deterministic debug callbacks bypass the shared state instead of perturbing later gameplay.
- A lethally hit enemy retains its position and active slot through the original destruction state machine instead of disappearing on the hit frame. Its own movement cadence advances 18 explosion ticks in the `1-2-3-4-5-3` picture order, then six fixed score ticks; the slot is released and the defeated count advances only after the final tick. Fast enemies therefore finish in 24 display frames, while normal enemies take 47 or 48 depending on slot/frame parity. The timer power-up does not freeze this sequence. A destroying enemy no longer blocks tanks and cannot be hit again, but still counts against the active-enemy limit. Grenade targets use the same delayed release without score credit and show picture 1 instead of points during the final six ticks.
- A lethally hit player likewise retains a status-driven destruction picture instead of creating a detached display-frame effect. The 24 death ticks advance on the original `[true, true, false, true]` player cadence: 18 ticks use `1-2-3-4-5-3`, and the final six hold picture 1. A hit at tick zero therefore displays the explosion states for 24 frames and the final small picture for eight frames. Only after the last tick is a life consumed and, when one remains, the 28-frame spawn animation starts immediately.
- In two-player play, exhausting one player's last life while the partner still has lives starts the original individual `GAME OVER` message without ending the battle. The free compact replacement retains the 32x8 sprite footprint and a 13-step counter: player 1 enters from `X=0x20` to `0x50`, player 2 mirrors it from `0xC0` to `0x90`, and both move for three 16-frame segments before holding through visible frame 191 and hiding on frame 192. Pause freezes the counter and omits the message while paused. A stage completion detected while this message is active uses the original extended 256-frame battle delay; common game over replaces the individual message only when the base is lost or no player has a tank left.
- Player and enemy tanks retain an independent two-frame tread phase. Every active movement attempt flips the tread pixels, including ice coasting and attempts blocked by terrain or another tank; idle frames and enemy retry waits hold the last phase.
- Battle movement now has free procedural replacement audio with the original channel behavior: the enemy two-pitch engine loop runs throughout active play, while a held player direction takes priority even when a tank is blocked or still has a nonzero death/spawn state. Pause, game over, and the post-clear battle delay silence both loops. A successful player shot starts a single-note pulse cue lasting 15 fixed logic frames; rejected fire attempts do not restart it, enemy shots are silent, and the player-shot pulse masks the lower-priority ice cue while both event counters continue. An armored enemy that survives a player hit starts a pulse-two impact cue with a one-frame pitch, a two-frame pitch, and a two-frame muted tail, retaining the original five-frame channel lifetime; pause freezes it, higher-priority pulse-two events can mask it without stopping its counter, and the movement loop remains suppressed through the muted tail. Lethal enemy hits, friendly-fire stun, and enemy bullets hitting players do not trigger this cue. Starting a new ice slide triggers an independent four-note rising cue lasting four fixed logic frames; pause mutes and freezes it rather than discarding it, while stage-start or bonus-life pulse one can mask it without stopping its counter. Crossing a configured extra-life score threshold or collecting the extra-tank power-up triggers the same two-pulse replacement fanfare: its voices last 60 and 54 fixed logic frames, pause mutes and freezes both, and the movement pulse channel resumes when the second voice ends on frame 54. Every non-demo power-up pickup also starts a 39-frame pulse replacement phrase that freezes on pause and suppresses movement audio; when a pickup simultaneously awards a life, the higher-priority bonus-life pulse masks the pickup phrase while its frame counter still expires normally.
- Enemy destruction uses a free 14-fixed-frame long-period-noise replacement: two two-frame high-volume envelope steps followed by a ten-frame tail. Lethal player shots trigger it once, and using a grenade always triggers one cue for the whole clear, even when it destroys no fully spawned enemies; enemies still in their spawn animation remain untouched. Pause mutes and freezes the cue, and leaving battle clears it.
- Player destruction uses a free 26-fixed-frame long-period-noise replacement with eight descending volume stages. An enemy bullet destroying an unprotected player triggers it; destroying the base starts the same noise alongside the base-specific cue during the pre-banner explosion countdown. Player-destruction noise has priority over enemy-destruction noise, while the masked enemy event still consumes its own frame lifetime. Pause mutes and freezes the cue, and starting a stage or leaving battle clears it.
- Base destruction adds its dedicated free pulse-two replacement: nine descending notes at three fixed logic frames each for the original 27-frame lifetime. It starts together with player-destruction noise during the 39-frame pre-banner countdown; the base pulse remains through frame 26, one frame longer than the noise event, and both finish before the in-field GAME OVER banner begins. On pulse two it is lower priority than stage start, bonus life, power-up pickup, and power-up appearance, but higher priority than steel impacts, armored-enemy hits, and movement. Masked events retain their own frame counters, and starting a stage or leaving battle clears the cue.
- Per-stage enemy sequences with configurable spawn points and active-enemy limits.
- Player star upgrades: faster bullets at level 1, two bullets at level 2, and steel-destroying plus double brick-wall damage at level 3.
- Active bullet limits: base and first-star players can keep one bullet on screen, second-star and max-power players can keep two, and each enemy tank can keep one.
- Bullets that leave the battlefield end in a small edge-clamped impact explosion. Player bullets use the destruction sound against brick and destructible steel, or the blocked-wall sound against ordinary steel and the border; enemy wall impacts remain silent. The destruction replacement cue follows the original three-fixed-frame lifetime with three one-frame triangle notes, freezes during pause without taking either pulse channel from shooting, movement, or blocked impacts, and advances silently when masked by the higher-priority stage-start triangle voice. The blocked-wall replacement cue uses two two-frame pulse notes for the original four-fixed-frame lifetime, freezes during pause, reserves the movement pulse channel, and advances silently when masked by a higher-priority pulse-two event.
- Six power-ups with distinct original-style 16x16 replacement icons: grenade, helmet, shovel, star, timer, and extra tank. Random releases use the original eight-entry lookup, giving grenade and star two chances each and the other four items one chance each. An uncollected item alternates through eight hidden and eight visible frames using the global frame phase; this flashing continues while paused even though item lifetime and pickup checks remain frozen. Active players collect an item only when both center-coordinate differences are below 12 pixels; spawning players cannot collect it. If both players qualify on the same frame, player 2 is checked first. The shovel changes only the five base-wall cells from brick to steel, flashes near expiry, and restores the wall afterward; it never creates ice terrain. A shovel collected after base destruction still awards pickup score but does not alter the wall or start its timer.
- Flashing enemy carriers that spawn power-ups on hit by default. Each successful release starts a free single-pulse, eight-note appearance phrase lasting the original 32 fixed frames. Pause mutes and freezes it; the stage-start, bonus-life, and pickup pulse cues can mask it according to original event priority without stopping its frame counter. Their warning palette continues alternating in eight-frame bands while paused, matching the tank display handler rather than advancing enemy simulation. Built-in and exported defaults mark enemies 4, 11, and 18 as carriers, and packs can switch carrier release to destruction-only behavior.
- Power-up pickup score, extra-life score thresholds, and grenade clearing without enemy kill-table credit. Grenades affect only fully spawned active enemies; enemies still in their spawn animation remain untouched. Stage completion waits for the full enemy queue to be spawned and for every destruction state to release its slot; kill-table credit does not gate advancement.
- Original-style fixed in-field score displays. A normal enemy kill shows its value at the destroyed tank position for the final six destruction ticks. A collected item is immediately replaced by its fixed, single-color score at the item center for 49 visible frames, including frames spent paused; the item icon itself is not retained. Grenade-cleared enemies omit the enemy score state because they do not receive kill-table score credit.
- Player spawn/respawn animation that locks movement and firing before the initial force field starts. Pause retains and freezes active protection but omits its shield sprite until play resumes, matching the original paused display path.
- Stage intro and the original-timed per-stage result count-up table, used after both a cleared stage and game over. Each stage starts a free procedural pulse-triangle-pulse fanfare whose three voices follow the original 264-fixed-frame lifetime: it spans the 95-frame intro and the first 169 battle frames, suppresses the movement pulse channel until completion, and mutes and freezes in place while paused. Result rows increment both players together every nine frames, play one free one-frame pulse-two and short-noise replacement pair on each update frame (one pair even when both players advance together), and extend the result duration from the actual per-type kill counts. A strict two-player kill leader receives the original 1000-point award together with a free 28-frame pulse-two replacement cue; ties and game-over results do not trigger it. A simultaneous extra-life cue retains the higher-priority pulse channel while the result bonus cue advances silently. In two-player results, each centered enemy icon uses the original arrow columns with a clear pixel on both sides, so the replacement sprite cannot merge into the right arrow. The in-field GAME OVER text moves upward one pixel on each of 127 active battle frames, then remains at Y 113 for 129 more active frames; player input is cleared while tanks, bullets, spawns, terrain timers, and power-ups continue updating. The game-over route then shows the current-stage result table without the two-player kill-leader bonus, updates the next-stage index, and finally enters the separate black full-screen `GAME OVER` presentation. Its lettering starts at the original coordinates and advances each replacement glyph by 32 pixels. The screen now waits for a free pulse-one, pulse-two, and triangle replacement fanfare with the original 108-fixed-frame lifetime: each voice uses two 6-frame notes, one 24-frame note, six 8-frame notes, and a final 24-frame note. Frame 108 ends the interstitial with the first voice, while keyboard Start/Select can stop all three voices and skip only this full-screen segment. Score, persistent high score with the original 20000-point floor, reserve-life display, reserve enemy counter, and pause are also implemented.
- Post-game high-score celebration when either player's final score strictly exceeds the record that existed when the run began; tying the record does not trigger it. The screen keeps up to seven score digits and cycles four lettering palettes every frame. Its free pulse-one, pulse-two, and triangle replacement fanfare follows the original fixed-frame sequence: both pulse voices last 460 frames, triangle ends on frame 380, pulse one retains an 80-frame muted interval, and triangle retains its initial 130-frame disabled interval. The screen waits for pulse one and returns to a fresh title cycle on frame 460.
- Original-style Construction mode with a 16px tank cursor, 14-pattern A/B block cycle, stage-1 replacement and normal stage-2 continuation, plus optional 8px mouse editing and save/load/export extensions.

## Stage Pack Format

The browser exposes `window.TankDefender8.loadStagePack(pack)` and `window.TankDefender8.stagePackSchema()`. Loading a stage pack returns to the title screen and clears active players, enemies, bullets, power-ups, and transition timers before the new pack starts.
For automated checks, `window.TankDefender8.debugSnapshot()` returns the current screen, stage, enemy counters, current enemy sequence, scores, lives, per-stage kills, and cumulative kills. The right-panel enemy icons count enemies not yet spawned, not enemies not yet killed.

`data/sample-stage-pack.json` is a valid 13x13 one-stage sample. `data/sample-quadrant-stage-pack.json` is a valid 26x26 one-stage sample. `data/free-35-stage-pack.json` is a deterministic 35-stage free/custom replacement map pack that preserves the current 35-stage enemy sequence data. These can be loaded with the toolbar `IMPORT` button.

`data/free-audio-manifest.json` defines the current free/custom procedural sound set. The runtime exposes the same data through `window.TankDefender8.audioManifest()`, and the smoke test checks that the file and runtime copy stay in sync.

`data/free-sprite-manifest.json` defines the current free/custom procedural rectangle sprites for tanks, result-table mini tanks, bullets, ordinary explosions, shared five-frame tank/HQ destruction explosions, panel enemy counters, spawn/shield outlines, the hidden-message drop, power-ups, terrain, wall subtiles, and the base. The runtime exposes the same data through `window.TankDefender8.spriteManifest()`, and those renderers draw from that manifest.

To regenerate the free/custom 35-stage replacement pack:

```powershell
node tools/build-free-stage-pack.js
```

Each stage pack must use exactly one map format:

- `maps`: 13 strings of 13 characters, one character per 16x16 tile.
- `quadrants`: 26 strings of 26 characters, one character per 8x8 subtile. This is the more precise format for Battle City-style brick/steel layouts and editor exports.

```js
const pack = {
  id: "custom-pack",
  totalStages: 1,
  enemyTotal: 20,
  enemyTypes: [
    { name: "basic", hp: 1, speed: 0.5, bullet: 2.0, wallPower: 1, reload: 1, fireChance: 0.03125, score: 100, color: "#a9a176" },
    { name: "fast", hp: 1, speed: 1.0, bullet: 2.0, wallPower: 1, reload: 1, fireChance: 0.03125, score: 200, color: "#b87854" },
    { name: "power", hp: 1, speed: 0.5, bullet: 4.0, wallPower: 1, reload: 1, fireChance: 0.03125, score: 300, color: "#7fba72" },
    { name: "armor", hp: 4, speed: 0.5, bullet: 2.0, wallPower: 1, reload: 1, fireChance: 0.03125, score: 400, color: "#7fba72", hitColors: ["#b0b5c3", "#9aa2ad", "#79a95e", "#7fba72"] }
  ],
  gameSettings: {
    initialLives: 3,
    bonusLifeScores: [20000],
    deathPowerLevel: 0,
    powerUpDurations: {
      helmet: 10,
      shovel: 20,
      shovelFlash: 4,
      timer: 10
    },
    powerUpRules: {
      carrierRelease: "hit",
      clearUncollectedOnCarrierSpawn: true,
      pickupScore: 500
    },
    timings: {
      stageIntro: 95,
      stageClearDelay: 128,
      stageClear: 0,
      gameOverSlide: 127,
      gameOverHold: 129,
      playerRespawn: 24,
      playerSpawnFlash: 28,
      playerInvulnerability: 3,
      enemySpawnFlash: 28,
      enemyInitialReload: 0,
      enemySpawnRetry: 25,
      powerUpTtl: 0
    },
    enemySpawnPacing: {
      firstDelay: 0,
      baseDelay: 190,
      stageStep: 4,
      minDelay: 50,
      extendedLoopMinDelay: 50,
      twoPlayerDelayReduction: 20
    },
    playerMovement: {
      speed: 1.0,
      frameCadence: [true, true, false, true],
      iceSlideFrames: 28,
      iceSlideSpeed: 1
    },
    projectileRules: {
      bulletSize: 4,
      spawnOffset: 9,
      boundsPadding: 4
    },
    friendlyFire: {
      enabled: true,
      stunFrames: 200
    },
    explosionRules: {
      bulletCancel: { ttl: 10, color: "#f8e08b", coreColor: "#f7f1c6" },
      baseDestroy: { ttl: 35, color: "#f05a42", coreColor: "#f7f1c6" },
      brickHit: { ttl: 9, color: "#d08b52", coreColor: "#f7f1c6" },
      steelHit: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
      steelBlocked: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
      enemyHit: { ttl: 9, color: "#ffffff", coreColor: "#f7f1c6" },
      enemyDestroy: { ttl: 18, color: "#f0b546", coreColor: "#f7f1c6" },
      playerStun: { ttl: 9, color: "#f7f1c6", coreColor: "#f7f1c6" },
      playerDestroy: { ttl: 18, color: "#f05a42", coreColor: "#f7f1c6" }
    },
    stageAdvance: {
      loopAfterFinalStage: true,
      extendedLoopEndStage: 70,
      extendedLoopEnemyStage: 35
    },
    stageClearBonus: {
      points: 1000,
      twoPlayerOnly: true,
      requireStrictLead: true
    },
    enemyAi: {
      intersectionTurnChance: 0.0625,
      blockedRetryChance: 0.75,
      blockedRetryTicks: 2,
      horizontalFirstChance: 0.5
    },
    playerUpgradeRules: [
      { level: 0, maxBullets: 1, bulletSpeed: 2.0, wallPower: 1, reload: 1 },
      { level: 1, maxBullets: 1, bulletSpeed: 4.0, wallPower: 1, reload: 1 },
      { level: 2, maxBullets: 2, bulletSpeed: 4.0, wallPower: 1, reload: 1 },
      { level: 3, maxBullets: 2, bulletSpeed: 4.0, wallPower: 3, reload: 1 }
    ],
    timerFreezesEnemyTime: true
  },
  stageSettings: [
    {
      maxActiveEnemies: 4,
      maxActiveEnemiesTwoPlayer: 6,
      playerSpawns: [{ x: 4, y: 12 }, { x: 8, y: 12 }],
      enemySpawns: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }],
      powerUpSpawns: [
        { x: 1, y: 1 }, { x: 6, y: 1 }, { x: 11, y: 1 }, { x: 3, y: 2 },
        { x: 9, y: 2 }, { x: 1, y: 5 }, { x: 5, y: 4 }, { x: 7, y: 4 },
        { x: 11, y: 5 }, { x: 3, y: 7 }, { x: 9, y: 7 }, { x: 1, y: 10 },
        { x: 5, y: 9 }, { x: 7, y: 9 }, { x: 11, y: 10 }, { x: 6, y: 11 }
      ]
    }
  ],
  quadrants: [[
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........................",
    "..........BBBBBB..........",
    "..........BBBBBB..........",
    "..........BB..BB..........",
    "..........BB..BB.........."
  ]],
  enemies: [[
    { typeIndex: 0, carrier: false, spawnIndex: 0, spawnDelay: 70 },
    { typeIndex: 1, carrier: false, spawnIndex: 1, spawnDelay: 96 },
    { typeIndex: 2, carrier: true, spawnIndex: 2, powerUpType: null, spawnDelay: 120 }
    // Continue until the stage has the exact number of enemies for that stage.
  ]]
};

const result = window.TankDefender8.validateStagePack(pack);
if (result.ok) window.TankDefender8.loadStagePack(pack);
```

Tile codes:

- `.` empty
- `B` or `#` brick
- `S` steel
- `W` or `~` water
- `F` forest
- `I` ice

Enemy `typeIndex` values:

- `0` basic
- `1` fast
- `2` power
- `3` armor

Packs may override `enemyTypes`, the four enemy class definitions referenced by `typeIndex`. Each entry may define `name`, `hp`, `speed`, `bullet`, `wallPower`, `reload`, `fireChance`, `score`, `color`, and `hitColors`. `hitColors` is an optional low-health-to-high-health color array used for multi-hit enemies; the default Armor Tank starts green at full health and shifts toward gray as it is damaged. If omitted, the engine uses the built-in original-style defaults. The built-in Power Tank keeps `wallPower: 1`; its faster projectile is its firepower advantage. Custom `wallPower: 2` shots clear one targeted 8x8 brick subtile but cannot destroy steel, while `wallPower: 3` also destroys steel.

Brick walls retain the original 4x4 collision fragments inside each 8x8 map subtile. An ordinary shot peels one 8x4 strip perpendicular to a vertical shot, or one 4x8 strip perpendicular to a horizontal shot. Four aligned ordinary shots therefore tunnel one 8-pixel lane through a 16x16 wall while leaving the other lane intact. A powered (`wallPower` 2 or 3) shot removes one targeted 8x8 brick subtile, so two aligned shots tunnel the same lane. Removed 4x4 fragments stop blocking later bullets and tanks.

Enemy `spawnIndex` values:

- `0` left top
- `1` center top
- `2` right top

Player star upgrade rules:

- Level `0`: one slow bullet, base player tank visual, normal brick damage, cannot destroy steel.
- Level `1`: one fast bullet, upgraded tank visual, normal brick damage, cannot destroy steel.
- Level `2`: two fast bullets, second upgraded tank visual, normal brick damage, cannot destroy steel.
- Level `3`: two fast bullets, max-power tank visual, double brick damage, and each hit destroys one targeted 8x8 steel subtile.

Packs may override these with `gameSettings.playerUpgradeRules`. The array must contain exactly four entries for levels `0` through `3`; each entry may define `maxBullets`, `bulletSpeed`, `wallPower`, and `reload`. Star upgrades do not add player armor; enemy bullets still cost one life unless the player is protected by spawn invulnerability or the helmet power-up.

Carrier enemies release a power-up when hit by default. Carrier enemies may also set `powerUpType`. Allowed values are `grenade`, `helmet`, `shovel`, `star`, `timer`, and `tank`. If omitted, carrier enemies choose a power-up randomly.
The built-in default follows the original-style carrier positions: the 4th, 11th, and 18th enemies in the sequence.
When a new carrier enemy spawns, any uncollected power-up is removed.

Each enemy may set `spawnDelay`, the number of 60 FPS frames to wait before that enemy is eligible to spawn. If omitted, the engine uses `gameSettings.enemySpawnPacing`. Values must be integers from `0` to `3600`.

Packs may set `gameSettings.initialLives`, the number of lives each player starts with. If omitted, the default is `3`; valid values are `1` through `9`.

Packs may set `gameSettings.bonusLifeScores`, an ascending or unsorted array of score thresholds that award one extra life when crossed. If omitted, the default is `[20000]`; values must be integers from `1` to `999999`.

Packs may set `gameSettings.deathPowerLevel`, the maximum power level a player respawns with after losing a life. If omitted, the default is `0`, matching the original-style reset to the base tank; valid values are `0` through `3`.

Packs may set `gameSettings.powerUpDurations` using the original 64-frame counter units. The defaults are `10` for helmet, `20` for shovel, `4` for the shovel flash threshold, and `10` for timer; valid values are `1` through `3600`. A ten-unit item lasts from 577 through 640 display frames depending on the global frame phase when it is collected. While the shovel counter is below `shovelFlash`, the base wall alternates between brick and steel every 16 frames; zero restores brick.

Packs may set `gameSettings.powerUpRules`. `carrierRelease` defaults to `hit`, matching the original-style rule that a flashing carrier releases its item on the first player hit; set it to `destroyed` if a custom pack should wait until the carrier is destroyed. `clearUncollectedOnCarrierSpawn` defaults to `true`, so a new carrier enemy removes any uncollected power-up already on the field. `pickupScore` defaults to `500`, the score awarded when a player collects any power-up.

Packs may set `gameSettings.timings`. Most values use 60 FPS display frames. `playerRespawn` follows the active `[true, true, false, true]` player cadence and defaults to 24 death ticks: the first 18 ticks use the destruction sequence, the final six retain its first small picture, and a life is consumed after 32 display frames from a hit at tick zero. `playerSpawnFlash` and `enemySpawnFlash` each default to 28 display frames and advance every display frame, matching the two original 14-frame spawn states; the player therefore finishes spawning after 60 total display frames from the hit. The replacement spawn art shrinks and expands symmetrically during each 14-frame state. `playerInvulnerability` uses 64-frame units and defaults to `3`; it starts only when spawning completes and lasts 129 through 192 display frames depending on the global phase. `stageIntro` defaults to `95` inactive display frames: 13 map-writing waits, 64 attribute-copy waits, a 16-frame top/bottom curtain opening, and 2 tank/panel preparation waits. Dynamic actors and the side panel remain hidden until preparation finishes. Custom packs may override the total window; the opening remains a discrete sequence at the end of the available interval. Entering stage selection separately uses the original fixed 16-frame top/bottom curtain close. Base destruction first consumes its separate 39-frame countdown. `gameOverSlide` then defaults to `127`, moving the in-field GAME OVER text to its final Y coordinate; `gameOverHold` defaults to `129`, keeping the battle simulation active with player input cleared before the result table. Together they preserve the original 256-frame post-countdown battlefield interval. `powerUpTtl` defaults to `0`, which means a released power-up does not expire by time and is removed only when collected or when a later carrier spawns a new power-up. Set it to a positive frame count for custom timed power-ups. `stageClearDelay` defaults to `128`: the completion-detection frame loads the counter without consuming it, sets both original frame counters to zero, then 128 complete active battle updates run before the result screen, so a stray player bullet can still destroy the base. If an individual two-player `GAME OVER` message is already active when completion is detected, this delay becomes the original fixed 256 frames and the high counter starts at `0xFE`, wrapping to `0x02` as the message finishes. The common game-over battlefield interval uses the same `0xFE`-to-`0x02` route. `stageClear` defaults to `0`, selecting the dynamic original result schedule: 30 initial frames, a one-frame row setup, a count update plus eight-frame hold for every visible count and each row's final empty pass, 20 frames between rows, 30 before TOTAL, 15 before the leader bonus, and a 120-frame final hold. A positive `stageClear` value remains available as a fixed-duration override for custom packs. If omitted, the engine uses the built-in timing defaults shown in the sample.

After a cleared-stage result finishes, a fixed original-style 16-frame curtain closes over the result table before the next stage number and intro are loaded. The game-over result follows its separate full-screen route without this next-stage curtain.

`enemySpawnRetry` defaults to `25`. If the selected enemy spawn point is occupied by an active or spawning tank, the pending enemy is not consumed and the same point is checked again after this delay.

Packs may set `gameSettings.enemySpawnPacing`, in 60 FPS frames, for default enemy spawn cadence. `firstDelay` is used for the first enemy when that enemy has no explicit `spawnDelay`; later enemies use `max(minDelay, baseDelay - stage * stageStep)`. For original-style 35-stage packs that continue through stage 70, `extendedLoopMinDelay` is used as the lower cap during stages 36 through 70. In two-player mode, generated default delays subtract `twoPlayerDelayReduction`; explicit per-enemy `spawnDelay` values are not changed. If omitted, the defaults are `0`, `190`, `4`, `50`, `50`, and `20`, matching the original immediate first spawn and the `190 - stage * 4` interval. Frame values are valid from `0` through `3600`. Legacy custom packs using `twoPlayerDelayMultiplier` remain supported.

Packs may set `gameSettings.playerMovement`. `speed` is the distance moved on each active movement frame. `frameCadence` is a repeating boolean array selecting active movement frames; the original default `[true, true, false, true]` moves one pixel on three of every four frames. Switching between horizontal and vertical movement aligns both player coordinates to the nearest 8-pixel grid point before moving; continuing straight or reversing 180 degrees does not snap. Alignment is skipped if the snapped rectangle would overlap solid terrain. If terrain is dynamically restored over a tank, outward movement is allowed only while each step strictly reduces the overlap, preventing the tank from becoming trapped without permitting it to drive deeper through the wall. On ice, the first direction input with no retained inertia loads `iceSlideFrames` (`28` by default). While bit `0x10` remains set, the first 13 inertia ticks ignore direction input and move at `iceSlideSpeed` (`1` pixel); below 16, control returns. Releasing input consumes the remaining counter while coasting. Leaving ice preserves but pauses the counter, and blocked movement still consumes it. A legacy custom pack that supplies `speed` but omits `frameCadence` moves every frame.

Packs may set `gameSettings.projectileRules`. `bulletSize` is the bullet collision/render size in pixels, `spawnOffset` is the muzzle offset from the tank center, and `boundsPadding` is the off-field margin before a bullet is removed. Tank hits require both bullet-to-tank center-coordinate differences to be below `10` pixels. Enemies still in their spawn animation or destruction state are skipped; a player helmet or post-spawn force field absorbs an incoming bullet without a hit explosion. An unprotected player hit shows the nine-frame bullet impact at the bullet center in addition to entering the retained player-destruction state. Every player-bullet hit on an active enemy shows the same nine-frame impact at the bullet center; a lethal hit changes that enemy into its retained tank-destruction state rather than creating a detached explosion object. An exposed base hit immediately changes the base graphic and starts the dedicated HQ-centered destruction sequence instead of a generic bullet impact; a shielding wall is resolved first and prevents the base hit. After every bullet completes its full-frame movement, bullets from different tanks cancel without an explosion when both center differences are below `6` pixels; two bullets from the same tank skip that check. If omitted, the defaults are `4`, `9`, and `4`; valid ranges are `bulletSize` `1` through `16`, `spawnOffset` `0` through `32`, and `boundsPadding` `0` through `32`.

Packs may set `gameSettings.friendlyFire`. By default, player bullets can hit the other player in two-player mode when both center-coordinate differences are below `10` pixels, loading a `200`-tick stun counter rather than destroying them. The hit also shows the original-style nine-frame bullet impact at the bullet center. The counter decrements only on active player movement frames, lasting about `267` display frames with the original cadence. A stunned player cannot move or turn, but can still fire in the current direction; another friendly hit does not refresh an active stun. Pause freezes the stun counter while its eight-frame visible/hidden tank flash continues on display time. A teammate protected by a helmet or post-spawn force field absorbs the friendly bullet without being stunned or showing a hit explosion. Set `enabled` to `false` to disable this collision effect, or adjust `stunFrames` from `0` through `3600` movement ticks.

Packs may set `gameSettings.explosionRules` for collision and destruction feedback. Each rule has `ttl`, `color`, and `coreColor`; colors must be `#rrggbb`, and `ttl` accepts `1` through `3600`. Most `ttl` values are 60 FPS display frames. `enemyDestroy.ttl` and `playerDestroy.ttl` are instead status tick counts and both default to `18`. Enemy destruction then enters its fixed six-tick score state; player destruction uses the remaining `playerRespawn` ticks, six by default, to hold picture 1. Rule names are `bulletCancel`, `baseDestroy`, `brickHit`, `steelHit`, `steelBlocked`, `enemyHit`, `enemyDestroy`, `playerStun`, and `playerDestroy`. `baseDestroy` defaults to 35 visible frames mapped across the original nine HQ phases; phases 1-3 use three distinct centered 16x8 replacement frames and phases 4-5 use two distinct 32x32 replacement frames, followed by a fixed four-frame destroyed-base tail. Tank destruction reuses those five pictures: retained enemies map their status ticks across `1-2-3-4-5-3`, while players append the original final small picture as `1-2-3-4-5-3-1`; pictures 1-3 occupy 16x8 and pictures 4-5 occupy 32x32. The three wall/border impact rules, `enemyHit`, and `playerStun` default to nine visible frames split into three animation phases of three frames each, and pause freezes those ordinary impacts. `bulletCancel` remains accepted for stage-pack compatibility, although original-style bullet-to-bullet cancellation now removes both bullets without rendering an explosion.

Packs may set `gameSettings.stageAdvance`. `loopAfterFinalStage` controls whether clearing the final cycle stage wraps back to stage 1. For original-style 35-stage packs, the default cycle continues through stage 70 before wrapping; stages 36 through 70 reuse map data from stages 1 through 35 while using stage 35 enemy pattern data. When stage 70 wraps to stage 1, player score, power level, lives, and cumulative kill totals are preserved; per-stage points, per-stage kill rows, active bullets, active power-ups, and pending power-up spawn memory are reset for the new stage. `extendedLoopEndStage` defaults to `70`, and `extendedLoopEnemyStage` defaults to `35`. Set `loopAfterFinalStage` to `false` for a finite pack that returns to the title screen after the final result screen.

Packs may set `gameSettings.stageClearBonus`. By default, a two-player stage awards `1000` points to the player with the strictly higher stage kill count; ties award nothing. The actual kill leader must still have at least one remaining life, and an ineligible leader does not pass the bonus to the runner-up. Game-over results never award this bonus. `points` must be an integer from `0` to `999999`; `twoPlayerOnly` and `requireStrictLead` are booleans.

Packs may set `gameSettings.enemyAi`. At 8-pixel intersections, `intersectionTurnChance` controls whether an enemy reevaluates its route. On collision, `blockedRetryChance` controls whether it pauses for `blockedRetryTicks` movement turns and retries the same direction instead of entering the turn state. `horizontalFirstChance` selects whether target routing resolves the horizontal or vertical axis first. Defaults are `1/16`, `3/4`, `2`, and `1/2`, matching the original state machine. During a stage, routing progresses from random directions to player targeting and finally HQ targeting as the independent high frame counter, which advances once every 64 display frames, crosses `spawnInterval/8` and `spawnInterval/4`. In two-player mode, even enemy slots prefer player 1 and odd enemy slots prefer player 2, falling back to the living player.

Packs may set `gameSettings.timerFreezesEnemyTime`. If omitted, the default is `true`: while the timer power-up's 64-frame counter is nonzero, enemy spawn countdowns and spawn animations continue normally. A newly spawned enemy completes its appearance, then remains stationary without advancing its reload timer, running AI, or firing. On the 64-frame boundary that decrements the counter to zero, active enemy processing resumes immediately.

Each stage may set `stageSettings[index].maxActiveEnemies` and `maxActiveEnemiesTwoPlayer`, the maximum number of live enemies allowed at once in one-player and two-player modes. If omitted, the defaults are `4` and `6`; valid values are `1` through `8`. For backward compatibility, a custom stage that sets only `maxActiveEnemies` uses that same explicit limit in both modes.

Each stage may also set `playerSpawns` and `enemySpawns` inside its stage settings. Spawn points use 13x13 tile coordinates, not pixels. `playerSpawns` must contain at least two points, and `enemySpawns` must contain at least three points. Enemy `spawnIndex` selects from `enemySpawns`.

Each stage may also set `powerUpSpawns`, the fixed candidate locations used when a carrier releases a power-up. These also use 13x13 tile coordinates and must contain at least one point. If omitted, the engine uses a 16-point original-style default list. Spawn selection filters out blocked or unreachable candidates, then randomly picks a reachable candidate; when more than one reachable location exists, the immediately previous power-up location is avoided.

Imported JSON packs are strict: either `maps.length` or `quadrants.length` must equal `totalStages`, but not both; every `maps` stage must be 13x13; every `quadrants` stage must be 26x26; `enemies.length` must equal `totalStages`; and every stage enemy sequence must contain at least one enemy. The runtime uses each stage's `enemies` array as the authoritative enemy order, including `typeIndex`, carrier flag, `powerUpType`, spawn point, and explicit spawn delay. `enemyTotal` is optional metadata/default compatibility; the active stage enemy count is derived from that stage's enemy sequence length.

The base tile and immediate spawn/base protection zones are normalized by the engine when a stage starts.

## Reference Notes

The built-in enemy composition now uses an original-style 35-stage enemy group table. `data/free-35-stage-pack.json` supplies fixed free/custom replacement maps for all 35 stages, `data/free-audio-manifest.json` supplies the current procedural replacement sound events, and `data/free-sprite-manifest.json` supplies the current procedural tank, bullet, terrain, base, ordinary/destruction explosion, panel, outline, and power-up sprites. Future sampled music/sound effects or richer sprite art should likewise be supplied as free/custom replacements rather than original ROM-derived assets. Public references used for rules cross-checking include:

- [StrategyWiki Battle City walkthrough](https://strategywiki.org/wiki/Battle_City/Walkthrough)
- [StrategyWiki Battle City gameplay](https://strategywiki.org/wiki/Battle_City/Gameplay)
- [Battle City annotated disassembly](https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/main/Battle%20City/bank_FF.asm)
