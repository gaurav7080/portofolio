// ====== 3D Planet → Saturn Ring Scroll Animation ======
// Uses "NA" particle text for the cybersecurity/dev theme
// Planet on load → explodes to Saturn ring on scroll → reforms on scroll back

(function () {
  'use strict';

  const canvas = document.getElementById('planet-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // --- Configuration ---
  const CONFIG = {
    particleCount: 900,
    textChar: 'NA',
    planetRadius: 140,
    ringInnerRadius: 180,
    ringOuterRadius: 320,
    ringThickness: 12,
    fov: 600,
    rotationSpeed: 0.003,
    mouseInfluence: 0.3,
    transitionSpeed: 0.025,
    glowColor: 'rgba(0, 255, 153, ',
    secondaryGlow: 'rgba(0, 204, 122, ',
    accentGlow: 'rgba(0, 180, 255, ',
    bgAlpha: 0.15,
  };

  // --- State ---
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetScrollProgress = 0; // The actual scroll position
  let scrollProgress = 0; // Lerped value for smooth animations
  let autoRotationAngle = 0;
  let particles = [];
  let animFrameId = null;

  // DOM Elements to animate
  const animElements = {
    badge: document.getElementById('anim-badge'),
    title: document.getElementById('anim-title'),
    roles: document.getElementById('anim-roles'),
    desc: document.getElementById('anim-desc'),
    btns: document.getElementById('anim-btns'),
    socials: document.getElementById('anim-socials'),
    image: document.getElementById('anim-image'),
    indicator: document.getElementById('hero-scroll-indicator')
  };

  // --- Resize ---
  function resize() {
    width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    // Recalculate responsive sizes
    const vmin = Math.min(canvas.offsetWidth, canvas.offsetHeight);
    CONFIG.planetRadius = vmin * 0.18;
    CONFIG.ringInnerRadius = vmin * 0.22;
    CONFIG.ringOuterRadius = vmin * 0.42;
    CONFIG.ringThickness = vmin * 0.018;
    CONFIG.fov = vmin * 0.8;
    // On mobile, fewer particles for performance
    if (canvas.offsetWidth < 600) {
      CONFIG.particleCount = 500;
    } else if (canvas.offsetWidth < 900) {
      CONFIG.particleCount = 700;
    } else {
      CONFIG.particleCount = 900;
    }
    if (particles.length !== CONFIG.particleCount) {
      initParticles();
    }
  }

  // --- Particle Class ---
  class Particle {
    constructor(index) {
      this.index = index;
      // Sphere position (planet form)
      this.setPlanetPosition();
      // Ring position (saturn form)
      this.setRingPosition();
      // Current interpolated position
      this.cx = this.px;
      this.cy = this.py;
      this.cz = this.pz;
      // Visual
      this.size = 1 + Math.random() * 2;
      this.alpha = 0.4 + Math.random() * 0.6;
      this.alphaOffset = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.5 + Math.random() * 2;
      // Which NA character
      this.char = CONFIG.textChar[index % CONFIG.textChar.length];
      this.useText = Math.random() > 0.4; // 60% show text, 40% dots
      this.textSize = 6 + Math.random() * 5;
      // Explosion velocity (for intermediate states)
      this.explodeVx = (Math.random() - 0.5) * 4;
      this.explodeVy = (Math.random() - 0.5) * 4;
      this.explodeVz = (Math.random() - 0.5) * 4;
    }

    setPlanetPosition() {
      // Uniform distribution on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = CONFIG.planetRadius * (0.85 + Math.random() * 0.15);
      this.px = r * Math.sin(phi) * Math.cos(theta);
      this.py = r * Math.sin(phi) * Math.sin(theta);
      this.pz = r * Math.cos(phi);
    }

    setRingPosition() {
      // Flat ring distribution (Saturn rings are flat in XZ plane)
      const angle = Math.random() * Math.PI * 2;
      const ringR = CONFIG.ringInnerRadius + Math.random() * (CONFIG.ringOuterRadius - CONFIG.ringInnerRadius);
      // Multiple ring bands with gaps
      const band = Math.random();
      let finalR;
      if (band < 0.35) {
        finalR = CONFIG.ringInnerRadius + (CONFIG.ringOuterRadius - CONFIG.ringInnerRadius) * 0.15 * Math.random();
      } else if (band < 0.5) {
        // Gap
        finalR = CONFIG.ringInnerRadius + (CONFIG.ringOuterRadius - CONFIG.ringInnerRadius) * (0.2 + 0.05 * Math.random());
      } else if (band < 0.85) {
        finalR = CONFIG.ringInnerRadius + (CONFIG.ringOuterRadius - CONFIG.ringInnerRadius) * (0.3 + 0.4 * Math.random());
      } else {
        finalR = CONFIG.ringInnerRadius + (CONFIG.ringOuterRadius - CONFIG.ringInnerRadius) * (0.8 + 0.2 * Math.random());
      }
      this.rx = finalR * Math.cos(angle);
      this.ry = (Math.random() - 0.5) * CONFIG.ringThickness;
      this.rz = finalR * Math.sin(angle);
      this.ringAngle = angle;
      this.ringRadius = finalR;
    }
  }

  // --- Init Particles ---
  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle(i));
    }
  }

  // --- 3D Rotation Helpers ---
  function rotateY(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - z * sin,
      y: y,
      z: x * sin + z * cos
    };
  }

  function rotateX(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x,
      y: y * cos - z * sin,
      z: y * sin + z * cos
    };
  }

  function project(x, y, z) {
    const scale = CONFIG.fov / (CONFIG.fov + z);
    return {
      x: x * scale + canvas.offsetWidth / 2,
      y: y * scale + canvas.offsetHeight / 2,
      scale: scale
    };
  }

  // --- Easing ---
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // --- Scroll Handler ---
  function updateScrollProgress() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    const heroRect = heroSection.getBoundingClientRect();
    const heroHeight = heroSection.offsetHeight;
    const windowHeight = window.innerHeight;

    // Transition happens as the user scrolls through the 250vh tall hero section
    // 0 at top → 1 when scrolled to the end of the hero section
    // Use the sticky wrapper's scroll bounds
    const maxScroll = heroHeight - windowHeight;
    if (maxScroll <= 0) return;

    const scrolled = -heroRect.top;
    const raw = Math.max(0, scrolled / maxScroll);
    targetScrollProgress = Math.min(1, Math.max(0, raw));
  }

  // --- Main Render Loop ---
  function render(time) {
    const t = time * 0.001;

    // Smooth scroll interpolation (lerping)
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

    // Clear with semi-transparent for trail effect
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Auto rotation
    autoRotationAngle += CONFIG.rotationSpeed;

    // Mouse-based tilt
    const mouseRatioX = (mouseX - canvas.offsetWidth / 2) / (canvas.offsetWidth / 2);
    const mouseRatioY = (mouseY - canvas.offsetHeight / 2) / (canvas.offsetHeight / 2);
    const tiltX = mouseRatioY * CONFIG.mouseInfluence * 0.3;
    const tiltY = mouseRatioX * CONFIG.mouseInfluence;

    // Saturn ring tilt (to show the ring at an angle)
    const ringTiltX = 0.5; // ~30 degrees

    // Eased scroll progress
    const easedProgress = easeInOutCubic(scrollProgress);

    // Explosion mid-phase: particles scatter briefly between 0.3 and 0.7
    const explosionFactor = Math.sin(easedProgress * Math.PI); // peaks at 0.5
    
    // --- Animate Hero DOM Elements (coming out of the planet) ---
    animateHeroElements(easedProgress);

    // Sort particles by z for proper depth rendering
    const projected = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Interpolate between planet and ring positions
      let targetX = p.px * (1 - easedProgress) + p.rx * easedProgress;
      let targetY = p.py * (1 - easedProgress) + p.ry * easedProgress;
      let targetZ = p.pz * (1 - easedProgress) + p.rz * easedProgress;

      // Add explosion scatter in the middle of transition
      targetX += p.explodeVx * explosionFactor * 50;
      targetY += p.explodeVy * explosionFactor * 50;
      targetZ += p.explodeVz * explosionFactor * 50;

      // Smooth transition to target
      p.cx += (targetX - p.cx) * 0.08;
      p.cy += (targetY - p.cy) * 0.08;
      p.cz += (targetZ - p.cz) * 0.08;

      // Apply rotation
      let rotated = rotateY(p.cx, p.cy, p.cz, autoRotationAngle + tiltY);

      // Interpolate tilt between planet (slight) and ring (angled) view
      const currentTiltX = tiltX + ringTiltX * easedProgress;
      rotated = rotateX(rotated.x, rotated.y, rotated.z, currentTiltX);

      const proj = project(rotated.x, rotated.y, rotated.z);

      // Skip offscreen particles
      if (proj.x < -50 || proj.x > canvas.offsetWidth + 50 ||
        proj.y < -50 || proj.y > canvas.offsetHeight + 50) continue;

      // Pulsing alpha
      const pulseAlpha = 0.3 + Math.sin(t * p.pulseSpeed + p.alphaOffset) * 0.3;
      const depthAlpha = Math.max(0.1, Math.min(1, proj.scale));

      projected.push({
        x: proj.x,
        y: proj.y,
        scale: proj.scale,
        z: rotated.z,
        size: p.size * proj.scale,
        alpha: p.alpha * pulseAlpha * depthAlpha,
        char: p.char,
        useText: p.useText,
        textSize: p.textSize * proj.scale,
        index: i,
      });
    }

    // Sort back-to-front
    projected.sort((a, b) => b.z - a.z);

    // --- Draw Connections (plexus) for nearby particles ---
    const connectionDist = 50 + 30 * (1 - easedProgress); // Tighter connections in ring form
    for (let i = 0; i < projected.length; i++) {
      const p1 = projected[i];
      for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
        const p2 = projected[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          const lineAlpha = (1 - dist / connectionDist) * 0.1 * Math.min(p1.alpha, p2.alpha);
          ctx.beginPath();
          ctx.strokeStyle = CONFIG.glowColor + lineAlpha + ')';
          ctx.lineWidth = 0.5 * p1.scale;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // --- Draw Particles ---
    // (Optimized: removed per-particle shadowBlur and createRadialGradient for performance)
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];

      // Glow effect (simplified for performance)
      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.glowColor + (p.alpha * 0.2) + ')';
        ctx.fill();
      }

      if (p.useText && p.textSize > 4) {
        // Draw text particle
        ctx.font = `${Math.max(5, p.textSize)}px 'Space Grotesk', monospace`;
        ctx.fillStyle = CONFIG.glowColor + p.alpha + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, p.x, p.y);
      } else {
        // Draw dot particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);

        // Color variation based on depth
        const colorMix = (p.z + CONFIG.fov) / (CONFIG.fov * 2);
        if (colorMix > 0.6) {
          ctx.fillStyle = CONFIG.accentGlow + p.alpha + ')';
        } else {
          ctx.fillStyle = CONFIG.glowColor + p.alpha + ')';
        }
        ctx.fill();
      }
    }

    // --- Draw Central Core Glow (planet mode) ---
    if (easedProgress < 0.8) {
      const coreAlpha = 0.15 * (1 - easedProgress);
      const coreSize = CONFIG.planetRadius * 1.5 * (1 - easedProgress * 0.5);
      const coreGrad = ctx.createRadialGradient(
        canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0,
        canvas.offsetWidth / 2, canvas.offsetHeight / 2, coreSize
      );
      coreGrad.addColorStop(0, CONFIG.glowColor + coreAlpha + ')');
      coreGrad.addColorStop(0.5, CONFIG.glowColor + (coreAlpha * 0.3) + ')');
      coreGrad.addColorStop(1, CONFIG.glowColor + '0)');
      ctx.beginPath();
      ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
    }

    // --- Draw Ring Center Planet (Saturn body, visible in ring mode) ---
    if (easedProgress > 0.3) {
      const bodyAlpha = 0.08 * easedProgress;
      const bodyRadius = CONFIG.planetRadius * 0.35 * easedProgress;
      const bodyGrad = ctx.createRadialGradient(
        canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0,
        canvas.offsetWidth / 2, canvas.offsetHeight / 2, bodyRadius
      );
      bodyGrad.addColorStop(0, CONFIG.secondaryGlow + bodyAlpha * 2 + ')');
      bodyGrad.addColorStop(0.7, CONFIG.glowColor + bodyAlpha + ')');
      bodyGrad.addColorStop(1, CONFIG.glowColor + '0)');
      ctx.beginPath();
      ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, bodyRadius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
    }

    // --- Ambient floating particles around the scene ---
    drawAmbientDust(t);

    animFrameId = requestAnimationFrame(render);
  }

  // --- Ambient Dust ---
  const dustParticles = [];
  for (let i = 0; i < 60; i++) {
    dustParticles.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      speed: 0.0002 + Math.random() * 0.0005,
      alpha: 0.1 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2
    });
  }

  function drawAmbientDust(t) {
    for (const d of dustParticles) {
      const x = ((d.x + t * d.speed) % 1) * canvas.offsetWidth;
      const y = d.y * canvas.offsetHeight + Math.sin(t + d.offset) * 20;
      const alpha = d.alpha * (0.5 + Math.sin(t * 2 + d.offset) * 0.5);

      ctx.beginPath();
      ctx.arc(x, y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.glowColor + alpha + ')';
      ctx.fill();
    }
  }

  // --- Hero DOM Animation Logic ---
  // Makes the text fly out of the planet as we scroll
  function animateHeroElements(progress) {
    // Hide scroll indicator as we start scrolling
    if (animElements.indicator) {
      animElements.indicator.style.opacity = Math.max(0, 1 - progress * 5);
    }

    // Helper to calculate animation state based on a start and end progress range
    const getPhase = (start, end) => {
      if (progress <= start) return 0;
      if (progress >= end) return 1;
      return (progress - start) / (end - start);
    };

    // Animate each element sequentially
    applyAnim(animElements.image, getPhase(0.0, 0.3));
    applyAnim(animElements.title, getPhase(0.1, 0.4));
    applyAnim(animElements.badge, getPhase(0.2, 0.5));
    applyAnim(animElements.roles, getPhase(0.3, 0.6));
    applyAnim(animElements.desc, getPhase(0.4, 0.7));
    applyAnim(animElements.btns, getPhase(0.5, 0.8));
    applyAnim(animElements.socials, getPhase(0.6, 0.9));
  }

  function applyAnim(el, phase) {
    if (!el) return;
    
    // Phase 0 = deep inside planet (invisible)
    // Phase 1 = normal position (visible)
    const scale = 0.5 + (0.5 * phase); // scale from 0.5 to 1
    const yOffset = 100 * (1 - phase); // rise up from 100px below
    const blur = 10 * (1 - phase); // start blurred
    
    // Add easing to phase
    const eased = easeInOutCubic(phase);
    
    el.style.opacity = eased;
    el.style.transform = `translateY(${yOffset}px) scale(${scale})`;
    el.style.filter = `blur(${blur}px)`;
    // Ensure smooth transitions when mouse moves by disabling CSS transitions 
    // on these properties and letting JS handle it frame-by-frame
    el.style.transition = 'none';
  }

  // --- Event Listeners ---
  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  canvas.parentElement?.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // Touch support
  canvas.parentElement?.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
  }, { passive: true });

  // --- Init ---
  resize();
  initParticles();
  requestAnimationFrame(render);
})();
