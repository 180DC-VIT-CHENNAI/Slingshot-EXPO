interface Props {
  x: number
  y: number
}

export default function Target({ x, y }: Props) {
  return (
    <group position={[x, y, 0]}>
      {/* outer glow */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[340, 150]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>
      {/* white platform */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[300, 112, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* green inset */}
      <mesh position={[0, 0, 6.5]}>
        <boxGeometry args={[284, 100, 2]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.5} />
      </mesh>
      {/* slot (where zero lands) */}
      <mesh position={[0, 0, 8]}>
        <boxGeometry args={[56, 56, 4]} />
        <meshStandardMaterial
          color="#1b5e20"
          emissive="#7cfc00"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* slot glow ring */}
      <mesh position={[0, 0, 9]}>
        <ringGeometry args={[28, 34, 32]} />
        <meshBasicMaterial color="#7cfc00" transparent opacity={0.4} side={2} />
      </mesh>
    </group>
  )
}
