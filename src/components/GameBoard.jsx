import React, { useState } from 'react';
import * as THREE from 'three';
import {
  useGameStore,
  GRID_CELL_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  WAYPOINTS,
  isCellOnPath
} from '../gameStore';

const PATH_WIDTH = GRID_CELL_SIZE * 0.9;
const PATH_BORDER_WIDTH = PATH_WIDTH + 0.34;
const disableRaycast = () => null;

const createRoundedRectangle = (width, height, radius) => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + radius, -halfHeight);
  shape.lineTo(halfWidth - radius, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
  shape.lineTo(halfWidth, halfHeight - radius);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
  shape.lineTo(-halfWidth + radius, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
  shape.lineTo(-halfWidth, -halfHeight + radius);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);
  shape.closePath();
  return shape;
};

const MOUTH_CAVITY_SHAPE = createRoundedRectangle(27, 23, 6);
const TONGUE_SHAPE = createRoundedRectangle(24, 21, 5);
const TOOTH_ROW_X = [-8, -6, -4, -2, 0, 2, 4, 6, 8];

const PATH_SEGMENTS = WAYPOINTS.slice(0, -1).map((start, index) => {
  const end = WAYPOINTS[index + 1];
  const dx = end.x - start.x;
  const dz = end.z - start.z;

  return {
    index,
    start,
    dx,
    dz,
    length: Math.hypot(dx, dz),
    angle: Math.atan2(dz, dx),
    midpoint: [(start.x + end.x) / 2, (start.z + end.z) / 2]
  };
});

const PATH_MARKERS = PATH_SEGMENTS.flatMap((segment) => {
  const markerCount = Math.max(1, Math.floor(segment.length / 3));

  return Array.from({ length: markerCount }, (_, markerIndex) => {
    const ratio = (markerIndex + 1) / (markerCount + 1);
    return {
      key: `${segment.index}_${markerIndex}`,
      x: segment.start.x + segment.dx * ratio,
      z: segment.start.z + segment.dz * ratio,
      angle: segment.angle
    };
  });
});

function CandyGate() {
  return (
    <group position={[-11, 1.0, 3]}>
      <mesh position={[0, -0.2, 0]} castShadow raycast={disableRaycast}>
        <boxGeometry args={[1.45, 1.4, 0.85]} />
        <meshStandardMaterial color="#ff7096" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.48, 0]} raycast={disableRaycast}>
        <torusGeometry args={[0.48, 0.09, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#fff4d6" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.2, 0.44]} raycast={disableRaycast}>
        <boxGeometry args={[1.0, 0.24, 0.04]} />
        <meshStandardMaterial color="#fff4d6" roughness={0.5} />
      </mesh>
      <mesh position={[-0.34, 0.38, 0.1]} castShadow raycast={disableRaycast}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#ffd166" roughness={0.45} />
      </mesh>
      <mesh position={[0.32, 0.42, -0.02]} castShadow raycast={disableRaycast}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#7bdff2" roughness={0.45} />
      </mesh>
      <pointLight position={[0, 0.3, 0.8]} color="#ff7096" intensity={0.8} distance={4} />
    </group>
  );
}

function ToothGoal() {
  return (
    <group position={[11, 1.15, 5]}>
      <mesh position={[0, 0.25, 0]} scale={[1.0, 1.05, 0.72]} castShadow raycast={disableRaycast}>
        <sphereGeometry args={[0.92, 32, 32]} />
        <meshStandardMaterial color="#fffdf4" roughness={0.28} emissive="#fff7d6" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[-0.36, -0.55, 0]} rotation={[0, 0, Math.PI]} castShadow raycast={disableRaycast}>
        <coneGeometry args={[0.38, 1.15, 20]} />
        <meshStandardMaterial color="#fffdf4" roughness={0.3} />
      </mesh>
      <mesh position={[0.36, -0.55, 0]} rotation={[0, 0, Math.PI]} castShadow raycast={disableRaycast}>
        <coneGeometry args={[0.38, 1.15, 20]} />
        <meshStandardMaterial color="#fffdf4" roughness={0.3} />
      </mesh>
      <mesh position={[-0.29, 0.42, 0.69]} raycast={disableRaycast}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#364153" />
      </mesh>
      <mesh position={[0.29, 0.42, 0.69]} raycast={disableRaycast}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#364153" />
      </mesh>
      <mesh position={[0, 0.12, 0.71]} scale={[1.5, 0.5, 0.35]} raycast={disableRaycast}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#ff7096" />
      </mesh>
      <mesh position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={disableRaycast}>
        <torusGeometry args={[1.1, 0.08, 12, 48]} />
        <meshBasicMaterial color="#7bdff2" transparent opacity={0.75} />
      </mesh>
      <pointLight position={[0, 1.2, 1]} color="#fff4b8" intensity={1.2} distance={5} />
    </group>
  );
}

