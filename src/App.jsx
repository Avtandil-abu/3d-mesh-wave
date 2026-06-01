import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";


function InteractiveStars() {
  const starsRef = useRef();
  useFrame((state) => {
    const targetX = state.pointer.y * 0.12;
    const targetY = state.pointer.x * 0.12;
    if (starsRef.current) {
      starsRef.current.rotation.x += (targetX - starsRef.current.rotation.x) * 0.05;
      starsRef.current.rotation.y += (targetY - starsRef.current.rotation.y) * 0.05;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={600} factor={5} saturation={0} fade speed={0.4} />
    </group>
  );
}

function MeshWave({ isMobile }) {
  const meshRef = useRef();
  const [xSegments, ySegments] = [75, 75];

  const { positions } = useMemo(() => {
    const count = (xSegments + 1) * (ySegments + 1);
    const pos = new Float32Array(count * 3);

    let i = 0;
    for (let y = 0; y <= ySegments; y++) {
      for (let x = 0; x <= xSegments; x++) {
        const posX = (x / xSegments) * 12 - 6;
        const posY = (y / ySegments) * 8 - 4;

        pos[i * 3] = posX;
        pos[i * 3 + 1] = posY;
        pos[i * 3 + 2] = 0;
        i++;
      }
    }
    return { positions: pos };
  }, []);

  useFrame((state) => {
    const { clock, pointer } = state;
    const time = clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position;

    let index = 0;
    for (let y = 0; y <= ySegments; y++) {
      for (let x = 0; x <= xSegments; x++) {
        const posX = posAttr.getX(index);
        const posY = posAttr.getY(index);


        let z = Math.sin(posX * 0.5 + time * 1.2) * 0.4;
        z += Math.cos(posY * 0.6 + time * 1.0) * 0.3;
        z += Math.sin((posX + posY) * 0.3 + time * 1.5) * 0.2;

        const distanceToMouse = Math.sqrt(Math.pow(posX - pointer.x * 5, 2) + Math.pow(posY - pointer.y * 3, 2));


        if (distanceToMouse < 3.2 && pointer.y < 0) {
          z += (3.2 - distanceToMouse) * 0.45 * Math.sin(time * 4.5);
        }

        posAttr.setZ(index, z);
        index++;
      }
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.z = Math.sin(time * 0.05) * 0.05;
  });


  const meshPositionY = isMobile ? -1.2 : -2.5;

  return (
    <mesh ref={meshRef} position={[0, meshPositionY, -1.5]} rotation={[-Math.PI / 2.5, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <meshBasicMaterial color="#a044ff" wireframe transparent opacity={0.25} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}


export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const cameraPositionZ = isMobile ? 6.5 : 7.5;

  return (
    <div className="app-root-wrapper">

      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, cameraPositionZ], fov: 65 }}>
          <ambientLight intensity={0.4} />
          <InteractiveStars />
          <MeshWave isMobile={isMobile} />
        </Canvas>
      </div>

      <div className="glow-bg violet-glow"></div>
      <div className="glow-bg cyan-glow"></div>

      <div className="content-overlay">
        <div className="text-section">
          <h1 className="main-title">Mesh Wave</h1>
          <p className="main-subtitle">
            Abstract organic 3D mesh lines flowing smooth. Hover your mouse to interact with the digital fluid surface.
          </p>
          <button className="premium-btn">Explore Live Asset</button>
        </div>
      </div>


      <style>{`
        .app-root-wrapper, .app-root-wrapper * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-root-wrapper {
          width: 100vw;
          height: 100vh;
          background: #030108;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .glow-bg {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }
        .violet-glow {
          top: -10%;
          left: 15%;
          background: #a044ff;
        }
        .cyan-glow {
          bottom: 5%;
          right: 15%;
          background: #00d2ff;
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          pointer-events: none;
        }

        .text-section {
          text-align: center;
          max-width: 650px;
          pointer-events: none;
        }

        .main-title {
          font-size: clamp(2.2rem, 6vw, 4.5rem);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 24px 0;
          text-transform: uppercase;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #ffffff 0%, #a044ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
          padding: 10px 0;
          pointer-events: none;
        }

        .main-subtitle {
          font-size: clamp(0.9rem, 2vw, 1.15rem);
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0 0 35px 0;
          pointer-events: none;
        }

        .premium-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(160, 68, 255, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #ffffff;
          padding: 14px 32px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          pointer-events: auto !important;
          letter-spacing: 0.5px;
          transition: all 0.4s ease;
          box-shadow: 0 4px 20px rgba(160, 68, 255, 0.1);
        }

        .premium-btn:hover {
          background: #a044ff;
          border-color: #a044ff;
          box-shadow: 0 8px 30px rgba(160, 68, 255, 0.4);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .content-overlay {
            justify-content: flex-start;
            padding-top: 10vh; 
          }
          .main-subtitle {
            margin: 0 0 25px 0;
          }
        }
      `}</style>
    </div>
  );
}