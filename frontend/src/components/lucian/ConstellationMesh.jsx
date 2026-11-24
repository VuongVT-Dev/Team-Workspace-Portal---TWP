// Lucian UX/UI Prompt #341 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#341
import React, { useEffect, useRef } from 'react';
import './lucian-341.css';

export function ConstellationMesh({ fullscreen = false, className = '' }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const cv = canvasRef.current;
    const ct = counterRef.current;
    if (!root || !cv || !ct) return undefined;

    const cx = cv.getContext('2d');
    if (!cx) return undefined;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rm = mql.matches;

    let W = root.clientWidth || 340;
    let H = root.clientHeight || 330;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    const LINK = fullscreen ? 110 : 72;
    const PL = fullscreen ? 160 : 120;
    const MAX = fullscreen ? 145 : 120;
    const INITIAL_COUNT = fullscreen
      ? Math.min(105, Math.max(52, Math.round((W * H) / 14500)))
      : 72;

    const P = [];
    let ptr = null;

    const resize = () => {
      const nextW = root.clientWidth || 340;
      const nextH = root.clientHeight || 330;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      if (W > 0 && H > 0 && P.length > 0 && (nextW !== W || nextH !== H)) {
        const sx = nextW / W;
        const sy = nextH / H;
        for (let i = 0; i < P.length; i++) {
          P[i].x *= sx;
          P[i].y *= sy;
        }
      }
      W = nextW;
      H = nextH;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const add = (x, y, vx, vy, born) => {
      P.push({ x, y, vx, vy, b: born || 0 });
      if (P.length > MAX) P.shift();
    };

    resize();
    for (let i = 0; i < INITIAL_COUNT; i++) {
      add(
        Math.random() * W,
        Math.random() * H,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22
      );
    }

    const draw = (now) => {
      cx.clearRect(0, 0, W, H);
      let links = 0;
      for (let a = 0; a < P.length; a++) {
        for (let b = a + 1; b < P.length; b++) {
          const dx = P[a].x - P[b].x;
          const dy = P[a].y - P[b].y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          links++;
          const hue = 210 + (P[a].x / (W || 1)) * 90;
          cx.strokeStyle = `hsla(${hue.toFixed(0)},90%,75%,${((1 - d / LINK) * 0.45).toFixed(2)})`;
          cx.lineWidth = 1;
          cx.beginPath();
          cx.moveTo(P[a].x, P[a].y);
          cx.lineTo(P[b].x, P[b].y);
          cx.stroke();
        }
      }

      if (ptr) {
        for (let i = 0; i < P.length; i++) {
          const p = P[i];
          const d = Math.hypot(p.x - ptr.x, p.y - ptr.y);
          if (d > PL) continue;
          links++;
          cx.strokeStyle = `rgba(255,224,130,${((1 - d / PL) * 0.8).toFixed(2)})`;
          cx.lineWidth = 1.3;
          cx.beginPath();
          cx.moveTo(ptr.x, ptr.y);
          cx.lineTo(p.x, p.y);
          cx.stroke();
        }
        cx.fillStyle = '#FFE082';
        cx.beginPath();
        cx.arc(ptr.x, ptr.y, 3.5, 0, 6.2832);
        cx.fill();
      }

      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const age = (now - p.b) / 600;
        const r = p.b && age < 1 ? 1.6 + (1 - age) * 2.4 : 1.6;
        cx.fillStyle = '#E7ECFF';
        cx.beginPath();
        cx.arc(p.x, p.y, r, 0, 6.2832);
        cx.fill();
      }

      ct.textContent = `${links} links`;
    };

    let vis = true;
    let raf = 0;
    let last = 0;
    let alive = true;

    const frame = (now) => {
      raf = 0;
      if (!alive || !vis) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (ptr) {
          const dx = ptr.x - p.x;
          const dy = ptr.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < PL && d > 12) {
            p.vx += (dx / d) * 28 * dt;
            p.vy += (dy / d) * 28 * dt;
          }
        }
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 30) {
          p.vx *= 1 - 1.5 * dt;
          p.vy *= 1 - 1.5 * dt;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > W) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(W, p.x));
        }
        if (p.y < 0 || p.y > H) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(H, p.y));
        }
      }

      draw(now);
      raf = window.requestAnimationFrame(frame);
    };

    const run = () => {
      if (rm) {
        draw(performance.now());
        return;
      }
      if (!raf && vis && alive) {
        last = performance.now();
        raf = window.requestAnimationFrame(frame);
      }
    };

    const onMotionChange = (e) => {
      rm = e.matches;
      if (rm && raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      run();
    };
    mql.addEventListener('change', onMotionChange);

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => {
        vis = es[0].isIntersecting;
        if (!vis && raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        run();
      });
      io.observe(root);
    }

    let ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        resize();
        if (rm) draw(performance.now());
      });
      ro.observe(root);
    }

    const loc = (e) => {
      const r = cv.getBoundingClientRect();
      const k = (cv.offsetWidth || W) / (r.width || 1);
      return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
    };

    const onPointerMove = (e) => {
      ptr = loc(e);
      if (rm) draw(performance.now());
    };

    const onPointerLeave = () => {
      ptr = null;
      if (rm) draw(performance.now());
    };

    const onPointerDown = (e) => {
      if (fullscreen && e.target && e.target.closest && e.target.closest('[data-login-card], button, input, a, form')) {
        return;
      }
      const q = loc(e);
      const now = performance.now();
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + Math.random() * 0.4;
        const s = 60 + Math.random() * 70;
        add(q.x, q.y, Math.cos(a) * s, Math.sin(a) * s, now);
      }
      if (rm) draw(now);
    };

    if (fullscreen) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerdown', onPointerDown);
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    } else {
      cv.addEventListener('pointermove', onPointerMove);
      cv.addEventListener('pointerleave', onPointerLeave);
      cv.addEventListener('pointerdown', onPointerDown);
    }

    run();

    return () => {
      alive = false;
      if (raf) window.cancelAnimationFrame(raf);
      mql.removeEventListener('change', onMotionChange);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (fullscreen) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      } else {
        cv.removeEventListener('pointermove', onPointerMove);
        cv.removeEventListener('pointerleave', onPointerLeave);
        cv.removeEventListener('pointerdown', onPointerDown);
      }
    };
  }, [fullscreen]);

  return (
    <div ref={rootRef} className={`ux u341 ${fullscreen ? 'u341-bg' : ''} ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        className="u341-cv"
        role="img"
        aria-label="Nền lưới chòm sao tương tác, nhấn vào khoảng trống để tạo thêm hạt sáng"
      />
      <span ref={counterRef} className="u341-ct" aria-hidden="true" />
    </div>
  );
}

export default ConstellationMesh;
