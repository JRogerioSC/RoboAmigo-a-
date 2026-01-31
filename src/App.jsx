import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar from "./Avatar.jsx";
import "./App.css";

const URL_RESPONDER = "https://servidor-robo-ia.onrender.com/responder";
const URL_ENSINAR = "https://servidor-robo-ia.onrender.com/ensinar-audio";

/* 🔐 ID ÚNICO */
const getUsuarioId = () => {
  let id = localStorage.getItem("usuarioId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("usuarioId", id);
  }
  return id;
};

function App() {
  const usuarioId = useRef(getUsuarioId());

  const [falando, setFalando] = useState(false);
  const [escutando, setEscutando] = useState(false);

  const [nomeIA, setNomeIA] = useState(() => localStorage.getItem("nomeIA") || "");
  const [nomeFixado, setNomeFixado] = useState(() => !!localStorage.getItem("nomeIA"));

  const [aguardandoEnsino, setAguardandoEnsino] = useState(false);

  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  const nomesFemininos = [
    "ana", "maria", "julia", "juliana", "paula", "carla", "beatriz",
    "lucia", "luiza", "mariana", "camila", "fernanda", "gabriela",
    "leticia", "rafaela", "aline", "bruna", "daniela", "isabela", "sofia"
  ];

  const genero = useMemo(() => {
    if (!nomeIA) return "masculino";
    const n = nomeIA.toLowerCase();
    if (nomesFemininos.some(v => n.includes(v)) || n.endsWith("a")) return "feminino";
    return "masculino";
  }, [nomeIA]);

  /* 🎙️ vozes */
  useEffect(() => {
    const load = () => (voicesRef.current = speechSynthesis.getVoices());
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  /* 🎧 reconhecimento */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Navegador não suporta reconhecimento de voz");
      return;
    }

    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = false;

    r.onresult = async (e) => {
      const texto = e.results[0][0].transcript.toLowerCase().trim();
      setEscutando(false);

      const url = aguardandoEnsino ? URL_ENSINAR : URL_RESPONDER;

      const body = aguardandoEnsino
        ? { usuarioId: usuarioId.current, resposta: texto }
        : { usuarioId: usuarioId.current, texto };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data?.resposta) {
        if (/qual é a resposta/i.test(data.resposta)) {
          setAguardandoEnsino(true);
        } else {
          setAguardandoEnsino(false);
        }
        falar(data.resposta);
      }
    };

    r.onend = () => {
      if (nomeFixado && !falando) {
        setTimeout(() => {
          try {
            r.start();
            setEscutando(true);
          } catch { }
        }, 400);
      }
    };

    recognitionRef.current = r;
  }, [nomeFixado, falando, aguardandoEnsino]);

  const iniciarEscuta = () => {
    if (!nomeFixado || falando || escutando) return;
    recognitionRef.current.start();
    setEscutando(true);
  };

  const falar = (texto) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";

    const pt = voicesRef.current.filter(v => v.lang.includes("pt"));
    u.voice =
      genero === "feminino"
        ? pt.find(v => /female|mulher/i.test(v.name)) || pt[0]
        : pt[0];

    u.onstart = () => setFalando(true);
    u.onend = () => {
      setFalando(false);
      iniciarEscuta();
    };

    speechSynthesis.speak(u);
  };

  const fixarNome = () => {
    if (!nomeIA.trim()) return;
    localStorage.setItem("nomeIA", nomeIA);
    setNomeFixado(true);
  };

  return (
    <div className="container">
      <h2>Nome do amigo(a)</h2>

      <input
        value={nomeIA}
        disabled={nomeFixado}
        onChange={e => setNomeIA(e.target.value)}
      />

      {!nomeFixado && <button onClick={fixarNome}>Confirmar nome</button>}
      {nomeFixado && <p>✅ Nome fixado: {nomeIA}</p>}

      <Canvas style={{ height: 300 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Avatar falando={falando} genero={genero} />
      </Canvas>

      {nomeFixado && (
        <button onClick={iniciarEscuta}>
          {escutando
            ? aguardandoEnsino
              ? "🎓 Aprendendo..."
              : "🎙️ Ouvindo..."
            : "🎤 Falar com o robô"}
        </button>
      )}
    </div>
  );
}

export default App;
