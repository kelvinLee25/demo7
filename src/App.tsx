import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { useRef, useState, Suspense, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera, Float, Text3D, Grid } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Define types
type Position = [number, number, number];
type MousePosition = { x: number; y: number };

interface FloatingObjectProps {
  position: Position;
  onClick: () => void;
}

// Cursor follower component
const CursorFollower = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="rainbow-cursor"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        animation: 'rainbow 5s linear infinite',
      }}
    />
  );
};

// Floating Coin component
const FloatingCoin: React.FC<FloatingObjectProps> = ({ position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2;
    }
  }, []);

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1.5}
      position={position}
    >
      <mesh ref={meshRef} onClick={onClick}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={1}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

// FloatingObject component with increased size
const FloatingObject: React.FC<FloatingObjectProps> = ({ position, onClick }) => {
  return (
    <Float
      speed={2.5}
      rotationIntensity={1}
      floatIntensity={2}
      position={position}
    >
      <mesh onClick={onClick}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#9333EA"
          emissive="#9333EA"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

// Scene component
interface SceneProps {
  onItemClick: (id: number) => void;
}

const Scene: React.FC<SceneProps> = ({ onItemClick }) => {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      {/* Floating Objects */}
      <FloatingObject position={[-4, 2, 0]} onClick={() => onItemClick(1)} />
      <FloatingObject position={[4, 2, 0]} onClick={() => onItemClick(2)} />
      <FloatingObject position={[0, -2, 0]} onClick={() => onItemClick(3)} />
      
      {/* Floating Coin above text */}
      <FloatingCoin position={[0, 4, 0]} onClick={() => onItemClick(4)} />
    </>
  );
};

// Main App component
const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-radial from-blue-900 via-blue-950 to-black" />

      {/* Cursor Follower */}
      <CursorFollower />

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene onItemClick={setSelectedItem} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        {/* Logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <h1 className="text-white text-3xl font-bold">Grafilab</h1>
        </div>
        
        {/* Tagline and Launch Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 flex flex-col items-center gap-4 pointer-events-auto">
          <h2 className="text-white text-3xl font-medium">Powering The Future of AGI</h2>
          <button
            onClick={() => navigate('/app')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
          >
            Launch APP
          </button>
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 text-white z-50 pointer-events-auto"
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>
      </div>

      {/* Modal */}
      <Dialog
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-900 text-white rounded-xl p-6 max-w-sm">
            <Dialog.Title className="text-xl font-bold mb-4">
              Item Details
            </Dialog.Title>
            <p>Details for item {selectedItem}</p>
            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-lg"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="close-button"
        >
          &times;
        </button>

        <ul>
          <li><a href="#public-sales">Public Sales</a></li>
          <li><a href="#solutions">Solutions</a></li>
          <li><a href="#docs">Docs</a></li>
          <li><a href="#partnership">Partnership</a></li>
        </ul>
      </div>
    </div>
  );
};

export default App;