// src/components/LuzDetrasLogo.jsx
import React, { useEffect, useRef } from 'react';

const LuzDetrasLogo = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const lightRays = [];

    const resizeCanvas = () => {
      canvas.width = 600; // tamaño fijo centrado detrás del logo
      canvas.height = 300;
    };
    resizeCanvas();

    class LightRay {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 350 + 250;
        this.speed = Math.random() * 0.015 + 0.005;
        this.opacity = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.angle += this.speed;
      }

      draw() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 1.6;

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

    for (let i = 0; i < 10; i++) {
      lightRays.push(new LightRay());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lightRays.forEach((ray) => {
        ray.update();
        ray.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
    />
  );
};

export default LuzDetrasLogo;
