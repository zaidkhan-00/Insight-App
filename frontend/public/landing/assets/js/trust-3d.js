/**
 * trust-3d.js — Orbital Vault for the #trust / .trust-orbit slot.
 *
 * Drop-in 3D replacement for the flat SVG rings:
 *   - faceted vault core (wireframe + solid)
 *   - 3 tilted torus orbit rings (ink, ink, ember)
 *   - mouse parallax on the rig (fine pointers only)
 *   - pauses off-screen / when tab hidden; static frame for reduced motion
 *   - keeps the SVG fallback visible if WebGL / Three fail to load
 *
 * Colour tokens match DESIGN.md / styles.css :root (hex fallback values).
 */
import * as THREE from "three";

const COLORS = {
  ink: 0x241c19,
  accent: 0xb06059,
  accentInk: 0x6a3632,
};

function initTrust3D() {
  const container = document.getElementById("trustOrbit");
  const canvas = document.getElementById("trustCanvas");
  const visual = container ? container.closest(".trust__visual") : null;
  if (!container || !canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return; // fallback SVG stays visible
  }
  if (!renderer) return;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 1.05, 7.0);
  camera.lookAt(0, 0, 0);

  /* Rig = parallax group, vault = idle-spin group */
  const rig = new THREE.Group();
  const vault = new THREE.Group();
  rig.add(vault);
  scene.add(rig);

  const inkMat = (opacity, extra = {}) =>
    new THREE.MeshBasicMaterial({
      color: COLORS.ink,
      transparent: true,
      opacity,
      depthWrite: false,
      ...extra,
    });

  /* --- Orbit rings (torus) --- */
  /* Gyroscope-style: same X tilt, each ring's major axis spun 120° apart */
  const ringDefs = [
    { radius: 2.02, tube: 0.016, opacity: 0.45, tiltX: 1.05, tiltZ: (Math.PI * 2) / 3 },
    { radius: 1.72, tube: 0.016, opacity: 0.5, tiltX: 1.05, tiltZ: -(Math.PI * 2) / 3 },
    { radius: 1.44, tube: 0.018, opacity: 0.95, tiltX: 1.05, tiltZ: 0 },
  ];

  ringDefs.forEach((def, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = def.tiltX;
    pivot.rotation.z = def.tiltZ;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, def.tube, 12, 256),
      i === 2
        ? new THREE.MeshBasicMaterial({ color: COLORS.accent, transparent: true, opacity: def.opacity, depthWrite: false })
        : inkMat(def.opacity)
    );
    ring.renderOrder = 1;
    pivot.add(ring);

    vault.add(pivot);
  });

  /* --- Vault core --- */
  const core = new THREE.Group();

  const solidGeo = new THREE.IcosahedronGeometry(0.78, 1);
  const solid = new THREE.Mesh(
    solidGeo,
    new THREE.MeshBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.07, depthWrite: false })
  );
  core.add(solid);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.86, 1)),
    new THREE.LineBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.38 })
  );
  core.add(wire);

  vault.add(core);

  /* --- Sizing --- */
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(container);
  } else {
    window.addEventListener("resize", resize);
  }

  /* --- Visibility / pause --- */
  let inView = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
      },
      { rootMargin: "0px 0px 0px 0px", threshold: 0.02 }
    ).observe(container);
  }

  /* --- Mouse parallax (fine pointers only) --- */
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const MAX_Y = 0.22; // ~12.6 deg
  const MAX_X = 0.16; // ~9.2 deg
  const BASE_X = 0.12;

  if (!reduceMotion && !coarsePointer && visual) {
    visual.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        const r = visual.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        target.x = Math.max(-1, Math.min(1, nx)) * MAX_Y;
        target.y = Math.max(-1, Math.min(1, ny)) * MAX_X;
      },
      { passive: true }
    );
    visual.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
    });
  }

  /* --- Loop (THREE.Timer + setAnimationLoop, per skill) --- */
  const timer = new THREE.Timer();
  timer.connect(document); // also freezes deltas while the tab is hidden
  let started = false;

  function animate() {
    timer.update(); // first thing each frame
    const delta = timer.getDelta();
    const elapsed = timer.getElapsed();

    if (!inView) return;

    // Vault core: slow turn + gentle float (keyhole rides along)
    core.rotation.y += 0.10 * delta;
    core.position.y = Math.sin(elapsed * 0.6) * 0.05;

    // Mouse parallax: exponential approach, frame-rate independent
    current.x = THREE.MathUtils.damp(current.x, target.x, 4, delta);
    current.y = THREE.MathUtils.damp(current.y, target.y, 4, delta);
    rig.rotation.y = current.x;
    rig.rotation.x = BASE_X + current.y;

    renderer.render(scene, camera);
  }

  function show3D() {
    container.classList.add("has-3d");
    if (!started) {
      started = true;
      renderer.setAnimationLoop(animate);
    }
  }

  if (reduceMotion) {
    // Static composition: one well-chosen frame, no loop, no parallax
    rig.rotation.x = BASE_X;
    rig.rotation.y = 0.18;
    renderer.render(scene, camera);
    container.classList.add("has-3d");
    return;
  }

  // Warm up one frame, then hand over to the loop + CSS fade
  renderer.render(scene, camera);
  show3D();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTrust3D, { once: true });
} else {
  initTrust3D();
}
