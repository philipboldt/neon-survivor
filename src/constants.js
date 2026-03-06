export const CONSTANTS = {
    PLAYER: {
        RADIUS: 20,
        SPEED: 5,
        RANGE: 250,
        COLLECT_RANGE: 125,
        COLOR: '#00d2ff',
        WEAPON_COOLDOWN: 1000,
        MAX_HEALTH: 15,
        HEALTH_BAR: {
            WIDTH: 300,
            HEIGHT: 20,
            COLOR: '#39ff14', // Neon Green
            BG_COLOR: '#222'
        },
        EXP_BAR: {
            WIDTH: 300,
            HEIGHT: 15,
            COLOR: '#00d2ff', // Neon Blue
            BG_COLOR: '#222'
        },
        UPGRADES: {
            WIDTH: 400,
            HEIGHT: 300,
            COLOR: '#00d2ff'
        }
    },
    ENEMY: {
        MAX_SPEED: 2.2,
        MIN_SPEED: 0.4,
        MAX_ACCEL_DIST: 500,
        SIZE: 15,
        COLOR: '#ff003c',
        SPAWN_INTERVAL: 500,
        DAMAGE: 1,
        ATTACK_COOLDOWN: 1000,
        SPAWN_MARGIN: 50
    },
    MINI_BOSS: {
        SIZE: 40,
        HEALTH: 10,
        DAMAGE: 3,
        COLOR: '#ff00ff', // Neon Purple/Magenta
        SPAWN_INTERVAL: 45000,
        EXP_VALUE: 10,
        NOTIFICATION_DURATION: 3000
    },
    BOX: {
        SIZE: 30,
        HEALTH: 3,
        COLOR: '#8B4513',
        GLOW: '#CD853F'
    },
    PROJECTILE: {
        SPEED: 7,
        SIZE: 4,
        COLOR: '#00d2ff',
        LIFE: 100
    },
    ORBITAL: {
        SIZE: 8,
        COLOR: '#00d2ff',
        ROTATION_SPEED: 0.03, // Radians per frame
        RANGE_FACTOR: 0.75, // 3/4 of player range
        DAMAGE: 1
    },
    EXPERIENCE: {
        SIZE: 3,
        COLOR: '#00d2ff',
        SPEED_MULTIPLIER: 1.5,
        HEAL_DROP_CHANCE: 0.05,
        DROP_SPREAD: 30
    },
    MAGNET: {
        SIZE: 5,
        COLOR: '#CD853F',
        GLOW: '#8B4513'
    },
    GOLD: {
        SIZE: 5,
        COLOR: '#FFD700',
        GLOW: '#FFFF00'
    },
    HEAL: {
        SIZE: 4,
        COLOR: '#39ff14' // Neon Green
    },
    WORLD: {
        STAR_COUNT: 800,
        WORLD_SIZE: 4000,
        VIEWPORT_SIZE: 1000,
        STAR_COLOR: '#666',
        STAR_TILE_SIZE: 2000,
        SPRITE_PADDING: 20, // Extra space for neon glow
        OBSTACLE_SIZE: 200,
        OBSTACLES: [
            { x: -1000, y: -1000 },
            { x: 1000, y: -1000 },
            { x: -1000, y: 1000 },
            { x: 1000, y: 1000 }
        ],
        GRID_CELL_SIZE: 100,
        BORDER_COLOR: '#333',
        BORDER_WIDTH: 5,
        OBSTACLE_COLOR: '#444',
        OBSTACLE_LINE_WIDTH: 2,
        LETTERBOX_COLOR: '#050505',
        BG_COLOR: '#000'
    },
    UI: {
        HIGH_SCORE_LIMIT: 3,
        DEFAULT_HIGH_SCORES: [
            { name: 'NEO', score: 100 },
            { name: 'TRN', score: 50 },
            { name: 'FLY', score: 25 }
        ],
        LS_KEY: 'neonSurvivorHighScores'
    }
};
