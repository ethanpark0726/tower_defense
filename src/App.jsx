import React from 'react';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import { useGameStore } from './gameStore';
import { Play, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const { gameStatus, startGame, resetGame, lives, gold, wave, waveActive, startWave, performanceMode } = useGameStore();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 3D Game Canvas */}
      {gameStatus !== 'menu' && <GameCanvas />}

      {/* In-Game HUD overlay */}
      {gameStatus === 'playing' && <GameHUD />}

      {/* Performance Warning Badge */}
      {performanceMode === 'low' && gameStatus === 'playing' && (
        <div className="perf-badge interactive">
          <AlertTriangle size={14} />
          Low-performance mode enabled
        </div>
      )}

      {/* MENU SCREEN OVERLAY */}
      {gameStatus === 'menu' && (
        <div className="screen-overlay">
          <div className="glass-panel modal-card start-menu">
            <h1 className="brand-title">CYBER DEFENSE</h1>
            <p className="brand-subtitle font-cyber">3D Hyper Tactical Tower Defense</p>
            
            <p className="modal-desc">
              A fast and approachable 3D tower defense game for young players!<br />
              Build turrets on the grid and protect the portal from incoming space monsters.
            </p>
            
            <button className="control-btn interactive" onClick={startGame}>
              <Play size={20} fill="#fff" />
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN OVERLAY */}
      {gameStatus === 'gameover' && (
        <div className="screen-overlay">
          <div className="glass-panel modal-card">
            <h1 className="modal-title glow-magenta" style={{ color: 'var(--neon-magenta)' }}>SYSTEM DEFEATED</h1>
            <p className="modal-desc">
              The energy barrier collapsed and the monsters reached the portal.<br />
              Final result: <strong>Wave {wave}</strong>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" style={{ background: 'linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))' }} onClick={startGame}>
                <RotateCcw size={18} />
                Try Again
              </button>
              <button className="btn-secondary interactive" onClick={resetGame}>
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY SCREEN OVERLAY */}
      {gameStatus === 'victory' && (
        <div className="screen-overlay">
          <div className="glass-panel modal-card">
            <h1 className="modal-title glow-green" style={{ color: 'var(--neon-green)' }}>VICTORY ACHIEVED</h1>
            <p className="modal-desc">
              Mission complete! The portal is secure<br />
              and every alien threat has been cleared.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" style={{ background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))' }} onClick={resetGame}>
                <ShieldCheck size={18} />
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
