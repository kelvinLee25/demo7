import { Canvas } from '@react-three/fiber';
import { useRef, useState, Suspense, useEffect } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Line } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import Dialog from './Dialog';

// Types

type MousePosition = { x: number; y: number };

interface SceneProps {
  onItemClick: (id: number, position: { x: number, y: number }) => void;
}

interface FloatingImageProps {
  position: [number, number, number];
  onClick: (event: ThreeEvent<MouseEvent>) => void;
  imagePath: string;
}

interface ElectricTokenProps {
  position: [number, number, number];
  onClick: (event: ThreeEvent<MouseEvent>) => void;
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
const ElectricToken: React.FC<ElectricTokenProps> = ({ position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/coin1.png', (loadedTexture) => {
      loadedTexture.encoding = THREE.sRGBEncoding;
      // Reduce texture intensity
      loadedTexture.premultiplyAlpha = true;
      setTexture(loadedTexture);
    });
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Only rotate around Y axis (left to right)
      meshRef.current.rotation.y += 0.008; // Reduced rotation speed
      
      // Reset other rotations to maintain vertical position
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.z = 0;
    }
  });

  return (
    <Float
      speed={1.5} // Reduced from 2.5
      rotationIntensity={0} // Set to 0 to prevent Float component from adding additional rotation
      floatIntensity={0.5} // Reduced float intensity
      position={position}
    >
      <group>
        {texture && (
          <mesh ref={meshRef} onClick={onClick}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial 
              map={texture}
              transparent={true}
              side={THREE.DoubleSide}
              metalness={1.8}
              roughness={0.9} 

            />
          </mesh>
        )}
        {/* Reduced number of lightning effects and their intensity */}
        <group scale={[0.7, 0.7, 0.7]}> {/* Scale down lightning effects */}
          <LightningStrike />
          <LightningStrike />
        </group>
      </group>
    </Float>
  );
};

// FloatingObject component
const FloatingImage: React.FC<FloatingImageProps> = ({ position, onClick, imagePath }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imagePath, (loadedTexture) => {
      loadedTexture.encoding = THREE.sRGBEncoding;
      setTexture(loadedTexture);
    });
  }, [imagePath]);

  return (
    <Float
      speed={2.5}
      rotationIntensity={1}
      floatIntensity={2}
      position={position}
    >
      {texture && (
        <mesh ref={meshRef} onClick={onClick}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            side={THREE.DoubleSide}

          />
        </mesh>
      )}
    </Float>
  );
};

// Fixed Background Image component
const FixedBackgroundImage: React.FC<{
  position: [number, number, number];
  imagePath: string;
}> = ({ position, imagePath }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imagePath, (loadedTexture) => {
      loadedTexture.encoding = THREE.sRGBEncoding;
      setTexture(loadedTexture);
    });
  }, [imagePath]);

  return (
    <mesh position={position}>
      <planeGeometry args={[4, 4]} />
      {texture && (
        <meshStandardMaterial
          map={texture}
          transparent={true}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
};

// Updated Scene component
const Scene: React.FC<SceneProps> = ({ onItemClick }) => {
  const viewport = useViewportSize();
  
  const getScale = () => {
    if (viewport.width <= 380) return 0.5;
    if (viewport.width <= 640) return 0.7;
    if (viewport.width <= 768) return 0.85;
    return 1;
  };

  const getAdjustedPosition = (basePosition: [number, number, number]): [number, number, number] => {
    const scale = getScale();
    return [
      basePosition[0] * scale,
      basePosition[1] * scale,
      basePosition[2]
    ];
  };

  const handleClick = (id: number, event: ThreeEvent<MouseEvent>) => {
    const mesh = event.object as THREE.Mesh;
    const camera = event.camera as THREE.Camera;
    
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(mesh.matrixWorld);
    
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;
    
    vector.project(camera);
    
    const x = (vector.x * widthHalf) + widthHalf;
    const y = -(vector.y * heightHalf) + heightHalf;
    
    onItemClick(id, { x, y });
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      {/* Fixed Background Images */}
      <FixedBackgroundImage 
        position={getAdjustedPosition([-18.5, 9, -5])}
        imagePath="assets/Group (1).png"
      />
      <FixedBackgroundImage 
        position={getAdjustedPosition([18, 3, -5])}
        imagePath="assets/Group (1).png"
      />
      <FixedBackgroundImage 
        position={getAdjustedPosition([-12, -9.5, -5])}
        imagePath="assets/Rectangle.png"
      />
      <FixedBackgroundImage 
        position={getAdjustedPosition([16, -10, -5])}
        imagePath="assets/Group (2).png"
      />

      {/* Interactive Floating Images */}
      <FloatingImage 
        position={getAdjustedPosition([-8, -3, 0])} 
        onClick={(event) => handleClick(1, event)}
        imagePath="assets/item1.png"
      />
      <FloatingImage 
        position={getAdjustedPosition([9, 4, 0])} 
        onClick={(event) => handleClick(2, event)}
        imagePath="assets/item4.png"
      />
      <FloatingImage 
        position={getAdjustedPosition([1, -4.5, 0])} 
        onClick={(event) => handleClick(3, event)}
        imagePath="assets/item2.png"
      />
      <FloatingImage 
        position={getAdjustedPosition([-9, 3, 0])} 
        onClick={(event) => handleClick(5, event)}
        imagePath="assets/item5.png"
      />
      <FloatingImage 
        position={getAdjustedPosition([7, -2, 0])} 
        onClick={(event) => handleClick(6, event)}
        imagePath="assets/item3.png"
      />
      
      <ElectricToken 
        position={getAdjustedPosition([0, 1, 0])} 
        onClick={(event) => handleClick(4, event)} 
      />
    </>
  );
};

// Main App component
const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const viewport = useViewportSize();

  const handleItemClick = (id: number, position: { x: number, y: number }) => {
    // Set both states simultaneously
    setSelectedItem(id);
    setClickPosition(position);
  };
  
  // Clear both states when closing
  const handleClose = () => {
    setSelectedItem(null);
    setClickPosition(undefined);
  };

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
          <Scene onItemClick={handleItemClick} />
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="assets/Group 28360.png"
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
       isOpen={selectedItem !== null}
       onClose={handleClose}
       selectedItem={selectedItem}
       clickPosition={clickPosition}
       />

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