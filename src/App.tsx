// App.tsx
import { Canvas } from '@react-three/fiber';
import { useRef, useState, Suspense, useEffect } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Line } from '@react-three/drei';

// Types
type Position = [number, number, number];
type MousePosition = { x: number; y: number };

interface FloatingObjectProps {
  position: Position;
  onClick: () => void;
}

interface ElectricCoinProps {
  position: [number, number, number];
  onClick: () => void;
}

const useViewportSize = () => {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial call
    updateViewport();

    // Add event listener
    window.addEventListener('resize', updateViewport);

    // Cleanup
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// LightningStrike component
const LightningStrike = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lineRef = useRef<THREE.Group>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const generateLightningPoints = () => {
    const points: THREE.Vector3[] = [];
    const segments = 5;
    
    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = 2;
    points.push(new THREE.Vector3(
      Math.cos(startAngle) * startRadius,
      Math.random() * 2 - 1,
      Math.sin(startAngle) * startRadius
    ));
    
    for (let i = 1; i < segments; i++) {
      const prevPoint = points[i - 1];
      points.push(new THREE.Vector3(
        prevPoint.x * 0.7 + (Math.random() - 0.5) * 0.5,
        prevPoint.y + (Math.random() - 0.5) * 0.5,
        prevPoint.z * 0.7 + (Math.random() - 0.5) * 0.5
      ));
    }
    
    return points;
  };

  useEffect(() => {
    const showStrike = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 150);
    };

    const scheduleNextStrike = () => {
      const delay = Math.random() * 2000 + 1000;
      timeoutRef.current = setTimeout(() => {
        showStrike();
        scheduleNextStrike();
      }, delay);
    };

    scheduleNextStrike();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <group ref={lineRef}>
      {isVisible && (
        <>
          <Line
            points={generateLightningPoints()}
            color="white"
            lineWidth={4}
            opacity={1}
          />
        </>
      )}
    </group>
  );
};

// Cursor follower component
const CursorFollower = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [color, setColor] = useState<string>('rgba(75, 0, 130, 0.3)');
  const lastPos = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX;
      const newY = e.clientY;
      
      const deltaX = newX - lastPos.current.x;
      const deltaY = newY - lastPos.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            setColor('rgba(255, 0, 0, 0.5)');
          } else {
            setColor('rgba(0, 255, 0, 0.5)');
          }
        } else {
          if (deltaY > 0) {
            setColor('rgba(0, 0, 255, 0.5)');
          } else {
            setColor('rgba(255, 165, 0, 0.5)');
          }
        }
      }
      
      setMousePos({ x: newX, y: newY });
      lastPos.current = { x: newX, y: newY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      }}
    >
      <div 
        className="w-32 h-32 rounded-full blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: color,
          boxShadow: `0 0 40px 15px ${color}`
        }}
      />
    </div>
  );
};

// Electric Coin component
const ElectricCoin: React.FC<ElectricCoinProps> = ({ position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
    }
  });

  return (
    <Float
      speed={2.5}
      rotationIntensity={5}
      floatIntensity={0}
      position={position}
    >
      <group>
        <mesh ref={meshRef} onClick={onClick}>
          <cylinderGeometry args={[1.2, 1.2, 0.4, 30]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={3}
            roughness={1}
            emissive="#FFD700"
            emissiveIntensity={0.2}
          />
        </mesh>
        <LightningStrike />
        <LightningStrike />
        <LightningStrike />
      </group>
    </Float>
  );
};

// FloatingObject component
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

