// Add robust helpers and fallbacks to avoid silent failures when elements are missing
(function() {
  // respect user's reduced-motion preference
  const prefersReduced = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;
  window._prefersReducedMotion = prefersReduced;

  // Provide a safe global createRipple if not already defined
  if (typeof window.createRipple !== 'function') {
    window.createRipple = function(e, el) {
      if (!el) return;
      // disable ripples for users who prefer reduced motion
      if (window._prefersReducedMotion) return;
      try {
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-anim';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        const clientX = (e && (e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX))) || (rect.left + rect.width/2);
        const clientY = (e && (e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY))) || (rect.top + rect.height/2);
        ripple.style.left = (clientX - rect.left - size/2) + 'px';
        ripple.style.top = (clientY - rect.top - size/2) + 'px';
        ripple.style.pointerEvents = 'none';
        el.appendChild(ripple);
        setTimeout(() => { try { ripple.remove(); } catch (err) {} }, 650);
      } catch (err) { /* ignore */ }
    };
  }

  // If HTML uses classes instead of IDs, ensure expected IDs exist so selectors work
  function ensureIds() {
    if (!document.getElementById('hamburger')) {
      const hb = document.querySelector('.hamburger');
      if (hb) hb.id = 'hamburger';
    }
    if (!document.getElementById('navbar')) {
      const nb = document.querySelector('nav');
      if (nb) nb.id = 'navbar';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureIds);
  } else {
    ensureIds();
  }
})();
// Advanced anti-inspect protection
// Disable right-click
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// Block inspect element shortcuts
document.addEventListener('keydown', function(e) {
  // F12, Ctrl+Shift+I/J/C/U, Cmd+Opt+I (Mac)
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
    (e.ctrlKey && e.key === 'U') ||
    (e.metaKey && e.altKey && e.key === 'I')
  ) {
    e.preventDefault();
    showAntiInspectOverlay();
  }
});

// Overlay deterrent
function showAntiInspectOverlay() {
  if (document.getElementById('antiInspectOverlay')) return;
  var overlay = document.createElement('div');
  overlay.id = 'antiInspectOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.zIndex = 99999;
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = '#fff';
  overlay.style.fontSize = '2rem';
  overlay.style.fontFamily = 'monospace';
  overlay.innerHTML = 'Inspecting is disabled!';
  overlay.onclick = function() {
    overlay.remove();
  };
  document.body.appendChild(overlay);
  setTimeout(function() {
    overlay.remove();
  }, 3000);
}

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');
if (hamburger && navbar) {
  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
  // Ripple animation for nav links (mobile)
  function createRipple(e, link) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-anim';
    const rect = link.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    link.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }
  document.querySelectorAll('#navbar a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navbar.classList.remove('open');
      hamburger.classList.remove('active');
      // Smooth scroll to section
      const targetId = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Animate About Me section if visible
        if (targetId === 'about') {
          target.classList.add('about-anim');
          setTimeout(() => target.classList.remove('about-anim'), 700);
        }
      }
    });
    link.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      link.classList.add('active-anim');
      createRipple(e.touches ? e.touches[0] : e, link);
    });
    link.addEventListener('touchend', function() {
      setTimeout(() => link.classList.remove('active-anim'), 200);
    });
    link.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      link.classList.add('active-anim');
      createRipple(e, link);
    });
    link.addEventListener('mouseup', function() {
      setTimeout(() => link.classList.remove('active-anim'), 200);
    });
  });
}
// Navbar scroll animation
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 60) {
    header.style.background = "rgba(17, 17, 17, 0.95)";
    header.style.borderBottom = "2px solid #00ff99";
  } else {
    header.style.background = "rgba(17, 17, 17, 0.75)";
    header.style.borderBottom = "2px solid transparent";
  }
});

// Project card click/tap ripple animation only
document.querySelectorAll('.project').forEach(card => {
  card.addEventListener('mousedown', function(e) {
    card.classList.add('active-anim');
    createRipple(e, card);
  });
  card.addEventListener('mouseup', function() {
    setTimeout(() => card.classList.remove('active-anim'), 200);
  });
  card.addEventListener('touchstart', function(e) {
    card.classList.add('active-anim');
    createRipple(e.touches ? e.touches[0] : e, card);
  });
  card.addEventListener('touchend', function() {
    setTimeout(() => card.classList.remove('active-anim'), 200);
  });
});

