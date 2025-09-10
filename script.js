// Glitch effect: copy main text into glitch layers
document.addEventListener("DOMContentLoaded", function () {
  var glitchMain = document.querySelector(".glitch-main");
  var glitchLayers = document.querySelectorAll(".glitch");
  if (glitchMain && glitchLayers.length) {
    glitchLayers.forEach(function (layer) {
      layer.innerHTML = glitchMain.innerHTML;
    });
  }
});
// Add robust helpers and fallbacks to avoid silent failures when elements are missing
(function () {
  // respect user's reduced-motion preference
  const prefersReduced =
    (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    false;
  window._prefersReducedMotion = prefersReduced;

  // Provide a safe global createRipple if not already defined
  if (typeof window.createRipple !== "function") {
    window.createRipple = function (e, el) {
      if (!el) return;
      // disable ripples for users who prefer reduced motion
      if (window._prefersReducedMotion) return;
      try {
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple-anim";
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        const clientX =
          (e &&
            (e.clientX ||
              (e.touches && e.touches[0] && e.touches[0].clientX))) ||
          rect.left + rect.width / 2;
        const clientY =
          (e &&
            (e.clientY ||
              (e.touches && e.touches[0] && e.touches[0].clientY))) ||
          rect.top + rect.height / 2;
        ripple.style.left = clientX - rect.left - size / 2 + "px";
        ripple.style.top = clientY - rect.top - size / 2 + "px";
        ripple.style.pointerEvents = "none";
        el.appendChild(ripple);
        setTimeout(() => {
          try {
            ripple.remove();
          } catch (err) {}
        }, 650);
      } catch (err) {
        /* ignore */
      }
    };
  }

  // If HTML uses classes instead of IDs, ensure expected IDs exist so selectors work
  function ensureIds() {
    if (!document.getElementById("hamburger")) {
      const hb = document.querySelector(".hamburger");
      if (hb) hb.id = "hamburger";
    }
    if (!document.getElementById("navbar")) {
      const nb = document.querySelector("nav");
      if (nb) nb.id = "navbar";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureIds);
  } else {
    ensureIds();
  }
})();
// Advanced anti-inspect protection
// Disable right-click
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Block inspect element shortcuts
document.addEventListener("keydown", function (e) {
  // F12, Ctrl+Shift+I/J/C/U, Cmd+Opt+I (Mac)
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U") ||
    (e.metaKey && e.altKey && e.key === "I")
  ) {
    e.preventDefault();
    showAntiInspectOverlay();
  }
});

// Overlay deterrent
function showAntiInspectOverlay() {
  if (document.getElementById("antiInspectOverlay")) return;
  var overlay = document.createElement("div");
  overlay.id = "antiInspectOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.zIndex = 99999;
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.color = "#fff";
  overlay.style.fontSize = "2rem";
  overlay.style.fontFamily = "monospace";
  overlay.innerHTML = "Inspecting is disabled!";
  overlay.onclick = function () {
    overlay.remove();
  };
  document.body.appendChild(overlay);
  setTimeout(function () {
    overlay.remove();
  }, 3000);
}

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");
if (hamburger && navbar) {
  hamburger.addEventListener("click", () => {
    navbar.classList.toggle("open");
    hamburger.classList.toggle("active");
  });
  // Ripple animation for nav links (mobile)
  function createRipple(e, link) {
    const ripple = document.createElement("span");
    ripple.className = "ripple-anim";
    const rect = link.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    link.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }
  document.querySelectorAll("#navbar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      navbar.classList.remove("open");
      hamburger.classList.remove("active");
      // Smooth scroll to section
      const targetId = link.getAttribute("href").replace("#", "");
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Animate About Me section if visible
        if (targetId === "about") {
          target.classList.add("about-anim");
          setTimeout(() => target.classList.remove("about-anim"), 700);
        }
      }
    });
    link.addEventListener("touchstart", function (e) {
      e.stopPropagation();
      link.classList.add("active-anim");
      createRipple(e.touches ? e.touches[0] : e, link);
    });
    link.addEventListener("touchend", function () {
      setTimeout(() => link.classList.remove("active-anim"), 200);
    });
    link.addEventListener("mousedown", function (e) {
      e.stopPropagation();
      link.classList.add("active-anim");
      createRipple(e, link);
    });
    link.addEventListener("mouseup", function () {
      setTimeout(() => link.classList.remove("active-anim"), 200);
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
document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("mousedown", function (e) {
    card.classList.add("active-anim");
    createRipple(e, card);
  });
  card.addEventListener("mouseup", function () {
    setTimeout(() => card.classList.remove("active-anim"), 200);
  });
  card.addEventListener("touchstart", function (e) {
    card.classList.add("active-anim");
    createRipple(e.touches ? e.touches[0] : e, card);
  });
  card.addEventListener("touchend", function () {
    setTimeout(() => card.classList.remove("active-anim"), 200);
  });
});

