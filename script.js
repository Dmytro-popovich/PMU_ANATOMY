/* ========= Utilities ========= */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* Year in footer */
(() => {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* Header elevation + hide on scroll down */
(() => {
  const header = $('.site-header');
  if (!header) return;
  let lastY = window.scrollY;
  const elevate = () => header.setAttribute('data-elevated', window.scrollY > 10);
  const hideOnScroll = () => {
    const y = window.scrollY;
    const down = y > lastY && y > 120;
    header.classList.toggle('is-hidden', down);
    lastY = y;
  };
  elevate();
  window.addEventListener('scroll', elevate, { passive:true });
  window.addEventListener('scroll', hideOnScroll, { passive:true });
})();

/* Mobile menu toggle */
(() => {
  const toggle = $('.nav-toggle');
  const menu = $('#primary-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('aria-expanded', String(!expanded));
  });
  $$('#primary-menu a').forEach(a => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-expanded', 'false');
  }));
})();

/* Active nav link by pathname */
(() => {
  const path = location.pathname.replace(/\/+$/, '') || '/index.html';
  $$('#primary-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href) return;
    const url = new URL(href, location.origin);
    if (url.pathname.replace(/\/+$/, '') === path) a.setAttribute('aria-current','page');
  });
})();

/* Smooth scroll for in-page anchors (ignore external pages) */
(() => {
  $$('a[href^="#"], .scroll-indicator').forEach(el => {
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
})();

/* Reveal animations on scroll */
(() => {
  const revealEls = $$('.reveal-up, .reveal-fade, .card, .gallery-item, .testimonial, .accordion, .contacts .map, .ba-slider, #lead-quiz');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold:0.12 });
  revealEls.forEach(el => io.observe(el));
})();

/* Parallax hero image */
(() => {
  const heroImg = $('.hero-media img');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroImg.style.transform = `translateY(${y * 0.08}px) scale(1.06)`;
  }, { passive:true });
})();

/* Lightbox for portfolio (works if dialog exists on the page) */
(() => {
  const lightbox = $('.lightbox');
  const lbImg = $('.lightbox-img');
  const lbClose = $('.lightbox-close');
  if (!lightbox || !lbImg) return;
  $$('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = (img.src || '').replace(/w=\d+/, 'w=1600');
      lbImg.alt = img.alt || '';
      lightbox.showModal();
    });
  });
  lbClose?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
})();

/* Before/After slider */
(() => {
  $$('.ba-slider').forEach(slider => {
    const handle = slider.querySelector('.handle');
    const resizeEl = slider.querySelector('.resize');
    const imgs = slider.querySelectorAll('img');
    const before = imgs[0];
    const after = resizeEl ? resizeEl.querySelector('img') : null;
    if (!slider || !handle || !resizeEl || !before || !after) return;

    const setRatio = () => {
      const w = before.naturalWidth || before.width;
      const h = before.naturalHeight || before.height;
      if (w && h) slider.style.aspectRatio = `${w} / ${h}`;
    };
    before.complete ? setRatio() : before.addEventListener('load', setRatio);

    const setPosPct = (pct) => {
      pct = Math.max(0, Math.min(100, pct));
      slider.style.setProperty('--pos', pct + '%');
    };
    const setFromClientX = (x) => {
      const r = slider.getBoundingClientRect();
      const pct = ((x - r.left) / r.width) * 100;
      setPosPct(pct);
    };
    setPosPct(50);

    let dragging = false;
    const start = (x) => { dragging = true; setFromClientX(x); };
    const move  = (x) => { if (dragging) setFromClientX(x); };
    const end   = () => { dragging = false; };

    handle.addEventListener('mousedown', e => { e.preventDefault(); start(e.clientX); });
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);

    handle.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive:false });
    window.addEventListener('touchmove',  e => move(e.touches[0].clientX),  { passive:false });
    window.addEventListener('touchend',   end);

    slider.addEventListener('mousedown', e => { e.preventDefault(); start(e.clientX); });
    slider.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive:false });

    window.addEventListener('resize', () => {
      const cur = parseFloat(getComputedStyle(slider).getPropertyValue('--pos')) || 50;
      setPosPct(cur);
    });
  });
})();

