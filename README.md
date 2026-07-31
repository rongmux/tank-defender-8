# Tank Defender 8

**English** | [简体中文](README.zh-CN.md)

NES-style tank defense game built as a static Canvas app.

This repository does not include original NES ROM data, original sprites, or original audio. The built-in 35-stage layouts use a fixed, source-derived structural map dataset; map rendering, sprites, and audio use free or custom replacement resources. The built-in enemy composition uses the fixed 35-stage group order and counts transcribed from the public Battle City (J) disassembly, expanded to exactly 20 enemies per stage; the engine remains data-driven so gameplay rules, enemy sequences, and stage packs can be tuned without changing the core code.

The project is currently in a dedicated architecture-refactor phase. New 1:1 gameplay work is frozen while the remaining single-file runtime is split into explicit browser modules, pure rule modules, shared test infrastructure, unit suites, and feature integration suites. Core timing, randomness, geometry, and direction vectors are now modular; the configuration domain owns shared value validation, base session/life rules, projectile/friendly-fire rules, enemy AI and spawn pacing, enemy type/spec normalization, explosion timings/colors, player movement/cadence, player star-upgrade tiers, power-up durations/rules, stage flow/bonuses, fixed logic timings, and per-stage capacity/spawn settings; the stage domain owns map-grid rules, battlefield initialization/base-wall behavior, fixed built-in 35-stage map data, deterministic fallback map generation, built-in/imported pack composition, the public stage-pack schema, active-pack runtime lookups, stage routing, and the original-style enemy group/sequence model; the entity domain owns player lifecycle, enemy/projectile/power-up creation, and transient explosion/score-popup state; and the gameplay-rules domain now owns score/bonus-life progression, stage-result rows/leader/count timing, tank/bullet collision boundaries, opposing-projectile cancellation, projectile boundary/impact selection, fragment-accurate terrain overlap recovery, and directional brick-strip/steel-quarter wall damage. The no-build static launch path remains a hard compatibility requirement throughout the migration.

The presentation domain now owns the deeply frozen free replacement sprite manifest, both pixel-font glyph sets and alignment geometry, plus pure tank, transient-effect, battle-HUD, title-score, curtain, full GAME OVER, and HIGH SCORE visual timelines while Canvas sprite submission and pixel drawing remain runtime responsibilities.

The audio domain now owns the deeply frozen free replacement manifest, pure fixed-frame sound-state lifecycles, voice duration/note projection, per-voice audibility selection, cross-event channel-priority resolution, and player/enemy movement-loop phase/mode projection. Web Audio node creation, pause/resume side effects, and playback remain runtime responsibilities.

The editor domain now owns the original-style Construction tile palette and block-pattern sequence, D-pad/WASD direction aliases, full-cell cursor movement, panel hit testing, terrain cycling, exact 8px brick/steel quadrant mutation, versioned save documents, legacy 13x13 save compatibility, single-stage pack composition, and JSON codecs. Browser storage, clipboard/file access, messages, sound effects, and input listeners remain runtime responsibilities.

The runtime layer now owns shared mutable state, the browser-module dependency barrel, high-score/title/stage/editor lifecycle orchestration, Web Audio side effects, and the public debug adapter. Stage-pack diagnostics are isolated behind a pure projection module so `currentPackInfo()` and `debugSnapshot()` share one independently testable source for cloned configuration, routing, spawn, enemy-type, upgrade, and sequence data. Stage-result diagnostics bind the four public bonus, result-row, row-layout, and count-presentation probes to pure stage-result rules without retaining diagnostic-only helpers in the game composition root. Audio diagnostics now isolate all 31 manifest, presentation, channel-priority, pause, and lifecycle probes behind an explicit bound scope instead of the monolithic debug adapter. Stage-flow diagnostics isolate all 17 curtain, stage-cycle, stage-clear, automatic-advance, and game-over lifecycle probes behind the same receiver-preserving boundary. Screen-flow diagnostics isolate title scoring, frame counters, stage-select input cadence, title demo/hidden-message routing, high-score, and full-screen game-over probes. Enemy diagnostics isolate carrier behavior, target selection, AI/movement cadence, blocked recovery, spawn timelines, and spawn animation probes. The complete public debug snapshot is also a pure projection module, keeping its screen, timing, audio, pack, map/editor, and player records independently editable without exposing runtime state.

Effect diagnostics now isolate explosion rules, tank-destruction timelines, delayed enemy release, rendered destruction frames, and paused bullet-impact lifecycles behind the same explicit receiver-preserving boundary.

Wall diagnostics now isolate steel damage, directional brick strips, brick-fragment rendering, shovel-wall timing, and destroyed-base shovel behavior behind an explicit state/audio boundary.

Timer diagnostics now isolate global countdown cadence, shield visibility during pause, timer power-up freezing, the final frozen frame, and enemy spawning during a freeze behind the same explicit receiver-preserving boundary.

Power-up diagnostics now isolate type selection, shared random consumption, visibility and pause behavior, TTL and collection, pickup rendering and clearing, terrain effects, reachable spawn rotation, and carrier-triggered clearing behind an explicit state/audio boundary.

Upgrade diagnostics now isolate star-level rules, upgraded-tank overlay rendering, and level-three survivability behind the same explicit state/audio boundary.

Combat diagnostics now isolate helmet protection, player/enemy projectile collision, spawn locking, bullet limits and firing input, crossing cancellation, field boundaries, terrain-hit sounds, and friendly-fire behavior behind the same explicit state/audio boundary.

Terrain diagnostics now isolate terrain surfaces, base-wall priority, base destruction timing and rendering, tank occupancy, and enemy-overlap recovery behind the same explicit state/audio boundary.

Player-movement diagnostics now isolate fixed-loop cadence, tread animation, friendly-fire stun timing, WASD direction aliases, turn alignment, brick recovery, ice inertia, and ice/forest render layers behind the same explicit state/audio boundary.

Player-lifecycle diagnostics now isolate death/respawn timing, two-player Game Over messaging, message rendering, and bonus-life progression behind the same explicit state/audio boundary.

Pause diagnostics now isolate pause toggling, pause-safe stage completion, and pause-frame rendering behind the same explicit state/audio boundary.

Score diagnostics now isolate grenade scoring, spawn-protection behavior, score-popup creation, and paused score-popup lifecycle behind the same explicit state/audio boundary.

## Run