// EdgeCube component for background cubes with highlighted edges
const EdgeCube = ({ position, size }: { position: [number, number, number], size: number }) => {
  return (
    <group position={position}>
      {/* Black cube base */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshPhongMaterial 
          color="#413c3c"  // Dark gray base
          shininess={100}
          specular="#333333"  // Lighter specular highlights
          emissive="#0a0a0a"  // Subtle glow
          opacity={1}
          transparent={true}
        />
      </mesh>
      
      {/* Purple edge lines */}
      <group>
        {/* Front vertical edge */}
        <Line 
          points={[
            [size/2, -size/2, size/2],
            [size/2, size/2, size/2]
          ]}
          color="#9333EA"
          lineWidth={2}
        />
        
        {/* Top horizontal edge */}
        <Line 
          points={[
            [-size/2, size/2, size/2],
            [size/2, size/2, size/2]
          ]}
          color="#9333EA"
          lineWidth={2}
        />
        
        {/* Side horizontal edge */}
        <Line 
          points={[
            [size/2, size/2, -size/2],
            [size/2, size/2, size/2]
          ]}
          color="#9333EA"
          lineWidth={2}
        />
      </group>
    </group>
  );
};



const Scene: React.FC<SceneProps> = ({ onItemClick }) => {
  const viewport = useViewportSize();
  
  // Calculate scale factor based on viewport width
  const getScale = () => {
    if (viewport.width <= 380) return 0.5;  // Very small devices
    if (viewport.width <= 640) return 0.7;  // Small devices
    if (viewport.width <= 768) return 0.85; // Medium devices
    return 1; // Default scale for larger devices
  };

  // Adjust positions based on viewport size
  const getAdjustedPosition = (basePosition: [number, number, number]): [number, number, number] => {
    const scale = getScale();
    return [
      basePosition[0] * scale,
      basePosition[1] * scale,
      basePosition[2]
    ];
  };

  // Calculate size based on viewport
  const getAdjustedSize = (baseSize: number): number => {
    return baseSize * getScale();
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      {/* Background Cubes with responsive positioning */}
      <EdgeCube 
        position={getAdjustedPosition([-12, 8, -5])} 
        size={getAdjustedSize(1.5)} 
      />
      <EdgeCube 
        position={getAdjustedPosition([13, 3, -5])} 
        size={getAdjustedSize(1.2)} 
      />
      <EdgeCube 
        position={getAdjustedPosition([-7, -8, -5])} 
        size={getAdjustedSize(1.3)} 
      />
      <EdgeCube 
        position={getAdjustedPosition([16, -9, -5])} 
        size={getAdjustedSize(1.4)} 
      />

      {/* Floating Objects with responsive positioning */}
      <FloatingObject 
        position={getAdjustedPosition([-6, -2, 0])} 
        onClick={() => onItemClick(1)} 
      />
      <FloatingObject 
        position={getAdjustedPosition([5, 3, 0])} 
        onClick={() => onItemClick(2)} 
      />
      <FloatingObject 
        position={getAdjustedPosition([1, -4, 0])} 
        onClick={() => onItemClick(3)} 
      />
      <FloatingObject 
        position={getAdjustedPosition([-5, 3, 0])} 
        onClick={() => onItemClick(5)} 
      />
      <FloatingObject 
        position={getAdjustedPosition([5, -3, 0])} 
        onClick={() => onItemClick(6)} 
      />
      
      <ElectricCoin 
        position={getAdjustedPosition([0, 1, 0])} 
        onClick={() => onItemClick(4)} 
      />
    </>
  );
};

// Main App component
const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const viewport = useViewportSize();

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="radial-glow-overlay" />
      
      <div className="fixed inset-0 pointer-events-none bg-black" />

      <CursorFollower />

      <Canvas
        camera={{ 
          position: [0, 0, viewport.width <= 768 ? 12 : 10],
          fov: viewport.width <= 768 ? 85 : 75
         }}
        style={{ 
          background: 'transparent',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <Suspense fallback={null}>
          <Scene onItemClick={setSelectedItem} />
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="assets/logo (2).png"
              alt="Grafilab Logo" 
              className="w-21 h-21 sm:w-21 sm:h-21 object-contain"
            />
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 flex flex-col items-center gap-4 pointer-events-auto w-full px-4 sm:px-0 sm:w-auto">
          <h2 className="text-white text-3xl font-medium">Powering The Future of AGI</h2>
          <button
            onClick={() => navigate('/app')}
            className="rainbow-button hover:scale-105 transition-transform"
          >
            Launch APP
          </button>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 text-white z-50 pointer-events-auto"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <Dialog
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-900/95 text-white rounded-xl p-4 sm:p-6 w-full max-w-[320px] sm:max-w-sm backdrop-blur-xl shadow-[0_0_15px_5px_rgba(98,6,173,0.8)]">
            <Dialog.Title className="text-lg sm:text-xl font-bold mb-4">
              Item Details
            </Dialog.Title>
            <p className="text-sm sm:text-base">Details for item {selectedItem}</p>
            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="close-button"
        >
          &times;
        </button>

        <ul className="px-4 sm:px-0">
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