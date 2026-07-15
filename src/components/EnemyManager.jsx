import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, WAYPOINTS } from '../gameStore';

// Expose a global, high-frequency map for Turrets to read positions in real-time
export const activeEnemiesPositions = new Map();

const MAX_ENEMY_INSTANCES = 100;
const MAX_BOSS_INSTANCES = 20;
const MAX_HEALTH_BAR_INSTANCES = 120;

// Helper: Calculate total path length
const calculatePathLength = () => {
  let len = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const p1 = WAYPOINTS[i];
    const p2 = WAYPOINTS[i + 1];
    len += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
  }
  return len;
};

const PATH_TOTAL_LENGTH = calculatePathLength();

// Helper: Get Vector3 position and direction on the path based on distance traveled
const getPathPositionAndDirection = (distance) => {
  let currentDist = 0;
  const pos = new THREE.Vector3();
  const dir = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const start = WAYPOINTS[i];
    const end = WAYPOINTS[i + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const segLen = Math.sqrt(dx * dx + dz * dz);

    if (distance <= currentDist + segLen) {
      const ratio = (distance - currentDist) / segLen;
      pos.set(start.x + dx * ratio, start.y, start.z + dz * ratio);
      dir.set(dx, 0, dz).normalize();
      return { pos, dir };
    }
    currentDist += segLen;
  }
  
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  pos.set(last.x, last.y, last.z);
  return { pos, dir };
};

