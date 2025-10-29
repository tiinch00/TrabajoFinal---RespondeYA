import React, { useEffect, useRef } from 'react';

const FondoAnimado = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Configurar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas (estrellas)
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

        // Efecto de parpadeo
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 1 || this.opacity <= 0) {
          this.fadeSpeed *= -1;
        }

        // Reiniciar si sale de la pantalla
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

    // Crear rayos de luz
    class LightRay {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 300 + 200;
        this.speed = Math.random() * 0.02 + 0.01;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.angle += this.speed;
      }

      draw() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 5.5;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle);

        const gradient = ctx.createLinearGradient(0, 0, this.length, 0);
        gradient.addColorStop(0, `rgba(147, 51, 234, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, -2, this.length, 4);

        ctx.restore();
      }
    }

    // Inicializar partículas y rayos
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }

    const lightRays = [];
    for (let i = 0; i < 12; i++) {
      lightRays.push(new LightRay());
    }

    // Función de animación
    const animate = () => {
      // Gradiente de fondo
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

      // Dibujar rayos de luz
      lightRays.forEach((ray) => {
        ray.update();
        ray.draw();
      });

      // Dibujar partículas
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />;
};

export default FondoAnimado;
