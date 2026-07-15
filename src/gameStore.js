import { create } from 'zustand';

// Grid size settings
export const GRID_CELL_SIZE = 2;
export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 10;

// Waypoints for enemies to walk along (S-Curve path)
export const WAYPOINTS = [
  { x: -11, y: 0.25, z: 3 },
  { x: -3,  y: 0.25, z: 3 },
  { x: -3,  y: 0.25, z: -5 },
  { x: 3,   y: 0.25, z: -5 },
  { x: 3,   y: 0.25, z: 5 },
  { x: 11,  y: 0.25, z: 5 }
];

// Helper: Check if a grid cell overlaps with the path
export const isCellOnPath = (x, z) => {
  // Convert position to grid indices
  // We check proximity to the segment lines connecting WAYPOINTS
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const p1 = WAYPOINTS[i];
    const p2 = WAYPOINTS[i + 1];
    
    // Check horizontal segment
    if (Math.abs(p1.z - p2.z) < 0.1) {
      const minX = Math.min(p1.x, p2.x) - GRID_CELL_SIZE / 2;
      const maxX = Math.max(p1.x, p2.x) + GRID_CELL_SIZE / 2;
      if (z === p1.z && x >= minX && x <= maxX) return true;
    }
    // Check vertical segment
    if (Math.abs(p1.x - p2.x) < 0.1) {
      const minZ = Math.min(p1.z, p2.z) - GRID_CELL_SIZE / 2;
      const maxZ = Math.max(p1.z, p2.z) + GRID_CELL_SIZE / 2;
      if (x === p1.x && z >= minZ && z <= maxZ) return true;
    }
  }
  return false;
};

// Tower Type Definitions
export const TOWER_TYPES = {
  laser: {
    name: 'Laser Turret',
    cost: 100,
    range: 6.0,
    damage: 15,
    fireRate: 4.0, // Bullets per sec
    attackStyle: 'rapid',
    color: '#00f2fe',
    description: 'Rapidly fires plasma bolts at a single target.'
  },
  cannon: {
    name: 'Gravity Cannon',
    cost: 180,
    range: 8.0,
    damage: 60,
    fireRate: 0.8, // Low rate
    attackStyle: 'splash',
    color: '#ff007f',
    description: 'Launches energy orbs that damage enemies in an area.'
  },
  tesla: {
    name: 'Tesla Coil',
    cost: 250,
    range: 5.0,
    damage: 35,
    fireRate: 2.0,
    attackStyle: 'beam',
    color: '#9d4edd',
    description: 'Strikes nearby enemies with a powerful energy beam.'
  }
};

export const ENEMY_TYPES = {
  normal: {
    name: 'Scout',
    baseHp: 120,
    speed: 2.0,
    baseReward: 25,
    size: 0.9,
    color: '#94a3b8'
  },
  fast: {
    name: 'Runner',
    baseHp: 70,
    speed: 3.5,
    baseReward: 35,
    size: 0.7,
    color: '#39ff14'
  },
  boss: {
    name: 'Overlord',
    baseHp: 500,
    speed: 1.2,
    baseReward: 150,
    size: 1.2,
    color: '#ffd000'
  }
};

// Enemy Level Up Wave Multiplier
const getEnemyStatsForWave = (wave, type) => {
  const typeData = ENEMY_TYPES[type] ?? ENEMY_TYPES.normal;
  const hpMultiplier = Math.pow(1.3, wave - 1);
  const rewardMultiplier = Math.pow(1.1, wave - 1);
  const hp = Math.round(typeData.baseHp * hpMultiplier);

  return {
    hp,
    maxHp: hp,
    speed: typeData.speed,
    reward: Math.round(typeData.baseReward * rewardMultiplier),
    size: typeData.size,
    color: typeData.color
  };
};

