import React, { useRef, useEffect } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle Array
    const numParticles = 75;
    const particles = [];
    
    // Mouse coords
    let mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // 3D coordinates (x, y, z) mapped inside bounding space
        this.x = (Math.random() - 0.5) * width * 1.5;
        this.y = (Math.random() - 0.5) * height * 1.5;
        this.z = Math.random() * 800 + 200; // Depth factor
        
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.speedZ = -0.5 - Math.random() * 0.5; // moves forward
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.z += this.speedZ;

        // Reset if too close or past viewport
        if (this.z <= 10) {
          this.reset();
        }
      }

      draw(offsetX, offsetY) {
        // Perspective projection
        const fov = 400; // Field of view depth scale
        const scale = fov / (fov + this.z);
        const projX = (this.x + offsetX) * scale + width / 2;
        const projY = (this.y + offsetY) * scale + height / 2;

        // Render if within bounds
        if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
          const alpha = (1 - this.z / 1000) * 0.65;
          ctx.beginPath();
          // Draw cyan glowing particle
          ctx.arc(projX, projY, this.size * scale * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.shadowBlur = scale * 10;
          ctx.shadowColor = '#00f2fe';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }
    }

    // Initialize
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const render = () => {
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, width, height);

      // Add a smooth grid lines effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Smooth mouse follow (easing)
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Parallax shifts
      const dx = (mouse.x - width / 2) * 0.15;
      const dy = (mouse.y - height / 2) * 0.15;

      // Draw connections first
      ctx.lineWidth = 0.5;
      const fov = 400;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();

        const s1 = fov / (fov + p1.z);
        const x1 = (p1.x + dx) * s1 + width / 2;
        const y1 = (p1.y + dy) * s1 + height / 2;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const s2 = fov / (fov + p2.z);
          const x2 = (p2.x + dx) * s2 + width / 2;
          const y2 = (p2.y + dy) * s2 + height / 2;

          // 3D Distance check
          const dist3D = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + 
            Math.pow(p1.y - p2.y, 2) + 
            Math.pow(p1.z - p2.z, 2)
          );

          if (dist3D < 180) {
            const alpha = (1 - dist3D / 180) * (1 - (p1.z + p2.z) / 2000) * 0.25;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            // Draw colorful web lines between close points
            ctx.strokeStyle = `rgba(79, 172, 254, ${alpha})`;
            ctx.stroke();
          }
        }

        // Draw node
        p1.draw(dx, dy);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
