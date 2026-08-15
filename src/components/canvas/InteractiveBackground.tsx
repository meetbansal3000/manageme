import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  theme?: 'light' | 'dark';
}

// ---------------------------------------------------------------------------
// 1. Ultra-Lightweight InstancedMesh Particle Field
// Single draw call, low count (180), adaptive day/night colors
// ---------------------------------------------------------------------------
function InstancedParticleField({ count = 180, isDark = true }: { count?: number; isDark?: boolean }) {
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
    const palette = isDark
      ? [
          new THREE.Color('#3b82f6'), // soft blue
          new THREE.Color('#6366f1'), // indigo
          new THREE.Color('#38bdf8'), // sky
          new THREE.Color('#818cf8')  // lavender
        ]
      : [
          new THREE.Color('#2563eb'), // royal blue
          new THREE.Color('#4f46e5'), // vibrant indigo
          new THREE.Color('#0284c7'), // sky
          new THREE.Color('#7c3aed')  // purple
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
  }, [count, dummy, particles, isDark]);

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
        opacity={isDark ? 0.10 : 0.22} 
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// 2. Subtle Low-Poly Geometric Ambient Core
// ---------------------------------------------------------------------------
function SubtleGeometricCore({ isDark = true }: { isDark?: boolean }) {
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
        <meshBasicMaterial 
          color={isDark ? '#3b82f6' : '#2563eb'} 
          wireframe 
          transparent 
          opacity={isDark ? 0.06 : 0.10} 
        />
      </mesh>
      {/* Dim ambient orbital ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[4.2, 0.015, 6, 36]} />
        <meshBasicMaterial 
          color={isDark ? '#6366f1' : '#4f46e5'} 
          transparent 
          opacity={isDark ? 0.07 : 0.12} 
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Fallback CSS Glow Canvas
// ---------------------------------------------------------------------------
function CSSFallbackBackground({ isDark = true }: { isDark?: boolean }) {
  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-[#07090e]' : 'bg-[#f8fafc]'} overflow-hidden pointer-events-none z-[-1]`}>
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${isDark ? 'bg-blue-600/5' : 'bg-blue-400/10'} rounded-full blur-[120px]`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Main Exported 3D Background Component
// ---------------------------------------------------------------------------
export const InteractiveBackground: React.FC<Props> = ({ theme = 'dark' }) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const isDark = theme === 'dark';

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
    return <CSSFallbackBackground isDark={isDark} />;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-all duration-700" 
      style={{ 
        background: isDark 
          ? 'radial-gradient(circle at 50% 30%, #0c111e 0%, #07090e 60%, #030407 100%)' 
          : 'radial-gradient(circle at 50% 30%, #f8fafc 0%, #eef2f6 55%, #e2e8f0 100%)'
      }}
      aria-hidden="true"
    >
      <Suspense fallback={<CSSFallbackBackground isDark={isDark} />}>
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
          <SubtleGeometricCore isDark={isDark} />
          <InstancedParticleField count={180} isDark={isDark} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default InteractiveBackground;