Open `index.html` in a browser, or serve the folder locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/index.html`.

## Verify

```powershell
node --check src/audio/audio-mix-rules.js
node --check src/audio/audio-presentation.js
node --check src/audio/fixed-frame-audio-state.js
node --check src/audio/free-audio-manifest.js
node --check src/core/battle-random.js
node --check src/core/directions.js
node --check src/core/frame-counter.js
node --check src/core/geometry.js
node --check src/editor/editor-rules.js
node --check src/editor/editor-stage-format.js
node --check src/entities/enemy-state.js
node --check src/entities/player-state.js
node --check src/entities/power-up-state.js
node --check src/entities/projectile-state.js
node --check src/entities/transient-effect-state.js
node --check src/presentation/battle-hud-presentation.js
node --check src/presentation/effect-presentation.js
node --check src/presentation/free-sprite-manifest.js
node --check src/presentation/pixel-font.js
node --check src/presentation/screen-presentation.js
node --check src/presentation/tank-presentation.js
node --check src/rules/enemy-ai-rules.js
node --check src/rules/enemy-spawn-rules.js
node --check src/rules/power-up-collection-rules.js
node --check src/rules/power-up-effect-rules.js
node --check src/rules/power-up-spawn-rules.js
node --check src/rules/projectile-collision-rules.js
node --check src/rules/projectile-impact-rules.js
node --check src/rules/score-rules.js
node --check src/rules/stage-result-rules.js
node --check src/rules/tank-collision-rules.js
node --check src/rules/terrain-collision-rules.js
node --check src/rules/wall-damage-rules.js
node --check src/config/value-normalization.js
node --check src/config/combat-settings.js
node --check src/config/enemy-ai-settings.js
node --check src/config/enemy-spawn-settings.js
node --check src/config/explosion-settings.js
node --check src/config/game-session-settings.js
node --check src/config/player-movement-settings.js
node --check src/config/power-up-settings.js
node --check src/config/timing-settings.js
node --check src/config/stage-flow-settings.js
node --check src/config/enemy-types.js
node --check src/config/player-upgrades.js
node --check src/config/stage-settings.js
node --check src/stages/battlefield-grid.js
node --check src/stages/built-in-stage-pack.js
node --check src/stages/enemy-sequences.js
node --check src/stages/original-stage-source.js
node --check src/stages/original-stage-data.js
node --check src/stages/procedural-stage.js
node --check src/stages/stage-grid.js
node --check src/stages/stage-pack.js
node --check src/stages/stage-pack-schema.js
node --check src/stages/stage-routing.js
node --check src/stages/stage-runtime.js
node --check src/runtime/shared-state.js
node --check src/runtime/editor-input-runtime.js
node --check src/runtime/stage-select-runtime.js
node --check src/runtime/post-game-runtime.js
node --check src/runtime/stage-flow-runtime.js
node --check src/runtime/battle-outcome-runtime.js
node --check src/runtime/battle-loop-runtime.js
node --check src/runtime/frame-loop-runtime.js
node --check src/runtime/screen-update-runtime.js
node --check src/runtime/title-render-runtime.js
node --check src/runtime/terrain-render-runtime.js
node --check src/runtime/tank-render-runtime.js
node --check src/runtime/tank-movement-runtime.js
node --check src/runtime/player-movement-runtime.js
node --check src/runtime/game-over-entry-runtime.js
node --check src/runtime/frame-counter-runtime.js
node --check src/runtime/power-up-render-runtime.js
node --check src/runtime/projectile-render-runtime.js
node --check src/runtime/effect-render-runtime.js
node --check src/runtime/stage-result-render-runtime.js
node --check src/runtime/battle-hud-render-runtime.js
node --check src/runtime/editor-render-runtime.js
node --check src/runtime/screen-transition-render-runtime.js
node --check src/runtime/text-render-runtime.js
node --check src/runtime/sprite-render-runtime.js
node --check src/runtime/battle-scene-render-runtime.js
node --check src/runtime/input-runtime.js
node --check src/runtime/screen-render-runtime.js
node --check src/runtime/transient-effects-runtime.js
node --check src/runtime/projectile-runtime.js
node --check src/runtime/battle-combat-runtime.js
node --check src/runtime/stage-result-runtime.js
node --check src/runtime/player-update-runtime.js
node --check src/runtime/battle-timing-runtime.js
node --check src/runtime/battle-random-runtime.js
node --check src/runtime/projectile-target-runtime.js
node --check src/runtime/projectile-resolution-runtime.js
node --check src/runtime/projectile-motion-runtime.js
node --check src/runtime/power-up-runtime.js
node --check src/runtime/enemy-spawn-runtime.js
node --check src/runtime/enemy-ai-runtime.js
node --check src/runtime/enemy-movement-runtime.js
node --check src/runtime/enemy-update-runtime.js
node --check src/runtime/audio-score-diagnostics.js
node --check src/runtime/audio-stage-bonus-diagnostics.js
node --check src/runtime/audio-movement-diagnostics.js
node --check src/runtime/audio-brick-hit-diagnostics.js
node --check src/runtime/audio-steel-hit-diagnostics.js
node --check src/runtime/audio-enemy-hit-diagnostics.js
node --check src/runtime/audio-diagnostics.js
node --check src/runtime/stage-pack-diagnostics.js
node --check src/runtime/stage-result-diagnostics.js
node --check src/runtime/pause-diagnostics.js
node --check src/runtime/stage-flow-diagnostics.js
node --check src/runtime/screen-flow-diagnostics.js
node --check src/runtime/wall-diagnostics.js
node --check src/runtime/enemy-diagnostics.js
node --check src/runtime/timer-diagnostics.js
node --check src/runtime/power-up-diagnostics.js
node --check src/runtime/score-diagnostics.js
node --check src/runtime/upgrade-diagnostics.js
node --check src/runtime/combat-diagnostics.js
node --check src/runtime/player-movement-diagnostics.js
node --check src/runtime/terrain-diagnostics.js
node --check src/runtime/player-lifecycle-diagnostics.js
node --check src/runtime/effect-diagnostics.js
node --check src/runtime/panel-diagnostics.js
node --check src/runtime/public-api-adapters.js
node --check src/runtime/debug-snapshot.js
node --check src/runtime/module-deps.js
node --check src/runtime/game-lifecycle.js
node --check src/runtime/audio-bridge.js
node --check src/runtime/application-flow-composition-runtime.js
node --check src/runtime/input-composition-runtime.js
node --check src/runtime/legacy-api-composition-runtime.js
node --check src/runtime/render-pipeline-composition-runtime.js
node --check src/runtime/debug-api.js
node --check src/runtime/debug-battle-runtime.js
node --check src/runtime/render-adapter-runtime.js
node --check src/runtime/battle-composition-runtime.js
node --check src/runtime/render-composition-runtime.js
node --check src/runtime/legacy-api-runtime.js
node --check src/game.js
node --check tests/helpers/test-file-discovery.js
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
|   |-- audio/
|   |   |-- audio-mix-rules.js
|   |   |-- audio-presentation.js
|   |   |-- fixed-frame-audio-state.js
|   |   `-- free-audio-manifest.js
|   |-- config/
|   |   |-- combat-settings.js
|   |   |-- enemy-ai-settings.js
|   |   |-- enemy-spawn-settings.js
|   |   |-- enemy-types.js
|   |   |-- explosion-settings.js
|   |   |-- game-session-settings.js
|   |   |-- player-movement-settings.js
|   |   |-- player-upgrades.js
|   |   |-- power-up-settings.js
|   |   |-- stage-flow-settings.js
|   |   |-- stage-settings.js
|   |   |-- timing-settings.js
|   |   `-- value-normalization.js
|   |-- core/
|   |   |-- battle-random.js
|   |   |-- directions.js
|   |   |-- frame-counter.js
|   |   `-- geometry.js
|   |-- editor/
|   |   |-- editor-rules.js
|   |   `-- editor-stage-format.js
|   |-- entities/
|   |   |-- enemy-state.js
|   |   |-- player-state.js
|   |   |-- power-up-state.js
|   |   |-- projectile-state.js
|   |   `-- transient-effect-state.js
|   |-- presentation/
|   |   |-- battle-hud-presentation.js
|   |   |-- effect-presentation.js
|   |   |-- free-sprite-manifest.js
|   |   |-- pixel-font.js
|   |   |-- screen-presentation.js
|   |   `-- tank-presentation.js
|   |-- rules/
|   |   |-- enemy-ai-rules.js
|   |   |-- enemy-spawn-rules.js
|   |   |-- power-up-collection-rules.js
|   |   |-- power-up-effect-rules.js
|   |   |-- power-up-spawn-rules.js
|   |   |-- projectile-collision-rules.js
|   |   |-- projectile-impact-rules.js
|   |   |-- score-rules.js
|   |   |-- stage-result-rules.js
|   |   |-- tank-collision-rules.js
|   |   |-- terrain-collision-rules.js
|   |   `-- wall-damage-rules.js
|   |-- stages/
|   |   |-- battlefield-grid.js
|   |   |-- built-in-stage-pack.js
|   |   |-- enemy-sequences.js
|   |   |-- original-stage-source.js
|   |   |-- original-stage-data.js
|   |   |-- procedural-stage.js
|   |   |-- stage-grid.js
|   |   |-- stage-pack.js
|   |   |-- stage-pack-schema.js
|   |   |-- stage-routing.js
|   |   `-- stage-runtime.js
|   |-- runtime/
|   |   |-- shared-state.js
|   |   |-- editor-input-runtime.js
|   |   |-- stage-select-runtime.js
|   |   |-- post-game-runtime.js
|   |   |-- stage-flow-runtime.js
|   |   |-- battle-outcome-runtime.js
|   |   |-- battle-loop-runtime.js
|   |   |-- frame-loop-runtime.js
|   |   |-- screen-update-runtime.js
|   |   |-- title-render-runtime.js
|   |   |-- terrain-render-runtime.js
|   |   |-- tank-render-runtime.js
|   |   |-- tank-movement-runtime.js
|   |   |-- player-movement-runtime.js
|   |   |-- game-over-entry-runtime.js
|   |   |-- frame-counter-runtime.js
|   |   |-- power-up-render-runtime.js
|   |   |-- projectile-render-runtime.js
|   |   |-- effect-render-runtime.js
|   |   |-- stage-result-render-runtime.js
|   |   |-- battle-hud-render-runtime.js
|   |   |-- editor-render-runtime.js
|   |   |-- screen-transition-render-runtime.js
|   |   |-- text-render-runtime.js
|   |   |-- sprite-render-runtime.js
|   |   |-- battle-scene-render-runtime.js
|   |   |-- input-runtime.js
|   |   |-- screen-render-runtime.js
|   |   |-- transient-effects-runtime.js
|   |   |-- projectile-runtime.js
|   |   |-- battle-combat-runtime.js
|   |   |-- battle-composition-runtime.js
|   |   |-- stage-result-runtime.js
|   |   |-- player-update-runtime.js
|   |   |-- battle-timing-runtime.js
|   |   |-- battle-random-runtime.js
|   |   |-- projectile-target-runtime.js
|   |   |-- projectile-resolution-runtime.js
|   |   |-- projectile-motion-runtime.js
|   |   |-- power-up-runtime.js
|   |   |-- enemy-spawn-runtime.js
|   |   |-- enemy-ai-runtime.js
|   |   |-- enemy-movement-runtime.js
|   |   |-- enemy-update-runtime.js
|   |   |-- audio-score-diagnostics.js
|   |   |-- audio-stage-bonus-diagnostics.js
|   |   |-- audio-movement-diagnostics.js
|   |   |-- audio-brick-hit-diagnostics.js
|   |   |-- audio-steel-hit-diagnostics.js
|   |   |-- audio-enemy-hit-diagnostics.js
|   |   |-- audio-diagnostics.js
|   |   |-- stage-pack-diagnostics.js
|   |   |-- stage-result-diagnostics.js
|   |   |-- pause-diagnostics.js
|   |   |-- stage-flow-diagnostics.js
|   |   |-- screen-flow-diagnostics.js
|   |   |-- wall-diagnostics.js
|   |   |-- enemy-diagnostics.js
|   |   |-- timer-diagnostics.js
|   |   |-- power-up-diagnostics.js
|   |   |-- score-diagnostics.js
|   |   |-- upgrade-diagnostics.js
|   |   |-- combat-diagnostics.js
|   |   |-- player-movement-diagnostics.js
|   |   |-- terrain-diagnostics.js
|   |   |-- player-lifecycle-diagnostics.js
|   |   |-- effect-diagnostics.js
|   |   |-- panel-diagnostics.js
|   |   |-- public-api-adapters.js
|   |   |-- debug-snapshot.js
|   |   |-- module-deps.js
|   |   |-- game-lifecycle.js
|   |   |-- audio-bridge.js
|   |   |-- application-flow-composition-runtime.js
|   |   |-- input-composition-runtime.js
|   |   |-- legacy-api-composition-runtime.js
|   |   |-- render-pipeline-composition-runtime.js
|   |   |-- debug-battle-runtime.js
|   |   |-- debug-api.js
|   |   |-- render-adapter-runtime.js
|   |   |-- render-composition-runtime.js
|   |   `-- legacy-api-runtime.js
|   `-- game.js
|-- tests/
|   |-- helpers/
|   |   |-- browser-game-harness.js
|   |   |-- load-browser-scripts.js
|   |   `-- test-file-discovery.js
|   |-- integration/
|   |   |-- app-bootstrap.test.js
|   |   |-- application-flow-composition-runtime.test.js
|   |   |-- input-composition-runtime.test.js
|   |   |-- legacy-api-composition-runtime.test.js
|   |   |-- render-pipeline-composition-runtime.test.js
|   |   |-- audio-diagnostics.test.js
|   |   |-- audio-mix-rules.test.js
|   |   |-- audio-presentation.test.js
|   |   |-- battle-hud-presentation.test.js
|   |   |-- battlefield-grid.test.js
|   |   |-- built-in-stage-pack.test.js
|   |   |-- collision.test.js
|   |   |-- combat-settings.test.js
|   |   |-- debug-snapshot.test.js
|   |   |-- editor-rules.test.js
|   |   |-- editor-stage-format.test.js
|   |   |-- effect-diagnostics.test.js
|   |   |-- panel-diagnostics.test.js
|   |   |-- public-api-adapters.test.js
|   |   |-- debug-battle-runtime.test.js
|   |   |-- render-adapter-runtime.test.js
|   |   |-- battle-composition-runtime.test.js
|   |   |-- legacy-api-runtime.test.js
|   |   |-- effect-presentation.test.js
|   |   |-- enemy-diagnostics.test.js
|   |   |-- enemy-ai-rules.test.js
|   |   |-- enemy-ai-settings.test.js
|   |   |-- enemy-sequences.test.js
|   |   |-- enemy-spawn-settings.test.js
|   |   |-- enemy-spawn-rules.test.js
|   |   |-- enemy-state.test.js
|   |   |-- enemy-types.test.js
|   |   |-- explosion-settings.test.js
|   |   |-- fixed-frame-audio-state.test.js
|   |   |-- frame-counter.test.js
|   |   |-- free-audio-manifest.test.js
|   |   |-- free-sprite-manifest.test.js
|   |   |-- game-session-settings.test.js
|   |   |-- pixel-font.test.js
|   |   |-- player-movement-settings.test.js
|   |   |-- player-state.test.js
|   |   |-- player-upgrades.test.js
|   |   |-- projectile-collision-rules.test.js
|   |   |-- projectile-impact-rules.test.js
|   |   |-- projectile-state.test.js
|   |   |-- power-up-state.test.js
|   |   |-- power-up-settings.test.js
|   |   |-- power-up-collection-rules.test.js
|   |   |-- power-up-diagnostics.test.js
|   |   |-- score-diagnostics.test.js
|   |   |-- upgrade-diagnostics.test.js
|   |   |-- combat-diagnostics.test.js
|   |   |-- player-movement-diagnostics.test.js
|   |   |-- terrain-diagnostics.test.js
|   |   |-- player-lifecycle-diagnostics.test.js
|   |   |-- pause-diagnostics.test.js
|   |   |-- power-up-effect-rules.test.js
|   |   |-- power-up-spawn-rules.test.js
|   |   |-- procedural-stage.test.js
|   |   |-- score-rules.test.js
|   |   |-- screen-flow-diagnostics.test.js
|   |   |-- screen-presentation.test.js
|   |   |-- stage-flow-diagnostics.test.js
|   |   |-- stage-flow-settings.test.js
|   |   |-- stage-settings.test.js
|   |   |-- stage-grid.test.js
|   |   |-- stage-pack.test.js
|   |   |-- stage-pack-diagnostics.test.js
|   |   |-- stage-pack-schema.test.js
|   |   |-- stage-result-diagnostics.test.js
|   |   |-- stage-result-rules.test.js
|   |   |-- stage-routing.test.js
|   |   |-- stage-runtime.test.js
|   |   |-- tank-collision-rules.test.js
|   |   |-- tank-presentation.test.js
|   |   |-- terrain-collision-rules.test.js
|   |   |-- timer-diagnostics.test.js
|   |   |-- timing-settings.test.js
|   |   |-- transient-effect-state.test.js
|   |   |-- wall-damage-rules.test.js
|   |   `-- wall-diagnostics.test.js
|   |-- unit/
|   |   |-- audio-bridge.test.js
|   |   |-- application-flow-composition-runtime.test.js
|   |   |-- input-composition-runtime.test.js
|   |   |-- legacy-api-composition-runtime.test.js
|   |   |-- render-pipeline-composition-runtime.test.js
|   |   |-- audio-diagnostics.test.js
|   |   |-- audio-mix-rules.test.js
|   |   |-- audio-presentation.test.js
|   |   |-- audio-score-diagnostics.test.js
|   |   |-- audio-stage-bonus-diagnostics.test.js
|   |   |-- audio-movement-diagnostics.test.js
|   |   |-- audio-brick-hit-diagnostics.test.js
|   |   |-- audio-steel-hit-diagnostics.test.js
|   |   |-- audio-enemy-hit-diagnostics.test.js
|   |   |-- battle-hud-presentation.test.js
|   |   |-- battle-random.test.js
|   |   |-- battlefield-grid.test.js
|   |   |-- browser-entry.test.js
|   |   |-- built-in-stage-pack.test.js
|   |   |-- original-stage-data.test.js
|   |   |-- combat-settings.test.js
|   |   |-- debug-snapshot.test.js
|   |   |-- directions.test.js
|   |   |-- editor-rules.test.js
|   |   |-- editor-input-runtime.test.js
|   |   |-- stage-select-runtime.test.js
|   |   |-- post-game-runtime.test.js
|   |   |-- stage-flow-runtime.test.js
|   |   |-- battle-outcome-runtime.test.js
|   |   |-- battle-loop-runtime.test.js
|   |   |-- frame-loop-runtime.test.js
|   |   |-- screen-update-runtime.test.js
|   |   |-- title-render-runtime.test.js
|   |   |-- terrain-render-runtime.test.js
|   |   |-- tank-render-runtime.test.js
|   |   |-- editor-stage-format.test.js
|   |   |-- power-up-render-runtime.test.js
|   |   |-- projectile-render-runtime.test.js
|   |   |-- effect-render-runtime.test.js
|   |   |-- stage-result-render-runtime.test.js
|   |   |-- battle-hud-render-runtime.test.js
|   |   |-- editor-render-runtime.test.js
|   |   |-- screen-transition-render-runtime.test.js
|   |   |-- text-render-runtime.test.js
|   |   |-- sprite-render-runtime.test.js
|   |   |-- battle-scene-render-runtime.test.js
|   |   |-- input-runtime.test.js
|   |   |-- screen-render-runtime.test.js
|   |   |-- render-composition-runtime.test.js
|   |   |-- debug-battle-runtime.test.js
|   |   |-- render-adapter-runtime.test.js
|   |   |-- battle-composition-runtime.test.js
|   |   |-- legacy-api-runtime.test.js
|   |   |-- game-over-entry-runtime.test.js
|   |   |-- frame-counter-runtime.test.js
|   |   |-- effect-diagnostics.test.js
|   |   |-- panel-diagnostics.test.js
|   |   |-- public-api-adapters.test.js
|   |   |-- effect-presentation.test.js
|   |   |-- enemy-diagnostics.test.js
|   |   |-- enemy-ai-rules.test.js
|   |   |-- enemy-ai-settings.test.js
|   |   |-- enemy-sequences.test.js
|   |   |-- enemy-spawn-settings.test.js
|   |   |-- enemy-spawn-rules.test.js
|   |   |-- enemy-state.test.js
|   |   |-- enemy-spawn-runtime.test.js
|   |   |-- enemy-ai-runtime.test.js
|   |   |-- enemy-movement-runtime.test.js
|   |   |-- enemy-update-runtime.test.js
|   |   |-- enemy-types.test.js
|   |   |-- explosion-settings.test.js
|   |   |-- fixed-frame-audio-state.test.js
|   |   |-- frame-counter.test.js
|   |   |-- free-audio-manifest.test.js
|   |   |-- free-sprite-manifest.test.js
|   |   |-- game-session-settings.test.js
|   |   |-- game-audio-aliases.test.js
|   |   |-- geometry.test.js
|   |   |-- pixel-font.test.js
|   |   |-- player-movement-settings.test.js
|   |   |-- player-state.test.js
|   |   |-- player-upgrades.test.js
|   |   |-- projectile-collision-rules.test.js
|   |   |-- projectile-impact-rules.test.js
|   |   |-- projectile-state.test.js
|   |   |-- projectile-runtime.test.js
|   |   |-- battle-combat-runtime.test.js
|   |   |-- stage-result-runtime.test.js
|   |   |-- player-update-runtime.test.js
|   |   |-- battle-timing-runtime.test.js
|   |   |-- battle-random-runtime.test.js
|   |   |-- projectile-target-runtime.test.js
|   |   |-- projectile-resolution-runtime.test.js
|   |   |-- projectile-motion-runtime.test.js
|   |   |-- power-up-state.test.js
|   |   |-- power-up-runtime.test.js
|   |   |-- power-up-settings.test.js
|   |   |-- power-up-collection-rules.test.js
|   |   |-- power-up-diagnostics.test.js
|   |   |-- score-diagnostics.test.js
|   |   |-- upgrade-diagnostics.test.js
|   |   |-- combat-diagnostics.test.js
|   |   |-- player-movement-diagnostics.test.js
|   |   |-- terrain-diagnostics.test.js
|   |   |-- player-lifecycle-diagnostics.test.js
|   |   |-- pause-diagnostics.test.js
|   |   |-- power-up-effect-rules.test.js
|   |   |-- power-up-spawn-rules.test.js
|   |   |-- procedural-stage.test.js
|   |   |-- readme-tree.test.js
|   |   |-- score-rules.test.js
|   |   |-- screen-flow-diagnostics.test.js
|   |   |-- screen-presentation.test.js
|   |   |-- stage-flow-diagnostics.test.js
|   |   |-- stage-flow-settings.test.js
|   |   |-- stage-settings.test.js
|   |   |-- stage-grid.test.js
|   |   |-- stage-pack.test.js
|   |   |-- stage-pack-diagnostics.test.js
|   |   |-- stage-pack-schema.test.js
|   |   |-- stage-result-diagnostics.test.js
|   |   |-- stage-result-rules.test.js
|   |   |-- stage-routing.test.js
|   |   |-- stage-runtime.test.js
|   |   |-- tank-collision-rules.test.js
|   |   |-- tank-movement-runtime.test.js
|   |   |-- player-movement-runtime.test.js
|   |   |-- tank-presentation.test.js
|   |   |-- terrain-collision-rules.test.js
|   |   |-- test-file-discovery.test.js
|   |   |-- timer-diagnostics.test.js
|   |   |-- timing-settings.test.js
|   |   |-- transient-effect-state.test.js
|   |   |-- transient-effects-runtime.test.js
|   |   |-- value-normalization.test.js
|   |   |-- wall-damage-rules.test.js
|   |   `-- wall-diagnostics.test.js
|   `-- run-tests.js
|-- tools/
|   |-- build-free-stage-pack.js
|   `-- dev-server.js
|-- index.html
|-- styles.css
|-- reasonix.toml
|-- README.md
`-- README.zh-CN.md
```

`src/stages/original-stage-source.js` stores the exact 35-stage, 13x13 block-ID rows decoded from the public Battle City (J) disassembly files `incbin/stages/stage_01.bin` through `stage_35.bin`. `src/stages/original-stage-data.js` decodes the original IDs using the NES block table (`0x0-0x4` brick shapes, `0x5-0x9` steel shapes, `0xA-0xD` water/forest/ice/empty), then applies the fixed five-cell base enclosure used by the runtime and reconstructs partial brick fragments and steel quadrants. `procedural-stage.js` remains the deterministic fallback for custom packs that omit map data.

`src/stages/enemy-sequences.js` stores the fixed 35-stage enemy group table transcribed from the public Battle City (J) disassembly (`tbl_E4EC_stage_enemies` plus `tbl_E578_stage_enemies_type_counter`). Each `[count, typeIndex]` group is expanded in source order, while carrier slots and spawn-point rotation retain the original runtime behavior. The built-in sequences contain exactly 20 enemies per stage.

`src/config/` owns data validation shared by stage-pack configuration: `value-normalization.js` validates numeric ranges and colors; `game-session-settings.js` owns initial lives, sorted bonus-life thresholds, death power level, and the timer enemy-freeze switch; `combat-settings.js` owns projectile size/spawn/bounds geometry plus two-player friendly-fire activation and stun timing; `enemy-ai-settings.js` owns intersection routing, blocked retries, target-axis probability, and the legacy AI field aliases; `enemy-spawn-settings.js` owns per-stage spawn curves, stage/extended-loop floors, two-player reduction, legacy multiplier compatibility, and pure delay calculations; `enemy-types.js` owns the four default enemy definitions, movement/projectile tiers, power-up type names, enemy-type cloning and validation, and per-stage enemy-spec normalization; `explosion-settings.js` owns the nine nested explosion TTL/color defaults, deep cloning, and pack override validation; `player-movement-settings.js` owns fixed-loop movement speed, the original three-of-four cadence, legacy speed-only compatibility, ice inertia, and independent configuration cloning; `player-upgrades.js` owns the four star-upgrade levels, independent cloning, and pack override validation; `power-up-settings.js` owns helmet/shovel/timer durations, carrier release and clearing rules, pickup scoring, and their validation; `stage-flow-settings.js` owns final-stage looping, extended-loop map/enemy selection, and two-player stage-clear leader bonuses; `timing-settings.js` owns the fixed-logic-loop stage, spawn, respawn, retry, invulnerability, and power-up lifetime timings; and `stage-settings.js` owns active-enemy capacities, default player/enemy/power-up spawn layouts, strict 13x13 coordinate validation, and tile-to-pixel conversion. `src/core/` contains pure browser-and-Node-compatible rules with no DOM or Canvas dependency; shared battle randomness, four-direction constants/vectors, independent frame counters, and rectangle geometry live there. `src/editor/` owns Construction input/terrain rules plus versioned save documents, legacy save parsing, single-stage pack composition, and JSON codecs without browser storage or file APIs. `src/entities/` owns mutable gameplay records: `player-state.js` creates complete one/two-player records and resets transient position, destruction, protection, firing, sliding, and track state without discarding persistent score, life, kill, or upgrade state; `enemy-state.js` materializes type/spec data into a placed enemy with independent armor colors, spawn/reload timers, carrier data, movement cadence flags, and clean AI/destruction state; `projectile-state.js` creates the common player/enemy projectile record from tank geometry, direction, upgrade/type combat values, and stage-pack projectile geometry; `power-up-state.js` creates a collectible 12px power-up with its validated field position and configured lifetime after runtime random/terrain filtering; and `transient-effect-state.js` creates explosion and score-popup records and advances their shared TTL lifecycle while preserving surviving identities. `src/rules/score-rules.js` mutates player score and reserve-life progress while returning the values needed by runtime-owned high-score persistence and audio side effects; `stage-result-rules.js` selects bonus recipients, builds per-type result rows/summaries, and computes the original count/reveal timeline; `tank-collision-rules.js` owns entity rectangles, the exact bullet-center hit range, active collision-peer filtering, total overlap, field/base blocking, and strictly decreasing terrain/tank overlap recovery; `terrain-collision-rules.js` owns 16px tile, 8px steel-quarter, and 4px brick-fragment geometry, overlap masks, and exact solid terrain area. `src/stages/` owns the stage domain: `stage-grid.js` provides tile constants, brick-fragment state, grid mutation, validation, and 13x13/26x26 codecs; `enemy-sequences.js` owns the 35-stage enemy group table, 20-enemy expansion, carrier positions, spawn-point rotation, and sequence summaries; `stage-pack.js` composes all configuration validators, enforces complete map/enemy/stage counts, supports both map encodings, and builds runtime grid/enemy lookup helpers; and `stage-routing.js` resolves the displayed 1-70 cycle onto finite map/enemy datasets, enemy totals, and one/two-player capacity limits. `src/game.js` remains the composition root and legacy runtime, and must shrink as behavior moves behind explicit module APIs. `tests/helpers/` owns reusable Canvas, audio, DOM, storage, input, and script-loading fakes. `tests/unit/` exercises pure modules directly, `tests/integration/` verifies extracted configuration, base session rules, score/bonus-life and stage-result progression, fixed logic timings, fragment-accurate terrain/tank/bullet collision and recovery, projectile/friendly-fire rules, projectile, enemy, power-up, and transient visual-effect creation/lifecycle, editor save/load/export/import/test-stage workflows, enemy AI, enemy spawn pacing, explosion settings, player movement/cadence, player state/respawn, power-up settings, stage flow, stage settings, stage-grid, stage-pack import, stage routing, enemy-sequence, and star-upgrade behavior through the real browser API, and `tests/run-tests.js` runs every unit and integration test in isolated Node processes.

`src/config/power-up-settings.js` now owns the pure carrier transitions behind its validated settings: whether a hit releases a carried power-up and whether a newly spawning carrier clears the current uncollected power-up. Runtime code retains only the actual spawn and clear side effects.

`src/entities/enemy-state.js` now owns both complete enemy-record creation and destruction-state advancement. Eligible ticks normalize the counter, preserve the configured explosion phase, hold the fixed score for six more ticks, and release the enemy slot only at the exact boundary; `src/game.js` supplies slot cadence and the fallback explosion duration, then increments the global defeated-enemy count when release is reported.

`src/entities/player-state.js` now owns complete player-record creation, stage/respawn reset, and the retained death lifecycle. It rejects hits against inactive, already-destroying, or protected players; initializes death power/timers and clears transient combat state; advances respawn ticks only on eligible movement frames; and resolves the final life into either immediate respawn setup or elimination. Runtime code retains audio, spawn-position restoration, protection activation, and the per-player GAME OVER message.

`src/audio/audio-presentation.js` owns fixed-frame voice duration and note projection, scalar or per-voice audibility selection, and manifest-driven player/enemy movement-loop phases. Thin runtime adapters inject the selected manifest event, while `src/game.js` retains Web Audio buffer/oscillator creation, pause/resume behavior, and all playback side effects. Direct unit coverage locks malformed inputs, segment/repeat boundaries, silent notes, gains, and movement phases; browser integration retains representative score-count, movement-phase, ice-cue, and stage-start probes formerly held by the smoke suite.

`src/audio/audio-mix-rules.js` owns the pure pulse-one, pulse-two, triangle, and noise channel-priority matrix plus movement-loop mode selection. It distinguishes an actively paused game from a still-playing pause cue, preserves independent channels, and keeps player movement-request detection lazy so blocked states cannot alter runtime work or demo behavior. `src/game.js` supplies the current event flags and performs node synchronization. Direct unit coverage locks the full priority matrix, while browser integration centralizes the cross-channel probes formerly scattered through the smoke suite.

`src/audio/fixed-frame-audio-state.js` owns creation, begin/reset transitions, pause-hold selection, fixed-frame advancement, and exact end-frame clamping for all retained sound events. Runtime-owned Web Audio node handles remain opaque entries on each state and are stopped or recreated only by `src/game.js`. Direct unit coverage locks independent state records, retained node ownership, pause modes, invalid-duration fallback, and completion boundaries; browser integration centralizes one-frame, paused, pause-running, retrigger, cleanup, and final-frame lifecycle probes formerly held by the smoke suite.

`src/audio/free-audio-manifest.js` owns the deeply frozen browser module copy of `data/free-audio-manifest.json` and the independent deep-clone API consumed by the runtime. Unit coverage compares every event against the JSON source, locks all retained durations/channel layouts and intentional silent enemy shooting, and proves nested clone isolation. Browser integration verifies module registration and confirms each public runtime clone remains equal to the JSON source without exposing the frozen internal object.

`src/editor/editor-rules.js` owns the six-terrain browser palette, the 14-step original Construction block sequence, Arrow/WASD direction mapping and hold priority, full-cell cursor clamping, panel swatch hit testing, tile cycling, cursor-to-cell conversion, and exact brick-fragment/steel-quarter edits. `src/editor/editor-stage-format.js` owns compact version-2 local-save serialization, compatible loading of the legacy 13x13 `rows` format and current 26x26 `quadrants` format, reusable JSON parse results, default one-stage export/test pack composition, and pretty export serialization. `src/game.js` now retains only editor screen state, local-storage/clipboard/file side effects, messages, sounds, and event wiring. Unit coverage locks both save encodings, malformed JSON versus structurally invalid saves, independent default pack records, spawn coordinates, enemy composition, and serialized output; browser integration owns the complete save, clear, load, export, file import, constructed-stage install, immediate test, and reset workflow formerly held by smoke.

`src/runtime/editor-input-runtime.js` owns the fixed-frame Construction input orchestration: cursor movement, original A/B pattern cycling, full-cell and quadrant painting, brush selection, tile cycling, and held-direction repeat. It keeps mutations and sounds as explicit callbacks while `src/game.js` retains Canvas coordinate conversion and DOM event wiring; direct tests cover the original pattern masks, boundary-safe edits, brush selection, and 20-frame repeat cadence.

`src/runtime/input-runtime.js` owns browser input routing: toolbar actions, keyboard screen dispatch, one-shot fire/stage-selection presses, pause audio handoff, stage-pack file import, and Construction mouse editing. It preserves the Arrow/WASD mappings, demo escape path, hidden-message input reservation, editor shortcuts, coordinate conversion, and pause gating while `src/game.js` supplies only explicit callbacks; direct tests lock registration, action dispatch, pause synchronization order, keyboard routing, and mouse coordinates.

`src/runtime/stage-select-runtime.js` owns the fixed-frame stage-selection A/B input cadence: one-shot presses are consumed before held-key repeats, repeats occur on the original eight-frame boundary, and A retains priority when both buttons arrive together. The stage mapping and screen transition remain explicit callbacks from `src/game.js`.

`src/runtime/post-game-runtime.js` owns the fixed-frame full GAME OVER and high-score screen lifecycle: audio handoff, timed completion, Start/Escape skip behavior, high-score branching, and title-state reset. The existing score comparison and stage-result transition remain outside it and are supplied through explicit callbacks.

`src/runtime/stage-flow-runtime.js` owns stage-result screen transitions: entering clear/game-over results, selecting the next-stage or stop route, closing the stage curtain, launching the next stage, and computing the in-field GAME OVER duration. `src/runtime/stage-result-runtime.js` remains responsible for result projections and bonus side effects; audio cleanup and lifecycle entry points are explicit callbacks.

`src/runtime/battle-outcome-runtime.js` owns the fixed-frame battle end predicate: demo termination, base/player GAME OVER triggers, enemy-clear delay, player GAME OVER extension, frame-counter reset, and entry into the stage-clear transition. It leaves actual screen transitions as callbacks into `stage-flow-runtime` and keeps the original 60 Hz boundary behavior testable in isolation.

`src/runtime/battle-loop-runtime.js` owns the fixed-frame battle update order: freeze and entity timers, player/enemy updates, terrain effects, projectiles, score popups, power-ups, player GAME OVER messaging, enemy spawning, end checks, and movement-audio synchronization. Post-game field frames use the same API with input and end-check options disabled.

`src/runtime/frame-loop-runtime.js` owns the fixed 60 Hz accumulator, per-RAF rendering, and the 80ms long-gap clamp. A render callback still runs on every browser frame, while logic updates advance only in fixed steps so high-refresh displays cannot change gameplay timing; direct tests cover half-step cadence, catch-up, and long-gap bounds.

`src/runtime/screen-update-runtime.js` owns the fixed-frame dispatch for title, hidden-message, high-score, full GAME OVER, stage selection, editor, stage intro/clear, pause, and post-game battle frames. It preserves the original branch order and injects audio, transition, result, and battle side effects through explicit callbacks; its unit suite covers transition boundaries, stage-result counting, Game Over, editor, pause, and active battle routing.

`src/runtime/title-render-runtime.js` owns pixel Canvas rendering for the title menu, hidden message, high-score screen, and full GAME OVER screen. It preserves the existing pixel-font geometry, title-menu cursor, palette, drop sprite, and terminal-screen timelines while receiving text/sprite submission through explicit callbacks; direct tests cover screen backgrounds, score/menu layout, hidden-message content, and terminal presentation calls.

`src/runtime/terrain-render-runtime.js` owns battlefield terrain layers, brick fragments, steel quarters, water/ice/forest tiles, the eagle base, and the ice projectile cover. It preserves the original draw order, 4px fragment geometry, 8px quarter masks, water phase, and base palette while using the shared sprite-submission callback; direct tests cover layer selection, terrain animation, exact cover coordinates, backdrop geometry, and base state.

`src/runtime/tank-render-runtime.js` owns tank body/tracks, player star-upgrade overlays, shield rendering, and player/enemy spawn animation. It preserves directional geometry, carrier/upgrade color callbacks, pause-safe shield phase, configured spawn durations, and the existing Canvas sprite order; direct tests cover player overlays, exact field offsets, shield colors, and player spawn sizing.

`src/runtime/power-up-render-runtime.js` owns power-up visibility cadence, sprite-size centering, framed background drawing, and manifest icon submission for all six power-up types, including the star icon. It keeps display timing based on the independent frame phase used during pause and preserves the existing 12px-to-manifest-size geometry; direct tests cover blink boundaries, exact centering, icon palette, and hidden frames.

`src/runtime/projectile-render-runtime.js` owns bullet sprite submission: manifest-size scaling, battlefield offset, and the distinct player/enemy bullet palettes. It leaves movement, limits, collision, and impact resolution in their existing gameplay modules; direct tests cover scaled player bullets, native-size enemy bullets, and exact integer placement.

`src/runtime/effect-render-runtime.js` owns Canvas rendering for transient explosions, player/enemy destruction sequences, base destruction, and score popups. It keeps the existing presentation projections, configured explosion colors, destruction frame order, and battlefield offsets while receiving sprite/text submission through explicit callbacks; direct tests cover render order, score-state text, destruction palettes, and registration.

`src/runtime/stage-result-render-runtime.js` owns the stage-clear result screen: score headers, one/two-player result rows, centered tank icons, directional arrows, bonus rows, totals, score formatting, and the closing curtain. It preserves the original 256x240 integer geometry and exposes the result helpers through the compatibility API; direct tests lock the two-player row positions and prevent the center tank/arrow overlap regression.

`src/runtime/battle-hud-render-runtime.js` owns the in-battle side panel, pause label, field GAME OVER banner, player GAME OVER message, and their layout helpers. It preserves the fixed pixel-font geometry, enemy counter/life count projection, pause blink phase, and compact two-player GAME OVER glyphs; direct tests cover panel coordinates, banner timing callbacks, pause visibility, and flag geometry.

`src/runtime/editor-render-runtime.js` owns Construction battlefield rendering: the editable terrain layers, base, blinking cursor tank, and six-tile legend. It preserves the original 256x240 field geometry, 16px tile placement, 16-frame cursor blink, tile masks, and brush highlight while receiving terrain operations through explicit callbacks; direct tests cover fallback-grid creation, cursor visibility, legend coordinates, and each tile renderer.

`src/runtime/screen-transition-render-runtime.js` owns stage-selection rendering, the stage-select closing curtain, stage-intro battlefield/curtain rendering, and curtain state adapters. It preserves the original 256x240 integer geometry, top/bottom cover rows, stage label clipping, configured intro duration, and transition timer source; direct tests cover selection text, closing fill order, intro clipping, and state options.

`src/runtime/text-render-runtime.js` owns the shared integer pixel-font submission path for normal, clipped, and right-aligned text. It preserves uppercase glyph lookup, rounded integer origins, scale/advance defaults, clip intersection, and right-edge alignment; direct tests cover exact glyph rectangles, clipping, empty clips, and right-aligned call flow.

`src/runtime/sprite-render-runtime.js` owns free sprite-manifest frame lookup plus native and scaled Canvas rectangle submission. It also owns the shared `miniTank/up` result/title sprite composition, including its fixed shadow palette, so the composition root no longer duplicates that primitive. It preserves role-first palette fallback, part colors, fill/stroke operations, and fractional scaling geometry; direct tests cover native frames, scaled frames, mini-tank composition, fallback colors, missing frames, and registration.

`src/runtime/battle-scene-render-runtime.js` owns the active-battle Canvas composition order: background, field, terrain, base, players, enemies, bullets, projectile cover, top terrain, power-up, explosions, destruction overlays, score popups, player GAME OVER text, and side panel. It preserves spawn/death filtering, paused shield visibility, display-frame reads, and every occlusion boundary; direct tests lock the complete callback sequence.

`src/runtime/screen-render-runtime.js` owns the top-level Canvas screen route: black clearing, title/hidden/high-score/full GAME OVER, stage selection, Construction, intro/result screens, active battle, and the final GAME OVER/pause overlay order. It leaves each screen's drawing details in its specialized renderer and directly tests every route plus the game-over/pause composition.

`src/stages/battlefield-grid.js` centralizes the battlefield geometry shared by procedural generation, Construction, stage startup, and the shovel power-up. It freezes the five wall cells, eagle cell, and six standard cleanup rectangles; preserves the wider procedural reserved region; initializes the blank Construction field; leaves custom spawn-area edits intact while opening the eagle cell; and selects brick/steel during the configured shovel flash window. Direct unit coverage locks every coordinate and mutation boundary, while browser integration verifies the real editor enclosure and owns the shovel-wall assertions formerly held by smoke.

`src/stages/built-in-stage-pack.js` composes an independent mutable runtime pack from the shared normalized defaults, cloned enemy definitions, the 35 original-style enemy sequences, and procedural map fallback. It also owns the retained enemy-spec coercion and legacy type curve used only when sequence data is absent. Unit coverage locks the complete pack contract, default settings, map source selection, representative enemy records, fallback boundaries, and clone isolation; browser integration compares the public schema and enemy summaries, then verifies the real stage-1 startup map.

`src/stages/procedural-stage.js` owns deterministic fallback-map generation when the active runtime stage source omits map data. It preserves the seeded random sequence, stage-density and terrain thresholds, three-stage mirror cadence, seven-stage motif cycle, reserved spawn region, and final battlefield cleanup behind a frozen browser/Node API. Unit coverage locks the random prefix, threshold boundaries, every motif, independent grid state, and pre-refactor golden maps for stages 1-7 and 35; browser integration verifies stages 1 and 2 through the real title and stage-selection flow.

`src/stages/stage-pack-schema.js` owns the fresh editable example returned by the public `stagePackSchema()` API: normalized default settings, cloned enemy/upgrade data, fixed wall metadata, default spawn coordinates, both documented map encodings, sample enemy delays, and tile-code help. Its unit suite locks every readable section, clone isolation, and the complete pre-refactor 6,498-byte JSON SHA-256; browser integration proves the public adapter matches the pure module and remains independent of a loaded custom pack.

`src/stages/stage-runtime.js` binds the pure route/settings/grid modules to a dynamically read game state. Its frozen runtime API owns active-pack fallback, displayed/map/enemy stage resolution, per-stage enemy totals and one/two-player capacities, default/custom spawn lookup, map decoding/procedural fallback, enemy-spec fallback, and normalized stage sequences. Direct tests switch one runtime between built-in, custom, raw-quadrant, mapless, and demo states; browser integration verifies public pack diagnostics and removes the corresponding query wrappers from `src/game.js`.

`src/runtime/` contains the browser composition boundary created during the runtime split. `shared-state.js` creates the single mutable state graph and fixed layout/timing constants; `module-deps.js` validates script order and exposes the explicit dependency barrel; `game-lifecycle.js` owns high-score persistence plus title, stage, editor, pack-loading, and transition orchestration; `audio-bridge.js` owns Web Audio node creation and event synchronization; and `debug-api.js` adapts retained runtime functions into the public test/diagnostic API. `audio-diagnostics.js` owns the 31 contiguous manifest, presentation, movement, priority, pause, and fixed-frame lifecycle probes behind 142 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`; extracting it plus dead aliases reduces `debug-api.js` from 8,957 to 6,171 lines. Its unit suite locks method order, validation, binding precedence, and clone isolation; browser integration executes every probe in sequence and preserves the pre-refactor 61,974-byte SHA-256 output. `stage-pack-diagnostics.js` owns the exact cloned projection shared by `currentPackInfo()` and the stage-pack section of `debugSnapshot()`, including route metadata, normalized settings, enemy types, upgrade/wall rules, spawn layouts, and the active enemy sequence. `stage-result-diagnostics.js` binds four frozen public stage-result probes to pure rules, normalizes diagnostic player records, projects bonus recipients, row scores/layout gaps, and count/reveal timing, and removes two debug-only helpers from `src/game.js`. Its unit suite covers input normalization, bonus eligibility, dynamic timing overrides, presentation boundaries, and output isolation; browser integration locks public API order and the pre-refactor 1,478-byte output hash. `stage-flow-diagnostics.js` binds 17 contiguous curtain, stage-cycle, stage-clear, automatic-advance, and game-over probes through 49 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`; extracting it and 17 dead aliases reduces `debug-api.js` from 6,171 to 5,483 lines. Its unit suite locks validation, exact method order, binding precedence, and receiver identity; browser integration executes all 17 probes at their original public indices and preserves the pre-refactor 13,047-byte output SHA-256. `screen-flow-diagnostics.js` binds 11 contiguous title-score, frame-counter, stage-select cadence, title demo/hidden-message, high-score, and full-screen game-over probes through 57 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`; extracting it and 32 dead aliases reduces `debug-api.js` from 5,483 to 4,833 lines. Its unit suite locks validation, exact method order, binding precedence, receiver identity, and cloned layout output; browser integration executes all 11 probes at their original public indices and preserves the pre-refactor 25,534-byte output SHA-256. `enemy-diagnostics.js` binds 11 contiguous carrier, enemy presentation, target selection, AI/movement cadence, blocked recovery, spawn timeline, and spawn-animation probes through 34 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`; extracting it and four dead aliases reduces `debug-api.js` from 4,833 to 4,497 lines. Its unit suite locks validation, exact method order, binding precedence, and receiver identity; browser integration executes all 11 probes at their original public indices and preserves the pre-refactor 3,839-byte output SHA-256. `debug-snapshot.js` owns the complete 95-field public state projection: screen and fixed counters, all 17 retained audio events, stage-pack diagnostics, score popups, battle/editor grids, field geometry, and independently cloned player summaries. Unit tests lock the exact field order, audio event mapping, representative values, and clone isolation; browser integration verifies module registration, the thin adapter, and repeated-call isolation.

`src/runtime/render-composition-runtime.js` owns the setup order for the Canvas-facing runtime boundaries: title, terrain, tank, power-up, projectile, effect, stage-result, HUD, editor, transition, and top-level screen rendering. It receives the existing game callbacks, registers the same `state.fn` methods through the original runtime modules, returns their frozen handles to the composition root, and keeps render dependency wiring out of `src/game.js`. Its unit test locks callback validation, setup order, and handle isolation; the browser bootstrap test loads the new script through the real no-build entry path.

`src/runtime/render-adapter-runtime.js` owns the compatibility-facing Canvas adapter functions that connect the composition root to the extracted render runtimes. It keeps the child-runtime lookup lazy until setup completes, preserves the existing presentation selectors and integer text helpers, and accepts the independently initialized battle-scene renderer explicitly. Unit tests lock deferred connection, child receiver identity, and presentation delegation; browser integration verifies the no-build startup path and the unchanged first-frame render.

`src/runtime/application-flow-composition-runtime.js` owns the application-flow initialization order for lifecycle, audio, Construction input, stage selection, and full-screen post-game screens. It reads the existing `state.fn` registrations, keeps frame/lifecycle callbacks explicit, and removes this setup block from `src/game.js`. Unit tests lock setup order and callback wiring; browser integration verifies the real no-build bootstrap.

`src/runtime/input-composition-runtime.js` owns the browser-input callback composition that connects the extracted input router to the registered game methods. It preserves the existing callback order, the dynamic stage-clear predicate used by pause gating, and the explicit DOM/shared-state dependencies, leaving `src/game.js` with only the composition call and the direct main-loop high-score invocation. Unit tests lock callback identity and adapter inputs; browser integration verifies the no-build registration.

`src/runtime/legacy-api-composition-runtime.js` owns the retained public/debug API callback projection. It combines local screen/update callbacks with the extracted render adapter and stage runtime, then delegates the original registration order to `legacy-api-runtime.js`, removing the large registration object from `src/game.js` without changing the public `state.fn` surface. Unit tests lock callback identity across both sources; browser integration verifies the no-build registration boundary.

`src/runtime/render-pipeline-composition-runtime.js` owns the multi-phase Canvas pipeline assembly: text and sprite adapters, the render adapter, the battle scene, and the final screen render composition. It exposes an explicit completion step so `battle-composition-runtime.js` remains between battle-scene setup and screen-composition setup, preserving the original initialization order while removing the large wiring block from `src/game.js`. Unit tests lock phase order, callback identity, and idempotent completion; browser integration verifies the no-build pipeline boundary.

`src/runtime/battle-composition-runtime.js` owns the initialization order for player movement, projectiles, combat, stage results, stage flow, Game Over, timing, power-ups, enemy AI/movement/update, battle outcomes, the fixed-frame loop, and screen updates. It reads the existing `state.fn` and stage runtime instead of duplicating rules, and accepts only the top-level render/update/spawn gates from `src/game.js`. Unit tests lock the module order and returned loop handles; browser integration verifies the real startup path.

`src/runtime/legacy-api-runtime.js` owns the final compatibility registration of the retained `state.fn` surface. It runs only after all runtime modules have installed their APIs, validates the callback table, preserves registration order, and keeps the public debug adapter independent from the composition root's assignment block. Direct unit coverage locks validation, insertion order, and function identity; browser integration verifies that `src/game.js` contains no direct `state.fn` assignment statements.

`src/runtime/debug-battle-runtime.js` owns the deterministic paused battle fixture used by effect, power-up, score, timer, and terrain diagnostics. It writes only the minimal battle state required by those probes, keeps the 60 Hz tick/frame-byte conversion in one boundary, and leaves the production battle loop untouched. Unit tests lock the fixture geometry, normalization, and reset fields; browser integration verifies that the diagnostics still use the extracted fixture.

`src/runtime/audio-bridge.js` now also owns the fixed-frame audio lifecycle order exposed to the composition root: updating every voice, stopping gameplay voices before a result, stopping result voices, and stopping every voice on full teardown. The unit test locks all four sequences so later audio changes cannot silently reorder channel cleanup or advancement.

`src/runtime/audio-score-diagnostics.js` owns the score-count audio presentation and lifecycle probes extracted from `audio-diagnostics.js`. It accepts an explicit runtime scope and returns frozen probe methods; `audio-diagnostics.js` composes them back into the original public order, while direct and browser tests preserve the existing output hash.

`src/runtime/audio-stage-bonus-diagnostics.js` owns the stage-result leader-bonus audio presentation and lifecycle probes extracted from `audio-diagnostics.js`. It uses the same explicit scope boundary and is composed back into the original public order; direct and browser tests preserve the original 28-frame cue and result behavior.

`src/runtime/audio-movement-diagnostics.js` owns the ordinary movement-mode and ice-movement presentation probes extracted from `audio-diagnostics.js`. It keeps their explicit scope and original API positions, while the remaining movement lifecycle probe stays with the main audio diagnostics boundary until its dependent battle scenarios are split.

`src/runtime/audio-brick-hit-diagnostics.js` owns the stateless destructive-brick-hit audio presentation probe extracted from `audio-diagnostics.js`. Its explicit scope keeps the three-frame triangle replacement sequence independent from the brick collision lifecycle probe.

`src/runtime/audio-steel-hit-diagnostics.js` owns the stateless steel-hit audio presentation probe extracted from `audio-diagnostics.js`. Its explicit scope keeps the five-frame boundary-impact sequence independent from the steel collision lifecycle probe.

`src/runtime/audio-enemy-hit-diagnostics.js` owns the stateless enemy-hit audio presentation probe extracted from `audio-diagnostics.js`. Its explicit scope keeps the six-frame armored-hit sequence independent from the enemy collision lifecycle probe.

`src/game.js` no longer maintains local aliases for registered audio or non-audio runtime methods. Composition modules read `state.fn` during setup, while the main loop invokes the high-score API directly after registration; the composition root now retains only the dependency bucket, shared-state handle, stage runtime, and small tile-name mapping.


`effect-diagnostics.js` binds the five contiguous explosion-rule, tank-destruction, enemy-release, rendered-frame, and paused-impact probes through 31 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`. The extraction and seven dead-adapter removals leave `debug-api.js` at 4,175 physical lines. Its unit suite locks validation, exact method order, binding precedence, and receiver identity; browser integration executes all five probes at their original public indices 130-134 and preserves the pre-refactor 6,548-byte output SHA-256.

