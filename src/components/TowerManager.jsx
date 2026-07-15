import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, TOWER_TYPES } from '../gameStore';
import { activeEnemiesPositions } from './EnemyManager';
import { fireProjectile } from './ProjectileSystem';

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function CarrotShooter({ level, headRef, muzzleRef }) {
  const scale = 1 + (level - 1) * 0.12;

  return (
    <group scale={[scale, scale, scale]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 0.2, 16]} />
        <meshStandardMaterial color="#f6e2b8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.13, 0]} scale={[1, 0.35, 1]} castShadow>
        <sphereGeometry args={[0.48, 16, 12]} />
        <meshStandardMaterial color="#7ac943" roughness={0.85} />
      </mesh>

      <group position={[0, 0.66, 0]} ref={headRef}>
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.31, 0.9, 18]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>

        {[-0.16, 0, 0.16].map((x, index) => (
          <mesh
            key={x}
            position={[x, 0.04 + Math.abs(x) * 0.35, -0.3]}
            rotation={[index === 1 ? 0 : 0.25, 0, index === 0 ? -0.35 : index === 2 ? 0.35 : 0]}
            castShadow
          >
            <coneGeometry args={[0.13, 0.48, 8]} />
            <meshStandardMaterial color={index === 1 ? '#2f9e44' : '#55b938'} roughness={0.75} />
          </mesh>
        ))}

        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.07, 0.48]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color="#4a2c18" />
          </mesh>
        ))}
        <mesh position={[0, -0.06, 0.5]}>
          <boxGeometry args={[0.13, 0.025, 0.025]} />
          <meshBasicMaterial color="#4a2c18" />
        </mesh>
        <group ref={muzzleRef} position={[0, 0, 0.69]} />
      </group>

      {level >= 2 && (
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.61, 0.045, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.45} />
        </mesh>
      )}
      {level === 3 && (
        <group position={[0, 1.1, 0]}>
          {[-0.35, 0.35].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, x < 0 ? -0.35 : 0.35]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#fff4b8" emissive="#fbbf24" emissiveIntensity={0.35} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function BroccoliBomber({ level, headRef, muzzleRef }) {
  const scale = 1 + (level - 1) * 0.12;
  const florets = [
    [-0.28, 0.04, 0.28],
    [0, 0.14, 0.35],
    [0.28, 0.04, 0.28],
    [-0.16, 0.25, 0.18],
    [0.16, 0.25, 0.18]
  ];

  return (
    <group scale={[scale, scale, scale]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.8, 0.2, 16]} />
        <meshStandardMaterial color="#e8f2c7" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 0.56, 12]} />
        <meshStandardMaterial color="#7cb342" roughness={0.78} />
      </mesh>

      <group position={[0, 0.68, 0]} ref={headRef}>
        <mesh position={[0, -0.05, 0.19]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.2, 0.7, 12]} />
          <meshStandardMaterial color="#8bc34a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0.18]} scale={[1.05, 0.78, 0.9]} castShadow>
          <sphereGeometry args={[0.43, 18, 14]} />
          <meshStandardMaterial color="#2f9e44" roughness={0.92} />
        </mesh>
        {florets.map(([x, y, z]) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} castShadow>
            <sphereGeometry args={[0.23, 14, 12]} />
            <meshStandardMaterial color={y > 0.2 ? '#45b649' : '#3ca34d'} roughness={0.95} />
          </mesh>
        ))}

        {[-0.11, 0.11].map((x) => (
          <mesh key={x} position={[x, 0.13, 0.54]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color="#173b24" />
          </mesh>
        ))}
        <mesh position={[0, 0.01, 0.55]}>
          <boxGeometry args={[0.14, 0.028, 0.025]} />
          <meshBasicMaterial color="#173b24" />
        </mesh>
        <group ref={muzzleRef} position={[0, 0.03, 0.72]} />
      </group>

      {level >= 2 && (
        <group position={[0, 0.37, 0]}>
          {[-0.48, 0.48].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, x < 0 ? 0.75 : -0.75]} castShadow>
              <sphereGeometry args={[0.27, 12, 10]} />
              <meshStandardMaterial color="#66bb45" roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}
      {level === 3 && (
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.25} />
        </mesh>
      )}
    </group>
  );
}

