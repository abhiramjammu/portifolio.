// js/creative-bg.js - Interactive Neural Network Background
document.addEventListener('DOMContentLoaded', () => {
  // Create and inject canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'neural-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0'; // Behind most content, but above the black body
  canvas.style.opacity = '0.6';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  
  // Mouse tracking
  const mouse = { x: null, y: null, radius: 250 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    init();
  }
  
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }

    draw() {
      ctx.fillStyle = 'rgba(0, 214, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.drawnY, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Natural drifting
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          // Only push x to avoid weirdness with parallax y
          this.x -= directionX;
        }
      }
    }
  }

  function init() {
    particles = [];
    const numParticles = (width * height) / 15000; // Responsive amount
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    let parallaxOffset = scrollY * 0.4; // Moves at 40% scroll speed

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      // Calculate wrapped Y coordinate
      particles[i].drawnY = ((particles[i].y - parallaxOffset) % height + height) % height;
      particles[i].draw();

      // Connect dots
      for (let j = i; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].drawnY - particles[j].drawnY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 214, 255, ${0.2 - distance/600})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].drawnY);
          ctx.lineTo(particles[j].x, particles[j].drawnY);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  resize();
  animate();
});