`wall-diagnostics.js` binds the five contiguous steel-damage, directional brick-strip, brick-fragment rendering, shovel-wall timing, and destroyed-base shovel probes through 29 explicitly destructured runtime symbols plus the live brick-impact audio record, with receiver-preserving function binding and no `eval`. The extraction leaves `debug-api.js` at 3,979 physical lines without dead adapters. Its unit suite locks state/audio validation, exact method order, binding precedence, and receiver identity; browser integration executes all five probes at their original public indices 51-55 and preserves the pre-refactor 1,929-byte output SHA-256.

`timer-diagnostics.js` binds the seven contiguous timer-rule, global countdown, shield cadence/pause, freeze behavior, final frozen-frame, and spawn-during-freeze probes through 18 explicitly destructured runtime symbols with receiver-preserving function binding and no `eval`. The extraction and three dead-adapter removals leave `debug-api.js` at 3,557 physical lines. Its unit suite locks validation, exact method order, binding precedence, receiver identity, and state restoration; browser integration executes all seven probes at their original public indices 67-73 and preserves the pre-refactor 2,184-byte output SHA-256.

`power-up-diagnostics.js` binds the 15 contiguous type-pool/shared-random, visibility/pause, TTL/collection, pickup-render/footprint, terrain-mutation, spawn-filter/rotation, and carrier-clear probes through 54 explicitly destructured runtime symbols, including the live pickup-audio record and mapped power-up type/random-table aliases, with receiver-preserving function binding and no `eval`. The extraction and 13 dead-adapter removals leave `debug-api.js` at 3,042 physical lines. Its unit suite locks state/audio validation, exact method order, binding precedence, and receiver identity; browser integration executes all 15 probes at their original public indices 75-89 and preserves the pre-refactor 7,420-byte output SHA-256.

