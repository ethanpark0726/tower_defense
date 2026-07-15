import React, { useState } from 'react';
import { useGameStore, GRID_CELL_SIZE, GRID_WIDTH, GRID_HEIGHT, isCellOnPath } from '../gameStore';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

  // Generate grid tiles to display
  const tiles = [];
  for (let x = -halfWidth + GRID_CELL_SIZE/2; x < halfWidth; x += GRID_CELL_SIZE) {
    for (let z = -halfHeight + GRID_CELL_SIZE/2; z < halfHeight; z += GRID_CELL_SIZE) {
      tiles.push({ x, z, onPath: isCellOnPath(x, z) });
    }
  }

  return (
    <group>
      {/* 1. Base board plane (Metallic Grid Floor) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[GRID_WIDTH * GRID_CELL_SIZE + 2, GRID_HEIGHT * GRID_CELL_SIZE + 2]} />
        <meshStandardMaterial
          color="#0d1127"
          roughness={0.65}
          metalness={0.9}
        />
      </mesh>

      {/* Grid Lines Overlay */}
      <gridHelper
        args={[GRID_WIDTH * GRID_CELL_SIZE, GRID_WIDTH, '#00f2fe', '#060a1c']}
        position={[0, 0.01, 0]}
      />

      {/* 2. Path Tiles Rendering */}
      {tiles.map((tile, i) => {
        if (!tile.onPath) return null;
        return (
          <mesh key={`path_${i}`} position={[tile.x, 0.02, tile.z]} receiveShadow>
            <boxGeometry args={[GRID_CELL_SIZE - 0.1, 0.05, GRID_CELL_SIZE - 0.1]} />
            <meshStandardMaterial
              color="#1a203f"
              roughness={0.2}
              metalness={0.8}
              emissive="#ff007f"
              emissiveIntensity={0.06}
            />
          </mesh>
        );
      })}

      {/* Decorative borders for the map */}
      <mesh position={[0, 0.1, halfHeight + 1.1]}>
        <boxGeometry args={[halfWidth * 2 + 4, 0.2, 0.2]} />
        <meshStandardMaterial color="#00f2fe" roughness={0.3} metalness={0.8} emissive="#00f2fe" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.1, -halfHeight - 1.1]}>
        <boxGeometry args={[halfWidth * 2 + 4, 0.2, 0.2]} />
        <meshStandardMaterial color="#00f2fe" roughness={0.3} metalness={0.8} emissive="#00f2fe" emissiveIntensity={0.2} />
      </mesh>

      {/* Start Portal Visuals */}
      <group position={[-11, 0.5, 3]}>
        {/* Outer Ring */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.9, 0.15, 16, 64]} />
          <meshStandardMaterial color="#39ff14" emissive="#39ff14" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
        {/* Core glow sphere */}
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#39ff14" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* End Portal Portal (Core Objective) */}
      <group position={[11, 0.6, 5]}>
        {/* Core Shield Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial 
            color="#00f2fe" 
            emissive="#00f2fe" 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.4} 
            roughness={0.0}
            metalness={1.0}
          />
        </mesh>
        {/* Orbital rings */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.3, 0.08, 8, 32]} />
          <meshBasicMaterial color="#00f2fe" />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
          <torusGeometry args={[1.4, 0.06, 8, 32]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
      </group>

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
              <meshBasicMaterial color="#00f2fe" transparent opacity={0.6} depthWrite={false} />
            </mesh>
          );
        })()
      )}
    </group>
  );
}
