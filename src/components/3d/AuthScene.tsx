"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial, MeshReflectorMaterial, Ring } from "@react-three/drei";
import * as THREE from "three";

function FloatingElements() {
  return (
    <>
      {/* Central AI Orb */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <MeshDistortMaterial color="#ffffff" distort={0.3} speed={2} roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>

      {/* Abstract Book/Laptop (Boxes) */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[-2.5, 2, -1]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[1.5, 0.1, 2]} />
          <meshPhysicalMaterial color="#111111" roughness={0.2} metalness={0.8} clearcoat={1} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[2, -1, 1]} rotation={[-0.5, 0.5, 0.2]}>
          <boxGeometry args={[1, 1.5, 0.2]} />
          <meshPhysicalMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      </Float>

      {/* Code / Abstract Symbols using Rings and Torus */}
      <Float speed={1} rotationIntensity={3} floatIntensity={2}>
        <mesh position={[-1.5, -1.5, 2]}>
          <torusGeometry args={[0.5, 0.05, 16, 100]} />
          <meshStandardMaterial color="#71717A" emissive="#71717A" emissiveIntensity={0.5} />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1.5} floatIntensity={2.5}>
        <mesh position={[2.5, 2.5, 0]}>
          <octahedronGeometry args={[0.6]} />
          <meshPhysicalMaterial color="#171717" roughness={0} metalness={1} wireframe />
        </mesh>
      </Float>

      {/* Subtle Data Rings around the Orb */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, 1, 0]}>
        <ringGeometry args={[2, 2.02, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, Math.PI / 4, 0]} position={[0, 1, 0]}>
        <ringGeometry args={[2.5, 2.52, 64]} />
        <meshBasicMaterial color="#71717A" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle slow rotation of the entire scene
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      // Mouse parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (state.mouse.y * Math.PI) / 10, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, (state.mouse.x * Math.PI) / 10, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <FloatingElements />
    </group>
  );
}

export function AuthScene() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#070707]">
      {/* Background gradients for cinematic feel */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <fog attach="fog" args={["#070707", 5, 15]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />
        
        <Scene />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false} 
        />
      </Canvas>
    </div>
  );
}
