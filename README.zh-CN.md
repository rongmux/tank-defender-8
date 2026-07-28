# Tank Defender 8

[English](README.md) | **简体中文**

一款以静态 Canvas 应用形式构建的 NES 风格坦克防御游戏。

本仓库不包含 NES 原版 ROM 数据、原版精灵图、原版音频或原版关卡地图。地图、精灵图和音频均使用免费或自定义替代资源。内置敌人构成与公开记录的《Battle City》35 关敌人分组表一致；引擎仍采用数据驱动设计，因此无需修改核心代码即可调整玩法规则、敌人序列和关卡包。

项目当前处于独立的架构重构阶段。在把单文件运行时和 smoke 测试拆分为显式浏览器模块、纯规则模块、共享测试基础设施、单元测试套件和按功能划分的集成套件期间，暂停新增 1:1 游戏机制。核心计时、随机数、几何和方向向量现已模块化；配置域接管共享值校验、基础会话/生命规则、弹丸/友军伤害规则、敌人 AI 与生成节奏、敌人类型/规格规范化、爆炸时序/颜色、玩家移动/cadence、玩家星星升级档位、道具持续时间/规则、关卡流程/奖励、固定逻辑时序以及各关活动敌人上限/出生点配置；关卡域接管地图网格规则、战场初始化/基地围墙行为、确定性备用地图生成、内置/导入关卡包组合、公开关卡包 schema、活动关卡包运行时查询、关卡路由及原版风格敌人编组/序列模型；实体域接管玩家生命周期、敌人/子弹/道具创建以及爆炸/分数提示的短生命周期状态；玩法规则域现已接管得分/奖励生命推进、结算行/领先者/计数时序、坦克/子弹碰撞边界、不同拥有者的子弹抵消、子弹边界/命中表现选择、精确到碎片的地形重叠脱困，以及定向砖块条带/钢墙象限破坏。整个迁移过程必须继续兼容无需构建的静态启动方式。

表现层现已接管深冻结的免费替代精灵清单、两套像素字体字形和对齐几何，以及纯坦克、瞬态效果、战斗 HUD、标题计分、幕布、全屏 GAME OVER 和 HIGH SCORE 的视觉时间轴；Canvas 精灵提交和像素绘制仍由运行时负责。

音频域现已接管深冻结的免费替代音频清单、纯固定帧音效状态生命周期、声部时长/音符投影、逐声部可听性选择、跨事件声道优先级解析，以及玩家/敌人移动循环相位/模式投影。Web Audio 节点创建、暂停/恢复副作用和播放仍由运行时负责。

编辑器域现已接管原版风格 Construction 图块调色板和块图案序列、D-pad/WASD 方向别名、整格光标移动、面板命中测试、地形循环、精确到 8px 的砖/钢象限修改、带版本的存档文档、旧版 13x13 存档兼容、单关卡包组装及 JSON 编解码。浏览器存储、剪贴板/文件访问、消息、音效和输入监听仍由运行时负责。

运行时层现已接管共享可变状态、浏览器模块依赖桶、最高分/标题/关卡/编辑器生命周期编排、Web Audio 副作用和公开调试适配器。关卡包诊断已隔离为纯投影模块，使 `currentPackInfo()` 与 `debugSnapshot()` 对克隆配置、路由、出生点、敌人类型、升级规则和敌人序列共用同一个可独立测试的数据源。关卡结算诊断将公开的奖励、结算行、行布局和计数表现四个探针绑定到纯关卡结算规则，不再把仅供诊断使用的辅助函数保留在游戏组合入口中。音频诊断现将全部 31 个清单、表现、声道优先级、暂停和生命周期探针隔离到显式绑定作用域中，不再留在单体调试适配器内。关卡流程诊断也通过同类的接收者保留边界隔离了全部 17 个幕布、关卡循环、通关、自动推进和 Game Over 生命周期探针。屏幕流程诊断隔离了标题计分、帧计数、选关输入节奏、标题演示/隐藏信息路由、最高分和全屏 Game Over 探针。敌人诊断隔离了携带者行为、目标选择、AI/移动节奏、受阻恢复、生成时间线和出生动画探针。完整公开调试快照也已成为纯投影模块，使其画面、时序、音频、关卡包、地图/编辑器和玩家记录都可独立编辑，而不会暴露运行时状态。

效果诊断现通过同一套显式且保留接收者的边界，隔离了爆炸规则、坦克摧毁时间线、敌人延迟释放、摧毁帧渲染和暂停时的子弹命中特效生命周期。

墙体诊断现通过显式状态/音频边界，隔离了钢墙破坏、定向砖块条带、砖块碎片渲染、铲子围墙时序和基地已毁后的铲子行为。

计时诊断现通过同一套显式且保留接收者的边界，隔离了全局倒计时节奏、暂停时的护盾可见性、定时器道具冻结、最后一个冻结帧和冻结期间的敌人生成。

道具诊断现通过显式状态/音频边界，隔离了类型选择、共享随机消耗、可见性与暂停行为、TTL 与拾取、拾取渲染与清除、地形影响、可达出生点轮换和携带者触发清除。

升级诊断现通过同一套显式状态/音频边界，隔离了星星等级规则、升级坦克外观覆盖层渲染和三级坦克生存能力。

战斗诊断现通过同一套显式状态/音频边界，隔离了头盔保护、玩家/敌方子弹碰撞、出生锁定、子弹上限与发射输入、交叉抵消、场地边界、地形命中音效和友军火力行为。

地形诊断现通过同一套显式状态/音频边界，隔离了地形表面、基地围墙优先级、基地摧毁时序与渲染、坦克占位以及敌方重叠恢复。

玩家移动诊断现通过同一套显式状态/音频边界，隔离了固定帧节奏、履带动画、友军火力眩晕时序、WASD 方向别名、转向对齐、砖块脱困、冰面惯性以及冰面/森林渲染层。

玩家生命周期诊断现通过同一套显式状态/音频边界，隔离了死亡/重生时序、双人 Game Over 信息、信息渲染和奖励生命推进。

暂停诊断现通过同一套显式状态/音频边界，隔离了暂停切换、暂停期间的关卡完成检测和暂停帧渲染。

分数诊断现通过同一套显式状态/音频边界，隔离了手雷计分、敌人出生保护、分数提示创建和暂停时的分数提示生命周期。

## 运行

在浏览器中打开 `index.html`，或在本地托管该文件夹：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:8765/index.html`。

## 验证

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
node --check src/runtime/debug-api.js
node --check src/game.js
node --check tests/helpers/test-file-discovery.js
node --check tools/build-free-stage-pack.js
node tests/run-tests.js
git diff --check
```

## 项目结构

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
|   |   `-- debug-api.js
|   `-- game.js
|-- tests/
|   |-- helpers/
|   |   |-- browser-game-harness.js
|   |   |-- load-browser-scripts.js
|   |   `-- test-file-discovery.js
|   |-- integration/
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
|   |   |-- audio-diagnostics.test.js
|   |   |-- audio-mix-rules.test.js
|   |   |-- audio-presentation.test.js
|   |   |-- battle-hud-presentation.test.js
|   |   |-- battle-random.test.js
|   |   |-- battlefield-grid.test.js
|   |   |-- browser-entry.test.js
|   |   |-- built-in-stage-pack.test.js
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
|   |   |-- game-over-entry-runtime.test.js
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
|   |-- dev-server.js
|   `-- smoke-test.js
|-- index.html
|-- styles.css
|-- reasonix.toml
|-- README.md
`-- README.zh-CN.md
```

`src/config/` 负责关卡包配置共享的数据校验：`value-normalization.js` 校验数值范围和颜色；`game-session-settings.js` 接管初始生命、排序后的奖励生命阈值、死亡星级和定时器冻结敌人开关；`combat-settings.js` 接管弹丸尺寸/出生/边界几何以及双人友军伤害开关和眩晕时序；`enemy-ai-settings.js` 接管交叉点寻路、受阻重试、目标轴概率和旧 AI 字段别名；`enemy-spawn-settings.js` 接管逐关生成曲线、关卡/扩展循环下限、双人减法、旧倍率兼容和纯间隔计算；`enemy-types.js` 接管四类默认敌人定义、移动/子弹速度档位、道具类型名称、敌人类型克隆与校验，以及单关敌人规格规范化；`explosion-settings.js` 接管九类嵌套爆炸 TTL/颜色默认值、深克隆和关卡包覆盖校验；`player-movement-settings.js` 接管固定逻辑循环中的移动速度、原版四帧三次移动 cadence、旧版仅覆盖速度时的兼容行为、冰面惯性和独立配置克隆；`player-upgrades.js` 接管四个星星升级等级、独立克隆和关卡包覆盖校验；`power-up-settings.js` 接管头盔/铲子/定时器持续时间、携带者释放和清理规则、拾取分数及其校验；`stage-flow-settings.js` 接管最终关循环、扩展循环地图/敌人数据选择和双人通关领先奖励；`timing-settings.js` 接管固定逻辑循环中的关卡、出生、重生、重试、无敌和道具寿命时序；`stage-settings.js` 接管活动敌人上限、默认玩家/敌人/道具出生布局、严格的 13x13 坐标校验以及图块到像素的转换。`src/core/` 存放不依赖 DOM 或 Canvas、可同时用于浏览器和 Node 的纯规则；共享战斗随机数、四方向常量/向量、独立帧计数器和矩形几何已迁入该目录。`src/editor/` 接管 Construction 输入/地形规则，以及不依赖浏览器存储或文件 API 的带版本存档文档、旧存档解析、单关卡包组装和 JSON 编解码。`src/entities/` 接管可变游戏实体记录：`player-state.js` 创建完整的单双人玩家记录，并在不丢弃持久得分、生命、击杀或升级状态的前提下复位位置、摧毁、保护、射击、滑行和履带等瞬态；`enemy-state.js` 将类型/序列数据实体化为已放置的敌人，包含独立装甲颜色、出生/重载计时、携带道具数据、移动 cadence 标志以及干净的 AI/摧毁状态；`projectile-state.js` 根据坦克几何、方向、升级/类型战斗数值和关卡包弹丸几何，创建玩家/敌人共用的子弹记录；`power-up-state.js` 在运行时完成随机/地形过滤后，根据已校验战场位置和配置寿命创建可拾取的 12px 道具；`transient-effect-state.js` 创建爆炸与分数提示记录，并在保留存活对象标识的同时推进两者共用的 TTL 生命周期。`src/rules/score-rules.js` 修改玩家分数与奖励生命进度，并返回运行时执行最高分持久化和音频副作用所需的结果；`stage-result-rules.js` 选择结算奖励接收者、生成逐类型结算行/汇总，并计算原版计数与揭示时间轴；`tank-collision-rules.js` 接管实体矩形、精确子弹中心命中范围、有效碰撞对象过滤、总重叠面积、战场/基地阻挡，以及严格减小地形/坦克重叠的脱困规则；`terrain-collision-rules.js` 接管 16px 图块、8px 钢墙象限和 4px 砖块碎片几何、重叠掩码与精确固体地形面积。`src/stages/` 负责关卡域：`stage-grid.js` 提供图块常量、砖块碎片状态、网格修改与校验以及 13x13/26x26 编解码；`enemy-sequences.js` 接管 35 关敌人编组表、每关 20 辆敌人的展开、携带者位置、出生点轮转和序列摘要；`stage-pack.js` 组合全部配置校验器、强制校验完整地图/敌人/关卡数量、支持两种地图编码，并构建运行时网格与敌人查询方法；`stage-routing.js` 将显示用的 1-70 关循环映射到有限的地图/敌人数据，并解析敌人总数和单双人容量上限。`src/game.js` 仍是组合入口和旧运行时；随着行为迁移到显式模块 API，该文件必须持续缩小。`tests/helpers/` 负责可复用的 Canvas、音频、DOM、存储、输入和脚本加载模拟。`tests/unit/` 直接验证纯模块，`tests/integration/` 通过真实浏览器 API 验证已抽离的配置、基础会话规则、得分/奖励生命与结算推进、固定逻辑时序、精确到碎片的地形/坦克/子弹碰撞与脱困、弹丸/友军伤害规则、子弹、敌人、道具和短生命周期视觉效果的创建/推进、编辑器保存/加载/导出/导入/测试关卡流程、敌人 AI、敌人生成节奏、爆炸设置、玩家移动/cadence、玩家状态/重生、道具设置、关卡流程、关卡设置、关卡网格、关卡包导入、关卡路由、敌人序列和星星升级行为，`tests/run-tests.js` 会先运行这两层测试，再运行 `tools/smoke-test.js` 中剩余的回归套件。

