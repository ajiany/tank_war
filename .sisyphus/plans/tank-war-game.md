# 坦克大战 (Battle City Clone) - MVP Work Plan

## TL;DR

> **Quick Summary**: 从零构建经典坦克大战游戏的 MVP 版本，使用 TypeScript + HTML5 Canvas + Vite。包含玩家坦克、敌人 AI、地图障碍物、碰撞检测、基地保护和完整的游戏状态管理。

> **Deliverables**:
> - 可运行的浏览器游戏
> - 玩家坦克（WASD + J/空格控制）
> - 20个敌人分批生成（简单 AI）
> - 13x13 地图（砖墙、钢墙、基地）
> - 完整的游戏循环（菜单→游戏→暂停→胜利/失败）

> **Estimated Effort**: Medium (约 8-12 小时)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: 初始化 → 游戏核心 → 碰撞系统 → 敌人 AI → 游戏状态

---

## Context

### Original Request
用户希望从零构建一个坦克大战小游戏，经典 Battle City 风格。

### Interview Summary
**Key Discussions**:
- 技术栈: TypeScript + HTML5 Canvas + Vite（无游戏引擎）
- 复杂度: MVP 版本，专注核心玩法
- 模式: 单人游戏
- 操作: WASD 移动 + J/空格 射击
- 视觉: 简单颜色方块（无精灵图）
- 音效/道具/多关卡: 不需要

**Technical Decisions**:
- 架构: OOP with Entity base class（推荐用于小型游戏）
- 游戏循环: Fixed timestep (16ms) + variable rendering
- 碰撞: AABB (Axis-Aligned Bounding Box)
- AI: Simple state machine (Patrol/Random movement + occasional shooting)

### Metis Review
**Identified Gaps** (addressed):
- 地图规格未确认 → 已确认: 13x13 网格, 32px 瓦片, 416x416 Canvas
- 视觉风格未确认 → 已确认: 简单颜色方块
- 敌人生成机制 → 已确认: 分批生成，最多4个在场
- 子弹限制 → 已确认: 每坦克1颗

---

## Work Objectives

### Core Objective
构建一个可玩的坦克大战 MVP 游戏，玩家控制坦克保护基地，消灭 20 个敌人坦克。

### Concrete Deliverables
- `package.json` - Vite + TypeScript 项目配置
- `index.html` - Canvas 容器页面
- `src/main.ts` - 游戏入口
- `src/Game.ts` - 游戏主类和循环
- `src/entities/*.ts` - Entity, Tank, Bullet, Wall, Base
- `src/systems/*.ts` - Input, Collision, EnemyAI, Spawn
- `src/types.ts` - 类型定义
- `src/map.ts` - 地图数据

### Definition of Done
- [ ] `bun run dev` 启动开发服务器
- [ ] 浏览器打开显示游戏 Canvas
- [ ] 玩家可以用 WASD 移动，J/空格 射击
- [ ] 碰撞检测工作正常（坦克不能穿墙）
- [ ] 敌人 AI 能移动和射击
- [ ] 消灭 20 个敌人显示胜利
- [ ] 基地被毁或生命归零显示失败

### Must Have
- 玩家坦克（蓝色）
- 敌人坦克（红色）x 20
- 地图障碍物（砖墙、钢墙）
- 基地（黄色）
- 碰撞检测
- 游戏状态管理
- 3 条生命
- 分数系统

### Must NOT Have (Guardrails)
- ❌ 多关卡（单一地图）
- ❌ 多地图布局
- ❌ 音效或背景音乐
- ❌ 道具/升级系统
- ❌ 双人模式
- ❌ 高分存储
- ❌ 存档/读档
- ❌ 复杂 AI（如寻路算法）
- ❌ 坦克动画
- ❌ 粒子效果
- ❌ 移动端触控
- ❌ 窗口大小调整

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: N/A
- **Primary Verification**: Agent-Executed QA Scenarios (Playwright browser automation)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> 每个任务都包含由执行代理直接运行的 QA 场景。
> 使用 Playwright 打开浏览器，运行游戏，验证行为。

**Primary Tool**: Playwright (playwright skill)

