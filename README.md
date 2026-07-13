# Tank Defender 8

**English** | [简体中文](README.zh-CN.md)

NES-style tank defense game built as a static Canvas app.

This repository does not include original NES ROM data, original sprites, original audio, or original stage maps. Maps, sprites, and audio use free or custom replacement resources. The built-in enemy composition mirrors the publicly documented 35-stage Battle City enemy group table, and the engine remains data-driven so gameplay rules, enemy sequences, and stage packs can be tuned without changing the core code.

## Run

Open `index.html` in a browser, or serve the folder locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/index.html`.

## Verify

```powershell
node --check src/game.js
node --check tools/build-free-stage-pack.js
node tools/smoke-test.js
git diff --check
```

## Controls

- Title: arrow keys or `WASD` select `1 PLAYER`, `2 PLAYERS`, or `CONSTRUCTION`; `Enter`/`Space` activates the selected option. `1`, `2`, and `C`/`E` remain direct shortcuts. Leaving the untouched title idle for 2560 frames starts the attract demo; `Enter`, `Space`, or `Escape` returns from the demo.
- Stage select: `Space`/`Z` acts as NES A and advances through stages 1-35; `F`/`X` acts as NES B and moves backward. Holding A or B repeats every eight frames. `Enter` starts the selected stage and `Escape` returns to the title.
- Player 1: arrow keys move, `Space` fires. In one-player mode, `WASD` also moves Player 1.
- Player 2: in two-player mode, `WASD` moves and `F` fires.
- Pause: `Enter` as the keyboard Start button, `P`, or toolbar `PAUSE`.
- Reset: toolbar `RESET` returns to the title screen, restores the built-in original-style stage pack, and clears temporary gameplay/editor-test state.
- Construction: arrow keys or `WASD` move the tank cursor one 16x16 cell. `Space`/`Z` acts as NES A and advances through the original 14 block patterns; `F`/`X` acts as NES B and moves backward. The first A/B press after moving places the current pattern without changing it. `Enter` acts as Start, returns to the title, and installs the edited map as stage 1; clearing it continues to the normal stage 2. `TEST` or `E` starts an immediate one-stage test.
- Hidden message: enter and leave Construction seven times. On the title, hold Player 1 Down and press Player 2 A (`F`) eight times, then hold Player 1 Right and press Player 2 B (`G`) twelve times; press `Enter` as Start. The direction inputs are reserved for the code while the seventh-exit state is active.
- Editor extensions: number keys `0` through `5` select an 8px mouse brush for empty, brick, steel, water, forest, or ice. Click paints one 8px subtile, Shift-click paints the full 16x16 tile, and Alt-click cycles terrain. `SAVE` stores the map, `LOAD` restores it, `CLEAR` restores the original blank construction field and base wall, `EXPORT` copies/logs JSON, and `IMPORT` loads a stage pack. `Ctrl+S` and `Ctrl+X` mirror Save and Export.

## Implemented Mechanics

- 256x240 logical canvas with the original 16px left border, a 208x208 13x13 battlefield, and a 32px right status panel.
- Brick, steel, water, forest, and ice terrain. Water alternates its two animation frames every 32 gameplay frames. Forest renders as a top cover layer, and ice draws a projectile-cover layer that makes flying bullets harder to see.
- Tanks collide with solid terrain, the base, enemy tanks, and teammate tanks.
- Base defense and base destruction game over; shielding brick or steel absorbs bullets before the base can be hit.
- One-player and two-player modes.
- Original-style attract demo after 2560 idle title frames (about 42.7 seconds at the fixed 60 Hz logic rate). It directly starts two AI-controlled players, displays stage 30 with the current free replacement stage data, keeps the four-active-enemy limit, prioritizes available power-ups, and applies combat effects without adding scores or result-table kills. Visiting Construction disables automatic demos until a normal game starts or the game is reset.
- Original hidden-message sequence using both controllers. After a 128-frame black pause, its four text rows and five trailing dots appear at 64-frame intervals. A free procedural green replacement object then morphs for 28 frames, falls from Y 30 through Y 248, and activates the currently selected title option on frame 887 (normally Construction for the documented sequence).
- Four enemy tank classes with different speed, reload, armor, and score.
- Per-stage enemy sequences with configurable spawn points and active-enemy limits.
- Player star upgrades: faster bullets at level 1, two bullets at level 2, and steel-destroying plus double brick-wall damage at level 3.
- Active bullet limits: base and first-star players can keep one bullet on screen, second-star and max-power players can keep two, and each enemy tank can keep one.
- Bullets that leave the battlefield end in a small edge-clamped impact explosion. Player bullets use the destruction sound against brick and destructible steel, or the blocked-wall sound against ordinary steel and the border; enemy wall impacts remain silent.
- Six power-ups with distinct original-style 16x16 replacement icons: grenade, helmet, shovel, star, timer, and extra tank. Random releases use the original eight-entry lookup, giving grenade and star two chances each and the other four items one chance each. An uncollected item alternates through eight hidden and eight visible frames using the global frame phase. Active players collect an item only when both center-coordinate differences are below 12 pixels; spawning players cannot collect it. If both players qualify on the same frame, player 2 is checked first. The shovel changes only the five base-wall cells from brick to steel, flashes near expiry, and restores the wall afterward; it never creates ice terrain. A shovel collected after base destruction still awards pickup score but does not alter the wall or start its timer.
- Flashing enemy carriers that spawn power-ups on hit by default. Built-in and exported defaults mark enemies 4, 11, and 18 as carriers, and packs can switch carrier release to destruction-only behavior.
- Power-up pickup score, extra-life score thresholds, and grenade clearing without enemy kill-table credit. Grenades clear only fully spawned active enemies; enemies still in their spawn animation remain untouched. Stage completion is based on the full enemy queue being spawned and all active enemies being gone; kill-table credit does not gate advancement.
- In-field score popups for scored enemy kills and collected power-ups. A collected item is immediately replaced by its fixed, single-color score at the item center for 49 visible frames, including frames spent paused; the item icon itself is not retained. Grenade-cleared enemies still omit enemy score popups because they do not receive kill-table score credit.
- Player spawn/respawn animation that locks movement and firing before the initial force field starts.
- Stage intro, original-timed per-stage result count-up table, game over, score, persistent high score with the original 20000-point floor, reserve-life display, reserve enemy counter, pause.
- Post-game high-score celebration when either player's final score strictly exceeds the record that existed when the run began; tying the record does not trigger it. The screen keeps up to seven score digits, cycles four lettering palettes every frame for 576 fixed logic frames, and plays a 9.6-second free procedural replacement fanfare before returning to a fresh title cycle.
- Original-style Construction mode with a 16px tank cursor, 14-pattern A/B block cycle, stage-1 replacement and normal stage-2 continuation, plus optional 8px mouse editing and save/load/export extensions.

## Stage Pack Format

The browser exposes `window.TankDefender8.loadStagePack(pack)` and `window.TankDefender8.stagePackSchema()`. Loading a stage pack returns to the title screen and clears active players, enemies, bullets, power-ups, and transition timers before the new pack starts.
For automated checks, `window.TankDefender8.debugSnapshot()` returns the current screen, stage, enemy counters, current enemy sequence, scores, lives, per-stage kills, and cumulative kills. The right-panel enemy icons count enemies not yet spawned, not enemies not yet killed.

`data/sample-stage-pack.json` is a valid 13x13 one-stage sample. `data/sample-quadrant-stage-pack.json` is a valid 26x26 one-stage sample. `data/free-35-stage-pack.json` is a deterministic 35-stage free/custom replacement map pack that preserves the current 35-stage enemy sequence data. These can be loaded with the toolbar `IMPORT` button.

`data/free-audio-manifest.json` defines the current free/custom procedural sound set. The runtime exposes the same data through `window.TankDefender8.audioManifest()`, and the smoke test checks that the file and runtime copy stay in sync.

`data/free-sprite-manifest.json` defines the current free/custom procedural rectangle sprites for tanks, result-table mini tanks, bullets, explosions, panel enemy counters, spawn/shield outlines, the hidden-message drop, power-ups, terrain, wall subtiles, and the base. The runtime exposes the same data through `window.TankDefender8.spriteManifest()`, and those renderers draw from that manifest.

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
      stageIntro: 86,
      stageClearDelay: 60,
      stageClear: 420,
      gameOverSlide: 96,
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
      baseDestroy: { ttl: 80, color: "#f05a42", coreColor: "#f7f1c6" },
      brickHit: { ttl: 9, color: "#d08b52", coreColor: "#f7f1c6" },
      steelHit: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
      steelBlocked: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
      enemyHit: { ttl: 14, color: "#ffffff", coreColor: "#f7f1c6" },
      enemyDestroy: { ttl: 34, color: "#f0b546", coreColor: "#f7f1c6" },
      playerStun: { ttl: 12, color: "#f7f1c6", coreColor: "#f7f1c6" },
      playerDestroy: { ttl: 32, color: "#f05a42", coreColor: "#f7f1c6" }
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

Packs may set `gameSettings.timings`. Most values use 60 FPS display frames. `playerRespawn` follows the active `[true, true, false, true]` player cadence and defaults to 24 death ticks, consuming a life after 32 display frames from a hit at tick zero. `playerSpawnFlash` and `enemySpawnFlash` each default to 28 display frames and advance every display frame, matching the two original 14-frame spawn states; the player therefore finishes spawning after 60 total display frames from the hit. The replacement spawn art shrinks and expands symmetrically during each 14-frame state. `playerInvulnerability` uses 64-frame units and defaults to `3`; it starts only when spawning completes and lasts 129 through 192 display frames depending on the global phase. `stageIntro` controls the battlefield curtain opening before play starts. `gameOverSlide` controls the GAME OVER banner moving up from the bottom of the playfield to the center. `powerUpTtl` defaults to `0`, which means a released power-up does not expire by time and is removed only when collected or when a later carrier spawns a new power-up. Set it to a positive frame count for custom timed power-ups. `stageClearDelay` keeps gameplay active briefly after the last enemy is destroyed, so a stray player bullet can still destroy the base before the result screen. If omitted, the engine uses the built-in timing defaults shown in the sample.

Packs may set `gameSettings.enemySpawnPacing`, in 60 FPS frames, for default enemy spawn cadence. `firstDelay` is used for the first enemy when that enemy has no explicit `spawnDelay`; later enemies use `max(minDelay, baseDelay - stage * stageStep)`. For original-style 35-stage packs that continue through stage 70, `extendedLoopMinDelay` is used as the lower cap during stages 36 through 70. In two-player mode, generated default delays subtract `twoPlayerDelayReduction`; explicit per-enemy `spawnDelay` values are not changed. If omitted, the defaults are `0`, `190`, `4`, `50`, `50`, and `20`, matching the original immediate first spawn and the `190 - stage * 4` interval. Frame values are valid from `0` through `3600`. Legacy custom packs using `twoPlayerDelayMultiplier` remain supported.

Packs may set `gameSettings.playerMovement`. `speed` is the distance moved on each active movement frame. `frameCadence` is a repeating boolean array selecting active movement frames; the original default `[true, true, false, true]` moves one pixel on three of every four frames. Switching between horizontal and vertical movement aligns both player coordinates to the nearest 8-pixel grid point before moving; continuing straight or reversing 180 degrees does not snap. On ice, the first direction input with no retained inertia loads `iceSlideFrames` (`28` by default). While bit `0x10` remains set, the first 13 inertia ticks ignore direction input and move at `iceSlideSpeed` (`1` pixel); below 16, control returns. Releasing input consumes the remaining counter while coasting. Leaving ice preserves but pauses the counter, and blocked movement still consumes it. A legacy custom pack that supplies `speed` but omits `frameCadence` moves every frame.

Packs may set `gameSettings.projectileRules`. `bulletSize` is the bullet collision/render size in pixels, `spawnOffset` is the muzzle offset from the tank center, and `boundsPadding` is the off-field margin before a bullet is removed. Tank hits require both bullet-to-tank center-coordinate differences to be below `10` pixels. Enemies still in their spawn animation are skipped; a player helmet or post-spawn force field absorbs an incoming bullet without a hit explosion. After every bullet completes its full-frame movement, bullets from different tanks cancel without an explosion when both center differences are below `6` pixels; two bullets from the same tank skip this check. If omitted, the defaults are `4`, `9`, and `4`; valid ranges are `bulletSize` `1` through `16`, `spawnOffset` `0` through `32`, and `boundsPadding` `0` through `32`.

Packs may set `gameSettings.friendlyFire`. By default, player bullets can hit the other player in two-player mode when both center-coordinate differences are below `10` pixels, loading a `200`-tick stun counter rather than destroying them. The counter decrements only on active player movement frames, lasting about `267` display frames with the original cadence. A stunned player cannot move or turn, but can still fire in the current direction; another friendly hit does not refresh an active stun. A teammate protected by a helmet or post-spawn force field absorbs the friendly bullet without being stunned or showing a hit explosion. Set `enabled` to `false` to disable this collision effect, or adjust `stunFrames` from `0` through `3600` movement ticks.

Packs may set `gameSettings.explosionRules` for collision and destruction feedback. Each rule has `ttl`, `color`, and `coreColor`; `ttl` is a 60 FPS frame count from `1` through `3600`, and colors must be `#rrggbb`. Rule names are `bulletCancel`, `baseDestroy`, `brickHit`, `steelHit`, `steelBlocked`, `enemyHit`, `enemyDestroy`, `playerStun`, and `playerDestroy`. The three wall/border impact rules default to nine visible frames split into three animation phases of three frames each, and pause freezes the current phase. `bulletCancel` remains accepted for stage-pack compatibility, although original-style bullet-to-bullet cancellation now removes both bullets without rendering an explosion.

