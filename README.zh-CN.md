# Tank Defender 8

[English](README.md) | **简体中文**

一款以静态 Canvas 应用形式构建的 NES 风格坦克防御游戏。

本仓库不包含 NES 原版 ROM 数据、原版精灵图、原版音频或原版关卡地图。地图、精灵图和音频均使用免费或自定义替代资源。内置敌人构成与公开记录的《Battle City》35 关敌人分组表一致；引擎仍采用数据驱动设计，因此无需修改核心代码即可调整玩法规则、敌人序列和关卡包。

## 运行

在浏览器中打开 `index.html`，或在本地托管该文件夹：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:8765/index.html`。

## 验证

```powershell
node --check src/game.js
node --check tools/build-free-stage-pack.js
node tools/smoke-test.js
git diff --check
```

## 操作方式

- 标题画面：使用方向键或 `WASD` 选择 `1 PLAYER`、`2 PLAYERS` 或 `CONSTRUCTION`；按 `Enter`/`Space` 激活所选项目。`1`、`2` 和 `C`/`E` 仍可作为直接快捷键。
- 关卡选择：`Space`/`Z` 相当于 NES A 键，可在第 1 至 35 关之间向前选择；`F`/`X` 相当于 NES B 键，可向后选择。按住 A 或 B 时每八帧重复一次。`Enter` 开始所选关卡，`Escape` 返回标题画面。
- 玩家 1：方向键移动，`Space` 射击。在单人模式中，玩家 1 也可使用 `WASD` 移动。
- 玩家 2：双人模式中使用 `WASD` 移动，`F` 射击。
- 暂停：按作为键盘 Start 键的 `Enter`、`P`，或工具栏中的 `PAUSE`。
- 重置：工具栏中的 `RESET` 返回标题画面、恢复内置原版风格关卡包，并清除临时游戏状态和编辑器测试状态。
- 建造模式：使用方向键或 `WASD` 让坦克光标每次移动一个 16x16 单元格。`Space`/`Z` 相当于 NES A 键，按原版 14 种方块图案向前切换；`F`/`X` 相当于 NES B 键，向后切换。移动后的第一次 A/B 按键会放置当前图案而不切换图案。`Enter` 相当于 Start，返回标题画面，并将编辑后的地图安装为第 1 关；通关后继续进入正常的第 2 关。`TEST` 或 `E` 会立即开始单关测试。
- 编辑器扩展：数字键 `0` 至 `5` 可为鼠标选择空地、砖墙、钢墙、水域、树林或冰面的 8px 画笔。单击绘制一个 8px 子块，Shift+单击绘制完整 16x16 图块，Alt+单击循环切换地形。`SAVE` 保存地图，`LOAD` 恢复地图，`CLEAR` 恢复原版空白建造区域和基地围墙，`EXPORT` 复制/记录 JSON，`IMPORT` 加载关卡包。`Ctrl+S` 和 `Ctrl+X` 分别对应保存和导出。

## 已实现机制

- 256x240 逻辑画布，包含原版 16px 左边界、208x208 的 13x13 战场和 32px 右侧状态栏。
- 砖墙、钢墙、水域、树林和冰面地形。树林作为顶层遮挡渲染；冰面会绘制弹丸遮挡层，使飞行中的子弹更难看清。
- 坦克会与实体地形、基地、敌方坦克和队友坦克发生碰撞。
- 基地防守与基地摧毁后的游戏结束；保护基地的砖墙或钢墙会先吸收子弹，避免基地被直接击中。
- 单人和双人模式。
- 四种敌方坦克类别，具有不同的速度、装填、装甲和分数。
- 每关独立的敌人序列，并可配置出生点和同时活动的敌人数上限。
- 玩家星星升级：等级 1 提高子弹速度，等级 2 可同时发射两颗子弹，等级 3 可摧毁钢墙并对砖墙造成双倍伤害。
- 活动弹丸限制：基础和一星玩家在屏幕上最多保留一颗子弹，二星和满级玩家最多保留两颗，每辆敌方坦克最多保留一颗。
- 六种道具及各自独立的原版风格 16x16 替代图标：手榴弹、头盔、铲子、星星、定时器和额外坦克。随机释放使用原版八项查找表，其中手榴弹和星星各占两个机会，其余四种道具各占一个机会。尚未拾取的道具使用全局帧相位，以隐藏 8 帧、显示 8 帧的节奏交替闪烁。仅当两个中心坐标差都小于 12 像素时，活动玩家才能拾取道具；出生中的玩家不能拾取。若两名玩家在同一帧都满足条件，则先检查玩家 2。铲子只会把基地围墙的五个单元从砖墙变为钢墙，在即将失效时闪烁，并在结束后恢复围墙；它绝不会生成冰面地形。基地被摧毁后拾取铲子仍会获得拾取分数，但不会改变围墙或启动计时器。
- 闪烁的道具携带敌人，默认在被击中时生成道具。内置及导出默认值将第 4、11、18 个敌人标记为携带者，关卡包也可切换为仅在携带者被摧毁时释放道具。
- 道具拾取分数、额外生命分数阈值，以及不计入敌人击杀表的手榴弹清场。手榴弹只清除已完成出生的活动敌人；仍在出生动画中的敌人不受影响。关卡完成条件是完整敌人队列均已生成且场上不再有活动敌人；击杀表计分不会阻止关卡推进。
- 为计分的敌人击杀和拾取的道具显示场内分数弹窗。道具被拾取后，其图标会立即消失，并在道具中心以固定单色显示所得分数，共显示 49 帧（暂停期间的帧也计入）；不会保留道具图标。被手榴弹清除的敌人不会显示敌人分数弹窗，因为它们不获得击杀表分数。
- 玩家出生/重生动画，在初始力场启动前锁定移动和射击。
- 关卡开场、按原版时序逐项计数的单关结算表、游戏结束、分数、带原版 20000 分下限的持久化最高分、剩余生命显示、剩余敌人计数和暂停。
- 原版风格建造模式，包含 16px 坦克光标、14 种图案的 A/B 方块循环、第 1 关替换及正常第 2 关延续，并附带可选的 8px 鼠标编辑和保存/加载/导出扩展。

## 关卡包格式

浏览器会公开 `window.TankDefender8.loadStagePack(pack)` 和 `window.TankDefender8.stagePackSchema()`。加载关卡包会返回标题画面，并在新关卡包开始前清除活动玩家、敌人、子弹、道具和过渡计时器。
对于自动化检查，`window.TankDefender8.debugSnapshot()` 会返回当前画面、关卡、敌人计数、当前敌人序列、分数、生命、单关击杀和累计击杀。右侧面板的敌人图标统计尚未生成的敌人，而非尚未击杀的敌人。

`data/sample-stage-pack.json` 是有效的 13x13 单关示例。`data/sample-quadrant-stage-pack.json` 是有效的 26x26 单关示例。`data/free-35-stage-pack.json` 是确定性的 35 关免费/自定义替代地图包，并保留当前 35 关敌人序列数据。可以使用工具栏中的 `IMPORT` 按钮加载这些文件。

`data/free-audio-manifest.json` 定义当前免费/自定义程序化音效集。运行时通过 `window.TankDefender8.audioManifest()` 公开相同数据，smoke test 会检查文件与运行时副本是否保持同步。

`data/free-sprite-manifest.json` 定义当前免费/自定义程序化矩形精灵，包括坦克、结算表迷你坦克、子弹、爆炸、面板敌人计数器、出生/护盾轮廓、道具、地形、墙体子块和基地。运行时通过 `window.TankDefender8.spriteManifest()` 公开相同数据，相关渲染器从该清单绘制内容。

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
      stageIntro: 86,
      stageClearDelay: 60,
      stageClear: 420,
      gameOverSlide: 96,
      playerRespawn: 24,
      playerSpawnFlash: 28,
      playerInvulnerability: 3,
      enemySpawnFlash: 56,
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
      brickHit: { ttl: 12, color: "#d08b52", coreColor: "#f7f1c6" },
      steelHit: { ttl: 12, color: "#dbe0ef", coreColor: "#f7f1c6" },
      steelBlocked: { ttl: 8, color: "#dbe0ef", coreColor: "#f7f1c6" },
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

关卡包可以覆盖 `enemyTypes`，即 `typeIndex` 所引用的四种敌人类别定义。每项可以定义 `name`、`hp`、`speed`、`bullet`、`wallPower`、`reload`、`fireChance`、`score`、`color` 和 `hitColors`。`hitColors` 是可选的颜色数组，按低生命到高生命排列，用于需要多次命中的敌人；默认装甲坦克满生命时为绿色，受损后逐渐变为灰色。省略时，引擎使用内置原版风格默认值。默认火力坦克使用 `wallPower: 2`，因此其子弹破坏砖墙的速度快于普通敌人子弹。

砖墙会从子弹命中的一侧逐层剥落。普通子弹需要从同一侧命中四次，才能清除全部四个 8x8 砖墙子块；强化砖墙攻击每次清除两个子块，因此同一侧只需两次命中。这样可以避免因子弹对齐方式导致左下/右下子块无法被击中的问题。

敌人 `spawnIndex` 值：

- `0` 左上
- `1` 中上
- `2` 右上

玩家星星升级规则：

- 等级 `0`：一颗慢速子弹，基础玩家坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `1`：一颗快速子弹，升级坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `2`：两颗快速子弹，第二级升级坦克外观，普通砖墙伤害，不能摧毁钢墙。
- 等级 `3`：两颗快速子弹，满级坦克外观，双倍砖墙伤害，从同一侧命中两次后可摧毁钢墙。

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

关卡包可以设置 `gameSettings.timings`。大多数值使用 60 FPS 显示帧。`playerRespawn` 和 `playerSpawnFlash` 对应原版玩家坦克状态计数器，仅在活动的 `[true, true, false, true]` 玩家节奏上推进。默认值为 24 个死亡 tick 和 28 个出生 tick：若在 tick 0 被命中，32 个显示帧后扣除生命，累计 69 个显示帧后完成出生。`playerInvulnerability` 使用 64 帧单位，默认为 `3`；它只在出生完成后开始，并根据全局相位持续 129 至 192 个显示帧。`stageIntro` 控制开始游戏前战场幕布的打开过程。`gameOverSlide` 控制 GAME OVER 横幅从战场底部上移至中央。`powerUpTtl` 默认为 `0`，表示释放出的道具不会随时间消失，只会在被拾取或后续携带者生成新道具时被移除。自定义限时道具可将其设置为正帧数。`stageClearDelay` 会在最后一个敌人被摧毁后让游戏短暂保持活动，因此游离的玩家子弹仍可能在结算画面前摧毁基地。省略时，引擎使用示例中列出的内置时序默认值。

关卡包可以设置 `gameSettings.enemySpawnPacing`，以 60 FPS 帧为单位控制默认敌人生成节奏。`firstDelay` 用于首个未显式设置 `spawnDelay` 的敌人；后续敌人使用 `max(minDelay, baseDelay - stage * stageStep)`。对于持续至第 70 关的原版风格 35 关关卡包，第 36 至 70 关使用 `extendedLoopMinDelay` 作为下限。双人模式下，生成的默认延迟会减去 `twoPlayerDelayReduction`；敌人显式设置的 `spawnDelay` 不会改变。省略时，默认值为 `0`、`190`、`4`、`50`、`50` 和 `20`，对应原版立即生成首个敌人以及 `190 - stage * 4` 的间隔。帧数有效范围为 `0` 至 `3600`。仍支持使用 `twoPlayerDelayMultiplier` 的旧版自定义关卡包。

关卡包可以设置 `gameSettings.playerMovement`。`speed` 是每个活动移动帧的移动距离。`frameCadence` 是选择活动移动帧的循环布尔数组；原版默认值 `[true, true, false, true]` 表示每四帧中的三帧移动一个像素。横向和纵向移动之间切换时，会先把玩家的两个坐标对齐到最近的 8 像素网格点再移动；直行或 180 度反向不会吸附。在冰面上，若没有保留的惯性，第一次方向输入会载入 `iceSlideFrames`（默认为 `28`）。当 `0x10` 位仍置位时，前 13 个惯性 tick 会忽略方向输入，并以 `iceSlideSpeed`（`1` 像素）移动；低于 16 后恢复控制。松开输入时会在滑行中消耗剩余计数器。离开冰面会保留但暂停计数器，移动受阻时仍会消耗计数。提供 `speed` 但省略 `frameCadence` 的旧版自定义关卡包会在每一帧移动。

关卡包可以设置 `gameSettings.projectileRules`。`bulletSize` 是子弹碰撞/渲染尺寸（像素），`spawnOffset` 是相对于坦克中心的炮口偏移，`boundsPadding` 是子弹被移除前允许超出战场的边距。敌军或友军子弹仅在与玩家的两个中心坐标差都小于 `10` 像素时命中；头盔或出生后力场会吸收子弹且不显示命中特效。省略时，默认值为 `4`、`9` 和 `4`；有效范围分别为：`bulletSize` `1` 至 `16`，`spawnOffset` `0` 至 `32`，`boundsPadding` `0` 至 `32`。

关卡包可以设置 `gameSettings.friendlyFire`。默认情况下，双人模式中的玩家子弹在两个中心坐标差都小于 `10` 像素时可以命中另一名玩家，并加载一个 `200` tick 的眩晕计数器，而不是将其摧毁。该计数器只在活动玩家移动帧递减，使用原版节奏时约持续 `267` 个显示帧。眩晕玩家不能移动或转向，但仍可朝当前方向射击；再次被友军命中不会刷新已有眩晕。受到头盔或出生后力场保护的队友会吸收友军子弹，不会眩晕，也不会显示命中特效。将 `enabled` 设为 `false` 可禁用该碰撞效果，也可以把 `stunFrames` 调整为 `0` 至 `3600` 个移动 tick。

关卡包可以设置 `gameSettings.explosionRules`，用于碰撞和摧毁反馈。每条规则包含 `ttl`、`color` 和 `coreColor`；`ttl` 是 `1` 至 `3600` 的 60 FPS 帧数，颜色必须采用 `#rrggbb` 格式。规则名称为 `bulletCancel`、`baseDestroy`、`brickHit`、`steelHit`、`steelBlocked`、`enemyHit`、`enemyDestroy`、`playerStun` 和 `playerDestroy`。

