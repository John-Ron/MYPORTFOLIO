// ===== Loader =====
(function () {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  const percent = document.getElementById('loaderPercent');
  if (!loader) return;

  let done = false;
  let progress = 0;
  const timer = setInterval(() => {
    progress += Math.random() * 8 + 2;
    if (progress >= 90) { progress = 90; clearInterval(timer); }
    if (bar) bar.style.width = progress + '%';
    if (percent) percent.textContent = Math.floor(progress) + '%';
  }, 120);

  function finish() {
    if (done) return;
    done = true;
    clearInterval(timer);
    if (bar) bar.style.width = '100%';
    if (percent) percent.textContent = '100%';
    document.body.classList.add('is-loaded');
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 800);
    }, 250);
  }

  const minVisible = new Promise(res => setTimeout(res, 900));
  const pageLoaded = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });

  Promise.all([minVisible, pageLoaded]).then(finish);
  setTimeout(finish, 6000);
})();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function updateThemeIcon(theme) {
  const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
  [themeToggle, themeToggleMobile].forEach(el => {
    if (!el) return;
    el.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>`;
    const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    el.setAttribute('aria-label', label);
    el.setAttribute('title', label);
  });
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#07090f' : '#2563EB');
}
function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}
themeToggle.addEventListener('click', toggleTheme);
themeToggleMobile.addEventListener('click', toggleTheme);

// Show mobile theme toggle only on mobile
function checkMobile() {
  const mToggle = document.getElementById('themeToggleMobile');
  if (window.innerWidth <= 768) {
    mToggle.style.display = 'flex';
    mToggle.style.cssText = 'display:flex;align-items:center;justify-content:center;background:none;border:2px solid var(--border);width:40px;height:40px;border-radius:50%;cursor:pointer;color:var(--text);font-size:1.1rem';
  } else {
    mToggle.style.display = 'none';
  }
}
checkMobile();
window.addEventListener('resize', checkMobile);

// ===== Particle Canvas =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let particleCount = 80;
let mouseParticle = { x: null, y: null, radius: 120 };

function resizeCanvas() {
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.color = `rgba(37, 99, 235, ${this.opacity})`;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    if (mouseParticle.x) {
      const dx = this.x - mouseParticle.x;
      const dy = this.y - mouseParticle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouseParticle.radius) {
        const force = (mouseParticle.radius - dist) / mouseParticle.radius;
        this.x += dx * force * 0.02;
        this.y += dy * force * 0.02;
      }
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }
}
initParticles();

let heroInView = true;
new IntersectionObserver((e) => { heroInView = e[0].isIntersecting; }).observe(canvas.parentElement);

function animateParticles() {
  if (document.hidden || !heroInView) { requestAnimationFrame(animateParticles); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - dist / 150)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseParticle.x = e.clientX - rect.left;
  mouseParticle.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => { mouseParticle.x = null; mouseParticle.y = null; });

// ===== Custom Cursor =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  cursorDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
});

function animateCursor() {
  ringX += (cursorX - ringX) * 0.18;
  ringY += (cursorY - ringY) * 0.18;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, input, textarea, select, .masonry-item').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});

document.addEventListener('mousedown', () => cursorDot.classList.add('zapping'));
document.addEventListener('mouseup', () => cursorDot.classList.remove('zapping'));

// ===== Lightning cursor trail =====
(function () {
  const canvas = document.getElementById('cursorLightning');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || !fine || reduce) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const LIFE = 260;
  const pts = [];
  window.addEventListener('mousemove', function (e) {
    pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (pts.length > 22) pts.shift();
  });

  function bolt(p0, p1, alpha) {
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len < 1.5) return;
    const nx = -dy / len, ny = dx / len;
    const segs = Math.max(2, Math.min(6, Math.round(len / 12)));
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let s = 1; s < segs; s++) {
      const t = s / segs;
      const off = (Math.random() - 0.5) * Math.min(len * 0.7, 16);
      ctx.lineTo(p0.x + dx * t + nx * off, p0.y + dy * t + ny * off);
    }
    ctx.lineTo(p1.x, p1.y);

    ctx.shadowColor = 'rgba(6,182,212,0.9)';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(124,58,237,' + (alpha * 0.85) + ')';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(198,232,255,' + alpha + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    while (pts.length && now - pts[0].t > LIFE) pts.shift();

    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const age = (now - p1.t) / LIFE;
      const alpha = Math.max(0, 1 - age) * (i / n);
      if (alpha <= 0.02) continue;
      bolt(p0, p1, alpha);
    }

    const head = pts[n - 1];
    if (head && now - head.t <= LIFE) {
      const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 18);
      g.addColorStop(0, 'rgba(6,182,212,0.5)');
      g.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Hamburger =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

function setMenuState(open) {
  hamburger.classList.toggle('active', open);
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

hamburger.addEventListener('click', () => {
  setMenuState(!navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuState(false));
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) setMenuState(false);
});

// ===== Active Nav Link =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = navLinks.querySelectorAll('a:not([href="#"]):not(.theme-toggle)');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    if (scrollY >= top) current = section.getAttribute('id');
  });
  navAnchors.forEach(a => {
    const isActive = a.getAttribute('href') === '#' + current;
    a.classList.toggle('active', isActive);
    if (isActive) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate skill bars
      const fill = entry.target.querySelector('.skill-bar-fill');
      if (fill && !fill.dataset.animated) {
        fill.dataset.animated = 'true';
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
      }
      // Animate counters
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(c => {
        if (!c.dataset.counted) {
          c.dataset.counted = 'true';
          animateCounter(c);
        }
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

// ===== Animated Counters =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 16);
}
// Trigger hero counters immediately
document.querySelectorAll('.hero-stat .counter').forEach(c => {
  if (!c.dataset.counted) { c.dataset.counted = 'true'; animateCounter(c); }
});

// ===== Back to Top =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ===== Design Gallery (featured + thumbnails) =====
const galleryItems = [
  { src: 'viber_image_2026-05-18_07-44-02-837.jpg', cat: 'poster', title: 'Pahiyas Festival', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-18_07-43-17-097.jpg', cat: 'poster', title: 'Pahiyas Festival Event', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-18_07-44-03-104.jpg', cat: 'social', title: 'Product Promo', alt: 'Social Media' },
  { src: 'viber_image_2026-05-18_07-45-29-161.jpg', cat: 'social', title: 'Mother\'s Day Post', alt: 'Social Media' },
  { src: 'viber_image_2026-05-18_07-45-29-309.jpg', cat: 'social', title: 'Story Design', alt: 'Social Media' },
  { src: 'viber_image_2026-05-18_20-37-22-284.jpg', cat: 'social', title: 'Engagement Post', alt: 'Social Media' },
  { src: 'viber_image_2026-02-11_14-44-16-022.jpg', cat: 'poster', title: 'Business Card', alt: 'Poster Design' },
  { src: 'CONVERA.png', cat: 'poster', title: 'Convera ID Lace', alt: 'Poster Design' },
  { src: 'Screenshot 2026-06-02 101222.png', cat: 'poster', title: 'Sales Team Event Outing', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-18_20-37-42-998.jpg', cat: 'social', title: 'Surf 2 Sawa', alt: 'Social Media' },
  { src: 'viber_image_2026-05-18_07-45-30-911.jpg', cat: 'social', title: 'Microbiz Max', alt: 'Social Media' },
  { src: 'viber_image_2026-05-18_20-37-44-054.jpg', cat: 'social', title: 'Microbiz Max', alt: 'Social Media' },
  { src: 'viber_image_2026-05-04_13-17-40-180.jpg', cat: 'poster', title: 'Free Food Poster', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-04_13-17-54-674.jpg', cat: 'poster', title: 'Free Pansit Poster', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-04_13-18-02-200.jpg', cat: 'poster', title: 'Food Menu', alt: 'Poster Design' },
  { src: 'viber_image_2026-03-31_10-44-56-018.jpg', cat: 'poster', title: 'Promotional Poster', alt: 'Poster Design' },
  { src: 'viber_image_2026-03-31_10-44-56-702.jpg', cat: 'social', title: 'Story Post', alt: 'Social Media' },
  { src: 'viber_image_2026-03-31_10-44-57-310.jpg', cat: 'social', title: 'Social Campaign', alt: 'Social Media' },
  { src: 'FLYER YAH.png', cat: 'recruiting', title: 'Recruiting Flyer — Now Hiring', alt: 'Recruiting Design' },
  { src: 'Post.png', cat: 'recruiting', title: 'Recruiting Flyer — Open Positions', alt: 'Recruiting Design' },
  { src: 'YAH EDIT .png', cat: 'recruiting', title: 'Recruiting Flyer — Apply Today', alt: 'Recruiting Design' },
  { src: 'YAH.png', cat: 'recruiting', title: 'Recruiting Flyer — Join Our Team', alt: 'Recruiting Design' },
  { src: 'Youarehired .png', cat: 'recruiting', title: 'Recruiting Flyer — You\'re Hired', alt: 'Recruiting Design' },
  { src: 'Porche Design.png', cat: 'personal', title: 'Porsche', alt: 'My Personal Design' },
  { src: 'Kawasaki_Ninja Design.png', cat: 'personal', title: 'Kawasaki Ninja', alt: 'My Personal Design' }
];

const showcaseStage = document.getElementById('showcaseStage');
const showcasePrev = document.getElementById('showcasePrev');
const showcaseNext = document.getElementById('showcaseNext');
const showcaseFilters = document.getElementById('showcaseFilters');
const showcaseThumbs = document.getElementById('showcaseThumbs');
const metaInfo = document.getElementById('metaInfo');
const metaCat = document.getElementById('metaCat');
const metaTitle = document.getElementById('metaTitle');
const metaCurrent = document.getElementById('metaCurrent');
const metaTotal = document.getElementById('metaTotal');
const showcaseProgress = document.getElementById('showcaseProgress');

const categoryLabels = { poster: 'Poster Design', social: 'Social Media', recruiting: 'Recruiting Design', personal: 'My Personal Design' };
let activeFilter = 'all';
let visibleItems = [];
let screens = [];
let current = 0;
let switchingTimer;

function showcasePanelHeight() {
  if (window.innerWidth <= 768) return 320;
  if (window.innerWidth <= 1024) return 400;
  return 490;
}

function attachCardTilt(screen) {
  const card = screen.querySelector('.screen-card');
  if (!card) return;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (coarse) return;
  screen.addEventListener('pointermove', function(e) {
    if (!screen.classList.contains('focus') && !screen.classList.contains('focus-expanded')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.setProperty('--tiltY', (x * 12).toFixed(2) + 'deg');
    card.style.setProperty('--tiltX', (-y * 10).toFixed(2) + 'deg');
  });
  screen.addEventListener('pointerleave', function() {
    card.style.setProperty('--tiltY', '0deg');
    card.style.setProperty('--tiltX', '0deg');
  });
}

function buildScreenNode(item) {
  const screen = document.createElement('div');
  screen.className = 'showcase-screen';

  const card = document.createElement('div');
  card.className = 'screen-card';

  const art = document.createElement('div');
  art.className = 'screen-art';
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.alt;
  img.loading = 'lazy';
  art.appendChild(img);

  const reflection = document.createElement('div');
  reflection.className = 'screen-reflection';

  card.appendChild(art);
  card.appendChild(reflection);
  screen.appendChild(card);

  card.style.setProperty('--ar', '1');

  img.addEventListener('load', function() {
    if (img.naturalWidth && img.naturalHeight) {
      card.style.setProperty('--ar', (img.naturalWidth / img.naturalHeight).toFixed(4));
      sizeStage();
    }
  });

  screen.setAttribute('role', 'button');
  screen.setAttribute('tabindex', '0');
  screen.setAttribute('aria-expanded', 'false');
  screen.setAttribute('aria-label', 'Preview ' + (item.title || item.alt || 'design'));

  screen.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleExpand(screen);
  });
  screen.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(screen);
    }
  });

  attachCardTilt(screen);

  return screen;
}

function sizeStage() {
  const node = screens[current];
  if (!node) return;
  const card = node.querySelector('.screen-card');
  const ar = parseFloat(card.style.getPropertyValue('--ar')) || 1;
  const stageW = showcaseStage.clientWidth;
  let h = showcasePanelHeight();
  let w = h * ar;
  const maxW = stageW * 0.78;
  if (w > maxW) {
    w = maxW;
    h = w / ar;
  }
  card.style.setProperty('--panel-h', h.toFixed(1) + 'px');
}

function updateMeta() {
  const item = visibleItems[current];
  if (!item) return;
  metaCat.textContent = categoryLabels[item.cat] || item.cat;
  metaTitle.textContent = item.title || item.alt;
  metaCurrent.textContent = String(current + 1);
  metaTotal.textContent = String(visibleItems.length);
  showcaseProgress.style.width = ((current + 1) / visibleItems.length * 100) + '%';

  metaInfo.classList.remove('swap');
  void metaInfo.offsetWidth;
  metaInfo.classList.add('swap');

  const thumbs = showcaseThumbs.children;
  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].classList.toggle('active', i === current);
  }
  const activeThumb = thumbs[current];
  if (activeThumb) {
    const target = activeThumb.offsetLeft - (showcaseThumbs.clientWidth - activeThumb.offsetWidth) / 2;
    showcaseThumbs.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }
}

function showAt(index, dir) {
  if (!visibleItems.length) return;
  const prev = current;
  const total = visibleItems.length;
  current = (index + total) % total;

  screens.forEach(function(s, i) {
    s.classList.remove('enter-left', 'enter-right');
    s.classList.toggle('focus', i === current);
    if (i !== current) s.classList.remove('focus-expanded');

    // Signed distance around the ring, so the stack wraps around smoothly.
    let rel = i - current;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;
    const abs = Math.abs(rel);
    const side = rel < 0 ? -1 : 1;

    s.classList.toggle('is-near', abs === 1);
    s.classList.toggle('is-far', abs === 2);
    s.classList.toggle('is-hidden', abs > 2);
    s.style.setProperty('--x', String(i === current ? 0 : side * (abs === 1 ? 120 : 190)));
    s.style.setProperty('--rot', (i === current ? 0 : -side * (abs === 1 ? 14 : 22)) + 'deg');
    if (i === current) {
      s.classList.remove('is-near', 'is-far', 'is-hidden');
    }
  });

  if (dir && prev !== current) {
    const active = screens[current];
    void active.offsetWidth;
    active.classList.add(dir > 0 ? 'enter-right' : 'enter-left');
  }

  sizeStage();
  updateMeta();
}

function toggleExpand(screen) {
  const wasExpanded = screen.classList.contains('focus-expanded');
  screens.forEach(function(s) {
    s.classList.remove('focus-expanded');
    s.setAttribute('aria-expanded', 'false');
  });
  if (!wasExpanded) {
    screen.classList.add('focus-expanded');
    screen.setAttribute('aria-expanded', 'true');
  } else {
    // Second click on the focused card opens the full-size preview.
    const img = screen.querySelector('.screen-art img');
    if (img && img.getAttribute('src')) {
      openLightbox(img.getAttribute('src'), img.alt, screen);
    }
  }
}

function closeExpanded() {
  screens.forEach(function(s) { s.classList.remove('focus-expanded'); });
}

function buildThumbs() {
  showcaseThumbs.innerHTML = '';
  visibleItems.forEach(function(item, i) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'showcase-thumb';
    btn.setAttribute('aria-label', (item.title || item.alt) + ' ' + (i + 1));
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    img.loading = 'lazy';
    btn.appendChild(img);
    btn.addEventListener('click', function() { showAt(i, i > current ? 1 : -1); });
    showcaseThumbs.appendChild(btn);
  });
}

function buildShowcase() {
  showcaseStage.innerHTML = '';
  screens = [];
  visibleItems.forEach(function(item) {
    const node = buildScreenNode(item);
    showcaseStage.appendChild(node);
    screens.push(node);
  });
  buildThumbs();
  current = 0;
  showAt(0, 0);
}

function applyFilter() {
  visibleItems = galleryItems.filter(function(item) {
    return activeFilter === 'all' || item.cat === activeFilter;
  });
}

function setFilter(filter) {
  if (filter === activeFilter) return;
  activeFilter = filter;
  showcaseStage.classList.add('is-switching');
  clearTimeout(switchingTimer);
  switchingTimer = setTimeout(function() {
    applyFilter();
    buildShowcase();
    requestAnimationFrame(function() { showcaseStage.classList.remove('is-switching'); });
  }, 250);
}

Array.prototype.forEach.call(showcaseFilters.children, function(b) {
  b.setAttribute('aria-pressed', String(b.classList.contains('active')));
});

showcaseFilters.addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  Array.prototype.forEach.call(showcaseFilters.children, function(b) {
    const isActive = b === btn;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });
  setFilter(btn.dataset.filter);
});

showcasePrev.addEventListener('click', function() { showAt(current - 1, -1); });
showcaseNext.addEventListener('click', function() { showAt(current + 1, 1); });

showcaseStage.addEventListener('click', function(e) {
  if (e.target === showcaseStage) closeExpanded();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeExpanded(); return; }
  const section = document.getElementById('graphic-design');
  if (!section) return;
  const rect = section.getBoundingClientRect();
  if (rect.top > window.innerHeight || rect.bottom < 0) return;
  if (e.key === 'ArrowLeft') showAt(current - 1, -1);
  if (e.key === 'ArrowRight') showAt(current + 1, 1);
});

// Init
applyFilter();
buildShowcase();
window.addEventListener('resize', function() { sizeStage(); });

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
let lastLightboxTrigger = null;

function openLightbox(src, alt, trigger) {
  if (!src) return;
  lastLightboxTrigger = trigger || document.activeElement;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.inert = false;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  // Let the dialog become visible before moving focus into it.
  setTimeout(() => lightboxClose.focus(), 30);
}

function closeLightbox() {
  if (!lightbox.classList.contains('open')) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.inert = true;
  document.body.classList.remove('lightbox-open');
  const trigger = lastLightboxTrigger;
  lastLightboxTrigger = null;
  if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) {
    trigger.focus({ preventScroll: true });
  }
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Keep keyboard focus inside the dialog while it is open.
lightbox.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusable = lightbox.querySelectorAll('button, [href], img[tabindex="0"]');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// Open the preview from any element carrying data-lightbox.
document.querySelectorAll('[data-lightbox]').forEach(el => {
  el.addEventListener('click', () => {
    openLightbox(el.dataset.lightbox, el.dataset.lightboxAlt, el);
  });
});

// ===== Testimonials Slider =====
const track = document.getElementById('testimonialsTrack');
const cards = track.querySelectorAll('.testimonial-card');
const controls = document.getElementById('testimonialsControls');
let testimonialSlide = 0;
let testimonialSlideInterval;

cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'testimonials-dot' + (i === 0 ? ' active' : '');
  dot.dataset.index = i;
  dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + cards.length);
  if (i === 0) dot.setAttribute('aria-current', 'true');
  controls.appendChild(dot);
});

function goToSlide(index) {
  testimonialSlide = index;
  track.style.transform = `translateX(-${testimonialSlide * 100}%)`;
  controls.querySelectorAll('.testimonials-dot').forEach((d, i) => {
    const isActive = i === testimonialSlide;
    d.classList.toggle('active', isActive);
    if (isActive) d.setAttribute('aria-current', 'true');
    else d.removeAttribute('aria-current');
  });
}

controls.addEventListener('click', (e) => {
  if (e.target.classList.contains('testimonials-dot')) {
    goToSlide(parseInt(e.target.dataset.index));
    resetTestimonialsAutoSlide();
  }
});

let startX = 0, isDragging = false;
track.addEventListener('mousedown', (e) => { startX = e.clientX; isDragging = true; track.style.cursor = 'grabbing'; });
track.addEventListener('mousemove', (e) => { if (isDragging) { const diff = startX - e.clientX; if (Math.abs(diff) > 50) { goToSlide(Math.min(Math.max(testimonialSlide + (diff > 0 ? 1 : -1), 0), cards.length - 1)); isDragging = false; resetTestimonialsAutoSlide(); } } });
document.addEventListener('mouseup', () => { isDragging = false; track.style.cursor = 'grab'; });

function startTestimonialsAutoSlide() { testimonialSlideInterval = setInterval(() => { goToSlide((testimonialSlide + 1) % cards.length); }, 5000); }
function resetTestimonialsAutoSlide() { clearInterval(testimonialSlideInterval); startTestimonialsAutoSlide(); }
startTestimonialsAutoSlide();

// ===== Contact Form =====
// Submissions are delivered straight to the inbox through FormSubmit, so no
// backend/SMTP setup is needed. The form's action is the no-JS fallback.
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitButton = contactForm.querySelector('button[type="submit"]');
const submitButtonHTML = submitButton.innerHTML;
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/johnronavetria@gmail.com';
const DIRECT_EMAIL = 'johnronavetria@gmail.com';
let formResetTimer = null;

function setFormStatus(message, isError) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = 'form-status' + (isError ? ' is-error' : '');
}

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  const name = this.querySelector('#name').value.trim();
  const email = this.querySelector('#email').value.trim();
  const subjectInput = this.querySelector('#subject').value.trim();
  const message = this.querySelector('#message').value.trim();
  const subject = subjectInput || ('Portfolio inquiry from ' + name);

  const btn = submitButton;
  if (formResetTimer) clearTimeout(formResetTimer);
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
  setFormStatus('Sending your message...');

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

  fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name: name,
      email: email,
      subject: subject,
      message: message,
      _subject: subject,
      _replyto: email,
      _template: 'table'
    }),
    signal: controller ? controller.signal : undefined
  })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      if (data && data.success === false) {
        throw new Error(data.message || 'The form service rejected the message.');
      }
      btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Message sent';
      btn.style.background = '#22C55E';
      setFormStatus("Sent! I'll get back to you soon.");
      contactForm.reset();
      formResetTimer = setTimeout(() => {
        btn.innerHTML = submitButtonHTML;
        btn.style.background = '';
        btn.disabled = false;
        formResetTimer = null;
      }, 3000);
    })
    .catch(function () {
      btn.innerHTML = submitButtonHTML;
      btn.style.background = '';
      btn.disabled = false;
      setFormStatus('Could not send right now. Please email ' + DIRECT_EMAIL + ' directly.', true);
    })
    .then(function () {
      if (timeoutId) clearTimeout(timeoutId);
    });
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') { e.preventDefault(); return; }
    let target = null;
    try { target = document.querySelector(href); } catch (err) { target = null; }
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (target.id && history.replaceState) {
        history.replaceState(null, '', '#' + target.id);
      }
    }
  });
});

// ===== Keyboard Accessibility =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// ===== Scroll Progress Bar =====
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';
}, { passive: true });

// ===== Ripple Effect on Buttons =====
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ===== Magnetic Hover Effect =====
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    this.style.transition = 'transform 0.15s ease-out';
    this.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
  });
  el.addEventListener('mouseleave', function() {
    this.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    this.style.transform = 'translate3d(0, 0, 0)';
  });
});

// ===== 3D Tilt Effect on Cards =====
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    this.style.transition = 'transform 0.15s ease-out';
    this.style.transform = `perspective(1000px) rotateX(${rotateX * 0.7}deg) rotateY(${rotateY * 0.7}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', function() {
    this.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  });
});