// Skills tag ripple/click animation (prevent bubbling so parent projects don't open)
document.querySelectorAll('.skills span').forEach(tag => {
  tag.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    tag.classList.add('active-anim');
    createRipple(e, tag);
  });
  tag.addEventListener('mouseup', function(e) {
    e.stopPropagation();
    setTimeout(() => tag.classList.remove('active-anim'), 200);
  });
  tag.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    tag.classList.add('active-anim');
    createRipple(e.touches ? e.touches[0] : e, tag);
  });
  tag.addEventListener('touchend', function(e) {
    e.stopPropagation();
    setTimeout(() => tag.classList.remove('active-anim'), 200);
  });
});

// Prevent clicks on contact links from bubbling to parent elements
document.querySelectorAll('#contact .contact-links a').forEach(link => {
  link.addEventListener('click', function(e) { e.stopPropagation(); });
  link.addEventListener('touchstart', function(e) { e.stopPropagation(); });
});
// Handle contact form submission via AJAX (uses form.action — Formspree endpoint)
const form = document.getElementById("messageForm");
const status = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (status) status.textContent = "Sending...";

    // disable submit while sending and show inline feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const origBtnText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

    // Use FormData for better compatibility with form endpoints
    const formData = new FormData(form);

    const endpoint = form.getAttribute('action') || '/api/message';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      let result = {};
      try { result = await response.json(); } catch (err) { /* ignore */ }

      if (response.ok) {
        if (status) status.textContent = 'Message sent — thank you!';
        form.reset();
      } else {
        if (status) status.textContent = result.error || result.message || ('Error: ' + response.status);
      }
    } catch (err) {
      if (status) status.textContent = 'Network error — please try again later.';
    } finally {
      if (submitBtn) { submitBtn.disabled = false; if (origBtnText) submitBtn.textContent = origBtnText; }
    }
  });
}


// ====== Matrix Rain Effect (low intensity) ======
(function() {
  // recreate canvas only if not present
  let canvas = document.getElementById('matrix-bg');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'matrix-bg';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const letters = '01';
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = new Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff99';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // use requestAnimationFrame with a simple timestamp throttle (~100ms) and
  // respect prefers-reduced-motion (stop animation for those users)
  let lastMatrixTs = 0;
  function matrixLoop(ts) {
    if (window._prefersReducedMotion) {
      // clear the canvas and do not animate when user prefers reduced motion
      try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (e) {}
      return;
    }
    if (!lastMatrixTs || (ts - lastMatrixTs) > 100) {
      drawMatrix();
      lastMatrixTs = ts;
    }
    requestAnimationFrame(matrixLoop);
  }

  requestAnimationFrame(matrixLoop);

  window.addEventListener('resize', () => {
    resizeCanvas();
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  });
})();

// Custom cursor (desktop only) — improved: no focus-based hiding, smoother lag, press feedback
(function() {
  // Disable on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add('custom-cursor-enabled');

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  // Smaller lag for snappier feel
  const LAG = 0.12;

  function update() {
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    ringX += (mouseX - ringX) * LAG;
    ringY += (mouseY - ringY) * LAG;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(update);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover interactions — enlarge ring on interactive elements
  const hoverTargets = 'a, button, .btn, .project, .skills span, nav a, .contact-links a';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });

  // Press feedback: shrink ring slightly on mousedown
  document.addEventListener('mousedown', () => ring.classList.add('cursor-press'));
  document.addEventListener('mouseup', () => ring.classList.remove('cursor-press'));

  // Improved toggle: show/hide cursor elements and restore positions when enabled
  (function() {
    // Use the in-menu power button (id="cursorPower") to toggle ON/OFF so the floating
    // button (id="cursorToggle") can be used only to open/close the menu. This avoids
    // the race where a single click both opens the menu and toggles the cursor state.
    const powerBtn = document.getElementById('cursorPower');
    let enabled = true;
    function setEnabled(v) {
      enabled = !!v;
      if (enabled) {
        document.documentElement.classList.add('custom-cursor-enabled');
        // restore display and reset classes
        [dot, ring].forEach(el => {
          if (el) {
            el.style.display = '';
            el.classList.remove('cursor-hidden');
            el.classList.remove('cursor-press');
            el.classList.remove('cursor-hover');
            // ensure immediate position update
            el.style.left = (window._lastMouseX || (window.innerWidth/2)) + 'px';
            el.style.top = (window._lastMouseY || (window.innerHeight/2)) + 'px';
          }
        });
        // hide native cursor via inline style as a fallback
        try { document.body.style.cursor = 'none'; } catch (e) {}
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled');
        // hide cursor elements but keep them in DOM
        [dot, ring].forEach(el => { if (el) el.style.display = 'none'; });
        // restore native cursor explicitly (fallback)
        try { document.body.style.cursor = 'auto'; } catch (e) {}
      }
      // update aria/state on power button (if present) and update floating toggle visual
      if (powerBtn) powerBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      const floatingToggle = document.getElementById('cursorToggle');
      if (floatingToggle) floatingToggle.classList.toggle('off', !enabled);
      // expose a stable global flag
      window._cursorEnabled = enabled;
    }

    // expose a small API so other code can toggle reliably
    window.cursorSetEnabled = setEnabled;
    window.cursorIsEnabled = () => enabled;

    // initialize state
    setEnabled(true);
  })();

  // Track latest mouse coords globally so toggle can restore position
  document.addEventListener('mousemove', (e) => { window._lastMouseX = e.clientX; window._lastMouseY = e.clientY; });

  requestAnimationFrame(update);
})();

