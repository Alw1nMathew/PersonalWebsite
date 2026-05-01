/* ══════════════════════════════════════════════
   ALWIN MATHEW — PERSONAL SITE
   main.js
══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1. CUSTOM CURSOR
────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with slight lag
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow on interactive elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .skill-chip, .project-card, .social-link, .form-input, .form-textarea'
  );
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ──────────────────────────────────────────────
   2. HAMBURGER / MOBILE MENU
────────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
})();

function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}


/* ──────────────────────────────────────────────
   3. NAVBAR SCROLL STYLE
────────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ──────────────────────────────────────────────
   4. MAGNETIC PARTICLE CONSTELLATION
────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Config
  const CONNECT_DIST   = 120;
  const ATTRACT_RADIUS = 150;
  const ATTRACT_POWER  = 0.05;
  const MAX_SPEED      = 3.5;
  const FRICTION       = 0.975;
  const GOLD_COLOR     = [201, 168, 76];
  const MUTED_COLOR    = [136, 134, 168];

  let W, H;
  let particles = [];
  let mouse = { x: -9999, y: -9999, inside: false };

  // Resize
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); spawnParticles(); });

  // Spawn particles based on canvas area
  function spawnParticles() {
    const count = Math.min(Math.floor((W * H) / 6500), 200);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.6 + 0.5,
      gold: Math.random() < 0.28,
      baseAlpha: Math.random() * 0.45 + 0.18,
    }));
  }
  spawnParticles();

  // Mouse tracking — only within the canvas
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.inside = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.inside = false; });

  // Click → explosion
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    particles.forEach(p => {
      const dx = p.x - cx, dy = p.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 260 && dist > 0) {
        const force = ((260 - dist) / 260) * 7;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    });
  });

  function rgba([r, g, b], a) {
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── Update & draw particles ──
    particles.forEach(p => {
      // Magnetic pull toward cursor
      if (mouse.inside) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ATTRACT_RADIUS && dist > 0) {
          const strength = ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS) * ATTRACT_POWER;
          p.vx += (dx / dist) * strength * 3.5;
          p.vy += (dy / dist) * strength * 3.5;
        }
      }

      // Friction & speed cap
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Soft wall bounce
      if (p.x < 0)  { p.x = 0;  p.vx = Math.abs(p.vx) * 0.65; }
      if (p.x > W)  { p.x = W;  p.vx = -Math.abs(p.vx) * 0.65; }
      if (p.y < 0)  { p.y = 0;  p.vy = Math.abs(p.vy) * 0.65; }
      if (p.y > H)  { p.y = H;  p.vy = -Math.abs(p.vy) * 0.65; }

      // Is particle near cursor?
      const nearCursor = mouse.inside && Math.hypot(mouse.x - p.x, mouse.y - p.y) < ATTRACT_RADIUS;
      const alpha = nearCursor ? Math.min(p.baseAlpha * 2.2, 0.92) : p.baseAlpha;
      const r     = nearCursor ? p.r * 1.55 : p.r;
      const color = p.gold ? GOLD_COLOR : MUTED_COLOR;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, alpha);
      ctx.fill();
    });

    // ── Draw connections ──
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const pi = particles[i], pj = particles[j];
        const dx = pi.x - pj.x, dy = pi.y - pj.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONNECT_DIST) {
          const fade      = 1 - dist / CONNECT_DIST;
          const bothGold  = pi.gold && pj.gold;
          const lineAlpha = bothGold ? fade * 0.38 : fade * 0.14;
          const color     = bothGold ? GOLD_COLOR : MUTED_COLOR;

          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = rgba(color, lineAlpha);
          ctx.lineWidth   = bothGold ? 0.7 : 0.35;
          ctx.stroke();
        }
      }
    }

    // ── Cursor glow ──
    if (mouse.inside) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
      grad.addColorStop(0, 'rgba(201,168,76,0.09)');
      grad.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


/* ──────────────────────────────────────────────
   5. GOLDEN SCROLL TIMELINE THREAD
────────────────────────────────────────────── */
(function initTimeline() {
  const threadFill = document.getElementById('thread-fill');
  if (!threadFill) return;

  const SECTIONS = ['home', 'about', 'projects', 'contact'];
  const dots = SECTIONS.map(id => document.getElementById('dot-' + id));
  const navLinks = document.querySelectorAll('.nav-link');

  function getOffset(id) {
    const el = document.getElementById(id);
    return el ? el.offsetTop : 0;
  }

  function positionDots() {
    const navH    = document.getElementById('navbar').offsetHeight;
    const viewH   = window.innerHeight - navH;
    const totalH  = document.body.scrollHeight - navH;

    SECTIONS.forEach((id, i) => {
      const dotEl = dots[i];
      if (!dotEl) return;
      const sectionTop = getOffset(id) - navH;
      const pct = Math.max(0, Math.min(100, (sectionTop / totalH) * 100));
      dotEl.style.top = pct + '%';
    });
  }
  positionDots();
  window.addEventListener('resize', positionDots);

  function onScroll() {
    const scrollY  = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const pct      = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

    // Grow the fill
    threadFill.style.height = pct + '%';

    // Activate dots as each section is reached
    let currentSection = SECTIONS[0];
    SECTIONS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dotEl = dots[i];

      const reached = scrollY >= el.offsetTop - window.innerHeight * 0.45;
      if (dotEl) dotEl.classList.toggle('active', reached);
      if (reached) currentSection = id;
    });

    // Sync nav active link
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentSection);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ──────────────────────────────────────────────
   6. SCROLL REVEAL
────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   7. CONTACT FORM
────────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  // Simulate send
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    form.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
    success.classList.add('visible');
    setTimeout(() => success.classList.remove('visible'), 4000);
  }, 1000);
}
