import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Ultra-Lightweight InstancedMesh Particle Field
// Single draw call, low count (180), opacity ~0.10, ultra-slow ambient crawl
// ---------------------------------------------------------------------------
function InstancedParticleField({ count = 180 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 16;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) - 2;
      const scale = 0.7 + Math.random() * 0.6;
      data.push({ x, y, z, scale });
    }
    return data;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    const palette = [
      new THREE.Color('#3b82f6'), // soft blue
      new THREE.Color('#6366f1'), // indigo
      new THREE.Color('#38bdf8'), // sky
      new THREE.Color('#818cf8')  // lavender
    ];

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, palette[i % palette.length]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count, dummy, particles]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Ambient crawl (slow, imperceptible continuous drift)
    meshRef.current.rotation.y += delta * 0.008;
    meshRef.current.rotation.x += delta * 0.003;

    // Zero-lag hardware-friendly dampened pointer reaction
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 0.4, 0.02);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.pointer.y * 0.25, 0.02);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial 
        transparent 
        opacity={0.10} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// 2. Subtle Low-Poly Geometric Ambient Core
// ---------------------------------------------------------------------------
function SubtleGeometricCore() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.01;
    groupRef.current.rotation.z += delta * 0.005;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.pointer.x * 0.5, 0.02);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, state.pointer.y * 0.3, 0.02);
  });

  return (
    <group ref={groupRef} position={[0, 0, -4]}>
      {/* Outer subtle geometric wireframe */}
      <mesh>
        <icosahedronGeometry args={[3.0, 0]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.06} />
      </mesh>
      {/* Dim ambient orbital ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[4.2, 0.015, 6, 36]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Fallback CSS Glow Canvas
// ---------------------------------------------------------------------------
function CSSFallbackBackground() {
  return (
    <div className="absolute inset-0 bg-[#07090e] overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Main Exported 3D Background Component
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
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" 
      style={{ background: 'radial-gradient(circle at 50% 30%, #0c111e 0%, #07090e 60%, #030407 100%)' }}
      aria-hidden="true"
    >

      <Suspense fallback={<CSSFallbackBackground />}>
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 55 }}
          dpr={[1, 1.5]} // Strict cap for maximum 60fps mobile & retina efficiency
          gl={{
            antialias: false, // Turn off heavy MSAA for raw performance
            alpha: true,
            powerPreference: 'high-performance'
          }}
          className="w-full h-full pointer-events-none"
        >
          <SubtleGeometricCore />
          <InstancedParticleField count={180} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default InteractiveBackground;