`src/config/power-up-settings.js` 现已接管已校验配置背后的纯携带者状态判定：受击时是否释放携带的道具，以及新携带者出生时是否清除当前未拾取道具。运行时代码只保留实际生成和清除副作用。

`src/entities/enemy-state.js` 现已同时接管完整敌人记录创建和销毁状态推进。满足 cadence 的 tick 会规范化计数器、保留已配置爆炸阶段、额外固定显示 6 tick 分数，并只在精确边界释放敌人槽位；`src/game.js` 提供槽位 cadence 和后备爆炸时长，再在收到释放结果时累加全局击败敌人数。

`src/entities/player-state.js` 现已接管完整玩家记录创建、关卡/重生复位以及保留式死亡生命周期。它会拒绝非存活、已在销毁或受保护玩家的命中，初始化死亡降级/计时并清理瞬态战斗状态，只在有效移动帧推进重生 tick，并在最后一命结束时判定立即重生准备或淘汰。运行时代码保留音频、出生位置恢复、保护激活和单玩家 GAME OVER 提示。

`src/audio/audio-presentation.js` 接管固定帧声部时长与音符投影、全局或逐声部可听性选择，以及由清单驱动的玩家/敌人移动循环相位。薄运行时适配器只注入所选清单事件，`src/game.js` 保留 Web Audio 缓冲区/振荡器创建、暂停/恢复行为及全部播放副作用。直接单元测试锁定异常输入、片段/重复边界、静音音符、增益和移动相位；浏览器集成测试保留原先位于 smoke 套件中的代表性计分音、移动相位、冰面提示音和开场音探针。

`src/audio/audio-mix-rules.js` 接管纯脉冲一、脉冲二、三角波和噪声声道优先级矩阵，以及移动循环模式选择。它会区分游戏正处于暂停状态和暂停提示音仍在播放的状态，保留彼此独立的声道，并让玩家移动请求检测保持懒执行，避免已被阻塞的状态改变运行时工作量或演示模式行为。`src/game.js` 提供当前事件标志并执行节点同步。直接单元测试锁定完整优先级矩阵；浏览器集成测试集中接管原先散落在 smoke 套件中的跨声道探针。

`src/audio/fixed-frame-audio-state.js` 接管所有保留音效的创建、开始/复位转换、暂停保持选择、固定帧推进和精确结束帧钳位。运行时拥有的 Web Audio 节点句柄仍作为各状态中的不透明条目，只由 `src/game.js` 停止或重建。直接单元测试锁定独立状态记录、节点所有权保留、暂停模式、非法时长回退和完成边界；浏览器集成测试集中接管原先位于 smoke 套件中的一帧、暂停、暂停中继续运行、重新触发、清理和最终帧生命周期探针。

`src/audio/free-audio-manifest.js` 接管 `data/free-audio-manifest.json` 的深冻结浏览器模块副本，以及运行时使用的独立深克隆 API。单元测试逐事件对照 JSON 数据源，锁定全部保留时长/声道布局、敌方射击保持静音，以及嵌套克隆隔离；浏览器集成测试验证模块注册，并确认每次公开运行时克隆都与 JSON 数据源一致，同时不会暴露内部冻结对象。

`src/editor/editor-rules.js` 接管六种地形的浏览器调色板、14 步原版 Construction 块序列、方向键/WASD 映射与按住优先级、整格光标钳位、面板色块命中测试、图块循环、光标到单元格转换，以及精确的砖块碎片/钢墙象限编辑。`src/editor/editor-stage-format.js` 接管紧凑的版本 2 本地存档序列化、旧版 13x13 `rows` 与当前 26x26 `quadrants` 格式的兼容加载、可复用的 JSON 解析结果、默认单关导出/测试关卡包组装，以及带缩进的导出序列化。`src/game.js` 现在只保留编辑器屏幕状态、本地存储/剪贴板/文件副作用、消息、音效和事件接线。单元测试锁定两种存档编码、JSON 语法错误与存档结构错误的区分、相互独立的默认关卡包记录、出生点、敌人构成和序列化输出；浏览器集成测试接管原先位于 smoke 中的完整保存、清空、加载、导出、文件导入、Construction 关卡安装、即时测试和复位流程。

`src/runtime/editor-input-runtime.js` 接管 Construction 模式的固定帧输入编排：光标移动、原版 A/B 图案循环、整格与象限绘制、画笔选择、图块循环以及方向键长按重复。它通过显式回调执行地图修改和音效，`src/game.js` 只保留 Canvas 坐标换算与 DOM 事件接线；直接测试覆盖原版图案掩码、边界安全编辑、画笔选择和 20 帧重复节奏。

`src/runtime/input-runtime.js` 接管浏览器输入路由：工具栏动作、键盘屏幕分派、一次性射击/选关按键、暂停音频交接、关卡包文件导入和 Construction 鼠标编辑。它保留方向键/WASD 映射、演示退出路径、隐藏信息输入保留、编辑器快捷键、坐标换算和暂停门控；`src/game.js` 只提供显式回调。直接测试锁定注册、动作分派、暂停同步顺序、键盘路由和鼠标坐标。

`src/runtime/stage-select-runtime.js` 接管关卡选择页的固定帧 A/B 输入节奏：先消费一次性按键，再处理长按重复；重复发生在原版八帧边界；A/B 同时到达时保留 A 优先级。关卡映射和屏幕状态转换仍通过 `src/game.js` 的显式回调执行。

`src/runtime/post-game-runtime.js` 接管固定帧全屏 GAME OVER 与最高分屏幕生命周期：音频交接、定时结束、Start/Escape 跳过、高分分支和标题状态复位。现有最高分比较与阶段结算转换仍保留在模块外，并通过显式回调接入。

`src/runtime/stage-flow-runtime.js` 接管关卡结算屏幕转换：进入通关/游戏结束结算、选择下一关或停止路线、关闭关卡幕布、启动下一关以及计算场内 GAME OVER 时长。`src/runtime/stage-result-runtime.js` 继续负责结算投影和奖励副作用，音频清理与生命周期入口通过显式回调接入。

`src/runtime/battle-outcome-runtime.js` 接管固定帧战斗结束判定：演示模式结束、基地/玩家 GAME OVER 触发、敌人清空后的延迟、玩家 GAME OVER 延长、帧计数器复位以及进入关卡结算转换。实际屏幕转换通过回调交给 `stage-flow-runtime`，原版 60 Hz 边界行为可以单独测试。

`src/runtime/battle-loop-runtime.js` 接管固定帧战斗更新顺序：冻结与实体计时器、玩家/敌人更新、地形效果、投射物、分数提示、道具、玩家 GAME OVER 文本、敌人生成、结束判定和移动音频同步。游戏结束后的场内帧通过同一个 API 关闭输入和结束检查。

`src/runtime/frame-loop-runtime.js` 接管固定 60 Hz 累积器、每个 RAF 的渲染调度和 80ms 长间隔上限。渲染回调仍在每个浏览器帧执行，而逻辑更新只按固定步长推进，因此高刷新率显示器不会改变游戏时序；直接测试覆盖半步节奏、补帧和长间隔边界。

`src/runtime/screen-update-runtime.js` 接管标题、隐藏信息、最高分、全屏 GAME OVER、选关、编辑器、关卡开场/结算、暂停和战斗结束场内帧的固定帧分派。它保留原有分支顺序，并通过显式回调注入音频、过渡、结算和战斗副作用；单元测试覆盖过渡边界、结算计数、Game Over、编辑器、暂停和活动战斗路由。

`src/runtime/title-render-runtime.js` 接管标题菜单、隐藏信息、最高分和全屏 GAME OVER 的像素 Canvas 绘制。它保留现有像素字体几何、标题菜单光标、调色板、隐藏掉落精灵和终局画面时序，并通过显式回调提交文字/精灵；直接测试覆盖屏幕背景、计分/菜单布局、隐藏信息内容和终局表现调用。

`src/runtime/terrain-render-runtime.js` 接管战场地形层、砖块碎片、钢墙象限、水/冰/森林图块、基地和冰面子弹遮罩。它保留原有绘制顺序、4px 碎片几何、8px 象限掩码、水面相位和基地调色板，并使用共享精灵提交回调；直接测试覆盖图层选择、地形动画、遮罩精确坐标、背景几何和基地状态。

`src/runtime/tank-render-runtime.js` 接管坦克主体/履带、玩家星星升级覆盖层、护盾和玩家/敌人出生动画。它保留方向几何、携带者/升级颜色回调、暂停安全的护盾相位、配置的出生时长和现有 Canvas 精灵顺序；直接测试覆盖玩家覆盖层、精确战场偏移、护盾颜色和玩家出生尺寸。

`src/runtime/power-up-render-runtime.js` 接管道具闪烁相位、精灵尺寸居中、背景框绘制以及六类道具（包括星星）图标的清单提交。它保持暂停期间仍使用独立显示帧相位，并保留 12px 道具到清单精灵尺寸的几何换算；直接测试覆盖闪烁边界、精确居中、图标调色板和隐藏帧。

`src/runtime/projectile-render-runtime.js` 接管子弹精灵提交：清单尺寸缩放、战场偏移以及玩家/敌方子弹的不同调色板。移动、数量上限、碰撞和命中解析仍由原有战斗模块负责；直接测试覆盖玩家缩放子弹、敌方原尺寸子弹和精确整数坐标。

`src/runtime/effect-render-runtime.js` 接管瞬态爆炸、玩家/敌人摧毁序列、基地摧毁和分数提示的 Canvas 绘制。它保留现有表现投影、配置的爆炸颜色、摧毁帧顺序与战场偏移，并通过显式回调提交精灵/文字；直接测试覆盖绘制顺序、分数态文字、摧毁调色板和模块注册。

`src/runtime/stage-result-render-runtime.js` 接管关卡完成结算页：分数标题、单人/双人结算行、居中的坦克图标、方向箭头、奖励行、总计、分数格式化和关闭幕布。它保留原有 256x240 整数几何，并通过兼容 API 暴露结算辅助函数；直接测试锁定双人结算行坐标，防止中间坦克图标与箭头再次重叠。

`src/runtime/battle-hud-render-runtime.js` 接管战斗中的右侧信息栏、暂停文字、场内 GAME OVER 横幅、玩家 GAME OVER 提示及其布局辅助函数。它保留固定像素字体几何、敌人计数/生命数投影、暂停闪烁相位和双人紧凑 GAME OVER 字形；直接测试覆盖面板坐标、横幅计时回调、暂停可见性和旗帜几何。

`src/runtime/editor-render-runtime.js` 接管 Construction 战场渲染：可编辑地形层、基地、闪烁光标坦克和六类图块图例。它保留原有 256x240 战场几何、16px 图块定位、16 帧光标闪烁、图块掩码和画笔高亮，并通过显式回调提交地形绘制；直接测试覆盖后备网格创建、光标可见性、图例坐标和每类图块渲染器。

`src/runtime/screen-transition-render-runtime.js` 接管选关页、选关关闭幕布、关卡开场战场/幕布渲染和幕布状态适配。它保留原有 256x240 整数几何、上下覆盖行、关卡文字裁剪、配置的开场时长和过渡计时器来源；直接测试覆盖选关文字、关闭填充顺序、开场裁剪和状态参数。