**Scenario Format**:
```
Scenario: [Name]
  Tool: Playwright
  Preconditions: [What must be true]
  Steps:
    1. [Exact action]
    2. [Assertion]
  Expected Result: [Observable outcome]
  Evidence: [Screenshot path]
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Parallel):
├── Task 1: Project Setup (Vite + TS)
├── Task 2: Canvas & Game Loop
├── Task 3: Input Handler
└── Task 4: Entity Base Class

Wave 2 (Core Features - Sequential Dependencies):
├── Task 5: Player Tank (depends: 1-4)
├── Task 6: Bullet System (depends: 4, 5)
├── Task 7: Map System (depends: 1, 2)
├── Task 8: Collision System (depends: 4, 7)
├── Task 9: Enemy Tank (depends: 4, 8)
├── Task 10: Enemy AI (depends: 9)
├── Task 11: Enemy Spawner (depends: 9, 10)
├── Task 12: Base System (depends: 7, 8)
├── Task 13: Game States (depends: 2, 5, 12)
└── Task 14: HUD (depends: 2, 13)

Wave 3 (Integration & Polish):
└── Task 15: Game Integration (depends: ALL)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | None | 5, 7 |
| 2 | 1 | 5, 7, 13, 14 |
| 3 | 1 | 5 |
| 4 | 1 | 5, 6, 8, 9 |
| 5 | 1, 2, 3, 4 | 6, 13 |
| 6 | 4, 5 | 15 |
| 7 | 1, 2 | 8, 12 |
| 8 | 4, 7 | 9, 12 |
| 9 | 4, 8 | 10, 11 |
| 10 | 9 | 11 |
| 11 | 9, 10 | 15 |
| 12 | 7, 8 | 13 |
| 13 | 2, 5, 12 | 14, 15 |
| 14 | 2, 13 | 15 |
| 15 | ALL | None |

---

## TODOs

- [x] 1. Project Setup (Vite + TypeScript)

  **What to do**:
  - Initialize Vite project with TypeScript template
  - Configure `tsconfig.json` with strict mode
  - Create basic `index.html` with canvas element
  - Set up `package.json` scripts (dev, build)
  - Install dependencies: `vite`, `typescript`

  **Must NOT do**:
  - Don't add unnecessary dependencies
  - Don't configure complex build pipelines
  - Don't set up testing frameworks (no tests needed)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple scaffolding task, standard Vite setup
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5, Task 7
  - **Blocked By**: None

  **References**:
  - Vite docs: `https://vitejs.dev/guide/` - Project setup
  - TypeScript config: `https://www.typescriptlang.org/tsconfig` - Strict mode options

  **Acceptance Criteria**:
  - [ ] `package.json` exists with vite and typescript dependencies
  - [ ] `index.html` exists with `<canvas id="gameCanvas">`
  - [ ] `tsconfig.json` exists with `strict: true`
  - [ ] `bun run dev` starts dev server
  - [ ] Browser opens without errors

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Dev server starts successfully
    Tool: Bash
    Preconditions: Project initialized
    Steps:
      1. Run: bun run dev &
      2. Wait 3 seconds
      3. curl -s http://localhost:5173 | grep -q "gameCanvas"
    Expected Result: Dev server running, HTML contains canvas
    Evidence: Terminal output

  Scenario: TypeScript compiles without errors
    Tool: Bash
    Preconditions: tsconfig.json configured
    Steps:
      1. Run: bunx tsc --noEmit
      2. Assert: Exit code is 0
    Expected Result: No TypeScript errors
    Evidence: Terminal output
  ```

  **Commit**: YES (1)
  - Message: `chore: initialize Vite + TypeScript project`
  - Files: `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`

---

- [x] 2. Canvas & Game Loop
  **What to do**:
  - Create `src/main.ts` entry point
  - Create `src/Game.ts` with main game class
  - Implement fixed timestep game loop (16ms update)
  - Set up canvas context (416x416)
  - Clear canvas each frame
  - Basic render loop structure

  **Must NOT do**:
  - Don't implement entity rendering (separate task)
  - Don't add game state management yet
  - Don't use requestAnimationFrame incorrectly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Core game infrastructure, moderate complexity
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5, Task 7, Task 13, Task 14
  - **Blocked By**: Task 1

  **References**:
  - Game Loop Pattern: `https://gameprogrammingpatterns.com/game-loop.html` - Fixed timestep implementation
  - Research finding: Fixed timestep 16ms with variable rendering, interpolate for smooth motion

  **Acceptance Criteria**:
  - [ ] `src/Game.ts` exists with Game class
  - [ ] Canvas is 416x416 pixels
  - [ ] Game loop runs at ~60 FPS
  - [ ] Console logs frame updates (for verification)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Canvas renders at correct size
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:5173
      2. Get canvas element: #gameCanvas
      3. Assert: width === 416 AND height === 416
    Expected Result: Canvas is 416x416
    Evidence: .sisyphus/evidence/task-2-canvas-size.png

  Scenario: Game loop runs
    Tool: Playwright
    Preconditions: Game loop implemented
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait 2 seconds
      3. Check console for "update" or "render" logs
    Expected Result: Game loop logs visible in console
    Evidence: Console output captured
  ```

  **Commit**: YES (2)
  - Message: `feat: add canvas and game loop`
  - Files: `src/main.ts`, `src/Game.ts`

---

- [x] 3. Input Handler
  **What to do**:
  - Create `src/systems/Input.ts`
  - Track keyboard state (keydown/keyup events)
  - Support WASD for movement
  - Support J and Space for shooting
  - Support Escape for pause
  - Support Enter for start/restart

  **Must NOT do**:
  - Don't implement touch controls
  - Don't add gamepad support
  - Don't bind actions directly (just track state)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple input state tracking
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - Research finding: Use Set<string> for tracking pressed keys

  **Acceptance Criteria**:
  - [ ] `src/systems/Input.ts` exists
  - [ ] `Input.isPressed('w')` returns boolean
  - [ ] WASD, J, Space, Escape, Enter all tracked

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Input tracks key presses
    Tool: Playwright
    Preconditions: Input system initialized
    Steps:
      1. Navigate to http://localhost:5173
      2. Focus canvas
      3. Press 'w' key
      4. Evaluate: window.game.input.isPressed('w')
      5. Assert: returns true
      6. Release 'w' key
      7. Evaluate: window.game.input.isPressed('w')
      8. Assert: returns false
    Expected Result: Input correctly tracks key state
    Evidence: Console output
  ```

  **Commit**: YES (3)
  - Message: `feat: add input handler`
  - Files: `src/systems/Input.ts`