`upgrade-diagnostics.js` binds the three contiguous star-upgrade rule, upgraded-tank overlay, and level-three survivability probes through 17 explicitly destructured runtime symbols plus the live player-destruction audio record, with receiver-preserving function binding and no `eval`. The extraction leaves `debug-api.js` at 2,894 physical lines. Its unit suite locks state/audio validation, exact method order, binding precedence, and receiver identity; browser integration executes all three probes at their original public indices 94-96 and preserves the pre-refactor 702-byte output SHA-256.

`combat-diagnostics.js` binds the 12 contiguous helmet-protection, player/enemy projectile-collision, spawn-lock, bullet-limit/firing-input, crossing-cancellation, projectile-boundary, terrain-hit-sound, and friendly-fire probes through 41 explicitly destructured runtime symbols plus five live audio records, with receiver-preserving function binding and no `eval`. The extraction and 15 dead-adapter removals leave `debug-api.js` at 1,457 physical lines. Its unit suite locks state/keys/pending-fire/audio validation, exact method order, binding precedence, and output scope; browser integration executes all 12 probes at their original public indices 101-112 and preserves the pre-refactor 5,147-byte output SHA-256.

`player-movement-diagnostics.js` binds the 11 contiguous fixed-loop cadence, tread animation, friendly-fire stun, WASD input, turn alignment, brick recovery, ice movement, and ice/forest layer probes through 42 explicitly destructured runtime symbols plus the live movement-ice and player-shoot audio records, with receiver-preserving function binding and no `eval`. The extraction and six dead-adapter removals leave `debug-api.js` at 2,312 physical lines. Its unit suite locks state/keys/audio validation, exact method order, binding precedence, and state restoration; browser integration executes all 11 probes at their original public indices 113-123 and preserves the pre-refactor 2,414-byte output SHA-256.

