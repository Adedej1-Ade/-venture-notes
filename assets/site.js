/* Victor Ade-Oduntan — Venture Notes
   One shared script for the whole site. No dependencies, no build step.

   To add a write-up: add one object to POSTS below and drop one HTML file in
   posts/ (copy an existing article). Nothing else to change.

   Each POSTS entry:
     section : "trends" | "watchlist" | "postmortems"  (which grid it lands in)
     badge   : the pill label ("Trends", "Post-Mortem", "Coming soon", …)
     title   : card title
     meta    : the line under the title
     byline  : small byline line (usually "Victor", a date, or "")
     seed    : integer — keeps each card's generated artwork stable + unique
     href    : link target, or null for a non-clickable "Coming soon" card
*/
const POSTS = [
  // ── Trends (01) — market-curves motif, steel-teal ────────────────────────
  { section: "trends", seed: 11,  badge: "Trends",     title: "The Emerging Data Layer in Healthcare", meta: "Jul 2026 · Healthtech",   byline: "Victor", href: "posts/emerging-data-layer-in-healthcare.html" },
  { section: "trends", seed: 217, badge: "Trends",     title: "Beyond the Product: Defensibility in African B2B Fintech", meta: "Aug 2026 · Fintech", byline: "Victor", href: "posts/beyond-the-product.html" },
  { section: "trends", seed: 233, badge: "Trends",     title: "Execution Is the New Moat: PAYGo Solar and Battery Swapping in Africa", meta: "Sep 2026 · Climate", byline: "Victor", href: "posts/execution-is-the-new-moat.html" },
  { section: "trends", seed: 27, badge: "Coming soon", title: "Next write-up",       meta: "In progress", byline: "", href: null },

  // ── Watchlist (02) — radar motif ─────────────────────────────────────────
  { section: "watchlist", seed: 121, badge: "Watchlist",   title: "Kera Health: Addressing Africa’s Healthcare Data Gap", meta: "Aug 2026 · Healthtech", byline: "Victor", href: "posts/kera-health.html" },
  { section: "watchlist", seed: 113, badge: "Coming soon", title: "Next write-up",  meta: "In progress", byline: "", href: null },

  // ── Post-Mortems (03) — peak-and-fall motif ──────────────────────────────
  { section: "postmortems", seed: 163, badge: "Post-Mortem", title: "WeSabi: 10 Years at Seed", meta: "Marketplace · Nigeria", byline: "Jul 2026", href: "posts/wesabi-10-years-at-seed.html" },
  { section: "postmortems", seed: 181, badge: "Coming soon", title: "Next write-up",   meta: "In progress", byline: "", href: null },
];