关卡包可以设置 `gameSettings.stageAdvance`。`loopAfterFinalStage` 控制完成循环中的最后一关后是否回到第 1 关。对于原版风格 35 关关卡包，默认循环会持续至第 70 关再返回；第 36 至 70 关复用第 1 至 35 关的地图数据，同时使用第 35 关的敌人模式数据。第 70 关返回第 1 关时，会保留玩家分数、强化等级、生命和累计击杀总数；新关卡会重置单关分数、单关击杀行、活动子弹、活动道具和待处理的道具生成记忆。`extendedLoopEndStage` 默认为 `70`，`extendedLoopEnemyStage` 默认为 `35`。对于在最终结算画面后返回标题画面的有限关卡包，请将 `loopAfterFinalStage` 设为 `false`。

关卡包可以设置 `gameSettings.stageClearBonus`。默认情况下，双人关卡会向单关击杀数严格较高的玩家奖励 `1000` 分；平局不奖励。`points` 必须是 `0` 至 `999999` 的整数；`twoPlayerOnly` 和 `requireStrictLead` 为布尔值。

关卡包可以设置 `gameSettings.enemyAi`。在 8 像素交叉点，`intersectionTurnChance` 控制敌人是否重新评估路线。发生碰撞时，`blockedRetryChance` 控制敌人是暂停 `blockedRetryTicks` 个移动回合并重试同一方向，还是进入转向状态。`horizontalFirstChance` 决定目标寻路先处理水平轴还是垂直轴。默认值为 `1/16`、`3/4`、`2` 和 `1/2`，与原版状态机一致。在一关内，当关卡帧计数器高字节先后越过 `spawnInterval/8` 和 `spawnInterval/4` 时，寻路目标会从随机方向推进为玩家，最后推进为总部。双人模式中，偶数敌人槽位优先选择玩家 1，奇数敌人槽位优先选择玩家 2，并在目标玩家阵亡时改选仍存活的玩家。

