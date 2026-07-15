import React from 'react';
import { useGameStore, TOWER_TYPES } from '../gameStore';
import { Coins, Heart, Swords, Shield, Zap, Sparkles, ArrowUpCircle, Trash2 } from 'lucide-react';

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
      case 'laser': return <Zap size={size} color="var(--neon-cyan)" />;
      case 'cannon': return <Swords size={size} color="var(--neon-magenta)" />;
      case 'tesla': return <Sparkles size={size} color="var(--neon-purple)" />;
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
              <span className="stat-label">골드 크레딧</span>
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
              <span className="stat-label">포탈 배리어</span>
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
            {waveActive ? '웨이브 방어 중...' : '다음 웨이브 시작'}
          </button>
        </div>
      </div>

      {/* 2. TOWERS SHOP & HELP INSTRUCTIONS (BOTTOM BAR) */}
      <div className="hud-bottom-bar">
        {/* Helper instruction tooltip for kids */}
        {!selectedTowerToBuild && towers.length === 0 && (
          <div className="tutorial-tooltip font-cyber glow-cyan">
            👈 터렛을 골라 그리드 판에 설치해 보세요!
          </div>
        )}
        
        {selectedTowerToBuild && (
          <div className="tutorial-tooltip font-cyber" style={{ borderStyle: 'solid', color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
            격자판(그리드)의 빈 바닥을 클릭하여 터렛을 배치하세요!
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
              <span>레벨 등급</span>
              <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>Lv. {selectedPlacedTower.level} / 3</span>
            </div>
            <div className="stat-row">
              <span>사정거리</span>
              <span>{selectedPlacedTower.range.toFixed(1)}m</span>
            </div>
            <div className="stat-row">
              <span>공격력</span>
              <span>{Math.round(selectedPlacedTower.damage)} pt</span>
            </div>
            <div className="stat-row">
              <span>발사 속도</span>
              <span>{selectedPlacedTower.fireRate.toFixed(1)}/초</span>
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
                    강화 ({upgradeCost}G)
                  </button>
                );
              })()
            ) : (
              <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--neon-green)' }}>
                최고 등급
              </button>
            )}

            {/* Sell Button */}
            <button 
              className="btn-secondary sell"
              onClick={() => sellTower(selectedPlacedTower.id)}
            >
              <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              환급
            </button>
          </div>
          
          {/* Close Panel Button */}
          <button 
            className="btn-secondary" 
            style={{ padding: '6px', fontSize: '0.75rem', marginTop: '4px' }}
            onClick={() => selectPlacedTower(null)}
          >
            창 닫기
          </button>
        </div>
      )}
    </div>
  );
}
