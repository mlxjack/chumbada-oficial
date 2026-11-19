/* Chumbada Oficial — motions e navegação */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Abertura só na primeira visita da sessão
  try {
    if (sessionStorage.getItem('co-intro')) root.classList.add('seen');
    else sessionStorage.setItem('co-intro', '1');
  } catch (e) { /* sem storage: mostra a abertura */ }

  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // ---------- menu do celular ----------
  const burger = document.querySelector('.nav-burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) menu.hidden = false;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ---------- revelação ao rolar ----------
  const rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    rvs.forEach(el => io.observe(el));
  }

  // ---------- contadores ----------
  const counters = document.querySelectorAll('[data-count]');
  const runCount = el => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  // ---------- inclinação 3D nos cards (só mouse) ----------
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.linha').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // ---------- rolagem: nav, barra de progresso, parallax, passos ----------
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.progress span');
  const wa = document.querySelector('.wa-float');
  const heroBg = document.querySelector('[data-parallax]');
  const drifts = [...document.querySelectorAll('[data-drift]')];
  const acao = document.querySelector('.acao');
  const steps = document.querySelector('.steps');
  const stepItems = steps ? [...steps.querySelectorAll('.step')] : [];
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('solid', y > 40);
    wa.classList.toggle('show', y > vh * 0.6);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // seção atual no menu
    let cur = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));

    if (reduce) return;
    if (heroBg && y < vh * 1.2) heroBg.style.transform = `translate3d(0, ${y * +heroBg.dataset.parallax}px, 0)`;

    if (acao) {
      const r = acao.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (vh - r.top) / (vh + r.height) - 0.5; // -0.5 .. 0.5
        drifts.forEach(el => { el.style.transform = `translate3d(0, ${(p * +el.dataset.drift * 2).toFixed(1)}px, 0)`; });
      }
    }

    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach((li, i) => li.classList.toggle('lit', p >= i / Math.max(1, stepItems.length - 1) - 0.02));
    }

  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