`src/runtime/text-render-runtime.js` 接管普通文字、裁剪文字和右对齐文字共用的整数像素字体提交路径。它保留大写字形查找、整数起点取整、缩放/步进默认值、裁剪相交和右边缘对齐；直接测试覆盖精确字形矩形、裁剪、空裁剪列表和右对齐调用流程。

`src/runtime/sprite-render-runtime.js` 接管免费精灵清单帧查找，以及原尺寸/缩放 Canvas 矩形提交。它保留角色调色板优先级、部件颜色回退、填充/描边操作和小数缩放几何；直接测试覆盖原尺寸帧、缩放帧、回退颜色、缺失帧和模块注册。

`src/runtime/battle-scene-render-runtime.js` 接管战斗场景 Canvas 组合顺序：背景、战场、地形、基地、玩家、敌人、子弹、子弹遮罩、上层地形、道具、爆炸、摧毁覆盖层、分数提示、玩家 GAME OVER 文字和右侧栏。它保留出生/死亡过滤、暂停护盾可见性、显示帧读取和所有遮挡边界；直接测试锁定完整回调序列。

`src/runtime/screen-render-runtime.js` 接管顶层 Canvas 屏幕路由：黑底清屏、标题/隐藏信息/最高分/全屏 GAME OVER、选关、Construction、开场/结算、活动战斗，以及最终 GAME OVER/暂停覆盖层顺序。各屏幕的具体绘制仍由专用渲染器负责；直接测试覆盖全部路由和 Game Over/暂停组合。

`src/stages/battlefield-grid.js` 统一程序化生成、Construction、关卡启动和铲子道具共享的战场几何。它冻结五个围墙格、基地格和六个标准清理矩形，保留更宽的程序化地图保留区，初始化空白 Construction 战场，在保留定制出生区域编辑的同时打开基地格，并在配置的铲子闪烁窗口中选择砖墙/钢墙。直接单元测试锁定所有坐标与修改边界；浏览器集成测试验证真实编辑器围墙，并接管原先位于 smoke 中的铲子围墙断言。

`src/stages/built-in-stage-pack.js` 使用共享的规范化默认配置、克隆的敌人定义、35 关原版风格敌人序列和程序化地图回退，组合出相互独立且可变的运行时关卡包。它还接管保留的敌人规格转换，以及仅在序列数据缺失时使用的旧后备类型曲线。单元测试锁定完整关卡包契约、默认设置、地图来源选择、代表性敌人记录、后备边界和克隆隔离；浏览器集成测试对照公开 schema 与敌人摘要，并验证真实第 1 关启动地图。

`src/stages/procedural-stage.js` 接管活动运行时关卡数据源缺少地图时的确定性备用地图生成。它通过冻结的浏览器/Node API 保留带种子的随机数序列、逐关密度和地形阈值、每三关一次的镜像 cadence、七关 motif 循环、出生保留区以及最终战场清理。单元测试锁定随机数前缀、阈值边界、全部 motif、相互独立的网格状态，以及重构前第 1-7 关和第 35 关的黄金地图；浏览器集成测试通过真实标题页和选关流程验证第 1、2 关。

`src/stages/stage-pack-schema.js` 接管公开 `stagePackSchema()` API 返回的全新可编辑示例：规范化默认设置、克隆的敌人/升级数据、固定墙体元数据、默认出生坐标、文档化的两种地图编码、示例敌人延迟及图块代码说明。单元测试锁定全部可读区段、克隆隔离和重构前完整 6,498 字节 JSON 的 SHA-256；浏览器集成测试证明公开适配器与纯模块一致，并且不受已加载自定义关卡包影响。

`src/stages/stage-runtime.js` 将纯路由/配置/网格模块绑定到动态读取的游戏状态。其冻结运行时 API 接管活动关卡包回退、显示/地图/敌人关卡解析、逐关敌人总数与单双人容量、默认/自定义出生点查询、地图解码/程序化回退、敌人规格回退及规范化关卡序列。直接测试让同一个运行时在内置、自定义、原始 quadrants、无地图和演示状态间切换；浏览器集成测试验证公开关卡包诊断，并从 `src/game.js` 删除对应查询包装函数。

`src/runtime/` 包含运行时拆分后形成的浏览器组合边界。`shared-state.js` 创建唯一的可变状态图以及固定布局/时序常量；`module-deps.js` 校验脚本顺序并公开显式依赖桶；`game-lifecycle.js` 接管最高分持久化及标题、关卡、编辑器、关卡包加载和过渡编排；`audio-bridge.js` 接管 Web Audio 节点创建与事件同步；`debug-api.js` 把保留的运行时函数适配为公开测试/诊断 API。`audio-diagnostics.js` 通过保留接收者的函数绑定和 142 个显式解构的运行时符号，接管连续的 31 个清单、表现、移动、优先级、暂停和固定帧生命周期探针，且不使用 `eval`；抽离该模块并清理死别名后，`debug-api.js` 从 8,957 行降至 6,171 行。其单元测试锁定方法顺序、输入校验、绑定优先级和克隆隔离；浏览器集成测试依次执行全部探针，并保持重构前 61,974 字节输出的 SHA-256。`stage-pack-diagnostics.js` 接管 `currentPackInfo()` 与 `debugSnapshot()` 关卡包区段共用的精确克隆投影，包括路由元数据、规范化设置、敌人类型、升级/墙体规则、出生布局和活动敌人序列。`stage-result-diagnostics.js` 将四个冻结的公开关卡结算探针绑定到纯规则，规范化诊断玩家记录，投影奖励领取者、结算行得分/布局间距和计数/揭示时序，并从 `src/game.js` 删除两个仅供调试使用的辅助函数。其单元测试覆盖输入规范化、奖励资格、动态时序覆盖、表现边界和输出隔离；浏览器集成测试锁定公开 API 顺序及重构前 1,478 字节输出哈希。`stage-flow-diagnostics.js` 通过保留接收者的函数绑定和 49 个显式解构的运行时符号，接管连续的 17 个幕布、关卡循环、通关、自动推进和 Game Over 探针，且不使用 `eval`；抽离该模块并清理 17 个死别名后，`debug-api.js` 从 6,171 行降至 5,483 行。其单元测试锁定输入校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引依次执行全部 17 个探针，并保持重构前 13,047 字节输出的 SHA-256。`screen-flow-diagnostics.js` 通过保留接收者的函数绑定和 57 个显式解构的运行时符号，接管连续的 11 个标题计分、帧计数、选关节奏、标题演示/隐藏信息、最高分和全屏 Game Over 探针，且不使用 `eval`；抽离该模块并清理 32 个死别名后，`debug-api.js` 从 5,483 行降至 4,833 行。其单元测试锁定输入校验、精确方法顺序、绑定优先级、接收者身份和克隆布局输出；浏览器集成测试在原公开索引依次执行全部 11 个探针，并保持重构前 25,534 字节输出的 SHA-256。`enemy-diagnostics.js` 通过保留接收者的函数绑定和 34 个显式解构的运行时符号，接管连续的 11 个携带者、敌人表现、目标选择、AI/移动节奏、受阻恢复、生成时间线和出生动画探针，且不使用 `eval`；抽离该模块并清理 4 个死别名后，`debug-api.js` 从 4,833 行降至 4,497 行。其单元测试锁定输入校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引依次执行全部 11 个探针，并保持重构前 3,839 字节输出的 SHA-256。`debug-snapshot.js` 现已接管完整的 95 字段公开状态投影：画面与固定计数器、全部 17 个保留音频事件、关卡包诊断、分数提示、战场/编辑器网格、场地几何和独立克隆的玩家摘要。单元测试锁定精确字段顺序、音频事件映射、代表值和克隆隔离；浏览器集成测试验证模块注册、薄适配器和重复调用隔离。

`effect-diagnostics.js` 通过保留接收者的函数绑定和 31 个显式解构的运行时符号，接管连续的 5 个爆炸规则、坦克摧毁、敌人释放、渲染帧和暂停命中特效探针，且不使用 `eval`。抽离并移除 7 个死适配器后，`debug-api.js` 保留 4,175 个物理行。其单元测试锁定输入校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引 130-134 依次执行全部 5 个探针，并保持重构前 6,548 字节输出的 SHA-256。

`wall-diagnostics.js` 通过保留接收者的函数绑定、29 个显式解构的运行时符号和实时砖块命中音频记录，接管连续的 5 个钢墙破坏、定向砖块条带、砖块碎片渲染、铲子围墙时序和基地已毁后的铲子探针，且不使用 `eval`。抽离后，`debug-api.js` 保留 3,979 个物理行，未产生死适配器。其单元测试锁定状态/音频校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引 51-55 依次执行全部 5 个探针，并保持重构前 1,929 字节输出的 SHA-256。

`timer-diagnostics.js` 通过保留接收者的函数绑定和 18 个显式解构的运行时符号，接管连续的 7 个定时器规则、全局倒计时、护盾节奏/暂停、冻结行为、最后冻结帧和冻结期间生成探针，且不使用 `eval`。抽离并移除 3 个死适配器后，`debug-api.js` 保留 3,557 个物理行。其单元测试锁定输入校验、精确方法顺序、绑定优先级、接收者身份和状态恢复；浏览器集成测试在原公开索引 67-73 依次执行全部 7 个探针，并保持重构前 2,184 字节输出的 SHA-256。

`power-up-diagnostics.js` 通过保留接收者的函数绑定和 54 个显式解构的运行时符号（包括实时拾取音频记录及映射后的道具类型/随机表别名），接管连续的 15 个类型池/共享随机、可见性/暂停、TTL/拾取、拾取渲染/足迹、地形变更、出生筛选/轮换和携带者清除探针，且不使用 `eval`。抽离并移除 13 个死适配器后，`debug-api.js` 保留 3,042 个物理行。其单元测试锁定状态/音频校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引 75-89 依次执行全部 15 个探针，并保持重构前 7,420 字节输出的 SHA-256。

`upgrade-diagnostics.js` 通过保留接收者的函数绑定、17 个显式解构的运行时符号和实时玩家摧毁音频记录，接管连续的 3 个星星升级规则、升级坦克覆盖层和三级坦克生存探针，且不使用 `eval`。抽离后，`debug-api.js` 保留 2,894 个物理行。其单元测试锁定状态/音频校验、精确方法顺序、绑定优先级和接收者身份；浏览器集成测试在原公开索引 94-96 依次执行全部 3 个探针，并保持重构前 702 字节输出的 SHA-256。

`combat-diagnostics.js` 通过保留接收者的函数绑定、41 个显式解构的运行时符号和 5 个实时音频记录，接管连续的 12 个头盔保护、玩家/敌方子弹碰撞、出生锁定、子弹上限/发射输入、交叉抵消、子弹边界、地形命中音效和友军火力探针，且不使用 `eval`。抽离并移除 15 个死适配器后，`debug-api.js` 保留 1,457 个物理行。其单元测试锁定状态/按键/待发射/音频校验、精确方法顺序、绑定优先级和输出作用域；浏览器集成测试在原公开索引 101-112 依次执行全部 12 个探针，并保持重构前 5,147 字节输出的 SHA-256。

`player-movement-diagnostics.js` 通过保留接收者的函数绑定、42 个显式解构的运行时符号和实时冰面移动/玩家射击音频记录，接管连续的 11 个固定帧节奏、履带动画、友军火力眩晕、WASD 输入、转向对齐、砖块脱困、冰面移动以及冰面/森林图层探针，且不使用 `eval`。抽离并移除 6 个死适配器后，`debug-api.js` 保留 2,312 个物理行。其单元测试锁定状态/按键/音频校验、精确方法顺序、绑定优先级和状态恢复；浏览器集成测试在原公开索引 113-123 依次执行全部 11 个探针，并保持重构前 2,414 字节输出的 SHA-256。

