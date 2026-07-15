import React from 'react';
import { useGameStore, TOWER_TYPES } from '../gameStore';
import { Coins, Heart, Swords, Carrot, Sprout, Milk, ArrowUpCircle, Trash2 } from 'lucide-react';

export default function GameHUD() {
  const {
    gold,
    lives,
    wave,
    waveActive,
    startWave,
    selectedTowerToBuild,
    selectTowerToBuild,
    towers,
    selectedPlacedTowerId,
    selectPlacedTower,
    upgradeTower,
    sellTower
  } = useGameStore();

  const selectedPlacedTower = towers.find(t => t.id === selectedPlacedTowerId);

  // Helper: Find icon for tower type
  const getTowerIcon = (type, size = 20) => {
    switch (type) {
      case 'laser': return <Carrot size={size} color={TOWER_TYPES.laser.color} />;
      case 'cannon': return <Sprout size={size} color={TOWER_TYPES.cannon.color} />;
      case 'tesla': return <Milk size={size} color={TOWER_TYPES.tesla.color} />;
      default: return null;
    }
  };

  return (
    <div className="hud-container">
      {/* 1. TOP STATS BAR */}
      <div className="hud-top-bar">
        <div className="stat-group">
          {/* Gold Stats */}
          <div className="glass-panel stat-card pulse-glow-cyan interactive">
            <div className="stat-icon"><Coins color="var(--neon-yellow)" fill="var(--neon-yellow)" /></div>
            <div className="stat-details">
              <span className="stat-label">Gold Credits</span>
              <span className="stat-value glow-yellow">{gold} G</span>
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
              <span className="stat-label">Portal Barrier</span>
              <span className="stat-value" style={{ color: lives <= 5 ? 'var(--neon-magenta)' : '#fff' }}>{lives} HP</span>
            </div>
          </div>
        </div>

        {/* Wave Stats */}
        <div className="glass-panel wave-card interactive">
          <span className="wave-label font-cyber">Current Threat</span>
          <div className="wave-number">WAVE {wave} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 10</span></div>
        </div>

        {/* Next Wave Button */}
        <div className="interactive">
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
            {waveActive ? 'Defending Wave...' : 'Start Next Wave'}
          </button>
        </div>
      </div>

      {/* 2. TOWERS SHOP & HELP INSTRUCTIONS (BOTTOM BAR) */}
      <div className="hud-bottom-bar">
        {/* Helper instruction tooltip for kids */}
        {!selectedTowerToBuild && towers.length === 0 && (
          <div className="tutorial-tooltip font-cyber glow-cyan">
            Choose a healthy defender and place it on the grid!
          </div>
        )}
        
        {selectedTowerToBuild && (
          <div className="tutorial-tooltip font-cyber" style={{ borderStyle: 'solid', color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
            Click an empty grid tile to place the healthy defender!
          </div>
        )}

        <div className="glass-panel tower-shop interactive">
          {Object.entries(TOWER_TYPES).map(([type, data]) => {
            const isAffordable = gold >= data.cost;
            const isSelected = selectedTowerToBuild === type;
            
            return (
              <div 
                key={type}
                className={`tower-item ${isSelected ? 'selected' : ''} ${!isAffordable ? 'disabled' : ''}`}
                onClick={() => isAffordable && selectTowerToBuild(isSelected ? null : type)}
                title={data.description}
              >
                <div style={{ marginTop: '4px' }}>
                  {getTowerIcon(type, 24)}
                </div>
                <span className="tower-name">{data.name}</span>
                <span className="tower-cost">{data.cost}G</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TOWER UPGRADE & INFO SIDEBAR (RIGHT SIDE) */}
      {selectedPlacedTower && (
        <div className="glass-panel hud-sidebar interactive">
          <div className="sidebar-title font-cyber" style={{ color: TOWER_TYPES[selectedPlacedTower.type].color }}>
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
