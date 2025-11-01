import { createContext, useContext, useRef, useState, useEffect } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const setMuted = (value) => {
    setIsMuted(value);
    if (audioRef.current) {
      audioRef.current.muted = value;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    setMuted(!isMuted);
  };

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute, setMuted, audioRef }}>
      <audio ref={audioRef} src='/sounds/intro.mp3' autoPlay loop />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic debe ser usado dentro de MusicProvider');
  }
  return context;
};
