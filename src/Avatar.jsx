import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Avatar({ genero, falando }) {
    const grupo = useRef();
    const boca = useRef();
    const olhoE = useRef();
    const olhoD = useRef();
    const pupilaE = useRef();
    const pupilaD = useRef();

    const bocaY = useRef(-0.35);

    const blinkTimer = useRef(0);
    const blinkingEye = useRef("both");

    useFrame(({ clock }, delta) => {
        const t = clock.getElapsedTime();

        // Cabeça
        if (grupo.current) {
            grupo.current.rotation.y = Math.sin(t * 0.6) * 0.15;
            grupo.current.rotation.x = Math.sin(t * 0.4 + 1) * 0.08;
        }

        // Boca
        if (boca.current) {
            if (falando) {
                const osc = Math.abs(Math.sin(t * 7));
                const abertura = THREE.MathUtils.lerp(0.05, 0.40, osc);

                boca.current.scale.y = THREE.MathUtils.lerp(
                    boca.current.scale.y,
                    abertura,
                    0.45
                );

                boca.current.position.y = THREE.MathUtils.lerp(
                    boca.current.position.y,
                    bocaY.current - abertura * 0.18,
                    0.45
                );
            } else {
                boca.current.scale.y = THREE.MathUtils.lerp(
                    boca.current.scale.y,
                    0.08,
                    0.20
                );

                boca.current.position.y = THREE.MathUtils.lerp(
                    boca.current.position.y,
                    bocaY.current,
                    0.20
                );
            }
        }

        // Piscar
        blinkTimer.current += delta;

        if (blinkTimer.current > 2.5 + Math.random() * 3) {
            blinkTimer.current = 0;
            blinkingEye.current =
                Math.random() < 0.15 ? "left" :
                    Math.random() < 0.3 ? "right" :
                        "both";
        }

        const closeTime = 0.08;
        const openTime = 0.12;
        const total = closeTime + openTime;

        let blink = 0;
        if (blinkTimer.current < total) {
            if (blinkTimer.current < closeTime) {
                blink = THREE.MathUtils.smoothstep(blinkTimer.current / closeTime, 0, 1);
            } else {
                blink = 1 - THREE.MathUtils.smoothstep(
                    (blinkTimer.current - closeTime) / openTime,
                    0,
                    1
                );
            }
        }

        const eyeScale = THREE.MathUtils.lerp(1, 0.05, blink);
        if (olhoE.current && olhoD.current) {
            olhoE.current.scale.y =
                blinkingEye.current === "left" || blinkingEye.current === "both"
                    ? eyeScale
                    : 1;
            olhoD.current.scale.y =
                blinkingEye.current === "right" || blinkingEye.current === "both"
                    ? eyeScale
                    : 1;
        }

        // Pupilas
        const lookX = Math.sin(t * 0.7) * 0.03;
        const lookY = Math.sin(t * 0.9) * 0.02;

        if (pupilaE.current && pupilaD.current) {
            pupilaE.current.position.set(-0.35 + lookX, 0.18 + lookY, 0.95);
            pupilaD.current.position.set(0.35 + lookX, 0.18 + lookY, 0.95);
        }
    });

    const feminino = genero === "feminino";

    return (
        <group ref={grupo}>
            {/* Cabeça */}
            <mesh>
                <sphereGeometry args={[1, 48, 48]} />
                <meshStandardMaterial
                    color={feminino ? "#f9a8d4" : "#60a5fa"}
                    roughness={0.35}
                />
            </mesh>

            {/* =========================
                CABELO FEMININO COMPRIDO
            ========================= */}
            {feminino && (
                <group position={[0, 0.1, -0.05]}>
                    {/* Parte de trás */}
                    <mesh position={[0, -0.4, -0.5]}>
                        <capsuleGeometry args={[0.9, 1.4, 8, 16]} />
                        <meshStandardMaterial color="#3b2f2f" roughness={0.8} />
                    </mesh>

                    {/* Mecha esquerda */}
                    <mesh position={[-0.7, -0.3, 0.2]} rotation={[0, 0, 0.2]}>
                        <capsuleGeometry args={[0.18, 1.1, 6, 12]} />
                        <meshStandardMaterial color="#3b2f2f" />
                    </mesh>

                    {/* Mecha direita */}
                    <mesh position={[0.7, -0.3, 0.2]} rotation={[0, 0, -0.2]}>
                        <capsuleGeometry args={[0.18, 1.1, 6, 12]} />
                        <meshStandardMaterial color="#3b2f2f" />
                    </mesh>
                </group>
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

            <mesh ref={pupilaE} position={[-0.35, 0.18, 0.95]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            <mesh ref={pupilaD} position={[0.35, 0.18, 0.95]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Boca */}
            <mesh ref={boca} position={[0, -0.35, 0.9]}>
                <boxGeometry args={[0.45, 0.2, 0.05]} />
                <meshStandardMaterial color="#111827" />
            </mesh>
        </group>
    );
}