---

- [x] 4. Entity Base Class
  **What to do**:
  - Create `src/entities/Entity.ts`
  - Define base properties: x, y, width, height, velocity, visible
  - Define base methods: update(deltaTime), draw(ctx)
  - Implement AABB collision method: `collidesWith(other)`
  - Create `src/types.ts` for shared types (Direction, etc.)

  **Must NOT do**:
  - Don't implement ECS (use simple OOP)
  - Don't add complex component system
  - Don't implement rendering in base class

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple base class definition
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 5, Task 6, Task 8, Task 9
  - **Blocked By**: Task 1

  **References**:
  - Research finding: Entity with x, y, width, height, velocity, visible

  **Acceptance Criteria**:
  - [ ] `src/entities/Entity.ts` exists
  - [ ] `src/types.ts` exists with Direction type
  - [ ] Entity.collidesWith() returns correct boolean

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: AABB collision detection works
    Tool: Bash (Node)
    Preconditions: Entity class defined
    Steps:
      1. Create two entities: a(0,0,32,32), b(16,16,32,32)
      2. Assert: a.collidesWith(b) === true
      3. Move b to (100,100,32,32)
      4. Assert: a.collidesWith(b) === false
    Expected Result: Collision detection accurate
    Evidence: Node REPL output
  ```

  **Commit**: YES (4)
  - Message: `feat: add Entity base class`
  - Files: `src/entities/Entity.ts`, `src/types.ts`

---

- [ ] 5. Player Tank

  **What to do**:
  - Create `src/entities/Tank.ts` extending Entity
  - Implement movement with WASD input
  - Track direction (up/down/left/right)
  - Implement shooting with J/Space
  - Set player color to blue
  - Set speed to 100 pixels/second
  - Set tank size to 32x32 (matching tile size)
  - Set spawn position near bottom center: grid (5, 11) = pixel (160, 352)
  - Add shooting cooldown: 0.5 seconds between shots
  - Boundary checking (stay in canvas)

  **Must NOT do**:
  - Don't implement collision with walls yet
  - Don't add invincibility or power-ups
  - Don't add shooting cooldown yet

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Core game entity with moderate logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 6, Task 13
  - **Blocked By**: Task 1, 2, 3, 4

  **References**:
  - Research finding: Tank with direction, speed, color, cooldown properties

  **Acceptance Criteria**:
  - [ ] Player tank appears on screen (blue square)
  - [ ] WASD moves tank in 4 directions
  - [ ] J/Space creates bullet (if bullet system ready)
  - [ ] Tank cannot leave canvas bounds

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Player tank renders and moves
    Tool: Playwright
    Preconditions: Game running, player spawned
    Steps:
      1. Navigate to http://localhost:5173
      2. Press 'w' for 1 second
      3. Take screenshot
      4. Assert: Player tank moved up (y decreased)
      5. Press 's' for 1 second
      6. Assert: Player tank moved down (y increased)
    Expected Result: Tank responds to WASD input
    Evidence: .sisyphus/evidence/task-5-player-movement.png

  Scenario: Player tank respects canvas bounds
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Press 'w' for 5 seconds (try to go past top)
      2. Assert: Tank y >= 0
      3. Press 'd' for 5 seconds (try to go past right)
      4. Assert: Tank x + width <= 416
    Expected Result: Tank stays within canvas
    Evidence: .sisyphus/evidence/task-5-bounds-check.png
  ```

  **Commit**: YES (5)
  - Message: `feat: add player tank with movement`
  - Files: `src/entities/Tank.ts`

