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
          저사양 최적화 모드 작동 중
        </div>
      )}

      {/* MENU SCREEN OVERLAY */}
      {gameStatus === 'menu' && (
        <div className="screen-overlay">
          <div className="glass-panel modal-card start-menu">
            <h1 className="brand-title">CYBER DEFENSE</h1>
            <p className="brand-subtitle font-cyber">3D Hyper Tactical Tower Defense</p>
            
            <p className="modal-desc">
              8~10세 어린이를 위한 직관적이고 다이내믹한 3D 우주 방어 게임!<br />
              그리드에 방어 터렛을 배치하여 쏟아져 들어오는 우주 몬스터들로부터 포탈을 지켜내세요.
            </p>
            
            <button className="control-btn interactive" onClick={startGame}>
              <Play size={20} fill="#fff" />
              게임 시작
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
              에너지 배리어가 무너졌습니다! 몬스터들이 그리드를 점령했습니다.<br />
              마지막 기록: <strong>Wave {wave}</strong>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" style={{ background: 'linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))' }} onClick={startGame}>
                <RotateCcw size={18} />
                재도전
              </button>
              <button className="btn-secondary interactive" onClick={resetGame}>
                메인 메뉴
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
              임무 완수! 포탈의 통제권을 완전히 되찾았으며,<br />
              모든 에일리언 위협이 제거되었습니다.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="control-btn interactive" style={{ background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))' }} onClick={resetGame}>
                <ShieldCheck size={18} />
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