/* Care tabs (pre/after/lips/brows/timeline) — only on precare.html */
(() => {
  const root = $('#precare');
  if (!root) return;
  const tabs = root.querySelectorAll('.care-tab');
  const panels = root.querySelectorAll('.care-panel');
  const activate = (name) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panels.forEach(p => p.hidden = (p.dataset.tab !== name));
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.tab)));
  activate('pre');
})();

/* Pricing tooltip hover/focus (CSS already handles it) */
(() => {})();

/* Booking modal (if used on any page) */
(() => {
  const bookingModal = $('#bookingModal');
  if (!bookingModal) return;
  $$('a[href="#booking"]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); bookingModal.showModal(); });
  });
  bookingModal.querySelector('.modal-close')?.addEventListener('click', () => bookingModal.close());
  bookingModal.addEventListener('click', (e) => { if (e.target === bookingModal) bookingModal.close(); });

  // Booksy lazy load
  const booksyBtn = $('#booksyBtn');
  let booksyLoaded = false;
  booksyBtn?.addEventListener('click', () => {
    if (booksyLoaded) return;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://booksy.com/widget/code.js?id=1587543&country=us&lang=uk';
    document.body.appendChild(s);
    booksyLoaded = true;
    booksyBtn.disabled = true;
    booksyBtn.textContent = 'Widget loaded!';
  });
})();

/* Calendly popup (used by bottom CTA and any #booking link) */
(() => {
  const CALENDLY_URL = 'https://calendly.com/lireongames?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=323232&text_color=ffffff&primary_color=fbcd96';
  function ensureCalendlyAssets() {
    if (!document.querySelector('link[href*="assets.calendly.com"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(l);
    }
    if (!window.Calendly) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      document.head.appendChild(s);
    }
  }
  function openCalendly(e){
    if (e){ e.preventDefault(); e.stopPropagation(); }
    ensureCalendlyAssets();
    const tryOpen = () => {
      if (window.Calendly?.initPopupWidget) Calendly.initPopupWidget({ url: CALENDLY_URL });
      else setTimeout(tryOpen, 120);
    };
    tryOpen();
    return false;
  }
  // Hook any element with data-calendly or #booking links
  $$('[data-calendly], a[href="#booking"]').forEach(el => el.addEventListener('click', openCalendly));
  // Bottom bar support if present
  const bottomBook = $('#bottomBookBtn') || $('.js-bottom-book');
  bottomBook?.addEventListener('click', openCalendly);
})();

/* Sticky bottom nav show/hide on scroll (if present) */
(() => {
  const bar = $('.bottom-nav');
  if (!bar) return;
  const toggle = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const doc = document.documentElement;
    const BOTTOM_OFFSET = 220;
    const nearBottom = (window.innerHeight + y) >= (doc.scrollHeight - BOTTOM_OFFSET);
    if (y > 500 && !nearBottom) bar.classList.add('is-visible');
    else bar.classList.remove('is-visible');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive:true });
  window.addEventListener('resize', toggle, { passive:true });
})();