---

- [ ] 6. Bullet System

  **What to do**:
  - Create `src/entities/Bullet.ts`
  - Bullet spawns from tank position in facing direction
  - Bullet moves at 300 pixels/second
  - Bullet destroys on wall/enemy/bounds collision
  - Track bullet owner (player vs enemy)
  - Limit: 1 bullet per tank on screen
  - Yellow circle for bullet visual

  **Must NOT do**:
  - Don't add bullet power-ups
  - Don't add bullet trails
  - Don't implement damage yet

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Simple projectile entity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 15
  - **Blocked By**: Task 4, Task 5

  **References**:
  - Research finding: Bullet with speed 5 (at 60fps = 300px/s), travels in direction

  **Acceptance Criteria**:
  - [ ] Bullet spawns at tank barrel position
  - [ ] Bullet travels in facing direction
  - [ ] Bullet removed when leaving canvas
  - [ ] Only 1 bullet per tank allowed

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Player can shoot bullets
    Tool: Playwright
    Preconditions: Game running, player spawned
    Steps:
      1. Navigate to http://localhost:5173
      2. Press 'j' or Space
      3. Assert: Yellow bullet visible
      4. Wait 2 seconds
      5. Assert: Bullet left canvas and was removed
    Expected Result: Bullet spawns and travels
    Evidence: .sisyphus/evidence/task-6-bullet-shoot.png

  Scenario: Only one bullet per tank
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Press 'j' to shoot
      2. Immediately press 'j' again (5 times rapidly)
      3. Count bullets on screen
      4. Assert: Only 1 bullet visible
    Expected Result: Bullet limit enforced
    Evidence: .sisyphus/evidence/task-6-bullet-limit.png
  ```

  **Commit**: YES (6)
  - Message: `feat: add bullet system`
  - Files: `src/entities/Bullet.ts`

---

- [ ] 7. Map System

  **What to do**:
  - Create `src/map.ts` with map data array
  - Define tile types: 0=empty, 1=brick, 2=steel, 3=base
  - Create 13x13 grid layout (classic Battle City style)
  - Create `src/entities/Wall.ts` for wall entities
  - Create `src/entities/Base.ts` for base entity
  - Render brick walls (brown), steel walls (gray), base (yellow)
  - Base positioned at bottom center

  **Must NOT do**:
  - Don't implement wall destruction yet
  - Don't add water, ice, trees tiles
  - Don't create map editor

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Data structure and simple rendering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8, Task 12
  - **Blocked By**: Task 1, Task 2

  **References**:
  - Classic Battle City map layout
  - Grid: 13x13, tile size: 32px

  **Map Layout** (example):
  ```
  0 0 0 1 0 0 0 0 0 1 0 0 0
  0 2 0 1 0 2 0 2 0 1 0 2 0
  0 0 0 1 0 0 0 0 0 1 0 0 0
  1 1 0 0 0 1 0 1 0 0 0 1 1
  0 0 0 0 0 0 0 0 0 0 0 0 0
  0 2 0 1 0 2 0 2 0 1 0 2 0
  0 0 0 1 0 0 0 0 0 1 0 0 0
  1 1 0 0 0 1 0 1 0 0 0 1 1
  0 0 0 1 0 0 0 0 0 1 0 0 0
  0 2 0 1 0 2 0 2 0 1 0 2 0
  0 0 0 1 0 0 0 0 0 1 0 0 0
  1 1 1 1 0 0 1 0 0 1 1 1 1
  0 0 0 0 0 0 3 0 0 0 0 0 0
  ```

  **Acceptance Criteria**:
  - [ ] Map renders with walls and base
  - [ ] Brick walls are brown, steel walls gray, base yellow
  - [ ] Base at bottom center (6, 12)
  - [ ] Walls at correct grid positions

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Map renders correctly
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait for map to render
      3. Take screenshot
      4. Assert: Brown squares visible (brick walls)
      5. Assert: Gray squares visible (steel walls)
      6. Assert: Yellow square at bottom center (base)
    Expected Result: Map with all tile types visible
    Evidence: .sisyphus/evidence/task-7-map-render.png
  ```

  **Commit**: YES (7)
  - Message: `feat: add map system with walls and base`
  - Files: `src/map.ts`, `src/entities/Wall.ts`, `src/entities/Base.ts`

---