`terrain-diagnostics.js` binds the six contiguous terrain-surface, base-wall-priority, base-destruction-timing/render, tank-occupancy, and enemy-overlap-recovery probes through 40 explicitly destructured runtime symbols plus three live audio records, with receiver-preserving function binding and no `eval`. The extraction and 18 dead-adapter removals leave `debug-api.js` at 1,068 physical lines. Its unit suite locks state/keys/pending-fire/audio validation, exact method order, binding precedence, and collision output scope; browser integration executes all six probes at their original public indices 124-129 and preserves the pre-refactor 6,225-byte output SHA-256.

`player-lifecycle-diagnostics.js` binds the four contiguous death/respawn, two-player Game Over message, message-rendering, and bonus-life probes through an explicit receiver-preserving state/audio scope without `eval`. The extraction and dead-adapter cleanup reduce `debug-api.js` from 1,068 to 638 physical lines. Its unit suite locks input validation, exact method order, receiver binding, and state restoration; browser integration executes all four probes at their original public indices 97-100 and preserves the pre-refactor 5,172-byte output SHA-256.

`pause-diagnostics.js` binds the three contiguous pause-toggle, pause-safe stage-completion, and pause-frame-rendering probes through an explicit receiver-preserving state/audio scope without `eval`. The extraction and dead-adapter cleanup reduce `debug-api.js` from 638 to 488 physical lines. Its unit suite locks input validation, exact method order, receiver binding, and state restoration; browser integration executes all three probes at their original public indices 36-38 and preserves the pre-refactor 973-byte output SHA-256.