export const useGameStore = create((set, get) => ({
  // Game state variables
  gold: 400,
  lives: 20,
  wave: 0,
  waveActive: false,
  gameStatus: 'menu', // menu | playing | gameover | victory
  
  towers: [],
  enemies: [],
  selectedTowerToBuild: null, // 'laser' | 'cannon' | 'tesla' | null
  selectedPlacedTowerId: null, // ID of placed tower for info panel
  
  performanceMode: 'high', // high | low (automatically determined by fps monitoring)
  
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  
  startGame: () => set({ gameStatus: 'playing', gold: 400, lives: 20, wave: 0, towers: [], enemies: [], waveActive: false, selectedPlacedTowerId: null }),
  
  resetGame: () => set({ gameStatus: 'menu', gold: 400, lives: 20, wave: 0, towers: [], enemies: [], waveActive: false, selectedPlacedTowerId: null }),

  selectTowerToBuild: (type) => set({ 
    selectedTowerToBuild: type,
    selectedPlacedTowerId: null // deselect selected tower
  }),
  
  selectPlacedTower: (id) => set({ 
    selectedPlacedTowerId: id,
    selectedTowerToBuild: null // cancel placement mode
  }),
  
  placeTower: (x, z, type) => {
    const cost = TOWER_TYPES[type].cost;
    const currentGold = get().gold;
    
    if (currentGold < cost) return false;
    
    // Check if cell already occupied or on path
    const alreadyOccupied = get().towers.some(t => t.x === x && t.z === z);
    if (alreadyOccupied || isCellOnPath(x, z)) return false;
    
    const newTower = {
      id: `tower_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x,
      z,
      type,
      level: 1,
      range: TOWER_TYPES[type].range,
      damage: TOWER_TYPES[type].damage,
      fireRate: TOWER_TYPES[type].fireRate,
      lastFired: 0
    };
    
    set((state) => ({
      gold: state.gold - cost,
      towers: [...state.towers, newTower],
      selectedTowerToBuild: null
    }));
    return true;
  },
  
  upgradeTower: (id) => {
    const tower = get().towers.find(t => t.id === id);
    if (!tower || tower.level >= 3) return;
    
    const cost = Math.round(TOWER_TYPES[tower.type].cost * 0.7 * tower.level);
    const currentGold = get().gold;
    
    if (currentGold < cost) return;
    
    set((state) => ({
      gold: state.gold - cost,
      towers: state.towers.map(t => {
        if (t.id === id) {
          const nextLevel = t.level + 1;
          return {
            ...t,
            level: nextLevel,
            range: TOWER_TYPES[t.type].range * (1 + (nextLevel - 1) * 0.25),
            damage: TOWER_TYPES[t.type].damage * (1 + (nextLevel - 1) * 0.4),
            fireRate: TOWER_TYPES[t.type].fireRate * (1 + (nextLevel - 1) * 0.1)
          };
        }
        return t;
      })
    }));
  },
  
  sellTower: (id) => {
    const tower = get().towers.find(t => t.id === id);
    if (!tower) return;
    
    // Calculate total invest gold
    let invested = TOWER_TYPES[tower.type].cost;
    for (let l = 1; l < tower.level; l++) {
      invested += Math.round(TOWER_TYPES[tower.type].cost * 0.7 * l);
    }
    const refund = Math.round(invested * 0.75);
    
    set((state) => ({
      gold: state.gold + refund,
      towers: state.towers.filter(t => t.id !== id),
      selectedPlacedTowerId: null
    }));
  },
  
  startWave: () => {
    if (get().waveActive) return;
    
    const nextWave = get().wave + 1;
    
    // Check for Victory (let's say 10 waves total)
    if (nextWave > 10) {
      set({ gameStatus: 'victory' });
      return;
    }
    
    // Create wave composition
    const enemyList = [];
    
    // Normal, Fast, and Boss compositions
    let normalCount = 5 + nextWave * 2;
    let fastCount = nextWave >= 3 ? 3 + nextWave : 0;
    let bossCount = nextWave % 5 === 0 ? nextWave / 5 : 0;
    
    let totalEnemies = normalCount + fastCount + bossCount;
    
    // Spawn sequence builder
    let idCounter = 0;
    
    // Interleave types for interesting flow
    while (normalCount > 0 || fastCount > 0 || bossCount > 0) {
      if (bossCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'boss',
          spawnDelay: idCounter * 2.0, // spawn slowly
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'boss')
        });
        bossCount--;
      }
      
      if (normalCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'normal',
          spawnDelay: idCounter * 1.5,
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'normal')
        });
        normalCount--;
      }
      
      if (fastCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'fast',
          spawnDelay: idCounter * 1.0, // spawn rapidly
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'fast')
        });
        fastCount--;
      }
    }
    
    set({
      wave: nextWave,
      waveActive: true,
      enemies: enemyList
    });
  },
  
  damageEnemy: (id, amount) => {
    set((state) => {
      let earnedGold = 0;
      const updatedEnemies = state.enemies.map(e => {
        if (e.id === id && !e.dead) {
          const newHp = Math.max(0, e.hp - amount);
          const isDead = newHp <= 0;
          if (isDead) earnedGold += e.reward;
          return { ...e, hp: newHp, dead: isDead };
        }
        return e;
      });
      
      // Check if wave finished
      const activeCount = updatedEnemies.filter(e => !e.dead && !e.reachedEnd).length;
      const isWaveDone = activeCount === 0;
      
      return {
        enemies: updatedEnemies,
        gold: state.gold + earnedGold,
        waveActive: !isWaveDone
      };
    });
  },
  
  leakEnemy: (id) => {
    set((state) => {
      const targetEnemy = state.enemies.find(e => e.id === id);
      if (!targetEnemy || targetEnemy.reachedEnd || targetEnemy.dead) return {};
      
      const newLives = Math.max(0, state.lives - (targetEnemy.type === 'boss' ? 5 : 1));
      const isGameOver = newLives <= 0;
      
      const updatedEnemies = state.enemies.map(e => {
        if (e.id === id) {
          return { ...e, reachedEnd: true };
        }
        return e;
      });
      
      const activeCount = updatedEnemies.filter(e => !e.dead && !e.reachedEnd).length;
      const isWaveDone = activeCount === 0;
      
      return {
        lives: newLives,
        gameStatus: isGameOver ? 'gameover' : state.gameStatus,
        enemies: updatedEnemies,
        waveActive: !isGameOver && !isWaveDone
      };
    });
  }
}));
