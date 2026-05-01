/* =============================================
   ALWIN MATHEW — main.js
   All interactive behaviour
============================================= */

/* ─────────────────────────────────────────────
   CURSOR  (gold dot that follows the mouse)
───────────────────────────────────────────── */
(function () {
  var dot = document.getElementById('cursor');
  if (!dot) return;

  var mx = -100, my = -100;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '1';
  });
})();


/* ─────────────────────────────────────────────
   NAVBAR — goes solid on scroll
───────────────────────────────────────────── */
(function () {
  var nav = document.getElementById('navbar');
  if (!nav) return;

  function update() {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────────
   HAMBURGER / MOBILE MENU
───────────────────────────────────────────── */
var hamburger  = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });
}

function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}


/* ─────────────────────────────────────────────
   SCROLL REVEAL  (About / Projects / Contact only)
───────────────────────────────────────────── */
(function () {
  // Only target reveals OUTSIDE the home section
  var targets = document.querySelectorAll('#about .reveal, #about .reveal-left, #projects .reveal, #projects .reveal-left, #contact .reveal, #contact .reveal-left');
  if (!targets.length) return;

  function showEl(el) {
    el.classList.add('visible');
  }

  // Fallback: reveal everything after 2s in case observer fails
  var fallbackTimer = setTimeout(function () {
    targets.forEach(showEl);
  }, 2000);

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showEl(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { obs.observe(el); });
  } else {
    // No IntersectionObserver — just reveal all immediately
    clearTimeout(fallbackTimer);
    targets.forEach(showEl);
  }

  // Also immediately reveal anything already scrolled into view
  targets.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      showEl(el);
    }
  });
})();


/* ─────────────────────────────────────────────
   SCROLL HINT — hide after first scroll
───────────────────────────────────────────── */
(function () {
  var hint = document.getElementById('scroll-hint');
  if (!hint) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      hint.classList.add('hidden');
    }
  }, { passive: true, once: true });
})();


