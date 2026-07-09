/* Meridian — interactions
   Scroll reveals, nav state, animated counters, live terminal, mobile menu. */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".counter");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (prefersReduced || target === 0) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = (target * ease(p)).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ---------- Hero terminal typewriter ---------- */
  const term = document.getElementById("terminalBody");
  const lines = [
    { t: '<span class="t-dim">04:12:03</span> <span class="t-info">SCAN</span>  1,291 endpoints · all agents reporting', d: 300 },
    { t: '<span class="t-dim">04:12:04</span> <span class="t-warn">ALERT</span> anomalous login · sfo-edge-07 · geo mismatch', d: 900 },
    { t: '<span class="t-dim">04:12:04</span> <span class="t-info">SOC</span>   session isolated · credentials rotated · 340ms', d: 700 },
    { t: '<span class="t-dim">04:12:05</span> <span class="t-ok">OK</span>    threat neutralized — client asleep. as it should be.', d: 900 },
  ];
  let lineIdx = 0;
  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";

  const addLine = () => {
    if (lineIdx >= lines.length) {
      term.appendChild(cursor);
      return;
    }
    const div = document.createElement("div");
    div.innerHTML = lines[lineIdx].t;
    term.appendChild(div);
    const delay = lines[lineIdx].d;
    lineIdx += 1;
    setTimeout(addLine, prefersReduced ? 0 : delay);
  };

  const termIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(addLine, prefersReduced ? 0 : 600);
          termIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  termIO.observe(term);

  /* ---------- Security threat counter ---------- */
  const threat = document.getElementById("threatCounter");
  if (threat && !prefersReduced) {
    let n = 4;
    setInterval(() => {
      n += Math.floor(Math.random() * 3) + 1;
      threat.textContent = n.toLocaleString();
    }, 2600);
  }

  /* ---------- CTA form (demo) ---------- */
  const form = document.getElementById("ctaForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("sent");
    const btn = form.querySelector(".btn");
    btn.textContent = "✓ Request received — we'll be in touch within one business day";
  });
})();
