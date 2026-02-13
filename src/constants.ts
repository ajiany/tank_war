// Game dimensions
export const TILE_SIZE = 32;
export const HALF_TILE = 16;
export const GRID_COLS = 13;
export const GRID_ROWS = 13;
export const GAME_WIDTH = GRID_COLS * TILE_SIZE;  // 416
export const GAME_HEIGHT = GRID_ROWS * TILE_SIZE; // 416
export const SIDEBAR_WIDTH = 96;
export const CANVAS_WIDTH = GAME_WIDTH + SIDEBAR_WIDTH; // 512
export const CANVAS_HEIGHT = GAME_HEIGHT;

// Player
export const PLAYER_SPEED = 100;
export const PLAYER_SPAWN_X = 128;
export const PLAYER_SPAWN_Y = 352;
export const PLAYER_SHOOT_COOLDOWN = 0.4;
export const PLAYER_INVINCIBLE_TIME = 2;
export const PLAYER_LIVES = 3;

// Bullets
export const BULLET_SPEED = 300;
export const BULLET_SIZE = 6;

// Enemy types
export const ENEMY_TYPES = {
  normal: { speed: 80, color: '#888888', hp: 1, score: 100 },
  fast:   { speed: 130, color: '#dc143c', hp: 1, score: 200 },
  armor:  { speed: 60, color: '#c0c0c0', hp: 3, score: 300 },
} as const;

export type EnemyTypeName = keyof typeof ENEMY_TYPES;

// Spawning
export const SPAWN_POINTS_X = [32, 192, 352];
export const MAX_ENEMIES_ON_SCREEN = 4;
export const SPAWN_INTERVAL = 3;

// Effects
export const EXPLOSION_DURATION = 0.4;
export const PARTICLE_COUNT = 8;
export const SCREEN_SHAKE_DURATION = 0.15;
export const SCREEN_SHAKE_INTENSITY = 4;

// Power-ups
export const POWERUP_DURATION = 10;
export const POWERUP_SIZE = 28;
export const POWERUP_TYPES = ['star', 'bomb', 'shovel', 'tank'] as const;
export type PowerUpType = typeof POWERUP_TYPES[number];

// Building system
export const BUILD_INITIAL_POINTS = 10;
export const BUILD_MATERIALS = {
  1: { tile: 1 as const, name: 'BRICK', cost: 1, symbol: 'B' },
  2: { tile: 2 as const, name: 'STEEL', cost: 3, symbol: 'S' },
  3: { tile: 4 as const, name: 'RIVER', cost: 2, symbol: 'R' },
  4: { tile: 5 as const, name: 'TREE',  cost: 1, symbol: 'T' },
  5: { tile: 6 as const, name: 'ICE',   cost: 1, symbol: 'I' },
} as const;

export type BuildMaterialKey = keyof typeof BUILD_MATERIALS;

export const BUILD_KILL_REWARDS: Record<EnemyTypeName, number> = {
  normal: 1,
  fast: 2,
  armor: 3,
};

export const BUILD_RECYCLE_RATE = 0.5;

// Colors - Classic NES palette
export const COLORS = {
  bg: '#000000',
  gameBg: '#636363',
  sidebar: '#636363',
  playerTank: '#e7a510',
  playerTankDark: '#8c6b0a',
  enemyNormal: '#888888',
  enemyNormalDark: '#555555',
  enemyFast: '#dc143c',
  enemyFastDark: '#8b0a1e',
  enemyArmor: '#c0c0c0',
  enemyArmorDark: '#808080',
  brick: '#8b4513',
  brickLight: '#b5651d',
  steel: '#a0a0a0',
  steelLight: '#d0d0d0',
  steelDark: '#707070',
  base: '#e7a510',
  baseDark: '#8c6b0a',
  bullet: '#ffffff',
  text: '#ffffff',
  textGold: '#e7a510',
  hudBg: '#000000',
  explosion1: '#ff4500',
  explosion2: '#ffa500',
  explosion3: '#ffff00',
  explosion4: '#ffffff',
  shield: '#87ceeb',
  powerUp: '#ff6347',
} as const;

// Theme system
export interface ThemeColors {
  ground: string;
  groundDetail: string;
  brick: string;
  brickLight: string;
  steel: string;
  steelLight: string;
  river: string;
  riverLight: string;
  tree: string;
  treeDark: string;
  ice: string;
  iceLight: string;
  envParticle: string;
  envParticleType: 'none' | 'leaves' | 'snow' | 'dust';
}

export const THEMES: Record<string, ThemeColors> = {
  city: {
    ground: '#1a1a1a',
    groundDetail: '#222222',
    brick: '#8b4513',
    brickLight: '#b5651d',
    steel: '#a0a0a0',
    steelLight: '#d0d0d0',
    river: '#1a3a6a',
    riverLight: '#2a5a9a',
    tree: '#2d5a1e',
    treeDark: '#1a3a10',
    ice: '#a0d0e0',
    iceLight: '#c0e8f0',
    envParticle: '#888888',
    envParticleType: 'dust',
  },
  forest: {
    ground: '#1a2a10',
    groundDetail: '#223a15',
    brick: '#6b3a10',
    brickLight: '#8b5a20',
    steel: '#708070',
    steelLight: '#90a090',
    river: '#1a4a5a',
    riverLight: '#2a6a7a',
    tree: '#2d6a1e',
    treeDark: '#1a4a10',
    ice: '#90c0d0',
    iceLight: '#b0d8e0',
    envParticle: '#8b6a30',
    envParticleType: 'leaves',
  },
  snow: {
    ground: '#c0c8d0',
    groundDetail: '#b0b8c0',
    brick: '#7a6a5a',
    brickLight: '#9a8a7a',
    steel: '#8090a0',
    steelLight: '#a0b0c0',
    river: '#4a6a8a',
    riverLight: '#6a8aaa',
    tree: '#3a5a3a',
    treeDark: '#2a4a2a',
    ice: '#d0e8f8',
    iceLight: '#e8f4ff',
    envParticle: '#ffffff',
    envParticleType: 'snow',
  },
};
