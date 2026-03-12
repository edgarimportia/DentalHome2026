/* =============================================
   DENTAL HOME — JavaScript Principal
   Versión: 1.0 | 2026
   ============================================= */

'use strict';

/* ---- Navbar scroll ---- */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('burgerBtn');
  const menu    = document.getElementById('navMenu');
  const links   = document.querySelectorAll('.navbar__link');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ---- Smooth scroll para anclas internas ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Reveal al hacer scroll (IntersectionObserver) ---- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay escalonado para grupos
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Añadir delays escalonados a siblings
  let lastParent = null;
  let groupIndex = 0;
  elements.forEach(el => {
    const parent = el.parentElement;
    if (parent !== lastParent) { groupIndex = 0; lastParent = parent; }
    if (!el.dataset.delay) {
      el.dataset.delay = groupIndex * 80;
    }
    groupIndex++;
    observer.observe(el);
  });
})();

/* ---- Contador animado ---- */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num, .big-stat__num');
  if (!counters.length) return;

  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(ease(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ---- Slider de testimonios ---- */
(function initSlider() {
  const track    = document.getElementById('testimoniosTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonio-card');
  const total = cards.length;
  let current = 0;
  let autoTimer = null;

  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  let visible = getVisible();
  const maxIndex = () => Math.max(0, total - visible);

  // Crear dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    visible = getVisible();
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function startAuto() {
    autoTimer = setInterval(() => {
      const next = current < maxIndex() ? current + 1 : 0;
      goTo(next);
    }, 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  });

  window.addEventListener('resize', () => {
    visible = getVisible();
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
  startAuto();
})();

/* ---- Formulario de cita → WhatsApp ---- */
(function initForm() {
  const form = document.getElementById('citaForm');
  if (!form) return;

  const WHATSAPP_NUMBER = '51973512578';

  function validate(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      el.classList.remove('error');
      const isEmpty = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (isEmpty) {
        el.classList.add('error');
        valid = false;
      }
    });
    const email = form.querySelector('#email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }
    return valid;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validate(this)) {
      const firstError = this.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    const nombre   = form.querySelector('#nombre').value.trim();
    const telefono = form.querySelector('#telefono').value.trim();
    const email    = form.querySelector('#email').value.trim();
    const servicio = form.querySelector('#servicio').value;
    const mensaje  = form.querySelector('#mensaje').value.trim();

    const lines = [
      `🦷 *Nueva solicitud de cita – Dental Home*`,
      ``,
      `👤 *Nombre:* ${nombre}`,
      `📱 *Teléfono:* ${telefono}`,
      email ? `📧 *Email:* ${email}` : null,
      `🏥 *Servicio:* ${servicio}`,
      mensaje ? `💬 *Mensaje:* ${mensaje}` : null,
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Feedback visual
    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ¡Enviado! Redirigiendo a WhatsApp...`;
    btn.disabled = true;
    btn.style.background = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.cssText = '';
      form.reset();
    }, 4000);
  });

  // Remover clase error al escribir
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
})();

/* ---- Active link al hacer scroll ---- */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.navbar__link');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ---- Lazy loading de imágenes ---- */
(function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => observer.observe(img));
})();

/* ---- Navbar active style ---- */
const style = document.createElement('style');
style.textContent = `.navbar__link.active { color: var(--accent) !important; font-weight: 700; }`;
document.head.appendChild(style);
