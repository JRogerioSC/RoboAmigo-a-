import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar from "./Avatar.jsx";
import "./App.css";

function App() {
  const [falando, setFalando] = useState(false);

  const [nomeIA, setNomeIA] = useState(() => {
    return localStorage.getItem("nomeIA") || "";
  });

  const [nomeFixado, setNomeFixado] = useState(() => {
    return !!localStorage.getItem("nomeIA");
  });

  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  const nomesFemininos = [
    "ana", "maria", "julia", "juliana", "paula", "carla", "beatriz",
    "lucia", "luiza", "mariana", "camila", "fernanda", "gabriela",
    "leticia", "rafaela", "aline", "bruna", "daniela", "isabela", "sofia"
  ];

  // 🔑 GÊNERO DEFINIDO UMA ÚNICA VEZ
  const genero = useMemo(() => {
    if (!nomeIA) return "masculino";

    const nome = nomeIA.toLowerCase();

    if (
      nomesFemininos.some(n => nome.includes(n)) ||
      nome.endsWith("a")
    ) {
      return "feminino";
    }

    return "masculino";
  }, [nomeIA]);

  // carregar vozes
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // reconhecimento de voz
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      if (falando || !nomeFixado) return;

      const texto =
        event.results[event.results.length - 1][0].transcript;

      try {
        const response = await fetch("https://servidor-robo-ia.onrender.com/responder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto, nomeIA }),
        });

        const data = await response.json();
        if (data.resposta) {
          falar(data.resposta);
        }
      } catch (err) {
        console.error("Erro ao falar com backend", err);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [falando, nomeFixado, nomeIA]);

  const fixarNome = () => {
    if (!nomeIA.trim()) return;
    localStorage.setItem("nomeIA", nomeIA);
    setNomeFixado(true);
  };

  const falar = (texto) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";

    const vozesPT = voicesRef.current.filter(v =>
      v.lang.toLowerCase().includes("pt")
    );

    const vozFeminina = vozesPT.find(v =>
      /female|feminina|google português/i.test(v.name)
    );

    const vozMasculina = vozesPT.find(v =>
      /male|masculina/i.test(v.name)
    );

    utterance.voice =
      genero === "feminino"
        ? vozFeminina || vozesPT[0]
        : vozMasculina || vozesPT[0];

    utterance.onstart = () => setFalando(true);
    utterance.onend = () => setFalando(false);

    synth.speak(utterance);
  };

  return (
    <div className="container">
      <h2>Nome do amigo(a)</h2>

      <input
        value={nomeIA}
        onChange={(e) => setNomeIA(e.target.value)}
        disabled={nomeFixado}
      />

      {!nomeFixado && (
        <button onClick={fixarNome}>Confirmar nome</button>
      )}

      {nomeFixado && <p>✅ Nome fixado: {nomeIA}</p>}

      <Canvas style={{ height: 300 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Avatar falando={falando} genero={genero} />
      </Canvas>

      <p>🎙️ Ouvindo você...</p>
    </div>
  );
}

export default App;
