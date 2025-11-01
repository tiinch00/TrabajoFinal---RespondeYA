import React, { useEffect, useRef } from 'react';

const FondoAnimado = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Clase Partícula (estrellas)
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.02 + 0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Parpadeo
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 1 || this.opacity <= 0) {
          this.fadeSpeed *= -1;
        }

        // Reinicio si sale de pantalla
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Crear partículas iniciales
    for (let i = 0; i < 300; i++) {
      particles.push(new Particle());
    }

    // Función de animación
    const animate = () => {
      // Gradiente del fondo
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2.5,
        0,
        canvas.width / 2,
        canvas.height / 2.5,
        canvas.width / 1.5
      );
      gradient.addColorStop(0, '#4c1d95');
      gradient.addColorStop(0.5, '#2e1065');
      gradient.addColorStop(1, '#1e0a3c');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar partículas
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Limpieza
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />;
};

export default FondoAnimado;