// ===== Reveal Stagger =====
document.querySelectorAll('.reveal-stagger').forEach(el => {
  revealObserver.observe(el);
});

// ===== Image Reveal =====
document.querySelectorAll('.img-reveal').forEach(el => {
  revealObserver.observe(el);
});

// ===== Slide-in on scroll for reveal-up =====
document.querySelectorAll('.reveal-up').forEach(el => {
  revealObserver.observe(el);
});

// ===== Shine effect on cards =====
document.querySelectorAll('.project-card, .service-card, .skill-card').forEach(card => {
  card.classList.add('shine');
});


// ===== 3D Technology Background =====
(function() {
  const canvas = document.getElementById('bg3d');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 900 : 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [new THREE.Color(0x2563EB), new THREE.Color(0x7C3AED), new THREE.Color(0x06B6D4)];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 220;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 220;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pointMat = new THREE.PointsMaterial({
    size: isMobile ? 0.3 : 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const points = new THREE.Points(pointGeo, pointMat);
  scene.add(points);

  const wire1 = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(16, 1)),
    new THREE.LineBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.3 })
  );
  wire1.position.set(-42, 12, -20);
  scene.add(wire1);

  const wire2 = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(12, 0)),
    new THREE.LineBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.22 })
  );
  wire2.position.set(46, -14, -10);
  scene.add(wire2);

  function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    points.rotation.y += 0.0008;
    points.rotation.x += 0.0003;
    wire1.rotation.x += 0.002;
    wire1.rotation.y += 0.003;
    wire2.rotation.x -= 0.002;
    wire2.rotation.z += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ===== Hero Typing Animation =====