- [ ] 8. Collision System

  **What to do**:
  - Create `src/systems/Collision.ts`
  - Check tank-wall collisions (prevent movement through walls)
  - Check bullet-wall collisions (destroy brick wall, bounce off steel)
  - Check bullet-tank collisions (damage/destroy tank)
  - Check bullet-base collision (destroy base = game over)
  - Implement collision response (stop movement, destroy entities)

  **Must NOT do**:
  - Don't use pixel-perfect collision (AABB is sufficient)
  - Don't add physics simulation
  - Don't implement tank-tank collision yet

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Collision detection logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9, Task 12
  - **Blocked By**: Task 4, Task 7

  **References**:
  - AABB collision formula from research
  - `a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y`

  **Acceptance Criteria**:
  - [ ] Player cannot move through walls
  - [ ] Bullet destroys brick wall on contact
  - [ ] Bullet removed on steel wall contact
  - [ ] Bullet hitting base triggers game over

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Tank cannot pass through walls
    Tool: Playwright
    Preconditions: Game running, map with walls
    Steps:
      1. Move player towards a brick wall
      2. Continue pressing direction key for 2 seconds
      3. Assert: Tank stopped at wall boundary
      4. Tank did not pass through wall
    Expected Result: Collision stops tank movement
    Evidence: .sisyphus/evidence/task-8-wall-collision.png

  Scenario: Bullet destroys brick wall
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Position player facing a brick wall
      2. Shoot bullet at wall
      3. Wait for bullet to hit
      4. Assert: Wall is destroyed (no longer visible at that position)
    Expected Result: Brick wall destroyed by bullet
    Evidence: .sisyphus/evidence/task-8-brick-destroy.png

  Scenario: Steel wall is indestructible
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Position player facing a steel wall
      2. Shoot bullet at wall (multiple times)
      3. Assert: Steel wall still visible
      4. Assert: Bullets were removed
    Expected Result: Steel wall not destroyed
    Evidence: .sisyphus/evidence/task-8-steel-indestructible.png
  ```

  **Commit**: YES (8)
  - Message: `feat: add collision system`
  - Files: `src/systems/Collision.ts`

---

- [ ] 9. Enemy Tank

  **What to do**:
  - Create `src/entities/EnemyTank.ts` extending Tank
  - Set enemy color to red
  - Set enemy speed slightly slower than player (80 pixels/second)
  - Enemy can shoot bullets
  - Track enemy health (1 hit = destroyed)

  **Must NOT do**:
  - Don't implement AI movement yet (Task 10)
  - Don't add multiple enemy types
  - Don't add enemy animation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Similar to player tank, just different color/properties
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 10, Task 11
  - **Blocked By**: Task 4, Task 8

  **References**:
  - Tank class from Task 5

  **Acceptance Criteria**:
  - [ ] Enemy tank renders (red square)
  - [ ] Enemy can be destroyed by player bullet
  - [ ] Enemy bullet can damage player

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Enemy tank renders
    Tool: Playwright
    Preconditions: Game running, enemy spawned
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait for enemy to spawn
      3. Assert: Red square visible on canvas
    Expected Result: Enemy tank visible
    Evidence: .sisyphus/evidence/task-9-enemy-render.png

  Scenario: Player bullet destroys enemy
    Tool: Playwright
    Preconditions: Game running, enemy spawned
    Steps:
      1. Position player to face enemy
      2. Shoot bullet at enemy
      3. Wait for bullet to hit
      4. Assert: Enemy no longer visible
    Expected Result: Enemy destroyed by player bullet
    Evidence: .sisyphus/evidence/task-9-enemy-destroy.png
  ```

  **Commit**: YES (9)
  - Message: `feat: add enemy tank entity`
  - Files: `src/entities/EnemyTank.ts`

---

