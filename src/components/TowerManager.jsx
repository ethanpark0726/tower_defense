import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, TOWER_TYPES } from '../gameStore';
import { activeEnemiesPositions } from './EnemyManager';
import { fireProjectile } from './ProjectileSystem';

// Individual Turret component
function Turret({ tower }) {
  const { damageEnemy, selectedPlacedTowerId, selectPlacedTower } = useGameStore();
  const baseRef = useRef();
  const headRef = useRef();
  const muzzleRef = useRef(); // Point from which bullet is shot

  const lastFiredTime = useRef(0);
  const currentTargetId = useRef(null);

  // Tower Type specific characteristics
  const typeData = TOWER_TYPES[tower.type];
  const isSelected = selectedPlacedTowerId === tower.id;

  useFrame((state) => {
    const timeNow = state.clock.getElapsedTime();
    let target = null;

    // 1. Scan/Validate Target
    if (currentTargetId.current) {
      const activeTarget = activeEnemiesPositions.get(currentTargetId.current);
      // Check if target is still active, alive, and in range
      if (activeTarget && !activeTarget.dead) {
        const dist = new THREE.Vector3(tower.x, 0.5, tower.z).distanceTo(activeTarget.position);
        if (dist <= tower.range) {
          target = activeTarget;
        }
      }
    }

    // 2. Search for closest target if none active
    if (!target) {
      let minDist = Infinity;
      activeEnemiesPositions.forEach((enemy) => {
        if (enemy.dead) return;
        const dist = new THREE.Vector3(tower.x, 0.5, tower.z).distanceTo(enemy.position);
        if (dist <= tower.range && dist < minDist) {
          minDist = dist;
          target = enemy;
        }
      });
      
      if (target) {
        currentTargetId.current = target.id;
      } else {
        currentTargetId.current = null;
      }
    }

    // 3. Aim Turret Head (Quaternion Rotation)
    if (target && headRef.current) {
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      
      // Calculate look direction (aim at center of enemy, offset by height)
      const aimTarget = target.position.clone();
      
      // Target direction relative to turret head position
      const dir = new THREE.Vector3().subVectors(aimTarget, headWorldPos);
      
      // Compute yaw (Y rotation) and pitch (X rotation)
      // Standard lookAt rotation matrix
      const matrix = new THREE.Matrix4().lookAt(aimTarget, headWorldPos, new THREE.Vector3(0, 1, 0));
      const targetRotation = new THREE.Quaternion().setFromRotationMatrix(matrix);

      // Smoothly slerp head rotation
      headRef.current.quaternion.slerp(targetRotation, 0.16);
      
      // 4. Fire logic based on Rate of Fire (fireRate: attacks/sec)
      const fireInterval = 1 / tower.fireRate;
      if (timeNow - lastFiredTime.current >= fireInterval) {
        // Shoot!
        if (fireProjectile) {
          const muzzlePos = new THREE.Vector3();
          if (muzzleRef.current) {
            muzzleRef.current.getWorldPosition(muzzlePos);
          } else {
            muzzlePos.set(tower.x, 1.2, tower.z);
          }
          
          fireProjectile(
            tower.type,
            muzzlePos,
            target.id,
            tower.damage,
            tower.level
          );
        }
        
        lastFiredTime.current = timeNow;
      }
    } else if (headRef.current) {
      // Idle rotation - slowly rotate yaw back to default forward
      const idleRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(timeNow * 0.5) * 0.2);
      headRef.current.quaternion.slerp(idleRotation, 0.03);
    }
  });

  // Level based scaling / changes for Visual Upgrades
  const levelScaleMultiplier = 1 + (tower.level - 1) * 0.12;

  // Geometry design configurations based on tower type
  const renderTurretModel = () => {
    switch (tower.type) {
      case 'laser':
        return (
          <group scale={[levelScaleMultiplier, levelScaleMultiplier, levelScaleMultiplier]}>
            {/* Hexagonal Base */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.55, 0.65, 0.4, 6]} />
              <meshStandardMaterial color="#1a203f" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* Base Pillar */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
              <meshStandardMaterial color="#10142e" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Yaw/Pitch Head Assembly */}
            <group position={[0, 0.7, 0]} ref={headRef}>
              <mesh castShadow>
                <sphereGeometry args={[0.32, 16, 16]} />
                <meshStandardMaterial color="#1a203f" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Dual Barrels */}
              <group position={[0, 0, 0.1]}>
                <mesh position={[-0.12, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
                  <meshStandardMaterial color="#00f2fe" roughness={0.2} metalness={0.9} />
                </mesh>
                <mesh position={[0.12, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
                  <meshStandardMaterial color="#00f2fe" roughness={0.2} metalness={0.9} />
                </mesh>
                {/* Laser energy lens */}
                <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]} ref={muzzleRef}>
                  <cylinderGeometry args={[0.18, 0.18, 0.1, 8]} />
                  <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={0.6} />
                </mesh>
              </group>
            </group>
            {/* Level upgrades decorations */}
            {tower.level >= 2 && (
              <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.7, 0.04, 8, 32]} />
                <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={0.3} />
              </mesh>
            )}
            {tower.level === 3 && (
              <mesh position={[0, 0.8, 0]}>
                <ringGeometry args={[0.42, 0.46, 32]} />
                <meshBasicMaterial color="#00f2fe" transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        );

      case 'cannon':
        return (
          <group scale={[levelScaleMultiplier, levelScaleMultiplier, levelScaleMultiplier]}>
            {/* Sturdy Heavy Base */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.65, 0.75, 0.35, 8]} />
              <meshStandardMaterial color="#2d122e" roughness={0.6} metalness={0.8} />
            </mesh>
            {/* Base Pillar */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
              <meshStandardMaterial color="#1a0a20" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* Weapon Head */}
            <group position={[0, 0.65, 0]} ref={headRef}>
              <mesh castShadow>
                <boxGeometry args={[0.6, 0.5, 0.6]} />
                <meshStandardMaterial color="#2d122e" roughness={0.4} metalness={0.8} />
              </mesh>
              {/* Massive Cannon Barrel */}
              <group position={[0, 0, 0.2]}>
                <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
                  <meshStandardMaterial color="#ff007f" roughness={0.3} metalness={0.9} />
                </mesh>
                {/* Cannon muzzle fire point */}
                <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]} ref={muzzleRef}>
                  <cylinderGeometry args={[0.11, 0.11, 0.05, 8]} />
                  <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.8} />
                </mesh>
              </group>
            </group>
            {/* Shield side plates for Level >= 2 */}
            {tower.level >= 2 && (
              <group position={[0, 0.5, 0]}>
                <mesh position={[-0.75, 0.1, 0]}>
                  <boxGeometry args={[0.08, 0.6, 0.5]} />
                  <meshStandardMaterial color="#ff007f" roughness={0.3} metalness={0.8} />
                </mesh>
                <mesh position={[0.75, 0.1, 0]}>
                  <boxGeometry args={[0.08, 0.6, 0.5]} />
                  <meshStandardMaterial color="#ff007f" roughness={0.3} metalness={0.8} />
                </mesh>
              </group>
            )}
            {tower.level === 3 && (
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
                <torusGeometry args={[0.4, 0.03, 8, 4]} />
                <meshBasicMaterial color="#ff007f" />
              </mesh>
            )}
          </group>
        );

      case 'tesla':
        return (
          <group scale={[levelScaleMultiplier, levelScaleMultiplier, levelScaleMultiplier]}>
            {/* Round layered base */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.7, 0.3, 16]} />
              <meshStandardMaterial color="#1f143a" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* Tesla rings stacking up */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.2, 16]} />
              <meshStandardMaterial color="#ffd000" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
              <meshStandardMaterial color="#1f143a" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
              <meshStandardMaterial color="#ffd000" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* Tesla Rotating Emitter Head */}
            <group position={[0, 1.0, 0]} ref={headRef}>
              {/* Spherical Dome */}
              <mesh castShadow ref={muzzleRef}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial 
                  color="#9d4edd" 
                  roughness={0.2} 
                  metalness={0.9} 
                  emissive="#9d4edd" 
                  emissiveIntensity={0.5} 
                />
              </mesh>
              {/* Rotating outer charge collectors */}
              <mesh position={[0.45, 0, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#9d4edd" />
              </mesh>
              <mesh position={[-0.45, 0, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#9d4edd" />
              </mesh>
            </group>
            
            {/* Spark containment ring for Level >= 2 */}
            {tower.level >= 2 && (
              <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.65, 0.03, 8, 32]} />
                <meshStandardMaterial color="#9d4edd" emissive="#9d4edd" emissiveIntensity={0.4} />
              </mesh>
            )}
            
            {/* Energy shield for Level 3 */}
            {tower.level === 3 && (
              <mesh position={[0, 1.0, 0]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial 
                  color="#9d4edd" 
                  wireframe 
                  transparent 
                  opacity={0.15} 
                  emissive="#9d4edd" 
                  emissiveIntensity={0.2}
                />
              </mesh>
            )}
          </group>
        );
      
      default:
        return null;
    }
  };

  return (
    <group position={[tower.x, 0.2, tower.z]} onClick={(e) => {
      e.stopPropagation();
      selectPlacedTower(tower.id);
    }}>
      {/* Click highlight shadow glow */}
      {isSelected && (
        <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 2.0]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.2} />
        </mesh>
      )}

      {/* Render the 3D model geometries */}
      {renderTurretModel()}
    </group>
  );
}

export default function TowerManager() {
  const towers = useGameStore(state => state.towers);

  return (
    <group>
      {towers.map((tower) => (
        <Turret key={tower.id} tower={tower} />
      ))}
    </group>
  );
}