(function () {
  const roles = [
    'Front-end Web Developer',
    'Graphic Design',
    'Data Entry'
  ];

  const el = document.getElementById('typedRole');
  if (!el) return;

  // Reserve the height the longest role needs (at the current width) so the
  // paragraph below the headline never jumps while the text types/erases.
  function reserveHeight() {
    var width = el.clientWidth || (el.parentElement ? el.parentElement.clientWidth : 0);
    if (!width) return;
    var probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:absolute;visibility:hidden;left:0;top:0;display:block;' +
      'white-space:normal;font:inherit;letter-spacing:inherit;' +
      'width:' + width + 'px;padding:0;margin:0;background:none;z-index:-1;';
    el.appendChild(probe);
    var tallest = 0;
    roles.forEach(function (role) {
      probe.textContent = role;
      tallest = Math.max(tallest, probe.getBoundingClientRect().height);
    });
    probe.remove();
    el.style.minWidth = '';
    if (tallest > 0) el.style.minHeight = Math.ceil(tallest) + 'px';
    else el.style.minHeight = '';
  }
  reserveHeight();
  window.addEventListener('resize', reserveHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reserveHeight);
  }

  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TYPE_MS = 50;      // ms per character typed
  const DELETE_MS = 28;    // ms per character deleted
  const HOLD_MS = 1200;    // pause after a role is fully typed
  let roleIndex = 0;

  function typeRole(role, callback) {
    let i = 0;
    el.textContent = '';

    function step() {
      if (i <= role.length) {
        el.textContent = role.slice(0, i);
        i++;
        setTimeout(step, TYPE_MS);
      } else {
        setTimeout(callback, HOLD_MS);
      }
    }
    step();
  }

  function deleteRole(callback) {
    let i = el.textContent.length;

    function step() {
      if (i > 0) {
        i--;
        el.textContent = el.textContent.slice(0, i);
        setTimeout(step, DELETE_MS);
      } else {
        callback();
      }
    }
    step();
  }

  function loop() {
    const role = roles[roleIndex % roles.length];
    roleIndex++;

    typeRole(role, function () {
      deleteRole(loop);
    });
  }

  if (reducedMotion) {
    // Show the first role statically, no animation
    el.textContent = roles[0];
    return;
  }

  loop();
})();


// ===== Languages & Tools — Falling Animation =====
(function () {
  var strip = document.getElementById('techStrip');
  if (!strip) return;

  var items = strip.querySelectorAll('.tech-item');
  if (!items.length) return;

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  var tablet = window.matchMedia && window.matchMedia('(max-width: 1024px)').matches;

  // Give each item a staggered index plus a small random sideways drift and
  // rotation so the fall feels natural and physical.
  Array.prototype.forEach.call(items, function (item, i) {
    var rotRange = mobile ? 6 : (tablet ? 10 : 16);
    var dxRange = mobile ? 5 : (tablet ? 8 : 14);
    var rot = (Math.random() * 2 - 1) * rotRange;
    var dx = (Math.random() * 2 - 1) * dxRange;
    item.style.setProperty('--i', i);
    item.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    item.style.setProperty('--dx', dx.toFixed(2) + 'px');
  });

  if (reduced) {
    // Reduced motion: show everything immediately, no falling.
    strip.classList.add('active', 'settled');
    return;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          strip.classList.add('active');
          observer.disconnect();
          // After the full staggered fall, enable instant hover response.
          var total = 950 + items.length * 70 + 250;
          setTimeout(function () { strip.classList.add('settled'); }, total);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(strip);
  } else {
    strip.classList.add('active', 'settled');
  }
})();