`terrain-diagnostics.js` 通过保留接收者的函数绑定、40 个显式解构的运行时符号和 3 个实时音频记录，接管连续的 6 个地形表面、基地围墙优先级、基地摧毁时序/渲染、坦克占位和敌方重叠恢复探针，且不使用 `eval`。抽离并移除 18 个死适配器后，`debug-api.js` 保留 1,068 个物理行。其单元测试锁定状态/按键/待发射/音频校验、精确方法顺序、绑定优先级和碰撞输出作用域；浏览器集成测试在原公开索引 124-129 依次执行全部 6 个探针，并保持重构前 6,225 字节输出的 SHA-256。

`player-lifecycle-diagnostics.js` 通过显式且保留接收者的状态/音频作用域接管连续的 4 个死亡/重生、双人 Game Over 信息、信息渲染和奖励生命探针，且不使用 `eval`。抽离并清理死适配器后，`debug-api.js` 从 1,068 行降至 638 个物理行。其单元测试锁定输入校验、精确方法顺序、接收者绑定和状态恢复；浏览器集成测试在原公开索引 97-100 依次执行全部 4 个探针，并保持重构前 5,172 字节输出的 SHA-256。

`pause-diagnostics.js` 通过显式且保留接收者的状态/音频作用域接管连续的 3 个暂停切换、暂停期间关卡完成检测和暂停帧渲染探针，且不使用 `eval`。抽离并清理死适配器后，`debug-api.js` 从 638 行降至 488 个物理行。其单元测试锁定输入校验、精确方法顺序、接收者绑定和状态恢复；浏览器集成测试在原公开索引 36-38 依次执行全部 3 个探针，并保持重构前 973 字节输出的 SHA-256。

`score-diagnostics.js` 通过显式且保留接收者的状态/音频作用域接管连续的 4 个手雷计分、手雷出生保护、分数提示和暂停时分数提示探针，且不使用 `eval`。抽离并清理死适配器后，`debug-api.js` 从 488 行降至 218 个物理行。其单元测试锁定输入校验、精确方法顺序、接收者绑定和状态恢复；浏览器集成测试在原公开索引 90-93 依次执行全部 4 个探针，并保持重构前 1,095 字节输出的 SHA-256。

敌人诊断模块还公开 `createEnemySpawnOverlapDiagnostics` 工厂，承载原本位于计时器诊断之后的敌人出生重叠探针。状态构造已移出 `debug-api.js`，同时保持原公开 API 位置不变；当前适配器为 77 个物理行。

`panel-diagnostics.js` 通过同一套保留接收者的作用域接管连续的两个敌人计数和生命计数面板探针，且不使用 `eval`。其单元测试锁定输入规范化、绑定优先级、方法顺序和输出投影；浏览器集成测试验证模块注册、原公开索引 135-136 以及重构前 133 字节输出的 SHA-256。

`power-up-runtime.js` 接管从 `src/game.js` 抽出的实时道具边界：携带者释放与清除、刷新点校验与轮换、TTL 推进、拾取计分以及效果副作用。模块通过显式回调接入游戏设置、地形、碰撞、音频、计分和敌人摧毁逻辑，并注册保持不变的 `state.fn` 接口。其单元测试覆盖初始化校验、函数注册、刷新轮换、拾取、星星升级、携带者释放和瞬态状态清理；现有浏览器道具测试继续覆盖真实游戏路径。

`enemy-spawn-runtime.js` 接管从 `src/game.js` 抽出的实时敌人生成边界：活动槽位容量、出生点占用重试时序、携带者清理、敌人实体创建以及按玩家数缩放的固定帧生成节奏。其单元测试锁定 `state.fn` 注册、序列上限、显式延迟、默认节奏、出生点占用重试和携带者回调；现有浏览器敌人诊断继续验证真实关卡流程。

`enemy-ai-runtime.js` 接管从 `src/game.js` 抽出的敌人决策辅助：随机/玩家/HQ 阶段选择、按槽位选择玩家目标、横向优先方向判断、开火概率和 AI 概率匹配。模块接收现有战斗随机回调，不创建第二条随机流；其单元测试锁定阶段边界、目标投影、方向选择和开火决策。

`enemy-movement-runtime.js` 接管从 `src/game.js` 抽出的敌人移动逻辑：交替移动 cadence、重叠脱困、阻塞重试、待转向、交叉点寻路、方向反转和履带相位推进。其单元测试锁定 cadence 跳过、严格降低重叠面积、重试时序和转向决策；现有敌人、地形和玩家移动浏览器诊断继续覆盖真实路径。

`enemy-update-runtime.js` 接管从 `src/game.js` 抽出的固定帧敌人更新边界：摧毁动画释放、定时器冻结敌人、出生动画推进、重载递减、移动分派和开火调度。其单元测试锁定冻结中的敌人仍会完成出生动画、但不会移动、重载或射击；现有定时器、敌人状态、战斗和分数浏览器探针继续覆盖真实路径。

`tank-movement-runtime.js` 接管从 `src/game.js` 抽出的固定帧坦克移动边界：碰撞 peer 过滤、地形/基地占位、重叠面积恢复支持、冰面识别、转向对齐、履带相位切换和垂直转向判断。其单元测试锁定移动阻挡、活动 peer 选择、地形投影、冰面识别、履带相位和对齐行为；现有浏览器地形与玩家移动诊断继续覆盖真实路径。

`src/runtime/player-movement-runtime.js` 接管固定帧玩家移动边界：配置速度应用、冰面滑行启动/延续、垂直转向对齐、受击停顿门控和履带相位更新。它通过显式回调接入地形移动与音效，保留滑行移动中两次读取设置的原有行为；直接测试覆盖普通转向、滑行、锁定冰面移动、受击阻挡和履带更新。

`src/runtime/game-over-entry-runtime.js` 接管进入场内 GAME OVER 状态：精确的 14 路音频停止顺序、演示结束、重复进入保护、固定计数器复位、扩展高字节、基地/提示清理、高分比较和场内计时器初始化。直接测试同时保留原有未停止的音频通道、实际清理调用和状态转换细节。

`transient-effects-runtime.js` 接管从 `src/game.js` 抽出的爆炸与分数提示运行时边界：爆炸规则回退、命中/摧毁样式选择、基地摧毁持续时间、队列写入和固定帧 TTL 推进。Canvas 渲染仍保留在 `src/game.js`；其单元测试锁定显式依赖校验、规则回退、样式选择、提示默认坐标、TTL 推进和存活对象标识，现有浏览器瞬态效果集成测试则验证模块注册与公开行为不变。

`projectile-runtime.js` 接管从 `src/game.js` 抽出的固定帧射击边界：玩家升级档位查询、每辆坦克的活动子弹上限、按当前关卡包几何创建子弹、重载时序和仅玩家射击音效。碰撞与移动解析仍保持独立运行时边界；其单元测试锁定升级档位钳位、单/双子弹上限、速度与破墙等级传递、敌人静音和重载行为，浏览器子弹集成测试则验证模块注册与关卡包覆盖。

`projectile-target-runtime.js` 接管从 `src/game.js` 抽出的子弹目标副作用：基地摧毁、精确到碎片的砖/钢墙伤害、敌人受伤与携带者释放、友军伤害眩晕以及敌方子弹击杀玩家。其单元测试锁定原有副作用顺序和目标过滤；现有碰撞、地形、战斗、道具和音频浏览器探针继续覆盖真实路径。

`projectile-resolution-runtime.js` 接管从 `src/game.js` 抽出的固定顺序子弹命中分派：带边距的场地边界命中、地形/基地/坦克检查，以及边界爆炸和音频副作用。其单元测试锁定提前返回和地形/基地/坦克的精确顺序；现有子弹碰撞和命中规则集成测试继续覆盖真实路径。

`projectile-motion-runtime.js` 接管从 `src/game.js` 抽出的固定帧子弹步进边界：重置移除标志、按小数速度细分步数、按方向向量移动、逐步派发碰撞、对向子弹抵消以及过期子弹过滤。其单元测试锁定步数、提前命中终止、步进后抵消顺序、存活对象标识和标志重置；现有子弹碰撞、边界命中、定时器和战斗浏览器测试继续覆盖真实路径。

`public-api-adapters.js` 接管四组有序的公开入口：关卡包加载/校验、精灵与当前关卡包投影、`debugSnapshot()` 以及 `stagePackSchema()`。保留接收者的绑定让状态所有的加载器和依赖所有的投影保持显式，同时薄组合继续保持原公开索引 0-2、34-35、50 和 158。其单元测试锁定分组顺序、接收者优先级、校验和输出路由；浏览器集成测试验证公开位置，并移除原先动态适配器函数体。最终 `debug-api.js` 为 77 个物理行，且不再包含 `eval`。

`src/presentation/free-sprite-manifest.js` 接管 `data/free-sprite-manifest.json` 的深冻结浏览器模块副本，以及运行时公开的独立深克隆 API。单元测试逐项对照 JSON 中全部 14 类精灵，并锁定履带动画相位、六种带轮廓道具、五角星几何、钢墙螺栓、水面动画、隐藏掉落物相位、摧毁相位和克隆隔离；浏览器集成测试验证模块注册，并确认公开克隆无法修改内部冻结的替代图形。

`src/presentation/pixel-font.js` 接管冻结的 41 字形 5x7 字体、七个 3x5 紧凑 GAME OVER 字形、未知字符回退和右对齐几何。`src/game.js` 仅保留 Canvas 矩形提交、裁剪和条纹调色板绘制。单元测试锁定每个字形的行宽、二进制像素行以及缩放/步进对齐；浏览器集成测试验证标题/全屏条纹文字、普通 PAUSE 文字和双人淘汰紧凑文字全部使用整数矩形绘制，绝不调用抗锯齿 `fillText`。

`src/presentation/battle-hud-presentation.js` 接管右侧栏后备敌人/生命计数、16 帧 PAUSE 闪烁选择、场内 GAME OVER 的 127 帧滑入与 129 帧停留，以及双人模式单玩家淘汰时 32x8 紧凑提示的投影。薄运行时适配器在 Canvas 绘制前注入当前计数、暂停/演示标志和关卡包 GAME OVER 时序。直接单元测试锁定纯规则边界，浏览器集成测试保留原先位于 smoke 套件中的生命周期、音频耦合和像素占位探针。

`src/presentation/effect-presentation.js` 接管玩家/敌人/基地销毁、子弹命中与普通爆炸、固定或浮动分数文字的参考相位表、精灵几何和时间轴投影。薄运行时适配器在 Canvas 绘制前注入当前关卡包 TTL 与战场布局。直接单元测试覆盖全部纯投影，浏览器集成测试保留原先位于 smoke 套件中的生命周期和像素边界探针。

`src/presentation/screen-presentation.js` 接管标题计分组布局、108 帧全屏 GAME OVER 布局、460 帧 HIGH SCORE 调色板/居中时间轴，以及离散的关卡选择/结算闭幕与关卡开场幕布。薄运行时适配器在 Canvas 绘制前注入当前屏幕尺寸、关卡号、转场计时器和已配置的开场时长。直接单元测试锁定全部边界与参考坐标，浏览器集成测试保留原先位于 smoke 套件中的生命周期、输入、音频耦合和像素绘制探针。

`src/presentation/tank-presentation.js` 接管方向与履带帧名、星级升级叠层的几何/颜色、装甲颜色、携带道具与眩晕闪烁 cadence、护盾可见性/颜色以及四档尺寸的出生动画序列。`src/game.js` 保留 Canvas 精灵提交和调色板绘制。直接单元测试覆盖全部纯选择器，浏览器集成测试保留原先位于 smoke 套件中的运行时探针和像素级履带/升级外观断言。

`src/rules/enemy-ai-rules.js` 接管按槽位交替的移动 cadence、8px 转向路口、由间隔派生的随机/玩家/基地阶段、存活玩家目标选择、轴优先方向、精确到随机字节的 AI 概率，以及默认/自定义开火判断。`src/game.js` 仍从共享 NES 风格随机序列取字节，并执行移动、碰撞脱困、转向和射击，因此抽取不会改变随机数消费顺序。

