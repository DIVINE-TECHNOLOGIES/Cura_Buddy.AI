"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Torus, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface Features3DProps {
  className?: string;
}

// Medical Pill/Capsule
const MedicalPill: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  return (
    <Float speed={1.3} rotationIntensity={0.8} floatIntensity={1.5}>
      <group position={position} scale={1.5}>
        <Cylinder args={[0.5, 0.5, 1.5, 32]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </Cylinder>
        <Sphere args={[0.5, 32, 32]} position={[0.75, 0, 0]}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </Sphere>
        <Sphere args={[0.5, 32, 32]} position={[-0.75, 0, 0]}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </Sphere>
      </group>
    </Float>
  );
};

// Stethoscope-like shape
const Stethoscope: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.8}>
      <group ref={groupRef} position={[0, 0, 0]} scale={1.4}>
        <Torus args={[1.5, 0.2, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color="#4facfe" 
            emissive="#4facfe" 
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.2}
          />
        </Torus>
        <Sphere args={[0.3, 16, 16]} position={[0, -1.5, 0]}>
          <meshStandardMaterial 
            color="#4facfe" 
            emissive="#4facfe" 
            emissiveIntensity={0.5}
          />
        </Sphere>
      </group>
    </Float>
  );
};

// Health monitoring graph bars
const HealthBars: React.FC = () => {
  const bars = [];
  const heights = [2, 2.5, 1.5, 3, 2.3, 1.8];
  
  for (let i = 0; i < 6; i++) {
    bars.push(
      <Float 
        key={i} 
        speed={1 + i * 0.1} 
        rotationIntensity={0.3} 
        floatIntensity={0.8}
      >
        <Box 
          args={[0.4, heights[i], 0.4]} 
          position={[-2 + i * 0.8, heights[i] / 2 - 1.5, 0]}
        >
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#667eea" : "#764ba2"} 
            emissive={i % 2 === 0 ? "#667eea" : "#764ba2"} 
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.4}
          />
        </Box>
      </Float>
    );
  }

  return <group position={[-2.5, -1.5, 0]} scale={1.3}>{bars}</group>;
};

// Pulsing health indicator
const HealthIndicator: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Torus 
        ref={meshRef} 
        args={[2, 0.25, 16, 100]} 
        position={[2.5, 1.5, 0]}
        rotation={[Math.PI / 4, 0, 0]}
        scale={1.3}
      >
        <MeshDistortMaterial
          color="#f093fb"
          emissive="#f093fb"
          emissiveIntensity={0.5}
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={0.6}
        />
      </Torus>
    </Float>
  );
};

const Features3D: React.FC<Features3DProps> = ({ className }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.6} color="#667eea" />
          <pointLight position={[10, -10, 5]} intensity={0.6} color="#764ba2" />
          
          <MedicalPill position={[-4, 2.5, 0]} color="#667eea" />
          <MedicalPill position={[4, -2.5, 0]} color="#764ba2" />
          <Stethoscope />
          <HealthBars />
          <HealthIndicator />
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Features3D;