export default function EnemyManager() {
  const enemies = useGameStore(state => state.enemies);
  const leakEnemy = useGameStore(state => state.leakEnemy);
  const wave = useGameStore(state => state.wave);

  // InstancedMesh references
  const normalMeshRef = useRef();
  const fastMeshRef = useRef();
  const bossMeshRef = useRef();
  
  // Health bar background and foreground instanced meshes
  const hpBgMeshRef = useRef();
  const hpFgMeshRef = useRef();

  // Keep track of spawning elapsed time
  const waveElapsedTime = useRef(0);
  
  // Track high-frequency properties of enemies locally
  // structure: enemyId -> { distanceTraveled }
  const localEnemiesData = useRef(new Map());

  // Reset spawning and movement data only when a new wave starts.
  useEffect(() => {
    waveElapsedTime.current = 0;
    localEnemiesData.current.clear();
    activeEnemiesPositions.clear();
  }, [wave]);

  useFrame((state, delta) => {
    const frameDelta = Math.min(0.05, delta || 0.016);
    waveElapsedTime.current += frameDelta;
    
    // Counters for instancing index positioning
    let idxNormal = 0;
    let idxFast = 0;
    let idxBoss = 0;
    let idxHp = 0;

    // Reset high-frequency map
    activeEnemiesPositions.clear();

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempRotation = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    enemies.forEach((enemy) => {
      if (enemy.dead || enemy.reachedEnd) {
        return;
      }

      // Check if spawned
      const elapsedWaveTime = waveElapsedTime.current;
      if (elapsedWaveTime < enemy.spawnDelay) {
        return;
      }

      // Update distance traveled
      let localData = localEnemiesData.current.get(enemy.id);
      if (!localData) {
        localData = { distanceTraveled: 0 };
        localEnemiesData.current.set(enemy.id, localData);
      }

      // Increment distance based on delta
      localData.distanceTraveled += frameDelta * enemy.speed;

      // Leak check
      if (localData.distanceTraveled >= PATH_TOTAL_LENGTH) {
        // Trigger leak
        leakEnemy(enemy.id);
        return;
      }

      // Calculate path coords
      const { pos, dir } = getPathPositionAndDirection(localData.distanceTraveled);
      
      // Save position to global map for turret scanning
      activeEnemiesPositions.set(enemy.id, {
        id: enemy.id,
        position: pos.clone(),
        hp: enemy.hp,
        maxHp: enemy.maxHp,
        size: enemy.size,
        type: enemy.type
      });

      // Prepare enemy scale
      tempScale.set(enemy.size, enemy.size, enemy.size);
      
      // Calculate rotation quaternion pointing in movement direction
      const angle = Math.atan2(-dir.z, dir.x);
      tempRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      // Compose matrix
      tempMatrix.compose(pos, tempRotation, tempScale);

      // Distribute to proper InstancedMesh
      if (enemy.type === 'normal') {
        if (normalMeshRef.current) {
          normalMeshRef.current.setMatrixAt(idxNormal, tempMatrix);
          idxNormal++;
        }
      } else if (enemy.type === 'fast') {
        if (fastMeshRef.current) {
          fastMeshRef.current.setMatrixAt(idxFast, tempMatrix);
          idxFast++;
        }
      } else if (enemy.type === 'boss') {
        if (bossMeshRef.current) {
          bossMeshRef.current.setMatrixAt(idxBoss, tempMatrix);
          idxBoss++;
        }
      }

      // 4. Render Instanced Health Bar
      // Base placement: slightly above the enemy's head
      const hpBarPos = pos.clone().add(new THREE.Vector3(0, enemy.size * 0.9 + 0.3, 0));
      
      // Rotate health bars to face the camera (Billboard style, roughly facing front-left)
      const camPos = state.camera.position;
      const lookDir = new THREE.Vector3().subVectors(camPos, hpBarPos).normalize();
      const lookAngle = Math.atan2(lookDir.x, lookDir.z);
      const hpRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), lookAngle);

      // Draw background bar (Red)
      tempScale.set(enemy.size * 1.2, 0.1, 0.02);
      tempMatrix.compose(hpBarPos, hpRotation, tempScale);
      if (hpBgMeshRef.current) {
        hpBgMeshRef.current.setMatrixAt(idxHp, tempMatrix);
      }

      // Draw foreground bar (Green - scaled proportionally to HP ratio)
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      tempScale.set(enemy.size * 1.2 * hpRatio, 0.1, 0.02);
      
      // Offset green bar so it shrinks from right-to-left
      const leftShift = new THREE.Vector3(- (enemy.size * 1.2 * (1 - hpRatio)) / 2, 0, 0);
      leftShift.applyQuaternion(hpRotation); // rotate shift to face camera
      
      tempMatrix.compose(hpBarPos.clone().add(leftShift), hpRotation, tempScale);
      if (hpFgMeshRef.current) {
        hpFgMeshRef.current.setMatrixAt(idxHp, tempMatrix);
      }

      idxHp++;
    });

    // Reset matrices of unused instances to offscreen far away so they vanish
    const hideMatrix = new THREE.Matrix4().makeTranslation(9999, 9999, 9999);
    
    // Clean up Normal instances
    if (normalMeshRef.current) {
      for (let i = idxNormal; i < MAX_ENEMY_INSTANCES; i++) {
        normalMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      normalMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Clean up Fast instances
    if (fastMeshRef.current) {
      for (let i = idxFast; i < MAX_ENEMY_INSTANCES; i++) {
        fastMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      fastMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Clean up Boss instances
    if (bossMeshRef.current) {
      for (let i = idxBoss; i < MAX_BOSS_INSTANCES; i++) {
        bossMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      bossMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Clean up HP Bar instances
    if (hpBgMeshRef.current) {
      for (let i = idxHp; i < MAX_HEALTH_BAR_INSTANCES; i++) {
        hpBgMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      hpBgMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (hpFgMeshRef.current) {
      for (let i = idxHp; i < MAX_HEALTH_BAR_INSTANCES; i++) {
        hpFgMeshRef.current.setMatrixAt(i, hideMatrix);
      }
      hpFgMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Normal Enemies: Dark grey/blue metallic octahedron */}
      <instancedMesh ref={normalMeshRef} args={[null, null, MAX_ENEMY_INSTANCES]} castShadow receiveShadow>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial
          color="#4e5b7c"
          roughness={0.4}
          metalness={0.8}
        />
      </instancedMesh>

      {/* Fast Enemies: Bright green glowing cone/pyramid */}
      <instancedMesh ref={fastMeshRef} args={[null, null, MAX_ENEMY_INSTANCES]} castShadow receiveShadow>
        <coneGeometry args={[0.4, 0.9, 4]} />
        <meshStandardMaterial
          color="#39ff14"
          roughness={0.2}
          metalness={0.7}
          emissive="#39ff14"
          emissiveIntensity={0.15}
        />
      </instancedMesh>

      {/* Boss Enemies: Giant golden sphere-torus knot */}
      <instancedMesh ref={bossMeshRef} args={[null, null, MAX_BOSS_INSTANCES]} castShadow receiveShadow>
        <torusKnotGeometry args={[0.4, 0.15, 64, 8]} />
        <meshStandardMaterial
          color="#ffd000"
          roughness={0.15}
          metalness={0.9}
          emissive="#ff8a00"
          emissiveIntensity={0.1}
        />
      </instancedMesh>

      {/* Health Bar Backgrounds (Red) */}
      <instancedMesh ref={hpBgMeshRef} args={[null, null, MAX_HEALTH_BAR_INSTANCES]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ff0044" />
      </instancedMesh>

      {/* Health Bar Foregrounds (Green) */}
      <instancedMesh ref={hpFgMeshRef} args={[null, null, MAX_HEALTH_BAR_INSTANCES]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#39ff14" />
      </instancedMesh>
    </group>
  );
}
