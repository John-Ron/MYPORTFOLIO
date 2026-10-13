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
    if (el) el.innerHTML = `<i class="fas ${icon}"></i>`;
  });
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
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
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
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
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
  { src: 'viber_image_2026-05-04_13-17-40-180.jpg', cat: 'poster', title: 'Poster FREE FOOD', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-04_13-17-54-674.jpg', cat: 'poster', title: 'Poster FREE Pansit', alt: 'Poster Design' },
  { src: 'viber_image_2026-05-04_13-18-02-200.jpg', cat: 'poster', title: 'Food Menu', alt: 'Poster Design' },
  { src: 'viber_image_2026-03-31_10-44-56-018.jpg', cat: 'poster', title: 'Promotional', alt: 'Social Design' },
  { src: 'viber_image_2026-03-31_10-44-56-702.jpg', cat: 'social', title: 'Story Post', alt: 'Social Media' },
  { src: 'viber_image_2026-03-31_10-44-56-018.jpg', cat: 'social', title: 'Social Post', alt: 'Social Media' },
  { src: 'viber_image_2026-03-31_10-44-57-310.jpg', cat: 'social', title: 'Social Campaign', alt: 'Social Media' },
  { src: 'FLYER YAH.png', cat: 'recruiting', title: 'Recruiting Flyer', alt: 'Recruiting Design' },
  { src: 'Post.png', cat: 'recruiting', title: 'Recruiting Flyer', alt: 'Recruiting Design' },
  { src: 'YAH EDIT .png', cat: 'recruiting', title: 'Recruiting Flyer', alt: 'Recruiting Design' },
  { src: 'YAH.png', cat: 'recruiting', title: 'Recruiting Flyer', alt: 'Recruiting Design' },
  { src: 'Youarehired .png', cat: 'recruiting', title: 'Recruiting Flyer', alt: 'Recruiting Design' },
  { src: 'Porche Design.png', cat: 'personal', title: 'Porche', alt: 'My Personal Design' },
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

  screen.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleExpand(screen);
  });

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

function showAt(index) {
  if (!visibleItems.length) return;
  current = (index + visibleItems.length) % visibleItems.length;
  screens.forEach(function(s, i) {
    s.classList.toggle('focus', i === current);
    if (i !== current) s.classList.remove('focus-expanded');
  });
  sizeStage();
  updateMeta();
}

function toggleExpand(screen) {
  const wasExpanded = screen.classList.contains('focus-expanded');
  screens.forEach(function(s) { s.classList.remove('focus-expanded'); });
  if (!wasExpanded) screen.classList.add('focus-expanded');
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
    btn.addEventListener('click', function() { showAt(i); });
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
  showAt(0);
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

showcaseFilters.addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  Array.prototype.forEach.call(showcaseFilters.children, function(b) {
    b.classList.toggle('active', b === btn);
  });
  setFilter(btn.dataset.filter);
});

showcasePrev.addEventListener('click', function() { showAt(current - 1); });
showcaseNext.addEventListener('click', function() { showAt(current + 1); });

showcaseStage.addEventListener('click', function(e) {
  if (e.target === showcaseStage) closeExpanded();
});

document.addEventListener('keydown', function(e) {
  const section = document.getElementById('graphic-design');
  if (!section) return;
  const rect = section.getBoundingClientRect();
  if (rect.top > window.innerHeight || rect.bottom < 0) return;
  if (e.key === 'ArrowLeft') showAt(current - 1);
  if (e.key === 'ArrowRight') showAt(current + 1);
  if (e.key === 'Escape') closeExpanded();
});

// Init
applyFilter();
buildShowcase();
window.addEventListener('resize', function() { sizeStage(); });

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

// ===== Testimonials Slider =====
const track = document.getElementById('testimonialsTrack');
const cards = track.querySelectorAll('.testimonial-card');
const controls = document.getElementById('testimonialsControls');
let testimonialSlide = 0;
let testimonialSlideInterval;

cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'testimonials-dot' + (i === 0 ? ' active' : '');
  dot.dataset.index = i;
  controls.appendChild(dot);
});

function goToSlide(index) {
  testimonialSlide = index;
  track.style.transform = `translateX(-${testimonialSlide * 100}%)`;
  controls.querySelectorAll('.testimonials-dot').forEach((d, i) => {
    d.classList.toggle('active', i === testimonialSlide);
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
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    btn.style.background = '#22C55E';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
      this.reset();
    }, 2000);
  }, 1500);
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    'Web Developer',
    'Data Entry ',
    'UI/UX Designer',
    'AI Automation',
    'Admin Support',
    'Graphic Designer'
  ];

  const el = document.getElementById('typedRole');
  if (!el) return;

  // Reserve the exact pixel width of the longest role so the hero line never
  // shifts as the typed text changes length.
  function reserveWidth() {
    const longest = roles.reduce(function (a, b) {
      return b.length > a.length ? b : a;
    });
    const measure = document.createElement('span');
    measure.textContent = longest;
    measure.setAttribute('aria-hidden', 'true');
    measure.style.cssText =
      'position:absolute;visibility:hidden;white-space:pre;' +
      'font-family:inherit;font-size:inherit;font-weight:inherit;' +
      'letter-spacing:inherit;line-height:inherit;' +
      'background:none;padding:0;margin:0;width:auto;z-index:-1;';
    el.appendChild(measure);
    var w = measure.getBoundingClientRect().width;
    measure.remove();
    if (w > 0) el.style.minWidth = w + 'px';
  }
  reserveWidth();
  window.addEventListener('resize', reserveWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reserveWidth);
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