- [ ] 10. Enemy AI

  **What to do**:
  - Create `src/systems/EnemyAI.ts`
  - Simple state machine: Random movement + occasional shooting
  - Random direction change every 1-3 seconds
  - Shoot randomly every 2-4 seconds
  - Turn when hitting a wall
  - No pathfinding or player tracking

  **Must NOT do**:
  - Don't implement A* pathfinding
  - Don't implement player tracking/chasing
  - Don't make AI too smart (keep it simple)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Simple AI state machine
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 11
  - **Blocked By**: Task 9

  **References**:
  - Research finding: RandomAI with directionChangeTimer, currentDirection

  **AI Logic**:
  ```typescript
  // Pseudocode
  update(dt):
    directionTimer -= dt
    if directionTimer <= 0:
      direction = random(4 directions)
      directionTimer = 1 + random(2)  // 1-3 seconds
    
    shootTimer -= dt
    if shootTimer <= 0:
      shoot()
      shootTimer = 2 + random(2)  // 2-4 seconds
    
    move(direction)
    
    if hitWall():
      direction = random(4 directions)  // Turn on collision
  ```

  **Acceptance Criteria**:
  - [ ] Enemy changes direction periodically
  - [ ] Enemy shoots periodically
  - [ ] Enemy turns when hitting wall
  - [ ] AI is unpredictable but not smart

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Enemy AI moves and shoots
    Tool: Playwright
    Preconditions: Game running, enemy spawned
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait 5 seconds
      3. Assert: Enemy has moved from starting position
      4. Assert: Enemy has fired at least one bullet
    Expected Result: Enemy exhibits AI behavior
    Evidence: .sisyphus/evidence/task-10-enemy-ai.png
  ```

  **Commit**: YES (10)
  - Message: `feat: add simple enemy AI`
  - Files: `src/systems/EnemyAI.ts`

---

- [ ] 11. Enemy Spawner

  **What to do**:
  - Create `src/systems/EnemySpawner.ts`
  - Total enemies: 20
  - Max on screen: 4
  - Spawn from top edge (3 spawn points: left, center, right)
  - Spawn new enemy when count < max AND total < 20
  - Track enemies destroyed count

  **Must NOT do**:
  - Don't spawn all 20 at once
  - Don't spawn enemies on top of each other
  - Don't spawn after victory

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Simple spawn logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 15
  - **Blocked By**: Task 9, Task 10

  **Spawn Logic**:
  ```typescript
  // Pseudocode
  const SPAWN_POINTS = [64, 208, 352]  // x positions at top
  const MAX_ON_SCREEN = 4
  const TOTAL_ENEMIES = 20
  
  spawnedCount = 0
  destroyedCount = 0
  
  update():
    if spawnedCount >= TOTAL_ENEMIES: return
    if activeEnemies.length >= MAX_ON_SCREEN: return
    
    spawnEnemy()
    spawnedCount++
  
  onEnemyDestroyed():
    destroyedCount++
    if destroyedCount >= TOTAL_ENEMIES:
      triggerVictory()
  ```

  **Acceptance Criteria**:
  - [ ] Enemies spawn from top of map
  - [ ] Maximum 4 enemies on screen at once
  - [ ] Total 20 enemies spawned in game
  - [ ] New enemy spawns when one is destroyed

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Max 4 enemies on screen
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait 10 seconds
      3. Count enemy tanks on screen
      4. Assert: Count <= 4
    Expected Result: Enemy count capped at 4
    Evidence: .sisyphus/evidence/task-11-max-enemies.png

  Scenario: New enemy spawns after destruction
    Tool: Playwright
    Preconditions: Game running, 4 enemies active
    Steps:
      1. Destroy one enemy
      2. Wait 2 seconds
      3. Assert: New enemy spawned (4 enemies again)
    Expected Result: Spawn system replenishes enemies
    Evidence: .sisyphus/evidence/task-11-spawn-replenish.png
  ```

  **Commit**: YES (11)
  - Message: `feat: add enemy spawner system`
  - Files: `src/systems/EnemySpawner.ts`

---