// Skills tag ripple/click animation (prevent bubbling so parent projects don't open)
document.querySelectorAll(".skills span").forEach((tag) => {
  tag.addEventListener("mousedown", function (e) {
    e.stopPropagation();
    tag.classList.add("active-anim");
    createRipple(e, tag);
  });
  tag.addEventListener("mouseup", function (e) {
    e.stopPropagation();
    setTimeout(() => tag.classList.remove("active-anim"), 200);
  });
  tag.addEventListener("touchstart", function (e) {
    e.stopPropagation();
    tag.classList.add("active-anim");
    createRipple(e.touches ? e.touches[0] : e, tag);
  });
  tag.addEventListener("touchend", function (e) {
    e.stopPropagation();
    setTimeout(() => tag.classList.remove("active-anim"), 200);
  });
});

// Prevent clicks on contact links from bubbling to parent elements
document.querySelectorAll("#contact .contact-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  link.addEventListener("touchstart", function (e) {
    e.stopPropagation();
  });
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
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    // Use FormData for better compatibility with form endpoints
    const formData = new FormData(form);

    const endpoint = form.getAttribute("action") || "/api/message";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      let result = {};
      try {
        result = await response.json();
      } catch (err) {
        /* ignore */
      }

      if (response.ok) {
        if (status) status.textContent = "Message sent — thank you!";
        form.reset();
      } else {
        if (status)
          status.textContent =
            result.error || result.message || "Error: " + response.status;
      }
    } catch (err) {
      if (status)
        status.textContent = "Network error — please try again later.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (origBtnText) submitBtn.textContent = origBtnText;
      }
    }
  });
}

// ====== Matrix Rain Effect (low intensity) ======
(function () {
  // recreate canvas only if not present
  let canvas = document.getElementById("matrix-bg");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "matrix-bg";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const letters = "01";
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = new Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff99";
    ctx.font = fontSize + "px monospace";

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
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (e) {}
      return;
    }
    if (!lastMatrixTs || ts - lastMatrixTs > 100) {
      drawMatrix();
      lastMatrixTs = ts;
    }
    requestAnimationFrame(matrixLoop);
  }

  requestAnimationFrame(matrixLoop);

  window.addEventListener("resize", () => {
    resizeCanvas();
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  });
})();

