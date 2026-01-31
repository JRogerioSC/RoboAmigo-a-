import { useState } from "react";
import "./Login.css";


const URL_LOGIN = "https://servidor-robo-ia.onrender.com/login";

export default function Login({ onLogin }) {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");

    const entrar = async () => {
        if (!usuario || !senha) return;

        const res = await fetch(URL_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await res.json();

        if (data.usuarioId) {
            localStorage.setItem("usuarioId", data.usuarioId);
            onLogin(data.usuarioId);
        } else {
            alert("Usuário ou senha inválidos");
        }
    };

    return (
        <div className="container">
            <h2>🔐 Login</h2>

            <input
                placeholder="Usuário"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
            />

            <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
            />

            <button onClick={entrar}>Entrar</button>
        </div>
    );
}