关卡包可以设置 `gameSettings.timerFreezesEnemyTime`。省略时默认为 `true`：定时器道具的 64 帧计数器非零期间，会暂停敌人移动以及敌人的装填、AI 和出生闪烁计时器。敌人生成倒计时仍会继续；新生成的敌人会出现，但停留在出生动画中。计数器在 64 帧边界递减至零时，敌人处理会立即恢复。

每一关都可以设置 `stageSettings[index].maxActiveEnemies` 和 `maxActiveEnemiesTwoPlayer`，分别表示单人和双人模式下允许同时存活的最大敌人数。省略时默认为 `4` 和 `6`；有效值为 `1` 至 `8`。为保持向后兼容，仅设置 `maxActiveEnemies` 的自定义关卡会在两种模式中使用同一个显式上限。

每一关也可以在关卡设置中配置 `playerSpawns` 和 `enemySpawns`。出生点使用 13x13 图块坐标而非像素坐标。`playerSpawns` 必须至少包含两个点，`enemySpawns` 必须至少包含三个点。敌人的 `spawnIndex` 从 `enemySpawns` 中选择位置。

每一关也可以设置 `powerUpSpawns`，即携带者释放道具时使用的固定候选位置。这些位置同样使用 13x13 图块坐标，并且必须至少包含一个点。省略时，引擎使用 16 个位置的原版风格默认列表。选择出生位置时会过滤被阻挡或不可到达的候选点，然后随机选取一个可到达候选点；存在多个可到达位置时，会避开刚刚使用过的道具位置。