// Custom cursor (desktop only) — improved: no focus-based hiding, smoother lag, press feedback
(function () {
  // Disable on touch devices
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add("custom-cursor-enabled");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  // ensure the cursor visuals are truly centered on the pointer
  // use fixed positioning + translate(-50%, -50%) so left/top refer to the center
  dot.style.position = "fixed";
  dot.style.pointerEvents = "none";
  // center using CSS transform + simple left/top coordinates. Remove setPos and its measurements (caused over-offset). Update enable/restore code to set raw coords so translate(-50%,-50%) centers elements reliably
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.zIndex = "2147483647";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.style.position = "fixed";
  ring.style.pointerEvents = "none";
  // Nudge the ring slightly up-left to visually center its glow
  // (the glow's blur can make the perceived center shift down-right on some displays)
  ring.style.transform = "translate(-50%, -50%) translate(-0.6px, -0.6px)";
  ring.style.zIndex = "2147483646";
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mouseX = window.innerWidth / 2,
    mouseY = window.innerHeight / 2;
  let ringX = mouseX,
    ringY = mouseY;

  // Smaller lag for snappier feel
  const LAG = 0.12;

  // update positions: left/top are the center (CSS handles translate(-50%,-50%))
  function update() {
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
    ringX += (mouseX - ringX) * LAG;
    ringY += (mouseY - ringY) * LAG;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";
    requestAnimationFrame(update);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover interactions — enlarge ring on interactive elements
  const hoverTargets =
    "a, button, .btn, .project, .skills span, nav a, .contact-links a";
  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () =>
      ring.classList.remove("cursor-hover")
    );
  });

  // Press feedback: shrink ring slightly on mousedown
  document.addEventListener("mousedown", () =>
    ring.classList.add("cursor-press")
  );
  document.addEventListener("mouseup", () =>
    ring.classList.remove("cursor-press")
  );

  // Improved toggle: show/hide cursor elements and restore positions when enabled
  (function () {
    // Use the in-menu power button (id="cursorPower") to toggle ON/OFF so the floating
    // button (id="cursorToggle") can be used only to open/close the menu. This avoids
    // the race where a single click both opens the menu and toggles the cursor state.
    const powerBtn = document.getElementById("cursorPower");
    let enabled = true;
    function setEnabled(v) {
      enabled = !!v;
      if (enabled) {
        document.documentElement.classList.add("custom-cursor-enabled");
        // restore display and reset classes
        [dot, ring].forEach((el) => {
          if (el) {
            el.style.display = "";
            el.classList.remove("cursor-hidden");
            el.classList.remove("cursor-press");
            el.classList.remove("cursor-hover");
            // ensure immediate position update
            // place elements centered at last known mouse coords
            var lx = window._lastMouseX || window.innerWidth / 2;
            var ly = window._lastMouseY || window.innerHeight / 2;
            // raw coords suffice because CSS transform centers the elements
            el.style.left = lx + "px";
            el.style.top = ly + "px";
          }
        });
        // hide native cursor via inline style as a fallback
        try {
          document.body.style.cursor = "none";
        } catch (e) {}
      } else {
        document.documentElement.classList.remove("custom-cursor-enabled");
        // hide cursor elements but keep them in DOM
        [dot, ring].forEach((el) => {
          if (el) el.style.display = "none";
        });
        // restore native cursor explicitly (fallback)
        try {
          document.body.style.cursor = "auto";
        } catch (e) {}
      }
      // update aria/state on power button (if present) and update floating toggle visual
      if (powerBtn)
        powerBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
      const floatingToggle = document.getElementById("cursorToggle");
      if (floatingToggle) floatingToggle.classList.toggle("off", !enabled);
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
  document.addEventListener("mousemove", (e) => {
    window._lastMouseX = e.clientX;
    window._lastMouseY = e.clientY;
  });

  requestAnimationFrame(update);
})();

// Floating cursor menu behavior + variant selection
(function () {
  const toggle = document.getElementById("cursorToggle");
  const menu = document.getElementById("cursorMenu");
  const powerBtn = document.getElementById("cursorPower");
  if (!menu) return; // menu is required, but toggle/power may be optional

  // ensure aria-hidden is present
  if (!menu.hasAttribute("aria-hidden"))
    menu.setAttribute("aria-hidden", "true");

  function showMenu(show) {
    menu.setAttribute("aria-hidden", show ? "false" : "true");
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
  menu.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  // toggle menu on click of floating toggle (if present) — only opens/closes menu
  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const hidden = menu.getAttribute("aria-hidden") === "true";
      showMenu(hidden);
    });
    // also support keyboard activation
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle.click();
      }
    });
  }

  // apply variant
  function applyVariant(name) {
    if (name) {
      document.documentElement.setAttribute("data-cursor", name);
      localStorage.setItem("cursorVariant", name);
    } else {
      document.documentElement.removeAttribute("data-cursor");
      localStorage.removeItem("cursorVariant");
    }
  }

  // update power button text/state and floating toggle visual
  function updatePowerButton() {
    const enabled =
      typeof window.cursorIsEnabled === "function"
        ? window.cursorIsEnabled()
        : document.documentElement.classList.contains("custom-cursor-enabled");
    if (powerBtn) {
      powerBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
      powerBtn.textContent = enabled ? "Cursor: ON" : "Cursor: OFF";
    }
    if (toggle) toggle.classList.toggle("off", !enabled);
  }

  // ensure variant buttons are defensive and stop propagation
  document.querySelectorAll(".cursor-opt[data-variant]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const v = btn.getAttribute("data-variant");
      applyVariant(v);
      showMenu(false);
    });
    btn.addEventListener("touchstart", (e) => {
      e.stopPropagation();
    });
  });

  // Toggle ON/OFF
  if (powerBtn) {
    powerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!canAct()) return;
      const currently =
        typeof window.cursorIsEnabled === "function"
          ? window.cursorIsEnabled()
          : document.documentElement.classList.contains(
              "custom-cursor-enabled"
            );
      const next = !currently;
      if (typeof window.cursorSetEnabled === "function") {
        window.cursorSetEnabled(next);
      } else {
        // fallback: directly toggle classes and elements
        document.documentElement.classList.toggle(
          "custom-cursor-enabled",
          next
        );
        document.querySelectorAll(".cursor-dot, .cursor-ring").forEach((el) => {
          el.style.display = next ? "" : "none";
        });
      }
      updatePowerButton();
      showMenu(false);
    });
    powerBtn.addEventListener("touchstart", (e) => {
      e.stopPropagation();
    });
  }

  // restore persisted variant
  const saved = localStorage.getItem("cursorVariant");
  if (saved) applyVariant(saved);

  // initialize power button state
  updatePowerButton();

  // close menu when clicking outside (but ignore clicks that originate from within menu)
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) showMenu(false);
  });

  // close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showMenu(false);
  });

  // Trail implementation (lightweight)
  function createTrailDot(x, y) {
    // respect reduced motion
    if (window._prefersReducedMotion) return;
    const d = document.createElement("div");
    d.className = "trail-dot";
    d.style.left = x + "px";
    d.style.top = y + "px";
    document.body.appendChild(d);
    setTimeout(() => {
      d.style.opacity = "0";
    }, 40);
    setTimeout(() => {
      try {
        d.remove();
      } catch (e) {}
    }, 650);
  }

  // hook into mousemove to create trail when variant=trail
  document.addEventListener("mousemove", (e) => {
    if (window._prefersReducedMotion) return;
    if (document.documentElement.getAttribute("data-cursor") === "trail") {
      createTrailDot(e.clientX, e.clientY);
    }
  });
})();

