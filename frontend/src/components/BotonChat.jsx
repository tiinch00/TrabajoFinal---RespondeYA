import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const BotonChat = ({ setChatAbierto, chatAbierto }) => {
  const [isFixed, setIsFixed] = useState(true);
  const footerRef = useRef(null);

  useEffect(() => {
    // Referencia al footer real
    const footer = document.querySelector('footer');
    footerRef.current = footer;

    if (!footer) return;

    // Observador para detectar visibilidad del footer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si el footer está visible → el botón deja de ser fixed
        setIsFixed(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.button
      onClick={() => setChatAbierto(!chatAbierto)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`${
        isFixed ? 'fixed' : 'absolute'
      } bottom-6 right-4 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 
      text-white p-3 sm:p-4 cursor-pointer rounded-full shadow-2xl transition z-10 border-2 border-blue-400`}
      style={{
        // si está absolute, lo posicionamos justo antes del footer
        bottom: isFixed ? '1.5rem' : '6rem',
      }}
    >
      <svg className='w-5 h-5 sm:w-6 sm:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
        />
      </svg>
    </motion.button>
  );
};