/* Per-section artwork settings: motif + hue/saturation of the card ground. */
const SECTION_ART = {
  trends:      { motif: "curve",    hue: 196, sat: 26 },
  watchlist:   { motif: "radar",    hue: 258, sat: 34 },
  postmortems: { motif: "peakfall", hue: 236, sat: 34 },
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Seeded PRNG (LCG) ─────────────────────────────────────────────────────
   Same generator the design uses, so each seed reproduces identical artwork
   on every reload while staying unique per card. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/* ── Card rendering (data-driven) ──────────────────────────────────────── */
function buildCards() {
  for (const post of POSTS) {
    const grid = document.querySelector('[data-cards="' + post.section + '"]');
    if (!grid) continue;
    const art = SECTION_ART[post.section];
    const clickable = !!post.href;
    const el = document.createElement(clickable ? "a" : "div");
    el.className = "card";
    el.setAttribute("data-reveal", "");
    if (clickable) el.href = post.href;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 500;
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.art = String(post.seed);
    canvas.dataset.motif = art.motif;
    canvas.dataset.hue = String(art.hue);
    canvas.dataset.sat = String(art.sat);

    const scrim = document.createElement("span");
    scrim.className = "card-scrim";

    const content = document.createElement("span");
    content.className = "card-content";
    content.innerHTML =
      '<span class="card-badge"></span>' +
      '<span class="card-title"></span>' +
      '<span class="card-meta"></span>' +
      '<span class="card-byline"></span>';
    content.querySelector(".card-badge").textContent = post.badge;
    content.querySelector(".card-title").textContent = post.title;
    content.querySelector(".card-meta").textContent = post.meta;
    content.querySelector(".card-byline").textContent = post.byline || "";

    el.append(canvas, scrim, content);
    grid.appendChild(el);
  }
}

/* ── Seeded card artwork — painted once on mount ───────────────────────── */
function paintArt(cv, seed) {
  const ctx = cv.getContext("2d");
  const r = rng(seed);
  const W = cv.width, H = cv.height;
  const base = parseFloat(cv.dataset.hue) || 258;
  const sat = parseFloat(cv.dataset.sat) || 34;
  const hue = base + r() * 30;
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, "hsl(" + hue + "," + sat + "%,32%)");
  g.addColorStop(1, "hsl(" + (hue - 14) + "," + (sat - 4) + "%,11%)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const motif = cv.dataset.motif || "curve";
  if (motif === "radar") artRadar(ctx, W, H, r);
  else if (motif === "peakfall") artPeakfall(ctx, W, H, r);
  else artCurve(ctx, W, H, r);
}

function artGrid(ctx, W, H, a) {
  ctx.strokeStyle = "rgba(233,233,237," + a + ")";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) { const y = (H / 8) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = 1; i < 6; i++) { const x = (W / 6) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
}

/* Watchlist — radar sweep with blips */
function artRadar(ctx, W, H, r) {
  const cx = W / 2, cy = H * 0.52, R = Math.min(W, H) * 0.46;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    ctx.strokeStyle = "rgba(233,233,237,.09)";
    ctx.beginPath(); ctx.arc(cx, cy, (R / 4) * i, 0, 6.2832); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.2832;
    ctx.strokeStyle = "rgba(233,233,237,.06)";
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  }
  const sweep = r() * 6.2832;
  const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  sg.addColorStop(0, "rgba(179,169,230,.3)");
  sg.addColorStop(1, "rgba(179,169,230,0)");
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, sweep, sweep + 0.9); ctx.closePath(); ctx.fill();
  const n = 7 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.2832, d = R * (0.2 + r() * 0.78);
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + r() * 2.4, 0, 6.2832);
    ctx.fillStyle = "rgba(207,200,242," + (0.4 + r() * 0.5).toFixed(2) + ")";
    ctx.fill();
  }
}

/* Post-Mortems — solid to the peak, dashed after */
function artPeakfall(ctx, W, H, r) {
  artGrid(ctx, W, H, ".05");
  const peak = 0.42 + r() * 0.22;
  const n = 10;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const shape = u < peak ? u / peak : 1 - Math.pow((u - peak) / (1 - peak), 1.3) * 1.15;
    pts.push({ x: u * W, y: H * (0.9 - shape * 0.7) + (r() - 0.5) * H * 0.035 });
  }
  const pi = Math.round(peak * n);
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i <= pi; i++) { const mx = (pts[i - 1].x + pts[i].x) / 2; ctx.bezierCurveTo(mx, pts[i - 1].y, mx, pts[i].y, pts[i].x, pts[i].y); }
  ctx.strokeStyle = "rgba(207,200,242,.8)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(pts[pi].x, pts[pi].y);
  for (let i = pi + 1; i < pts.length; i++) { const mx = (pts[i - 1].x + pts[i].x) / 2; ctx.bezierCurveTo(mx, pts[i - 1].y, mx, pts[i].y, pts[i].x, pts[i].y); }
  ctx.strokeStyle = "rgba(233,233,237,.34)"; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(pts[pi].x, pts[pi].y, 4.5, 0, 6.2832);
  ctx.fillStyle = "rgba(233,233,237,.9)"; ctx.fill();
  ctx.strokeStyle = "rgba(233,233,237,.18)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pts[pi].x, 0); ctx.lineTo(pts[pi].x, H); ctx.stroke();
}

