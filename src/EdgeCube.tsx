import { Line } from '@react-three/drei';

interface EdgeCubeProps {
  position: [number, number, number];
  size: number;
}

const EdgeCube: React.FC<EdgeCubeProps> = ({ position, size }) => {
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

export default EdgeCube;