`src/rules/enemy-spawn-rules.js` 接管存活敌人容量统计、倒序可复用槽位选择、14px 玩家/敌人出生点占用判断，以及显式或循环出生点索引选择。销毁中的敌人在释放前继续占用容量，但销毁中、已死亡或等待重生的坦克不会阻塞出生点；运行时代码保留重试倒计时、携带者清理和敌人创建。

`src/entities/power-up-state.js` 现已同时接管可拾取记录创建和单帧 TTL 推进。正 TTL 逐帧递减并在归零时立即移除，零或负值则保留同一对象作为不计时道具。

`src/rules/power-up-collection-rules.js` 接管活动玩家拾取资格、两个中心轴都严格小于 12px 的边界，以及双人同帧都满足条件时让 P2 优先的倒序槽位选择。运行时代码保留道具移除、计分、提示和拾取音效。

`src/rules/power-up-effect-rules.js` 接管六类道具的同步状态变化：手雷的敌人销毁请求、头盔保护延长、基地存活时的铲子计时、带上限的星星升级、定时器冻结，以及坦克加命。模块把地形、敌人和音频动作返回给 `src/game.js`，使这些运行时副作用不进入规则层；专用测试现已同时覆盖直接状态变化以及真实手雷/铲子/定时器路径。

`src/rules/power-up-spawn-rules.js` 接管原版 8 项道具随机表、稳定坐标去重、16 位均匀候选选择，以及存在替代位置时排除上次位置。运行时代码仍先依据战场边界、当前基地、固体地形和坦克占位过滤配置/回退位置，再把可达候选交给该模块。

`tests/helpers/test-file-discovery.js` 按稳定路径顺序递归发现 `*.test.js` 文件。`tests/run-tests.js` 使用它依次在隔离的 Node 进程中运行全部单元测试、全部集成测试，最后运行剩余 smoke 套件，因此新增功能测试不再需要手工维护运行器清单。

`tests/unit/readme-tree.test.js` 校验 UTF-8 解码与代码围栏配对，要求英文和中文文件树完全一致，并在排除 Git、Codex 与 Reasonix 元数据目录后，将文档中的文件逐项对照实际工作区。

`src/rules/projectile-collision-rules.js` 接管子弹中心距离判断，以及不同拥有者子弹的有序抵消。对应测试保留严格小于 6px 的边界、同拥有者排除、跳过已移除子弹、确定性配对顺序、高速交叉行为和无命中特效抵消。

`src/rules/projectile-impact-rules.js` 接管带 padding 的战场边界判断、夹紧后的边缘命中坐标，以及仅玩家触发的砖块/钢墙命中音效选择。对应测试保留包含边界等号的行为、208px 战场四边夹紧、敌方命中静音、钢墙阻挡音效和最高火力破坏钢墙音效。

`src/rules/wall-damage-rules.js` 接管关卡包诊断使用的冻结墙体规则元数据与独立克隆 API，以及定向象限选择、普通子弹按 4px 深度剥离砖块条带、强化子弹移除 8px 砖块象限和最高火力破坏钢墙象限。专用单元测试锁定元数据并直接覆盖左下和右下碎片掩码；浏览器集成测试验证 schema/当前关卡包投影，并保留此前位于单体 smoke 测试中的运行时调试探针行为。

迁移顺序依次为核心计时/随机/几何、配置与关卡包、游戏实体与规则、输入/编辑器、音频、渲染/画面、调试适配器，最后收敛应用启动入口。每次抽离都必须保留无需构建的静态启动方式，在同一提交中迁移对应测试，并在下一子系统开始前通过完整回归。重构和测试拆分全部完成前，暂停新增 1:1 游戏机制。

## 操作方式

- 标题画面：使用方向键或 `WASD` 选择 `1 PLAYER`、`2 PLAYERS` 或 `CONSTRUCTION`；按 `Enter`/`Space` 激活所选项目。`1`、`2` 和 `C`/`E` 仍可作为直接快捷键。未操作的标题画面待机 640 帧后会开始演示；按 `Enter`、`Space` 或 `Escape` 返回标题画面。
- 关卡选择：`Space`/`Z` 相当于 NES A 键，可在第 1 至 35 关之间向前选择；`F`/`X` 相当于 NES B 键，可向后选择。首次按键会在第一个 60 Hz 逻辑帧改关；按住 A 或 B 后，会在独立低帧计数器到达每个八帧边界时重复，每次触发都只重置低计数器而不改变高计数器。选择到第 1 或第 35 关后会保持在边界，不会首尾循环。`Enter` 开始所选关卡，`Escape` 返回标题画面。
- 玩家 1：方向键移动，`Space` 射击。在单人模式中，玩家 1 也可使用 `WASD` 移动。
- 玩家 2：双人模式中使用 `WASD` 移动，`F` 射击。
- 暂停：仅在活动战斗中可按作为键盘 Start 键的 `Enter`、`P`，或工具栏中的 `PAUSE`；关卡开场和非战斗画面会拒绝暂停输入。进入暂停时会启动由六个 4 帧音符和一个 12 帧尾音组成的免费单脉冲波替代旋律，保持原版 36 个显示帧的生命周期。战斗时间和其他固定帧音效冻结时，该旋律仍会继续推进；提前解除暂停后，尚未结束的第二脉冲声道提示仍保留声道优先级，再次进入暂停则从第 0 帧重新开始。暂停还会清除排队中的射击输入，并在原版坐标以显示 16 帧、隐藏 16 帧的节奏闪烁无底框 `PAUSE` 文字。若暂停期间检测到最后一个已被击败的敌人，游戏会解除暂停并开始活动的通关延迟；该延迟和 39 帧基地摧毁倒计时都会拒绝新的暂停输入。`Escape` 不是暂停键。
- 游戏结束：战场内横幅和随后当前关卡的逐项计数结算表都不能跳过，之后才进入独立的全屏 `GAME OVER` 画面。`Enter` 对应 Start，`Escape` 对应 Select；只有在全屏段中，任一按键才可跳过剩余号角。
- 重置：工具栏中的 `RESET` 返回标题画面、恢复内置原版风格关卡包，并清除临时游戏状态和编辑器测试状态。
- 建造模式：使用方向键或 `WASD` 让坦克光标每次移动一个 16x16 单元格。`Space`/`Z` 相当于 NES A 键，按原版 14 种方块图案向前切换；`F`/`X` 相当于 NES B 键，向后切换。移动后的第一次 A/B 按键会放置当前图案而不切换图案。`Enter` 相当于 Start，返回标题画面，并将编辑后的地图安装为第 1 关；通关后继续进入正常的第 2 关。`TEST` 或 `E` 会立即开始单关测试。
- 隐藏消息：进入并退出建造模式七次。在标题画面按住玩家 1 的下方向，同时让玩家 2 按 A（`F`）八次；再按住玩家 1 的右方向，同时让玩家 2 按 B（`G`）十二次；最后按作为 Start 的 `Enter`。第七次退出状态有效期间，方向输入会为密令保留。
- 编辑器扩展：数字键 `0` 至 `5` 可为鼠标选择空地、砖墙、钢墙、水域、树林或冰面的 8px 画笔。单击绘制一个 8px 子块，Shift+单击绘制完整 16x16 图块，Alt+单击循环切换地形。`SAVE` 保存地图，`LOAD` 恢复地图，`CLEAR` 恢复原版空白建造区域和基地围墙，`EXPORT` 复制/记录 JSON，`IMPORT` 加载关卡包。`Ctrl+S` 和 `Ctrl+X` 分别对应保存和导出。

## 已实现机制