`score-diagnostics.js` binds the four contiguous grenade-score, grenade-spawn-protection, score-popup, and paused-score-popup probes through an explicit receiver-preserving state/audio scope without `eval`. The extraction and dead-adapter cleanup reduce `debug-api.js` from 488 to 218 physical lines. Its unit suite locks input validation, exact method order, receiver binding, and state restoration; browser integration executes all four probes at their original public indices 90-93 and preserves the pre-refactor 1,095-byte output SHA-256.

The enemy diagnostics module also exposes `createEnemySpawnOverlapDiagnostics` for the existing post-timer spawn-overlap probe. Its state setup now lives outside `debug-api.js`, while the adapter remains at its original public API position; the current adapter is 77 physical lines.

`panel-diagnostics.js` binds the two contiguous enemy-counter and life-counter panel probes through the same receiver-preserving scope without `eval`. Its unit suite locks input normalization, binding precedence, method order, and output projection; browser integration verifies module registration, the original public indices 135-136, and the pre-refactor 133-byte output SHA-256.

`power-up-runtime.js` owns the live power-up boundary extracted from `src/game.js`: carrier release and clearing, spawn-point validation and rotation, TTL advancement, collection scoring, and effect side effects. The module receives explicit callbacks for game settings, terrain, collision, audio, score, and enemy destruction, then registers the unchanged `state.fn` surface. Its unit test covers setup validation, registration, spawn rotation, collection, star upgrades, carrier release, and transient-state cleanup; the existing browser power-up suites continue to exercise the real game path.

