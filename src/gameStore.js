import { create } from 'zustand';

// Grid size settings
export const GRID_CELL_SIZE = 2;
export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 10;
export const TOTAL_WAVES = 20;

export const MAP_THEMES = [
  {
    id: 'gum_garden',
    name: 'Gum Garden',
    shortName: 'Garden',
    description: 'A soft gumline with veggie patches for the first patrols.',
    background: '#ffd8d2',
    fog: '#ffd8d2',
    mouth: '#6f233d',
    tongue: '#d96b80',
    route: '#ffd6a5',
    routeBorder: '#fff9e8',
    routeGlow: '#ff9eb5',
    marker: '#ff5d8f',
    accent: '#7ac943',
    secondaryAccent: '#ffd166'
  },
  {
    id: 'calcium_cove',
    name: 'Calcium Cove',
    shortName: 'Cove',
    description: 'A bright milk-splash zone with cool calcium shine.',
    background: '#dff7ff',
    fog: '#f4fcff',
    mouth: '#653247',
    tongue: '#dd7891',
    route: '#c8f3ff',
    routeBorder: '#fffdf4',
    routeGlow: '#7bdff2',
    marker: '#2bbfd9',
    accent: '#7bdff2',
    secondaryAccent: '#ffffff'
  },
  {
    id: 'plaque_patrol',
    name: 'Plaque Patrol',
    shortName: 'Patrol',
    description: 'A tricky cleanup route with plaque spots to scrub away.',
    background: '#fff1c7',
    fog: '#fff8df',
    mouth: '#7a2a45',
    tongue: '#d7657a',
    route: '#ffe08a',
    routeBorder: '#fff7d6',
    routeGlow: '#fbbf24',
    marker: '#f97316',
    accent: '#a86cf3',
    secondaryAccent: '#45b649'
  }
];

export const getMapThemeForWave = (wave) => {
  const themeIndex = Math.max(0, wave - 1) % MAP_THEMES.length;
  return MAP_THEMES[themeIndex];
};

export const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    description: 'More coins and a sturdier tooth for new guardians.',
    startingGold: 500,
    startingLives: 25,
    enemyHp: 0.9,
    enemySpeed: 0.92,
    enemyReward: 1.1,
    spawnDelay: 1.08
  },
  normal: {
    label: 'Normal',
    description: 'A balanced patrol with quicker, tougher snacks.',
    startingGold: 375,
    startingLives: 20,
    enemyHp: 1.15,
    enemySpeed: 1.05,
    enemyReward: 0.95,
    spawnDelay: 0.9
  },
  challenge: {
    label: 'Challenge',
    description: 'Low supplies against a fast, powerful snack rush.',
    startingGold: 225,
    startingLives: 10,
    enemyHp: 1.85,
    enemySpeed: 1.35,
    enemyReward: 0.7,
    spawnDelay: 0.55
  }
};

// Route layouts for snacks to walk along. All routes share the candy gate and tooth goal.
export const ROUTE_LAYOUTS = [
  [
    { x: -11, y: 0.25, z: 3 },
    { x: -3, y: 0.25, z: 3 },
    { x: -3, y: 0.25, z: -5 },
    { x: 3, y: 0.25, z: -5 },
    { x: 3, y: 0.25, z: 5 },
    { x: 11, y: 0.25, z: 5 }
  ],
  [
    { x: -11, y: 0.25, z: 3 },
    { x: -7, y: 0.25, z: 3 },
    { x: -7, y: 0.25, z: -7 },
    { x: 1, y: 0.25, z: -7 },
    { x: 1, y: 0.25, z: 1 },
    { x: 7, y: 0.25, z: 1 },
    { x: 7, y: 0.25, z: 5 },
    { x: 11, y: 0.25, z: 5 }
  ]
];

export const getRouteForWave = (wave) => {
  return wave <= 10 ? ROUTE_LAYOUTS[0] : ROUTE_LAYOUTS[1];
};

export const WAYPOINTS = ROUTE_LAYOUTS[0];

export const getBoardRouteWave = (wave, waveActive) => (
  waveActive ? wave : Math.max(1, Math.min(wave + 1, TOTAL_WAVES))
);