/* Trends — rising market curves */
function artCurve(ctx, W, H, r) {
  artGrid(ctx, W, H, ".07");
  const series = 3;
  for (let s = 0; s < series; s++) {
    const n = 9;
    const pts = [];
    let y = H * (0.86 - s * 0.06);
    for (let i = 0; i <= n; i++) {
      y -= H * (0.045 + r() * 0.06);
      pts.push({ x: (i / n) * W, y: Math.max(H * 0.12, y + (r() - 0.5) * H * 0.05) });
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    pts.forEach((p, i) => {
      if (i === 0) ctx.lineTo(p.x, p.y);
      else { const mx = (pts[i - 1].x + p.x) / 2; ctx.bezierCurveTo(mx, pts[i - 1].y, mx, p.y, p.x, p.y); }
    });
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = "rgba(179,169,230," + (0.07 + s * 0.05).toFixed(2) + ")";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p, i) => { if (i > 0) { const mx = (pts[i - 1].x + p.x) / 2; ctx.bezierCurveTo(mx, pts[i - 1].y, mx, p.y, p.x, p.y); } });
    ctx.strokeStyle = s === series - 1 ? "rgba(207,200,242,.85)" : "rgba(233,233,237,.28)";
    ctx.lineWidth = s === series - 1 ? 2 : 1.2;
    ctx.stroke();
  }
}

function paintAllCards() {
  document.querySelectorAll("canvas[data-art]").forEach((cv) => {
    if (cv.dataset.painted) return;
    cv.dataset.painted = "1";
    paintArt(cv, parseInt(cv.dataset.art, 10) || 1);
  });
}

/* ── Scroll reveal ─────────────────────────────────────────────────────── */
function initReveals() {
  const els = document.querySelectorAll("[data-reveal]");
  if (reduceMotion) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const stagger = document.querySelector(".article") ? 5 : 6;
  const step = document.querySelector(".article") ? 0.06 : 0.07;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -6% 0px" });
  let i = 0;
  els.forEach((el) => {
    const d = ((i++) % stagger) * step;
    el.style.transitionDelay = d + "s";
    io.observe(el);
  });
}