// Profile card modal: open when clicking profile image; supports edit/save (persisted to localStorage)
(function () {
  "use strict";
  function qs(sel) {
    return document.querySelector(sel);
  }
  function qsa(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  // Inject dedicated styles for the profile card once so the modal looks polished
  function ensureProfileCardStyles() {
    try {
      if (document.getElementById("profile-card-styles")) return;
      var st = document.createElement("style");
      st.id = "profile-card-styles";
      st.innerHTML =
        "\n        /* Profile card modal visuals */\n        .profile-card-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.56);backdrop-filter:blur(6px) saturate(120%);z-index:99999;padding:28px;}\n        .profile-card{position:relative;min-width:280px;max-width:640px;width:min(88vw,640px);background:linear-gradient(180deg,#0b0b0b, #0f1112);border-radius:14px;padding:20px 20px 18px;color:#e6ffef;box-shadow:0 18px 50px rgba(0,0,0,0.75), 0 0 32px rgba(0,255,153,0.03) inset;border:1px solid rgba(0,255,153,0.06);transform:translateY(18px) scale(0.985);opacity:0;transition:transform 260ms cubic-bezier(.2,.9,.2,1),opacity 220ms ease;overflow:hidden;}\n        .profile-card.pc-open{transform:translateY(0) scale(1);opacity:1;}\n        .pc-header{display:flex;gap:16px;align-items:center;}\n        .pc-avatar{width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid rgba(0,255,153,0.10);box-shadow:0 8px 28px rgba(0,255,153,0.06);}\n        .pc-info{min-width:0;}\n        .pc-name{margin:0;font-size:1.25rem;color:#ffffff;text-shadow:0 2px 18px rgba(0,255,153,0.04);}\n        .pc-bio{margin:6px 0 0;color:#bfeee0;line-height:1.35;font-size:0.96rem;opacity:0.95;}\n        .pc-socials{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;}\n        /* stronger default background and hover for better contrast */\n        .pc-social-link{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.02);color:#bfffe0;font-size:1.06rem;transition:transform 160ms ease,background 160ms ease,box-shadow 180ms ease;border:1px solid rgba(255,255,255,0.02);}\n        .pc-social-link i{pointer-events:none;}\n        .pc-social-link:hover{transform:translateY(-6px) scale(1.04);background:linear-gradient(90deg,rgba(0,255,153,0.16),rgba(0,255,153,0.04));box-shadow:0 12px 30px rgba(0,255,153,0.12);color:#eafff0;border-color:rgba(0,255,153,0.14);}\n        .pc-social-link:focus-visible{outline:2px solid rgba(0,255,153,0.14);box-shadow:0 8px 26px rgba(0,255,153,0.08);}\n        .pc-close{position:absolute;top:12px;right:12px;background:transparent;border:none;color:#dfffe9;font-size:1.4rem;padding:6px;border-radius:8px;cursor:pointer;transition:transform 160ms ease,background 120ms ease;}\n        .pc-close:hover{background:rgba(255,255,255,0.03);transform:translateY(-3px);}\n        @media (max-width:420px){.profile-card{padding:14px}.pc-avatar{width:72px;height:72px}.pc-name{font-size:1.05rem}}\n      ";
      document.head.appendChild(st);
    } catch (e) {}
  }

  function buildSocialButtons(links) {
    // Render icon-only links (no visible text) for a cleaner profile card.
    return links
      .map(function (l) {
        var href = l && l.href ? l.href : l || "#";
        var icon = "";
        if ((href || "").indexOf("github.com") > -1) icon = "fab fa-github";
        else if ((href || "").indexOf("linkedin.com") > -1)
          icon = "fab fa-linkedin";
        else if ((href || "").indexOf("instagram.com") > -1)
          icon = "fab fa-instagram";
        else if (
          (href || "").indexOf("mailto:") > -1 ||
          (href || "").indexOf("mail") > -1
        )
          icon = "fa fa-envelope";
        else icon = "fa fa-link";
        var title =
          l && l.label
            ? l.label
            : (href || "")
                .replace(/https?:\/\//, "")
                .replace(/www\./, "")
                .split("/")[0] || href;
        return (
          '<a class="pc-social-link" href="' +
          href +
          '" target="_blank" rel="noopener noreferrer" title="' +
          title +
          '" aria-label="' +
          title +
          '"><i class="' +
          icon +
          '" aria-hidden="true"></i></a>'
        );
      })
      .join("");
  }

  function getInitialData() {
    // try localStorage first
    try {
      var saved = localStorage.getItem("profileCardData");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // fallback: read from DOM
    var nameEl = qs("#hero-heading .highlight") || qs("#hero-heading") || null;
    var name = nameEl ? nameEl.textContent.trim() : "Gaurav Raj";
    var bioEl = qs("#about .about-text p");
    var bio = bioEl
      ? bioEl.textContent.trim()
      : "Computer Science student and cybersecurity enthusiast.";
    var socials = qsa("#contact .contact-links a").map(function (a) {
      return {
        href: a.href,
        label: a.getAttribute("title") || a.textContent.trim() || a.href,
      };
    });
    if (!socials.length) {
      socials = [
        { href: "https://github.com/gaurav7080", label: "GitHub" },
        { href: "mailto:gauravrajsaidnagar@gmail.com", label: "Email" },
      ];
    }
    return { name: name, bio: bio, socials: socials };
  }

  function renderModal(data) {
    // ensure the styles are present
    ensureProfileCardStyles();

    // remember what had focus so we can restore it when modal closes
    var previouslyFocused = document.activeElement;
    var wrapper = document.createElement("div");
    wrapper.className = "profile-card-modal";
    wrapper.innerHTML =
      '\n      <div class="profile-card" role="dialog" aria-modal="true" aria-labelledby="pc-name">\n        <button class="pc-close" aria-label="Close profile dialog">&times;</button>\n        <div class="pc-header">\n          <img src="pic.png" alt="' +
      data.name +
      ' avatar" class="pc-avatar">\n          <div class="pc-info">\n            <h3 id="pc-name" class="pc-name">' +
      (data.name || "") +
      '</h3>\n            <p class="pc-bio">' +
      (data.bio || "") +
      '</p>\n          </div>\n        </div>\n        <div class="pc-socials">' +
      buildSocialButtons(data.socials) +
      "</div>\n      </div>\n    ";

    document.body.appendChild(wrapper);

    // small open animation trigger
    requestAnimationFrame(function () {
      try {
        var card = wrapper.querySelector(".profile-card");
        if (card) card.classList.add("pc-open");
      } catch (e) {}
    });

    // disable body scroll
    document.documentElement.style.overflow = "hidden";

    var closeBtn = wrapper.querySelector(".pc-close");

    function close() {
      try {
        // blur any focused element to remove stray caret
        if (
          document.activeElement &&
          typeof document.activeElement.blur === "function"
        ) {
          document.activeElement.blur();
        }
        // clear any text selection
        try {
          window.getSelection && window.getSelection().removeAllRanges();
        } catch (e) {}
        // reverse animation for a smoother close
        try {
          var card = wrapper.querySelector(".profile-card");
          if (card) {
            card.classList.remove("pc-open");
          }
        } catch (e) {}
        setTimeout(function () {
          try {
            wrapper.remove();
          } catch (e) {}
        }, 180);
      } catch (e) {}
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);

      // restore focus to the element that had focus before modal opened (or profile image)
      try {
        if (
          previouslyFocused &&
          previouslyFocused.focus &&
          document.contains(previouslyFocused)
        ) {
          previouslyFocused.focus();
        } else {
          var protoImg =
            document.querySelector(".profile-pic") ||
            document.querySelector(".hero-image img");
          if (protoImg && typeof protoImg.focus === "function")
            protoImg.focus();
        }
      } catch (err) {}
    }

    function onKey(e) {
      if (e.key === "Escape") close();
    }

    closeBtn.addEventListener("click", close);
    wrapper.addEventListener("click", function (e) {
      if (e.target === wrapper) close();
    });
    document.addEventListener("keydown", onKey);

    // focus management
    var firstFocusable = wrapper.querySelector(".pc-close");
    if (firstFocusable) firstFocusable.focus();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var img = qs(".profile-pic");
    if (!img) img = qs(".hero-image img");
    if (!img) return;
    img.style.cursor = "pointer";
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", "Open profile card");

    img.addEventListener("click", function () {
      var data = getInitialData();
      renderModal(data);
    });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var data = getInitialData();
        renderModal(data);
      }
    });
  });
})();