- [ ] 12. Base System

  **What to do**:
  - Base is a 32x32 yellow square at position (6*32, 12*32) = (192, 384)
  - Base can be destroyed by any bullet
  - Base destruction triggers game over
  - Base has visual indicator (flag or symbol)

  **Must NOT do**:
  - Don't add base health (1 hit = destroyed)
  - Don't add base protection power-ups
  - Don't make base mobile

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple entity with destruction logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 13
  - **Blocked By**: Task 7, Task 8

  **Acceptance Criteria**:
  - [ ] Base renders at bottom center
  - [ ] Base destroyed by player bullet
  - [ ] Base destroyed by enemy bullet
  - [ ] Base destruction shows game over

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Base destruction triggers game over
    Tool: Playwright
    Preconditions: Game running
    Steps:
      1. Navigate to http://localhost:5173
      2. Wait for enemy to shoot base
      3. Or: Move player to shoot base manually
      4. Assert: "GAME OVER" text appears
    Expected Result: Game over on base destruction
    Evidence: .sisyphus/evidence/task-12-base-destroy.png
  ```

  **Commit**: YES (12)
  - Message: `feat: add base destruction logic`
  - Files: `src/entities/Base.ts` (update)

---

- [ ] 13. Game States

  **What to do**:
  - Implement state machine: MENU → PLAYING → PAUSED / GAME_OVER / VICTORY
  - Menu: "TANK WAR" title, "Press ENTER to start"
  - Playing: Active gameplay
  - Paused: "PAUSED" overlay, Press ESC to resume
  - Game Over: "GAME OVER" text, final score, "Press ENTER to restart"
  - Victory: "VICTORY!" text, final score, "Press ENTER to restart"
  - States render using canvas (not HTML overlay)

  **Must NOT do**:
  - Don't use HTML elements for UI (canvas only)
  - Don't add complex animations
  - Don't add settings menu

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: State machine and rendering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14, Task 15
  - **Blocked By**: Task 2, Task 5, Task 12

  **State Transitions**:
  ```
  MENU --[Enter]--> PLAYING
  PLAYING --[Escape]--> PAUSED
  PAUSED --[Escape]--> PLAYING
  PLAYING --[base destroyed OR lives=0]--> GAME_OVER
  PLAYING --[all 20 enemies destroyed]--> VICTORY
  GAME_OVER --[Enter]--> MENU
  VICTORY --[Enter]--> MENU
  ```

  **Acceptance Criteria**:
  - [ ] Menu shows on game start
  - [ ] Enter key starts game
  - [ ] Escape pauses game
  - [ ] All 20 enemies killed shows victory
  - [ ] Lives=0 or base destroyed shows game over
  - [ ] Enter restarts from menu

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Menu to gameplay transition
    Tool: Playwright
    Preconditions: Game loaded
    Steps:
      1. Navigate to http://localhost:5173
      2. Assert: "TANK WAR" or similar title visible
      3. Press Enter
      4. Assert: Menu disappeared, gameplay started
    Expected Result: Menu transitions to gameplay
    Evidence: .sisyphus/evidence/task-13-menu-start.png

  Scenario: Pause and resume
    Tool: Playwright
    Preconditions: Game in playing state
    Steps:
      1. Press Escape
      2. Assert: "PAUSED" text visible
      3. Press Escape again
      4. Assert: Game resumed
    Expected Result: Pause toggle works
    Evidence: .sisyphus/evidence/task-13-pause.png

  Scenario: Victory screen
    Tool: Playwright
    Preconditions: 20 enemies destroyed
    Steps:
      1. Destroy all 20 enemies
      2. Assert: "VICTORY" text visible
      3. Assert: Final score displayed
    Expected Result: Victory screen shows
    Evidence: .sisyphus/evidence/task-13-victory.png

  Scenario: Game over screen
    Tool: Playwright
    Preconditions: Player lives = 0 or base destroyed
    Steps:
      1. Lose all 3 lives (let enemies shoot player)
      2. Assert: "GAME OVER" text visible
      3. Press Enter
      4. Assert: Returns to menu
    Expected Result: Game over flow works
    Evidence: .sisyphus/evidence/task-13-gameover.png
  ```

  **Commit**: YES (13)
  - Message: `feat: add game state management`
  - Files: `src/Game.ts` (update)

---

