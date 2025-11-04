import { useEffect, useRef, useState } from 'react';
import LuzDetrasLogo from './LuzDetrasLogo';

export const RespondeYaLogo = () => {
  const h1Ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.016;

      if (h1Ref.current) {
        // Movimiento orgánico
        const moveY = Math.sin(time * 0.5) * 8;
        const moveX = Math.cos(time * 0.3) * 6;

        // Escala pulsante sutil
        const scale = 1 + Math.sin(time * 1.5) * 0.015;

        h1Ref.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
      }
    };

    animate();

    // Interacción con mouse
    const handleMouseMove = (e) => {
      if (!h1Ref.current) return;

      const rect = h1Ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      const tiltX = (distY / window.innerHeight) * 5;
      const tiltY = (distX / window.innerWidth) * 5;

      h1Ref.current.style.textShadow = `
        ${tiltX * 0.5}px ${tiltY * 0.5}px 10px rgba(0, 0, 0, 0.8),
        ${tiltX}px ${tiltY}px 20px rgba(0, 0, 0, 0.6),
        0 0 30px rgba(255, 119, 0, 0.5)
      `;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className='relative mb-10 flex flex-col items-center justify-center pt-10'>
      {/* rayos de luz */}
      <div className='absolute inset-0 flex items-center justify-center z-0 my-25 '>
        <LuzDetrasLogo />
      </div>

      <h1
        ref={h1Ref}
        className='relative text-7xl md:text-9xl font-black text-center z-10'
        style={{
          color: '#ff7700',
          WebkitTextStroke: '6px #cc00ff',
          paintOrder: 'stroke fill',
          textShadow: `
            0 4px 10px rgba(0, 0, 0, 0.8),
            0 8px 20px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(255, 119, 0, 0.5),
            -2px -2px 5px rgba(204, 0, 255, 0.3),
            2px 2px 8px rgba(0, 0, 0, 0.7)
          `,
          filter:
            'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6)) drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))',
          transition: 'transform 0.1s ease-out',
        }}
      >
        ¡RespondeYa!
      </h1>
    </div>
  );
};