- 256x240 逻辑画布，包含原版 16px 左边界、208x208 的 13x13 战场和 32px 右侧状态栏。
- 砖墙、钢墙、水域、树林和冰面地形。水面每 32 个游戏帧切换一次两种动画画面。树林作为顶层遮挡渲染；冰面会绘制弹丸遮挡层，使飞行中的子弹更难看清。
- 坦克会与实体地形、基地、敌方坦克和队友坦克发生碰撞。
- 基地防守与基地摧毁后的游戏结束；保护基地的砖墙或钢墙会先吸收子弹，避免基地被直接击中。暴露的基地被击中后会立即切换损毁图块，再运行原版 `$27` 倒计时：按 `1-2-3-4-5-4-3-2-1` 阶段顺序显示 35 帧居中爆炸，最后 4 帧只显示损毁基地。此时会清空玩家输入，但战斗模拟继续，全部 39 次更新完成后才启动战场内 GAME OVER 横幅。
- 单人和双人模式。
- 原版风格标题演示会在标题画面待机 640 帧后开始（按固定 60 Hz 逻辑速率约为 10.7 秒）。运行时现已保留原版相互独立的 8 位低帧计数器和高帧计数器：低计数器每个显示帧推进，高计数器在低计数器到达每个 64 帧边界时推进。暂停期间这两个计数器仍会运行，而战斗模拟时间保持冻结；原版对应的重置位置可以单独清除其中一个计数器而不改变另一个。演示会直接启用两名 AI 玩家，使用当前免费替代关卡数据并显示第 30 关，维持四个活动敌人的上限，优先追踪可用道具，并在不增加分数或结算表击杀数的情况下应用战斗效果。进入过建造模式后，自动演示会停用，直到开始一局正常游戏或重置游戏。
- 使用两个手柄的原版隐藏消息序列。黑屏等待 128 帧后，四行文字和五个末尾圆点会按 64 帧间隔逐项出现。随后一个免费程序化绿色替代物体会变形 28 帧，从 Y 30 下落至 Y 248，并在第 887 帧激活当前选中的标题项目（按文档序列通常为建造模式）。
- 四种敌方坦克类别，具有不同的速度、装填、装甲和分数。
- 敌人的转向、受阻路径选择、开火、道具类型和有效道具位置现在共同消耗同一组 8 位随机状态。道具位置会先消耗接下来的两个坐标字节，再消耗类型字节；这样既对应原版调用顺序，也保留可拾取位置过滤。状态更新过程复现原版 `D44D` 例程的三次移位、减法、高帧计数相加、索引自增，以及带入所采样零页字节的进位。浏览器运行时会把已有的帧、出生和坦克状态投影到对应零页地址，未建模的临时字节保持冷启动值；这样可保留原版各随机决策之间的状态耦合，但不宣称已完整模拟 NES 内存。确定性调试回调会绕过共享状态，不会扰动后续游戏。
- 敌人受到致命命中后不会在命中帧立刻消失，而是保留原位置和活动槽位并进入原版摧毁状态机。该敌人按自身移动节奏推进 18 个爆炸 tick，图像顺序为 `1-2-3-4-5-3`，随后显示 6 个固定分数 tick；只有最后一个 tick 完成后才释放槽位并增加已消灭数。因此快速敌人会在 24 个显示帧内完成，普通敌人则会因槽位/帧奇偶关系耗时 47 或 48 个显示帧。定时器道具不会冻结此序列。摧毁中的敌人不再阻挡坦克，也不能再次被命中，但仍计入活动敌人上限。手榴弹目标使用相同的延迟释放流程，不获得击杀分数，并在最后 6 个 tick 显示图 1 而不是分数。
- 玩家受到致命命中后同样会保留由状态驱动的摧毁图像，不再创建脱离玩家对象并按显示帧推进的独立特效。24 个死亡 tick 按原版 `[true, true, false, true]` 玩家节奏推进：前 18 个 tick 使用 `1-2-3-4-5-3`，最后 6 个 tick 固定显示图 1。因此在 tick 0 命中后，爆炸状态会显示 24 帧，最后的小图显示 8 帧。只有最后一个 tick 完成后才扣除生命；若仍有剩余生命，会立即开始 28 帧出生动画。
- 双人模式中，一名玩家耗尽最后生命而队友仍有生命时，会启动原版的单玩家 `GAME OVER` 横幅，但不会结束战斗。免费的紧凑替代图保留 32x8 精灵占位和 13 段计数器：玩家 1 从 `X=0x20` 移至 `0x50`，玩家 2 镜像地从 `X=0xC0` 移至 `0x90`；两者都移动三个 16 帧阶段，保持显示至第 191 帧，并在第 192 帧隐藏。暂停会冻结计数器且暂停画面不绘制横幅。若横幅活动期间检测到通关，会采用原版扩展的 256 帧战场延迟；只有基地被摧毁或所有玩家都无坦克可用时，共同 GAME OVER 才会替换这条单玩家横幅。
- 玩家和敌方坦克各自保留独立的两帧履带相位。每次活动移动尝试都会切换履带像素，包括冰面滑行以及被地形或其他坦克阻挡的尝试；静止帧和敌人的重试等待会保持上一相位。
- 战斗移动现已加入免费的程序化替代音频，并遵循原版声道行为：活动战斗期间持续播放敌方双音高引擎循环；只要玩家按住方向键，玩家移动声就会取得优先级，即使坦克被阻挡，或仍处于非零的死亡/出生状态。暂停、游戏结束和通关后的战场延迟都会静音这两个循环。玩家成功发射子弹时会启动持续 15 个固定逻辑帧的单音脉冲提示声；被拒绝的开火尝试不会将其重置，敌军开火保持静音，玩家射击声会遮蔽优先级更低的冰面提示声，但两个事件的帧计数都会继续推进。装甲敌人被玩家命中后若仍存活，会启动第二脉冲声道的撞击提示：先播放一个 1 帧音高和一个 2 帧音高，再保留 2 帧静音尾段，维持原版 5 帧声道生命周期；暂停会将其冻结，优先级更高的第二脉冲事件可以遮蔽它而不停止计数，移动循环在静音尾段中也继续受到压制。敌人被致命击中、友军眩晕和敌弹击中玩家均不会触发该提示。每次开始新的冰面滑行时，还会独立触发一个四音逐帧升高、持续 4 个固定逻辑帧的提示声；暂停会将其静音并冻结，而不是丢弃未完成的音序，关卡开场或奖励生命的第一脉冲声可以遮蔽它，但不会停止其帧计数。跨过关卡包配置的奖励生命分数阈值，或拾取额外坦克道具时，都会触发同一组双脉冲波替代号角：两个声部分别持续 60 和 54 个固定逻辑帧，暂停会将二者静音并冻结，第二声部在第 54 帧结束时恢复移动脉冲声道。非演示模式下拾取任一道具还会启动持续 39 帧的脉冲波替代旋律，该事件在暂停时冻结并压制移动音；若同一次拾取还会奖励生命，则优先级更高的奖励生命脉冲声会遮蔽拾取旋律，但拾取事件的帧计数仍会正常结束。
- 敌人摧毁使用免费的 14 固定逻辑帧长周期噪声替代音效：先播放两个各 2 帧的高音量包络阶段，再以 10 帧尾段结束。玩家子弹造成致命命中时触发一次；使用手榴弹时整次清场固定触发一次，即使没有摧毁任何已完成出生的敌车也会播放，仍处于出生动画中的敌人不受影响。暂停会静音并冻结该音效，离开战斗时会清理。
- 玩家摧毁使用免费的 26 固定逻辑帧长周期噪声替代音效，并包含八个逐级降低的音量阶段。敌人子弹摧毁未受保护的玩家时会触发；基地被摧毁时会在横幅出现前的爆炸倒计时中，在基地专用声部之外同时启动同一噪声。玩家摧毁噪声的优先级高于敌人摧毁噪声，但被遮蔽的敌人事件仍会推进自己的帧生命周期。暂停会静音并冻结该音效，开始新关卡或离开战斗时会清理。
- 基地摧毁会额外启动免费的第二脉冲声道专用替代音效：九个逐级降低的音符各持续 3 个固定逻辑帧，保持原版 27 帧生命周期。它会在 39 帧横幅前倒计时中与玩家摧毁噪声同时开始；基地脉冲会持续到第 26 帧，比噪声事件多一帧，二者都会在战场内 GAME OVER 横幅开始前结束。在第二脉冲声道上，它的优先级低于关卡开场、奖励生命、道具拾取和道具出现音效，但高于钢墙撞击、装甲敌人命中和移动音。被遮蔽事件会保留各自的帧计数；开始新关卡或离开战斗时会清理该音效。
- 每关独立的敌人序列，并可配置出生点和同时活动的敌人数上限。
- 玩家星星升级：等级 1 提高子弹速度，等级 2 可同时发射两颗子弹，等级 3 可摧毁钢墙并对砖墙造成双倍伤害。
- 活动弹丸限制：基础和一星玩家在屏幕上最多保留一颗子弹，二星和满级玩家最多保留两颗，每辆敌方坦克最多保留一颗。
- 子弹飞出战场时会在边缘钳制位置显示小型撞击爆炸。玩家子弹破坏砖墙或可破坏钢墙时播放破坏音效，普通子弹撞钢墙或边界时播放阻挡音效；敌人子弹撞墙保持静音。破坏音效的免费替代版本由三个各持续 1 帧的三角波音组成，保持原版 3 个固定逻辑帧的生命周期；暂停会将其冻结，但它不会占用射击、移动或阻挡音效使用的任一脉冲声道，被优先级更高的关卡开场三角波声部遮蔽时仍会静默推进帧计数。阻挡音效的免费替代版本由两个各持续 2 帧的脉冲音组成，保持原版 4 个固定逻辑帧的生命周期；暂停会将其冻结，它会占用移动音的第二脉冲声道，被优先级更高的第二脉冲事件遮蔽时仍会静默推进帧计数。
- 六种道具及各自独立的原版风格 16x16 替代图标：手榴弹、头盔、铲子、星星、定时器和额外坦克。随机释放使用原版八项查找表，其中手榴弹和星星各占两个机会，其余四种道具各占一个机会。尚未拾取的道具使用全局帧相位，以隐藏 8 帧、显示 8 帧的节奏交替闪烁；暂停期间仍会继续闪烁，但道具寿命和拾取判定保持冻结。仅当两个中心坐标差都小于 12 像素时，活动玩家才能拾取道具；出生中的玩家不能拾取。若两名玩家在同一帧都满足条件，则先检查玩家 2。铲子只会把基地围墙的五个单元从砖墙变为钢墙，在即将失效时闪烁，并在结束后恢复围墙；它绝不会生成冰面地形。基地被摧毁后拾取铲子仍会获得拾取分数，但不会改变围墙或启动计时器。
- 闪烁的道具携带敌人，默认在被击中时生成道具。每次成功释放都会启动一段免费的单脉冲波八音出现旋律，保持原版 32 个固定帧的生命周期。暂停会将其静音并冻结；关卡开场、奖励生命和拾取脉冲声会按原版事件优先级遮蔽它，但不会停止其帧计数。暂停期间，携带者的警示配色仍按 8 帧一组继续交替，与坦克显示处理器保持一致，同时不会推进敌人模拟。内置及导出默认值将第 4、11、18 个敌人标记为携带者，关卡包也可切换为仅在携带者被摧毁时释放道具。
- 道具拾取分数、额外生命分数阈值，以及不计入敌人击杀表的手榴弹清场。手榴弹只影响已完成出生的活动敌人；仍在出生动画中的敌人不受影响。关卡完成会等待完整敌人队列均已生成，并等待每个摧毁状态释放槽位；击杀表计分不会阻止关卡推进。
- 原版风格的固定场内分数显示。普通敌人被消灭后，会在原坦克位置于最后 6 个摧毁 tick 显示其分值。道具被拾取后，其图标会立即消失，并在道具中心以固定单色显示所得分数，共显示 49 帧（暂停期间的帧也计入）；不会保留道具图标。被手榴弹清除的敌人不会显示敌人分数状态，因为它们不获得击杀表分数。
- 玩家出生/重生动画，在初始力场启动前锁定移动和射击。暂停会保留并冻结有效的保护状态，但在恢复游戏前不绘制其护盾精灵，与原版暂停显示路径一致。
- 关卡开场，以及通关和游戏结束都会使用的、按原版时序逐项计数的单关结算表。每关开始时会播放免费的程序化脉冲波-三角波-脉冲波号角，三个声部沿用原版 264 个固定逻辑帧的生命周期：覆盖 95 帧关卡开场和进入战斗后的前 169 帧，结束前压制移动脉冲声，并在暂停时静音且冻结在当前位置。结算表每行会以九帧间隔同时递增两名玩家的计数，每个计数更新帧播放一组免费的单帧脉冲二与短周期噪声替代音效（两名玩家同帧递增时仍只播放一组），并根据各类敌人的实际击杀数延长结算时长。双人模式下唯一的击杀领先者会获得原版 1000 分奖励，并同时播放免费的 28 帧脉冲二替代音效；平局和游戏结束结算不会触发。如果同一帧还触发加命音效，则由更高优先级的加命脉冲声占用声道，奖励音效会静默推进。双人结算时，中间的每个敌方坦克图标会使用原版左右箭头列，并在两侧各保留一个清晰像素，替代精灵不会再和右箭头连在一起。战场内的 GAME OVER 文字会在 127 个活动战斗帧中每帧上移 1 像素，随后在 Y 113 保持 129 个活动帧；此时玩家输入被清空，但坦克、子弹、出生、地形计时器和道具仍继续更新。游戏结束路径随后显示不会发放双人击杀领先奖励的当前关卡结算表、更新下一关索引，最后进入独立的黑底全屏 `GAME OVER` 画面。全屏大字从原版坐标开始，每个替代字形横向步进 32 像素。画面现在会等待免费的脉冲一、脉冲二和三角波替代号角完成，并保持原版 108 个固定逻辑帧的生命周期：每个声部依次使用两个 6 帧音符、一个 24 帧音符、六个 8 帧音符和最后一个 24 帧音符。第 108 帧会随第一声部结束而退出；键盘 Start/Select 只能在这一全屏阶段立即停止三个声部并跳过。分数、带原版 20000 分下限的持久化最高分、剩余生命显示、剩余敌人计数和暂停也已实现。
- 游戏结束后，若任一玩家最终分数严格超过本局开始时已有的纪录，则显示最高分庆祝画面；与纪录相同不会触发。该画面最多保留七位分数，并每帧循环四组文字调色板。免费的脉冲一、脉冲二和三角波替代号角会遵循原版固定帧音序：两个脉冲声部均持续 460 帧，三角波在第 380 帧结束；脉冲一保留中间 80 帧静音区间，三角波保留开头 130 帧未启用区间。画面等待脉冲一结束，并在第 460 帧进入全新的标题周期。
- 原版风格建造模式，包含 16px 坦克光标、14 种图案的 A/B 方块循环、第 1 关替换及正常第 2 关延续，并附带可选的 8px 鼠标编辑和保存/加载/导出扩展。

`src/runtime/player-update-runtime.js` 接管固定帧玩家输入和演示模式更新。它通过冻结的运行时 API 保留原版方向键/WASD 键位、单次射击按下事件、移动节奏、出生保护、重生时序、演示模式优先追踪道具和敌人槽位优先级。其单元测试覆盖键位矩阵、射击、恢复和目标选择；浏览器集成测试通过真实游戏 harness 验证模块注册。

`src/runtime/player-movement-runtime.js` 接管玩家输入与演示更新调用的实际移动操作，将冰面滑行、转向对齐、受击停顿和履带动画从输入调度器中分离出来。

`src/runtime/game-over-entry-runtime.js` 接管场内 GAME OVER 的进入副作用和计时器初始化，将音频清理与高分标记从战斗结束判定中分离出来。