Packs may set `gameSettings.stageAdvance`. `loopAfterFinalStage` controls whether clearing the final cycle stage wraps back to stage 1. For original-style 35-stage packs, the default cycle continues through stage 70 before wrapping; stages 36 through 70 reuse map data from stages 1 through 35 while using stage 35 enemy pattern data. When stage 70 wraps to stage 1, player score, power level, lives, and cumulative kill totals are preserved; per-stage points, per-stage kill rows, active bullets, active power-ups, and pending power-up spawn memory are reset for the new stage. `extendedLoopEndStage` defaults to `70`, and `extendedLoopEnemyStage` defaults to `35`. Set `loopAfterFinalStage` to `false` for a finite pack that returns to the title screen after the final result screen.

Packs may set `gameSettings.stageClearBonus`. By default, a two-player stage awards `1000` points to the player with the strictly higher stage kill count; ties award nothing. `points` must be an integer from `0` to `999999`; `twoPlayerOnly` and `requireStrictLead` are booleans.

Packs may set `gameSettings.enemyAi`. At 8-pixel intersections, `intersectionTurnChance` controls whether an enemy reevaluates its route. On collision, `blockedRetryChance` controls whether it pauses for `blockedRetryTicks` movement turns and retries the same direction instead of entering the turn state. `horizontalFirstChance` selects whether target routing resolves the horizontal or vertical axis first. Defaults are `1/16`, `3/4`, `2`, and `1/2`, matching the original state machine. During a stage, routing progresses from random directions to player targeting and finally HQ targeting as the high byte of the stage frame counter crosses `spawnInterval/8` and `spawnInterval/4`. In two-player mode, even enemy slots prefer player 1 and odd enemy slots prefer player 2, falling back to the living player.

