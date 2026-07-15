import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import SoundFeedback from './components/SoundFeedback';
import { DIFFICULTIES, useGameStore } from './gameStore';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Heart, Sparkles, Smile, Shield, Flame } from 'lucide-react';

function CelebrationEffects() {
  const lastWaveReward = useGameStore((state) => state.lastWaveReward);
  const gameStatus = useGameStore((state) => state.gameStatus);

  useEffect(() => {
    if (!lastWaveReward) return;
    confetti({
      particleCount: 70,
      spread: 65,
      startVelocity: 28,
      origin: { y: 0.72 },
      colors: ['#f97316', '#45b649', '#7bdff2', '#ffd166', '#ff7bac']
    });
  }, [lastWaveReward]);

  useEffect(() => {
    if (gameStatus !== 'victory') return;
    confetti({ particleCount: 130, spread: 100, origin: { x: 0.25, y: 0.65 } });
    confetti({ particleCount: 130, spread: 100, origin: { x: 0.75, y: 0.65 } });
  }, [gameStatus]);

  return null;
}

export default function App() {
  const { gameStatus, startGame, resetGame, wave, performanceMode, difficulty, setDifficulty } = useGameStore();
  const difficultyIcons = { easy: Smile, normal: Shield, challenge: Flame };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 3D Game Canvas */}
      {gameStatus !== 'menu' && <GameCanvas />}

      {/* In-Game HUD overlay */}
      {gameStatus === 'playing' && <GameHUD />}

      <SoundFeedback />
      <CelebrationEffects />

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
            <div className="menu-icon" aria-hidden="true">
              <Heart size={34} fill="currentColor" />
            </div>
            <h1 className="brand-title">TOOTH GUARDIANS</h1>
            <p className="brand-subtitle">Healthy Food Tower Defense</p>
            
            <p className="modal-desc">
              Team up with healthy foods and protect the friendly tooth<br />
              from chocolate, candy, and jelly snacks!
            </p>

            <div className="menu-team-preview" aria-label="Healthy defenders versus sweet snacks">
              <span className="team-chip defenders">Carrot · Broccoli · Milk</span>
              <span className="team-versus">VS</span>
              <span className="team-chip snacks">Chocolate · Candy · Jelly</span>
            </div>
            
            <fieldset className="difficulty-picker">
              <legend>Choose Your Patrol</legend>
              <div className="difficulty-options">
                {Object.entries(DIFFICULTIES).map(([key, option]) => {
                  const DifficultyIcon = difficultyIcons[key];
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`difficulty-option ${difficulty === key ? 'selected' : ''}`}
                      onClick={() => setDifficulty(key)}
                      aria-pressed={difficulty === key}
                    >
                      <DifficultyIcon size={21} />
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button className="control-btn interactive" onClick={startGame}>
              <Play size={20} fill="#fff" />
              Start {DIFFICULTIES[difficulty].label} Patrol
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN OVERLAY */}
      {gameStatus === 'gameover' && (
        <div className="screen-overlay">
          <div className="glass-panel modal-card">
            <h1 className="modal-title" style={{ color: 'var(--berry)' }}>THE TOOTH NEEDS HELP</h1>
            <p className="modal-desc">
              The snacks slipped through this time, but every great guardian learns!<br />
              You protected the tooth through <strong>Wave {wave}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" onClick={startGame}>
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
            <div className="menu-icon victory-icon" aria-hidden="true"><Sparkles size={34} /></div>
            <h1 className="modal-title" style={{ color: 'var(--leaf-green)' }}>BRIGHT SMILE SAVED!</h1>
            <p className="modal-desc">
              Amazing teamwork! The friendly tooth is healthy,<br />
              happy, and safe from every sweet snack.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" onClick={resetGame}>
                <ShieldCheck size={18} />
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