`src/runtime/battle-timing-runtime.js` 接管固定帧全局计时边界：暂停倒计时、铁锹墙恢复/闪烁时序、玩家无敌倒计时、基地摧毁倒计时以及精确的关卡清空判定。其单元测试锁定 64 帧计时节奏、墙体转换和敌人数量边界；浏览器集成测试验证模块注册，同时不改变公开 API 顺序。

`src/runtime/battle-random-runtime.js` 接管纯 D44D 随机算术之上的活动战场适配：有状态随机流、零页映射、原版敌人出生位置采样，以及玩家/敌人坦克内存和类型字节。其单元测试锁定地址映射、环绕和槽位编码，同时保证 AI、生成、移动和道具运行时继续收到相同的 `randomByte` 回调。

`src/runtime/battle-combat-runtime.js` 接管敌人摧毁计分、奖励生命阈值、玩家受击/死亡转换、重生恢复以及双人 GAME OVER 横幅时序。音频和最高分持久化作为显式回调保留，投射物、道具和玩家更新运行时继续使用相同的 `state.fn` API。

`src/runtime/stage-result-runtime.js` 接管关卡推进投影、结算表时序、通关奖励领取者选择以及一次性通关奖励副作用。屏幕状态转换仍保留在 `src/game.js`，诊断接口和关卡结算渲染使用同一个冻结运行时 API。

`src/runtime/editor-input-runtime.js` 接管 Construction 模式的固定帧输入编排：光标移动、原版 A/B 图案循环、整格与象限绘制、画笔选择、图块循环以及方向键长按重复。它通过显式回调执行地图修改和音效，`src/game.js` 只保留 Canvas 坐标换算与 DOM 事件接线；直接测试覆盖原版图案掩码、边界安全编辑、画笔选择和 20 帧重复节奏。

`src/runtime/input-runtime.js` 接管工具栏动作、键盘屏幕分派、暂停交接、关卡包导入和 Construction 鼠标编辑等浏览器输入路由。它将浏览器事件时序置于固定帧模拟之外，并通过显式回调提交状态变化；直接测试锁定输入契约，不重复实现游戏规则。

`src/runtime/screen-render-runtime.js` 接管顶层屏幕分派与覆盖层顺序，各专用渲染运行时继续负责具体像素绘制。

`src/runtime/stage-select-runtime.js` 接管关卡选择页的固定帧 A/B 输入节奏：先消费一次性按键，再处理长按重复；重复发生在原版八帧边界；A/B 同时到达时保留 A 优先级。关卡映射和屏幕状态转换仍通过 `src/game.js` 的显式回调执行。

## 关卡包格式

浏览器会公开 `window.TankDefender8.loadStagePack(pack)` 和 `window.TankDefender8.stagePackSchema()`。加载关卡包会返回标题画面，并在新关卡包开始前清除活动玩家、敌人、子弹、道具和过渡计时器。
对于自动化检查，`window.TankDefender8.debugSnapshot()` 会返回当前画面、关卡、敌人计数、当前敌人序列、分数、生命、单关击杀和累计击杀。右侧面板的敌人图标统计尚未生成的敌人，而非尚未击杀的敌人。

`data/sample-stage-pack.json` 是有效的 13x13 单关示例。`data/sample-quadrant-stage-pack.json` 是有效的 26x26 单关示例。`data/free-35-stage-pack.json` 是确定性的 35 关免费/自定义替代地图包，并保留当前 35 关敌人序列数据。可以使用工具栏中的 `IMPORT` 按钮加载这些文件。

`data/free-audio-manifest.json` 定义当前免费/自定义程序化音效集。运行时通过 `window.TankDefender8.audioManifest()` 公开相同数据，smoke test 会检查文件与运行时副本是否保持同步。

`data/free-sprite-manifest.json` 定义当前免费/自定义程序化矩形精灵，包括坦克、结算表迷你坦克、子弹、普通爆炸、坦克与基地共用的五帧摧毁爆炸、面板敌人计数器、出生/护盾轮廓、隐藏消息下落物、道具、地形、墙体子块和基地。运行时通过 `window.TankDefender8.spriteManifest()` 公开相同数据，相关渲染器从该清单绘制内容。

重新生成免费/自定义 35 关替代包：

```powershell
node tools/build-free-stage-pack.js
```

每个关卡包必须且只能使用一种地图格式：

- `maps`：13 个长度为 13 的字符串，每个字符代表一个 16x16 图块。
- `quadrants`：26 个长度为 26 的字符串，每个字符代表一个 8x8 子块。这种格式能更精确地表示《Battle City》风格的砖墙/钢墙布局和编辑器导出结果。

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
    // 继续添加，直到该关拥有准确的敌人数量。
  ]]
};

const result = window.TankDefender8.validateStagePack(pack);
if (result.ok) window.TankDefender8.loadStagePack(pack);
```

图块代码：

- `.` 空地
- `B` 或 `#` 砖墙
- `S` 钢墙
- `W` 或 `~` 水域
- `F` 树林
- `I` 冰面

敌人 `typeIndex` 值：

- `0` 基础型
- `1` 快速型
- `2` 火力型
- `3` 装甲型

关卡包可以覆盖 `enemyTypes`，即 `typeIndex` 所引用的四种敌人类别定义。每项可以定义 `name`、`hp`、`speed`、`bullet`、`wallPower`、`reload`、`fireChance`、`score`、`color` 和 `hitColors`。`hitColors` 是可选的颜色数组，按低生命到高生命排列，用于需要多次命中的敌人；默认装甲坦克满生命时为绿色，受损后逐渐变为灰色。省略时，引擎使用内置原版风格默认值。内置火力坦克保持 `wallPower: 1`，其火力优势来自更快的子弹。自定义 `wallPower: 2` 子弹会清除一个目标 8x8 砖墙子块，但不能摧毁钢墙；`wallPower: 3` 还可以摧毁钢墙。

每个 8x8 地图子块内部的砖墙会保留原版 4x4 碰撞碎片。普通子弹垂直命中时剥落一条 8x4 条带，水平命中时剥落一条 4x8 条带。因此，沿同一直线发射四颗普通子弹只会在 16x16 墙体中打通一条 8 像素宽通道，另一条通道仍然保留。强化（`wallPower` 为 2 或 3）子弹每次清除一个目标 8x8 砖墙子块，沿同一直线发射两颗即可打通相同通道。已被清除的 4x4 碎片不再阻挡后续子弹和坦克。

敌人 `spawnIndex` 值：

- `0` 左上
- `1` 中上
- `2` 右上

玩家星星升级规则：

- 等级 `0`：一颗慢速子弹，基础玩家坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `1`：一颗快速子弹，升级坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `2`：两颗快速子弹，第二级升级坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `3`：两颗快速子弹，满级坦克外观，双倍砖墙伤害，每次命中会摧毁一个目标 8x8 钢墙子块。

关卡包可以使用 `gameSettings.playerUpgradeRules` 覆盖这些规则。数组必须恰好包含等级 `0` 至 `3` 的四项；每项可定义 `maxBullets`、`bulletSpeed`、`wallPower` 和 `reload`。星星升级不会增加玩家装甲；除非受到出生无敌或头盔道具保护，否则敌人子弹仍会使玩家损失一条生命。

默认情况下，道具携带敌人在被击中时释放道具。携带敌人也可以设置 `powerUpType`。允许值为 `grenade`、`helmet`、`shovel`、`star`、`timer` 和 `tank`。省略时，携带敌人随机选择一种道具。
内置默认值遵循原版风格的携带者位置：敌人序列中的第 4、11 和 18 个敌人。
新的道具携带敌人生成时，任何尚未拾取的道具都会被移除。

每个敌人可以设置 `spawnDelay`，表示该敌人满足生成条件前要等待的 60 FPS 帧数。省略时，引擎使用 `gameSettings.enemySpawnPacing`。取值必须是 `0` 至 `3600` 的整数。

关卡包可以设置 `gameSettings.initialLives`，即每名玩家的初始生命数。省略时默认为 `3`；有效值为 `1` 至 `9`。

关卡包可以设置 `gameSettings.bonusLifeScores`，即跨越后奖励一条额外生命的分数阈值数组，可以按升序或无序提供。省略时默认为 `[20000]`；取值必须是 `1` 至 `999999` 的整数。

关卡包可以设置 `gameSettings.deathPowerLevel`，即玩家损失一条生命后重生时允许保留的最高强化等级。省略时默认为 `0`，符合原版风格中重置为基础坦克的行为；有效值为 `0` 至 `3`。

关卡包可以使用原版 64 帧计数单位设置 `gameSettings.powerUpDurations`。头盔默认为 `10`，铲子默认为 `20`，铲子闪烁阈值默认为 `4`，定时器默认为 `10`；有效值为 `1` 至 `3600`。一个十单位道具会持续 577 至 640 个显示帧，具体取决于拾取时全局帧所处的相位。当铲子计数器低于 `shovelFlash` 时，基地围墙每 16 帧在砖墙和钢墙之间切换；归零后恢复砖墙。

关卡包可以设置 `gameSettings.powerUpRules`。`carrierRelease` 默认为 `hit`，符合原版风格中闪烁携带者首次被玩家命中时释放道具的规则；如果自定义关卡包需要等到携带者被摧毁，可将其设为 `destroyed`。`clearUncollectedOnCarrierSpawn` 默认为 `true`，因此新的携带敌人会移除场上任何尚未拾取的道具。`pickupScore` 默认为 `500`，即玩家拾取任意道具获得的分数。

关卡包可以设置 `gameSettings.timings`。大多数值使用 60 FPS 显示帧。`playerRespawn` 按活动的 `[true, true, false, true]` 玩家节奏推进，默认为 24 个死亡 tick：前 18 个 tick 使用摧毁序列，最后 6 个 tick 保留第一张小图；若在 tick 0 被命中，32 个显示帧后扣除生命。`playerSpawnFlash` 和 `enemySpawnFlash` 均默认为 28 个显示帧，并在每个显示帧推进，对应原版两个各 14 帧的出生状态；因此玩家从被命中起累计 60 个显示帧后完成出生。替代出生图标会在每个 14 帧状态中对称地缩小再放大。`playerInvulnerability` 使用 64 帧单位，默认为 `3`；它只在出生完成后开始，并根据全局相位持续 129 至 192 个显示帧。`stageIntro` 默认为 `95` 个非活动显示帧：13 帧地图写入等待、64 帧属性复制等待、16 帧上下幕布打开，以及 2 帧坦克/侧栏准备等待。准备完成前不会显示动态对象和右侧栏。自定义关卡包可以覆盖总时长；幕布仍会在可用区间末尾按离散步骤打开。进入选关界面另行使用原版固定的 16 帧上下闭幕。基地摧毁会先消耗独立的 39 帧倒计时。随后 `gameOverSlide` 默认为 `127`，控制战场内 GAME OVER 文字移至最终 Y 坐标；`gameOverHold` 默认为 `129`，在进入结算表前保持战斗模拟继续运行并清空玩家输入。两者共同保留倒计时后的原版 256 帧战场阶段。`powerUpTtl` 默认为 `0`，表示释放出的道具不会随时间消失，只会在被拾取或后续携带者生成新道具时被移除。自定义限时道具可将其设置为正帧数。`stageClearDelay` 默认为 `128`：完成检测帧只装载计数器而不消耗它，将原版两个帧计数器均设为零，随后仍执行 128 个完整的活动战斗更新，因此游离的玩家子弹仍可能在结算画面前摧毁基地。若检测通关时双人模式的单玩家 `GAME OVER` 横幅仍在活动，该延迟会改为原版固定的 256 帧，同时高计数器从 `0xFE` 开始，并在横幅完成时回绕至 `0x02`。共同 GAME OVER 的战场阶段也使用同一条从 `0xFE` 到 `0x02` 的路径。`stageClear` 默认为 `0`，表示使用原版动态结算时序：初始等待 30 帧；每行先设置一帧；每次可见计数以及每行最后一次空计数都由一帧更新和八帧停顿组成；行间等待 20 帧；TOTAL 前等待 30 帧；领先奖励前等待 15 帧；最后保持 120 帧。自定义关卡包仍可将 `stageClear` 设为正数，以固定覆盖结算总时长。省略时，引擎使用示例中列出的内置时序默认值。