Packs may set `gameSettings.timerFreezesEnemyTime`. If omitted, the default is `true`: the timer power-up pauses enemy movement plus enemy reload, AI, and spawn-flash timers while its 64-frame counter is nonzero. Enemy spawn countdowns still continue; newly spawned enemies appear but remain frozen in their spawn animation. On the 64-frame boundary that decrements the counter to zero, enemy processing resumes immediately.

Each stage may set `stageSettings[index].maxActiveEnemies` and `maxActiveEnemiesTwoPlayer`, the maximum number of live enemies allowed at once in one-player and two-player modes. If omitted, the defaults are `4` and `6`; valid values are `1` through `8`. For backward compatibility, a custom stage that sets only `maxActiveEnemies` uses that same explicit limit in both modes.

Each stage may also set `playerSpawns` and `enemySpawns` inside its stage settings. Spawn points use 13x13 tile coordinates, not pixels. `playerSpawns` must contain at least two points, and `enemySpawns` must contain at least three points. Enemy `spawnIndex` selects from `enemySpawns`.

Each stage may also set `powerUpSpawns`, the fixed candidate locations used when a carrier releases a power-up. These also use 13x13 tile coordinates and must contain at least one point. If omitted, the engine uses a 16-point original-style default list. Spawn selection filters out blocked or unreachable candidates, then randomly picks a reachable candidate; when more than one reachable location exists, the immediately previous power-up location is avoided.

