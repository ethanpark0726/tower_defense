import React, { useEffect, useMemo, useState } from 'react';
import { DIFFICULTIES, ENEMY_TYPES, getBoardRouteWave, getMapThemeForWave, getWaveComposition, TOTAL_WAVES, TOWER_TYPES, useGameStore } from '../gameStore';
import { activeEnemiesPositions } from '../activeEnemyRegistry';
import { Coins, Heart, Swords, Carrot, Sprout, Milk, ArrowUpCircle, Trash2, Volume2, VolumeX, Star, Sparkles, Cookie, Candy, Crown, Map } from 'lucide-react';

export default function GameHUD() {
  const {
    gold,
    lives,
    wave,
    waveActive,
    difficulty,
    startWave,
    soundEnabled,
    toggleSound,
    lastWaveReward,
    brushBlastUsed,
    brushBlastEvent,
    useBrushBlast,
    selectedTowerToBuild,
    selectTowerToBuild,
    towers,
    selectedPlacedTowerId,
    selectPlacedTower,
    upgradeTower,
    sellTower
  } = useGameStore();

  const selectedPlacedTower = towers.find(t => t.id === selectedPlacedTowerId);
  const nextWaveComposition = useMemo(() => getWaveComposition(wave + 1), [wave]);
  const routeWave = getBoardRouteWave(wave, waveActive);
  const mapTheme = getMapThemeForWave(routeWave);
  const [visibleReward, setVisibleReward] = useState(null);
  const [visibleBrushBlast, setVisibleBrushBlast] = useState(null);

  useEffect(() => {
    if (!lastWaveReward) return undefined;
    setVisibleReward(lastWaveReward);
    const timeout = window.setTimeout(() => setVisibleReward(null), 8000);
    return () => window.clearTimeout(timeout);
  }, [lastWaveReward]);

  useEffect(() => {
    if (!brushBlastEvent) return undefined;
    setVisibleBrushBlast(brushBlastEvent);
    const timeout = window.setTimeout(() => setVisibleBrushBlast(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [brushBlastEvent]);

  const tutorial = useMemo(() => {
    if (wave > 1) return null;
    if (towers.length === 0 && !selectedTowerToBuild) {
      return { step: 1, text: 'Pick a healthy food from the defender tray.' };
    }
    if (selectedTowerToBuild) {
      return { step: 2, text: 'Place your defender on an empty tongue tile.' };
    }
    if (wave === 0 && !waveActive) {
      return { step: 3, text: 'Your team is ready! Start the first snack wave.' };
    }
    if (wave === 1 && waveActive) {
      return { step: 4, text: 'Great job! Your healthy defender attacks automatically.' };
    }
    return null;
  }, [selectedTowerToBuild, towers.length, wave, waveActive]);

  // Helper: Find icon for tower type
  const getTowerIcon = (type, size = 20) => {
    switch (type) {
      case 'laser': return <Carrot size={size} color={TOWER_TYPES.laser.color} />;
      case 'cannon': return <Sprout size={size} color={TOWER_TYPES.cannon.color} />;
      case 'tomato': return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', background: TOWER_TYPES.tomato.color, display: 'inline-block', boxShadow: 'inset -4px -4px 0 rgba(127,29,29,0.28)' }} />;
      case 'tesla': return <Milk size={size} color={TOWER_TYPES.tesla.color} />;
      default: return null;
    }
  };

  const handleBrushBlast = () => {
    useBrushBlast(Array.from(activeEnemiesPositions.values()).map((enemy) => ({
      id: enemy.id,
      position: enemy.position.toArray()
    })));
  };

  const previewTip = nextWaveComposition.boss > 0
    ? 'Jelly King alert! Upgrade your strongest defenders.'
    : nextWaveComposition.fast > 0
      ? 'Wrapped Candy moves fast. Carrot Shooters can help.'
      : 'Chocolate Blocks are coming. Build near the route.';

  return (
    <div className="hud-container">
      {/* 1. TOP STATS BAR */}
      <div className="hud-top-bar">
        <div className="stat-group">
          {/* Gold Stats */}
          <div className="glass-panel stat-card pulse-glow-cyan interactive">
            <div className="stat-icon"><Coins color="var(--neon-yellow)" fill="var(--neon-yellow)" /></div>
            <div className="stat-details">
              <span className="stat-label">Smile Coins</span>
              <span className="stat-value glow-yellow">{gold}</span>
            </div>
          </div>

          {/* Lives Stats */}
          <div className="glass-panel stat-card interactive" style={{ borderColor: lives <= 5 ? 'var(--neon-magenta)' : 'var(--panel-border)' }}>
            <div className="stat-icon">
              <Heart 
                color="var(--neon-magenta)" 
                fill="var(--neon-magenta)" 
                className={lives <= 5 ? 'glow-magenta' : ''} 
                style={{ animation: lives <= 5 ? 'bounce-up 1s infinite' : 'none' }}
              />
            </div>
            <div className="stat-details">
              <span className="stat-label">Tooth Health</span>
              <span className="stat-value" style={{ color: lives <= 5 ? 'var(--berry)' : '#fff' }}>{lives} HP</span>
            </div>
          </div>
        </div>

        {/* Wave Stats */}
        <div className="glass-panel wave-card interactive">
          <span className="wave-label">{DIFFICULTIES[difficulty].label} Patrol</span>
          <div className="wave-number">WAVE {routeWave} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {TOTAL_WAVES}</span></div>
          <div className="map-stage" style={{ color: mapTheme.marker }}>
            <Map size={14} />
            <span>{mapTheme.name}</span>
          </div>
        </div>

        {/* Next Wave Button */}
        <div className="hud-actions interactive">
          <button
            className={`sound-btn ${soundEnabled ? '' : 'muted'}`}
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute music and sounds' : 'Turn music and sounds on'}
            title={soundEnabled ? 'Mute music and sounds' : 'Turn music and sounds on'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            className="control-btn" 
            onClick={startWave} 
            disabled={waveActive}
            style={{ 
              opacity: waveActive ? 0.5 : 1,
              cursor: waveActive ? 'not-allowed' : 'pointer',
              background: waveActive ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
              border: waveActive ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: waveActive ? 'none' : 'var(--shadow-neon)'
            }}
          >
            <Swords size={18} />
            {waveActive ? 'Protecting Tooth...' : 'Start Snack Wave'}
          </button>
        </div>
      </div>

      {!waveActive && wave < TOTAL_WAVES && (
        <section
          className={`glass-panel wave-preview ${nextWaveComposition.boss > 0 ? 'boss-alert' : ''}`}
          aria-label={`Wave ${wave + 1} snack preview`}
        >
          <div className="wave-preview-heading">
            <div>
              <span>Up Next</span>
              <strong>Wave {wave + 1}</strong>
            </div>
            <span className="wave-preview-total">{nextWaveComposition.total} snacks</span>
          </div>
          <div className="wave-preview-list">
            <div className="wave-preview-enemy chocolate">
              <Cookie size={21} />
              <span>{ENEMY_TYPES.normal.name}</span>
              <strong>{nextWaveComposition.normal}</strong>
            </div>
            {nextWaveComposition.fast > 0 && (
              <div className="wave-preview-enemy candy">
                <Candy size={21} />
                <span>{ENEMY_TYPES.fast.name}</span>
                <strong>{nextWaveComposition.fast}</strong>
              </div>
            )}
            {nextWaveComposition.boss > 0 && (
              <div className="wave-preview-enemy jelly">
                <Crown size={21} />
                <span>{ENEMY_TYPES.boss.name}</span>
                <strong>{nextWaveComposition.boss}</strong>
              </div>
            )}
          </div>
          <p className="wave-preview-tip">{previewTip}</p>
        </section>
      )}

      {visibleReward && (
        <div className="reward-banner" role="status">
          <Star size={26} fill="currentColor" />
          <div>
            <strong>Wave {visibleReward.wave} cleared!</strong>
            <span>Teamwork bonus: +{visibleReward.bonus} Smile Coins</span>
          </div>
        </div>
      )}

      {visibleBrushBlast && (
        <div className={`brush-blast-overlay ${visibleBrushBlast.hitCount === 0 ? 'waiting' : ''}`} role="status">
          <div className="brush-blast-bubble bubble-one" />
          <div className="brush-blast-bubble bubble-two" />
          <div className="brush-blast-bubble bubble-three" />
          <div className="brush-blast-message">
            <Sparkles size={32} />
            <strong>{visibleBrushBlast.hitCount > 0 ? 'Brush Blast!' : 'Snacks are still coming!'}</strong>
            <span>
              {visibleBrushBlast.hitCount > 0
                ? `${visibleBrushBlast.hitCount} snacks scrubbed for ${visibleBrushBlast.totalDamage} damage.`
                : 'Try again when a snack appears on the route.'}
            </span>
          </div>
        </div>
      )}

      <div className="brush-power interactive">
        <button
          type="button"
          className={`brush-power-btn ${waveActive && !brushBlastUsed ? 'ready' : ''}`}
          onClick={handleBrushBlast}
          disabled={!waveActive || brushBlastUsed}
          aria-label={brushBlastUsed ? 'Brush Blast used this wave' : waveActive ? 'Use Brush Blast' : 'Brush Blast charges when a wave starts'}
          title="Scrub every snack currently visible on the route. Available once per wave."
        >
          <Sparkles size={24} />
          <span>
            <strong>{brushBlastUsed ? 'Brush Used' : 'Brush Blast'}</strong>
            <small>{brushBlastUsed ? 'Ready next wave' : waveActive ? 'Once this wave' : 'Charges with wave'}</small>
          </span>
        </button>
      </div>

      {/* 2. TOWERS SHOP & HELP INSTRUCTIONS (BOTTOM BAR) */}
      <div className="hud-bottom-bar">
        {/* Helper instruction tooltip for kids */}
        {tutorial && (
          <div className="tutorial-tooltip">
            <span className="tutorial-step">STEP {tutorial.step} OF 4</span>
            <span>{tutorial.text}</span>
          </div>
        )}

        <div className="glass-panel tower-shop interactive">
          {Object.entries(TOWER_TYPES).map(([type, data]) => {
            const isAffordable = gold >= data.cost;
            const isSelected = selectedTowerToBuild === type;
            
            return (
              <button
                type="button"
                key={type}
                className={`tower-item ${isSelected ? 'selected' : ''} ${!isAffordable ? 'disabled' : ''}`}
                onClick={() => isAffordable && selectTowerToBuild(isSelected ? null : type)}
                title={data.description}
                aria-pressed={isSelected}
                disabled={!isAffordable}
              >
                <div style={{ marginTop: '4px' }}>
                  {getTowerIcon(type, 24)}
                </div>
                <span className="tower-name">{data.name}</span>
                <span className="tower-cost">{data.cost}G</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TOWER UPGRADE & INFO SIDEBAR (RIGHT SIDE) */}
      {selectedPlacedTower && (
        <div className="glass-panel hud-sidebar interactive">
          <div className="sidebar-title font-display" style={{ color: TOWER_TYPES[selectedPlacedTower.type].color }}>
            {TOWER_TYPES[selectedPlacedTower.type].name}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
            <div className="stat-row">
              <span>Level</span>
              <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>Lv. {selectedPlacedTower.level} / 3</span>
            </div>
            <div className="stat-row">
              <span>Range</span>
              <span>{selectedPlacedTower.range.toFixed(1)}m</span>
            </div>
            <div className="stat-row">
              <span>Damage</span>
              <span>{Math.round(selectedPlacedTower.damage)} pt</span>
            </div>
            <div className="stat-row">
              <span>Fire Rate</span>
              <span>{selectedPlacedTower.fireRate.toFixed(1)}/sec</span>
            </div>
          </div>

          <div className="action-btn-group">
            {/* Upgrade Button */}
            {selectedPlacedTower.level < 3 ? (
              (() => {
                const upgradeCost = Math.round(TOWER_TYPES[selectedPlacedTower.type].cost * 0.7 * selectedPlacedTower.level);
                const canUpgrade = gold >= upgradeCost;
                return (
                  <button 
                    className="btn-secondary upgrade"
                    onClick={() => upgradeTower(selectedPlacedTower.id)}
                    disabled={!canUpgrade}
                    style={{ opacity: canUpgrade ? 1 : 0.5, cursor: canUpgrade ? 'pointer' : 'not-allowed' }}
                  >
                    <ArrowUpCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Upgrade ({upgradeCost}G)
                  </button>
                );
              })()
            ) : (
              <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--neon-green)' }}>
                Max Level
              </button>
            )}

            {/* Sell Button */}
            <button 
              className="btn-secondary sell"
              onClick={() => sellTower(selectedPlacedTower.id)}
            >
              <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Sell
            </button>
          </div>
          
          {/* Close Panel Button */}
          <button 
            className="btn-secondary" 
            style={{ padding: '6px', fontSize: '0.75rem', marginTop: '4px' }}
            onClick={() => selectPlacedTower(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