/* QUIZ page logic (only if quiz exists) */
(() => {
  const quiz = $('#lead-quiz');
  if (!quiz) return;

  // Elements
  const steps    = $$('.quiz-step', quiz);
  const nextBtn  = $('#quizNext', quiz);
  const prevBtn  = $('#quizPrev', quiz);
  const bar      = $('.quiz-bar__fill', quiz);
  const stepNow  = $('#quizStepNow', quiz);

  const s1Box    = $('#quizStep1Options', quiz) || $('[data-step="1"] .quiz-grid', quiz);
  const s2Title  = $('#quizStep2Title', quiz) || $('[data-step="2"] .quiz-title', quiz);
  const s2Sub    = $('#quizStep2Sub', quiz)   || $('[data-step="2"] .quiz-sub', quiz);
  const s2Box    = $('#quizStep2Options', quiz) || $('[data-step="2"] .quiz-grid', quiz);
  const s3Title  = $('#quizStep3Title', quiz) || $('[data-step="3"] .quiz-title', quiz);
  const s3Sub    = $('#quizStep3Sub', quiz)   || $('[data-step="3"] .quiz-sub', quiz);
  const s3Box    = $('#quizStep3Options', quiz) || $('[data-step="3"] .quiz-grid', quiz);

  const form       = $('#quizForm', quiz);
  const phoneInput = form?.querySelector('input[name="phone"]');
  const err        = form?.querySelector('.error');
  const okEl       = $('#quizOk', quiz);
  const submitBtn  = $('#quizSubmit', quiz);
  const editBtn    = $('#quizEdit', quiz);

  // State
  const values = { interest:'', experience:'', details:[], phone:'' };
  let idx = 0;
  const TOTAL = 4;
  const pctPerStep = 100 / TOTAL;

  // Dictionary
  const DATA = {
    courses: {
      levels:[
        'Beginner (no procedures yet)',
        'Some experience (1–10 clients)',
        'Working artist (10+ clients)'
      ],
      goals:[
        'Start taking paying clients',
        'Master lip blush technique',
        'Improve retention & healing',
        'Color neutralization (dark lips)',
        'Communications & marketing'
      ]
    },
    services: {
      expYes:[
        'Faded pigment / poor retention',
        'Discoloration (cool/warm)',
        'Unsatisfied with shape/result',
        'Old microblading',
        'Need removal/lightening'
      ],
      expNo:[
        'Natural everyday look',
        'Define shape / add volume',
        'Correct asymmetry',
        'Wake up ready / save time',
        'Consultation first'
      ],
      extras:{
        'Brows':{ yes:['Cover microblading','Sparse tails / gaps'], no:['Soft powder look','Brow reconstruction'] },
        'Lips':{ yes:['Neutralize dark/cool tone','Fix asymmetry'], no:['Soft baby tint','Even out contour'] },
        'Lash Line':{ yes:['Gaps in lash line','Allergy to makeup'], no:['Smudge-free daily look','Open-eye effect'] }
      }
    }
  };

  // Helpers
  const clear = el => { if (el) el.innerHTML = ''; };
  const chipHTML = (label) => `<button class="chip" data-value="${label.replace(/"/g,'&quot;')}">${label}</button>`;
  const getSelected = (container) => $$('.chip.active', container).map(c => c.dataset.value);

  const renderChips = (container, labels, { single=true, onChange }={}) => {
    if (!container) return;
    clear(container);
    container.insertAdjacentHTML('beforeend', (labels||[]).map(chipHTML).join(''));
    $$('.chip', container).forEach(btn => {
      btn.addEventListener('click', () => {
        if (single) {
          $$('.chip', container).forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
        } else {
          btn.classList.toggle('active');
        }
        onChange && onChange(getSelected(container));
        validateStep();
      });
    });
  };

  // Step renderers
  const renderStep2 = () => {
    values.experience = '';
    if (values.interest === 'Courses') {
      if (s2Title) s2Title.textContent = 'Step 2: Your experience level';
      if (s2Sub)   s2Sub.textContent   = 'Pick the best match.';
      renderChips(s2Box, DATA.courses.levels, {
        single:true, onChange:(sel)=>{ values.experience = sel[0] || ''; renderStep3(); }
      });
    } else {
      if (s2Title) s2Title.textContent = 'Step 2: Have you had PMU before?';
      if (s2Sub)   s2Sub.textContent   = '';
      renderChips(s2Box, ['Yes','No','Not sure'], {
        single:true, onChange:(sel)=>{ values.experience = sel[0] || ''; renderStep3(); }
      });
    }
  };

  const renderStep3 = () => {
    values.details = [];
    let labels = [];
    if (values.interest === 'Courses') {
      if (s3Title) s3Title.textContent = 'Step 3: Your goals';
      if (s3Sub)   s3Sub.textContent   = 'Choose all that apply.';
      labels = DATA.courses.goals;
    } else {
      const extras = (DATA.services.extras || {})[values.interest] || { yes:[], no:[] };
      if (values.experience === 'Yes') {
        if (s3Title) s3Title.textContent = 'Step 3: What brings you back?';
        if (s3Sub)   s3Sub.textContent   = 'Choose all that apply.';
        labels = [...DATA.services.expYes, ...extras.yes];
      } else if (values.experience === 'No') {
        if (s3Title) s3Title.textContent = 'Step 3: What’s your main goal?';
        if (s3Sub)   s3Sub.textContent   = 'Choose all that apply.';
        labels = [...DATA.services.expNo, ...extras.no];
      } else {
        if (s3Title) s3Title.textContent = 'Step 3: Not sure?';
        if (s3Sub)   s3Sub.textContent   = 'Tell us what area needs advice.';
        labels = ['Brows','Lips','Lash Line','Need advice'];
      }
    }
    renderChips(s3Box, labels, { single:false, onChange:(sel)=>{ values.details = sel; } });
  };

  // Init step2/3 on interest select
  $$('.chip', s1Box).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chip', s1Box).forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      values.interest = btn.dataset.value || '';
      renderStep2();
      renderStep3();
      validateStep();
    });
  });

  // Nav + validation
  const go = (to) => { steps[idx].classList.remove('is-active'); idx = to; steps[idx].classList.add('is-active'); validateStep(); };
  const validateStep = () => {
    const step = steps[idx];
    let ok = false;
    if (step.dataset.step === '1') ok = !!values.interest;
    if (step.dataset.step === '2') ok = !!values.experience;
    if (step.dataset.step === '3') ok = (values.details && values.details.length > 0);
    if (step.dataset.step === '4') ok = true;
    prevBtn.disabled = idx === 0;
    if (idx === steps.length - 1) { nextBtn.classList.add('is-hidden'); nextBtn.disabled = true; }
    else { nextBtn.classList.remove('is-hidden'); nextBtn.disabled = !ok; }
    stepNow.textContent = String(idx + 1);
    bar.style.width = ( (100 / TOTAL) * (idx + 1) ) + '%';
  };
  nextBtn.addEventListener('click', () => { if (idx < steps.length - 1) go(idx + 1); });
  prevBtn.addEventListener('click', () => { if (idx > 0) go(idx - 1); });

  // Submit (Web3Forms)
  if (editBtn) { editBtn.hidden = true; editBtn.disabled = true; }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = phoneInput.value.trim();
    const valid = /^\+?[0-9\s\-()]{7,}$/.test(phone);
    if (!valid) { err.textContent = 'Please enter a valid phone number'; phoneInput.setAttribute('aria-invalid','true'); return; }
    phoneInput.setAttribute('aria-invalid','false'); err.textContent = ''; values.phone = phone;

    const hp = $('#hpWebsite'); if (hp && hp.value) { err.textContent = 'Spam detected.'; return; }

    const detailsStr = (values.details && values.details.length) ? values.details.join(', ') : '—';
    const WEB3FORMS_KEY = 'd87bc65f-f6b7-4124-8d5c-1321f3af519b'; // заміни на свій при потребі
    const msg =
      `New lead from Quiz\n\n` +
      `Interest: ${values.interest}\n` +
      `Experience: ${values.experience || '—'}\n` +
      `Details: ${detailsStr}\n` +
      `Phone: ${values.phone}\n` +
      `Page: ${location.href}`;

    const fd = new FormData();
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', 'New Lead • PERMA Quiz');
    fd.append('from_name', 'PERMA Website');
    fd.append('message', msg);
    fd.append('interest', values.interest);
    fd.append('experience', values.experience || '');
    fd.append('details', detailsStr);
    fd.append('phone', values.phone);
    fd.append('page', location.href);
    fd.append('botcheck', hp ? hp.value : '');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', { method:'POST', body:fd })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        okEl.hidden = false;
        submitBtn.textContent = 'Sent ✓';
        phoneInput.setAttribute('disabled', 'true');
        if (editBtn) { editBtn.hidden = false; editBtn.disabled = false; }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
        err.textContent = 'Could not send. Try again or DM us on Instagram.';
      });
  });

  editBtn?.addEventListener('click', () => {
    okEl.hidden = true;
    phoneInput.removeAttribute('disabled');
    editBtn.hidden = true; editBtn.disabled = true;
    submitBtn.disabled = false; submitBtn.textContent = 'Update';
    const step4 = $('.quiz-step[data-step="4"]', quiz);
    steps.forEach(s => s.classList.remove('is-active'));
    step4.classList.add('is-active');
    idx = steps.indexOf(step4);
    phoneInput.focus(); phoneInput.select?.(); validateStep();
  });

  // Initial paint
  steps[0].classList.add('is-active');
  renderStep2(); renderStep3(); validateStep();
})();

