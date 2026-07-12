/* ============================================================
   DD&SA — Living Neural Background (site-wide)
   Drop into /assets/neural-bg.js and include on any page with:
     <script src="/assets/neural-bg.js" defer></script>
   The script injects its own <canvas> and vignette layer, so no
   HTML changes are needed beyond the include line.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    (navigator.connection && navigator.connection.saveData === true);

  /* ---------- inject canvas + veil so pages need no markup ---------- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (document.getElementById("neural")) return; /* already present */

    var canvas = document.createElement("canvas");
    canvas.id = "neural";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:0;display:block;" +
      "background:radial-gradient(ellipse 120% 80% at 50% -10%, #101a3a 0%, #070c1d 45%, #04070f 100%);";

    var veil = document.createElement("div");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText =
      "position:fixed;inset:0;z-index:1;pointer-events:none;" +
      "background:radial-gradient(ellipse 70% 60% at 50% 38%," +
      "rgba(4,7,15,0) 0%, rgba(4,7,15,0.18) 60%, rgba(4,7,15,0.55) 100%);";

    document.body.insertBefore(veil, document.body.firstChild);
    document.body.insertBefore(canvas, document.body.firstChild);

    start(canvas);
  });

  /* ---------- the living network ---------- */
  function start(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var nodes = [];
    var pulses = [];
    var mouse = { x: -9999, y: -9999, active: false };
    var LINK_DIST = 150;
    var running = true;
    var lastT = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      LINK_DIST = Math.max(120, Math.min(175, Math.sqrt(W * H) / 8));
      seed();
    }

    function seed() {
      var target = Math.round((W * H) / 16000);
      target = Math.max(45, Math.min(130, target));
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.2 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 0.9,
          charge: 0
        });
      }
      pulses = [];
    }

    function fire(a, b, depth) {
      pulses.push({ a: a, b: b, t: 0, dur: 420 + Math.random() * 380, depth: depth || 0 });
    }

    function randomFire() {
      if (nodes.length < 2 || reduceMotion) return;
      var a = nodes[(Math.random() * nodes.length) | 0];
      var best = null, bd = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n === a) continue;
        var dx = n.x - a.x, dy = n.y - a.y, d = dx * dx + dy * dy;
        if (d < bd && d < LINK_DIST * LINK_DIST) { bd = d; best = n; }
      }
      if (best) fire(a, best, 0);
    }

    function step(dt) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx * dt * 0.06;
        n.y += n.vy * dt * 0.06;

        if (mouse.active) {
          var dx = mouse.x - n.x, dy = mouse.y - n.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180 && d2 > 1) {
            var d = Math.sqrt(d2);
            var f = (1 - d / 180) * 0.012 * dt;
            n.x += (dx / d) * f;
            n.y += (dy / d) * f;
          }
        }

        if (n.x < -30) n.x = W + 30; else if (n.x > W + 30) n.x = -30;
        if (n.y < -30) n.y = H + 30; else if (n.y > H + 30) n.y = -30;

        if (n.charge > 0) n.charge = Math.max(0, n.charge - dt * 0.0018);
      }

      for (var p = pulses.length - 1; p >= 0; p--) {
        var pu = pulses[p];
        pu.t += dt;
        if (pu.t >= pu.dur) {
          pu.b.charge = 1;
          if (pu.depth < 3 && Math.random() < 0.55) {
            var src = pu.b, best = null, bd = Infinity;
            for (var k = 0; k < nodes.length; k++) {
              var m = nodes[k];
              if (m === src || m === pu.a) continue;
              var ddx = m.x - src.x, ddy = m.y - src.y, dd = ddx * ddx + ddy * ddy;
              if (dd < bd && dd < LINK_DIST * LINK_DIST) { bd = dd; best = m; }
            }
            if (best) fire(src, best, pu.depth + 1);
          }
          pulses.splice(p, 1);
        }
      }

      if (!reduceMotion && Math.random() < 0.02 && pulses.length < 14) randomFire();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = performance.now() / 1000;

      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          var d = Math.sqrt(d2);
          var alpha = (1 - d / LINK_DIST);
          var glow = Math.max(a.charge, b.charge);
          ctx.strokeStyle = glow > 0.05
            ? "rgba(196,154,42," + (0.05 + alpha * 0.18 + glow * 0.25) + ")"
            : "rgba(94,116,170," + (alpha * 0.16) + ")";
          ctx.lineWidth = glow > 0.05 ? 0.9 : 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (var p = 0; p < pulses.length; p++) {
        var pu = pulses[p];
        var k = Math.min(1, pu.t / pu.dur);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var x = pu.a.x + (pu.b.x - pu.a.x) * e;
        var y = pu.a.y + (pu.b.y - pu.a.y) * e;

        var g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, "rgba(255,217,107,0.95)");
        g.addColorStop(0.4, "rgba(196,154,42,0.45)");
        g.addColorStop(1, "rgba(196,154,42,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,235,170,0.95)";
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var breathe = 1 + 0.35 * Math.sin(t * n.speed + n.phase);
        var r = n.r * breathe;
        var lit = n.charge;

        if (lit > 0.03) {
          var hg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 7);
          hg.addColorStop(0, "rgba(255,217,107," + (0.5 * lit) + ")");
          hg.addColorStop(1, "rgba(255,217,107,0)");
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = lit > 0.03
          ? "rgba(255,223,130," + (0.55 + 0.45 * lit) + ")"
          : "rgba(150,170,215," + (0.35 + 0.3 * Math.sin(t * n.speed + n.phase)) + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(50, now - lastT || 16);
      lastT = now;
      step(dt);
      draw();
      requestAnimationFrame(loop);
    }

    function staticFrame() { step(16); draw(); }

    window.addEventListener("resize", function () {
      resize();
      if (reduceMotion) staticFrame();
    });

    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener("pointerleave", function () { mouse.active = false; });

    window.addEventListener("pointerdown", function (e) {
      if (reduceMotion) return;
      var best = null, bd = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        var dx = nodes[i].x - e.clientX, dy = nodes[i].y - e.clientY;
        var d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = nodes[i]; }
      }
      if (best) {
        best.charge = 1;
        var fired = 0;
        for (var i = 0; i < nodes.length && fired < 3; i++) {
          var n = nodes[i];
          if (n === best) continue;
          var dx2 = n.x - best.x, dy2 = n.y - best.y;
          if (dx2 * dx2 + dy2 * dy2 < LINK_DIST * LINK_DIST) { fire(best, n, 1); fired++; }
        }
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
      } else if (!reduceMotion) {
        running = true;
        lastT = performance.now();
        requestAnimationFrame(loop);
      }
    });

    resize();
    if (reduceMotion) staticFrame();
    else requestAnimationFrame(loop);
  }
})();