关卡完成结算结束后，会先用原版风格的固定 16 帧幕布覆盖结算表，再载入下一关编号和入场阶段。游戏结束结算走独立的全屏路线，不使用这段下一关闭幕。

`enemySpawnRetry` 默认为 `25`。如果选定的敌军出生点被活动中或正在出生的坦克占用，待生成的敌军不会被消耗，并在该延迟后再次检查同一位置。

关卡包可以设置 `gameSettings.enemySpawnPacing`，以 60 FPS 帧为单位控制默认敌人生成节奏。`firstDelay` 用于首个未显式设置 `spawnDelay` 的敌人；后续敌人使用 `max(minDelay, baseDelay - stage * stageStep)`。对于持续至第 70 关的原版风格 35 关关卡包，第 36 至 70 关使用 `extendedLoopMinDelay` 作为下限。双人模式下，生成的默认延迟会减去 `twoPlayerDelayReduction`；敌人显式设置的 `spawnDelay` 不会改变。省略时，默认值为 `0`、`190`、`4`、`50`、`50` 和 `20`，对应原版立即生成首个敌人以及 `190 - stage * 4` 的间隔。帧数有效范围为 `0` 至 `3600`。仍支持使用 `twoPlayerDelayMultiplier` 的旧版自定义关卡包。

关卡包可以设置 `gameSettings.playerMovement`。`speed` 是每个活动移动帧的移动距离。`frameCadence` 是选择活动移动帧的循环布尔数组；原版默认值 `[true, true, false, true]` 表示每四帧中的三帧移动一个像素。横向和纵向移动之间切换时，会先把玩家的两个坐标对齐到最近的 8 像素网格点再移动；直行或 180 度反向不会吸附。如果吸附后的矩形会与实体地形重叠，则跳过该次吸附。如果动态恢复的地形覆盖了坦克，只允许每一步都严格减少重叠面积的向外移动，使坦克能够脱困，但不能继续向墙内穿行。在冰面上，若没有保留的惯性，第一次方向输入会载入 `iceSlideFrames`（默认为 `28`）。当 `0x10` 位仍置位时，前 13 个惯性 tick 会忽略方向输入，并以 `iceSlideSpeed`（`1` 像素）移动；低于 16 后恢复控制。松开输入时会在滑行中消耗剩余计数器。离开冰面会保留但暂停计数器，移动受阻时仍会消耗计数。提供 `speed` 但省略 `frameCadence` 的旧版自定义关卡包会在每一帧移动。

关卡包可以设置 `gameSettings.projectileRules`。`bulletSize` 是子弹碰撞/渲染尺寸（像素），`spawnOffset` 是相对于坦克中心的炮口偏移，`boundsPadding` 是子弹被移除前允许超出战场的边距。子弹命中坦克要求子弹与坦克的两个中心坐标差都小于 `10` 像素。仍在出生动画或摧毁状态中的敌人会被跳过；玩家的头盔或出生后力场会吸收来袭子弹且不显示命中特效。未受保护的玩家被命中时，会在进入保留的玩家摧毁状态之外，在子弹中心显示九帧子弹命中爆炸。玩家子弹每次命中活动敌军时，也会在子弹中心显示相同的九帧爆炸；致命命中会让该敌军进入保留的坦克摧毁状态，而不是创建脱离坦克的独立爆炸对象。暴露的基地被命中时会立即切换为被摧毁图案，并启动以基地为中心的专用摧毁序列，而不是普通弹着爆炸；保护墙会优先处理并阻止基地被命中。每颗子弹完成整帧移动后，来自不同坦克的子弹若两个中心差都小于 `6` 像素，则直接相消且不显示爆炸；同一坦克的两颗子弹跳过该检查。省略时，默认值为 `4`、`9` 和 `4`；有效范围分别为：`bulletSize` `1` 至 `16`，`spawnOffset` `0` 至 `32`，`boundsPadding` `0` 至 `32`。

关卡包可以设置 `gameSettings.friendlyFire`。默认情况下，双人模式中的玩家子弹在两个中心坐标差都小于 `10` 像素时可以命中另一名玩家，并加载一个 `200` tick 的眩晕计数器，而不是将其摧毁。命中时还会在子弹中心显示原版风格的九帧子弹爆炸。该计数器只在活动玩家移动帧递减，使用原版节奏时约持续 `267` 个显示帧。眩晕玩家不能移动或转向，但仍可朝当前方向射击；再次被友军命中不会刷新已有眩晕。暂停会冻结眩晕计数器，但坦克按 8 帧显示、8 帧隐藏的节奏继续基于显示时间闪烁。受到头盔或出生后力场保护的队友会吸收友军子弹，不会眩晕，也不会显示命中特效。将 `enabled` 设为 `false` 可禁用该碰撞效果，也可以把 `stunFrames` 调整为 `0` 至 `3600` 个移动 tick。

关卡包可以设置 `gameSettings.explosionRules`，用于碰撞和摧毁反馈。每条规则包含 `ttl`、`color` 和 `coreColor`；颜色必须采用 `#rrggbb` 格式，`ttl` 可取 `1` 至 `3600`。大多数 `ttl` 值表示 60 FPS 显示帧数。`enemyDestroy.ttl` 和 `playerDestroy.ttl` 则表示状态 tick 数，两者默认都为 `18`。敌人随后进入固定 6 tick 的分数状态；玩家则使用 `playerRespawn` 剩余的 tick（默认 6 个）固定显示图 1。规则名称为 `bulletCancel`、`baseDestroy`、`brickHit`、`steelHit`、`steelBlocked`、`enemyHit`、`enemyDestroy`、`playerStun` 和 `playerDestroy`。`baseDestroy` 默认显示 35 帧，并映射到原版九个基地爆炸阶段；阶段 1 至 3 使用三个不同的居中 16x8 替代帧，阶段 4 至 5 使用两个不同的 32x32 替代帧，随后固定保留 4 帧损毁基地。坦克摧毁会复用这五张图：保留的敌人会把状态 tick 映射到 `1-2-3-4-5-3`，玩家在末尾恢复原版小图，采用 `1-2-3-4-5-3-1`；图 1 至 3 占 16x8，图 4 至 5 占 32x32。三种墙体/边界撞击规则、`enemyHit` 和 `playerStun` 默认显示 9 帧，并分成三个各持续 3 帧的动画阶段；暂停会冻结这些普通弹着特效。为兼容旧关卡包，仍接受 `bulletCancel`；但原版风格的子弹互撞现在会直接移除双方，不再渲染爆炸。

关卡包可以设置 `gameSettings.stageAdvance`。`loopAfterFinalStage` 控制完成循环中的最后一关后是否回到第 1 关。对于原版风格 35 关关卡包，默认循环会持续至第 70 关再返回；第 36 至 70 关复用第 1 至 35 关的地图数据，同时使用第 35 关的敌人模式数据。第 70 关返回第 1 关时，会保留玩家分数、强化等级、生命和累计击杀总数；新关卡会重置单关分数、单关击杀行、活动子弹、活动道具和待处理的道具生成记忆。`extendedLoopEndStage` 默认为 `70`，`extendedLoopEnemyStage` 默认为 `35`。对于在最终结算画面后返回标题画面的有限关卡包，请将 `loopAfterFinalStage` 设为 `false`。

关卡包可以设置 `gameSettings.stageClearBonus`。默认情况下，双人关卡会向单关击杀数严格较高的玩家奖励 `1000` 分；平局不奖励。实际击杀领先者还必须至少剩余一条生命；若领先者不符合资格，奖励不会转发给第二名。游戏结束结算不会发放该奖励。`points` 必须是 `0` 至 `999999` 的整数；`twoPlayerOnly` 和 `requireStrictLead` 为布尔值。

关卡包可以设置 `gameSettings.enemyAi`。在 8 像素交叉点，`intersectionTurnChance` 控制敌人是否重新评估路线。发生碰撞时，`blockedRetryChance` 控制敌人是暂停 `blockedRetryTicks` 个移动回合并重试同一方向，还是进入转向状态。`horizontalFirstChance` 决定目标寻路先处理水平轴还是垂直轴。默认值为 `1/16`、`3/4`、`2` 和 `1/2`，与原版状态机一致。在一关内，当每 64 个显示帧推进一次的独立高帧计数器先后越过 `spawnInterval/8` 和 `spawnInterval/4` 时，寻路目标会从随机方向推进为玩家，最后推进为总部。双人模式中，偶数敌人槽位优先选择玩家 1，奇数敌人槽位优先选择玩家 2，并在目标玩家阵亡时改选仍存活的玩家。

关卡包可以设置 `gameSettings.timerFreezesEnemyTime`。省略时默认为 `true`：定时器道具的 64 帧计数器非零期间，敌人生成倒计时和出生动画仍会正常推进。新生成的敌人会完成出生，随后停在原地，不推进装填计时、不运行 AI，也不会发射子弹。计数器在 64 帧边界递减至零时，活动敌人的处理会立即恢复。

每一关都可以设置 `stageSettings[index].maxActiveEnemies` 和 `maxActiveEnemiesTwoPlayer`，分别表示单人和双人模式下允许同时存活的最大敌人数。省略时默认为 `4` 和 `6`；有效值为 `1` 至 `8`。为保持向后兼容，仅设置 `maxActiveEnemies` 的自定义关卡会在两种模式中使用同一个显式上限。

每一关也可以在关卡设置中配置 `playerSpawns` 和 `enemySpawns`。出生点使用 13x13 图块坐标而非像素坐标。`playerSpawns` 必须至少包含两个点，`enemySpawns` 必须至少包含三个点。敌人的 `spawnIndex` 从 `enemySpawns` 中选择位置。

每一关也可以设置 `powerUpSpawns`，即携带者释放道具时使用的固定候选位置。这些位置同样使用 13x13 图块坐标，并且必须至少包含一个点。省略时，引擎使用 16 个位置的原版风格默认列表。选择出生位置时会过滤被阻挡或不可到达的候选点，然后随机选取一个可到达候选点；存在多个可到达位置时，会避开刚刚使用过的道具位置。

导入的 JSON 关卡包采用严格校验：`maps.length` 或 `quadrants.length` 必须等于 `totalStages`，但不能同时提供两者；每个 `maps` 关卡必须是 13x13；每个 `quadrants` 关卡必须是 26x26；`enemies.length` 必须等于 `totalStages`；每关敌人序列必须至少包含一个敌人。运行时把每关的 `enemies` 数组作为权威敌人顺序，其中包括 `typeIndex`、携带者标志、`powerUpType`、出生点和显式出生延迟。`enemyTotal` 是可选元数据/默认兼容字段；活动关卡的敌人数由该关敌人序列长度得出。

关卡开始时，引擎会规范化基地图块以及紧邻的出生/基地保护区域。

## 参考说明

内置敌人构成现使用原版风格 35 关敌人分组表。`data/free-35-stage-pack.json` 为全部 35 关提供固定的免费/自定义替代地图，`data/free-audio-manifest.json` 提供当前程序化替代音效事件，`data/free-sprite-manifest.json` 提供当前程序化坦克、子弹、地形、基地、普通/摧毁爆炸、面板、轮廓和道具精灵。未来的采样音乐/音效或更丰富的精灵图同样应使用免费/自定义替代资源，而非源自原版 ROM 的资源。用于交叉核对规则的公开参考资料包括：

- [StrategyWiki Battle City 攻略](https://strategywiki.org/wiki/Battle_City/Walkthrough)
- [StrategyWiki Battle City 玩法](https://strategywiki.org/wiki/Battle_City/Gameplay)
- [Battle City 带注释反汇编](https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/main/Battle%20City/bank_FF.asm)