`enemy-spawn-runtime.js` owns the live enemy creation boundary extracted from `src/game.js`: active-slot capacity, occupied-spawn retry timing, carrier cleanup, enemy construction, and player-scaled fixed-frame spawn pacing. Its unit test locks the state.fn registration, sequence limits, explicit delays, default pacing, occupied-point retries, and carrier callback; existing browser enemy diagnostics continue to verify the real stage flow.

`enemy-ai-runtime.js` owns enemy decision helpers extracted from `src/game.js`: random/player/HQ phase selection, slot-aware player targeting, horizontal-first direction choice, fire probability, and AI chance matching. It receives the existing battle-random callback rather than creating a second random stream; its unit test locks phase thresholds, target projection, direction choice, and fire decisions.

`enemy-movement-runtime.js` owns enemy movement extracted from `src/game.js`: alternate-movement cadence, overlap recovery, blocked retries, pending turns, intersection routing, direction reversal, and track-phase advancement. Its unit test locks cadence skips, strict overlap reduction, retry timing, and turn decisions; existing enemy, terrain, and player-movement browser diagnostics continue to exercise the live path.

`enemy-update-runtime.js` owns the fixed-frame enemy update boundary extracted from `src/game.js`: destruction animation release, timer-based enemy freeze, spawn-animation advancement, reload decrement, movement dispatch, and fire scheduling. Its unit test locks the rule that frozen enemies still finish spawning but do not move, reload, or shoot; existing timer, enemy-state, combat, and score browser probes continue to exercise the live path.

`tank-movement-runtime.js` owns the fixed-frame tank movement boundary extracted from `src/game.js`: collision-peer filtering, terrain/base occupancy, overlap-area recovery support, ice detection, turn snapping, track-phase toggling, and perpendicular-turn classification. Its unit test locks movement blocking, active-peer selection, terrain projection, ice recognition, track phase, and alignment behavior; existing terrain and player-movement browser diagnostics continue to exercise the live path.

`src/runtime/player-movement-runtime.js` owns the fixed-frame player movement boundary: configured speed application, ice-slide start/continuation, perpendicular-turn snapping, stun gating, and track-phase updates. It receives terrain movement and audio through explicit callbacks, preserves the original two-read settings access on slide movement, and is directly tested for normal turns, sliding, locked ice movement, stun blocking, and track updates.

`src/runtime/game-over-entry-runtime.js` owns entry into the field GAME OVER state: the exact 14-channel audio stop order, demo termination, duplicate-entry guard, fixed counter reset, extended high-byte value, base/message cleanup, high-score comparison, and field timer initialization. Its direct tests preserve the original omissions as well as the active cleanup calls and state transitions.

`src/runtime/frame-counter-runtime.js` owns the live adapter around `src/core/frame-counter.js`: low/high byte advancement, low-only/high-only/full resets, and writes back to shared game state. It keeps the original 64-frame high-byte boundary without duplicating the pure counter rule; direct tests lock rollover, independent resets, full reset, and registration.

`transient-effects-runtime.js` owns the live explosion and score-popup boundary extracted from `src/game.js`: explosion-rule fallback, impact/destruction style selection, base-destruction duration, queue insertion, and fixed-frame TTL advancement. Canvas rendering remains in `src/game.js`; its unit test locks explicit setup dependencies, rule fallback, style selection, default popup coordinates, TTL progression, and survivor identity, while the browser transient-effect integration test verifies registration and the unchanged public behavior.

`projectile-runtime.js` owns the fixed-frame firing boundary extracted from `src/game.js`: player upgrade-tier lookup, active-bullet limits per tank, projectile creation from current pack geometry, reload timing, and player-only shooting audio. Collision and movement resolution remain separate runtime boundaries; its unit test locks upgrade clamping, one/two-bullet limits, speed and power propagation, enemy silence, and reload behavior, while the browser projectile integration test verifies registration and pack overrides.

`projectile-target-runtime.js` owns projectile target effects extracted from `src/game.js`: base destruction, fragment-accurate brick/steel damage, enemy damage and carrier release, friendly-fire stun, and enemy-bullet player kills. Its unit test locks the original side-effect order and target filters; existing collision, terrain, combat, power-up, and audio browser probes continue to exercise the live path.

`projectile-resolution-runtime.js` owns the fixed-order projectile hit dispatch extracted from `src/game.js`: padded field-boundary impacts, terrain, base, and tank checks, plus boundary explosion and audio side effects. Its unit test locks early returns and the exact terrain/base/tank order; existing projectile collision and impact integration tests continue to exercise the live path.

`projectile-motion-runtime.js` owns the fixed-frame projectile stepping boundary extracted from `src/game.js`: remove-flag reset, fractional-speed subdivision, direction-vector movement, per-step collision dispatch, opposing-projectile cancellation, and expired-bullet filtering. Its unit test locks step counts, early impact termination, post-step cancellation ordering, survivor identity, and flag reset; existing projectile collision, boundary-impact, timer, and combat browser tests continue to exercise the live path.

`public-api-adapters.js` owns the four ordered public-entry groups for pack loading/validation, sprite and current-pack projections, `debugSnapshot()`, and `stagePackSchema()`. Receiver-preserving binding keeps state-owned loaders and dependency-owned projections explicit, while the thin composition preserves the original public indices 0-2, 34-35, 50, and 158. Its unit suite locks group order, receiver precedence, validation, and output routing; browser integration verifies the public positions and removes the former dynamic adapter bodies. The resulting `debug-api.js` is 77 physical lines and contains no `eval`.

`src/presentation/free-sprite-manifest.js` owns the deeply frozen browser module copy of `data/free-sprite-manifest.json` and the independent deep-clone API exposed by the runtime. Unit coverage compares all 14 sprite groups against the JSON source and locks tread animation phases, six outlined power-ups, star geometry, steel bolts, water animation, hidden-drop phases, destruction phases, and clone isolation. Browser integration verifies registration and confirms public clones cannot mutate the frozen internal replacement geometry.

`src/presentation/pixel-font.js` owns the frozen 41-glyph 5x7 font, the seven 3x5 compact GAME OVER glyphs, unknown-character fallback, and right-alignment geometry. `src/game.js` retains only Canvas rectangle submission, clipping, and striped palette drawing. Unit coverage locks every row width and binary pixel row plus scale/advance alignment; browser integration verifies title/full-screen striped text, ordinary PAUSE text, and compact two-player elimination text all render with integer rectangles and never use anti-aliased `fillText`.

`src/presentation/battle-hud-presentation.js` owns right-panel reserve-enemy/life counts, the 16-frame PAUSE blink selector, the 127-frame in-field GAME OVER slide plus 129-frame hold, and the compact 32x8 two-player elimination-message projection. Thin runtime adapters supply current counters, pause/demo flags, and stage-pack game-over timings before Canvas drawing. Direct unit coverage locks the pure boundaries, while browser integration retains the lifecycle, audio-coupling, and pixel-footprint probes formerly held by the smoke suite.

`src/presentation/effect-presentation.js` owns the reference phase tables, sprite geometry, and timeline projections for player/enemy/HQ destruction, bullet and generic explosions, and fixed or floating score text. Thin runtime adapters inject the current stage-pack TTL values and battlefield layout before Canvas drawing. Direct unit coverage validates every pure projection, while browser integration retains the lifecycle and pixel-bound probes formerly held by the smoke suite.

`src/presentation/screen-presentation.js` owns title score-group placement, the 108-frame full GAME OVER layout, the 460-frame HIGH SCORE palette/centering timeline, and the discrete stage-selection/result closing and stage-intro opening curtains. Thin runtime adapters inject current screen dimensions, stage number, transition timer, and configured intro duration before Canvas drawing. Direct unit coverage locks every boundary and reference coordinate, while browser integration retains the lifecycle, input, audio-coupling, and pixel-render probes formerly held by the smoke suite.

`src/presentation/tank-presentation.js` owns direction and tread frame names, star-upgrade overlay geometry/colors, armor colors, carrier and stun flash cadence, shield visibility/colors, and the four-size spawn-animation sequence. `src/game.js` retains Canvas sprite submission and palette drawing. Direct unit coverage validates every pure selector, while browser integration coverage retains the runtime probes and pixel-level tread/upgrade assertions formerly held by the smoke suite.

`src/rules/enemy-ai-rules.js` owns alternating slot cadence, 8px turn intersections, interval-derived random/player/HQ phases, alive-player target selection, axis-first directions, byte-exact AI probability rolls, and default/custom fire checks. `src/game.js` still draws bytes from the shared NES-style random sequence and executes movement, collision recovery, turns, and shooting, so extraction does not change random consumption order.

