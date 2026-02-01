import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function AvatarRealista({
    falando,
    humor = "neutro",
    genero,
    estado = "idle", // idle | andar | correr
    velocidade = 0.02,
}) {
    const grupo = useRef();
    const cabeca = useRef();
    const boca = useRef();
    const sobrancelhaE = useRef();
    const sobrancelhaD = useRef();
    const olhoE = useRef();
    const olhoD = useRef();
    const bracoD = useRef();
    const bracoE = useRef();
    const pernaE = useRef();
    const pernaD = useRef();
    const tronco = useRef();

    const feminino = genero === "feminino";

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        const andando = estado === "andar";
        const correndo = estado === "correr";

        const freq = andando ? 6 : correndo ? 10 : 0;
        const impacto = andando ? 0.08 : correndo ? 0.18 : 0;
        const ampPerna = andando ? 0.9 : correndo ? 1.4 : 0;
        const ampBraco = andando ? 0.6 : correndo ? 1.2 : 0;

        const passo = Math.sin(t * freq);

        /* Deslocamento */
        if (grupo.current && (andando || correndo)) {
            grupo.current.position.z -= velocidade * (correndo ? 2.2 : 1);
            grupo.current.position.y = -1.8 + Math.abs(passo) * impacto;
            grupo.current.rotation.x = correndo ? -0.15 : 0;
        } else if (grupo.current) {
            grupo.current.position.y = -1.8;
            grupo.current.rotation.x = 0;
        }

        /* Pernas */
        if (pernaE.current && pernaD.current) {
            pernaE.current.rotation.x = passo * ampPerna;
            pernaD.current.rotation.x = -passo * ampPerna;
        }

        /* Braços */
        if (bracoE.current && bracoD.current) {
            bracoE.current.rotation.x = -passo * ampBraco;
            bracoD.current.rotation.x = passo * ampBraco;
        }

        /* Respiração */
        if (tronco.current) {
            tronco.current.scale.y =
                1 + Math.sin(t * (correndo ? 3 : 1.5)) * (correndo ? 0.05 : 0.02);
        }

        /* Cabeça */
        if (cabeca.current) {
            cabeca.current.rotation.x =
                falando && !correndo ? Math.sin(t * 3) * 0.08 : 0;
            cabeca.current.rotation.y = Math.sin(t * 1.2) * 0.1;
        }

        /* Boca */
        if (boca.current) {
            boca.current.scale.y = falando
                ? 1.4 + Math.sin(t * 18) * 0.4
                : humor === "feliz"
                    ? 0.6
                    : 0.25;
        }

        /* Sobrancelhas */
        if (sobrancelhaE.current && sobrancelhaD.current) {
            const expressao =
                humor === "feliz" ? 0.15 : humor === "curioso" ? 0.25 : 0;
            sobrancelhaE.current.position.y = 0.45 + expressao;
            sobrancelhaD.current.position.y = 0.45 + expressao;
        }

        /* Piscar */
        const piscar = Math.sin(t * 2.8) > 0.96;
        if (olhoE.current && olhoD.current) {
            olhoE.current.scale.y = piscar ? 0.1 : 1;
            olhoD.current.scale.y = piscar ? 0.1 : 1;
        }
    });

    return (
        <group ref={grupo} position={[0, -1.8, 0]}>
            {/* Cabeça */}
            <group ref={cabeca} position={[0, 3, 0]}>
                <mesh>
                    <sphereGeometry args={[0.75, 64, 64]} />
                    <meshStandardMaterial
                        color={feminino ? "#fbcfe8" : "#bfdbfe"}
                        roughness={0.35}
                    />
                </mesh>

                {/* Olhos */}
                <mesh ref={olhoE} position={[-0.22, 0.2, 0.7]}>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh ref={olhoD} position={[0.22, 0.2, 0.7]}>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>

                {/* Pupilas */}
                <mesh position={[-0.22, 0.18, 0.78]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0.22, 0.18, 0.78]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* Sobrancelhas */}
                <mesh ref={sobrancelhaE} position={[-0.22, 0.45, 0.72]}>
                    <boxGeometry args={[0.2, 0.04, 0.05]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>
                <mesh ref={sobrancelhaD} position={[0.22, 0.45, 0.72]}>
                    <boxGeometry args={[0.2, 0.04, 0.05]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>

                {/* Boca */}
                <mesh ref={boca} position={[0, -0.35, 0.75]}>
                    <boxGeometry args={[0.35, 0.1, 0.05]} />
                    <meshStandardMaterial color="#111827" />
                </mesh>
            </group>

            {/* Tronco */}
            <mesh ref={tronco} position={[0, 1.7, 0]}>
                <boxGeometry args={[1.1, 1.6, 0.6]} />
                <meshStandardMaterial color={feminino ? "#ec4899" : "#2563eb"} />
            </mesh>

            {/* Braços */}
            <mesh ref={bracoE} position={[-1, 1.7, 0]}>
                <boxGeometry args={[0.35, 1.3, 0.35]} />
                <meshStandardMaterial color="#93c5fd" />
            </mesh>
            <mesh ref={bracoD} position={[1, 1.7, 0]}>
                <boxGeometry args={[0.35, 1.3, 0.35]} />
                <meshStandardMaterial color="#93c5fd" />
            </mesh>

            {/* Pernas */}
            <mesh ref={pernaE} position={[-0.35, 0.3, 0]}>
                <boxGeometry args={[0.4, 1.3, 0.4]} />
                <meshStandardMaterial color="#1e3a8a" />
            </mesh>
            <mesh ref={pernaD} position={[0.35, 0.3, 0]}>
                <boxGeometry args={[0.4, 1.3, 0.4]} />
                <meshStandardMaterial color="#1e3a8a" />
            </mesh>
        </group>
    );
}