- [ ] 14. HUD (Heads-Up Display)

  **What to do**:
  - Display lives remaining (top-left): "LIVES: 3"
  - Display enemies destroyed (top-right): "ENEMIES: 0/20"
  - Display score (top-center): "SCORE: 0"
  - Score: 100 points per enemy destroyed
  - Render using canvas text (not HTML)

  **Must NOT do**:
  - Don't add health bars
  - Don't add mini-map
  - Don't use HTML elements

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text rendering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 15
  - **Blocked By**: Task 2, Task 13

  **Acceptance Criteria**:
  - [ ] Lives displayed in top-left
  - [ ] Enemy count displayed in top-right
  - [ ] Score displayed in top-center
  - [ ] Values update in real-time

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: HUD displays correct information
    Tool: Playwright
    Preconditions: Game in playing state
    Steps:
      1. Navigate to http://localhost:5173
      2. Press Enter to start
      3. Assert: "LIVES: 3" visible in top-left
      4. Assert: "ENEMIES: 0/20" visible in top-right
      5. Destroy one enemy
      6. Assert: "ENEMIES: 1/20" and "SCORE: 100" visible
    Expected Result: HUD updates correctly
    Evidence: .sisyphus/evidence/task-14-hud.png
  ```

  **Commit**: YES (14)
  - Message: `feat: add HUD display`
  - Files: `src/Game.ts` (update)

---

- [ ] 15. Game Integration & Final Polish

  **What to do**:
  - Integrate all systems into main Game class
  - Ensure game loop calls all update methods in correct order
  - Ensure render loop draws all entities
  - Test complete game flow: start → play → win/lose → restart
  - Fix any integration bugs
  - Add shooting cooldown (0.5 seconds between shots)

  **Must NOT do**:
  - Don't add new features
  - Don't refactor working code
  - Don't add visual effects

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration and bug fixing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Final)
  - **Blocks**: None
  - **Blocked By**: ALL (Tasks 1-14)

  **Game Loop Order**:
  ```
  update(dt):
    1. Handle input
    2. Update player
    3. Update enemies (AI)
    4. Update bullets
    5. Check collisions
    6. Spawn new enemies
    7. Check win/lose conditions
  
  render():
    1. Clear canvas
    2. Draw map (walls, base)
    3. Draw player
    4. Draw enemies
    5. Draw bullets
    6. Draw HUD
    7. Draw state overlays (menu, pause, game over)
  ```

  **Acceptance Criteria**:
  - [ ] Complete game playable from start to finish
  - [ ] No runtime errors
  - [ ] All features work together
  - [ ] Victory achievable by destroying 20 enemies
  - [ ] Game over triggered by losing lives or base destruction

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Complete game flow - Victory
    Tool: Playwright
    Preconditions: All features implemented
    Steps:
      1. Navigate to http://localhost:5173
      2. Press Enter to start
      3. Destroy all 20 enemies (may need to automate or play manually)
      4. Assert: "VICTORY" screen appears
      5. Press Enter to return to menu
    Expected Result: Full game completable
    Evidence: .sisyphus/evidence/task-15-complete-victory.png

  Scenario: Complete game flow - Game Over by lives
    Tool: Playwright
    Preconditions: All features implemented
    Steps:
      1. Navigate to http://localhost:5173
      2. Press Enter to start
      3. Let enemies shoot player 3 times
      4. Assert: "GAME OVER" screen appears
    Expected Result: Game over on lives depleted
    Evidence: .sisyphus/evidence/task-15-gameover-lives.png

  Scenario: Complete game flow - Game Over by base
    Tool: Playwright
    Preconditions: All features implemented
    Steps:
      1. Navigate to http://localhost:5173
      2. Press Enter to start
      3. Let enemy bullet hit base (or shoot it yourself)
      4. Assert: "GAME OVER" screen appears immediately
    Expected Result: Game over on base destruction
    Evidence: .sisyphus/evidence/task-15-gameover-base.png

  Scenario: Restart after game over
    Tool: Playwright
    Preconditions: Game over screen visible
    Steps:
      1. From game over screen, press Enter
      2. Assert: Returns to menu
      3. Press Enter to start new game
      4. Assert: Lives = 3, Score = 0, Enemies = 0/20
    Expected Result: Full game state reset
    Evidence: .sisyphus/evidence/task-15-restart.png
  ```

  **Commit**: YES (15)
  - Message: `feat: integrate all game systems`
  - Files: `src/Game.ts` (final update)

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1 | `chore: initialize Vite + TypeScript project` | package.json, index.html, tsconfig.json, vite.config.ts |
| 2 | `feat: add canvas and game loop` | src/main.ts, src/Game.ts |
| 3 | `feat: add input handler` | src/systems/Input.ts |
| 4 | `feat: add Entity base class` | src/entities/Entity.ts, src/types.ts |
| 5 | `feat: add player tank with movement` | src/entities/Tank.ts |
| 6 | `feat: add bullet system` | src/entities/Bullet.ts |
| 7 | `feat: add map system with walls and base` | src/map.ts, src/entities/Wall.ts, src/entities/Base.ts |
| 8 | `feat: add collision system` | src/systems/Collision.ts |
| 9 | `feat: add enemy tank entity` | src/entities/EnemyTank.ts |
| 10 | `feat: add simple enemy AI` | src/systems/EnemyAI.ts |
| 11 | `feat: add enemy spawner system` | src/systems/EnemySpawner.ts |
| 12 | `feat: add base destruction logic` | src/entities/Base.ts |
| 13 | `feat: add game state management` | src/Game.ts |
| 14 | `feat: add HUD display` | src/Game.ts |
| 15 | `feat: integrate all game systems` | src/Game.ts |

---

## Success Criteria

### Verification Commands
```bash
bun run dev    # Expected: Dev server starts at http://localhost:5173
bun run build  # Expected: Production build succeeds
```

### Final Checklist
- [ ] All "Must Have" present
  - [ ] Player tank (blue)
  - [ ] Enemy tanks (red) x 20
  - [ ] Map obstacles (brick, steel)
  - [ ] Base (yellow)
  - [ ] Collision detection
  - [ ] Game state management
  - [ ] 3 lives
  - [ ] Score system
- [ ] All "Must NOT Have" absent
  - [ ] No multiple levels
  - [ ] No audio
  - [ ] No power-ups
  - [ ] No two-player
  - [ ] No complex AI
- [ ] Game playable from start to finish
- [ ] Victory achievable
- [ ] Game over conditions work
- [ ] Restart works