// Floating cursor menu behavior + variant selection
(function() {
  const toggle = document.getElementById('cursorToggle');
  const menu = document.getElementById('cursorMenu');
  const powerBtn = document.getElementById('cursorPower');
  if (!menu) return; // menu is required, but toggle/power may be optional

  // ensure aria-hidden is present
  if (!menu.hasAttribute('aria-hidden')) menu.setAttribute('aria-hidden', 'true');

  function showMenu(show) {
    menu.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  // small debounce to avoid double firing (open + toggle) on fast clicks
  let lastAction = 0;
  function canAct() {
    const now = Date.now();
    if (now - lastAction < 180) return false;
    lastAction = now;
    return true;
  }

  // prevent clicks inside menu from bubbling to document (which would close it)
  menu.addEventListener('pointerdown', (e) => { e.stopPropagation(); });

  // toggle menu on click of floating toggle (if present) — only opens/closes menu
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const hidden = menu.getAttribute('aria-hidden') === 'true';
      showMenu(hidden);
    });
    // also support keyboard activation
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });
  }

  // apply variant
  function applyVariant(name) {
    if (name) {
      document.documentElement.setAttribute('data-cursor', name);
      localStorage.setItem('cursorVariant', name);
    } else {
      document.documentElement.removeAttribute('data-cursor');
      localStorage.removeItem('cursorVariant');
    }
  }

  // update power button text/state and floating toggle visual
  function updatePowerButton() {
    const enabled = (typeof window.cursorIsEnabled === 'function') ? window.cursorIsEnabled() : document.documentElement.classList.contains('custom-cursor-enabled');
    if (powerBtn) {
      powerBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      powerBtn.textContent = enabled ? 'Cursor: ON' : 'Cursor: OFF';
    }
    if (toggle) toggle.classList.toggle('off', !enabled);
  }

  // ensure variant buttons are defensive and stop propagation
  document.querySelectorAll('.cursor-opt[data-variant]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const v = btn.getAttribute('data-variant');
      applyVariant(v);
      showMenu(false);
    });
    btn.addEventListener('touchstart', (e) => { e.stopPropagation(); });
  });

  // Toggle ON/OFF
  if (powerBtn) {
    powerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const currently = (typeof window.cursorIsEnabled === 'function') ? window.cursorIsEnabled() : document.documentElement.classList.contains('custom-cursor-enabled');
      const next = !currently;
      if (typeof window.cursorSetEnabled === 'function') {
        window.cursorSetEnabled(next);
      } else {
        // fallback: directly toggle classes and elements
        document.documentElement.classList.toggle('custom-cursor-enabled', next);
        document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => { el.style.display = next ? '' : 'none'; });
      }
      updatePowerButton();
      showMenu(false);
    });
    powerBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); });
  }

  // restore persisted variant
  const saved = localStorage.getItem('cursorVariant');
  if (saved) applyVariant(saved);

  // initialize power button state
  updatePowerButton();

  // close menu when clicking outside (but ignore clicks that originate from within menu)
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) showMenu(false);
  });

  // close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') showMenu(false);
  });

  // Trail implementation (lightweight)
  function createTrailDot(x, y) {
    // respect reduced motion
    if (window._prefersReducedMotion) return;
    const d = document.createElement('div');
    d.className = 'trail-dot';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    document.body.appendChild(d);
    setTimeout(() => { d.style.opacity = '0'; }, 40);
    setTimeout(() => { try { d.remove(); } catch (e) {} }, 650);
  }

  // hook into mousemove to create trail when variant=trail
  document.addEventListener('mousemove', (e) => {
    if (window._prefersReducedMotion) return;
    if (document.documentElement.getAttribute('data-cursor') === 'trail') {
      createTrailDot(e.clientX, e.clientY);
    }
  });
})();