// ===== About ID Card — Hanging / Swinging / Pull-down Interaction =====
(function () {
  const wrap = document.getElementById('lanyardWrap');
  const rig = document.getElementById('idRig');
  const card = document.getElementById('idCard');
  const strap = document.getElementById('lanyardStrap');
  if (!wrap || !rig || !card) return;

  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let held = false;
  let startY = 0;
  let currentPull = 0;
  let releaseTimer = null;
  let didDrag = false;

  // Resize-aware max pull (matches breakpoints in the CSS).
  function maxPull() {
    if (window.innerWidth <= 560) return 28;
    if (window.innerWidth <= 1024) return 42;
    return 56;
  }

  function setPull(pullPx) {
    const max = maxPull();
    currentPull = Math.max(0, Math.min(pullPx, max));
    const t = currentPull / max;
    const angle = 6 * t;                       // tilt as it stretches
    // Live drag: direct transform, no transition = feels like pulling.
    card.style.transition = 'none';
    card.style.transform =
      'translateY(' + currentPull + 'px) rotateZ(' + angle.toFixed(2) + 'deg)';
    // Strap gets longer downward as the card is pulled.
    if (strap) {
      strap.style.transition = 'none';
      strap.style.transform =
        'scaleY(' + (1 + t * 0.35).toFixed(2) + ') translateY(' + (currentPull).toFixed(0) + 'px)';
    }
    // Shadow recedes as the card is pulled toward the viewer.
    card.style.boxShadow =
      '0 ' + (30 - t * 18).toFixed(0) + 'px ' + (50 - t * 26).toFixed(0) +
      'px -' + (14 + t * 10).toFixed(0) + 'px rgba(0,0,0,0.35)';
  }

  function release() {
    if (!held) return;
    held = false;
    clearTimeout(releaseTimer);
    wrap.classList.remove('interacting');
    // Elastic snap back: clear inline styles so the CSS transition returns it.
    card.style.transition = '';
    card.style.transform = '';
    card.style.boxShadow = '';
    if (strap) { strap.style.transition = ''; strap.style.transform = ''; }
    // A tiny bounce on the rig for a natural settle.
    rig.classList.remove('release-bounce');
    void rig.offsetWidth;
    rig.classList.add('release-bounce');
    releaseTimer = setTimeout(function () {
      rig.classList.remove('release-bounce');
    }, 700);
  }

  function getY(e) {
    if (e.clientY !== undefined) return e.clientY;
    if (e.touches && e.touches.length) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientY;
    return 0;
  }

  function onDown(e) {
    if ((e.button !== undefined && e.button !== 0) || e.ctrlKey || e.metaKey) return;
    if (reduced || e.target !== card && !card.contains(e.target)) return;
    held = true;
    startY = getY(e);
    currentPull = 0;
    didDrag = false;
    rig.classList.remove('release-bounce');
    wrap.classList.add('interacting');
    setPull(0);
    if (card.setPointerCapture) { try { card.setPointerCapture(e.pointerId); } catch (err) {} }
    if (e.cancelable) e.preventDefault();
  }

  function onMove(e) {
    if (!held) return;
    const dy = getY(e) - startY;
    didDrag = Math.abs(dy) > 5;
    setPull(dy * 0.8);
    if (e.cancelable) e.preventDefault();
  }

  function onUp(e) {
    if (!held) return;
    // Same-boundary guard: only release if the pointer is still on the card
    // (or its capture) so dragging off doesn't leave the card stuck.
    release();
    if (e && e.cancelable) e.preventDefault();
  }

  // Binding both pointer and touch/mouse for broad compatibility.
  card.addEventListener('pointerdown', onDown);
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerup', onUp);
  card.addEventListener('pointercancel', onUp);
  card.addEventListener('pointerleave', onUp);
  card.addEventListener('mousedown', onDown);
  card.addEventListener('touchstart', onDown, { passive: false });
  card.addEventListener('touchmove', onMove, { passive: false });
  card.addEventListener('touchend', onUp);
  card.addEventListener('touchcancel', onUp);

  // Keyboard: short pull-down feel on Enter/Space.
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (reduced) return;
      e.preventDefault();
      pullOnce(maxPull());
    }
  });

  // A quick click / tap gives a brief pull-down so it works on touch too
  // (where vertical drags are captured by the browser for scrolling).
  card.addEventListener('click', function (e) {
    if (reduced || didDrag) return;
    if (e.defaultPrevented) return;
    pullOnce(maxPull());
  });

  function pullOnce(distance) {
    clearTimeout(releaseTimer);
    held = true;
    currentPull = 0;
    wrap.classList.add('interacting');
    const t0 = performance.now();
    const dur = 220;
    function build() {
      const t = Math.min(1, (performance.now() - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      setPull(distance * ease);
      if (t < 1) requestAnimationFrame(build);
      else setTimeout(release, 260);
    }
    build();
  }

  // Safety: never leave the card stuck if the page scrolls or focus is lost.
  window.addEventListener('scroll', release, { passive: true });
  window.addEventListener('blur', release);
  window.addEventListener('resize', release);
})();


