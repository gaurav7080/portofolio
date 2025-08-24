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
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      navbar.classList.remove('open');
      hamburger.classList.remove('active');
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
// Handle form submission
const form = document.getElementById("messageForm");
const status = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };

  try {
    const response = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();

    if (response.ok) {
      status.textContent = "Message sent successfully!";
      form.reset();
    } else {
      status.textContent = "Error: " + result.error;
    }
  } catch (err) {
    status.textContent = "Error sending message!";
  }
});


// ====== Matrix Rain Effect (low intensity) ======
const canvas = document.createElement("canvas");
canvas.id = "matrix-bg";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "01";
const fontSize = 16;
const columns = canvas.width / fontSize;
let drops = [];

for (let x = 0; x < columns; x++) {
  drops[x] = 1;
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff99";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    let text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 100);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