/* ── Scroll progress line ──────────────────────────────────────────────── */
function initProgress() {
  const line = document.querySelector(".progress-line");
  if (!line) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    line.style.width = (p * 100).toFixed(2) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Mobile menu ───────────────────────────────────────────────────────── */
function initMenu() {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  if (!burger || !menu) return;
  const setOpen = (open) => {
    menu.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
  };
  setOpen(false);
  burger.addEventListener("click", () => setOpen(menu.hidden));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
}

/* ── Cover: power-law bar chart (animated) ─────────────────────────────── */
function initCover() {
  const cv = document.querySelector(".cover-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rs = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  window.addEventListener("resize", rs);
  rs();
  const N = 34;
  const bars = [];
  for (let i = 0; i < N; i++) bars.push({ target: 0, cur: 0 });
  const shape = (i) => 0.06 + Math.pow(1 - i / (N - 1), 2.6) * 0.86;
  const setTargets = () => bars.forEach((b, i) => { b.target = shape(i) * (0.82 + Math.random() * 0.36); });
  setTargets();

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(233,233,237,.05)";
    for (let i = 1; i < 6; i++) { const y = h - (h * 0.82 / 6) * i - h * 0.06; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const gap = (w / N) * 0.32, bw = w / N - gap;
    bars.forEach((b, i) => {
      const bh = b.cur * h * 0.8;
      const x = i * (bw + gap) + gap / 2;
      const y = h - bh - h * 0.06;
      const lead = i < 2;
      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, lead ? "rgba(179,169,230,.5)" : "rgba(179,169,230,.15)");
      grad.addColorStop(1, "rgba(179,169,230,.02)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = lead ? "rgba(207,200,242,.85)" : "rgba(233,233,237,.22)";
      ctx.fillRect(x, y, bw, lead ? 2 : 1);
    });
    ctx.strokeStyle = "rgba(233,233,237,.13)";
    ctx.beginPath(); ctx.moveTo(0, h - h * 0.06); ctx.lineTo(w, h - h * 0.06); ctx.stroke();
  };

  if (reduceMotion) {
    // Render one settled static frame.
    bars.forEach((b) => { b.cur = b.target; });
    draw();
    return;
  }
  let t = 0, cycle = 0;
  const frame = () => {
    t += 1;
    if (t - cycle > 460) { cycle = t; setTargets(); }
    bars.forEach((b) => { b.cur += (b.target - b.cur) * 0.035; });
    draw();
    requestAnimationFrame(frame);
  };
  frame();
}

/* ── Whole-page background: cap-table orbits (animated) ────────────────── */
function initOrbits() {
  const cv = document.querySelector(".bg-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const dim = cv.dataset.orbit === "article"; // article variant is slightly dimmer
  const light = document.body.classList.contains("theme-light"); // light write-up pages: dark ink on white
  let w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rs = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  window.addEventListener("resize", rs);
  rs();
  const rings = [
    { r: 0.14, n: 3, spd: 0.0042, ph: 0.2 },
    { r: 0.24, n: 5, spd: -0.0029, ph: 1.1 },
    { r: 0.34, n: 8, spd: 0.0019, ph: 2.4 },
    { r: 0.45, n: 12, spd: -0.0013, ph: 0.7 },
  ];
  const coreA = dim ? ".22" : ".24";
  const dotA = dim ? ".65" : ".7";
  const ringA = dim ? ".06" : ".07";
  const dotR = dim ? 3.0 : 3.2;
  const holderBase = dim ? 3.2 : 3.4;
  const spokeBase = dim ? 0.12 : 0.14;
  const spokeStep = dim ? 0.02 : 0.022;
  const pulseBase = dim ? 0.28 : 0.3;
  const pulseAmp = dim ? 0.32 : 0.35;

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.74, cy = h * 0.52, R = Math.min(w, h);
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.2);
    core.addColorStop(0, light ? "rgba(0,0,0,0.05)" : "rgba(179,169,230," + coreA + ")");
    core.addColorStop(1, light ? "rgba(0,0,0,0)" : "rgba(179,169,230,0)");
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, 6.2832); ctx.fill();
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(233,233,237," + dotA + ")";
    ctx.beginPath(); ctx.arc(cx, cy, dotR, 0, 6.2832); ctx.fill();
    ctx.lineWidth = 1;
    rings.forEach((ring, ri) => {
      const rad = ring.r * R;
      ctx.strokeStyle = light ? "rgba(0,0,0,0.05)" : "rgba(233,233,237," + ringA + ")";
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.stroke();
      for (let i = 0; i < ring.n; i++) {
        const a = ring.ph + t * ring.spd + (i / ring.n) * 6.2832;
        const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
        ctx.strokeStyle = light ? "rgba(0,0,0," + (0.05 - ri * 0.008).toFixed(3) + ")" : "rgba(145,132,217," + (spokeBase - ri * spokeStep).toFixed(3) + ")";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        const s = holderBase - ri * 0.5;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.02 + i * 1.3 + ri);
        ctx.fillStyle = light ? "rgba(0,0,0," + (0.10 + pulse * 0.10).toFixed(3) + ")" : "rgba(207,200,242," + (pulseBase + pulse * pulseAmp).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x, y, s, 0, 6.2832); ctx.fill();
        if (ri === 0 && !dim && !light) {
          ctx.strokeStyle = "rgba(179,169,230,.3)";
          ctx.beginPath(); ctx.arc(x, y, s + 5 + pulse * 3, 0, 6.2832); ctx.stroke();
        }
      }
    });
  };

  if (reduceMotion) { draw(0); return; }
  let t = 0;
  const frame = () => { t += 1; draw(t); requestAnimationFrame(frame); };
  frame();
}

/* ── Boot ──────────────────────────────────────────────────────────────── */
function init() {
  buildCards();
  paintAllCards();
  initReveals();
  initProgress();
  initMenu();
  initCover();
  initOrbits();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