`src/rules/enemy-spawn-rules.js` owns alive-enemy capacity counting, descending reusable-slot selection, 14px player/enemy spawn-point occupancy, and explicit-or-cyclic spawn-index selection. Destroying enemies continue to retain capacity until released, while destroying, dead, or respawning tanks do not block a spawn point; runtime code retains retry countdowns, carrier clearing, and enemy construction.

`src/entities/power-up-state.js` now owns both collectible-record creation and one-frame TTL advancement. Positive TTL values decrement to immediate removal at zero, while zero or negative values preserve the same object as an untimed power-up.

`src/rules/power-up-collection-rules.js` owns active-player pickup eligibility, the strict 12px center-distance boundary on both axes, and reverse slot selection that gives player two priority when both players qualify on the same frame. Runtime code retains power-up removal, scoring, popups, and pickup audio.

`src/rules/power-up-effect-rules.js` owns the synchronous state transitions for all six power-ups: grenade enemy-destruction requests, helmet protection extension, live-base shovel timers, capped star upgrades, timer freezes, and tank extra lives. It returns terrain, enemy, and audio actions to `src/game.js`, keeping those runtime side effects outside the rule module; dedicated tests now cover both direct state transitions and the live grenade/shovel/timer paths.

`src/rules/power-up-spawn-rules.js` owns the original eight-entry power-up random table, stable coordinate deduplication, 16-bit uniform candidate selection, and exclusion of the previous position when alternatives exist. Runtime code still filters configured and fallback positions against battlefield bounds, the live base, solid terrain, and tank occupancy before passing reachable candidates to this module.

`tests/helpers/test-file-discovery.js` recursively discovers only `*.test.js` files in stable path order. `tests/run-tests.js` executes every unit and integration test in isolated Node processes, so new feature tests no longer require a hand-maintained runner entry. `tests/integration/app-bootstrap.test.js` owns the remaining browser bootstrap, toolbar, first-frame rendering, stage-preparation rendering, and file-input cleanup checks; feature-specific lifecycle assertions remain in their domain integration suites.

`tests/unit/readme-tree.test.js` validates UTF-8 decoding and balanced code fences, requires the English and Chinese file-tree blocks to match exactly, and compares their documented files against the live workspace while excluding Git, Codex, and Reasonix metadata directories.

`src/rules/projectile-collision-rules.js` owns center-distance checks and ordered cancellation of projectiles from different owners. Its tests preserve the strict below-6px boundary, same-owner exclusion, removed-projectile skipping, deterministic pair order, high-speed crossing behavior, and cancellation without impact explosions.

`src/rules/projectile-impact-rules.js` owns padded field-boundary checks, clamped boundary-impact coordinates, and player-only brick/steel hit-sound selection. Its tests preserve inclusive padding edges, all four 208px battlefield clamps, silent enemy impacts, blocked-steel audio, and max-power steel-destruction audio.

`src/rules/wall-damage-rules.js` owns the frozen wall-rule metadata and independent clone API used by pack diagnostics, plus directional quarter targeting, normal-shot 4px brick-strip peeling, powered 8px brick-quarter removal, and max-power steel-quarter destruction. Its dedicated unit suite locks the metadata and covers lower-left and lower-right fragment masks directly, while the browser integration suite verifies schema/current-pack projections and preserves the runtime debug-probe behavior that previously lived in the monolithic smoke test.

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

`src/runtime/player-update-runtime.js` owns fixed-frame player input and Demo updates. It keeps the original Arrow/WASD bindings, one-shot fire presses, movement cadence, spawn protection, respawn timing, power-up-first Demo targeting, and enemy slot priority behind a frozen runtime API. Its unit suite covers the keyboard matrix, firing, recovery, and target selection; browser integration verifies module registration through the real game harness.

`src/runtime/player-movement-runtime.js` owns the movement operation consumed by player input and Demo updates, keeping ice sliding, turn snapping, stun gating, and track animation out of the input scheduler.

`src/runtime/game-over-entry-runtime.js` owns the field GAME OVER entry side effects and timer initialization, keeping audio cleanup and high-score marking out of the battle outcome predicate.

`src/runtime/frame-counter-runtime.js` owns the live adapter that writes pure 60 Hz counter results into the shared state, so lifecycle modules share one reset/advance boundary.

`src/runtime/battle-timing-runtime.js` owns the fixed-frame global timer boundary: freeze countdown, shovel-wall restoration/flash timing, player invulnerability countdown, base-destruction countdown, and the exact stage-cleared predicate. Its unit suite locks the 64-frame timer cadence, wall transitions, and enemy-count boundary; browser integration verifies registration without changing the public API order.

`src/runtime/battle-random-runtime.js` owns the live battle adapter around the pure D44D random arithmetic: the stateful random stream, zero-page projections, original enemy spawn position sampling, and player/enemy tank memory/type bytes. Its unit suite locks address mapping, wraparound and slot encoding while the AI, spawn, movement, and power-up runtimes continue to receive the same `randomByte` callback.

`src/runtime/battle-combat-runtime.js` owns enemy destruction scoring, bonus-life thresholds, player hit/death transitions, respawn reset, and the two-player GAME OVER message timing. It keeps audio and high-score persistence as explicit callbacks, while projectile, power-up, and player-update runtimes consume the same `state.fn` API.

`src/runtime/stage-result-runtime.js` owns stage-advance projections, result-table timing, clear-bonus recipient selection, and one-shot clear-bonus side effects. Screen transitions remain in `src/game.js`, while diagnostics and the stage-clear renderer use the same frozen runtime API.

`src/runtime/editor-input-runtime.js` owns the fixed-frame Construction input orchestration: cursor movement, original A/B pattern cycling, full-cell and quadrant painting, brush selection, tile cycling, and held-direction repeat. It keeps mutations and sounds as explicit callbacks while `src/game.js` retains Canvas coordinate conversion and DOM event wiring; direct tests cover the original pattern masks, boundary-safe edits, brush selection, and 20-frame repeat cadence.

`src/runtime/input-runtime.js` owns browser input routing for toolbar actions, keyboard screen dispatch, pause handoff, stage-pack imports, and Construction mouse editing. It keeps browser event timing outside the fixed-frame simulation and delegates state changes through explicit callbacks; its direct tests lock the input contract without duplicating gameplay rules.

`src/runtime/screen-render-runtime.js` owns the top-level screen dispatch and overlay order, while specialized render runtimes own the pixels for each screen.

`src/runtime/stage-select-runtime.js` owns the fixed-frame stage-selection A/B input cadence: one-shot presses are consumed before held-key repeats, repeats occur on the original eight-frame boundary, and A retains priority when both buttons arrive together. The stage mapping and screen transition remain explicit callbacks from `src/game.js`.

## Stage Pack Format

The browser exposes `window.TankDefender8.loadStagePack(pack)` and `window.TankDefender8.stagePackSchema()`. Loading a stage pack returns to the title screen and clears active players, enemies, bullets, power-ups, and transition timers before the new pack starts.
For automated checks, `window.TankDefender8.debugSnapshot()` returns the current screen, stage, enemy counters, current enemy sequence, scores, lives, per-stage kills, and cumulative kills. The right-panel enemy icons count enemies not yet spawned, not enemies not yet killed.

`data/sample-stage-pack.json` is a valid 13x13 one-stage sample. `data/sample-quadrant-stage-pack.json` is a valid 26x26 one-stage sample. `data/free-35-stage-pack.json` is a deterministic 35-stage free/custom replacement map pack that preserves the current 35-stage enemy sequence data. These can be loaded with the toolbar `IMPORT` button.

`data/free-audio-manifest.json` defines the current free/custom procedural sound set. The runtime exposes the same data through `window.TankDefender8.audioManifest()`, and `tests/integration/free-audio-manifest.test.js` checks that the file and runtime copy stay in sync.

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
        { x: 2, y: 2 }, { x: 2, y: 5 }, { x: 2, y: 8 }, { x: 2, y: 11 },
        { x: 5, y: 2 }, { x: 5, y: 5 }, { x: 5, y: 8 }, { x: 5, y: 11 },
        { x: 8, y: 2 }, { x: 8, y: 5 }, { x: 8, y: 8 }, { x: 8, y: 11 },
        { x: 11, y: 2 }, { x: 11, y: 5 }, { x: 11, y: 8 }, { x: 11, y: 11 }
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

Each stage may also set `powerUpSpawns`, the fixed candidate locations used when a carrier releases a power-up. These also use 13x13 tile coordinates and must contain at least one point. If omitted, the engine uses the original-style 4-by-4 Cartesian list at tile axes `2`, `5`, `8`, and `11`. For that built-in list, the runtime consumes one random byte for X and one for Y, uses each byte's low two bits, and then consumes the next byte's low three bits through the fixed eight-entry item table. Blocked or unreachable candidates are filtered before placement; if filtering reduces the original list, the same 4-by-4 sample is projected onto the remaining candidates. Custom lists retain the generic 16-bit sample and immediate-previous-location avoidance.

Imported JSON packs are strict: either `maps.length` or `quadrants.length` must equal `totalStages`, but not both; every `maps` stage must be 13x13; every `quadrants` stage must be 26x26; `enemies.length` must equal `totalStages`; and every stage enemy sequence must contain at least one enemy. The runtime uses each stage's `enemies` array as the authoritative enemy order, including `typeIndex`, carrier flag, `powerUpType`, spawn point, and explicit spawn delay. `enemyTotal` is optional metadata/default compatibility; the active stage enemy count is derived from that stage's enemy sequence length.

The base tile and immediate spawn/base protection zones are normalized by the engine when a stage starts.

## Reference Notes

The built-in stage pack now uses a fixed 35-stage source-derived structural map dataset and the fixed enemy group order/count table from the public Battle City (J) disassembly, expanded to 20 enemies per stage. `data/free-35-stage-pack.json` still supplies fixed free/custom replacement maps for all 35 stages, `data/free-audio-manifest.json` supplies the current procedural replacement sound events, and `data/free-sprite-manifest.json` supplies the current procedural tank, bullet, terrain, base, ordinary/destruction explosion, panel, outline, and power-up sprites. Future sampled music/sound effects or richer sprite art should likewise be supplied as free/custom replacements rather than original ROM-derived assets. Public references used for rules cross-checking include:

- [StrategyWiki Battle City walkthrough](https://strategywiki.org/wiki/Battle_City/Walkthrough)
- [StrategyWiki Battle City gameplay](https://strategywiki.org/wiki/Battle_City/Gameplay)
- [Battle City annotated disassembly](https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/main/Battle%20City/bank_FF.asm)
- [Battle City fixed stage data reference](https://github.com/gunnerson/battlecity/blob/master/src/Stages.hpp)