function MilkBeam({ level, headRef, muzzleRef }) {
  const scale = 1 + (level - 1) * 0.12;

  return (
    <group scale={[scale, scale, scale]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.68, 0.76, 0.2, 16]} />
        <meshStandardMaterial color="#d9f4f4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 0.45, 12]} />
        <meshStandardMaterial color="#74c0d8" roughness={0.55} />
      </mesh>

      <group position={[0, 0.82, 0]} ref={headRef}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.92, 0.58]} />
          <meshStandardMaterial color="#fffdf3" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.08, 0.305]}>
          <boxGeometry args={[0.73, 0.24, 0.03]} />
          <meshStandardMaterial color="#7bdff2" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.59, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.45, 0.32, 4]} />
          <meshStandardMaterial color="#d7f3ff" roughness={0.4} />
        </mesh>
        <mesh position={[0.21, 0.67, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.48, 10]} />
          <meshStandardMaterial color="#ff8fab" roughness={0.35} />
        </mesh>

        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.22, 0.335]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color="#274c5e" />
          </mesh>
        ))}
        <mesh position={[0, 0.09, 0.34]}>
          <boxGeometry args={[0.15, 0.03, 0.025]} />
          <meshBasicMaterial color="#274c5e" />
        </mesh>
        <mesh position={[0, -0.19, 0.34]} scale={[0.78, 1.05, 0.35]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#7bdff2" emissiveIntensity={0.18} />
        </mesh>
        <group ref={muzzleRef} position={[0, 0.09, 0.55]} />
      </group>

      {level >= 2 && (
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.04, 8, 24]} />
          <meshStandardMaterial color="#7bdff2" emissive="#7bdff2" emissiveIntensity={0.22} />
        </mesh>
      )}
      {level === 3 && (
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.78, 18, 16]} />
          <meshStandardMaterial color="#d7f3ff" wireframe transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}

function HealthyFoodTower({ tower }) {
  const { selectedPlacedTowerId, selectPlacedTower } = useGameStore();
  const headRef = useRef();
  const muzzleRef = useRef();
  const lastFiredTime = useRef(0);
  const currentTargetId = useRef(null);
  const typeData = TOWER_TYPES[tower.type];
  const isSelected = selectedPlacedTowerId === tower.id;

  useFrame((state) => {
    const timeNow = state.clock.getElapsedTime();
    let target = null;

    if (currentTargetId.current) {
      const activeTarget = activeEnemiesPositions.get(currentTargetId.current);
      if (activeTarget && !activeTarget.dead) {
        const distance = new THREE.Vector3(tower.x, 0.5, tower.z).distanceTo(activeTarget.position);
        if (distance <= tower.range) target = activeTarget;
      }
    }

    if (!target) {
      let closestDistance = Infinity;
      activeEnemiesPositions.forEach((enemy) => {
        if (enemy.dead) return;
        const distance = new THREE.Vector3(tower.x, 0.5, tower.z).distanceTo(enemy.position);
        if (distance <= tower.range && distance < closestDistance) {
          closestDistance = distance;
          target = enemy;
        }
      });

      currentTargetId.current = target?.id ?? null;
    }

    if (target && headRef.current) {
      const headWorldPosition = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPosition);
      const aimMatrix = new THREE.Matrix4().lookAt(target.position, headWorldPosition, UP_AXIS);
      const targetRotation = new THREE.Quaternion().setFromRotationMatrix(aimMatrix);
      headRef.current.quaternion.slerp(targetRotation, 0.16);

      const fireInterval = 1 / tower.fireRate;
      if (timeNow - lastFiredTime.current >= fireInterval && fireProjectile) {
        const muzzlePosition = new THREE.Vector3(tower.x, 1.2, tower.z);
        muzzleRef.current?.getWorldPosition(muzzlePosition);
        fireProjectile(tower.type, muzzlePosition, target.id, tower.damage, tower.level);
        lastFiredTime.current = timeNow;
      }
    } else if (headRef.current) {
      const idleRotation = new THREE.Quaternion().setFromAxisAngle(
        UP_AXIS,
        Math.sin(timeNow * 0.5 + tower.x * 0.2) * 0.2
      );
      headRef.current.quaternion.slerp(idleRotation, 0.03);
    }
  });

  const renderModel = () => {
    if (tower.type === 'laser') {
      return <CarrotShooter level={tower.level} headRef={headRef} muzzleRef={muzzleRef} />;
    }
    if (tower.type === 'cannon') {
      return <BroccoliBomber level={tower.level} headRef={headRef} muzzleRef={muzzleRef} />;
    }
    if (tower.type === 'tesla') {
      return <MilkBeam level={tower.level} headRef={headRef} muzzleRef={muzzleRef} />;
    }
    return null;
  };

  return (
    <group
      position={[tower.x, 0.2, tower.z]}
      onClick={(event) => {
        event.stopPropagation();
        selectPlacedTower(tower.id);
      }}
    >
      {isSelected && (
        <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color={typeData.color} transparent opacity={0.24} />
        </mesh>
      )}
      {renderModel()}
    </group>
  );
}

export default function TowerManager() {
  const towers = useGameStore((state) => state.towers);

  return (
    <group>
      {towers.map((tower) => (
        <HealthyFoodTower key={tower.id} tower={tower} />
      ))}
    </group>
  );
}
