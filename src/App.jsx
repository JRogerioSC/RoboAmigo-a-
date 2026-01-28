import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar from "./Avatar.jsx";
import "./App.css";

const URL_SERVIDOR = "https://servidor-robo-ia.onrender.com/responder";
const URL_TREINAR = "https://servidor-robo-ia.onrender.com/treinar";

function App() {
  const [falando, setFalando] = useState(false);
  const [escutando, setEscutando] = useState(false);

  const [nomeIA, setNomeIA] = useState(() => localStorage.getItem("nomeIA") || "");
  const [nomeFixado, setNomeFixado] = useState(() => !!localStorage.getItem("nomeIA"));

  const [mostrarPainel, setMostrarPainel] = useState(false);
  const [senha, setSenha] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [respostaManual, setRespostaManual] = useState("");

  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  const nomesFemininos = [
    "ana", "maria", "julia", "juliana", "paula", "carla", "beatriz", "lucia",
    "luiza", "mariana", "camila", "fernanda", "gabriela", "leticia", "rafaela",
    "aline", "bruna", "daniela", "isabela", "sofia"
  ];

  const genero = useMemo(() => {
    if (!nomeIA) return "masculino";
    const n = nomeIA.toLowerCase();
    if (nomesFemininos.some(v => n.includes(v)) || n.endsWith("a")) return "feminino";
    return "masculino";
  }, [nomeIA]);

  // 🎙️ vozes
  useEffect(() => {
    const load = () => (voicesRef.current = speechSynthesis.getVoices());
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  // 🎧 reconhecimento
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Navegador não suporta reconhecimento de voz");

    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = true;

    r.onresult = async (e) => {
      const texto = e.results[e.results.length - 1][0].transcript;
      setEscutando(false);

      const res = await fetch(URL_SERVIDOR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto })
      });

      const data = await res.json();
      if (data.resposta) falar(data.resposta);
    };

    r.onend = () => {
      if (nomeFixado && !falando) {
        setTimeout(() => {
          try { r.start(); setEscutando(true); } catch { }
        }, 400);
      }
    };

    recognitionRef.current = r;
  }, [nomeFixado, falando]);

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
    u.voice = genero === "feminino" ? pt.find(v => /female/i.test(v.name)) || pt[0] : pt[0];

    u.onstart = () => setFalando(true);
    u.onend = () => { setFalando(false); iniciarEscuta(); };
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

      <input value={nomeIA} disabled={nomeFixado} onChange={e => setNomeIA(e.target.value)} />
      {!nomeFixado && <button onClick={fixarNome}>Confirmar nome</button>}
      {nomeFixado && <p>✅ Nome fixado: {nomeIA}</p>}

      <Canvas style={{ height: 300 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Avatar falando={falando} genero={genero} />
      </Canvas>

      {nomeFixado && (
        <button onClick={iniciarEscuta}>
          {escutando ? "🎙️ Ouvindo..." : "🎤 Falar com o robô"}
        </button>
      )}

      {/* 🤖 Robo flutuante */}
      <div className="robo-flutuante" onClick={() => setMostrarPainel(true)}>🤖</div>

      {mostrarPainel && (
        <div className="painel">
          {!localStorage.getItem("painel") ? (
            <>
              <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
              <button onClick={() => {
                if (senha === "689033rogerio") localStorage.setItem("painel", "ok");
                else alert("Senha errada");
              }}>Entrar</button>
            </>
          ) : (
            <>
              <input placeholder="Pergunta" value={pergunta} onChange={e => setPergunta(e.target.value)} />
              <textarea placeholder="Resposta" value={respostaManual} onChange={e => setRespostaManual(e.target.value)} />
              <button onClick={async () => {
                await fetch(URL_TREINAR, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ pergunta, resposta: respostaManual })
                });
                setPergunta(""); setRespostaManual("");
                alert("Treinado!");
              }}>Salvar</button>
              <button onClick={() => { localStorage.removeItem("painel"); setMostrarPainel(false) }}>Fechar</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
