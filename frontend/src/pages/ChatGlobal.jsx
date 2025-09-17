// src/pages/ChatGlobal.jsx

import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3006";

function decodeJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

const getStoredUserName = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    try {
        const parsed = JSON.parse(raw);
        return (
            parsed?.name ||
            parsed?.username ||
            (parsed?.email ? parsed.email.split("@")[0] : "")
        );
    } catch {
        return raw;
    }
};

const genId = () =>
    crypto?.randomUUID?.() ||
    Date.now().toString(36) + Math.random().toString(36).slice(2);

export default function ChatGlobal() {
    const socketRef = useRef(null); // ✅ ahora existe
    const seenIdsRef = useRef(new Set()); // para deduplicar mensajes

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [username, setUsername] = useState(getStoredUserName);
    const listRef = useRef(null);

    // helper de deduplicación
    const pushIfNew = (msg) => {
        const id = msg?.clientId || msg?.id;
        if (id && seenIdsRef.current.has(id)) return;
        if (id) seenIdsRef.current.add(id);
        setMessages((prev) => [...prev, msg]);
    };

    // Resolver username una sola vez
    useEffect(() => {
        (async () => {
            if (username) return;

            const token = localStorage.getItem("token");
            if (token) {
                const payload = decodeJwt(token);
                const nameFromJwt =
                    payload?.name ||
                    payload?.username ||
                    (payload?.email ? payload.email.split("@")[0] : "");
                if (nameFromJwt) {
                    setUsername(nameFromJwt);
                    localStorage.setItem("username", nameFromJwt);
                    return;
                }
            }

            try {
                const res = await axios.get("http://localhost:3006/auth/me", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const name = res.data?.name || res.data?.username || "";
                if (name) {
                    setUsername(name);
                    localStorage.setItem("user", JSON.stringify(res.data));
                    localStorage.setItem("username", name);
                    return;
                }
            } catch {
                // ignorar
            }

            setUsername("anonymous");
        })();
    }, [username]);

    // Conexión socket: init una vez, listeners por montaje (StrictMode-safe)
    useEffect(() => {
        // crear socket 1 sola vez
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                path: "/socket.io",
                withCredentials: false,
                reconnectionAttempts: 10,
                timeout: 10000,
            });
        }

        const s = socketRef.current;

        // 👉 registrás los listeners acá
        const onMessage = (msg) => {
            console.log("📨 recibido en cliente:", msg);
            pushIfNew(msg); // tu función de dedupe + setMessages
        };

        s.on("connect", () => console.log("🟢 socket connected", s.id));
        s.on("chat:message", onMessage);

        // 👉 y los limpias en el cleanup
        return () => {
            s.off("chat:message", onMessage);
            s.off("connect");
            // NO cierres el socket en dev para evitar problemas con StrictMode
            // s.close();
        };
    }, []); // deps vacías

    // Auto-scroll
    useEffect(() => {
        if (listRef.current)
            listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const s = socketRef.current;
        if (!s || !s.connected || !text.trim()) return;

        const clientId = crypto?.randomUUID?.()
            || Date.now().toString(36) + Math.random().toString(36).slice(2);

        const payload = {
            clientId,
            username: username || "anonymous",
            text: text.trim(),
            createdAt: new Date().toISOString(),
        };

        // ❌ NO marcar como visto antes (esto rompe el optimista)
        // seenIdsRef.current.add(clientId);

        // ✅ Pintado optimista: pushIfNew agrega y marca como visto internamente
        pushIfNew({ ...payload, id: clientId });

        // Emití; cuando llegue el eco, será ignorado por la dedupe
        s.emit("chat:message", payload);

        setText("");
    };

    const isMine = (from, me) =>
        String(from || "").trim().toLowerCase() === String(me || "").trim().toLowerCase();

    // ✅ el return VA DENTRO del componente
    return (
        <div className="mt-1 w-full">
            <div className="flex flex-col h-[60vh] max-w-[900px] mx-auto border rounded-lg mt-4 mb-4 bg-white text-black">
                {/* título */}
                <div className="px-4 py-2 border-b flex items-center justify-between h-12">
                    
                    <div className="font-semibold text-md">Chat Comunidad</div>
                    
                    <div className="text-md">
                        <span className="px-2 py-1 rounded bg-gray-200">
                            👤 {username || "anonymous"}
                        </span>
                    </div>
                    
                </div>

                {/* mensajes */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="text-md text-gray-800">
                            No hay mensajes todavía.
                        </div>
                    )}

                    {messages.map((m, i) => {
                        const when = m.createdAt ? new Date(m.createdAt) : new Date();
                        const mine = isMine(m.username, username);

                        return (
                            <div key={m.id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={[
                                        "max-w-[75%] px-3 py-2 rounded-2xl shadow",
                                        "whitespace-pre-wrap break-words",
                                        mine
                                            ? "bg-violet-600 text-white rounded-br-sm"
                                            : "bg-gray-200 text-gray-900 rounded-bl-sm"
                                    ].join(" ")}
                                >
                                    {!mine && (
                                        <div className="text-xs font-semibold opacity-70 mb-0.5">{m.username || "anonymous"}</div>
                                    )}

                                    <div>{m.text}</div>

                                    <div
                                        className={[
                                            "mt-1 text-[11px] opacity-70 text-right",
                                            mine ? "text-white/80" : "text-gray-600"
                                        ].join(" ")}
                                    >
                                        {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* input */}
                <form onSubmit={handleSend} className="p-3 border-t rounded-b-lg bg-white">
                    <div className="flex gap-2">
                        <input
                            className="border rounded bg-amber-100 text-black px-3 py-2 flex-1"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Escribí un mensaje…"
                        />
                        <button
                            type="submit"
                            className="bg-black text-white rounded px-4 py-2"
                            disabled={!text.trim()}
                        >
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