// Helper: Check if a grid cell overlaps with the route for a wave.
export const isCellOnPath = (x, z, wave = 1) => {
  const route = getRouteForWave(wave);
  const blockRadius = GRID_CELL_SIZE * 0.45;

  for (let i = 0; i < route.length - 1; i++) {
    const start = route[i];
    const end = route[i + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const segmentLengthSquared = dx * dx + dz * dz;
    const ratio = segmentLengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - start.x) * dx + (z - start.z) * dz) / segmentLengthSquared));
    const closestX = start.x + dx * ratio;
    const closestZ = start.z + dz * ratio;

    if (Math.hypot(x - closestX, z - closestZ) <= blockRadius) return true;
  }

  return false;
};

// Tower Type Definitions
export const TOWER_TYPES = {
  laser: {
    name: 'Carrot Shooter',
    cost: 100,
    range: 6.0,
    damage: 15,
    fireRate: 4.0, // Bullets per sec
    attackStyle: 'rapid',
    color: '#f97316',
    description: 'Rapidly fires crunchy carrot shots at one snack.'
  },
  cannon: {
    name: 'Broccoli Bomber',
    cost: 180,
    range: 8.0,
    damage: 60,
    fireRate: 0.8, // Low rate
    attackStyle: 'splash',
    color: '#45b649',
    description: 'Launches broccoli bursts that splash nearby snacks.'
  },
  tomato: {
    name: 'Tomato Splash',
    cost: 150,
    range: 6.5,
    damage: 42,
    fireRate: 1.25,
    attackStyle: 'splash',
    color: '#ef4444',
    description: 'Splashes tomato bursts that hit clustered snacks.'
  },
  tesla: {
    name: 'Milk Beam',
    cost: 250,
    range: 5.0,
    damage: 35,
    fireRate: 2.0,
    attackStyle: 'beam',
    color: '#7bdff2',
    description: 'Sprays a calcium-rich milk beam at nearby snacks.'
  }
};

export const ENEMY_TYPES = {
  normal: {
    name: 'Chocolate Block',
    theme: 'chocolate',
    baseHp: 120,
    speed: 2.0,
    baseReward: 25,
    size: 0.9,
    color: '#70402b'
  },
  fast: {
    name: 'Wrapped Candy',
    theme: 'candy',
    baseHp: 70,
    speed: 3.5,
    baseReward: 35,
    size: 0.7,
    color: '#ff5d8f'
  },
  boss: {
    name: 'Jelly King',
    theme: 'jelly',
    baseHp: 500,
    speed: 1.2,
    baseReward: 150,
    size: 1.2,
    color: '#a86cf3'
  }
};

export const getWaveComposition = (wave) => {
  if (wave < 1 || wave > TOTAL_WAVES) {
    return { normal: 0, fast: 0, boss: 0, total: 0 };
  }

  const lateWave = Math.max(0, wave - 10);
  const normal = 5 + wave * 2 + lateWave;
  const fast = wave >= 3 ? 3 + wave + Math.floor(lateWave / 2) : 0;
  const boss = wave % 5 === 0 ? wave / 5 : wave >= 12 && wave % 4 === 0 ? 1 : 0;

  return { normal, fast, boss, total: normal + fast + boss };
};

// Enemy Level Up Wave Multiplier
export const getEnemyStatsForWave = (wave, type, difficulty = 'normal') => {
  const typeData = ENEMY_TYPES[type] ?? ENEMY_TYPES.normal;
  const difficultyData = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  const hpMultiplier = Math.pow(1.3, wave - 1);
  const rewardMultiplier = Math.pow(1.1, wave - 1);
  const hp = Math.round(typeData.baseHp * hpMultiplier * difficultyData.enemyHp);

  return {
    hp,
    maxHp: hp,
    speed: typeData.speed * difficultyData.enemySpeed,
    reward: Math.round(typeData.baseReward * rewardMultiplier * difficultyData.enemyReward),
    size: typeData.size,
    color: typeData.color,
    theme: typeData.theme
  };
};

