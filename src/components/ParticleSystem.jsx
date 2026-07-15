import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pre-allocated Particle Pool Configuration
const PARTICLE_POOL_SIZE = 600;
const particlePool = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
  active: false,
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  color: new THREE.Color(),
  life: 0,
  maxLife: 1.0,
  size: 0.15
}));

// Exported global callback to trigger an explosion at target coords
export let triggerExplosion = null;

export default function ParticleSystem() {
  const meshRef = useRef();

  useEffect(() => {
    // Register global trigger function
    triggerExplosion = (position, type, level) => {
      // Configure explosion settings based on impact type
      let numParticles = 12;
      let explosionSpeed = 3.5;
      let particleColors = ['#f97316', '#fbbf24', '#fff4d6']; // carrot default

      if (type === 'cannon') {
        numParticles = 25; // larger explosion
        explosionSpeed = 6.0;
        particleColors = ['#2f9e44', '#66bb45', '#d9f99d', '#fff4d6'];
      } else if (type === 'tesla') {
        numParticles = 16;
        explosionSpeed = 4.5;
        particleColors = ['#7bdff2', '#d7f3ff', '#ffffff'];
      } else if (type === 'chocolate') {
        numParticles = 20;
        explosionSpeed = 4.2;
        particleColors = ['#70402b', '#9a5d3d', '#d8a47f', '#fff4d6'];
      } else if (type === 'candy') {
        numParticles = 22;
        explosionSpeed = 5.0;
        particleColors = ['#ff5d8f', '#ffd166', '#7bdff2', '#fff4d6'];
      } else if (type === 'jelly') {
        numParticles = 34;
        explosionSpeed = 5.8;
        particleColors = ['#a86cf3', '#8f55d4', '#7bdff2', '#ffd166'];
      } else if (type === 'brush') {
        numParticles = 28;
        explosionSpeed = 5.2;
        particleColors = ['#ffffff', '#d7f3ff', '#7bdff2', '#b8f2e6'];
      }

      // Multiply particles and speed based on tower upgrade level
      numParticles = Math.round(numParticles * (1 + (level - 1) * 0.25));
      explosionSpeed *= 1 + (level - 1) * 0.15;

      // Spawn particles from pool
      let spawned = 0;
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        if (spawned >= numParticles) break;
        
        const p = particlePool[i];
        if (!p.active) {
          p.active = true;
          p.position.copy(position);
          
          // Random spherical scatter velocity
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          
          // Speed variation
          const speed = (0.3 + Math.random() * 0.7) * explosionSpeed;
          
          p.velocity.set(
            Math.sin(phi) * Math.cos(theta),
            Math.abs(Math.cos(phi)) * 0.8 + 0.2, // bias upwards velocity for ground explosions
            Math.sin(phi) * Math.sin(theta)
          ).normalize().multiplyScalar(speed);

          // Select random color from the palette
          const selectedColor = particleColors[Math.floor(Math.random() * particleColors.length)];
          p.color.set(selectedColor);
          
          p.life = 0;
          p.maxLife = 0.4 + Math.random() * 0.55; // life between 400ms and 950ms
          p.size = (0.08 + Math.random() * 0.12) * (1 + (level - 1) * 0.2);
          
          spawned++;
        }
      }
    };

    return () => {
      triggerExplosion = null;
    };
  }, []);

  useFrame((state, delta) => {
    const frameDelta = Math.min(0.05, delta || 0.016);
    
    let idx = 0;
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempRotation = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    particlePool.forEach((p) => {
      if (!p.active) return;

      // Increment age
      p.life += frameDelta;
      if (p.life >= p.maxLife) {
        p.active = false;
        return;
      }

      // Physics: Apply drag and gravity
      p.velocity.y -= frameDelta * 4.8; // gravity drop
      p.velocity.multiplyScalar(1 - frameDelta * 1.8); // air resistance/drag
      
      // Update coordinates
      p.position.addScaledVector(p.velocity, frameDelta);

      // Render coordinates
      tempPosition.copy(p.position);
      
      // Scale shrinks to zero as life runs out
      const lifeRatio = p.life / p.maxLife;
      const currentScale = p.size * (1 - lifeRatio);
      tempScale.set(currentScale, currentScale, currentScale);

      // Identity rotation (spherical dots)
      tempRotation.set(0, 0, 0, 1);
      
      tempMatrix.compose(tempPosition, tempRotation, tempScale);

      if (meshRef.current) {
        meshRef.current.setMatrixAt(idx, tempMatrix);
        meshRef.current.setColorAt(idx, p.color);
        idx++;
      }
    });

    // Hide remaining instances
    const hideMatrix = new THREE.Matrix4().makeTranslation(9999, 9999, 9999);
    if (meshRef.current) {
      for (let i = idx; i < PARTICLE_POOL_SIZE; i++) {
        meshRef.current.setMatrixAt(i, hideMatrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, PARTICLE_POOL_SIZE]}
      frustumCulled={false}
    >
      {/* Box geometries make lightweight food-impact confetti */}
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
