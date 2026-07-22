import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import {
  useGameStore,
  GRID_CELL_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  getBoardRouteWave,
  getMapThemeForWave,
  getRouteForWave,
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
const TOOTH_GOAL_SHAPE = new THREE.Shape();
TOOTH_GOAL_SHAPE.moveTo(-0.85, 0.35);
TOOTH_GOAL_SHAPE.bezierCurveTo(-1.0, 0.78, -0.92, 1.25, -0.55, 1.25);
TOOTH_GOAL_SHAPE.bezierCurveTo(-0.32, 1.25, -0.22, 1.05, 0, 1.05);
TOOTH_GOAL_SHAPE.bezierCurveTo(0.22, 1.05, 0.32, 1.25, 0.55, 1.25);
TOOTH_GOAL_SHAPE.bezierCurveTo(0.92, 1.25, 1.0, 0.78, 0.85, 0.35);
TOOTH_GOAL_SHAPE.bezierCurveTo(0.78, -0.05, 0.64, -0.25, 0.56, -0.72);
TOOTH_GOAL_SHAPE.bezierCurveTo(0.49, -1.12, 0.3, -1.18, 0.14, -0.72);
TOOTH_GOAL_SHAPE.quadraticCurveTo(0, -0.38, -0.14, -0.72);
TOOTH_GOAL_SHAPE.bezierCurveTo(-0.3, -1.18, -0.49, -1.12, -0.56, -0.72);
TOOTH_GOAL_SHAPE.bezierCurveTo(-0.64, -0.25, -0.78, -0.05, -0.85, 0.35);
TOOTH_GOAL_SHAPE.closePath();
const TOOTH_EXTRUDE_SETTINGS = { depth: 0.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.12, bevelThickness: 0.12 };
const TOOTH_ROW_X = [-8, -6, -4, -2, 0, 2, 4, 6, 8];
const MAP_DECORATIONS = {
  gum_garden: {
    patches: [
      [-8, -6, 0.95],
      [7, -6, 0.85],
      [-7, 7, 0.78],
      [6, 2, 0.68]
    ],
    sprouts: [
      [-8.4, -6.1],
      [-7.8, -5.55],
      [7.35, -6.3],
      [-6.8, 7.35],
      [6.3, 2.3]
    ]
  },
  calcium_cove: {
    drops: [
      [-7.5, -6.4, 0.72],
      [6.6, -6.1, 0.56],
      [-7.2, 7.1, 0.64],
      [7.7, 2.1, 0.5],
      [0, 7.4, 0.44]
    ],
    bubbles: [
      [-8.9, -4.9, 0.18],
      [8.2, -5.1, 0.14],
      [-8.5, 5.6, 0.16],
      [4.8, 7.3, 0.12]
    ]
  },
  plaque_patrol: {
    spots: [
      [-8.1, -6.3, 0.62],
      [7.3, -6.5, 0.5],
      [-7.6, 7.3, 0.58],
      [7.2, 1.6, 0.46],
      [0.2, 7.2, 0.42]
    ],
    sparkle: [
      [-8.2, -5.6],
      [6.7, -6.0],
      [-7.1, 6.7],
      [7.6, 2.4]
    ]
  }
};

const createPathSegments = (route) => route.slice(0, -1).map((start, index) => {
  const end = route[index + 1];
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

const createPathMarkers = (pathSegments) => pathSegments.flatMap((segment) => {
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
    <group position={[11, 1.25, 5]} scale={1.12}>
      <mesh position={[0, 0, -0.18]} castShadow raycast={disableRaycast}>
        <extrudeGeometry args={[TOOTH_GOAL_SHAPE, TOOTH_EXTRUDE_SETTINGS]} />
        <meshStandardMaterial color="#fffdf4" roughness={0.3} emissive="#fff7d6" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[-0.3, 0.47, 0.47]} raycast={disableRaycast}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color="#364153" />
      </mesh>
      <mesh position={[0.3, 0.47, 0.47]} raycast={disableRaycast}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color="#364153" />
      </mesh>
      <mesh position={[-0.55, 0.25, 0.46]} scale={[1.5, 0.65, 0.35]} raycast={disableRaycast}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ff9eb5" transparent opacity={0.78} />
      </mesh>
      <mesh position={[0.55, 0.25, 0.46]} scale={[1.5, 0.65, 0.35]} raycast={disableRaycast}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ff9eb5" transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, 0.13, 0.49]} rotation={[0, 0, Math.PI]} raycast={disableRaycast}>
        <torusGeometry args={[0.18, 0.04, 8, 24, Math.PI]} />
        <meshBasicMaterial color="#ff7096" />
      </mesh>
      <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={disableRaycast}>
        <torusGeometry args={[1.15, 0.08, 12, 48]} />
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

function MouthEnvironment({ theme }) {
  return (
    <group>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={disableRaycast}>
        <shapeGeometry args={[MOUTH_CAVITY_SHAPE]} />
        <meshStandardMaterial color={theme.mouth} roughness={0.88} />
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

function GumGardenDecor({ theme }) {
  const decor = MAP_DECORATIONS.gum_garden;

  return (
    <group>
      {decor.patches.map(([x, z, scale]) => (
        <mesh key={`garden_patch_${x}_${z}`} position={[x, 0.11, z]} rotation={[-Math.PI / 2, 0, 0]} scale={scale} raycast={disableRaycast}>
          <circleGeometry args={[0.72, 28]} />
          <meshStandardMaterial color={theme.accent} roughness={0.82} transparent opacity={0.58} />
        </mesh>
      ))}
      {decor.sprouts.map(([x, z], index) => (
        <group key={`garden_sprout_${x}_${z}`} position={[x, 0.24, z]} rotation={[0, index % 2 ? 0.35 : -0.25, 0]}>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0.35]} castShadow raycast={disableRaycast}>
            <coneGeometry args={[0.09, 0.46, 8]} />
            <meshStandardMaterial color="#2f9e44" roughness={0.75} />
          </mesh>
          <mesh position={[0.1, 0.12, 0]} rotation={[0, 0, -0.45]} castShadow raycast={disableRaycast}>
            <coneGeometry args={[0.08, 0.36, 8]} />
            <meshStandardMaterial color="#55b938" roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CalciumCoveDecor({ theme }) {
  const decor = MAP_DECORATIONS.calcium_cove;

  return (
    <group>
      {decor.drops.map(([x, z, scale]) => (
        <mesh key={`calcium_drop_${x}_${z}`} position={[x, 0.15, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale * 1.35, scale]} raycast={disableRaycast}>
          <circleGeometry args={[0.75, 32]} />
          <meshStandardMaterial color={theme.accent} roughness={0.42} transparent opacity={0.46} emissive={theme.accent} emissiveIntensity={0.08} />
        </mesh>
      ))}
      {decor.bubbles.map(([x, z, radius]) => (
        <mesh key={`calcium_bubble_${x}_${z}`} position={[x, 0.36, z]} castShadow raycast={disableRaycast}>
          <sphereGeometry args={[radius, 14, 12]} />
          <meshStandardMaterial color={theme.secondaryAccent} roughness={0.18} transparent opacity={0.72} emissive={theme.accent} emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function PlaquePatrolDecor({ theme }) {
  const decor = MAP_DECORATIONS.plaque_patrol;

  return (
    <group>
      {decor.spots.map(([x, z, scale]) => (
        <mesh key={`plaque_spot_${x}_${z}`} position={[x, 0.13, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[scale * 1.25, scale, scale]} raycast={disableRaycast}>
          <circleGeometry args={[0.82, 30]} />
          <meshStandardMaterial color={theme.accent} roughness={0.86} transparent opacity={0.34} />
        </mesh>
      ))}
      {decor.sparkle.map(([x, z]) => (
        <group key={`plaque_sparkle_${x}_${z}`} position={[x, 0.27, z]} rotation={[0, Math.PI / 4, 0]}>
          <mesh raycast={disableRaycast}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={theme.secondaryAccent} roughness={0.3} emissive={theme.secondaryAccent} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MapDecorations({ theme }) {
  if (theme.id === 'calcium_cove') return <CalciumCoveDecor theme={theme} />;
  if (theme.id === 'plaque_patrol') return <PlaquePatrolDecor theme={theme} />;
  return <GumGardenDecor theme={theme} />;
}

export default function GameBoard() {
  const { 
    wave,
    selectedTowerToBuild, 
    waveActive,
    placeTower, 
    towers, 
    selectPlacedTower, 
    selectedPlacedTowerId 
  } = useGameStore();

  const [hoveredCell, setHoveredCell] = useState(null);
  const routeWave = getBoardRouteWave(wave, waveActive);
  const mapTheme = getMapThemeForWave(routeWave);
  const route = useMemo(() => getRouteForWave(routeWave), [routeWave]);
  const pathSegments = useMemo(() => createPathSegments(route), [route]);
  const pathMarkers = useMemo(() => createPathMarkers(pathSegments), [pathSegments]);

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

    const onPath = isCellOnPath(gridX, gridZ, routeWave);
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
      <MouthEnvironment theme={mapTheme} />

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
          color={mapTheme.tongue}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      <MapDecorations theme={mapTheme} />

      {/* Grid Lines Overlay */}
      <gridHelper
        args={[GRID_WIDTH * GRID_CELL_SIZE, GRID_WIDTH, '#ffe7ec', '#b84c65']}
        position={[0, 0.01, 0]}
      />

      {/* Continuous route with a bright border */}
      {pathSegments.map((segment) => (
        <group
          key={`path_segment_${segment.index}`}
          position={[segment.midpoint[0], 0.055, segment.midpoint[1]]}
          rotation={[0, -segment.angle, 0]}
        >
          <mesh position={[0, -0.025, 0]} receiveShadow raycast={disableRaycast}>
            <boxGeometry args={[segment.length + PATH_BORDER_WIDTH, 0.08, PATH_BORDER_WIDTH]} />
            <meshStandardMaterial color={mapTheme.routeBorder} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.035, 0]} receiveShadow raycast={disableRaycast}>
            <boxGeometry args={[segment.length + PATH_WIDTH, 0.1, PATH_WIDTH]} />
            <meshStandardMaterial
              color={mapTheme.route}
              roughness={0.72}
              metalness={0.0}
              emissive={mapTheme.routeGlow}
              emissiveIntensity={0.08}
            />
          </mesh>
        </group>
      ))}

      {/* Direction markers stay visible without relying only on color */}
      {pathMarkers.map((marker) => (
        <group
          key={`path_marker_${marker.key}`}
          position={[marker.x, 0.19, marker.z]}
          rotation={[0, -marker.angle, 0]}
        >
          <mesh rotation={[0, 0, -Math.PI / 2]} raycast={disableRaycast}>
            <coneGeometry args={[0.24, 0.58, 3]} />
            <meshBasicMaterial color={mapTheme.marker} />
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
