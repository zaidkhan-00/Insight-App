// Ported Access CTA form micro-interactions (verbatim, IDs match ported markup).
    window.__insightOrbBridge = {
      focused: false,
      impulse: 0,
      locked: false,
      activeModel: 'armillary',
      onModelChange: null
    };

    (function initAccessInteractions() {
      const accessSection = document.getElementById('access-section');
      const orbStage = document.getElementById('orb-stage');

      const form = document.getElementById('access-form');
      const pillGroup = document.getElementById('input-pill-group');
      const emailInput = document.getElementById('access-email');
      const submitBtn = document.getElementById('request-access-btn');
      const errorEl = document.getElementById('access-email-error');
      const successCard = document.getElementById('access-success-card');
      const confirmedEmailSpan = document.getElementById('confirmed-email-span');
      const resetFormBtn = document.getElementById('reset-form-btn');

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const finePointerQuery = window.matchMedia('(pointer: fine)');

      let prefersReducedMotion = reducedMotionQuery.matches;
      let hasFinePointer = finePointerQuery.matches;

      reducedMotionQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
        if (prefersReducedMotion) {
          stopTypewriter(true);
          resetMagneticButton();
        } else {
          startTypewriterIfEligible();
        }
      });

      finePointerQuery.addEventListener('change', (e) => {
        hasFinePointer = e.matches;
        if (!hasFinePointer) {
          resetMagneticButton();
        }
      });



      /* ------------------------------------------------------------------------
         Placeholder Rotation (Typewriter)
         you@company.com -> team@yourco.com -> hello@studio.work
         70ms/char in, hold 2.2s (2200ms), 40ms delete. Pauses on focus; static under reduced motion.
         ------------------------------------------------------------------------ */
      const placeholders = [
        'you@company.com',
        'team@yourco.com',
        'hello@studio.work'
      ];
      let phraseIndex = 0;
      let charIndex = placeholders[0].length;
      let isDeleting = false;
      let typewriterTimer = null;
      let isInputFocused = false;

      function clearTypewriterTimer() {
        if (typewriterTimer !== null) {
          clearTimeout(typewriterTimer);
          typewriterTimer = null;
        }
      }

      function stopTypewriter(resetStatic) {
        clearTypewriterTimer();
        if (resetStatic) {
          emailInput.setAttribute('placeholder', placeholders[0]);
        }
      }

      function tickTypewriter() {
        clearTypewriterTimer();
        if (prefersReducedMotion || isInputFocused || emailInput.value.length > 0) {
          return;
        }

        const currentPhrase = placeholders[phraseIndex];

        if (!isDeleting) {
          charIndex = Math.min(currentPhrase.length, charIndex + 1);
          emailInput.setAttribute('placeholder', currentPhrase.slice(0, charIndex));

          if (charIndex === currentPhrase.length) {
            isDeleting = true;
            typewriterTimer = setTimeout(tickTypewriter, 2200); /* hold 2.2s */
          } else {
            typewriterTimer = setTimeout(tickTypewriter, 70); /* 70ms/char in */
          }
        } else {
          charIndex = Math.max(0, charIndex - 1);
          emailInput.setAttribute('placeholder', currentPhrase.slice(0, charIndex) || ' ');

          if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % placeholders.length;
            typewriterTimer = setTimeout(tickTypewriter, 70);
          } else {
            typewriterTimer = setTimeout(tickTypewriter, 40); /* 40ms delete */
          }
        }
      }

      function startTypewriterIfEligible() {
        clearTypewriterTimer();
        if (prefersReducedMotion) {
          emailInput.setAttribute('placeholder', placeholders[0]);
          return;
        }
        if (!isInputFocused && emailInput.value.length === 0 && !form.hidden) {
          typewriterTimer = setTimeout(tickTypewriter, 1200);
        }
      }

      emailInput.addEventListener('focus', () => {
        isInputFocused = true;
        window.__insightOrbBridge.focused = true;
        clearTypewriterTimer();
        if (emailInput.getAttribute('placeholder') === ' ') {
          emailInput.setAttribute('placeholder', placeholders[phraseIndex]);
        }
      });

      emailInput.addEventListener('blur', () => {
        isInputFocused = false;
        window.__insightOrbBridge.focused = false;
        startTypewriterIfEligible();
      });

      emailInput.addEventListener('input', () => {
        window.__insightOrbBridge.impulse = Math.min(1, window.__insightOrbBridge.impulse + 0.18);
        if (emailInput.getAttribute('aria-invalid') === 'true') {
          clearErrorState();
        }
      });

      /* Start placeholder cycle on load (after initial 2.2s hold on you@company.com) */
      if (!prefersReducedMotion) {
        isDeleting = true;
        typewriterTimer = setTimeout(tickTypewriter, 2200);
      } else {
        emailInput.setAttribute('placeholder', placeholders[0]);
      }

      /* ------------------------------------------------------------------------
         Magnetic Pull on Submit Button (max 6px, fine pointer only, no reduced motion)
         ------------------------------------------------------------------------ */
      function resetMagneticButton() {
        submitBtn.style.transform = 'translate3d(0px, 0px, 0px)';
      }

      submitBtn.addEventListener('pointermove', (e) => {
        if (prefersReducedMotion || !hasFinePointer || e.pointerType === 'touch') {
          return;
        }
        const rect = submitBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normX = (e.clientX - centerX) / (rect.width / 2);
        const normY = (e.clientY - centerY) / (rect.height / 2);
        const pullX = Math.max(-6, Math.min(6, normX * 6));
        const pullY = Math.max(-6, Math.min(6, normY * 6));
        submitBtn.style.transform = `translate3d(${pullX.toFixed(2)}px, ${pullY.toFixed(2)}px, 0px)`;
      });

      submitBtn.addEventListener('pointerleave', () => {
        resetMagneticButton();
      });

      /* ------------------------------------------------------------------------
         Email Validation, Shake Error, and Drawn Check Success State
         ------------------------------------------------------------------------ */
      function isValidWorkEmail(value) {
        const trimmed = (value || '').trim();
        if (!trimmed || trimmed.length > 254) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(trimmed);
      }

      function clearErrorState() {
        emailInput.setAttribute('aria-invalid', 'false');
        pillGroup.classList.remove('has-error', 'is-shaking');
        errorEl.classList.remove('is-visible');
        errorEl.textContent = '';
      }

      function triggerErrorState(message) {
        const msg = message || 'Please enter a valid work email';
        window.__insightOrbBridge.impulse = Math.min(1, window.__insightOrbBridge.impulse + 0.5);
        emailInput.setAttribute('aria-invalid', 'true');
        pillGroup.classList.add('has-error');
        pillGroup.classList.remove('is-shaking');
        void pillGroup.offsetWidth;
        pillGroup.classList.add('is-shaking');

        errorEl.innerHTML = `<span class="error-dot" aria-hidden="true"></span><span>${msg}</span>`;
        errorEl.classList.add('is-visible');
      }

      function triggerSuccessState(emailValue) {
        clearErrorState();
        clearTypewriterTimer();
        resetMagneticButton();

        window.__insightOrbBridge.locked = true;
        window.__insightOrbBridge.impulse = 1.0;

        confirmedEmailSpan.textContent = emailValue.trim();
        form.hidden = true;
        successCard.hidden = false;
        successCard.classList.remove('is-animated');
        void successCard.offsetWidth;
        successCard.classList.add('is-animated');
      }

      function resetToFormState() {
        window.__insightOrbBridge.locked = false;
        successCard.hidden = true;
        successCard.classList.remove('is-animated');
        form.hidden = false;
        clearErrorState();
        emailInput.focus();
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawEmail = emailInput.value;
        if (!isValidWorkEmail(rawEmail)) {
          triggerErrorState('Please enter a valid work email');
          emailInput.focus();
          return;
        }
        triggerSuccessState(rawEmail);
      });

      resetFormBtn.addEventListener('click', () => {
        resetToFormState();
      });



      /* ------------------------------------------------------------------------
         Scroll Linked Scale (0.92 -> 1.0) & Opacity (0.65 -> 0.85)
         ------------------------------------------------------------------------ */
      function updateOrbScrollProgress() {
        if (prefersReducedMotion) {
          orbStage.style.transform = 'translate(-50%, -50%) scale(1)';
          orbStage.style.opacity = '0.85';
          return;
        }

        const rect = accessSection.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight || 800;

        const rawProgress = (vh - rect.top) / (vh * 0.85);
        const progress = Math.max(0, Math.min(1, rawProgress));

        const scale = 0.92 + (1.0 - 0.92) * progress;
        const opacity = 0.65 + (0.85 - 0.65) * progress;

        orbStage.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        orbStage.style.opacity = opacity.toFixed(4);
      }

      window.addEventListener('scroll', updateOrbScrollProgress, { passive: true });
      window.addEventListener('resize', updateOrbScrollProgress, { passive: true });
      updateOrbScrollProgress();
    })();
