import { useEffect, useRef, useState } from 'react';

import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import { useGame } from '../context/ContextJuego.jsx';
import { useTranslation } from 'react-i18next';

// === HELPERS (arriba del componente) ===
const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getStoredUserName = () => {
  const u = getStoredUser();
  if (!u) return '';
  return u.name || u.username || (u.email ? u.email.split('@')[0] : '');
};

const getStoredUserPhoto = () => {
  const u = getStoredUser();
  return u?.foto_perfil || null; // acá viene la ruta cruda: '/uploads/...' o '/assets/...'
};

export default function ChatGlobal() {
  const { t } = useTranslation();
  const { inicializarSocket, socket } = useGame();
  const socketRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const [username] = useState(getStoredUserName);
  const [userPhoto] = useState(() => {
    const raw = getStoredUserPhoto();    // ej: '/uploads/fotos_perfil/abc.jpg'
    return raw ? resolveFotoAjena(raw) : null; // lo pasamos por el helper
  });

  const listRef = useRef(null);

  // agrega mensaje si no está ya visto
  const pushIfNew = (msg) => {
    const id = msg?.clientId || msg?.id;
    if (id && seenIdsRef.current.has(id)) return;
    if (id) seenIdsRef.current.add(id);
    setMessages((prev) => [...prev, msg]);
  };

  // Conexion socket.io
  useEffect(() => {
    const s = socket ?? inicializarSocket();
    socketRef.current = s;

    const onMessage = (msg) => {
      // console.log("📨 recibido en cliente:", msg);
      pushIfNew(msg);
    };

    s.on('connect', () => console.log('🟢 socket connected', s.id));
    s.on('chat:message', onMessage);

    return () => {
      s.off('chat:message', onMessage);
      s.off('connect');
    };
  }, [socket, inicializarSocket]);

  // enviar mensaje
  const handleSend = (e) => {
    e.preventDefault();
    const s = socketRef.current;
    if (!s || !s.connected || !text.trim()) return;

    const clientId =
      crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);

    const payload = {
      clientId,
      username: username || 'anonymous',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      foto_perfil: userPhoto || null, // 👈 ahora también la tuya
    };

    // lo metemos en el estado local
    pushIfNew({ ...payload, id: clientId });

    // lo mandamos al server
    s.emit('chat:message', payload);
    setText('');
  };


  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const isMine = (from, me) =>
    String(from || '')
      .trim()
      .toLowerCase() ===
    String(me || '')
      .trim()
      .toLowerCase();

  return (
    <div>
      <div className='flex flex-col lg:h-110 lg:w-76 sm:w-45 sm:h-60 mx-auto border rounded-lg bg-white text-black'>
        {/* título */}
        <div className='px-2 py-2 border-b flex items-center justify-between h-12'>
          <div className='font-semibold text-md'>{t('comunityChat')}</div>

          <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center'>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={username || 'Yo'}
                className='w-8 h-8 object-cover'
              />
            ) : (
              <span className='text-lg'>👤</span>
            )}
          </div>
          <span className='px-1 py-1 rounded bg-gray-200'>
            {username || 'anonymous'}
          </span>
        </div>

        {/* mensajes */}
        <div ref={listRef} className='flex-1 overflow-y-auto text-left p-4 space-y-3'>
          {messages.length === 0 && (
            <div className='text-md text-gray-800'>{t('noMessages')}.</div>
          )}

          {messages.map((m, i) => {
            const when = m.createdAt ? new Date(m.createdAt) : new Date();
            const mine = isMine(m.username, username);

            // foto del otro
            const fotoOtro = !mine && m.foto_perfil ? resolveFotoAjena(m.foto_perfil) : null;

            // tu propia foto en tus mensajes
            const fotoMia = mine
              ? (m.foto_perfil ? resolveFotoAjena(m.foto_perfil) : userPhoto)
              : null;

            return (
              <div key={m.id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${mine ? 'flex-row-reverse' : ''
                    }`}
                >
                  {/* Avatar */}
                  <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0'>
                    {mine ? (
                      fotoMia ? (
                        <img
                          src={fotoMia}
                          alt={m.username || 'Yo'}
                          className='w-8 h-8 object-cover'
                        />
                      ) : (
                        <span className='text-lg'>👤</span>
                      )
                    ) : fotoOtro ? (
                      <img
                        src={fotoOtro}
                        alt={m.username || 'Jugador'}
                        className='w-8 h-8 object-cover'
                      />
                    ) : (
                      <span className='text-lg'>👤</span>
                    )}
                  </div>

                  {/* Burbuja */}
                  <div
                    className={[
                      'px-3 py-2 rounded-2xl shadow whitespace-pre-wrap break-words',
                      mine
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-gray-200 text-gray-900 rounded-bl-sm',
                    ].join(' ')}
                  >
                    {!mine && (
                      <div className='text-xs font-semibold opacity-70 mb-0.5'>
                        {m.username || 'anonymous'}
                      </div>
                    )}

                    <div>{m.text}</div>

                    <div
                      className={[
                        'mt-1 text-[11px] opacity-70 text-right',
                        mine ? 'text-white/80' : 'text-gray-600',
                      ].join(' ')}
                    >
                      {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* input */}
        <form onSubmit={handleSend} className='p-2 border-t rounded-b-lg bg-white'>
          <div className='flex gap-2'>
            <input
              className='border rounded bg-amber-100 w-full text-black px-3 py-2 flex-1'
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('writeMessage')}
            />
            <button
              type='submit'
              className='bg-black text-white rounded px-4 py-2'
              disabled={!text.trim()}
            >
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
