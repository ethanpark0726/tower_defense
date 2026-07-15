import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../gameStore';
import { activeEnemiesPositions } from './EnemyManager';
import { triggerExplosion } from './ParticleSystem';

// Pre-allocated Projectile Pool Configuration
const POOL_SIZE = 150;
const projectilePool = Array.from({ length: POOL_SIZE }, () => ({
  active: false,
  type: 'laser', // laser | cannon | tesla
  position: new THREE.Vector3(),
  targetId: null,
  lastTargetPos: new THREE.Vector3(), // fall back if target disappears
  damage: 0,
  speed: 16.0,
  level: 1,
  
  // Custom tracking for beam duration (Tesla)
  beamLife: 0, 
  beamMaxLife: 0.12, // active for 120ms
  beamSource: new THREE.Vector3(),
  beamTarget: new THREE.Vector3()
}));

// Exported global callback to fire a projectile from any turret
export let fireProjectile = null;

export default function ProjectileSystem() {
  const damageEnemy = useGameStore(state => state.damageEnemy);

  // Instanced Meshes references
  const laserMeshRef = useRef();
  const cannonMeshRef = useRef();
  const teslaMeshRef = useRef(); // Stretched beam mesh

  useEffect(() => {
    // Register global trigger function
    fireProjectile = (type, startPos, targetId, damage, level) => {
      // Find first inactive projectile in pool
      const proj = projectilePool.find(p => !p.active);
      if (!proj) return; // Pool full, drop projectile for safety

      proj.active = true;
      proj.type = type;
      proj.position.copy(startPos);
      proj.targetId = targetId;
      proj.damage = damage;
      proj.level = level;
      
      const targetData = activeEnemiesPositions.get(targetId);
      if (targetData) {
        proj.lastTargetPos.copy(targetData.position);
      } else {
        proj.lastTargetPos.copy(startPos);
      }

      if (type === 'tesla') {
        proj.beamLife = 0;
        proj.beamSource.copy(startPos);
        // Instant damage for lightning hit
        if (targetData) {
          proj.beamTarget.copy(targetData.position);
          damageEnemy(targetId, damage);
          triggerExplosion(targetData.position, 'tesla', level);
        } else {
          proj.active = false;
        }
      } else if (type === 'laser') {
        proj.speed = 18.0;
      } else if (type === 'cannon') {
        proj.speed = 9.0;
      }
    };

    return () => {
      fireProjectile = null;
    };
  }, [damageEnemy]);

  useFrame((state) => {
    const delta = Math.min(0.05, state.clock.getDelta() || 0.016);
    
    let idxLaser = 0;
    let idxCannon = 0;
    let idxTesla = 0;

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempRotation = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    projectilePool.forEach((proj) => {
      if (!proj.active) return;

      // Handle standard physical flight projectiles (Laser, Cannon)
      if (proj.type === 'laser' || proj.type === 'cannon') {
        // Trace current position of target
        const targetData = activeEnemiesPositions.get(proj.targetId);
        if (targetData && !targetData.dead) {
          proj.lastTargetPos.copy(targetData.position);
        }

        const dist = proj.position.distanceTo(proj.lastTargetPos);
        const step = proj.speed * delta;

        if (step >= dist) {
          // Impact reached!
          if (targetData && !targetData.dead) {
            // Apply damage
            if (proj.type === 'cannon') {
              // AoE damage check: damage all enemies near impact zone
              activeEnemiesPositions.forEach((enemy) => {
                if (enemy.dead) return;
                const distToImpact = enemy.position.distanceTo(proj.lastTargetPos);
                if (distToImpact <= 2.2) { // Splash radius 2.2 units
                  damageEnemy(enemy.id, Math.round(proj.damage * (1 - distToImpact / 3)));
                }
              });
            } else {
              // Single target damage
              damageEnemy(proj.targetId, proj.damage);
            }
          }
          
          // Trigger explosion particle effects
          triggerExplosion(proj.lastTargetPos, proj.type, proj.level);
          
          proj.active = false;
          return;
        }

        // Translate towards last target coordinate
        const dir = new THREE.Vector3().subVectors(proj.lastTargetPos, proj.position).normalize();
        proj.position.addScaledVector(dir, step);

        // Apply matrix for instanced rendering
        tempPosition.copy(proj.position);
        
        // Point projectile model in flight direction
        const flightAngle = Math.atan2(-dir.z, dir.x);
        tempRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), flightAngle);

        if (proj.type === 'laser') {
          tempScale.set(0.12 * proj.level, 0.12 * proj.level, 0.45 * proj.level);
          tempMatrix.compose(tempPosition, tempRotation, tempScale);
          if (laserMeshRef.current) {
            laserMeshRef.current.setMatrixAt(idxLaser, tempMatrix);
            idxLaser++;
          }
        } else { // cannon
          tempScale.set(0.3 * proj.level, 0.3 * proj.level, 0.3 * proj.level);
          tempMatrix.compose(tempPosition, tempRotation, tempScale);
          if (cannonMeshRef.current) {
            cannonMeshRef.current.setMatrixAt(idxCannon, tempMatrix);
            idxCannon++;
          }
        }
      }
      
      // Handle Beam/Lightning projectiles (Tesla)
      else if (proj.type === 'tesla') {
        proj.beamLife += delta;
        if (proj.beamLife >= proj.beamMaxLife) {
          proj.active = false;
          return;
        }

        // Live target coordinates tracking for dynamic beam attachment
        const targetData = activeEnemiesPositions.get(proj.targetId);
        if (targetData) {
          proj.beamTarget.copy(targetData.position);
        }

        // Draw a cylinder linking muzzle to enemy
        const pStart = proj.beamSource;
        const pEnd = proj.beamTarget;
        
        // Midpoint position
        const midpoint = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
        const distance = pStart.distanceTo(pEnd);
        
        // Compute direction vector
        const direction = new THREE.Vector3().subVectors(pEnd, pStart).normalize();
        
        // Create rotation quaternion pointing from start to end (relative to default vertical cylinder y-axis)
        const cylinderAxis = new THREE.Vector3(0, 1, 0);
        const alignRotation = new THREE.Quaternion().setFromUnitVectors(cylinderAxis, direction);
        
        // Stretched scale (width/thickness is small, height matches exact distance)
        const beamThickness = 0.05 * proj.level * (1 - proj.beamLife / proj.beamMaxLife); // shrink over time
        tempScale.set(beamThickness, distance, beamThickness);
        
        tempMatrix.compose(midpoint, alignRotation, tempScale);
        if (teslaMeshRef.current) {
          teslaMeshRef.current.setMatrixAt(idxTesla, tempMatrix);
          idxTesla++;
        }
      }
    });

    // Hide unused instance slots
    const hideMatrix = new THREE.Matrix4().makeTranslation(9999, 9999, 9999);
    
    if (laserMeshRef.current) {
      for (let i = idxLaser; i < POOL_SIZE; i++) {
        laserMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      laserMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (cannonMeshRef.current) {
      for (let i = idxCannon; i < POOL_SIZE; i++) {
        cannonMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      cannonMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (teslaMeshRef.current) {
      for (let i = idxTesla; i < POOL_SIZE; i++) {
        teslaMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      teslaMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Laser Bolts (Cyan glowing cylinders) */}
      <instancedMesh ref={laserMeshRef} args={[null, null, POOL_SIZE]}>
        <cylinderGeometry args={[0.4, 0.4, 1.0, 8]} />
        <meshBasicMaterial
          color="#00f2fe"
          toneMapped={false} // bypass tone mapping for high Bloom output
        />
      </instancedMesh>

      {/* 2. Cannon Shells (Heavy glowing pink spheres) */}
      <instancedMesh ref={cannonMeshRef} args={[null, null, POOL_SIZE]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial
          color="#ff007f"
          toneMapped={false}
        />
      </instancedMesh>

      {/* 3. Tesla Lightning Beams (Purple stretched lines) */}
      <instancedMesh ref={teslaMeshRef} args={[null, null, POOL_SIZE]}>
        <cylinderGeometry args={[1.0, 1.0, 1.0, 8]} />
        <meshBasicMaterial
          color="#d284ff"
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
