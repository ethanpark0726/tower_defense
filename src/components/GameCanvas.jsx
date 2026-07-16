import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, SMAA } from '@react-three/postprocessing';
import GameBoard from './GameBoard';
import EnemyManager from './EnemyManager';
import TowerManager from './TowerManager';
import ProjectileSystem from './ProjectileSystem';
import ParticleSystem, { triggerExplosion } from './ParticleSystem';
import { useGameStore } from '../gameStore';

function BrushBlastParticles() {
  const brushBlastEvent = useGameStore((state) => state.brushBlastEvent);

  useEffect(() => {
    if (!brushBlastEvent || brushBlastEvent.hitCount === 0 || !triggerExplosion) return;
    brushBlastEvent.targetPositions.forEach((position) => {
      triggerExplosion(new THREE.Vector3(...position), 'brush', 1);
    });
  }, [brushBlastEvent]);

  return null;
}

// Dynamic Performance Controller component
function PerformanceMonitor() {
  const setPerformanceMode = useGameStore(state => state.setPerformanceMode);
  const performanceMode = useGameStore(state => state.performanceMode);
  const { gl } = useThree();
  const lastTime = useRef(performance.now());
  const frameCount = useRef(0);
  const lowFpsTicks = useRef(0);

  useFrame(() => {
    const time = performance.now();
    frameCount.current++;
    
    // Check every second
    if (time >= lastTime.current + 1000) {
      const fps = (frameCount.current * 1000) / (time - lastTime.current);
      frameCount.current = 0;
      lastTime.current = time;

      if (fps < 45) {
        lowFpsTicks.current++;
        // If FPS is low for 4 consecutive seconds, downsample
        if (lowFpsTicks.current >= 4 && performanceMode === 'high') {
          setPerformanceMode('low');
          gl.setPixelRatio(1); // Set to normal instead of retina
        }
      } else {
        lowFpsTicks.current = Math.max(0, lowFpsTicks.current - 1);
      }
    }
  });

  return null;
}

export default function GameCanvas() {
  const performanceMode = useGameStore(state => state.performanceMode);

  return (
    <Canvas
      shadows={performanceMode === 'high'}
      camera={{ position: [0, 15, 17], fov: 45 }}
      dpr={performanceMode === 'high' ? [1, 2] : 1}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#ffd8d2'
      }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={['#ffd8d2']} />
      <fog attach="fog" args={['#ffd8d2', 30, 52]} />

      {/* Lights & Ambient Global Illumination */}
      <ambientLight intensity={performanceMode === 'high' ? 0.68 : 0.82} />
      
      <directionalLight
        castShadow={performanceMode === 'high'}
        position={[8, 18, 5]}
        intensity={1.25}
        shadow-mapSize-width={performanceMode === 'high' ? 2048 : 512}
        shadow-mapSize-height={performanceMode === 'high' ? 2048 : 512}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />
      
      <pointLight position={[-8, 5, -8]} intensity={0.65} color="#ffd166" />
      <pointLight position={[8, 5, 8]} intensity={0.65} color="#ff8fab" />

      {/* Orbit Controls with limited tilt angles (child friendly navigation) */}
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.3} // limit viewing below floor level
        minPolarAngle={Math.PI / 6}
        maxDistance={25}
        minDistance={8}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Main Game Elements */}
      <GameBoard />
      <EnemyManager />
      <TowerManager />
      <ProjectileSystem />
      <ParticleSystem />
      <BrushBlastParticles />

      {/* Dynamic FPS optimizer */}
      <PerformanceMonitor />

      {/* High-fidelity Post-Processing Composer */}
      <EffectComposer
        key={performanceMode}
        enableNormalPass={performanceMode === 'high'}
        multisampling={performanceMode === 'high' ? 8 : 0}
      >
        {performanceMode === 'high' && (
          <SSAO
            intensity={1.1}
            radius={0.8}
            luminanceInfluence={0.5}
            color="#587589"
          />
        )}
        <Bloom
          intensity={performanceMode === 'high' ? 0.75 : 0.45}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        {performanceMode === 'high' && <SMAA />}
      </EffectComposer>
    </Canvas>
  );
}