Imported JSON packs are strict: either `maps.length` or `quadrants.length` must equal `totalStages`, but not both; every `maps` stage must be 13x13; every `quadrants` stage must be 26x26; `enemies.length` must equal `totalStages`; and every stage enemy sequence must contain at least one enemy. The runtime uses each stage's `enemies` array as the authoritative enemy order, including `typeIndex`, carrier flag, `powerUpType`, spawn point, and explicit spawn delay. `enemyTotal` is optional metadata/default compatibility; the active stage enemy count is derived from that stage's enemy sequence length.

The base tile and immediate spawn/base protection zones are normalized by the engine when a stage starts.

## Reference Notes

The built-in enemy composition now uses an original-style 35-stage enemy group table. `data/free-35-stage-pack.json` supplies fixed free/custom replacement maps for all 35 stages, `data/free-audio-manifest.json` supplies the current procedural replacement sound events, and `data/free-sprite-manifest.json` supplies the current procedural tank, bullet, terrain, base, explosion, panel, outline, and power-up sprites. Future sampled music/sound effects or richer sprite art should likewise be supplied as free/custom replacements rather than original ROM-derived assets. Public references used for rules cross-checking include:

- [StrategyWiki Battle City walkthrough](https://strategywiki.org/wiki/Battle_City/Walkthrough)
- [StrategyWiki Battle City gameplay](https://strategywiki.org/wiki/Battle_City/Gameplay)
