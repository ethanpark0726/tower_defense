import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, WAYPOINTS } from '../gameStore';
import { activeEnemiesPositions } from '../activeEnemyRegistry';
import { triggerExplosion } from './ParticleSystem';

const MAX_ENEMY_INSTANCES = 100;
const MAX_BOSS_INSTANCES = 20;
const MAX_HEALTH_BAR_INSTANCES = 120;
const MAX_CHOCOLATE_PANEL_INSTANCES = MAX_ENEMY_INSTANCES * 4;
const MAX_STANDARD_EYE_INSTANCES = MAX_ENEMY_INSTANCES * 2;
const MAX_CANDY_WRAPPER_INSTANCES = MAX_ENEMY_INSTANCES * 2;
const MAX_BOSS_EYE_INSTANCES = MAX_BOSS_INSTANCES * 2;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const CANDY_STRIPE_ROTATION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, Math.PI / 2, 0)
);
const WRAPPER_LEFT_ROTATION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, 0, Math.PI / 2)
);
const WRAPPER_RIGHT_ROTATION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, 0, -Math.PI / 2)
);

const calculatePathLength = () => {
  let length = 0;

  for (let index = 0; index < WAYPOINTS.length - 1; index++) {
    const start = WAYPOINTS[index];
    const end = WAYPOINTS[index + 1];
    length += Math.hypot(end.x - start.x, end.z - start.z);
  }

  return length;
};

const PATH_TOTAL_LENGTH = calculatePathLength();