// ===== Hero Profile — Hover Erase / Reveal =====
(function () {
  const wrap = document.getElementById('heroReveal');
  if (!wrap) return;

  const front = wrap.querySelector('.image-front');
  if (!front) return;

  // Bail out on coarse pointers (touch) and reduced-motion; those are handled
  // purely in CSS as a graceful fallback.
  const coarse = window.matchMedia && (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
  const reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Touch fallback: tap to briefly reveal the alternate image behind.
  if (coarse) {
    let timer = null;
    wrap.addEventListener('click', function () {
      wrap.classList.add('touch-on');
      clearTimeout(timer);
      timer = setTimeout(function () { wrap.classList.remove('touch-on'); }, 900);
    });
    return;
  }
  if (reduced) return;

  let cx = 50;    // mask hole center (percent of container)
  let cy = 50;
  let radius = 0;         // current hole radius (px)
  let target = 0;         // target hole radius (px)
  let over = false;
  let raf = null;

  wrap.style.setProperty('--cx', '50%');
  wrap.style.setProperty('--cy', '50%');

  function maxRadius() {
    const rect = wrap.getBoundingClientRect();
    return Math.ceil(Math.hypot(rect.width, rect.height));
  }

  function setHole() {
    wrap.style.setProperty('--r', Math.round(radius) + 'px');
  }

  function tick() {
    // Ease current radius toward the target for a smooth 0.6–1s feel.
    radius += (target - radius) * 0.14;
    if (Math.abs(target - radius) < 0.4) radius = target;
    setHole();
    if (radius !== target) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }

  function begin(cxPct, cyPct) {
    cx = cxPct; cy = cyPct;
    wrap.style.setProperty('--cx', cxPct.toFixed(2) + '%');
    wrap.style.setProperty('--cy', cyPct.toFixed(2) + '%');
    target = maxRadius();
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  function end() {
    target = 0;
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cxPct = (x / rect.width) * 100;
    const cyPct = (y / rect.height) * 100;
    begin(cxPct, cyPct);
  }

  function onEnter() {
    over = true;
    // Start the wipe from the center front of the portrait.
    begin(50, 50);
  }

  function onLeave() {
    over = false;
    end();
  }

  wrap.addEventListener('mouseenter', onEnter);
  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);

  // Recompute the max radius if the frame resizes responsively.
  window.addEventListener('resize', function () {
    if (over) target = maxRadius();
  });

  // Cleanup: reset the mask when the element leaves the DOM.
  window.addEventListener('beforeunload', function () {
    if (raf !== null) cancelAnimationFrame(raf);
  });
})();


// ===== Chat Assistant =====
// Local FAQ assistant that knows John Ron's full profile: skills, services,
// experience, education, projects, testimonials, references, and contact info.
// Answers in the language of the visitor's question (English or Tagalog).
(function () {
  const widget = document.getElementById('chatWidget');
  const panel = document.getElementById('chatPanel');
  const toggle = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const messages = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const quick = document.getElementById('chatQuick');
  if (!widget || !panel || !toggle || !messages || !form || !input) return;

  const EMAIL = 'johnronavetria@gmail.com';
  const PHONE = '+639302680347';
  const PHONE_DISPLAY = '0930 268 0347';
  const RESUME = 'Avetria_ProfessionalCV (2).pdf';
  const DEMO = 'https://john-ron.github.io/Client_Portfolio/';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const A = {
    contact:  { label: 'Open contact form', action: 'contact' },
    email:    { label: 'Email John', action: 'email' },
    call:     { label: 'Call John', action: 'tel' },
    resume:   { label: 'Download resume', action: 'resume' },
    gallery:  { label: 'See the gallery', action: 'gallery' },
    demo:     { label: 'View live demo', action: 'external', href: DEMO },
    github:   { label: 'GitHub', action: 'external', href: 'https://github.com/John-Ron' },
    facebook: { label: 'Facebook', action: 'external', href: 'https://www.facebook.com/share/1BfKKtAffV/' },
    instagram:{ label: 'Instagram', action: 'external', href: 'https://www.instagram.com/_https.ron24?igsh=MTlzN3E3cjI1MDVtYg==' },
    telegram: { label: 'Telegram', action: 'external', href: 'https://t.me/h17273728' }
  };
  const HANDOFF = [A.contact, A.email];

  // Everything below comes from John Ron's portfolio site and professional CV.
  const knowledge = [
    {
      keys: ['who are you', 'who is john', 'your name', 'full name', 'sino ka', 'sino si john', 'pangalan'],
      en: 'I am John Ron R. Avetria, a Front End Web Developer and Graphic Designer from Daet, Camarines Norte, Philippines. I also do UI/UX design, data entry, data management, and virtual assistant work.',
      tl: 'Ako si John Ron R. Avetria, Front End Web Developer at Graphic Designer mula sa Daet, Camarines Norte. Gumagawa rin ako ng UI/UX design, data entry, data management, at virtual assistant work.',
      acts: [A.contact, A.resume]
    },
    {
      keys: ['about you', 'about john', 'background', 'summary', 'tell me about yourself', 'profile', 'tungkol sa iyo', 'kwento', 'background mo'],
      en: 'John Ron is a detail-oriented, results-driven professional with experience in data management, graphic design, and front-end web development. He is skilled in advanced Excel, creates visually engaging designs, and builds user-friendly web interfaces. His approach: understand your vision, think strategically, and execute with precision.',
      tl: 'Si John Ron ay detalyado at result-driven na propesyonal na may karanasan sa data management, graphic design, at front-end web development. Mahusay siya sa advanced Excel, gumagawa ng engaging designs, at bumubuo ng user-friendly web interfaces. Ang approach niya: maintindihan ang vision mo, mag-isip nang strategiko, at isagawa nang tumpak.',
      acts: [A.resume]
    },
    {
      keys: ['what can you do', 'help me', 'can you help', 'capabilities', 'ano ang kaya mo', 'matutulungan', 'gawan mo'],
      en: 'I can answer questions about John Ron\'s services, skills, tools, experience, education, projects, rates, availability, testimonials, and contact details. If you need anything else, the contact form goes straight to his Gmail.',
      tl: 'Sasagutin ko ang tanong tungkol sa serbisyo, skills, tools, karanasan, edukasyon, projects, presyo, availability, testimonials, at contact details ni John Ron. Kung may iba pa, ang contact form ay diretso sa Gmail niya.',
      acts: HANDOFF
    },
    {
      keys: ['service', 'services', 'offer', 'what do you do', 'specialize', 'serbisyo', 'ginagawa', 'espesyalista'],
      en: 'Services: Graphic Design (logos, branding, social posts, posters, marketing materials), Web Development (custom sites, web apps, e-commerce), UI/UX Design (research, wireframes, prototypes), Web Design (responsive, mobile-first), Branding (identity packages, guidelines), Digital Marketing (social graphics, email templates, ads), and Data Entry / Data Management.',
      tl: 'Mga serbisyo: Graphic Design (logo, branding, social posts, poster, marketing materials), Web Development (custom sites, web apps, e-commerce), UI/UX Design (research, wireframe, prototype), Web Design (responsive, mobile-first), Branding (identity packages, guidelines), Digital Marketing (social graphics, email templates, ads), at Data Entry / Data Management.',
      acts: [A.contact]
    },
    {
      keys: ['graphic design', 'logo', 'poster', 'social media design', 'branding', 'brand identity', 'disenyo', 'logo', 'poster'],
      en: 'Graphic design is one of his core strengths: brand identity, social media content, posters, marketing materials, and visual communication. He uses Figma, Canva, Photoshop, and Illustrator, and has 25 design pieces in the gallery across posters, social media, personal, and recruiting designs.',
      tl: 'Isa sa mga lakas niya ang graphic design: brand identity, social media content, poster, marketing materials, at visual communication. Gamit niya ang Figma, Canva, Photoshop, at Illustrator, at may 25 design works sa gallery — poster, social media, personal, at recruiting designs.',
      acts: [A.gallery]
    },
    {
      keys: ['web development', 'website', 'web app', 'e-commerce', 'frontend', 'front end', 'web site', 'backend', 'php', 'mysql'],
      en: 'He designs and develops responsive websites with HTML, CSS, JavaScript, and React, focused on usability and clean design. He has working knowledge of PHP and MySQL for backend tasks and continues to grow that expertise. He also builds wireframes and prototypes in Figma.',
      tl: 'Nagde-design at nagde-develop siya ng responsive websites gamit ang HTML, CSS, JavaScript, at React, nakatuon sa usability at malinis na code. May working knowledge siya ng PHP at MySQL para sa backend at patuloy na pinapalalim ito. Gumagawa rin siya ng wireframe at prototype sa Figma.',
      acts: [A.demo]
    },
    {
      keys: ['ui ux', 'ui/ux', 'wireframe', 'prototype', 'user experience', 'user interface', 'figma'],
      en: 'UI/UX is part of both his services and experience: user research, low- and high-fidelity wireframing, prototyping, and interface design in Figma. His goal is interfaces that are clean, intuitive, and easy to navigate.',
      tl: 'Bahagi ng serbisyo at karanasan niya ang UI/UX: user research, low- at high-fidelity wireframing, prototyping, at interface design sa Figma. Layunin niya ang malinis, intuitive, at madaling gamitin na interfaces.',
      acts: [A.contact]
    },
    {
      keys: ['data entry', 'data management', 'encoding', 'excel', 'spreadsheet', 'data analysis', 'vlookup', 'xlookup', 'pivot'],
      en: 'He has hands-on Data Entry experience: cleaning, validating, and standardizing raw data; managing large datasets in Excel and Google Sheets; high-volume entry with 99%+ accuracy; and automating repetitive tasks with formulas and macros. Excel skills include advanced formulas, pivot tables, VLOOKUP/XLOOKUP, INDEX/MATCH, IF, and SUMIFS.',
      tl: 'May karanasan siya sa Data Entry: paglilinis at pag-aayos ng raw data, pag-manage ng malalaking datasets sa Excel at Google Sheets, high-volume encoding na may 99%+ accuracy, at pag-automate ng paulit-ulit na gawain gamit ang formulas at macros. Kabilang sa Excel skills ang advanced formulas, pivot tables, VLOOKUP/XLOOKUP, INDEX/MATCH, IF, at SUMIFS.',
      acts: [A.contact]
    },
    {
      keys: ['virtual assistant', 'assistant experience', 'va'],
      en: 'He has worked as a Virtual Assistant from October 2025 to January 2026, supporting administrative and data-related tasks alongside his design and development work.',
      tl: 'Nagtrabaho siya bilang Virtual Assistant mula Oktubre 2025 hanggang Enero 2026, tumutulong sa administrative at data-related tasks kasabay ng design at development work.',
      acts: [A.resume]
    },
    {
      keys: ['intern', 'internship', 'converge', 'convera', 'graphic designer intern'],
      en: 'He was a Graphic Designer Intern at Converge ICT Solutions & Convera Business Management Services (February–May 2026). He designed posters and promotional materials using Photoshop and Canva, improved existing designs, and applied Excel data analysis (XLOOKUP, VLOOKUP, INDEX/MATCH, IF, SUMIFS).',
      tl: 'Naging Graphic Designer Intern siya sa Converge ICT Solutions & Convera Business Management Services (Pebrero–Mayo 2026). Nagdisenyo siya ng poster at promotional materials gamit ang Photoshop at Canva, nag-improve ng mga lumang disenyo, at nagamit ang Excel data analysis (XLOOKUP, VLOOKUP, INDEX/MATCH, IF, SUMIFS).',
      acts: [A.resume]
    },
    {
      keys: ['jobelle', 'joyce', 'james tacalan', 'testimonial', 'testimonials', 'client feedback', 'clients say', 'client say', 'what clients say', 'client reviews', 'review', 'reviews', 'recommendation', 'feedback', 'kliyente', 'rekomendasyon'],
      en: 'Three clients recommend him: Joyce Abando (CPA) praised the professional portfolio website and responsiveness to feedback; James Tacalan (Jollibee staff) loved the interactive Gender Reveal website; Jobelle Dadios (HR, Converge ICT Solutions & Convera Business Management Services) called the design world-class and cohesive.',
      tl: 'Tatlong client ang nagrekomenda sa kanya: pinuri ni Joyce Abando (CPA) ang propesyonal na portfolio website at responsiveness sa feedback; nagustuhan ni James Tacalan (staff ng Jollibee) ang interactive Gender Reveal website; at sinabi ni Jobelle Dadios (HR, Converge ICT Solutions & Convera) na world-class at cohesive ang disenyo.'
    },
    {
      keys: ['references', 'reference', 'evelyn', 'jackie', 'olivia', 'sino ang reference'],
      en: 'References: Evelyn M. Baesa, DIT (evelynbaesa@cncs.edu.ph), Jobelle M. Dadios (jobelle.convera@gmail.com), Jackie Orpiada (jackieorpiada@gmail.com), and Olivia Aniciete (519-7028-798, Canada).',
      tl: 'Mga reference: Evelyn M. Baesa, DIT (evelynbaesa@cncs.edu.ph), Jobelle M. Dadios (jobelle.convera@gmail.com), Jackie Orpiada (jackieorpiada@gmail.com), at Olivia Aniciete (519-7028-798, Canada).',
      acts: [A.resume]
    },
    {
      keys: ['skills', 'skill', 'expertise', 'what are your skills', 'alam mo', 'teknolohiya', 'tech stack'],
      en: 'Skills: Graphic Design, UI/UX Design, Frontend Development, Backend Development (working knowledge), advanced Microsoft Excel, Data Entry/Data Management, and Database Administration. Tools include HTML, CSS, JavaScript, React, PHP, MySQL, Figma, Canva, Illustrator, Photoshop, WordPress, Shopify, CapCut, Premiere Pro, Claude AI, XAMPP, and GitHub.',
      tl: 'Mga skills: Graphic Design, UI/UX Design, Frontend Development, Backend Development (working knowledge), advanced Microsoft Excel, Data Entry/Data Management, at Database Administration. Tools: HTML, CSS, JavaScript, React, PHP, MySQL, Figma, Canva, Illustrator, Photoshop, WordPress, Shopify, CapCut, Premiere Pro, Claude AI, XAMPP, at GitHub.',
      acts: [A.resume]
    },
    {
      keys: ['tools', 'tool', 'use', 'using', 'software', 'programs', 'technologies', 'tech', 'stack', 'shopify', 'wordpress', 'capcut', 'premiere', 'adobe', 'photoshop', 'illustrator', 'claude'],
      en: 'Tools and technologies: Figma, Canva, WordPress, Shopify, Claude AI, MySQL, Adobe Illustrator & Photoshop, HTML/CSS, JavaScript, PHP, React, Microsoft Excel and Office, CapCut, Premiere Pro, XAMPP, and GitHub.',
      tl: 'Mga tools at technologies: Figma, Canva, WordPress, Shopify, Claude AI, MySQL, Adobe Illustrator & Photoshop, HTML/CSS, JavaScript, PHP, React, Microsoft Excel at Office, CapCut, Premiere Pro, XAMPP, at GitHub.',
      acts: [A.resume]
    },
    {
      keys: ['experience', 'work history', 'work experience', 'karanasan', 'trabaho', 'dati', 'previous work', 'employed'],
      en: 'Experience: Web Development (Front-End) — responsive sites in HTML/CSS/JavaScript with Figma wireframing; Data Entry (Jun–Sep 2025) — data cleaning, Excel reporting, 99%+ accuracy; Virtual Assistant (Oct 2025–Jan 2026); Graphic Designer Intern at Converge ICT Solutions & Convera (Feb–May 2026) — posters, promotional materials, and Excel analysis.',
      tl: 'Karanasan: Web Development (Front-End) — responsive sites gamit ang HTML/CSS/JavaScript at Figma wireframing; Data Entry (Hun–Set 2025) — paglilinis ng data, Excel reporting, 99%+ accuracy; Virtual Assistant (Okt 2025–Ene 2026); Graphic Designer Intern sa Converge ICT Solutions & Convera (Peb–May 2026) — poster, promotional materials, at Excel analysis.',
      acts: [A.resume]
    },
    {
      keys: ['education', 'degree', 'school', 'university', 'course', 'student', 'study', 'studied', 'where study', 'where school', 'graduated', 'edukasyon', 'pinag-aralan', 'nag aral', 'nagaral', 'diploma'],
      en: 'He is pursuing a Bachelor of Science in Information Systems (IS) at the University of Camarines Norte, S.Y. 2022–2026.',
      tl: 'Kumukuha siya ng Bachelor of Science in Information Systems (IS) sa University of Camarines Norte, S.Y. 2022–2026.',
      acts: [A.resume]
    },
    {
      keys: ['project', 'projects', 'portfolio', 'sample', 'samples', 'example', 'demo', 'designs', 'proyekto', 'halimbawa', 'gawa'],
      en: 'Projects: Client Portfolio Web (HTML, CSS, JavaScript) with a live demo; PDDMIS System Appointment (Jan–Dec 2025) featuring scheduling, record management, and reporting; and Capstone Project 1 & 2 focused on system features and front-end usability. The gallery also has 25 design pieces.',
      tl: 'Mga proyekto: Client Portfolio Web (HTML, CSS, JavaScript) na may live demo; PDDMIS System Appointment (Ene–Dis 2025) na may scheduling, record management, at reporting; at Capstone Project 1 & 2 para sa system features at front-end usability. May 25 rin siyang design works sa gallery.',
      acts: [A.demo, A.gallery]
    },
    {
      keys: ['client portfolio web', 'capstone', 'pddmis', 'appointment system', 'scheduling', 'record management'],
      en: 'Client Portfolio Web is a clean, user-friendly portfolio site for a client built with HTML, CSS, and JavaScript. PDDMIS System Appointment (Jan–Dec 2025) involved scheduling, record management, reporting, and front-end interface improvements. Capstone 1 & 2 focused on system features and user-centered visual layouts.',
      tl: 'Ang Client Portfolio Web ay malinis at user-friendly na portfolio site para sa isang client, ginawa gamit ang HTML, CSS, at JavaScript. Ang PDDMIS System Appointment (Ene–Dis 2025) ay may scheduling, record management, reporting, at front-end interface improvements. Ang Capstone 1 & 2 ay nakatuon sa system features at user-centered visual layouts.',
      acts: [A.demo]
    },
    {
      keys: ['gallery', 'design works', '25 designs', 'poster design', 'recruiting', 'personal design'],
      en: 'The design gallery has 25 selected pieces in four categories: Poster Design, Social Media, My Personal Design, and Recruiting Design. You can filter and browse them in the Design section.',
      tl: 'May 25 na napiling designs ang gallery sa apat na kategorya: Poster Design, Social Media, My Personal Design, at Recruiting Design. Pwede mong i-filter at tingnan sa Design section.',
      acts: [A.gallery]
    },
    {
      keys: ['resume', 'cv', 'download', 'credentials', 'biodata', 'karanasan'],
      en: 'You can download the full resume with the "Download Resume" button in the About section, or use the button below.',
      tl: 'Pwede mong i-download ang buong resume gamit ang "Download Resume" button sa About section, o gamitin ang button sa ibaba.',
      acts: [A.resume]
    },
    {
      keys: ['price', 'pricing', 'rate', 'rates', 'cost', 'charge', 'charges', 'fee', 'fees', 'how much', 'quote', 'budget', 'magkano', 'presyo', 'bayad', 'singil'],
      en: 'Rates depend on scope: number of pages, design complexity, and turnaround time. Send the details through the contact form or email and John will send a personalized quote.',
      tl: 'Ang presyo ay depende sa scope: bilang ng pages, complexity ng design, at turnaround time. I-send ang details sa contact form o email at magpapadala si John ng personalized quote.',
      acts: HANDOFF
    },
    {
      keys: ['payment', 'downpayment', 'installment', 'gcash', 'bank', 'bayaran'],
      en: 'Payment terms are discussed per project — they are not listed on the site. Send your project details and John will confirm the quote and payment arrangement.',
      tl: 'Ang payment terms ay pinapag-usapan per project — hindi ito nakalista sa site. I-send ang details ng project at kukumpirmahin ni John ang quote at payment arrangement.',
      acts: HANDOFF
    },
    {
      keys: ['timeline', 'how long', 'turnaround', 'deadline', 'duration', 'gaano katagal', 'kailan tapos'],
      en: 'Turnaround depends on the project scope and current queue. Send your requirements and deadline through the contact form and John will give you a realistic timeline.',
      tl: 'Ang turnaround ay depende sa scope ng project at kasalukuyang queue. I-send ang requirements at deadline sa contact form at magbibigay si John ng realistic timeline.',
      acts: HANDOFF
    },
    {
      keys: ['revision', 'revisions', 'support', 'maintenance', 'after launch', 'warranty', 'ayos ulit'],
      en: 'Revision and support details are agreed per project. Message John with what you need and he will include it in the quote.',
      tl: 'Ang revision at support ay pinapag-usapan per project. I-message mo si John kung ano ang kailangan mo at isasama niya ito sa quote.',
      acts: HANDOFF
    },
    {
      keys: ['available', 'availability', 'freelance', 'full-time', 'part-time', 'hire', 'hiring', 'work with', 'booking', 'freelancer'],
      en: 'Yes — John is currently available for freelance work and open to full-time roles. His profile lists availability as Freelance / Full-time.',
      tl: 'Oo — available si John sa freelance work sa ngayon at bukas din sa full-time roles. Nakalista ang availability niya bilang Freelance / Full-time.',
      acts: [A.contact]
    },
    {
      keys: ['process', 'steps', 'how do we start', 'next step', 'begin', 'get started', 'paano magsimula', 'simulan'],
      en: 'Send a message describing what you need — pages, style, deadline, and budget. John will reply with a quote and timeline, then you can agree on the details and start.',
      tl: 'Magpadala ng mensahe tungkol sa kailangan mo — pages, style, deadline, at budget. Magre-reply si John na may quote at timeline, then magsasang-ayon sa details at magsisimula.',
      acts: HANDOFF
    },
    {
      keys: ['why hire', 'why you', 'strengths', 'advantage', 'difference', 'bakit ka', 'lakas mo'],
      en: 'He combines clean, responsive code with thoughtful visual design, pays close attention to detail, is responsive to feedback, and has 99%+ accuracy in data work. Clients describe his work as professional, modern, and world-class.',
      tl: 'Pinagsasama niya ang malinis at responsive na code sa maalalahaning visual design, detalyado sa pagtatrabaho, tumutugon sa feedback, at may 99%+ accuracy sa data work. Sinasabi ng mga client na propesyonal, moderno, at world-class ang kanya.'
    },
    {
      keys: ['contact', 'email', 'gmail', 'phone', 'number', 'reach', 'get ahold', 'get in touch', 'reach out', 'find you', 'message', 'telegram', 'facebook', 'instagram', 'github', 'linkedin', 'mag-email', 'numero', 'makipag-ugnayan', 'kontak', 'mensahe'],
      en: 'Email: johnronavetria@gmail.com / Phone: 0930 268 0347 / Location: Daet, Camarines Norte / Telegram: @h17273728. You can also use the contact form — messages go straight to his Gmail. There is no LinkedIn link at the moment.',
      tl: 'Email: johnronavetria@gmail.com / Phone: 0930 268 0347 / Location: Daet, Camarines Norte / Telegram: @h17273728. Pwede rin ang contact form — diretso sa Gmail niya ang mensahe. Wala pang LinkedIn link sa ngayon.',
      acts: [A.contact, A.email, A.call]
    },
    {
      keys: ['email address', 'send email', 'i-email', 'email mo'],
      en: 'The email address is johnronavetria@gmail.com. Use the button below or the contact form; both go straight to his inbox.',
      tl: 'Ang email address ay johnronavetria@gmail.com. Gamitin ang button sa ibaba o ang contact form; parehong diretso sa inbox niya.',
      acts: [A.email, A.contact]
    },
    {
      keys: ['phone number', 'call', 'text', 'mobile', 'numero', 'tumawag', 'tawagan'],
      en: 'You can call or text 0930 268 0347 (+63 930 268 0347).',
      tl: 'Pwede kang tumawag o mag-text sa 0930 268 0347 (+63 930 268 0347).',
      acts: [A.call]
    },
    {
      keys: ['where', 'location', 'based', 'address', 'city', 'saan', 'taga', 'nakatira', 'borabod'],
      en: 'John is based in Borabod, Daet, Camarines Norte, Philippines, and works with clients remotely.',
      tl: 'Naka-base si John sa Borabod, Daet, Camarines Norte, Philippines, at nakikipagtrabaho siya remotely sa mga client.',
      acts: [A.contact]
    },
    {
      keys: ['thanks', 'thank you', 'salamat', 'maraming salamat'],
      en: 'You are welcome! Anything else you want to know about John Ron?',
      tl: 'Salamat! May iba pa ba gusto mong malaman tungkol kay John Ron?',
      acts: HANDOFF
    },
    {
      keys: ['hello', 'hi', 'hey', 'kumusta', 'kamusta', 'good morning', 'good afternoon', 'good evening', 'magandang araw', 'magandang gabi'],
      en: 'Hi! I am John Ron\'s assistant. I know his services, skills, experience, education, projects, rates, and contact details — ask me anything.',
      tl: 'Kumusta! Ako ang assistant ni John Ron. Alam ko ang serbisyo, skills, karanasan, edukasyon, projects, presyo, at contact details niya — tanungin mo lang.',
      acts: HANDOFF
    }
  ];

  const greetingEn = 'I am John Ron\'s assistant. Ask me anything — services, skills, experience, education, projects, rates, or how to reach him. No need to phrase it perfectly.';
  const greetingTl = 'Ako ang assistant ni John Ron. Tanungin mo lang ako kahit hindi perpekto ang pagkakasabi — serbisyo, skills, karanasan, edukasyon, projects, presyo, o paano siya maabot.';
  const fallbackEn = 'I want to help, but I do not have that specific detail. I can talk about his services, experience, education, projects, rates, or contact — or message John directly for an exact answer.';
  const fallbackTl = 'Gusto kitang tulungan, pero wala akong partikular na detalye diyan. Pwede tayong mag-usap tungkol sa serbisyo, karanasan, edukasyon, projects, presyo, o contact — o i-message mo si John para sa tamang sagot.';
  const clarifyEn = 'Can you tell me a little more? For example: "What services do you offer?", "How much do you charge?", "Where did you study?", or "How can I contact him?"';
  const clarifyTl = 'Pwede mo ba akong bigyan ng kaunti pang detalye? Halimbawa: "Ano ang serbisyo mo?", "Magkano ang presyo?", "Saan ka nag-aral?", o "Paano kita makakausap?"';

  function greetingFor(tl) {
    const hour = new Date().getHours();
    const part = hour < 12 ? (tl ? 'Magandang umaga!' : 'Good morning!') :
      hour < 17 ? (tl ? 'Magandang hapon!' : 'Good afternoon!') :
        (tl ? 'Magandang gabi!' : 'Good evening!');
    return part + '\n' + (tl ? greetingTl : greetingEn);
  }

  const TL_ACTION_LABELS = {
    'Open contact form': 'Buksan ang contact form',
    'Email John': 'I-email si John',
    'Call John': 'Tumawag kay John',
    'Download resume': 'I-download ang resume',
    'See the gallery': 'Tingnan ang gallery',
    'View live demo': 'Tingnan ang live demo',
    'Hire John': 'Kausapin si John'
  };

  function isTagalog(text) {
    return /\b(po|ko|mo|ka|ako|ikaw|natin|tayo|salamat|magkano|kamusta|kumusta|gusto|kailangan|pwede|puede|hindi|walang|para|tulungan|gawan|serbisyo|presyo|magandang|ano|saan|kailan|bakit|ito|iyan|dito|doon|ninyo|nyo|siya|niya|din|lang|pag|kapag|dahil|meron|ba|tungkol|karanasan|edukasyon|mensahe|numero|taga|nakatira|pangalan|sino|alam|matutulungan|i-email|tumawag|tingnan|gamit)\b/i.test(text);
  }

  function normalize(text) {
    return ' ' + text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  }

  // Question words must not count as content: without this, "What tools do
  // you use?" scores against "what do you do" and "can you help" instead of
  // the tools answer, and "How can I contact you?" looks falsely ambiguous.
  const STOPWORDS = new Set(('a an the and or but if so to of in on at for with from by as is are was were be been being am ' +
    'do does did done have has had will would can could should shall may might must ' +
    'i me my we us our you your he him his she her it its they them their ' +
    'this that these those what which who whom whose where when why how about into onto over under again then once there here ' +
    'all any both each few other some such no nor not only own same than too very just please ok okay tell say').split(' '));

  // Broadens short or unusual phrasings before matching, so visitors do not
  // have to guess the robot's exact wording.
  const SYNONYMS = {
    work: ['job', 'career', 'employment', 'experience', 'karanasan', 'trabaho'],
    learn: ['study', 'studied', 'school', 'university', 'college', 'degree', 'education', 'edukasyon', 'nag aral'],
    price: ['rate', 'cost', 'fee', 'budget', 'quote', 'magkano', 'presyo', 'bayad'],
    build: ['develop', 'create', 'make', 'code', 'website', 'web', 'site'],
    show: ['see', 'view', 'demo', 'sample', 'example', 'portfolio', 'gallery', 'ipakita', 'tingnan'],
    reach: ['contact', 'email', 'phone', 'call', 'message', 'telegram', 'kontak', 'makipag ugnayan'],
    assist: ['help', 'tulungan', 'gawan', 'support'],
    offer: ['services', 'service', 'ginagawa', 'serbisyo', 'specialize'],
    design: ['graphic', 'visual', 'poster', 'logo', 'brand', 'disenyo'],
    data: ['excel', 'encoding', 'spreadsheet', 'database', 'entry'],
    start: ['begin', 'process', 'steps', 'simulan', 'paano magsimula'],
    see: ['show', 'view', 'demo', 'gallery', 'sample', 'samples', 'tingnan'],
    samples: ['sample', 'example', 'demo', 'portfolio', 'gallery'],
    sample: ['samples', 'example', 'demo', 'portfolio', 'gallery'],
    charge: ['price', 'rate', 'cost', 'fee', 'quote', 'magkano'],
    charges: ['price', 'rate', 'cost', 'fee', 'quote', 'magkano'],
    fee: ['price', 'rate', 'cost', 'charge', 'quote'],
    skool: ['school', 'study', 'education', 'learn'],
    intership: ['internship', 'intern'],
    internship: ['intern', 'intership'],
    trabaho: ['work', 'job', 'experience', 'karanasan'],
    dati: ['previous', 'past', 'old', 'experience'],
    get: ['reach', 'contact', 'find'],
    ahold: ['reach', 'contact', 'find'],
    hold: ['reach', 'contact', 'find'],
    use: ['tools', 'software', 'programs', 'using'],
    using: ['use', 'tools', 'software', 'programs'],
    tools: ['use', 'using', 'software', 'programs'],
    software: ['tools', 'use', 'programs'],
    programs: ['tools', 'use', 'software'],
    contact: ['reach', 'email', 'phone', 'message', 'kontak'],
    study: ['school', 'education', 'degree', 'learn'],
    services: ['service', 'offer', 'serbisyo']
  };

  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }

  function tokenScore(token, keyword) {
    if (token === keyword) return 1;
    if (token.length >= 4 && keyword.length >= 4 &&
        (token.indexOf(keyword) === 0 || keyword.indexOf(token) === 0)) return 0.75;
    if (token.length >= 5 && keyword.length >= 5 && editDistance(token, keyword) <= 1) return 0.6;
    return 0;
  }

  function findAnswer(question) {
    const q = normalize(question);
    const raw = q.trim().split(/\s+/).filter(Boolean);
    const content = raw.filter(function (t) { return !STOPWORDS.has(t); });
    const tokens = content.slice();
    content.forEach(function (t) { (SYNONYMS[t] || []).forEach(function (s) { tokens.push(s); }); });

    let best = null;
    let bestScore = 0;
    let secondScore = 0;
    knowledge.forEach(function (item) {
      let score = 0;
      item.keys.forEach(function (key) {
        const k = normalize(key).trim();
        if (q.indexOf(' ' + k + ' ') !== -1) {
          score += k.indexOf(' ') !== -1 ? 6 : 2.5;
          return;
        }
        k.split(/\s+/).forEach(function (kw) {
          let match = 0;
          tokens.forEach(function (t) { match = Math.max(match, tokenScore(t, kw)); });
          score += match * (kw.length > 3 ? 1.4 : 0.6);
        });
      });
      if (score > bestScore) { secondScore = bestScore; bestScore = score; best = item; }
      else if (score > secondScore) { secondScore = score; }
    });

    return {
      item: bestScore >= 2 ? best : null,
      score: bestScore,
      // Only hedge on a weak match; a confident match (> 4.5) should answer
      // directly instead of adding a "maybe you meant..." disclaimer.
      ambiguous: bestScore >= 2 && bestScore < 4.5 && (bestScore - secondScore) < 0.8
    };
  }

  function localizeActions(acts, tagalog) {
    if (!tagalog) return acts;
    return acts.map(function (a) {
      return Object.assign({}, a, { label: TL_ACTION_LABELS[a.label] || a.label });
    });
  }

  function scrollBottom() { messages.scrollTop = messages.scrollHeight; }

  function addMessage(text, who, acts, suggest) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (who === 'user' ? 'user' : 'bot');
    div.textContent = text;
    if (acts && acts.length) {
      const row = document.createElement('div');
      row.className = 'chat-actions';
      acts.forEach(function (a) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-action';
        btn.textContent = a.label;
        btn.dataset.action = a.action;
        if (a.href) btn.dataset.href = a.href;
        row.appendChild(btn);
      });
      div.appendChild(row);
    }
    if (suggest && suggest.length) {
      const srow = document.createElement('div');
      srow.className = 'chat-suggest';
      suggest.forEach(function (s) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = s.label;
        btn.dataset.question = s.q;
        srow.appendChild(btn);
      });
      div.appendChild(srow);
    }
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  let lastItem = null;
  const context = { asked: new Set(), turns: 0, name: '' };
  const FOLLOW_UP = /^(and|also|tell me more|more|another|next|sige|oo|yes|ano pa|dagdag|that|same|again|go on)\b/i;
  const PRONOUNS = /^(he|him|his|she|her|that|it|this|siya|niya|ito|iyan)$/i;
  const OPENERS_EN = ['', '', 'Sure — ', 'Good question — ', 'Here is the short version: '];
  const OPENERS_TL = ['', '', 'Sige — ', 'Magandang tanong — ', 'Heto ang maikling sagot: '];
  const REPEAT_EN = 'We talked about this earlier — here it is again:\n\n';
  const REPEAT_TL = 'Napagusapan na natin ito — eto ulit:\n\n';

  const Q = {
    about: 'Tell me about John',
    services: 'What services do you offer?',
    experience: 'What is your work experience?',
    education: 'Where did you study?',
    tools: 'What tools do you use?',
    rates: 'How much do you charge?',
    projects: 'Can I see your projects?',
    contact: 'How can I contact you?',
    resume: 'Can I download his resume?',
    availability: 'Is he available for freelance work?',
    testimonials: 'What do clients say?',
    process: 'How do we get started?'
  };
  const SUGGEST_TL = {
    'Tell me about John': 'Kilalanin si John',
    'What services do you offer?': 'Ano ang serbisyo niya?',
    'What is your work experience?': 'Ano ang karanasan niya?',
    'Where did you study?': 'Saan siya nag-aral?',
    'What tools do you use?': 'Anong tools ang gamit niya?',
    'How much do you charge?': 'Magkano ang singil niya?',
    'Can I see your projects?': 'Pwede ba makita ang projects?',
    'How can I contact you?': 'Paano siya makontak?',
    'Can I download his resume?': 'I-download ang resume',
    'Is he available for freelance work?': 'Available ba siya?',
    'What do clients say?': 'Ano ang sabi ng clients?',
    'How do we get started?': 'Paano magsisimula?'
  };

  // Contextual "what next?" prompts, like a real chat — still answered locally.
  function suggestionsFor(item, tagalog) {
    let qs;
    const first = item && item.keys ? item.keys[0] : '';
    if (!item) qs = [Q.about, Q.services, Q.rates, Q.contact];
    else if (/service|graphic|web|ui|brand|market/i.test(first)) qs = [Q.tools, Q.rates, Q.projects, Q.contact];
    else if (/experience|work|intern|assistant|data entry/i.test(first)) qs = [Q.resume, Q.education, Q.tools, Q.contact];
    else if (/education|school/i.test(first)) qs = [Q.resume, Q.experience, Q.services, Q.contact];
    else if (/tool|skill/i.test(first)) qs = [Q.services, Q.projects, Q.rates, Q.resume];
    else if (/price|payment|timeline|revision|process/i.test(first)) qs = [Q.availability, Q.services, Q.projects, Q.contact];
    else if (/project|gallery|portfolio|capstone/i.test(first)) qs = [Q.tools, Q.services, Q.rates, Q.contact];
    else if (/contact|email|phone|where|location|reference/i.test(first)) qs = [Q.services, Q.rates, Q.resume, Q.projects];
    else if (/testimonial|why hire/i.test(first)) qs = [Q.resume, Q.experience, Q.contact];
    else if (/available/i.test(first)) qs = [Q.rates, Q.process, Q.contact];
    else if (/resume|cv/i.test(first)) qs = [Q.experience, Q.education, Q.contact];
    else qs = [Q.about, Q.services, Q.rates, Q.contact];
    return qs.slice(0, 3).map(function (q) {
      return { q: q, label: tagalog ? (SUGGEST_TL[q] || q) : q };
    });
  }

  function smallTalk(q, tagalog) {
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|kumusta|kamusta)\b/i.test(q)) {
      return tagalog ? 'Kumusta! Ano ang gusto mong malaman tungkol kay John Ron?' : 'Hey! What would you like to know about John Ron?';
    }
    if (/^(thanks|thank you|salamat|maraming salamat)\b/i.test(q)) {
      return tagalog ? 'Walang anuman! May iba pa ba akong matutulong?' : 'You are welcome! Anything else I can help with?';
    }
    if (/^(bye|goodbye|paalam)\b/i.test(q)) {
      return tagalog ? 'Paalam! Balik ka ulit kung may tanong ka.' : 'Bye! Come back anytime you have a question.';
    }
    return null;
  }

  function reply(question) {
    const tagalog = isTagalog(question);
    let trimmed = question.trim();
    context.turns++;

    const nameMatch = trimmed.match(/\b(?:my name is|ang pangalan ko ay|pangalan ko)\s+([a-z][a-z'-]{1,19})\b/i);
    let namedNow = false;
    if (nameMatch && !context.name) {
      context.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      const rest = trimmed.replace(nameMatch[0], '').replace(/^[\s,.!]+|[\s,.!]+$/g, '');
      namedNow = rest.length < 3;
    }

    // "What about X?" is a new topic; bare pronouns mean "tell me more about that".
    const whatAbout = trimmed.match(/^(?:what about|how about)\s+(.+)$/i);
    if (whatAbout) trimmed = whatAbout[1];
    const bare = trimmed.replace(/[\s?!.,]+$/, '');
    const isFollowUp = (PRONOUNS.test(bare) || (!whatAbout && FOLLOW_UP.test(trimmed))) && !!lastItem;
    const found = findAnswer(trimmed);
    const chat = smallTalk(trimmed, tagalog);
    let answer;
    let acts;
    let usedItem = null;

    if (namedNow) {
      answer = tagalog
        ? 'Natutuwa akong makilala ka, ' + context.name + '! Tanungin mo lang ako tungkol kay John Ron.'
        : 'Nice to meet you, ' + context.name + '! Ask me anything about John Ron.';
      acts = HANDOFF;
    } else if (chat) {
      answer = chat;
      acts = HANDOFF;
    } else if (isFollowUp) {
      usedItem = lastItem;
      answer = (tagalog ? 'Sige, ' : 'Sure, ') + (tagalog ? lastItem.tl : lastItem.en);
      acts = lastItem.acts || HANDOFF;
    } else if (found.item) {
      usedItem = found.item;
      const repeated = context.asked.has(found.item);
      context.asked.add(found.item);
      lastItem = found.item;
      const openers = tagalog ? OPENERS_TL : OPENERS_EN;
      answer = (repeated ? (tagalog ? REPEAT_TL : REPEAT_EN) : openers[context.turns % openers.length]) +
        (tagalog ? found.item.tl : found.item.en);
      if (found.ambiguous) {
        answer += '\n\n' + (tagalog
          ? 'Kung iba ang ibig mong sabihin, sabihin mo lang ulit.'
          : 'If you meant something else, just say it another way.');
      }
      acts = found.item.acts || HANDOFF;
    } else {
      const words = normalize(trimmed).trim().split(/\s+/).filter(Boolean);
      const vague = words.length <= 3 || /^(what|ano|huh|help|tulungan|excuse)\b/i.test(trimmed);
      answer = vague ? (tagalog ? clarifyTl : clarifyEn) : (tagalog ? fallbackTl : fallbackEn);
      acts = HANDOFF;
    }

    if (!namedNow && context.name && context.turns % 5 === 0) answer = context.name + ', ' + answer;
    acts = localizeActions(acts, tagalog);

    const typing = document.createElement('div');
    typing.className = 'chat-msg bot chat-typing';
    typing.setAttribute('aria-label', tagalog ? 'Nagta-type ang assistant' : 'Assistant is typing');
    typing.innerHTML = '<i></i><i></i><i></i>';
    messages.appendChild(typing);
    scrollBottom();

    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      addMessage(answer, 'bot', acts, suggestionsFor(usedItem, tagalog));
    }, reduced ? 0 : 380 + Math.random() * 240);
  }

  function send(text) {
    text = (text || '').trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    reply(text);
  }

  let greeted = false;
  function openChat() {
    panel.hidden = false;
    widget.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close chat assistant');
    if (!greeted) {
      greeted = true;
      const tl = /^(tl|fil)/i.test(navigator.language || '');
      addMessage(greetingFor(tl), 'bot', localizeActions(HANDOFF, tl), suggestionsFor(null, tl));
    }
    setTimeout(function () { input.focus({ preventScroll: true }); }, 120);
  }

  function closeChat() {
    if (!widget.classList.contains('open')) return;
    widget.classList.remove('open');
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open chat assistant');
    toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', function () {
    if (widget.classList.contains('open')) closeChat();
    else openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  quick.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-question]');
    if (btn) send(btn.dataset.question);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && widget.classList.contains('open')) closeChat();
  });

  messages.addEventListener('click', function (e) {
    const prompt = e.target.closest('.chat-suggest button');
    if (prompt) { send(prompt.dataset.question); return; }
    const btn = e.target.closest('.chat-action');
    if (!btn) return;
    const type = btn.dataset.action;
    if (type === 'email') {
      window.location.href = 'mailto:' + EMAIL;
    } else if (type === 'tel') {
      window.location.href = 'tel:' + PHONE;
    } else if (type === 'resume') {
      window.open(encodeURI(RESUME), '_blank', 'noopener');
    } else if (type === 'external' && btn.dataset.href) {
      window.open(btn.dataset.href, '_blank', 'noopener');
    } else if (type === 'gallery' || type === 'contact') {
      const id = type === 'contact' ? 'contact' : 'graphic-design';
      const target = document.getElementById(id);
      closeChat();
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (type === 'contact') {
          setTimeout(function () {
            const nameField = document.getElementById('name');
            if (nameField) nameField.focus({ preventScroll: true });
          }, 600);
        }
      }
    }
  });
})();
