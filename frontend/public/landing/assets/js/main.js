/* =========================================================
   INSIGHT — interaction layer
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / (edge1 - edge0));
    return x * x * (3 - 2 * x);
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* -------------------------------------------------------
     Intro
     ------------------------------------------------------- */

  const loader = $("#pageLoader");
  const heroReveals = $$(".hero .reveal");

  function startIntro() {
    setTimeout(() => {
      loader?.classList.add("is-hidden");
      heroReveals.forEach((element, index) => {
        window.setTimeout(() => element.classList.add("is-visible"), 80 + index * 85);
      });
    }, reduceMotion ? 50 : 760);
  }

  if (document.readyState === "complete") startIntro();
  else window.addEventListener("load", startIntro, { once: true });

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */

  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const siteHeader = $("#siteHeader");

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    siteHeader?.classList.toggle("is-menu", open);
    const main = $("#main");
    const footer = $(".site-footer");
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (open) {
      const firstLink = $("a", mobileMenu);
      window.setTimeout(() => firstLink?.focus({ preventScroll: true }), 250);
    } else if (menuToggle.getAttribute("aria-expanded") === "false" && document.activeElement && mobileMenu.contains(document.activeElement)) {
      menuToggle.focus({ preventScroll: true });
    }
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  $$("#mobileMenu a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  /* -------------------------------------------------------
     Signal canvas
     ------------------------------------------------------- */

  function initSignalCanvas() {
    const canvas = $("#signalCanvas");
    const stage = $("#coreStage");
    if (!canvas || !stage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let lastFrame = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const colors = {
      paper: "235, 232, 228",
      red: "176, 96, 89",
      green: "169, 201, 122",
      blue: "142, 200, 232",
      sand: "214, 184, 144"
    };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function lineArc(cx, cy, radius, start, end, color, alpha, lineWidth, blur = 0) {
      context.save();
      context.beginPath();
      context.arc(cx, cy, radius, start, end);
      context.strokeStyle = `rgba(${color}, ${alpha})`;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      if (blur) {
        context.shadowColor = `rgba(${color}, ${Math.min(alpha * 1.5, 1)})`;
        context.shadowBlur = blur;
      }
      context.stroke();
      context.restore();
    }

    function drawTerrain(cx, cy, radius, time) {
      context.save();
      context.beginPath();
      context.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      context.clip();

      // Deep red atmosphere behind the signal form
      const coreGlow = context.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.96);
      coreGlow.addColorStop(0, "rgba(174, 98, 90,   0.13)");
      coreGlow.addColorStop(0.42, "rgba(174, 98, 90,   0.045)");
      coreGlow.addColorStop(0.78, "rgba(174, 98, 90,   0.012)");
      coreGlow.addColorStop(1, "rgba(174, 98, 90,   0)");
      context.fillStyle = coreGlow;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      const rows = 68;
      for (let index = 0; index < rows; index += 1) {
        const normalized = index / (rows - 1);
        const y = cy - radius * 0.63 + normalized * radius * 1.26;
        const ny = (y - cy) / (radius * 0.64);
        const envelope = Math.pow(Math.max(0, 1 - ny * ny), 0.58);
        const waveA = Math.sin(normalized * 8.8 + time * 0.52) * 0.12;
        const waveB = Math.sin(normalized * 19.2 - time * 0.31) * 0.045;
        const halfWidth = radius * (0.8 + waveA + waveB) * envelope;
        const drift = Math.sin(normalized * 5.3 + time * 0.4) * radius * 0.045;
        const centerX = cx + drift;
        const alpha = 0.16 + envelope * 0.48;

        context.beginPath();
        context.moveTo(centerX - halfWidth, y);
        context.lineTo(centerX + halfWidth, y);
        context.strokeStyle = `rgba(${colors.red}, ${alpha})`;
        context.lineWidth = index % 5 === 0 ? 1.15 : 0.58;
        context.stroke();

        if (index % 5 === 0 && halfWidth > radius * 0.1) {
          context.beginPath();
          context.arc(centerX - halfWidth, y, index % 10 === 0 ? 1.15 : 0.8, 0, Math.PI * 2);
          context.fillStyle = `rgba(${colors.red}, ${0.38 + envelope * 0.5})`;
          context.fill();
          context.beginPath();
          context.arc(centerX + halfWidth, y, index % 10 === 0 ? 1.15 : 0.8, 0, Math.PI * 2);
          context.fill();
        }
      }

      // Scanner sweep
      const sweep = ((Math.sin(time * 0.27) + 1) / 2) * radius * 1.28 - radius * 0.64;
      const gradient = context.createLinearGradient(0, cy + sweep - 22, 0, cy + sweep + 22);
      gradient.addColorStop(0, "rgba(174, 98, 90,   0)");
      gradient.addColorStop(0.5, "rgba(174, 98, 90,   0.13)");
      gradient.addColorStop(1, "rgba(174, 98, 90,   0)");
      context.fillStyle = gradient;
      context.fillRect(cx - radius, cy + sweep - 22, radius * 2, 44);

      // Orbital glints
      for (let i = 0; i < 11; i += 1) {
        const angle = (i / 11) * Math.PI * 2 + time * 0.05;
        const x = cx + Math.cos(angle) * radius * 0.82;
        const y = cy + Math.sin(angle) * radius * 0.4;
        context.beginPath();
        context.arc(x, y, i % 4 === 0 ? 1.1 : 0.7, 0, Math.PI * 2);
        context.fillStyle = `rgba(${colors.paper}, ${0.12 + (i % 3) * 0.08})`;
        context.fill();
      }

      context.restore();
    }

    function draw(time) {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      const cx = width / 2 + pointer.x * 9;
      const cy = height / 2 + pointer.y * 9;
      const base = Math.min(width, height) * 0.325;
      const rotation = time * 0.035;

      // Halo
      const halo = context.createRadialGradient(cx, cy, 0, cx, cy, base * 2.1);
      halo.addColorStop(0, "rgba(174, 98, 90,   0.065)");
      halo.addColorStop(0.34, "rgba(174, 98, 90,   0.02)");
      halo.addColorStop(0.7, "rgba(235, 231, 230,   0.008)");
      halo.addColorStop(1, "rgba(0, 0, 0,   0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(cx, cy, base * 2.1, 0, Math.PI * 2);
      context.fill();

      // Very faint concentric circles
      for (let i = 1; i <= 4; i += 1) {
        lineArc(cx, cy, base * (0.86 + i * 0.14), 0, Math.PI * 2, colors.paper, 0.035, 0.7);
      }

      // Outer tick ring
      const tickRadius = base * 1.42;
      const tickCount = 132;
      for (let i = 0; i < tickCount; i += 1) {
        const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
        const emphasis = i % 11 === 0;
        const inner = tickRadius - (emphasis ? 8 : 3.5);
        context.beginPath();
        context.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        context.lineTo(cx + Math.cos(angle) * tickRadius, cy + Math.sin(angle) * tickRadius);
        context.strokeStyle = emphasis
          ? "rgba(235, 231, 230,   0.24)"
          : "rgba(235, 231, 230,   0.09)";
        context.lineWidth = emphasis ? 0.9 : 0.55;
        context.stroke();
      }

      // Segmented outer light ring
      const ringRadius = base * 1.35;
      const segments = [
        { start: -1.48, end: -0.55, color: colors.green, alpha: 0.92, width: 2.9 },
        { start: -0.45, end: -0.08, color: colors.paper, alpha: 0.65, width: 2 },
        { start: 0.02, end: 0.62, color: colors.red, alpha: 1, width: 3.1 },
        { start: 0.69, end: 0.94, color: colors.paper, alpha: 0.48, width: 1.7 },
        { start: 1.02, end: 1.5, color: colors.blue, alpha: 0.85, width: 2.5 },
        { start: 1.57, end: 1.82, color: colors.sand, alpha: 0.8, width: 2.2 },
        { start: 1.9, end: 2.31, color: colors.green, alpha: 0.62, width: 1.8 }
      ];
      for (const segment of segments) {
        const animatedRadius = ringRadius + Math.sin(time * 0.5 + segment.start) * 1.3;
        lineArc(
          cx,
          cy,
          animatedRadius,
          segment.start + rotation,
          segment.end + rotation,
          segment.color,
          segment.alpha,
          segment.width,
          16
        );
        for (const edge of [segment.start, segment.end]) {
          const angle = edge + rotation;
          context.beginPath();
          context.arc(cx + Math.cos(angle) * animatedRadius, cy + Math.sin(angle) * animatedRadius, 2.2, 0, Math.PI * 2);
          context.fillStyle = `rgba(${segment.color}, ${Math.min(1, segment.alpha + 0.05)})`;
          context.shadowColor = `rgba(${segment.color}, 0.8)`;
          context.shadowBlur = 12;
          context.fill();
          context.shadowBlur = 0;
        }
      }

      // Dashed guide
      context.save();
      context.setLineDash([1, 7]);
      lineArc(cx, cy, base * 1.19, 0, Math.PI * 2, colors.paper, 0.19, 0.8);
      context.restore();

      // Dark backing disc
      const disc = context.createRadialGradient(cx, cy, base * 0.1, cx, cy, base * 1.07);
      disc.addColorStop(0, "rgba(21, 18, 17,   0.74)");
      disc.addColorStop(0.72, "rgba(16, 13, 12,   0.54)");
      disc.addColorStop(1, "rgba(16, 13, 12,   0)");
      context.fillStyle = disc;
      context.beginPath();
      context.arc(cx, cy, base * 1.07, 0, Math.PI * 2);
      context.fill();

      // Inner lattice
      context.save();
      context.beginPath();
      context.arc(cx, cy, base * 0.94, 0, Math.PI * 2);
      context.clip();
      for (let i = 0; i < 36; i += 1) {
        const angle = (i / 36) * Math.PI * 2 + time * 0.016;
        const inner = base * 0.55;
        const outer = base * 0.94;
        context.beginPath();
        context.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        context.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        context.strokeStyle = "rgba(235, 231, 230,   0.034)";
        context.lineWidth = 0.5;
        context.stroke();
      }
      context.restore();

      // Inner rings
      lineArc(cx, cy, base, 0, Math.PI * 2, colors.paper, 0.17, 0.8);
      lineArc(cx, cy, base * 0.82, 0, Math.PI * 2, colors.paper, 0.09, 0.7);
      lineArc(cx, cy, base * 0.66, 0, Math.PI * 2, colors.red, 0.12, 0.7);

      // A small red orbit with a bead
      const beadAngle = time * 0.42 - 1.2;
      lineArc(cx, cy, base * 0.92, -1.5, 0.9, colors.red, 0.34, 1.2);
      context.beginPath();
      context.arc(cx + Math.cos(beadAngle) * base * 0.92, cy + Math.sin(beadAngle) * base * 0.92, 2.4, 0, Math.PI * 2);
      context.fillStyle = `rgba(${colors.red}, 0.9)`;
      context.shadowColor = `rgba(${colors.red}, 0.8)`;
      context.shadowBlur = 13;
      context.fill();
      context.shadowBlur = 0;

      // Central topographical signal
      drawTerrain(cx, cy, base * 0.95, time);

      // Crosshair accents
      context.strokeStyle = "rgba(235, 231, 230,   0.17)";
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(cx - base * 0.09, cy);
      context.lineTo(cx + base * 0.09, cy);
      context.moveTo(cx, cy - base * 0.09);
      context.lineTo(cx, cy + base * 0.09);
      context.stroke();

      context.beginPath();
      context.arc(cx, cy, 1.4, 0, Math.PI * 2);
      context.fillStyle = "rgba(235, 231, 230,   0.7)";
      context.fill();

      // Corner anchor marks
      const anchorRadius = base * 1.5;
      for (let i = 0; i < 4; i += 1) {
        const angle = i * (Math.PI / 2) + Math.PI / 4;
        const ax = cx + Math.cos(angle) * anchorRadius;
        const ay = cy + Math.sin(angle) * anchorRadius;
        context.strokeStyle = "rgba(235, 231, 230,   0.15)";
        context.lineWidth = 0.7;
        context.beginPath();
        context.moveTo(ax - 4, ay);
        context.lineTo(ax + 4, ay);
        context.moveTo(ax, ay - 4);
        context.lineTo(ax, ay + 4);
        context.stroke();
      }
    }

    function animate(time) {
      const seconds = time / 1000;
      if (visible && !document.hidden && (reduceMotion ? lastFrame === 0 : seconds - lastFrame > 0.02)) {
        lastFrame = seconds;
        draw(seconds);
      }
      requestAnimationFrame(animate);
    }

    stage.addEventListener("pointermove", (event) => {
      if (!hasFinePointer) return;
      const rect = stage.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    stage.addEventListener("pointerleave", () => {
      pointer.tx = 0;
      pointer.ty = 0;
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { threshold: 0 });
      observer.observe(canvas);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener("resize", resize, { passive: true });
  }

  initSignalCanvas();

  /* -------------------------------------------------------
     Scroll-driven sections
     ------------------------------------------------------- */

  const shift = $("#intelligence");
  const shiftSticky = $("#shiftSticky");
  const shiftBg = $("#shiftBg");
  const shiftTitleNoise = $("#shiftTitleNoise");
  const shiftTitleSignal = $("#shiftTitleSignal");
  const shiftDesc = $("#shiftDesc");
  const shiftStats = $("#shiftStats");
  const shiftHint = $("#shiftHint");
  const shiftPercent = $("#shiftPercent");
  const messageStack = $("#messageStack");
  const stackAi = $("#stackAi");
  const stackCards = $$(".stack-card", messageStack || document);
  const noiseStat = $(".shift-stat--noise");
  const header = $("#siteHeader");
  const hero = $("#top");
  const meterFill = $("#meterFill");
  const meterIndex = $("#meterIndex");
  const meterLabel = $("#meterLabel");
  const scrollMeter = $("#scrollMeter");

  let shiftProgress = 0;

  const stackPositions = [
    { x: -205, y: -157, rotate: -8 },
    { x: 205, y: -168, rotate: 7 },
    { x: -216, y: 108, rotate: -5 },
    { x: 208, y: 122, rotate: 6 },
    { x: 5, y: 242, rotate: -1.5 }
  ];

  const stackPositionsMobile = [
    { x: -34, y: -76, rotate: -6 },
    { x: 40, y: -4, rotate: 5 },
    { x: -70, y: 54, rotate: -4 },
    { x: 70, y: 58, rotate: 5 },
    { x: -8, y: 76, rotate: -2 }
  ];

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    const number = parseInt(full, 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }

  function mixColor(from, to, amount) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    const result = a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount));
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  }

  function updateShift() {
    if (!shift || !shiftSticky) return;

    const rect = shift.getBoundingClientRect();
    const scrollable = Math.max(1, shift.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollable);
    shiftProgress = progress;

    const bgMix = smoothstep(0.16, 0.62, progress);
    const noiseFade = 1 - smoothstep(0.30, 0.43, progress);
    const titleMix = smoothstep(0.43, 0.54, progress);
    const fan = smoothstep(0.03, 0.55, progress);

    shiftBg.style.opacity = String(bgMix * 0.98);
    shiftSticky.style.setProperty("--shift-text", mixColor("#ebe7e6", "#231d1b", bgMix));
    shiftSticky.style.setProperty("--shift-dim", mixColor("#948f8d", "#75706e", bgMix));
    shiftSticky.style.setProperty(
      "--shift-line",
      `rgba(${Math.round(255 - 219 * bgMix)}, ${Math.round(255 - 227 * bgMix)}, ${Math.round(255 - 230 * bgMix)}, .14)`
    );

    shiftTitleNoise.style.opacity = String(noiseFade);
    shiftTitleNoise.style.transform = `translateY(${-20 * (1 - noiseFade)}px)`;
    shiftTitleSignal.style.opacity = String(titleMix);
    shiftTitleSignal.style.transform = `translateY(${20 * (1 - titleMix)}px)`;
    shiftTitleSignal.style.pointerEvents = titleMix > 0.5 ? "auto" : "none";

    shiftDesc.style.color = mixColor("#948f8d", "#6c6765", bgMix);
    if (noiseStat) noiseStat.style.opacity = String(1 - smoothstep(0.3, 0.62, progress) * 0.72);
    if (shiftHint) shiftHint.style.opacity = String(clamp(1 - progress * 7));
    if (shiftPercent) shiftPercent.textContent = String(Math.round(progress * 100)).padStart(3, "0");

    const compact = window.innerWidth <= 820;
    const narrow = window.innerWidth <= 480;
    const stageWidth = messageStack ? messageStack.clientWidth : window.innerWidth;
    const baseCardScale = compact ? (narrow ? 0.86 : 0.9) : window.innerWidth <= 1100 ? 0.86 : 1;
    const cardScale = baseCardScale * (0.94 + fan * 0.06);
    const cardWidth = compact ? 260 : window.innerWidth <= 1100 ? 250 : 336;
    const collapse = smoothstep(0.6, 0.77, progress);
    const lateral = compact
      ? clamp((stageWidth / 2 - (cardWidth * cardScale) / 2 - 12) / 40, 0.6, 2.1)
      : clamp((stageWidth / 2 - (cardWidth * cardScale) / 2 - 14) / 205, 0.5, 1.1);

    stackCards.forEach((card, index) => {
      const position = (compact ? stackPositionsMobile : stackPositions)[index] || stackPositions[0];
      const baseOffset = (index - 2) * 6;
      const baseLift = (index - 2) * 4;
      const x = baseOffset + position.x * lateral * fan;
      const y = baseLift + position.y * fan;
      const rotate = (index - 2) * 1.2 + position.rotate * fan;
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${cardScale})`;
      card.style.opacity = String((0.75 + fan * 0.25) * (1 - collapse));
    });

    if (stackAi) {
      const aiReveal = smoothstep(0.63, 0.84, progress);
      const aiScaleBase = compact ? 0.86 : window.innerWidth <= 1100 ? 0.92 : 1;
      const aiScale = aiScaleBase * (0.86 + aiReveal * 0.14);
      const aiShift = (1 - aiReveal) * 16;
      stackAi.style.opacity = String(aiReveal);
      stackAi.style.transform = `translate3d(0, ${aiShift}px, 0) scale(${aiScale})`;
      stackAi.style.pointerEvents = progress > 0.7 ? "auto" : "none";
    }

    messageStack?.classList.toggle("is-resolved", progress > 0.76);
  }

  const navSections = $$("[data-nav]");
  const meterSections = [
    { selector: "#top", index: "01", label: "SIGNAL" },
    { selector: "#intelligence", index: "02", label: "SHIFT" },
    { selector: "#product", index: "03", label: "PRODUCT" },
    { selector: "#features", index: "04", label: "SYSTEM" },
    { selector: "#manifesto", index: "05", label: "PRINCIPLE" },
    { selector: "#trust", index: "06", label: "TRUST" },
    { selector: "#access", index: "07", label: "ACCESS" }
  ];

  function updateChrome() {
    if (!header) return;
    const probe = 42;
    let theme = "dark";

    for (const section of navSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        if (section.dataset.nav === "auto") theme = shiftProgress > 0.48 ? "light" : "dark";
        else theme = section.dataset.nav || "dark";
        break;
      }
    }

    header.classList.toggle("is-light", theme === "light");
    header.classList.toggle("is-scrolled", window.scrollY > 18);
    scrollMeter?.classList.toggle("is-light", theme === "light");
    const nearBottom = window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 150;
    scrollMeter?.classList.toggle("is-hidden", nearBottom || (shiftProgress > 0.01 && shiftProgress < 0.995));

    const totalScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = clamp(window.scrollY / totalScroll);
    if (meterFill) meterFill.style.transform = `scaleX(${pageProgress})`;

    let active = meterSections[0];
    for (const item of meterSections) {
      const section = $(item.selector);
      if (!section) continue;
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45) active = item;
    }
    if (meterIndex) meterIndex.textContent = active.index;
    if (meterLabel) meterLabel.textContent = active.label;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateShift();
      updateChrome();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateShift();
    updateChrome();
  }, { passive: true });

  updateShift();
  updateChrome();

  /* -------------------------------------------------------
     Generated technical ticks
     ------------------------------------------------------- */

  function buildTicks(groupSelector, count, cx, cy, inner, outer) {
    const group = $(groupSelector);
    if (!group) return;
    const svgNamespace = "http://www.w3.org/2000/svg";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const emphasis = i % 10 === 0;
      const line = document.createElementNS(svgNamespace, "line");
      const start = emphasis ? inner - 3 : inner;
      line.setAttribute("x1", String(cx + Math.cos(angle) * start));
      line.setAttribute("y1", String(cy + Math.sin(angle) * start));
      line.setAttribute("x2", String(cx + Math.cos(angle) * (outer + (emphasis ? 3 : 0))));
      line.setAttribute("y2", String(cy + Math.sin(angle) * (outer + (emphasis ? 3 : 0))));
      line.setAttribute("stroke-width", emphasis ? "1" : "0.5");
      if (emphasis) line.setAttribute("opacity", "0.55");
      fragment.appendChild(line);
    }
    group.appendChild(fragment);
  }

  buildTicks(".speed-ticks", 72, 110, 110, 82, 88);
  buildTicks(".orbit-ticks", 120, 260, 260, 226, 234);

  /* -------------------------------------------------------
     App demo
     ------------------------------------------------------- */

  const briefs = {
    catchup: {
      kicker: "CATCH-UP / 8 MESSAGES",
      title: "Three decisions. One blocker.",
      summary: "The team is shipping the new onboarding flow behind a flag on Tuesday. The design is settled; legal copy is the only item still at risk.",
      items: [
        { tag: "DECISION", type: "", text: "Ship the new flow behind a flag Tuesday. Priya owns rollout.", source: "m3", label: "10:51" },
        { tag: "BLOCKER", type: "blocker", text: "Consent copy still needs legal sign-off by Friday.", source: "m5", label: "10:58" },
        { tag: "NEXT", type: "next", text: "Sofia is drafting it today; Dana reviews in #legal-review.", source: "m6", label: "11:02" }
      ],
      sources: ["m3", "m5", "m6"]
    },
    decisions: {
      kicker: "DECISIONS / 8 MESSAGES",
      title: "The room has decided.",
      summary: "Three calls are locked for the onboarding launch. One route question is still open for async input by end of day.",
      items: [
        { tag: "DECISION", type: "", text: "Ship onboarding behind a feature flag on Tuesday.", source: "m3", label: "10:51" },
        { tag: "DECISION", type: "", text: "Drop the progress bar and reveal the workspace progressively.", source: "m2", label: "10:46" },
        { tag: "OPEN", type: "open", text: "Invite existing teams or start with new signups only? Due EOD.", source: "m8", label: "11:06" }
      ],
      sources: ["m2", "m3", "m8"]
    },
    blockers: {
      kicker: "RISKS / 8 MESSAGES",
      title: "One thing is in the way.",
      summary: "Legal approval on consent copy is the only external dependency. Everything else can keep moving in parallel.",
      items: [
        { tag: "BLOCKER", type: "blocker", text: "Consent copy is waiting on legal approval.", source: "m5", label: "10:58" },
        { tag: "TIME", type: "blocker", text: "Needs to land by Friday to protect the Tuesday launch.", source: "m5", label: "10:58" },
        { tag: "NEXT", type: "next", text: "Dana needs to review Sofia's draft when it lands.", source: "m6", label: "11:02" }
      ],
      sources: ["m5", "m6"]
    },
    open: {
      kicker: "OPEN LOOPS / 8 MESSAGES",
      title: "Two things still need an owner.",
      summary: "The launch plan is clear, but the invite audience and the final empty-state copy are still unresolved.",
      items: [
        { tag: "OPEN", type: "open", text: "Decide whether to invite existing teams or only new signups. Due EOD.", source: "m8", label: "11:06" },
        { tag: "OPEN", type: "open", text: "Final pass on the empty-state copy before launch lock.", source: "m4", label: "10:55" },
        { tag: "NEXT", type: "next", text: "Priya is collecting async answers in #product-launch.", source: "m8", label: "11:06" }
      ],
      sources: ["m4", "m8"]
    }
  };

  const aiOutput = $("#aiOutput");
  const aiKicker = $("#aiKicker");
  const aiTitle = $("#aiTitle");
  const aiSummary = $("#aiSummary");
  const aiItems = $("#aiItems");
  const aiSources = $("#aiSources");
  const aiTime = $("#aiTime");
  const chips = $$(".ai-chip");
  const chatScroll = $(".chat-scroll");
  const copyBriefButton = $("#copyBrief");
  const askInput = $("#aiAskInput");
  const askButton = $("#aiAskButton");

  let currentBriefKey = "catchup";
  let currentBriefData = briefs.catchup;
  let updateTimer = 0;
  let copyTimer = 0;

  function renderBrief(brief, key = "") {
    if (!aiOutput || !brief) return;
    if (aiKicker) aiKicker.textContent = brief.kicker;
    if (aiTitle) aiTitle.textContent = brief.title;
    if (aiSummary) aiSummary.textContent = brief.summary;
    if (aiTime) aiTime.textContent = key === "custom" ? "JUST NOW" : "JUST NOW";
    if (aiItems) {
      aiItems.innerHTML = brief.items.map((item) => `
        <div class="ai-item">
          <span class="ai-item__tag ${item.type ? `ai-item__tag--${item.type}` : ""}">${item.tag}</span>
          <p>${item.text} <button type="button" data-source="${item.source}"><span class="sr-only">Show source message from </span>${item.label} ↗</button></p>
        </div>
      `).join("");
    }
    if (aiSources) {
      aiSources.innerHTML = (brief.sources || [])
        .map((source) => {
          const message = $(`.msg[data-id="${source}"] .msg__head time`);
          const time = message ? message.textContent.replace(" AM", "").replace(" PM", "") : "";
          return `<button class="source-pill" type="button" data-source="${source}">${source.toUpperCase()} · ${time}</button>`;
        })
        .join("");
    }
  }

  function setBrief(key) {
    const brief = briefs[key];
    if (!brief || !aiOutput) return;
    currentBriefKey = key;
    currentBriefData = brief;
    chips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.prompt === key));
    aiOutput.classList.add("is-loading");
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(() => {
      renderBrief(brief, key);
      aiOutput.classList.remove("is-loading");
    }, reduceMotion ? 80 : 520);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => setBrief(chip.dataset.prompt));
  });

  function flashMessage(id) {
    const message = $(`.msg[data-id="${id}"]`);
    if (!message || !chatScroll) return;
    const target = Math.max(0, message.offsetTop - chatScroll.clientHeight * 0.35);
    chatScroll.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    message.classList.remove("is-flash");
    void message.offsetWidth;
    message.classList.add("is-flash");
    window.setTimeout(() => message.classList.remove("is-flash"), 1900);
  }

  aiOutput?.addEventListener("click", (event) => {
    const source = event.target.closest("[data-source]");
    if (!source) return;
    flashMessage(source.dataset.source);
  });

  copyBriefButton?.addEventListener("click", async () => {
    const brief = currentBriefData || briefs.catchup;
    const text = `${brief.title}\n\n${brief.summary}\n\n${brief.items.map((item) => `${item.tag}: ${item.text}`).join("\n")}\n\nGenerated by Insight from #product-launch.`;
    try {
      await navigator.clipboard.writeText(text);
      copyBriefButton.innerHTML = "<span>Copied</span> ✓";
    } catch {
      copyBriefButton.innerHTML = "<span>Select to copy</span> ⧉";
    }
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyBriefButton.innerHTML = "<span>Copy brief</span> ⧉";
    }, 1800);
  });

  const answerTemplates = {
    legal: {
      kicker: "QUERY / 8 MESSAGES",
      title: "Legal is the only gating item.",
      summary: "The consent copy is the one launch dependency still in motion. Liam flagged it at 10:58; Sofia owns the draft, and Dana needs to review before Friday.",
      items: [
        { tag: "BLOCKER", type: "blocker", text: "Legal approval on the new consent copy is still pending.", source: "m5", label: "10:58" },
        { tag: "OWNER", type: "next", text: "Sofia is drafting it today in #legal-review.", source: "m6", label: "11:02" }
      ],
      sources: ["m5", "m6"]
    },
    date: {
      kicker: "QUERY / 8 MESSAGES",
      title: "Tuesday, behind a flag.",
      summary: "Priya set the launch for Tuesday and owns rollout. The team is protecting the date by keeping the flow behind a feature flag while legal copy is finalised.",
      items: [
        { tag: "DECISION", type: "", text: "Launch the onboarding flow on Tuesday behind a flag.", source: "m3", label: "10:51" },
        { tag: "CONDITION", type: "blocker", text: "Legal consent copy must land by Friday.", source: "m5", label: "10:58" }
      ],
      sources: ["m3", "m5"]
    },
    owner: {
      kicker: "QUERY / 8 MESSAGES",
      title: "Four owners, one open question.",
      summary: "Priya owns launch rollout, Jon owns the progressive reveal, Sofia owns the legal copy, and Dana is the reviewer. The invite audience still needs an owner.",
      items: [
        { tag: "OWNER", type: "", text: "Priya Nair — launch rollout and fallback plan.", source: "m3", label: "10:51" },
        { tag: "OWNER", type: "next", text: "Sofia Reyes — consent copy, with Dana reviewing.", source: "m6", label: "11:02" },
        { tag: "OPEN", type: "open", text: "Invite audience decision is still unassigned.", source: "m8", label: "11:06" }
      ],
      sources: ["m3", "m6", "m8"]
    }
  };

  function answerQuery(query) {
    const normalized = query.toLowerCase();
    let template = briefs.catchup;
    if (/legal|consent|compliance|copy/.test(normalized)) template = answerTemplates.legal;
    else if (/when|date|launch|tuesday|time/.test(normalized)) template = answerTemplates.date;
    else if (/who|owner|own|responsible/.test(normalized)) template = answerTemplates.owner;

    if (aiOutput) {
      aiOutput.classList.add("is-loading");
      chips.forEach((chip) => chip.classList.remove("is-active"));
      window.clearTimeout(updateTimer);
      updateTimer = window.setTimeout(() => {
        const customBrief = {
          ...template,
          summary: template === briefs.catchup
            ? `You asked “${query}”. The strongest signal in #product-launch is the Tuesday launch, gated by legal approval of the consent copy.`
            : template.summary
        };
        currentBriefData = customBrief;
        currentBriefKey = "custom";
        renderBrief(customBrief, "custom");
        aiOutput.classList.remove("is-loading");
      }, reduceMotion ? 80 : 700);
    }
  }

  function submitAsk() {
    if (!askInput) return;
    const query = askInput.value.trim();
    if (!query) {
      askInput.focus();
      return;
    }
    answerQuery(query);
    askInput.value = "";
  }

  askButton?.addEventListener("click", submitAsk);
  askInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitAsk();
    }
  });

  renderBrief(briefs.catchup);

  /* -------------------------------------------------------
     Access form
     ------------------------------------------------------- */

  const accessForm = $("#accessForm");
  const emailInput = $("#email");
  const formError = $("#formError");
  const accessSuccess = $("#accessSuccess");
  const successEmail = $("#successEmail");

  function showFormError(message) {
    if (!accessForm || !formError) return;
    accessForm.classList.add("has-error");
    formError.textContent = message;
    emailInput?.setAttribute("aria-invalid", "true");
  }

  function clearFormError() {
    if (!accessForm || !formError) return;
    accessForm.classList.remove("has-error");
    formError.textContent = "";
    emailInput?.removeAttribute("aria-invalid");
  }

  emailInput?.addEventListener("input", clearFormError);

  accessForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim() || "";
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!valid) {
      showFormError("Please enter a valid work email.");
      emailInput?.focus();
      return;
    }

    clearFormError();
    if (successEmail) successEmail.textContent = email;
    if (accessSuccess) {
      accessSuccess.classList.add("is-visible");
      accessSuccess.setAttribute("aria-hidden", "false");
    }
    if (accessForm) accessForm.style.display = "none";
    const meta = $(".access__meta");
    if (meta) meta.style.marginTop = "25px";
  });

  /* -------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------- */

  function initReveals() {
    if (reduceMotion) return;
    const targets = [
      $(".section-head > div"),
      $(".section-head__aside"),
      $(".app-window"),
      $(".features__top"),
      ...$$(".bento-card"),
      $(".manifesto blockquote"),
      $(".manifesto__foot"),
      $(".trust__visual"),
      $(".trust__copy"),
      $(".access-content"),
      $(".footer__top")
    ].filter(Boolean);

    targets.forEach((element, index) => {
      element.classList.add("fade-up");
      element.style.transitionDelay = `${Math.min((index % 4) * 65, 195)}ms`;
    });

    document.body.classList.add("animations-ready");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-inview"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    targets.forEach((element) => observer.observe(element));
  }

  initReveals();

  /* -------------------------------------------------------
     Anchor offset and final chrome sync
     ------------------------------------------------------- */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = $(hash);
      if (!target) return;
      event.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", hash);
    });
  });

  setTimeout(() => {
    updateShift();
    updateChrome();
  }, 120);
})();
