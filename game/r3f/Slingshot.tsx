interface Props {
  x: number
  y: number
}

export default function Slingshot({ x, y }: Props) {
  const brown = '#5d4037'
  const dark = '#3e2723'
  return (
    <group position={[x, y, 0]}>
      {/* shadow ellipse */}
      <mesh position={[2, 10, -1]}>
        <circleGeometry args={[26, 24]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.25} />
      </mesh>
      {/* trunk */}
      <mesh position={[0, -32, 0]} castShadow>
        <boxGeometry args={[16, 64, 16]} />
        <meshStandardMaterial color={brown} roughness={0.85} />
      </mesh>
      {/* trunk highlight */}
      <mesh position={[-2, -32, 8.1]}>
        <boxGeometry args={[4, 60, 1]} />
        <meshStandardMaterial color="#795548" roughness={0.7} />
      </mesh>
      {/* left fork */}
      <mesh position={[-11, -66, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[9, 28, 9]} />
        <meshStandardMaterial color={dark} roughness={0.85} />
      </mesh>
      {/* right fork */}
      <mesh position={[11, -66, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[9, 28, 9]} />
        <meshStandardMaterial color={dark} roughness={0.85} />
      </mesh>
      {/* fork tips */}
      <mesh position={[-11, -80, 0]} castShadow>
        <sphereGeometry args={[5, 12, 12]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <mesh position={[11, -80, 0]} castShadow>
        <sphereGeometry args={[5, 12, 12]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
    </group>
  )
}
