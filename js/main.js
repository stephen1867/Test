/* LMD Tech — boot sequence, particle network, reveals, counters,
   radar blips, terminal, cursor ring, magnetic buttons, tilt. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Boot sequence ---------- */
  var boot = document.getElementById("boot");
  var bootLines = document.getElementById("bootLines");
  function endBoot() {
    document.body.classList.add("ready");
    if (boot) {
      boot.classList.add("done");
      setTimeout(function () { boot.remove(); }, 800);
    }
  }
  if (reduced || !boot) {
    if (boot) boot.remove();
    document.body.classList.add("ready");
  } else {
    boot.classList.add("on");
    var seq = [
      '<b>LMD/OS</b> v4.2 — initializing',
      'link established <span class="t-dim">·</span> latency <b>4ms</b>',
      'endpoints <b>1,291</b> <span class="ok">✓</span>  threats <b>0</b> <span class="ok">✓</span>  uptime <b>99.99%</b> <span class="ok">✓</span>',
      '<span class="acc">▸</span> ALL SYSTEMS GO'
    ];
    var i = 0;
    (function next() {
      if (i < seq.length) {
        var d = document.createElement("div");
        d.innerHTML = seq[i++];
        bootLines.appendChild(d);
        setTimeout(next, 230);
      } else {
        setTimeout(endBoot, 420);
      }
    })();
    // hard fallback so the overlay can never trap the page
    setTimeout(endBoot, 2600);
  }

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Particle network hero ---------- */
  var canvas = document.getElementById("net");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var W, H, dpr, nodes = [], mouse = { x: -9999, y: -9999 };
    var N = 90, LINK = 150;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = W < 720 ? 45 : 90;
      LINK = W < 720 ? 110 : 150;
      seed();
    }
    function seed() {
      nodes = [];
      for (var i = 0; i < N; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.9
        });
      }
    }
    var pulses = [];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        // gentle push away from cursor
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        d = dx * dx + dy * dy;
        if (d < 16000) {
          a.x += dx / Math.sqrt(d) * 1.4;
          a.y += dy / Math.sqrt(d) * 1.4;
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(243,242,238," + (0.34 * (1 - d / LINK)) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(243,242,238,0.9)";
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.2832);
        ctx.fill();
      }
      // orange pulses travelling between random neighbours
      if (Math.random() < 0.05 && pulses.length < 6) {
        i = (Math.random() * nodes.length) | 0;
        j = (Math.random() * nodes.length) | 0;
        a = nodes[i]; b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y;
        if (i !== j && dx * dx + dy * dy < LINK * LINK * 2.4) {
          pulses.push({ a: a, b: b, t: 0 });
        }
      }
      for (i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i];
        p.t += 0.018;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        var px = p.a.x + (p.b.x - p.a.x) * p.t;
        var py = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = "rgba(255,78,27,0.95)";
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, 6.2832);
        ctx.fill();
      }
    }
    var running = false, rafId = 0;
    function loop() { draw(); rafId = requestAnimationFrame(loop); }
    resize();
    window.addEventListener("resize", resize);
    if (reduced) {
      draw(); // one static frame
    } else {
      var heroIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !running) { running = true; loop(); }
          else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(rafId); }
        });
      }, { threshold: 0.05 });
      heroIO.observe(canvas);
      if (hasHover) {
        canvas.parentElement.addEventListener("pointermove", function (e) {
          var r = canvas.getBoundingClientRect();
          mouse.x = e.clientX - r.left;
          mouse.y = e.clientY - r.top;
        });
        canvas.parentElement.addEventListener("pointerleave", function () {
          mouse.x = -9999; mouse.y = -9999;
        });
      }
    }
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduced) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Giant outline parallax ---------- */
  var giants = document.querySelectorAll(".giant-outline");
  if (!reduced && giants.length) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        giants.forEach(function (g) {
          var r = g.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            var p = (r.top + r.height / 2) / window.innerHeight - 0.5;
            g.style.transform = "translateX(" + (p * 70).toFixed(1) + "px)";
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll(".counter");
  function runCounter(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduced || target === 0) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1700, start = performance.now();
    function ease(t) { return 1 - Math.pow(1 - t, 4); }
    (function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = (target * ease(p)).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var cIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { runCounter(en.target); cIO.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { cIO.observe(el); });

  /* ---------- Radar blips + threat counter ---------- */
  var radar = document.getElementById("radar");
  var threat = document.getElementById("threatCounter");
  if (radar && !reduced) {
    setInterval(function () {
      if (document.hidden) return;
      var blip = document.createElement("span");
      blip.className = "blip";
      var ang = Math.random() * 6.2832, dist = Math.random() * 0.4 + 0.08;
      blip.style.left = (50 + Math.cos(ang) * dist * 100) + "%";
      blip.style.top = (50 + Math.sin(ang) * dist * 100) + "%";
      radar.appendChild(blip);
      setTimeout(function () { blip.remove(); }, 3000);
    }, 1400);
  }
  if (threat && !reduced) {
    var n = 4;
    setInterval(function () {
      n += ((Math.random() * 3) | 0) + 1;
      threat.textContent = n.toLocaleString();
    }, 2600);
  }

  /* ---------- SOC terminal ---------- */
  var term = document.getElementById("terminalBody");
  if (term) {
    var lines = [
      '<span class="t-dim">04:12:03</span> <span class="t-info">SCAN</span>  1,291 endpoints · all agents reporting',
      '<span class="t-dim">04:12:04</span> <span class="t-warn">ALERT</span> anomalous login · sfo-edge-07 · geo mismatch',
      '<span class="t-dim">04:12:04</span> <span class="t-info">SOC</span>   session isolated · credentials rotated · 340ms',
      '<span class="t-dim">04:12:05</span> <span class="t-ok">OK</span>    threat neutralized — client asleep. as it should be.'
    ];
    var delays = [300, 900, 700, 900], li = 0;
    var caret = document.createElement("span");
    caret.className = "t-caret";
    function addLine() {
      if (li >= lines.length) { term.appendChild(caret); return; }
      var d = document.createElement("div");
      d.innerHTML = lines[li];
      term.appendChild(d);
      setTimeout(addLine, reduced ? 0 : delays[li++]);
    }
    var tIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { setTimeout(addLine, reduced ? 0 : 500); tIO.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    tIO.observe(term);
  }

  /* ---------- Cursor ring + magnetic buttons ---------- */
  var ring = document.getElementById("ring");
  if (hasHover && !reduced && ring) {
    var rx = -100, ry = -100, tx = -100, ty = -100, shown = false;
    document.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; ring.style.opacity = "1"; rx = tx; ry = ty; }
    });
    (function follow() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll("a, button, summary").forEach(function (el) {
      el.addEventListener("pointerenter", function () { ring.classList.add("big"); });
      el.addEventListener("pointerleave", function () { ring.classList.remove("big"); });
    });

    document.querySelectorAll(".magnet").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = "translate(" + (mx * 5).toFixed(1) + "px," + (my * 5).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    var dash = document.getElementById("dash");
    if (dash) {
      dash.addEventListener("pointermove", function (e) {
        var r = dash.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        dash.style.transform = "perspective(900px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg)";
      });
      dash.addEventListener("pointerleave", function () { dash.style.transform = ""; });
    }
  } else if (ring) {
    ring.remove();
  }

  /* ---------- Ticker: duplicate content for seamless loop ---------- */
  var track = document.getElementById("tickerTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- CTA form (demo) ---------- */
  var form = document.getElementById("ctaForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.add("sent");
      form.querySelector(".btn").textContent = "✓ Received — we'll reply within one business day";
    });
  }
})();
