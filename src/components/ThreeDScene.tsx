"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Torus, Box } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDSceneProps {
  className?: string;
}

// DNA Helix Component
const DNAHelix: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const nodes = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (i - 10) * 0.4;
    
    nodes.push(
      <group key={i}>
        <Sphere args={[0.2, 16, 16]} position={[x, y, z]}>
          <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={0.3} />
        </Sphere>
        <Sphere args={[0.2, 16, 16]} position={[-x, y, -z]}>
          <meshStandardMaterial color="#764ba2" emissive="#764ba2" emissiveIntensity={0.3} />
        </Sphere>
      </group>
    );
  }

  return <group ref={groupRef}>{nodes}</group>;
};

// Pulsing Heart Shape
const HeartShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[4, 1.5, 0]} scale={1.3}>
        <torusKnotGeometry args={[1, 0.4, 100, 16]} />
        <meshStandardMaterial 
          color="#ff6b9d" 
          emissive="#ff6b9d" 
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

// Medical Cross
const MedicalCross: React.FC = () => {
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.2}>
      <group position={[-4, -1.5, 0]} rotation={[0, 0, Math.PI / 4]} scale={1.3}>
        <Box args={[0.4, 2, 0.4]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Box>
        <Box args={[2, 0.4, 0.4]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Box>
      </group>
    </Float>
  );
};

// Central Health Sphere with pulse effect
const HealthSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]} scale={1.3}>
        <MeshDistortMaterial
          color="#667eea"
          emissive="#667eea"
          emissiveIntensity={0.3}
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.5}
        />
      </Sphere>
    </Float>
  );
};

// Orbiting particles representing health data
const HealthParticles: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const particles = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 3.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    particles.push(
      <Sphere key={i} args={[0.15, 16, 16]} position={[x, Math.sin(angle * 2) * 0.7, z]}>
        <meshStandardMaterial 
          color="#4facfe" 
          emissive="#4facfe" 
          emissiveIntensity={0.8}
        />
      </Sphere>
    );
  }

  return <group ref={groupRef}>{particles}</group>;
};

const AnimatedMedicalShapes: React.FC = () => {
  return (
    <group>
      <HealthSphere />
      <DNAHelix />
      <HeartShape />
      <MedicalCross />
      <HealthParticles />
    </group>
  );
};

const ThreeDScene: React.FC<ThreeDSceneProps> = ({ className }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#667eea" />
          <pointLight position={[10, -10, 5]} intensity={0.5} color="#764ba2" />
          <AnimatedMedicalShapes />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDScene;