const getPathPositionAndDirection = (distance) => {
  let currentDistance = 0;
  const position = new THREE.Vector3();
  const direction = new THREE.Vector3(0, 0, 1);

  for (let index = 0; index < WAYPOINTS.length - 1; index++) {
    const start = WAYPOINTS[index];
    const end = WAYPOINTS[index + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const segmentLength = Math.hypot(dx, dz);

    if (distance <= currentDistance + segmentLength) {
      const ratio = (distance - currentDistance) / segmentLength;
      position.set(start.x + dx * ratio, start.y, start.z + dz * ratio);
      direction.set(dx, 0, dz).normalize();
      return { position, direction };
    }

    currentDistance += segmentLength;
  }

  const finalWaypoint = WAYPOINTS[WAYPOINTS.length - 1];
  position.set(finalWaypoint.x, finalWaypoint.y, finalWaypoint.z);
  return { position, direction };
};

const getDefeatEffectType = (enemyType) => {
  if (enemyType === 'fast') return 'candy';
  if (enemyType === 'boss') return 'jelly';
  return 'chocolate';
};

export default function EnemyManager() {
  const enemies = useGameStore((state) => state.enemies);
  const leakEnemy = useGameStore((state) => state.leakEnemy);
  const wave = useGameStore((state) => state.wave);

  const chocolateBodyRef = useRef();
  const chocolatePanelRef = useRef();
  const chocolateEyeRef = useRef();
  const chocolateMouthRef = useRef();

  const candyBodyRef = useRef();
  const candyWrapperRef = useRef();
  const candyStripeRef = useRef();
  const candyEyeRef = useRef();
  const candyMouthRef = useRef();

  const jellyBodyRef = useRef();
  const jellySkirtRef = useRef();
  const jellyCrownRef = useRef();
  const jellyEyeRef = useRef();
  const jellyMouthRef = useRef();

  const hpBackgroundRef = useRef();
  const hpForegroundRef = useRef();

  const waveElapsedTime = useRef(0);
  const localEnemiesData = useRef(new Map());
  const previousEnemyDeadStates = useRef(new Map());

  useEffect(() => {
    waveElapsedTime.current = 0;
    localEnemiesData.current.clear();
    activeEnemiesPositions.clear();
    previousEnemyDeadStates.current = new Map(
      enemies.map((enemy) => [enemy.id, enemy.dead])
    );
  }, [wave]);

  useEffect(() => {
    const nextDeadStates = new Map();

    enemies.forEach((enemy) => {
      const wasDead = previousEnemyDeadStates.current.get(enemy.id);
      const localData = localEnemiesData.current.get(enemy.id);

      if (enemy.dead && wasDead === false && localData?.lastPosition && triggerExplosion) {
        triggerExplosion(localData.lastPosition, getDefeatEffectType(enemy.type), 1);
      }

      nextDeadStates.set(enemy.id, enemy.dead);
    });

    previousEnemyDeadStates.current = nextDeadStates;
  }, [enemies]);

  useFrame((state, delta) => {
    const frameDelta = Math.min(0.05, delta || 0.016);
    const time = state.clock.getElapsedTime();
    waveElapsedTime.current += frameDelta;

    let chocolateBodyIndex = 0;
    let chocolatePanelIndex = 0;
    let chocolateEyeIndex = 0;
    let chocolateMouthIndex = 0;

    let candyBodyIndex = 0;
    let candyWrapperIndex = 0;
    let candyStripeIndex = 0;
    let candyEyeIndex = 0;
    let candyMouthIndex = 0;

    let jellyBodyIndex = 0;
    let jellySkirtIndex = 0;
    let jellyCrownIndex = 0;
    let jellyEyeIndex = 0;
    let jellyMouthIndex = 0;
    let healthBarIndex = 0;

    activeEnemiesPositions.clear();

    const matrix = new THREE.Matrix4();
    const basePosition = new THREE.Vector3();
    const componentPosition = new THREE.Vector3();
    const componentOffset = new THREE.Vector3();
    const baseRotation = new THREE.Quaternion();
    const componentRotation = new THREE.Quaternion();
    const animationRotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const healthBarPosition = new THREE.Vector3();
    const lookDirection = new THREE.Vector3();
    const leftShift = new THREE.Vector3();
    const healthBarRotation = new THREE.Quaternion();

    const placeComponent = (
      meshRef,
      index,
      origin,
      rotation,
      offsetX,
      offsetY,
      offsetZ,
      scaleX,
      scaleY,
      scaleZ,
      localRotation = null
    ) => {
      if (!meshRef.current) return;

      componentOffset.set(offsetX, offsetY, offsetZ).applyQuaternion(rotation);
      componentPosition.copy(origin).add(componentOffset);
      componentRotation.copy(rotation);

      if (localRotation) {
        componentRotation.multiply(localRotation);
      }

      scale.set(scaleX, scaleY, scaleZ);
      matrix.compose(componentPosition, componentRotation, scale);
      meshRef.current.setMatrixAt(index, matrix);
    };

    enemies.forEach((enemy) => {
      if (enemy.dead || enemy.reachedEnd) return;
      if (waveElapsedTime.current < enemy.spawnDelay) return;

      let localData = localEnemiesData.current.get(enemy.id);
      if (!localData) {
        localData = {
          distanceTraveled: 0,
          lastPosition: new THREE.Vector3()
        };
        localEnemiesData.current.set(enemy.id, localData);
      }

      localData.distanceTraveled += frameDelta * enemy.speed;

      if (localData.distanceTraveled >= PATH_TOTAL_LENGTH) {
        leakEnemy(enemy.id);
        return;
      }

      const { position, direction } = getPathPositionAndDirection(localData.distanceTraveled);
      const movementAngle = Math.atan2(-direction.z, direction.x);
      baseRotation.setFromAxisAngle(Y_AXIS, movementAngle);
      basePosition.copy(position);

      let healthBarHeight = enemy.size * 1.25;

      if (enemy.type === 'normal') {
        const wobble = Math.sin(time * 5 + localData.distanceTraveled * 0.7) * 0.11;
        basePosition.y += enemy.size * 0.58;
        animationRotation.setFromEuler(new THREE.Euler(0, 0, wobble));
        baseRotation.multiply(animationRotation);

        placeComponent(
          chocolateBodyRef,
          chocolateBodyIndex,
          basePosition,
          baseRotation,
          0,
          0,
          0,
          enemy.size,
          enemy.size,
          enemy.size
        );

        const panelOffsets = [
          [-0.22, 0.15],
          [0.22, 0.15],
          [-0.22, -0.15],
          [0.22, -0.15]
        ];

        panelOffsets.forEach(([offsetX, offsetY]) => {
          placeComponent(
            chocolatePanelRef,
            chocolatePanelIndex++,
            basePosition,
            baseRotation,
            offsetX * enemy.size,
            offsetY * enemy.size,
            0.255 * enemy.size,
            enemy.size,
            enemy.size,
            enemy.size
          );
        });

        [-0.19, 0.19].forEach((offsetX) => {
          placeComponent(
            chocolateEyeRef,
            chocolateEyeIndex++,
            basePosition,
            baseRotation,
            offsetX * enemy.size,
            0.11 * enemy.size,
            0.29 * enemy.size,
            enemy.size,
            enemy.size,
            enemy.size
          );
        });

        placeComponent(
          chocolateMouthRef,
          chocolateMouthIndex++,
          basePosition,
          baseRotation,
          0,
          -0.13 * enemy.size,
          0.29 * enemy.size,
          enemy.size,
          enemy.size,
          enemy.size
        );

        chocolateBodyIndex++;
        healthBarHeight = enemy.size * 1.18;
      } else if (enemy.type === 'fast') {
        const bounce = Math.abs(
          Math.sin(time * 8 + localData.distanceTraveled * 1.4)
        ) * 0.2;
        const tilt = Math.sin(time * 7 + localData.distanceTraveled) * 0.16;
        basePosition.y += enemy.size * 0.62 + bounce;
        animationRotation.setFromEuler(new THREE.Euler(0, 0, tilt));
        baseRotation.multiply(animationRotation);

        placeComponent(
          candyBodyRef,
          candyBodyIndex,
          basePosition,
          baseRotation,
          0,
          0,
          0,
          enemy.size * 1.05,
          enemy.size * 0.82,
          enemy.size * 0.74
        );

        placeComponent(
          candyWrapperRef,
          candyWrapperIndex++,
          basePosition,
          baseRotation,
          -0.62 * enemy.size,
          0,
          0,
          enemy.size,
          enemy.size,
          enemy.size,
          WRAPPER_LEFT_ROTATION
        );
        placeComponent(
          candyWrapperRef,
          candyWrapperIndex++,
          basePosition,
          baseRotation,
          0.62 * enemy.size,
          0,
          0,
          enemy.size,
          enemy.size,
          enemy.size,
          WRAPPER_RIGHT_ROTATION
        );

        placeComponent(
          candyStripeRef,
          candyStripeIndex++,
          basePosition,
          baseRotation,
          0,
          0,
          0,
          enemy.size,
          enemy.size,
          enemy.size,
          CANDY_STRIPE_ROTATION
        );

        [-0.18, 0.18].forEach((offsetX) => {
          placeComponent(
            candyEyeRef,
            candyEyeIndex++,
            basePosition,
            baseRotation,
            offsetX * enemy.size,
            0.1 * enemy.size,
            0.4 * enemy.size,
            enemy.size,
            enemy.size,
            enemy.size
          );
        });

        placeComponent(
          candyMouthRef,
          candyMouthIndex++,
          basePosition,
          baseRotation,
          0,
          -0.1 * enemy.size,
          0.4 * enemy.size,
          enemy.size,
          enemy.size,
          enemy.size
        );

        candyBodyIndex++;
        healthBarHeight = enemy.size * 1.3 + bounce;
      } else if (enemy.type === 'boss') {
        const squish = Math.sin(time * 4 + localData.distanceTraveled * 0.35);
        const horizontalScale = enemy.size * (1 + squish * 0.08);
        const verticalScale = enemy.size * (0.92 - squish * 0.1);
        basePosition.y += enemy.size * 0.72;

        placeComponent(
          jellyBodyRef,
          jellyBodyIndex,
          basePosition,
          baseRotation,
          0,
          0,
          0,
          horizontalScale,
          verticalScale,
          horizontalScale
        );
        placeComponent(
          jellySkirtRef,
          jellySkirtIndex++,
          basePosition,
          baseRotation,
          0,
          -0.43 * enemy.size,
          0,
          horizontalScale,
          enemy.size,
          horizontalScale
        );
        placeComponent(
          jellyCrownRef,
          jellyCrownIndex++,
          basePosition,
          baseRotation,
          0,
          0.88 * enemy.size,
          0,
          enemy.size,
          enemy.size,
          enemy.size
        );

        [-0.22, 0.22].forEach((offsetX) => {
          placeComponent(
            jellyEyeRef,
            jellyEyeIndex++,
            basePosition,
            baseRotation,
            offsetX * enemy.size,
            0.12 * enemy.size,
            0.63 * enemy.size,
            enemy.size,
            enemy.size,
            enemy.size
          );
        });

        placeComponent(
          jellyMouthRef,
          jellyMouthIndex++,
          basePosition,
          baseRotation,
          0,
          -0.13 * enemy.size,
          0.64 * enemy.size,
          enemy.size,
          enemy.size,
          enemy.size
        );

        jellyBodyIndex++;
        healthBarHeight = enemy.size * 1.7;
      }

      localData.lastPosition.copy(basePosition);
      activeEnemiesPositions.set(enemy.id, {
        id: enemy.id,
        position: basePosition.clone(),
        hp: enemy.hp,
        maxHp: enemy.maxHp,
        size: enemy.size,
        type: enemy.type
      });

      healthBarPosition.copy(basePosition).addScaledVector(Y_AXIS, healthBarHeight);
      lookDirection.subVectors(state.camera.position, healthBarPosition).normalize();
      const lookAngle = Math.atan2(lookDirection.x, lookDirection.z);
      healthBarRotation.setFromAxisAngle(Y_AXIS, lookAngle);

      scale.set(enemy.size * 1.25, 0.1, 0.02);
      matrix.compose(healthBarPosition, healthBarRotation, scale);
      hpBackgroundRef.current?.setMatrixAt(healthBarIndex, matrix);

      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      scale.set(enemy.size * 1.25 * hpRatio, 0.1, 0.02);
      leftShift
        .set(-(enemy.size * 1.25 * (1 - hpRatio)) / 2, 0, 0)
        .applyQuaternion(healthBarRotation);
      componentPosition.copy(healthBarPosition).add(leftShift);
      matrix.compose(componentPosition, healthBarRotation, scale);
      hpForegroundRef.current?.setMatrixAt(healthBarIndex, matrix);
      healthBarIndex++;
    });

    const hiddenMatrix = new THREE.Matrix4().makeTranslation(9999, 9999, 9999);
    const hideUnusedInstances = (meshRef, firstUnusedIndex, capacity) => {
      if (!meshRef.current) return;

      for (let index = firstUnusedIndex; index < capacity; index++) {
        meshRef.current.setMatrixAt(index, hiddenMatrix);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    };

    hideUnusedInstances(chocolateBodyRef, chocolateBodyIndex, MAX_ENEMY_INSTANCES);
    hideUnusedInstances(
      chocolatePanelRef,
      chocolatePanelIndex,
      MAX_CHOCOLATE_PANEL_INSTANCES
    );
    hideUnusedInstances(chocolateEyeRef, chocolateEyeIndex, MAX_STANDARD_EYE_INSTANCES);
    hideUnusedInstances(chocolateMouthRef, chocolateMouthIndex, MAX_ENEMY_INSTANCES);

    hideUnusedInstances(candyBodyRef, candyBodyIndex, MAX_ENEMY_INSTANCES);
    hideUnusedInstances(candyWrapperRef, candyWrapperIndex, MAX_CANDY_WRAPPER_INSTANCES);
    hideUnusedInstances(candyStripeRef, candyStripeIndex, MAX_ENEMY_INSTANCES);
    hideUnusedInstances(candyEyeRef, candyEyeIndex, MAX_STANDARD_EYE_INSTANCES);
    hideUnusedInstances(candyMouthRef, candyMouthIndex, MAX_ENEMY_INSTANCES);

    hideUnusedInstances(jellyBodyRef, jellyBodyIndex, MAX_BOSS_INSTANCES);
    hideUnusedInstances(jellySkirtRef, jellySkirtIndex, MAX_BOSS_INSTANCES);
    hideUnusedInstances(jellyCrownRef, jellyCrownIndex, MAX_BOSS_INSTANCES);
    hideUnusedInstances(jellyEyeRef, jellyEyeIndex, MAX_BOSS_EYE_INSTANCES);
    hideUnusedInstances(jellyMouthRef, jellyMouthIndex, MAX_BOSS_INSTANCES);

    hideUnusedInstances(hpBackgroundRef, healthBarIndex, MAX_HEALTH_BAR_INSTANCES);
    hideUnusedInstances(hpForegroundRef, healthBarIndex, MAX_HEALTH_BAR_INSTANCES);
  });

  return (
    <group>
      {/* Chocolate blocks */}
      <instancedMesh ref={chocolateBodyRef} args={[null, null, MAX_ENEMY_INSTANCES]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[0.92, 0.72, 0.46]} />
        <meshStandardMaterial color="#70402b" roughness={0.72} />
      </instancedMesh>
      <instancedMesh ref={chocolatePanelRef} args={[null, null, MAX_CHOCOLATE_PANEL_INSTANCES]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.31, 0.23, 0.055]} />
        <meshStandardMaterial color="#9a5d3d" roughness={0.65} />
      </instancedMesh>
      <instancedMesh ref={chocolateEyeRef} args={[null, null, MAX_STANDARD_EYE_INSTANCES]} frustumCulled={false}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshBasicMaterial color="#281912" />
      </instancedMesh>
      <instancedMesh ref={chocolateMouthRef} args={[null, null, MAX_ENEMY_INSTANCES]} frustumCulled={false}>
        <boxGeometry args={[0.18, 0.045, 0.04]} />
        <meshBasicMaterial color="#281912" />
      </instancedMesh>

      {/* Wrapped candies */}
      <instancedMesh ref={candyBodyRef} args={[null, null, MAX_ENEMY_INSTANCES]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[0.5, 18, 18]} />
        <meshStandardMaterial color="#ff5d8f" roughness={0.35} emissive="#ff5d8f" emissiveIntensity={0.08} />
      </instancedMesh>
      <instancedMesh ref={candyWrapperRef} args={[null, null, MAX_CANDY_WRAPPER_INSTANCES]} castShadow frustumCulled={false}>
        <coneGeometry args={[0.29, 0.46, 4]} />
        <meshStandardMaterial color="#ffd166" roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={candyStripeRef} args={[null, null, MAX_ENEMY_INSTANCES]} frustumCulled={false}>
        <torusGeometry args={[0.34, 0.055, 8, 20]} />
        <meshStandardMaterial color="#fff4d6" roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={candyEyeRef} args={[null, null, MAX_STANDARD_EYE_INSTANCES]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#3b2142" />
      </instancedMesh>
      <instancedMesh ref={candyMouthRef} args={[null, null, MAX_ENEMY_INSTANCES]} frustumCulled={false}>
        <boxGeometry args={[0.17, 0.04, 0.035]} />
        <meshBasicMaterial color="#3b2142" />
      </instancedMesh>

      {/* Jelly kings */}
      <instancedMesh ref={jellyBodyRef} args={[null, null, MAX_BOSS_INSTANCES]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[0.68, 24, 20]} />
        <meshStandardMaterial
          color="#a86cf3"
          roughness={0.28}
          transparent
          opacity={0.88}
          emissive="#7c3aed"
          emissiveIntensity={0.08}
        />
      </instancedMesh>
      <instancedMesh ref={jellySkirtRef} args={[null, null, MAX_BOSS_INSTANCES]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.64, 0.78, 0.3, 18]} />
        <meshStandardMaterial color="#8f55d4" roughness={0.35} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={jellyCrownRef} args={[null, null, MAX_BOSS_INSTANCES]} castShadow frustumCulled={false}>
        <coneGeometry args={[0.38, 0.5, 5]} />
        <meshStandardMaterial color="#ffd166" roughness={0.35} emissive="#ffb703" emissiveIntensity={0.12} />
      </instancedMesh>
      <instancedMesh ref={jellyEyeRef} args={[null, null, MAX_BOSS_EYE_INSTANCES]} frustumCulled={false}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#34234a" />
      </instancedMesh>
      <instancedMesh ref={jellyMouthRef} args={[null, null, MAX_BOSS_INSTANCES]} frustumCulled={false}>
        <boxGeometry args={[0.2, 0.05, 0.04]} />
        <meshBasicMaterial color="#34234a" />
      </instancedMesh>

      {/* Friendly health bars */}
      <instancedMesh ref={hpBackgroundRef} args={[null, null, MAX_HEALTH_BAR_INSTANCES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#4b5563" />
      </instancedMesh>
      <instancedMesh ref={hpForegroundRef} args={[null, null, MAX_HEALTH_BAR_INSTANCES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#6ee7b7" />
      </instancedMesh>
    </group>
  );
}
