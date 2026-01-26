import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Avatar({ falando, genero }) {
    const boca = useRef();
    const olhoE = useRef();
    const olhoD = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // Anima boca
        if (boca.current) {
            boca.current.scale.y = falando
                ? 1.2 + Math.sin(t * 20) * 0.3
                : 0.2;
        }

        // Piscar olhos
        const piscar = Math.sin(t * 2) > 0.95;
        if (olhoE.current && olhoD.current) {
            olhoE.current.scale.y = piscar ? 0.1 : 1;
            olhoD.current.scale.y = piscar ? 0.1 : 1;
        }
    });

    const feminino = genero === "feminino";

    return (
        <group position={[0, 0, 0]}>
            {/* Cabeça */}
            <mesh>
                <sphereGeometry args={[1, 48, 48]} />
                <meshStandardMaterial
                    color={feminino ? "#f9a8d4" : "#60a5fa"}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Cabelo */}
            {feminino ? (
                // Cabelo feminino
                <mesh position={[0, 0.7, 0]}>
                    <sphereGeometry args={[1.05, 32, 32]} />
                    <meshStandardMaterial color="#7c2d12" />
                </mesh>
            ) : (
                // Cabelo masculino
                <mesh position={[0, 0.8, 0]}>
                    <boxGeometry args={[1.2, 0.4, 1.2]} />
                    <meshStandardMaterial color="#1f2933" />
                </mesh>
            )}

            {/* Olhos */}
            <mesh ref={olhoE} position={[-0.35, 0.2, 0.85]}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>

            <mesh ref={olhoD} position={[0.35, 0.2, 0.85]}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Pupilas */}
            <mesh position={[-0.35, 0.18, 0.95]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            <mesh position={[0.35, 0.18, 0.95]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Boca */}
            <mesh
                ref={boca}
                position={[0, -0.35, 0.9]}
                scale={[feminino ? 0.9 : 1.1, 1, 1]}
            >
                <boxGeometry args={[0.45, 0.1, 0.05]} />
                <meshStandardMaterial color="#111827" />
            </mesh>

            {/* Queixo mais forte no masculino */}
            {!feminino && (
                <mesh position={[0, -0.8, 0.6]}>
                    <boxGeometry args={[0.6, 0.25, 0.6]} />
                    <meshStandardMaterial color="#3b82f6" />
                </mesh>
            )}
        </group>
    );
}