// Prevent mouse-triggered stray caret/line: blur focused element on mousedown
// but allow focus when interacting with real text controls (keyboard users still keep focus behavior).
document.addEventListener(
  "mousedown",
  function (e) {
    try {
      var tg = e.target;
      // If clicking inside a real text control or editable area, do nothing
      if (!tg) return;
      if (
        tg.closest &&
        tg.closest('input, textarea, select, [contenteditable="true"]')
      )
        return;
      if (
        tg.tagName === "INPUT" ||
        tg.tagName === "TEXTAREA" ||
        tg.tagName === "SELECT"
      )
        return;
      // allow clicks on form controls to behave normally
      // Blur the active element to remove stray caret (only for mouse interactions)
      if (
        document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }
      // clear any selection ranges which can also show a caret/selection
      try {
        window.getSelection && window.getSelection().removeAllRanges();
      } catch (err) {}
    } catch (err) {
      /* ignore */
    }
  },
  true
);

// Accessibility: suppress visible focus outlines / caret for mouse interactions only.
(function () {
  try {
    const docEl = document.documentElement;
    // Inject a small stylesheet to hide focus outlines when using mouse
    if (!document.getElementById("mouse-focus-style")) {
      const style = document.createElement("style");
      style.id = "mouse-focus-style";
      style.textContent =
        '\n        html.using-mouse *:focus:not(input):not(textarea):not(select):not([contenteditable="true"]) {\n          outline: none !important;\n          box-shadow: none !important;\n          caret-color: transparent !important;\n        }\n      ';
      document.head.appendChild(style);
    }

    let clearTimer = 0;
    function markUsingMouse() {
      docEl.classList.add("using-mouse");
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        try {
          docEl.classList.remove("using-mouse");
        } catch (e) {}
      }, 1200);
    }

    // Pointer interactions => temporarily treat user as mouse-driven
    document.addEventListener("mousedown", markUsingMouse, true);
    document.addEventListener("touchstart", markUsingMouse, true);

    // Keyboard navigation (Tab/Arrow/Enter) should restore focus rings
    document.addEventListener(
      "keydown",
      function (e) {
        const k = e.key;
        if (
          k === "Tab" ||
          k === "ArrowUp" ||
          k === "ArrowDown" ||
          k === "ArrowLeft" ||
          k === "ArrowRight" ||
          k === "Enter"
        ) {
          try {
            docEl.classList.remove("using-mouse");
          } catch (e) {}
        }
      },
      true
    );
  } catch (err) {
    /* ignore safety errors */
  }
})();

// Force-hide focus outline/caret on non-text elements (removes the stray line)
(function () {
  try {
    if (!document.getElementById("force-hide-caret")) {
      var s = document.createElement("style");
      s.id = "force-hide-caret";
      s.type = "text/css";
      s.appendChild(
        document.createTextNode(
          '\n        *:focus:not(input):not(textarea):not(select):not([contenteditable="true"]) {\n          outline: none !important;\n          box-shadow: none !important;\n          caret-color: transparent !important;\n        }\n        a:focus { outline: none !important; box-shadow: none !important; }\n      '
        )
      );
      document.head.appendChild(s);
    }
  } catch (e) {
    /* ignore */
  }
})();
// git add .
//    git commit -m "Renamed gaurav.html to index.html and updated scripts/styles"
//  git push origin main