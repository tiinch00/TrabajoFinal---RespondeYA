import React, { useEffect, useRef } from 'react';

const FondoAnimado = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let meteors = [];

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

    // Clase Meteorito
    class Meteor {
      constructor() {
        this.reset();
      }

      reset() {
        // Posición inicial aleatoria en los bordes
        const side = Math.floor(Math.random() * 4);
        if (side === 0) {
          // arriba-izquierda a abajo-derecha
          this.x = Math.random() * canvas.width * 0.3;
          this.y = 0;
          this.speedX = Math.random() * 4 + 3;
          this.speedY = Math.random() * 4 + 3;
        } else if (side === 1) {
          // arriba-derecha a abajo-izquierda
          this.x = canvas.width - Math.random() * canvas.width * 0.3;
          this.y = 0;
          this.speedX = -(Math.random() * 4 + 3);
          this.speedY = Math.random() * 4 + 3;
        } else if (side === 2) {
          // izquierda a derecha
          this.x = 0;
          this.y = Math.random() * canvas.height;
          this.speedX = Math.random() * 5 + 4;
          this.speedY = (Math.random() - 0.5) * 4;
        } else {
          // derecha a izquierda
          this.x = canvas.width;
          this.y = Math.random() * canvas.height;
          this.speedX = -(Math.random() * 5 + 4);
          this.speedY = (Math.random() - 0.5) * 4;
        }

        this.length = Math.random() * 80 + 40;
        this.opacity = 1;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Si sale de pantalla, reiniciar
        if (
          this.x < -100 ||
          this.x > canvas.width + 100 ||
          this.y < -100 ||
          this.y > canvas.height + 100
        ) {
          this.reset();
        }
      }

      draw() {
        const angle = Math.atan2(this.speedY, this.speedX);

        // Cola del meteorito (gradiente)
        const gradient = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x - Math.cos(angle) * this.length,
          this.y - Math.sin(angle) * this.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(angle) * this.length, this.y - Math.sin(angle) * this.length);
        ctx.stroke();

        // Núcleo brillante
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Crear partículas iniciales
    for (let i = 0; i < 300; i++) {
      particles.push(new Particle());
    }

    // Crear meteoritos
    for (let i = 0; i < 3; i++) {
      meteors.push(new Meteor());
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

      // Dibujar meteoritos
      meteors.forEach((m) => {
        m.update();
        m.draw();
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