/* UTM helper for Instagram links */
(() => {
  const addUtm = (a, extra={}) => {
    try{
      const u = new URL(a.href);
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source','website');
        u.searchParams.set('utm_medium','cta');
        u.searchParams.set('utm_campaign', location.pathname.includes('course') ? 'course' : 'services');
        Object.entries(extra).forEach(([k,v])=>u.searchParams.set(k,v));
        a.href = u.toString();
      }
    }catch(e){}
  };
  $$('a[href*="instagram.com/dari_permanent"]').forEach(a => addUtm(a));
})();
// ============ COURSE STEP QUIZ (multi-step with Edit after Send) ============
(function () {
  const root = document.getElementById('course-lead');
  if (!root) return;

  const form = root.querySelector('#courseStepForm');
  const hp = form.querySelector('#cHpWebsite');

  // steps
  const steps = Array.from(form.querySelectorAll('.lead-step'));
  const nextBtn = form.querySelector('#leadNext');
  const prevBtn = form.querySelector('#leadPrev');
  const barFill = form.querySelector('#leadBarFill');
  const stepNow = form.querySelector('#leadStepNow');

  // groups
  const programGroup = form.querySelector('#programGroup');
  const experienceGroup = form.querySelector('#experienceGroup');

  // inputs (step 3)
  const nameInput = form.querySelector('input[name="full_name"]');
  const contactInput = form.querySelector('input[name="contact"]');

  // submit / success UI
  const submitBtn = form.querySelector('#cQuizSubmit');
  const okMsg = form.querySelector('#cQuizOk');

  // error elements
  const errProgram = form.querySelector('.error[data-for="program"]');
  const errExp = form.querySelector('.error[data-for="experience"]');
  const errName = form.querySelector('.error[data-for="full_name"]');
  const errContact = form.querySelector('.error[data-for="contact"]');

  // state
  const values = {
    program: '',
    experience: '',
    full_name: '',
    contact: ''
  };

  let idx = 0; // current step index
  const TOTAL = steps.length;

  // internal flags
  let formSent = false; // true після успішного сабміту
  let editMode = false; // true коли юзер натиснув Edit після відправки

  // -------- helpers --------
  function showStep(i) {
    steps.forEach(s => s.classList.remove('is-active'));
    steps[i].classList.add('is-active');

    // Кнопки навігації
    prevBtn.disabled = (i === 0);

    // На останньому кроці ховаємо Next і показуємо submitBtn
    if (i === TOTAL - 1) {
      nextBtn.style.display = 'none';
      // submitBtn завжди видно на Step 3
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }

    // Прогрес
    stepNow.textContent = String(i + 1);
    const pct = ((i + 1) / TOTAL) * 100;
    barFill.style.width = pct + '%';
  }

  function setupChipGroup(groupEl, key, errEl) {
    if (!groupEl) return;
    const chips = groupEl.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // заблочені чіпи не клікаються в режимі після відправки
        if (formSent && !editMode) return;

        // clear active
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        values[key] = chip.dataset.value || '';
        if (errEl) errEl.textContent = '';
      });
    });
  }

  setupChipGroup(programGroup, 'program', errProgram);
  setupChipGroup(experienceGroup, 'experience', errExp);

  function syncStep3Values() {
    values.full_name = nameInput.value.trim();
    values.contact = contactInput.value.trim();
  }

  function validateCurrentStep() {
    const stepNum = idx + 1;
    let ok = true;

    if (stepNum === 1) {
      if (!values.program) {
        errProgram.textContent = 'Required';
        ok = false;
      } else {
        errProgram.textContent = '';
      }
    }

    if (stepNum === 2) {
      if (!values.experience) {
        errExp.textContent = 'Required';
        ok = false;
      } else {
        errExp.textContent = '';
      }
    }

    if (stepNum === 3) {
      syncStep3Values();

      if (!values.full_name) {
        errName.textContent = 'Required';
        ok = false;
      } else {
        errName.textContent = '';
      }

      if (!values.contact) {
        errContact.textContent = 'Required';
        ok = false;
      } else {
        errContact.textContent = '';
      }
    }

    return ok;
  }

  // заблочити поля та чіпи після відправки (view/locked mode)
  function lockFormView() {
    formSent = true;
    editMode = false;

    // заблокувати inputs
    nameInput.setAttribute('disabled', 'true');
    contactInput.setAttribute('disabled', 'true');

    // позначити чіпи як locked
    form.querySelectorAll('.chip').forEach(c => {
      c.classList.add('is-locked');
    });

    // кнопка: "Send" -> "Edit"
    submitBtn.textContent = 'Edit';
    submitBtn.classList.add('btn--edit');
    submitBtn.disabled = false;

    okMsg.hidden = false;
    okMsg.textContent = 'Sent ✓ We’ll contact you shortly.';
  }

  // розблочити інпути, щоб юзер міг оновити контакт (edit mode)
  function unlockForEdit() {
    editMode = true;

    nameInput.removeAttribute('disabled');
    contactInput.removeAttribute('disabled');

    // чіпи лишаємо locked, бо ти сказав — ми вже отримали курс/досвід
    // (не треба давати змінювати програму і досвід після сабміту,
    //  щоб не було плутанини)

    submitBtn.textContent = 'Send';
    submitBtn.classList.remove('btn--edit');
    submitBtn.disabled = false;

    okMsg.hidden = true;
  }

  // коли юзер тисне Next
  nextBtn.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    if (idx < TOTAL - 1) {
      idx++;
      showStep(idx);
    }
  });

  // коли Back
  prevBtn.addEventListener('click', () => {
    if (idx > 0) {
      idx--;
      showStep(idx);
    }
  });

  // submit / edit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Якщо форма вже була відправлена і зараз НЕ editMode —
    // це означає, що юзер натиснув "Edit"
    if (formSent && !editMode) {
      unlockForEdit();
      return;
    }

    // далі 2 сценарії:
    // - форма ніколи не відправлялась (перша відправка)
    // - юзер в editMode (оновлення контакту)
    // У будь-якому випадку: валідація
    if (!validateCurrentStep()) return;

    // honeypot ботчек
    if (hp && hp.value) {
      return; // не шлемо нічого ботам
    }

    // будуємо повідомлення
    const detailsMsg =
      `New training lead\n\n` +
      `Program: ${values.program}\n` +
      `Experience: ${values.experience}\n` +
      `Name: ${values.full_name}\n` +
      `Contact: ${values.contact}\n` +
      `Page: ${location.href}`;

    const WEB3FORMS_KEY = 'c915cea6-1246-40d7-8b73-4dd770bef053';

    const fd = new FormData();
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', 'New Training Lead • PERMA Course');
    fd.append('from_name', 'PERMA Website');
    fd.append('message', detailsMsg);

    // поля окремо:
    fd.append('program', values.program);
    fd.append('experience', values.experience);
    fd.append('full_name', values.full_name);
    fd.append('contact_info', values.contact);
    fd.append('page', location.href);

    // honeypot
    fd.append('botcheck', hp ? hp.value : '');

    submitBtn.disabled = true;
    submitBtn.textContent = editMode ? 'Updating…' : 'Sending…';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd
    })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(() => {
      // успішно
      lockFormView();
    })
    .catch(() => {
      // помилка
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
      submitBtn.classList.remove('btn--edit');
      okMsg.hidden = false;
      okMsg.textContent = 'Could not send. Try again or DM us on Instagram.';

      // повертаємо editMode = true, щоб юзер міг поправити контакт і ще раз натиснути Send
      formSent = false;
      editMode = true;
    });
  });

  // ініціалізація
  showStep(idx);
})();
// ===== HORIZONTAL REVIEWS SCROLLER: INFINITE + CLICK LOCK =====
(function () {
  const track = document.getElementById("reviewsTrack");
  const btnPrev = document.getElementById("reviewLeft");
  const btnNext = document.getElementById("reviewRight");
  if (!track || !btnPrev || !btnNext) return;

  // 1. читаємо оригінальні картки (без клонів)
  const cardsOriginal = Array.from(track.querySelectorAll(".review-card"));

  // скільки карток влазить у viewport по ширині
  function cardsPerView() {
    const firstCard = cardsOriginal[0];
    if (!firstCard) return 1;
    const cardWidth = firstCard.offsetWidth + 24; // 24px gap
    return Math.max(1, Math.floor(track.parentElement.offsetWidth / cardWidth));
  }

  // створюємо копію картки (помітимо data-clone)
  function cloneCard(card) {
    const c = card.cloneNode(true);
    c.setAttribute("data-clone", "true");
    return c;
  }

  // будуємо трек: хвостові клони + оригінал + головні клони
  function setupClones() {
    track.innerHTML = "";

    const perView = cardsPerView();
    const headClones = cardsOriginal.slice(0, perView).map(cloneCard);
    const tailClones = cardsOriginal.slice(-perView).map(cloneCard);

    // порядок у DOM:
    // [tail clones] + [originals] + [head clones]
    tailClones.forEach(c => track.appendChild(c));
    cardsOriginal.forEach(c => track.appendChild(c));
    headClones.forEach(c => track.appendChild(c));
  }

  // стан каруселі
  let index = 0;          // логічний індекс у межах cardsOriginal
  let isAnimating = false;

  // обчислюємо позицію треку так,
  // щоб активна картка була рівно по центру viewport
  function updatePosition(animate = true) {
  const allCards = track.querySelectorAll(".review-card");
  if (allCards.length === 0) return;

  // 1. рахуємо реальний "крок" між картками
  // беремо першу і другу картку і дивимось, на скільки друга зсунута відносно першої
  let stepWidth;
  if (allCards.length > 1) {
    const rect0 = allCards[0].getBoundingClientRect();
    const rect1 = allCards[1].getBoundingClientRect();
    stepWidth = rect1.left - rect0.left; 
    // це дає нам: ширина картки + реальний gap між ними
  } else {
    // якщо картка всього одна — fallback
    stepWidth = allCards[0].offsetWidth;
  }

  const perView = cardsPerView();

  // фактичний індекс активної картки у track
  const visualIndex = index + perView;

  // ширина області перегляду (обгортки треку)
  const viewportWidth = track.parentElement.offsetWidth;

  // активна картка (та, яку ми хочемо по центру)
  const activeCard = allCards[visualIndex];
  if (!activeCard) return;

  // геометрія активної картки
  const activeRect = activeCard.getBoundingClientRect();
  const activeWidth = activeRect.width;

  // ---- Центрування ----
  // хочемо, щоб центр активної картки = центр viewport
  // отже, targetCenter = viewportWidth / 2
  // зараз center цієї картки в системі координат треку = visualIndex * stepWidth + (activeWidth / 2)
  // нам треба так зрушити трек, щоб цей center співпав з viewportWidth/2

  const cardCenterInTrack = visualIndex * stepWidth + (activeWidth / 2);
  const desiredCenter = viewportWidth / 2;

  const offsetX = desiredCenter - cardCenterInTrack;

  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition = "transform 0.5s ease";
  }

  track.style.transform = `translateX(${offsetX}px)`;
}


  // зациклення:
  // якщо пішли за межі оригінальних карток, перестрибуємо,
  // і одразу виставляємо позицію без анімації
  function handleLoopEdges() {
    const total = cardsOriginal.length;

    if (index < 0) {
      index = total - 1;
      updatePosition(false); // без анімації, щоб не було ривка
    }

    if (index > total - 1) {
      index = 0;
      updatePosition(false);
    }
  }

  // кнопка "вліво"
  btnPrev.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    index--;
    updatePosition(true);
  });

  // кнопка "вправо"
  btnNext.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    index++;
    updatePosition(true);
  });

  // коли завершилася анімація прокрутки
  track.addEventListener("transitionend", () => {
    handleLoopEdges();
    // невелика пауза, щоб не можна було наклікати під час інерції
    setTimeout(() => {
      isAnimating = false;
    }, 80);
  });

  // при ресайзі збираємо все заново (бо ширини змінились)
  window.addEventListener("resize", () => {
    const savedIndex = index;
    setupClones();
    index = Math.min(savedIndex, cardsOriginal.length - 1);
    updatePosition(false);
  });

  // init
  setupClones();
  index = 0;
  updatePosition(false);
})();

// === Calendly booking integration ===
document.addEventListener("DOMContentLoaded", function () {
  // Підключення стилів і скрипта Calendly (один раз)
  const calendlyCSS = document.createElement("link");
  calendlyCSS.rel = "stylesheet";
  calendlyCSS.href = "https://assets.calendly.com/assets/external/widget.css";
  document.head.appendChild(calendlyCSS);

  const calendlyScript = document.createElement("script");
  calendlyScript.src = "https://assets.calendly.com/assets/external/widget.js";
  calendlyScript.async = true;
  document.body.appendChild(calendlyScript);

  calendlyScript.onload = function () {
    // Знаходимо всі кнопки бронювання
    const bookButtons = document.querySelectorAll(
      'a[href*="quiz"], a[href*="book"], .btn--sm, .book-btn'
    );

    // Додаємо обробник кліку
    bookButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        Calendly.initPopupWidget({
          url: "https://calendly.com/anatomypmu?background_color=2c2c2c&text_color=ffffff&primary_color=fbb08a",
        });
        return false;
      });
    });
  };
});