let feedbackSequence = 0;
const createFeedbackEvent = (type) => ({ id: ++feedbackSequence, type });
const getWaveClearBonus = (wave, difficulty) => Math.round((50 + wave * 10) * DIFFICULTIES[difficulty].enemyReward);

export const useGameStore = create((set, get) => ({
  // Game state variables
  gold: DIFFICULTIES.normal.startingGold,
  lives: DIFFICULTIES.normal.startingLives,
  wave: 0,
  waveActive: false,
  gameStatus: 'menu', // menu | playing | gameover | victory
  difficulty: 'normal',
  soundEnabled: true,
  feedbackEvent: null,
  lastWaveReward: null,
  brushBlastUsed: false,
  brushBlastEvent: null,
  
  towers: [],
  enemies: [],
  selectedTowerToBuild: null, // 'laser' | 'cannon' | 'tesla' | null
  selectedPlacedTowerId: null, // ID of placed tower for info panel
  
  performanceMode: 'high', // high | low (automatically determined by fps monitoring)
  
  setPerformanceMode: (mode) => set({ performanceMode: mode }),

  toggleSound: () => set((state) => {
    const soundEnabled = !state.soundEnabled;
    return {
      soundEnabled,
      ...(soundEnabled && { feedbackEvent: createFeedbackEvent('soundOn') })
    };
  }),
  setDifficulty: (difficulty) => {
    if (DIFFICULTIES[difficulty]) set({ difficulty });
  },
  
  startGame: () => set((state) => ({
    gameStatus: 'playing',
    gold: DIFFICULTIES[state.difficulty].startingGold,
    lives: DIFFICULTIES[state.difficulty].startingLives,
    wave: 0,
    towers: [],
    enemies: [],
    waveActive: false,
    selectedTowerToBuild: null,
    selectedPlacedTowerId: null,
    lastWaveReward: null,
    brushBlastUsed: false,
    brushBlastEvent: null,
    feedbackEvent: createFeedbackEvent('startGame')
  })),
  
  resetGame: () => set({
    gameStatus: 'menu',
    gold: DIFFICULTIES.normal.startingGold,
    lives: DIFFICULTIES.normal.startingLives,
    wave: 0,
    towers: [],
    enemies: [],
    waveActive: false,
    selectedTowerToBuild: null,
    selectedPlacedTowerId: null,
    lastWaveReward: null,
    brushBlastUsed: false,
    brushBlastEvent: null
  }),

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
    const routeWave = getBoardRouteWave(get().wave, get().waveActive);
    if (alreadyOccupied || isCellOnPath(x, z, routeWave)) return false;
    
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
      selectedTowerToBuild: null,
      feedbackEvent: createFeedbackEvent('placeTower')
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
      feedbackEvent: createFeedbackEvent('upgradeTower'),
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
      selectedPlacedTowerId: null,
      feedbackEvent: createFeedbackEvent('sellTower')
    }));
  },
  
  startWave: () => {
    if (get().waveActive) return;
    
    const nextWave = get().wave + 1;
    const difficulty = get().difficulty;
    const difficultyData = DIFFICULTIES[difficulty];
    
    if (nextWave > TOTAL_WAVES) {
      set({ gameStatus: 'victory', feedbackEvent: createFeedbackEvent('victory') });
      return;
    }
    
    // Create wave composition
    const enemyList = [];
    
    const composition = getWaveComposition(nextWave);
    let normalCount = composition.normal;
    let fastCount = composition.fast;
    let bossCount = composition.boss;
    
    // Spawn sequence builder
    let idCounter = 0;
    
    // Interleave types for interesting flow
    while (normalCount > 0 || fastCount > 0 || bossCount > 0) {
      if (bossCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'boss',
          spawnDelay: idCounter * 2.0 * difficultyData.spawnDelay,
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'boss', difficulty)
        });
        bossCount--;
      }
      
      if (normalCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'normal',
          spawnDelay: idCounter * 1.5 * difficultyData.spawnDelay,
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'normal', difficulty)
        });
        normalCount--;
      }
      
      if (fastCount > 0) {
        enemyList.push({
          id: `enemy_${nextWave}_${idCounter++}`,
          type: 'fast',
          spawnDelay: idCounter * 1.0 * difficultyData.spawnDelay,
          progress: 0,
          dead: false,
          reachedEnd: false,
          ...getEnemyStatsForWave(nextWave, 'fast', difficulty)
        });
        fastCount--;
      }
    }
    
    set({
      wave: nextWave,
      waveActive: true,
      enemies: enemyList,
      lastWaveReward: null,
      brushBlastUsed: false,
      brushBlastEvent: null,
      feedbackEvent: createFeedbackEvent('startWave')
    });
  },

  useBrushBlast: (activeEnemies) => {
    set((state) => {
      if (!state.waveActive || state.brushBlastUsed) return {};

      const activeIdSet = new Set(activeEnemies.map((enemy) => enemy.id));
      const targetPositions = activeEnemies.map((enemy) => enemy.position);
      let hitCount = 0;
      let totalDamage = 0;
      let earnedGold = 0;

      const updatedEnemies = state.enemies.map((enemy) => {
        if (!activeIdSet.has(enemy.id) || enemy.dead || enemy.reachedEnd) return enemy;

        const damage = Math.max(35, Math.round(enemy.maxHp * 0.3));
        const newHp = Math.max(0, enemy.hp - damage);
        const isDead = newHp <= 0;
        hitCount++;
        totalDamage += Math.min(enemy.hp, damage);
        if (isDead) earnedGold += enemy.reward;
        return { ...enemy, hp: newHp, dead: isDead };
      });

      if (hitCount === 0) {
        const feedbackEvent = createFeedbackEvent('brushEmpty');
        return {
          feedbackEvent,
          brushBlastEvent: { id: feedbackEvent.id, hitCount: 0, totalDamage: 0, targetPositions: [] }
        };
      }

      const activeCount = updatedEnemies.filter((enemy) => !enemy.dead && !enemy.reachedEnd).length;
      const isWaveDone = activeCount === 0;
      const waveJustCompleted = state.waveActive && isWaveDone;
      const clearBonus = waveJustCompleted ? getWaveClearBonus(state.wave, state.difficulty) : 0;
      const feedbackEvent = createFeedbackEvent('brushBlast');

      return {
        enemies: updatedEnemies,
        gold: state.gold + earnedGold + clearBonus,
        waveActive: !isWaveDone,
        brushBlastUsed: true,
        brushBlastEvent: { id: feedbackEvent.id, hitCount, totalDamage, targetPositions },
        feedbackEvent,
        ...(waveJustCompleted && {
          lastWaveReward: { id: `${state.wave}-${Date.now()}`, wave: state.wave, bonus: clearBonus }
        })
      };
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
      const waveJustCompleted = state.waveActive && isWaveDone;
      const clearBonus = waveJustCompleted ? getWaveClearBonus(state.wave, state.difficulty) : 0;
      const feedbackType = waveJustCompleted
        ? 'waveComplete'
        : earnedGold > 0
          ? 'enemyDefeated'
          : null;
      
      return {
        enemies: updatedEnemies,
        gold: state.gold + earnedGold + clearBonus,
        waveActive: !isWaveDone,
        ...(waveJustCompleted && {
          lastWaveReward: { id: `${state.wave}-${Date.now()}`, wave: state.wave, bonus: clearBonus }
        }),
        ...(feedbackType && { feedbackEvent: createFeedbackEvent(feedbackType) })
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
      const waveJustCompleted = !isGameOver && state.waveActive && isWaveDone;
      const clearBonus = waveJustCompleted ? getWaveClearBonus(state.wave, state.difficulty) : 0;
      const feedbackType = isGameOver ? 'gameOver' : waveJustCompleted ? 'waveComplete' : 'toothHit';
      
      return {
        lives: newLives,
        gameStatus: isGameOver ? 'gameover' : state.gameStatus,
        enemies: updatedEnemies,
        waveActive: !isGameOver && !isWaveDone,
        gold: state.gold + clearBonus,
        feedbackEvent: createFeedbackEvent(feedbackType),
        ...(waveJustCompleted && {
          lastWaveReward: { id: `${state.wave}-${Date.now()}`, wave: state.wave, bonus: clearBonus }
        })
      };
    });
  }
}));
