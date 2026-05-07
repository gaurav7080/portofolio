document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initCustomCursor();
  initHeaderScroll();
  initMobileMenu();
  initScrollAnimations();
  initContactForm();
  initMagneticElements();
  initTiltEffect();
  initScrollProgress();
  initProfileModal();
  initSkillCardTracking();
});

// ====== Matrix Rain Effect ======
function initMatrix() {
  const canvas = document.getElementById('matrix-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const characters = '01';
  const fontSize = 16;
  const columns = Math.floor(width / fontSize);
  const drops = new Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff99';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let matrixInterval = setInterval(draw, 50);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

// ====== Custom Cursor with Customization ======
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const toggle = document.getElementById('cursorToggle');
  const menu = document.getElementById('cursorMenu');
  const powerBtn = document.getElementById('cursorPower');

  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let isEnabled = localStorage.getItem('cursorEnabled') !== 'false';
  let currentVariant = localStorage.getItem('cursorVariant') || 'subtle';

  const updateCursorState = () => {
    const display = isEnabled ? 'block' : 'none';
    dot.style.display = display;
    ring.style.display = display;
    document.body.style.cursor = isEnabled ? 'none' : 'auto';
    if (toggle) toggle.classList.toggle('off', !isEnabled);
    if (powerBtn) powerBtn.setAttribute('aria-pressed', isEnabled);
    localStorage.setItem('cursorEnabled', isEnabled);
  };

  const updateVariant = (variant) => {
    document.documentElement.setAttribute('data-cursor', variant);
    currentVariant = variant;
    localStorage.setItem('cursorVariant', variant);

    // Update menu buttons
    document.querySelectorAll('.cursor-opt[data-variant]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-variant') === variant);
    });
  };

  updateCursorState();
  updateVariant(currentVariant);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;

    if (currentVariant === 'trail' && isEnabled) {
      createTrailDot(mouseX, mouseY);
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  function createTrailDot(x, y) {
    const trail = document.createElement('div');
    trail.className = 'trail-dot';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    document.body.appendChild(trail);
    setTimeout(() => {
      trail.style.opacity = '0';
      setTimeout(() => trail.remove(), 600);
    }, 50);
  }

  // Toggle Menu
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });
  }

  // Power Toggle
  if (powerBtn) {
    powerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isEnabled = !isEnabled;
      updateCursorState();
    });
  }

  // Variant Selection
  document.querySelectorAll('.cursor-opt[data-variant]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateVariant(btn.getAttribute('data-variant'));
    });
  });

  document.addEventListener('click', () => {
    if (menu) menu.classList.remove('active');
  });

  const hoverElements = document.querySelectorAll('a, button, .btn, .project-card, .skill-item, .cursor-toggle');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%, -50%) scale(1.5)');
    el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%, -50%) scale(1)');
  });
}

// ====== Magnetic Elements ======
function initMagneticElements() {
  const magneticElements = document.querySelectorAll('.btn, .logo, .social-links a, .cursor-toggle');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `translate(0px, 0px)`;
    });
  });
}

// ====== Tilt & Parallax Effects ======
function initTiltEffect() {
  const cards = document.querySelectorAll('.project-card, .profile-pic');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// ====== Click Particle Effect ======
document.addEventListener('mousedown', (e) => {
  if (e.target.closest('a, button, .project-card, .skill-item')) {
    createParticles(e.clientX, e.clientY);
  }
});

function createParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    document.body.appendChild(particle);

    const size = Math.random() * 4 + 2;
    const destinationX = (Math.random() - 0.5) * 120;
    const destinationY = (Math.random() - 0.5) * 120;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = '#00ff99';
    particle.style.position = 'fixed';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '10000';
    particle.style.borderRadius = '50%';
    particle.style.boxShadow = '0 0 10px #00ff99';

    const animation = particle.animate([
      { transform: `translate(0, 0) scale(1)`, opacity: 1 },
      { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 400,
      easing: 'cubic-bezier(0, .9, .57, 1)'
    });

    animation.onfinish = () => particle.remove();
  }
}
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ====== Mobile Menu ======
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');

  if (!hamburger || !navbar) return;

  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

// ====== Scroll Animations ======
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  reveals.forEach(reveal => {
    observer.observe(reveal);
  });
}

// ====== Scroll Progress Bar ======
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  });
}
function initContactForm() {
  const form = document.getElementById('messageForm');
  const status = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        status.innerHTML = 'Message sent successfully!';
        status.style.color = '#00ff99';
        form.reset();
      } else {
        status.innerHTML = 'Oops! There was a problem sending your message.';
        status.style.color = '#ff4d4d';
      }
    } catch (error) {
      status.innerHTML = 'Oops! There was a problem sending your message.';
      status.style.color = '#ff4d4d';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// ====== Profile Modal ======
function initProfileModal() {
  const profilePics = document.querySelectorAll('.profile-pic');

  // Create Modal Element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'profileModal';
  modal.innerHTML = `
        <div class="profile-card-modal">
            <div class="modal-close">&times;</div>
            <img src="pic.png" alt="Gaurav Raj" class="modal-img">
            <h2 class="modal-name">Gaurav Raj</h2>
            <p class="modal-title">Cybersecurity Enthusiast & Dev</p>
            <p class="modal-bio">2nd Year CS Student specializing in Cybersecurity. Passionate about building secure systems and ethical hacking.</p>
            <div class="modal-socials">
                <a href="https://github.com/gaurav7080" target="_blank"><i class="fab fa-github"></i></a>
                <a href="https://linkedin.com/in/its-me-gaurav" target="_blank"><i class="fab fa-linkedin"></i></a>
                <a href="https://instagram.com/gaurav_raj1907" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="mailto:gauravrajsaidnagar@gmail.com"><i class="fas fa-envelope"></i></a>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.modal-close');

  profilePics.forEach(pic => {
    pic.style.cursor = 'pointer';
    pic.addEventListener('click', () => {
      modal.classList.add('active');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

// ====== Skill Card Mouse Tracking ======
function initSkillCardTracking() {
  const cards = document.querySelectorAll('.skill-category');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}