导入的 JSON 关卡包采用严格校验：`maps.length` 或 `quadrants.length` 必须等于 `totalStages`，但不能同时提供两者；每个 `maps` 关卡必须是 13x13；每个 `quadrants` 关卡必须是 26x26；`enemies.length` 必须等于 `totalStages`；每关敌人序列必须至少包含一个敌人。运行时把每关的 `enemies` 数组作为权威敌人顺序，其中包括 `typeIndex`、携带者标志、`powerUpType`、出生点和显式出生延迟。`enemyTotal` 是可选元数据/默认兼容字段；活动关卡的敌人数由该关敌人序列长度得出。

关卡开始时，引擎会规范化基地图块以及紧邻的出生/基地保护区域。

## 参考说明

内置敌人构成现使用原版风格 35 关敌人分组表。`data/free-35-stage-pack.json` 为全部 35 关提供固定的免费/自定义替代地图，`data/free-audio-manifest.json` 提供当前程序化替代音效事件，`data/free-sprite-manifest.json` 提供当前程序化坦克、子弹、地形、基地、爆炸、面板、轮廓和道具精灵。未来的采样音乐/音效或更丰富的精灵图同样应使用免费/自定义替代资源，而非源自原版 ROM 的资源。用于交叉核对规则的公开参考资料包括：

- [StrategyWiki Battle City 攻略](https://strategywiki.org/wiki/Battle_City/Walkthrough)
- [StrategyWiki Battle City 玩法](https://strategywiki.org/wiki/Battle_City/Gameplay)