function DecorativeTooth({ x, z, front, index }) {
  const toothScale = index === 4 ? 1.12 : 0.9 + (index % 2) * 0.08;

  return (
    <group
      position={[x, 0.18, z]}
      rotation={[0, front ? Math.PI : 0, (index - 4) * 0.018]}
      scale={toothScale}
    >
      <mesh position={[0, 0.58, 0]} scale={[0.62, 0.7, 0.48]} castShadow raycast={disableRaycast}>
        <sphereGeometry args={[0.78, 18, 18]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.32} emissive="#fff4cf" emissiveIntensity={0.04} />
      </mesh>
      <mesh position={[-0.22, 0.05, 0]} rotation={[0, 0, Math.PI]} castShadow raycast={disableRaycast}>
        <coneGeometry args={[0.23, 0.7, 14]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.36} />
      </mesh>
      <mesh position={[0.22, 0.05, 0]} rotation={[0, 0, Math.PI]} castShadow raycast={disableRaycast}>
        <coneGeometry args={[0.23, 0.7, 14]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.36} />
      </mesh>
    </group>
  );
}

function MouthEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={disableRaycast}>
        <shapeGeometry args={[MOUTH_CAVITY_SHAPE]} />
        <meshStandardMaterial color="#6f233d" roughness={0.88} />
      </mesh>

      <mesh
        position={[0, -0.22, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.28, 1, 0.72]}
        receiveShadow
        raycast={disableRaycast}
      >
        <torusGeometry args={[9.65, 1.05, 20, 96]} />
        <meshStandardMaterial color="#e84f72" roughness={0.5} emissive="#a71645" emissiveIntensity={0.06} />
      </mesh>

      <mesh position={[0, -0.38, 0.35]} scale={[10.8, 0.22, 8.4]} receiveShadow raycast={disableRaycast}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial color="#e97b8d" roughness={0.78} />
      </mesh>

      <mesh position={[0, 0.02, -9.55]} scale={[9.2, 0.58, 1.08]} receiveShadow raycast={disableRaycast}>
        <sphereGeometry args={[1, 32, 18]} />
        <meshStandardMaterial color="#f27c94" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.02, 9.55]} scale={[9.2, 0.58, 1.08]} receiveShadow raycast={disableRaycast}>
        <sphereGeometry args={[1, 32, 18]} />
        <meshStandardMaterial color="#f27c94" roughness={0.72} />
      </mesh>

      {TOOTH_ROW_X.map((x, index) => (
        <DecorativeTooth key={`upper_tooth_${x}`} x={x} z={-9.45} index={index} front={false} />
      ))}
      {TOOTH_ROW_X.map((x, index) => (
        <DecorativeTooth key={`lower_tooth_${x}`} x={x} z={9.45} index={index} front />
      ))}

      <mesh position={[0, 0.025, 1.2]} raycast={disableRaycast}>
        <boxGeometry args={[0.1, 0.035, 4.2]} />
        <meshBasicMaterial color="#c85570" transparent opacity={0.48} />
      </mesh>
    </group>
  );
}

