# Tank War 坦克大战

经典坦克大战（Battle City）的现代像素风重制版，使用 TypeScript + HTML5 Canvas 构建。

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 游戏特色

- 经典像素风 8x8 精灵渲染（坦克、砖墙、钢墙、基地鹰形图标）
- 3 个关卡主题：城市 / 森林 / 雪地，各有独特配色和环境粒子
- 3 种敌人类型：普通 / 快速 / 装甲
- 6 种地形：砖墙、钢墙、河流（不可通行）、树丛（遮挡视野）、冰面
- 建造系统：按 B 进入建造模式，放置防御工事抵挡敌军
- 道具系统：星星、炸弹、坦克（+1命）
- 视觉效果：爆炸动画、子弹拖尾、坦克尾气、屏幕震动、环境粒子（雪花/落叶/灰尘）
- 2x 像素缩放，画面清晰锐利

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

启动后访问 `http://localhost:5173` 即可游玩。

## 操作说明

| 按键 | 功能 |
|------|------|
| W / A / S / D | 移动 |
| J 或 空格 | 射击 |
| B | 进入/退出建造模式 |
| 1-5 | 建造模式下选择材料 |
| X | 建造模式下删除方块 |
| ESC | 暂停 |
| Enter | 确认 |

详细操作说明请参阅 [GAMEPLAY.md](./GAMEPLAY.md)。

## 技术栈

- TypeScript 5.6（严格模式）
- HTML5 Canvas 2D 渲染
- Vite 6.0 构建工具
- 纯手写像素精灵（无外部图片资源）

## 项目结构

```
src/
├── main.ts                  # 入口
├── Game.ts                  # 游戏主循环、状态管理、渲染
├── constants.ts             # 游戏常量、主题配色、建造配置
├── levels.ts                # 关卡地图数据和配置
├── map.ts                   # 地图渲染（地面、河流、冰面、树丛）
├── types.ts                 # 类型定义
├── entities/
│   ├── Entity.ts            # 实体基类（AABB碰撞）
│   ├── Tank.ts              # 玩家坦克
│   ├── EnemyTank.ts         # 敌人坦克（3种类型 + AI）
│   ├── Bullet.ts            # 子弹
│   ├── Wall.ts              # 墙壁（砖/钢）
│   ├── Base.ts              # 基地（鹰）
│   └── PowerUp.ts           # 道具
├── systems/
│   ├── Input.ts             # 键盘输入
│   ├── Collision.ts         # 碰撞检测与解析
│   ├── EnemySpawner.ts      # 敌人生成管理
│   ├── Effects.ts           # 特效（爆炸、粒子、震动、环境）
│   └── BuildMode.ts         # 建造系统
└── rendering/
    └── PixelSprites.ts      # 像素精灵绘制
```

## 开发说明

本项目由 AI 辅助编写：

- 模型：Claude Opus 4.6 (`claude-opus-4-6`)
- 指令发起人：cooper
- 项目标识：`vibe_coding_playground:tank_war`