/* ─────────────────────────────────────────────
   GOLDEN THREAD TIMELINE
───────────────────────────────────────────── */
(function () {
  var fill = document.getElementById('thread-fill');
  if (!fill) return;

  var sectionIds = ['home', 'about', 'projects', 'contact'];
  var navLinks   = document.querySelectorAll('.nav-link');

  // Position each dot at the top of its section
  function positionDots() {
    var navH  = document.getElementById('navbar').offsetHeight;
    var bodyH = document.body.scrollHeight - navH;

    sectionIds.forEach(function (id) {
      var dot = document.getElementById('dot-' + id);
      var sec = document.getElementById(id);
      if (!dot || !sec) return;
      var pct = Math.max(0, Math.min(100, ((sec.offsetTop - navH) / bodyH) * 100));
      dot.style.top = pct + '%';
    });
  }

  positionDots();
  window.addEventListener('resize', positionDots);

  function onScroll() {
    var scrollY  = window.scrollY;
    var maxScroll = document.body.scrollHeight - window.innerHeight;
    var pct       = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

    // Grow the gold fill
    fill.style.height = pct + '%';

    // Activate dots and track current section
    var current = sectionIds[0];
    sectionIds.forEach(function (id) {
      var dot = document.getElementById('dot-' + id);
      var sec = document.getElementById(id);
      if (!dot || !sec) return;

      var reached = scrollY >= sec.offsetTop - window.innerHeight * 0.45;
      dot.classList.toggle('active', reached);
      if (reached) current = id;
    });

    // Sync nav active link
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once immediately
})();


/* ─────────────────────────────────────────────
   MAGNETIC PARTICLE CONSTELLATION
───────────────────────────────────────────── */
(function () {
  var canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  /* -- Config -- */
  var CONNECT_DIST    = 110;
  var ATTRACT_RADIUS  = 140;
  var ATTRACT_POWER   = 0.045;
  var MAX_SPEED       = 3.2;
  var FRICTION        = 0.978;
  var GOLD   = [201, 168, 76];
  var MUTED_C = [136, 134, 168];

  var W = 0, H = 0;
  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };

  /* -- Size canvas to fill #home section -- */
  function resize() {
    var section = document.getElementById('home');
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }

  window.addEventListener('resize', function () {
    resize();
    spawnParticles();
  });
  resize();

  /* -- Create particles -- */
  function spawnParticles() {
    var count = Math.min(Math.floor((W * H) / 6500), 190);
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 1.5 + 0.5,
        gold: Math.random() < 0.28,
        alpha: Math.random() * 0.45 + 0.18
      });
    }
  }
  spawnParticles();

  /* -- Mouse tracking (relative to canvas) -- */
  canvas.addEventListener('mousemove', function (e) {
    var rect   = canvas.getBoundingClientRect();
    mouse.x    = e.clientX - rect.left;
    mouse.y    = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', function () {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* -- Click = explosion -- */
  canvas.addEventListener('click', function (e) {
    var rect = canvas.getBoundingClientRect();
    var cx   = e.clientX - rect.left;
    var cy   = e.clientY - rect.top;
    particles.forEach(function (p) {
      var dx = p.x - cx, dy = p.y - cy;
      var d  = Math.hypot(dx, dy);
      if (d < 250 && d > 0) {
        var force = ((250 - d) / 250) * 7;
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
      }
    });
  });

  /* -- Utility -- */
  function rgba(col, a) {
    return 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a.toFixed(3) + ')';
  }

  /* -- Main loop -- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Update + draw each particle */
    for (var i = 0; i < particles.length; i++) {
      var p  = particles[i];

      // Magnetic pull toward cursor
      var dx = mouse.x - p.x;
      var dy = mouse.y - p.y;
      var d  = Math.hypot(dx, dy);

      if (mouse.active && d < ATTRACT_RADIUS && d > 0) {
        var strength = ((ATTRACT_RADIUS - d) / ATTRACT_RADIUS) * ATTRACT_POWER * 3.5;
        p.vx += (dx / d) * strength;
        p.vy += (dy / d) * strength;
      }

      // Friction + speed cap
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      var speed = Math.hypot(p.vx, p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.65; }
      if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx) * 0.65; }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.65; }
      if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy) * 0.65; }

      // Draw dot
      var near  = mouse.active && Math.hypot(mouse.x - p.x, mouse.y - p.y) < ATTRACT_RADIUS;
      var alpha = near ? Math.min(p.alpha * 2.2, 0.95) : p.alpha;
      var r     = near ? p.r * 1.6 : p.r;
      var color = p.gold ? GOLD : MUTED_C;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, alpha);
      ctx.fill();
    }

    /* Draw connection lines */
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i], b = particles[j];
        var dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < CONNECT_DIST) {
          var fade     = 1 - dist / CONNECT_DIST;
          var bothGold = a.gold && b.gold;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(bothGold ? GOLD : MUTED_C, bothGold ? fade * 0.4 : fade * 0.13);
          ctx.lineWidth   = bothGold ? 0.7 : 0.35;
          ctx.stroke();
        }
      }
    }

    /* Cursor glow */
    if (mouse.active) {
      var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
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


/* ─────────────────────────────────────────────
   CONTACT FORM — Formspree
───────────────────────────────────────────── */
(function () {
  var form    = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var btn     = document.getElementById('form-btn');
  if (!form || !success || !btn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    btn.textContent = 'Sending…';
    btn.disabled    = true;

    var data = new FormData(form);

    fetch(form.action, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        form.reset();
        success.textContent = "Message sent — I'll be in touch soon.";
        success.classList.add('show');
        setTimeout(function () { success.classList.remove('show'); }, 5000);
      } else {
        success.textContent = 'Something went wrong. Try emailing me directly.';
        success.classList.add('show');
      }
    })
    .catch(function () {
      success.textContent = 'Network error. Try emailing me directly.';
      success.classList.add('show');
    })
    .finally(function () {
      btn.textContent = 'Send Message';
      btn.disabled    = false;
    });
  });
})();
