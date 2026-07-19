/* Motion system — ui-ux-pro-max "Modern Dark (Cinema)", hand-rolled, no deps */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Active nav link ---------- */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === here) a.classList.add("active");
  });

  /* ---------- Animated page transitions ---------- */
  if (!reduceMotion) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.getAttribute("href"), location.href);
      if (url.origin !== location.origin) return;           // external / mailto
      if (url.pathname === location.pathname) return;        // same-page hash link
      e.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => { location.href = url.href; }, 220);
    });
    // Restore state when returning via back/forward cache
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) document.body.classList.remove("page-exit");
    });
  }

  /* ---------- Split-text hero headline (grouped by word so wrapping
     only happens at word boundaries) ---------- */
  const title = document.getElementById("split-title");
  if (title && !reduceMotion) {
    const text = title.textContent;
    title.textContent = "";
    title.setAttribute("aria-label", text);
    let i = 0;
    const words = text.split(" ");
    words.forEach((word, w) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      wordSpan.setAttribute("aria-hidden", "true");
      for (const ch of word) {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        span.style.animationDelay = 120 + i * 26 + "ms";
        wordSpan.appendChild(span);
        i++;
      }
      title.appendChild(wordSpan);
      if (w < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- Rotating role word ---------- */
  const swap = document.getElementById("swap-word");
  if (swap && !reduceMotion) {
    const words = ["web apps", "mobile apps", "REST APIs", "CLI tools", "cool stuff"];
    let idx = 0;
    setInterval(() => {
      swap.classList.add("out");
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        swap.textContent = words[idx];
        swap.classList.remove("out");
        swap.classList.add("in");
        setTimeout(() => swap.classList.remove("in"), 350);
      }, 240);
    }, 2600);
  }

  /* ---------- Scroll reveal (IO + deep-link & no-IO safety nets) ---------- */
  const targets = document.querySelectorAll(".reveal");
  const revealAll = () => targets.forEach((el) => el.classList.add("is-visible"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    let observerFired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        observerFired = true;
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    setTimeout(() => {
      if (!observerFired) { revealAll(); observer.disconnect(); }
    }, 1200);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const t0 = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cObs.observe(c));
    setTimeout(() => counters.forEach((c) => {
      if (c.textContent === "0") runCounter(c);
    }), 1500);
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count; });
  }

  /* ---------- Scroll progress bar ---------- */
  const bar = document.getElementById("progress-bar");
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* ---------- Cursor glow (fine pointers only) ---------- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && finePointer && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0, glowRaf = null;
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.3) {
        glowRaf = requestAnimationFrame(loop);
      } else { glowRaf = null; }
    };
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add("has-cursor");
      if (!glowRaf) glowRaf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.25;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "";
        setTimeout(() => { el.style.transition = ""; }, 360);
      });
    });
  }

  /* ---------- 3D tilt + spotlight cards ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let raf = null;
      card.addEventListener("pointermove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.transform =
            `rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`;
          card.style.setProperty("--mx", px * 100 + "%");
          card.style.setProperty("--my", py * 100 + "%");
          raf = null;
        });
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";
        card.style.transform = "";
        setTimeout(() => { card.style.transition = ""; }, 510);
      });
    });
  }

  /* ---------- Marquee: duplicate track for seamless loop ---------- */
  const track = document.getElementById("marquee-track");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Particle field ---------- */
  const canvas = document.getElementById("field");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let W, H, dpr, particles = [];
    const LINK_DIST = 140;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth = window.innerWidth;
      H = canvas.clientHeight = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((W * H) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    let mouseX = -9999, mouseY = -9999;
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
      }, { passive: true });
    }

    let running = true;
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dx = p.x - mouseX, dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * 0.6;
          p.y += (dy / d) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(165, 180, 252, 0.35)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.12;
            ctx.strokeStyle = `rgba(94, 106, 210, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }
})();
