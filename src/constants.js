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
        ATTACK_COOLDOWN: 1000
    },
    PROJECTILE: {
        SPEED: 7,
        SIZE: 4,
        COLOR: '#00d2ff',
        LIFE: 100
    },
    EXPERIENCE: {
        SIZE: 3,
        COLOR: '#00d2ff',
        SPEED_MULTIPLIER: 1.5,
        HEAL_DROP_CHANCE: 0.05
    },
    HEAL: {
        SIZE: 4,
        COLOR: '#39ff14' // Neon Green
    },
    WORLD: {
        STAR_COUNT: 200,
        WORLD_SIZE: 2000,
        STAR_COLOR: '#666'
    }
};
