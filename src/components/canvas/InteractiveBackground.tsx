import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Particle Constellation Field (1,200+ floating dynamic particles)
// ---------------------------------------------------------------------------
function ParticleField({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  // Generate randomized particle positions and colors
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#3b82f6'), // vibrant blue
      new THREE.Color('#6366f1'), // indigo
      new THREE.Color('#8b5cf6'), // purple
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#f59e0b'), // warm gold accent
      new THREE.Color('#ffffff')  // starlight white
    ];

    for (let i = 0; i < count; i++) {
      // Spread across a wide 3D sphere/ellipsoid
      const radius = 12 + Math.random() * 22;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    // Gentle continuous rotation
    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.rotation.x += delta * 0.01;

    // React subtly to mouse pointer
    targetRotation.current.x = state.pointer.y * 0.3;
    targetRotation.current.y = state.pointer.x * 0.4;

    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      targetRotation.current.y,
      0.05
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// 2. Abstract Geometric Core & Fluid Distorting Sphere
// ---------------------------------------------------------------------------
function SpatialCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      // Mouse tracking parallax
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 1.5, 0.03);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.pointer.y * 1.0, 0.03);
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.2;
      wireframeRef.current.rotation.z += delta * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.08;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      {/* Floating Animated Distort Sphere */}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
        <Sphere ref={meshRef} args={[1.8, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#2563eb"
            attach="material"
            distort={0.42}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
            opacity={0.35}
            transparent
          />
        </Sphere>
      </Float>

      {/* Outer Geometric Wireframe Icosahedron */}
      <Float speed={1.2} rotationIntensity={1.0} floatIntensity={0.8}>
        <mesh ref={wireframeRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[3.2, 1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            wireframe
            transparent
            opacity={0.22}
            emissive="#6366f1"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      {/* Orbital Ring Accent */}
      <group ref={ringRef} position={[0, 0, 0]}>
        <mesh>
          <torusGeometry args={[4.4, 0.02, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Fallback CSS Glow Canvas (for devices without WebGL support)
// ---------------------------------------------------------------------------
function CSSFallbackBackground() {
  return (
    <div className="absolute inset-0 bg-[#07090e] overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px]" />
      <div className="absolute top-2/3 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Main Interactive 3D Background Component
// ---------------------------------------------------------------------------
export const InteractiveBackground: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <CSSFallbackBackground />;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      style={{ background: 'radial-gradient(circle at 50% 30%, #0d1322 0%, #07090e 60%, #030407 100%)' }}
      aria-hidden="true"
    >
      {/* Subtle top subtle ambient aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none" />

      <Suspense fallback={<CSSFallbackBackground />}>
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 55 }}
          dpr={[1, 1.75]} // Balance crispness with high performance
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* Dimensional Multi-Point Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-10, -10, -5]} intensity={1.5} color="#3b82f6" />
          <pointLight position={[10, -5, 5]} intensity={1.8} color="#8b5cf6" />
          <pointLight position={[0, 8, 2]} intensity={1.0} color="#06b6d4" />

          {/* 3D Scene Components */}
          <SpatialCore />
          <ParticleField count={1100} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default InteractiveBackground;