export default function GameBoard() {
  const { 
    selectedTowerToBuild, 
    placeTower, 
    towers, 
    selectPlacedTower, 
    selectedPlacedTowerId 
  } = useGameStore();

  const [hoveredCell, setHoveredCell] = useState(null);

  // Compute grid borders/coordinates
  const halfWidth = (GRID_WIDTH * GRID_CELL_SIZE) / 2;
  const halfHeight = (GRID_HEIGHT * GRID_CELL_SIZE) / 2;

  // Handle board hover/movement
  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!selectedTowerToBuild) return;

    // Get intersection point
    const intersect = e.point;
    
    // Snap to grid
    const rawX = Math.round(intersect.x / GRID_CELL_SIZE) * GRID_CELL_SIZE;
    const rawZ = Math.round(intersect.z / GRID_CELL_SIZE) * GRID_CELL_SIZE;
    
    // Constraint to grid bounds
    const gridX = Math.max(-halfWidth + GRID_CELL_SIZE / 2, Math.min(halfWidth - GRID_CELL_SIZE / 2, rawX));
    const gridZ = Math.max(-halfHeight + GRID_CELL_SIZE / 2, Math.min(halfHeight - GRID_CELL_SIZE / 2, rawZ));

    const onPath = isCellOnPath(gridX, gridZ);
    const occupied = towers.some(t => t.x === gridX && t.z === gridZ);
    const isValid = !onPath && !occupied;

    setHoveredCell({ x: gridX, z: gridZ, isValid });
  };

  const handlePointerOut = () => {
    setHoveredCell(null);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    
    if (selectedTowerToBuild && hoveredCell && hoveredCell.isValid) {
      // Build a tower
      placeTower(hoveredCell.x, hoveredCell.z, selectedTowerToBuild);
      setHoveredCell(null);
    } else if (!selectedTowerToBuild) {
      // Select tower or clear selection
      const intersect = e.point;
      const gridX = Math.round(intersect.x / GRID_CELL_SIZE) * GRID_CELL_SIZE;
      const gridZ = Math.round(intersect.z / GRID_CELL_SIZE) * GRID_CELL_SIZE;
      
      const clickedTower = towers.find(t => t.x === gridX && t.z === gridZ);
      if (clickedTower) {
        selectPlacedTower(clickedTower.id);
      } else {
        selectPlacedTower(null);
      }
    }
  };

  return (
    <group>
      <MouthEnvironment />

      {/* Rounded tongue playfield keeps the original placement surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <shapeGeometry args={[TONGUE_SHAPE]} />
        <meshStandardMaterial
          color="#d96b80"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* Grid Lines Overlay */}
      <gridHelper
        args={[GRID_WIDTH * GRID_CELL_SIZE, GRID_WIDTH, '#ffe7ec', '#b84c65']}
        position={[0, 0.01, 0]}
      />

      {/* Continuous route with a bright border */}
      {PATH_SEGMENTS.map((segment) => (
        <group
          key={`path_segment_${segment.index}`}
          position={[segment.midpoint[0], 0.055, segment.midpoint[1]]}
          rotation={[0, -segment.angle, 0]}
        >
          <mesh position={[0, -0.025, 0]} receiveShadow raycast={disableRaycast}>
            <boxGeometry args={[segment.length + PATH_BORDER_WIDTH, 0.08, PATH_BORDER_WIDTH]} />
            <meshStandardMaterial color="#fff9e8" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.035, 0]} receiveShadow raycast={disableRaycast}>
            <boxGeometry args={[segment.length + PATH_WIDTH, 0.1, PATH_WIDTH]} />
            <meshStandardMaterial
              color="#ffd6a5"
              roughness={0.72}
              metalness={0.0}
              emissive="#ff9eb5"
              emissiveIntensity={0.08}
            />
          </mesh>
        </group>
      ))}

      {/* Direction markers stay visible without relying only on color */}
      {PATH_MARKERS.map((marker) => (
        <group
          key={`path_marker_${marker.key}`}
          position={[marker.x, 0.19, marker.z]}
          rotation={[0, -marker.angle, 0]}
        >
          <mesh rotation={[0, 0, -Math.PI / 2]} raycast={disableRaycast}>
            <coneGeometry args={[0.24, 0.58, 3]} />
            <meshBasicMaterial color="#ff5d8f" />
          </mesh>
        </group>
      ))}

      <CandyGate />
      <ToothGoal />

      {/* 3. Holographic Placement Indicator */}
      {selectedTowerToBuild && hoveredCell && (
        <group position={[hoveredCell.x, 0.1, hoveredCell.z]}>
          {/* Snap box */}
          <mesh>
            <boxGeometry args={[GRID_CELL_SIZE - 0.1, 0.1, GRID_CELL_SIZE - 0.1]} />
            <meshBasicMaterial
              color={hoveredCell.isValid ? '#39ff14' : '#ff007f'}
              transparent
              opacity={0.25}
            />
          </mesh>
          {/* Wireframe boundary */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[GRID_CELL_SIZE - 0.05, 0.1, GRID_CELL_SIZE - 0.05]} />
            <meshBasicMaterial
              color={hoveredCell.isValid ? '#39ff14' : '#ff007f'}
              wireframe
            />
          </mesh>
          {/* Preview of the actual tower model structure */}
          <group position={[0, 0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.6, 0.8, 16]} />
              <meshBasicMaterial
                color={hoveredCell.isValid ? '#39ff14' : '#ff007f'}
                transparent
                opacity={0.4}
                wireframe
              />
            </mesh>
          </group>
        </group>
      )}

      {/* Selected Tower Range Ring Indicator */}
      {selectedPlacedTowerId && (
        (() => {
          const selectedTower = towers.find(t => t.id === selectedPlacedTowerId);
          if (!selectedTower) return null;
          return (
            <mesh position={[selectedTower.x, 0.06, selectedTower.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[selectedTower.range - 0.05, selectedTower.range + 0.05, 64]} />
              <meshBasicMaterial color="#fff7d6" transparent opacity={0.75} depthWrite={false} />
            </mesh>
          );
        })()
      )}
    </group>
  );
}
