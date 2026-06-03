//
// scripts.js
// Funcionalidades: menú móvil, navbar sticky reactiva, scroll suave, slider, validación de formulario,
// animaciones on-scroll y scrollspy.
//

// Utilidad: helper para seleccionar
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Navbar sticky y menú móvil
(() => {
  const header = $('.site-header');
  const nav = $('#primary-nav');
  const toggle = $('.nav-toggle');

  // Cambio de estilo al hacer scroll
  const handleScrollHeader = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  handleScrollHeader();
  window.addEventListener('scroll', handleScrollHeader, { passive: true });

  // Menú móvil toggling
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar menú al navegar
    nav.addEventListener('click', (e) => {
      const target = e.target;
      if (target.matches('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

// Scroll suave para enlaces del menú
(() => {
  const links = $$('.nav-link');
  const offset = () => $('.site-header').offsetHeight - 2;
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = $(href);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - offset();
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

// Animaciones on-scroll con IntersectionObserver
(() => {
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reveals.length === 0) {
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Efecto cascada (stagger) para tarjetas dentro de la sección
        const gridItems = entry.target.querySelectorAll('.card, .pricing-card, .gallery-item, .highlight');
        gridItems.forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          item.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
          // forzar reflow
          void item.offsetWidth;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
          
          // Limpiar estilos inline despues de animar para no romper los hovers
          setTimeout(() => {
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
          }, 800 + (index * 150));
        });

        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach((el) => io.observe(el));
})();

// Slider de testimonios (auto-play opcional)
(() => {
  const slider = $('.slider');
  if (!slider) return;
  const slidesTrack = $('.slides', slider);
  const figures = $$('.slide', slidesTrack);
  const prevBtn = $('.prev', slider);
  const nextBtn = $('.next', slider);
  const dotsWrap = $('.slider-dots', slider);
  let index = 0;
  let autoplayId = null;

  const createDots = () => {
    figures.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', `testimonial-${i+1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    });
  };

  const updateUI = () => {
    slidesTrack.style.transform = `translateX(-${index * 100}%)`;
    const dots = $$('.slider-dots button', slider);
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
  };

  const goTo = (i) => {
    index = (i + figures.length) % figures.length;
    updateUI();
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  createDots();
  updateUI();

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  // Autoplay (puedes desactivar cambiando enableAutoplay a false)
  const enableAutoplay = true;
  const AUTOPLAY_MS = 5000;
  const startAutoplay = () => {
    if (!enableAutoplay) return;
    stopAutoplay();
    autoplayId = setInterval(next, AUTOPLAY_MS);
  };
  const stopAutoplay = () => { if (autoplayId) clearInterval(autoplayId); };

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  startAutoplay();
})();

// Validación del formulario (sin backend)
(() => {
  const form = $('#reserva-form');
  if (!form) return;
  const messages = $('#form-messages');

  const showError = (input, message) => {
    input.classList.add('error');
    const span = input.parentElement.querySelector('.error-msg');
    if (span) span.textContent = message || '';
  };
  const clearError = (input) => {
    input.classList.remove('error');
    const span = input.parentElement.querySelector('.error-msg');
    if (span) span.textContent = '';
  };

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validate = () => {
    let valid = true;
    const nombre = $('#nombre');
    const email = $('#email');
    const fecha = $('#fecha');

    if (!nombre.value.trim()) { showError(nombre, 'Por favor ingresa tu nombre.'); valid = false; } else { clearError(nombre); }
    if (!email.value.trim() || !isEmailValid(email.value)) { showError(email, 'Ingresa un email válido.'); valid = false; } else { clearError(email); }
    if (!fecha.value) { showError(fecha, 'Selecciona fecha y hora.'); valid = false; } else { clearError(fecha); }

    return valid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    messages.textContent = '';
    messages.className = 'form-messages';

    if (!validate()) {
      messages.textContent = 'Por favor corrige los campos marcados.';
      return;
    }

    // Simulación de envío
    messages.textContent = 'Enviando...';
    setTimeout(() => {
      messages.textContent = '¡Gracias! Tu solicitud fue enviada. Nos contactaremos pronto.';
      form.reset();
    }, 900);
  });
})();

// Scrollspy sencillo: resalta link según la sección visible
(() => {
  const sections = ['#inicio', '#servicios', '#precios', '#galeria', '#testimonios', '#faq', '#contacto']
    .map((id) => $(id)).filter(Boolean);
  const links = $$('.nav-link');
  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = `#${entry.target.id}`;
      if (entry.isIntersecting) {
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

  sections.forEach((sec) => observer.observe(sec));
})();

// Año dinámico en el footer
(() => {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// FAQ acordeón accesible
(() => {
  const questions = $$('.faq-q');
  if (questions.length === 0) return;
  questions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const answer = btn.nextElementSibling;
      if (!answer) return;
      if (expanded) {
        answer.hidden = true;
      } else {
        answer.hidden = false;
      }
    });
  });
})();

// Galería con lightbox
(() => {
  const images = $$('.gallery-item');
  if (images.length === 0) return;

  // Crear contenedor lightbox perezosamente
  let lightbox = null;
  const ensureLightbox = () => {
    if (lightbox) return lightbox;
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    const img = document.createElement('img');
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
    // Cerrar al hacer click fuera o presionar ESC
    lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('open');
    });
    return lightbox;
  };

  images.forEach((imgEl) => {
    imgEl.addEventListener('click', () => {
      const lb = ensureLightbox();
      const view = lb.querySelector('img');
      view.src = imgEl.src;
      view.alt = imgEl.alt || '';
      lb.classList.add('open');
    });
  });
})();


