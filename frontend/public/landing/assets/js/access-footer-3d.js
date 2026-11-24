// Ported dual-stage Three.js engine (verbatim, IDs match ported markup).
    const orbStage = document.getElementById('orb-stage');
    const orbCanvas = document.getElementById('signal-orb-canvas');
    const accessSection = document.getElementById('access-section');
    const telemetryLabel = document.getElementById('orb-telemetry-label');

    const siteFooter = document.getElementById('site-footer');
    const wordmarkStage = document.getElementById('footer-wordmark-stage');
    const wordmarkCanvas = document.getElementById('footer-wordmark-canvas');

    async function loadThreeModule() {
      try {
        return await import('three');
      } catch (primaryErr) {
        return await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
      }
    }

    async function initThreeScenes() {
      let THREE;
      try {
        THREE = await loadThreeModule();
      } catch (err) {
        if (telemetryLabel) {
          telemetryLabel.textContent = 'SVG Fallback · Offline Mode';
        }
        return;
      }

      /* Spec-compliant Timer (THREE.Timer connected to document) */
      class FallbackDocumentTimer {
        constructor() {
          this._prev = performance.now();
          this._elapsed = 0;
          this._delta = 0;
          this._hidden = false;
          this._onVisChange = () => {
            this._hidden = document.hidden;
            if (!this._hidden) {
              this._prev = performance.now();
            }
          };
        }
        connect(doc) {
          if (doc && doc.addEventListener) {
            doc.addEventListener('visibilitychange', this._onVisChange);
          }
        }
        update(timestamp) {
          const now = typeof timestamp === 'number' ? timestamp : performance.now();
          if (this._hidden) {
            this._delta = 0;
            return;
          }
          this._delta = Math.min((now - this._prev) / 1000, 0.1);
          this._prev = now;
          this._elapsed += this._delta;
        }
        getDelta() {
          return this._delta;
        }
        getElapsed() {
          return this._elapsed;
        }
      }

      const timer = typeof THREE.Timer === 'function'
        ? new THREE.Timer()
        : new FallbackDocumentTimer();

      if (typeof timer.connect === 'function') {
        timer.connect(document);
      }

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const finePointerQuery = window.matchMedia('(pointer: fine)');
      let prefersReducedMotion = reducedMotionQuery.matches;
      let hasFinePointer = finePointerQuery.matches;

      /* ======================================================================
         STAGE A: ACCESS SECTION — CALIBRATED ARMILLARY SIGNAL ORB
         ====================================================================== */
      let orbRenderer;
      try {
        orbRenderer = new THREE.WebGLRenderer({
          canvas: orbCanvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (webglErr) {
        if (telemetryLabel) {
          telemetryLabel.textContent = 'SVG Fallback · WebGL Unavailable';
        }
        return;
      }

      orbRenderer.setClearColor(0x000000, 0);
      orbRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const orbScene = new THREE.Scene();
      const orbCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      orbCamera.position.set(0, 1.05, 7.0);
      orbCamera.lookAt(0, 0, 0);

      const BASE_PITCH = 0.10;
      const orbRoot = new THREE.Group();
      orbRoot.rotation.x = BASE_PITCH;
      orbRoot.rotation.y = 0;
      orbScene.add(orbRoot);

      const breathingGroup = new THREE.Group();
      orbRoot.add(breathingGroup);

      function createVernierTicks(radius, tickCount, majorEvery, minorLen, majorLen, colorHex, opacity) {
        const positions = [];
        for (let i = 0; i < tickCount; i++) {
          const angle = (i / tickCount) * Math.PI * 2;
          const isMajor = i % majorEvery === 0;
          const len = isMajor ? majorLen : minorLen;
          const rInner = radius - len * 0.5;
          const rOuter = radius + len * 0.5;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          positions.push(cos * rInner, sin * rInner, 0);
          positions.push(cos * rOuter, sin * rOuter, 0);
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity,
          depthWrite: false
        });
        return new THREE.LineSegments(geom, mat);
      }

      function createSegmentedCircle(radius, segments, dashRatio, colorHex, opacity) {
        const positions = [];
        for (let i = 0; i < segments; i++) {
          const a0 = (i / segments) * Math.PI * 2;
          const a1 = ((i + dashRatio) / segments) * Math.PI * 2;
          positions.push(Math.cos(a0) * radius, Math.sin(a0) * radius, 0);
          positions.push(Math.cos(a1) * radius, Math.sin(a1) * radius, 0);
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity,
          depthWrite: false
        });
        return new THREE.LineSegments(geom, mat);
      }

      function createGimbalPins(innerRadius, outerRadius, colorHex, opacity) {
        const positions = [
          innerRadius, 0, 0, outerRadius, 0, 0,
          -innerRadius, 0, 0, -outerRadius, 0, 0,
          0, innerRadius, 0, 0, outerRadius, 0,
          0, -innerRadius, 0, 0, -outerRadius, 0
        ];
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity,
          depthWrite: false
        });
        return new THREE.LineSegments(geom, mat);
      }

      const armillaryGroup = new THREE.Group();
      breathingGroup.add(armillaryGroup);

      const armillaryRingSpecs = [
        {
          radius: 2.0,
          tube: 0.015,
          color: 0xebe8e4,
          opacity: 0.45,
          azimuthY: (120 * Math.PI) / 180,
          tiltX: 1.05,
          periodSec: 90,
          phase: 0.35,
          direction: 1,
          ticks: 72,
          majorEvery: 6,
          companionRadius: 2.065,
          companionOpacity: 0.18
        },
        {
          radius: 1.7,
          tube: 0.015,
          color: 0xebe8e4,
          opacity: 0.50,
          azimuthY: (-120 * Math.PI) / 180,
          tiltX: 1.05,
          periodSec: 75,
          phase: 2.15,
          direction: -1,
          ticks: 60,
          majorEvery: 5,
          companionRadius: 1.64,
          companionOpacity: 0.20
        },
        {
          radius: 1.45,
          tube: 0.018,
          color: 0xb06059,
          opacity: 0.95,
          azimuthY: 0,
          tiltX: 1.05,
          periodSec: 105,
          phase: 4.10,
          direction: 1,
          ticks: 48,
          majorEvery: 4,
          companionRadius: 1.39,
          companionOpacity: 0.38
        }
      ];

      const armillaryRings = armillaryRingSpecs.map((spec, idx) => {
        const azimuthGroup = new THREE.Group();
        azimuthGroup.rotation.y = spec.azimuthY;

        const tiltGroup = new THREE.Group();
        tiltGroup.rotation.x = spec.tiltX;
        azimuthGroup.add(tiltGroup);

        const spinGroup = new THREE.Group();
        spinGroup.rotation.z = spec.phase;
        tiltGroup.add(spinGroup);

        const torusGeom = new THREE.TorusGeometry(spec.radius, spec.tube, 28, 256);
        const torusMat = new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: spec.opacity,
          depthWrite: false
        });
        spinGroup.add(new THREE.Mesh(torusGeom, torusMat));

        const tickColor = idx === 2 ? 0xb06059 : 0xebe8e4;
        const tickOpacity = idx === 2 ? 0.52 : 0.28;
        spinGroup.add(
          createVernierTicks(spec.radius, spec.ticks, spec.majorEvery, 0.045, 0.095, tickColor, tickOpacity)
        );
        spinGroup.add(
          createSegmentedCircle(spec.companionRadius, idx === 2 ? 48 : 64, 0.55, tickColor, spec.companionOpacity)
        );
        spinGroup.add(
          createGimbalPins(spec.radius - 0.11, spec.radius + 0.08, tickColor, idx === 2 ? 0.65 : 0.32)
        );

        armillaryGroup.add(azimuthGroup);
        return { spec, azimuthGroup, tiltGroup, spinGroup };
      });

      /* Harmonic Ember Signal Wave on the Inner Ring */
      const wavePointsCount = 180;
      const wavePositions = new Float32Array(wavePointsCount * 3);
      const waveGeometry = new THREE.BufferGeometry();
      waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
      const waveMaterial = new THREE.LineBasicMaterial({
        color: 0xb06059,
        transparent: true,
        opacity: 0.78,
        depthWrite: false
      });
      const emberWaveLine = new THREE.LineLoop(waveGeometry, waveMaterial);
      armillaryRings[2].spinGroup.add(emberWaveLine);

      function updateEmberWave(elapsed, impulse, locked) {
        const posAttr = waveGeometry.getAttribute('position');
        const arr = posAttr.array;
        const baseR = 1.32;
        const amp = locked ? 0.012 : (0.028 + impulse * 0.055);
        for (let i = 0; i < wavePointsCount; i++) {
          const theta = (i / wavePointsCount) * Math.PI * 2;
          const envelope = Math.pow(Math.sin(theta * 2 - elapsed * 1.4), 2);
          const harmonic = Math.sin(theta * 18 + elapsed * 6.0) * amp * envelope;
          const r = baseR + harmonic;
          arr[i * 3] = Math.cos(theta) * r;
          arr[i * 3 + 1] = Math.sin(theta) * r;
          arr[i * 3 + 2] = Math.cos(theta * 6 - elapsed * 2.5) * (amp * 0.7);
        }
        posAttr.needsUpdate = true;
      }

      /* Geodesic Core + Counter-Rotating Plumb Bob */
      const armillaryCore = new THREE.Group();
      armillaryGroup.add(armillaryCore);

      armillaryCore.add(
        new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.85, 2),
          new THREE.MeshBasicMaterial({
            color: 0x241c19,
            transparent: true,
            opacity: 0.07,
            depthWrite: false
          })
        )
      );

      armillaryCore.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.85, 1)),
          new THREE.LineBasicMaterial({
            color: 0xebe8e4,
            transparent: true,
            opacity: 0.34,
            depthWrite: false
          })
        )
      );

      const plumbGroup = new THREE.Group();
      armillaryCore.add(plumbGroup);

      const octaGeom = new THREE.OctahedronGeometry(0.46, 0);
      octaGeom.scale(0.72, 1.32, 0.72);
      plumbGroup.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(octaGeom),
          new THREE.LineBasicMaterial({
            color: 0xb06059,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
          })
        )
      );

      const spindlePositions = new Float32Array([
        0, -1.38, 0,  0, 1.38, 0,
        -0.08, 1.18, 0,  0.08, 1.18, 0,
        -0.08, -1.18, 0, 0.08, -1.18, 0
      ]);
      const spindleGeom = new THREE.BufferGeometry();
      spindleGeom.setAttribute('position', new THREE.BufferAttribute(spindlePositions, 3));
      armillaryCore.add(
        new THREE.LineSegments(
          spindleGeom,
          new THREE.LineBasicMaterial({
            color: 0xebe8e4,
            transparent: true,
            opacity: 0.32,
            depthWrite: false
          })
        )
      );

      /* ======================================================================
         STAGE B: FOOTER 3D EXTRUDED ARCHITECTURAL WORDMARK ("INSIGHT")
         Procedural 3D bevel-extruded typography with wireframe CAD edges,
         internal ember datum slice, and per-letter magnetic hover wave
         ====================================================================== */
      let wordmarkRenderer = null;
      let wordmarkScene = null;
      let wordmarkCamera = null;
      let wordmarkRoot = null;
      const letterAssemblies = [];

      /* Helper: convert a smooth 2D centerline polyline into a closed ribbon THREE.Shape */
      function createRibbonShapeFromCenterline(pts, halfWidth) {
        const leftPts = [];
        const rightPts = [];
        const n = pts.length;
        for (let i = 0; i < n; i++) {
          const pPrev = pts[Math.max(0, i - 1)];
          const pNext = pts[Math.min(n - 1, i + 1)];
          let dx = pNext[0] - pPrev[0];
          let dy = pNext[1] - pPrev[1];
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          const nx = -dy;
          const ny = dx;
          leftPts.push(new THREE.Vector2(pts[i][0] + nx * halfWidth, pts[i][1] + ny * halfWidth));
          rightPts.push(new THREE.Vector2(pts[i][0] - nx * halfWidth, pts[i][1] - ny * halfWidth));
        }

        const shape = new THREE.Shape();
        shape.moveTo(leftPts[0].x, leftPts[0].y);
        for (let i = 1; i < n; i++) {
          shape.lineTo(leftPts[i].x, leftPts[i].y);
        }
        for (let i = n - 1; i >= 0; i--) {
          shape.lineTo(rightPts[i].x, rightPts[i].y);
        }
        shape.closePath();
        return shape;
      }

      /* Build exact closed THREE.Shape for each letter in I-N-S-I-G-H-T */
      function buildInsightGlyphShapes() {
        const H = 1.18; /* Half-height: y in [-1.18, +1.18] */

        /* 1. Letter 'I' */
        function makeI() {
          const w = 0.22;
          const s = new THREE.Shape();
          s.moveTo(-w, -H);
          s.lineTo(w, -H);
          s.lineTo(w, H);
          s.lineTo(-w, H);
          s.closePath();
          return { shape: s, width: 0.56 };
        }

        /* 2. Letter 'N' */
        function makeN() {
          const w = 0.84;
          const t = 0.42;
          const s = new THREE.Shape();
          s.moveTo(-w, -H);
          s.lineTo(-w, H);
          s.lineTo(-w + t, H);
          s.lineTo(w - t, -H + 0.72);
          s.lineTo(w - t, H);
          s.lineTo(w, H);
          s.lineTo(w, -H);
          s.lineTo(w - t, -H);
          s.lineTo(-w + t, H - 0.72);
          s.lineTo(-w + t, -H);
          s.closePath();
          return { shape: s, width: 1.78 };
        }

        /* 3. Letter 'S' (smooth cubic bezier spine thickened into a closed ribbon) */
        function makeS() {
          const curve1 = new THREE.CubicBezierCurve(
            new THREE.Vector2(0.62, 0.74),
            new THREE.Vector2(0.56, 1.15),
            new THREE.Vector2(-0.66, 1.15),
            new THREE.Vector2(-0.62, 0.46)
          );
          const curve2 = new THREE.CubicBezierCurve(
            new THREE.Vector2(-0.62, 0.46),
            new THREE.Vector2(-0.58, -0.02),
            new THREE.Vector2(0.64, 0.04),
            new THREE.Vector2(0.64, -0.50)
          );
          const curve3 = new THREE.CubicBezierCurve(
            new THREE.Vector2(0.64, -0.50),
            new THREE.Vector2(0.64, -1.14),
            new THREE.Vector2(-0.58, -1.14),
            new THREE.Vector2(-0.68, -0.68)
          );

          const pts = [];
          const p1 = curve1.getPoints(28);
          const p2 = curve2.getPoints(28).slice(1);
          const p3 = curve3.getPoints(28).slice(1);
          for (const p of [...p1, ...p2, ...p3]) {
            pts.push([p.x, p.y]);
          }
          const s = createRibbonShapeFromCenterline(pts, 0.205);
          return { shape: s, width: 1.74 };
        }

        /* 5. Letter 'G' (single continuous closed polygon with outer/inner C-arc + crossbar) */
        function makeG() {
          const rxOut = 0.88;
          const ryOut = 1.18;
          const rxIn = 0.46;
          const ryIn = 0.78;
          const startDeg = 42;
          const endDeg = 358;
          const steps = 64;

          const s = new THREE.Shape();
          /* Outer arc counterclockwise from 42° to 358° */
          for (let i = 0; i <= steps; i++) {
            const deg = startDeg + ((endDeg - startDeg) * i) / steps;
            const rad = (deg * Math.PI) / 180;
            const x = Math.cos(rad) * rxOut;
            const y = Math.sin(rad) * ryOut;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
          }
          /* Horizontal crossbar inward */
          s.lineTo(0.05, -0.04);
          s.lineTo(0.05, -0.40);
          const innerStartDeg = 330;
          s.lineTo(Math.cos((innerStartDeg * Math.PI) / 180) * rxIn, Math.sin((innerStartDeg * Math.PI) / 180) * ryIn);

          /* Inner arc clockwise from 330° back to 42° */
          for (let i = 1; i <= steps; i++) {
            const deg = innerStartDeg - ((innerStartDeg - startDeg) * i) / steps;
            const rad = (deg * Math.PI) / 180;
            s.lineTo(Math.cos(rad) * rxIn, Math.sin(rad) * ryIn);
          }
          s.closePath();
          return { shape: s, width: 1.84 };
        }

        /* 6. Letter 'H' */
        function makeH() {
          const w = 0.82;
          const t = 0.42;
          const bar = 0.19;
          const s = new THREE.Shape();
          s.moveTo(-w, -H);
          s.lineTo(-w, H);
          s.lineTo(-w + t, H);
          s.lineTo(-w + t, bar);
          s.lineTo(w - t, bar);
          s.lineTo(w - t, H);
          s.lineTo(w, H);
          s.lineTo(w, -H);
          s.lineTo(w - t, -H);
          s.lineTo(w - t, -bar);
          s.lineTo(-w + t, -bar);
          s.lineTo(-w + t, -H);
          s.closePath();
          return { shape: s, width: 1.74 };
        }

        /* 7. Letter 'T' */
        function makeT() {
          const w = 0.84;
          const stem = 0.21;
          const topBarH = 0.40;
          const s = new THREE.Shape();
          s.moveTo(-w, H - topBarH);
          s.lineTo(-w, H);
          s.lineTo(w, H);
          s.lineTo(w, H - topBarH);
          s.lineTo(stem, H - topBarH);
          s.lineTo(stem, -H);
          s.lineTo(-stem, -H);
          s.lineTo(-stem, H - topBarH);
          s.closePath();
          return { shape: s, width: 1.72 };
        }

        return [
          { char: 'I', ...makeI() },
          { char: 'N', ...makeN() },
          { char: 'S', ...makeS() },
          { char: 'I', ...makeI() },
          { char: 'G', ...makeG() },
          { char: 'H', ...makeH() },
          { char: 'T', ...makeT() }
        ];
      }

      if (wordmarkCanvas && wordmarkStage) {
        try {
          wordmarkRenderer = new THREE.WebGLRenderer({
            canvas: wordmarkCanvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
          });
          wordmarkRenderer.setClearColor(0x000000, 0);
          wordmarkRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

          wordmarkScene = new THREE.Scene();
          wordmarkCamera = new THREE.PerspectiveCamera(30, 4, 0.1, 100);
          /* Camera straight-on (0, 0, Z) so the 3D text stays completely flat at rest */
          wordmarkCamera.position.set(0, 0, 7.6);
          wordmarkCamera.lookAt(0, 0, 0);

          wordmarkRoot = new THREE.Group();
          wordmarkRoot.rotation.set(0, 0, 0);
          wordmarkScene.add(wordmarkRoot);

          const glyphs = buildInsightGlyphShapes();
          const kerning = 0.24;
          const totalWidth = glyphs.reduce((acc, g) => acc + g.width, 0) + kerning * (glyphs.length - 1);
          let cursorX = -totalWidth / 2;

          /* Face & side materials matching the dark walnut / raised ink palette (no orange lines) */
          const frontFaceMat = new THREE.MeshBasicMaterial({
            color: 0x241c19,
            transparent: true,
            opacity: 0.95
          });
          const sideExtrudeMat = new THREE.MeshBasicMaterial({
            color: 0x38302e,
            transparent: true,
            opacity: 0.85
          });

          const extrudeSettings = {
            depth: 0.58,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.028,
            bevelSegments: 2,
            curveSegments: 24
          };

          glyphs.forEach((glyph, idx) => {
            const centerX = cursorX + glyph.width / 2;
            cursorX += glyph.width + kerning;

            const letterPivot = new THREE.Group();
            letterPivot.position.set(centerX, 0, 0);

            const geom = new THREE.ExtrudeGeometry(glyph.shape, extrudeSettings);
            /* Center geometry on Z so rotation happens around its mid-plane */
            geom.translate(0, 0, -extrudeSettings.depth * 0.5);

            /* 1. 3D Extruded Solid Architectural Block */
            const solidMesh = new THREE.Mesh(geom, [frontFaceMat, sideExtrudeMat]);
            letterPivot.add(solidMesh);

            /* 2. Crisp CAD Structural Wireframe Edges (#ebe8e4) */
            const edgeGeom = new THREE.EdgesGeometry(geom, 18);
            const edgeMat = new THREE.LineBasicMaterial({
              color: 0xebe8e4,
              transparent: true,
              opacity: 0.42
            });
            const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
            letterPivot.add(edgeLines);

            wordmarkRoot.add(letterPivot);

            letterAssemblies.push({
              index: idx,
              baseX: centerX,
              pivot: letterPivot,
              edgeMat,
              hoverIntensity: 0,
              clickImpulse: 0
            });
          });
        } catch (wordmarkErr) {
          wordmarkRenderer = null;
        }
      }

      /* ----------------------------------------------------------------------
         Sizing & DPR Management for Both Canvases
         ---------------------------------------------------------------------- */
      function resizeAllCanvases() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        /* Stage A: Access Orb */
        const orbRect = orbCanvas.getBoundingClientRect();
        const orbW = Math.max(240, Math.round(orbRect.width || 540));
        const orbH = Math.max(240, Math.round(orbRect.height || 540));
        orbRenderer.setPixelRatio(dpr);
        orbRenderer.setSize(orbW, orbH, false);
        orbCamera.aspect = orbW / orbH;
        orbCamera.updateProjectionMatrix();

        /* Stage B: Footer 3D Wordmark */
        if (wordmarkRenderer && wordmarkCanvas) {
          const wmRect = wordmarkStage.getBoundingClientRect();
          const wmW = Math.max(300, Math.round(wmRect.width || 1100));
          const wmH = Math.max(120, Math.round(wmRect.height || 220));
          wordmarkRenderer.setPixelRatio(dpr);
          wordmarkRenderer.setSize(wmW, wmH, false);
          wordmarkCamera.aspect = wmW / wmH;

          /* Adapt camera Z distance so all 7 3D letters fit cleanly on any screen width */
          const targetSpanWidth = 12.6;
          const vFovRad = (wordmarkCamera.fov * Math.PI) / 180;
          const visibleHeightAtUnitZ = 2 * Math.tan(vFovRad / 2);
          const requiredZ = targetSpanWidth / (visibleHeightAtUnitZ * wordmarkCamera.aspect);
          wordmarkCamera.position.z = Math.max(5.2, Math.min(18.5, requiredZ));
          wordmarkCamera.updateProjectionMatrix();
        }
      }

      resizeAllCanvases();
      window.addEventListener('resize', resizeAllCanvases, { passive: true });

      /* ----------------------------------------------------------------------
         Mouse Parallax & Per-Letter 3D Hover Interaction
         ---------------------------------------------------------------------- */
      let targetYaw = 0;
      let targetPitch = BASE_PITCH;

      accessSection.addEventListener('pointermove', (e) => {
        if (prefersReducedMotion || !hasFinePointer || e.pointerType === 'touch') {
          return;
        }
        const rect = accessSection.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        targetYaw = THREE.MathUtils.clamp(nx, -1, 1) * 0.20;
        targetPitch = BASE_PITCH + THREE.MathUtils.clamp(ny, -1, 1) * 0.14;
      }, { passive: true });

      accessSection.addEventListener('pointerleave', () => {
        targetYaw = 0;
        targetPitch = BASE_PITCH;
      }, { passive: true });

      /* Footer 3D Wordmark Pointer Tracking */
      let wmPointerActive = false;
      let wmNormX = 0;
      let wmNormY = 0;

      if (siteFooter && wordmarkStage) {
        siteFooter.addEventListener('pointermove', (e) => {
          if (prefersReducedMotion || e.pointerType === 'touch') return;
          const rect = wordmarkStage.getBoundingClientRect();
          wmNormX = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);
          wmNormY = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);
          wmPointerActive = true;
        }, { passive: true });

        siteFooter.addEventListener('pointerleave', () => {
          wmPointerActive = false;
        }, { passive: true });

        /* Clicking the 3D wordmark sends a mechanical wave impulse across I-N-S-I-G-H-T */
        wordmarkStage.addEventListener('click', () => {
          if (prefersReducedMotion) return;
          letterAssemblies.forEach((item, i) => {
            setTimeout(() => {
              item.clickImpulse = 1.0;
            }, i * 55);
          });
        });
      }

      /* ----------------------------------------------------------------------
         IntersectionObserver (threshold 0.02) for Section Visibility
         ---------------------------------------------------------------------- */
      let isAccessVisible = true;
      let isFooterVisible = true;

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.target === accessSection) {
                isAccessVisible = entry.isIntersecting && entry.intersectionRatio >= 0.02;
              } else if (entry.target === siteFooter) {
                isFooterVisible = entry.isIntersecting && entry.intersectionRatio >= 0.02;
              }
            }
          },
          { threshold: [0, 0.02, 0.1] }
        );
        observer.observe(accessSection);
        if (siteFooter) observer.observe(siteFooter);
      }

      /* ----------------------------------------------------------------------
         First Frame Ready Flags
         ---------------------------------------------------------------------- */
      let firstOrbFrame = false;
      let firstWordmarkFrame = false;

      function markOrbReady() {
        if (!firstOrbFrame) {
          firstOrbFrame = true;
          window.__signalOrbWebGLReady = true;
          if (!orbStage.classList.contains('force-svg-fallback')) {
            orbStage.classList.add('webgl-ready');
          }
        }
      }

      function markWordmarkReady() {
        if (!firstWordmarkFrame && wordmarkStage) {
          firstWordmarkFrame = true;
          window.__footerWordmarkWebGLReady = true;
          if (!orbStage.classList.contains('force-svg-fallback')) {
            wordmarkStage.classList.add('webgl-wordmark-ready');
          }
        }
      }

      function renderStaticFrames() {
        updateEmberWave(0, 0, false);
        orbRoot.rotation.x = BASE_PITCH;
        orbRoot.rotation.y = 0;
        orbRenderer.render(orbScene, orbCamera);
        markOrbReady();

        if (wordmarkRenderer && wordmarkScene && wordmarkCamera) {
          wordmarkRoot.rotation.set(0, 0, 0);
          wordmarkRenderer.render(wordmarkScene, wordmarkCamera);
          markWordmarkReady();
        }
      }

      if (prefersReducedMotion) {
        renderStaticFrames();
      }

      reducedMotionQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
        if (prefersReducedMotion) {
          orbRenderer.setAnimationLoop(null);
          renderStaticFrames();
        } else {
          orbRenderer.setAnimationLoop(animate);
        }
      });

      finePointerQuery.addEventListener('change', (e) => {
        hasFinePointer = e.matches;
        if (!hasFinePointer) {
          targetYaw = 0;
          targetPitch = BASE_PITCH;
          wmPointerActive = false;
        }
      });

      /* ----------------------------------------------------------------------
         Unified Animation Loop via renderer.setAnimationLoop + THREE.Timer
         ---------------------------------------------------------------------- */
      function animate(timestamp) {
        if (prefersReducedMotion || document.hidden) {
          return;
        }

        timer.update(timestamp);
        const delta = Math.min(timer.getDelta(), 0.1);
        const elapsed = timer.getElapsed();

        /* 1. Render Stage A (Calibrated Armillary Orb) when visible */
        if (isAccessVisible) {
          const bridge = window.__insightOrbBridge || { focused: false, impulse: 0, locked: false };
          bridge.impulse = THREE.MathUtils.damp(bridge.impulse || 0, 0, 3.2, delta);
          const focusTighten = bridge.focused ? 0.92 : 1.0;

          for (const entry of armillaryRings) {
            const angularSpeed = (2 * Math.PI) / entry.spec.periodSec;
            const speedBoost = 1 + bridge.impulse * 2.4;
            entry.spinGroup.rotation.z += delta * angularSpeed * entry.spec.direction * speedBoost;

            const desiredTilt = entry.spec.tiltX * focusTighten + Math.sin(elapsed * angularSpeed * 2 + entry.spec.phase) * 0.035;
            entry.tiltGroup.rotation.x = THREE.MathUtils.damp(entry.tiltGroup.rotation.x, desiredTilt, 4, delta);
          }

          updateEmberWave(elapsed, bridge.impulse, bridge.locked);

          armillaryCore.rotation.y = elapsed * ((2 * Math.PI) / 84);
          armillaryCore.rotation.x = Math.sin(elapsed * 0.35) * 0.06;
          plumbGroup.rotation.y = -elapsed * ((2 * Math.PI) / 42);
          breathingGroup.position.y = Math.sin(elapsed * 0.75) * 0.04;

          orbRoot.rotation.y = THREE.MathUtils.damp(orbRoot.rotation.y, targetYaw, 4, delta);
          orbRoot.rotation.x = THREE.MathUtils.damp(orbRoot.rotation.x, targetPitch, 4, delta);

          orbRenderer.render(orbScene, orbCamera);
          markOrbReady();
        }

        /* 2. Render Stage B (Footer 3D Extruded "INSIGHT" Wordmark) when visible */
        if (isFooterVisible && wordmarkRenderer && wordmarkScene && wordmarkCamera) {
          /* Stay completely flat (0, 0) at rest; tilt in 3D only when pointer interacts */
          const desiredWmYaw = wmPointerActive ? wmNormX * 0.18 : 0;
          const desiredWmPitch = wmPointerActive ? wmNormY * 0.16 : 0;

          wordmarkRoot.rotation.y = THREE.MathUtils.damp(wordmarkRoot.rotation.y, desiredWmYaw, 5.0, delta);
          wordmarkRoot.rotation.x = THREE.MathUtils.damp(wordmarkRoot.rotation.x, desiredWmPitch, 5.0, delta);

          /* Per-letter 3D elevation & rotation only on hover/click; flat (0,0,0) at rest */
          const pointerWorldX = wmNormX * 5.6;
          for (const item of letterAssemblies) {
            item.clickImpulse = THREE.MathUtils.damp(item.clickImpulse, 0, 5.0, delta);

            const dist = Math.abs(item.baseX - pointerWorldX);
            const proximity = wmPointerActive ? Math.max(0, 1 - dist / 2.2) : 0;
            item.hoverIntensity = THREE.MathUtils.damp(item.hoverIntensity, proximity, 6.0, delta);

            const targetZ = item.hoverIntensity * 0.45 + item.clickImpulse * 0.55;
            const targetY = item.hoverIntensity * 0.08 + item.clickImpulse * 0.12;
            const targetRotY = (item.hoverIntensity * 0.26 * (pointerWorldX > item.baseX ? 1 : -1)) + item.clickImpulse * 0.35;
            const targetRotX = -item.hoverIntensity * 0.18;

            item.pivot.position.z = THREE.MathUtils.damp(item.pivot.position.z, targetZ, 6.0, delta);
            item.pivot.position.y = THREE.MathUtils.damp(item.pivot.position.y, targetY, 6.0, delta);
            item.pivot.rotation.y = THREE.MathUtils.damp(item.pivot.rotation.y, targetRotY, 6.0, delta);
            item.pivot.rotation.x = THREE.MathUtils.damp(item.pivot.rotation.x, targetRotX, 6.0, delta);

            /* Brighten the letter's warm off-white wireframe on proximity/click */
            const activeGlow = Math.min(1, item.hoverIntensity + item.clickImpulse);
            item.edgeMat.opacity = 0.38 + activeGlow * 0.50;
          }

          wordmarkRenderer.render(wordmarkScene, wordmarkCamera);
          markWordmarkReady();
        }
      }

      if (!prefersReducedMotion) {
        orbRenderer.setAnimationLoop(animate);
      }
    }

    initThreeScenes();
