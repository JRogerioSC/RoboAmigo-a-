import { useEffect, useRef, useState } from "react";

function Robo() {
    const [ouvindo, setOuvindo] = useState(false);
    const [falando, setFalando] = useState(false);
    const nomeIA = localStorage.getItem("nomeIA") || "Amigo";

    function falarTexto(texto) {
        const synth = window.speechSynthesis;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = "pt-BR";

        utterance.onstart = () => setFalando(true);
        utterance.onend = () => {
            setFalando(false);
            iniciarReconhecimento();
        };

        synth.speak(utterance);
    }

    async function enviarParaIA(texto) {
        const res = await fetch("http://localhost:3001/responder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto, nomeIA })
        });

        const data = await res.json();
        falarTexto(data.resposta);
    }

    function iniciarReconhecimento() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";

        recognition.onstart = () => setOuvindo(true);

        recognition.onresult = (event) => {
            const texto = event.results[0][0].transcript;
            enviarParaIA(texto);
        };

        recognition.onend = () => setOuvindo(false);
        recognition.start();
    }

    useEffect(() => {
        iniciarReconhecimento();
    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <div className={`robo ${ouvindo ? "ouvindo" : ""}`}>
                <div className="olhos">
                    <span></span>
                    <span></span>
                </div>
                <div className={`boca ${falando ? "falando" : ""}`}></div>
            </div>

            <p style={{ opacity: 0.6 }}>
                {ouvindo ? "Ouvindo..." : falando ? "Falando..." : ""}
            </p>
        </div>
    );
}

export default Robo;

