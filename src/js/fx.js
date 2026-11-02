// Canvas-based atmospheric effects (deterministic): floating pollen/dust bokeh and speed streaks.
import { rng, clamp } from './engine.js';

export function makeParticles(canvas, { n = 100, seed = 7, color = '170,255,180', sizeMin = 1.4, sizeMax = 9, bokeh = 0.25, comp = 'lighter' } = {}) {
  const W = (canvas.width = 1080), H = (canvas.height = 1920);
  const ctx = canvas.getContext('2d');
  const r = rng(seed);
  const ps = Array.from({ length: n }, () => {
    const z = Math.pow(r(), 1.6); // 0 far .. 1 near
    return {
      x: r() * W, y: r() * H, z,
      sp: 14 + r() * 38 + z * 60, ph: r() * 6.283, fq: 0.3 + r() * 0.9, am: 10 + r() * 40,
      sz: sizeMin + (sizeMax - sizeMin) * z, tw: 0.5 + r() * 2.5, a: 0.25 + r() * 0.75,
    };
  });
  return {
    draw(t, { alpha = 1, speed = 1, focusZ = null, cx = W / 2, cy = H / 2, parallaxX = 0, parallaxY = 0, tint = color, streak = 0 } = {}) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = comp;
      for (const p of ps) {
        const y = (((p.y - t * p.sp * speed) % (H + 200)) + (H + 200)) % (H + 200) - 100;
        const x = p.x + Math.sin(t * p.fq + p.ph) * p.am + parallaxX * (0.2 + p.z) * 120;
        const yy = y + parallaxY * (0.2 + p.z) * 120;
        const tw = 0.55 + 0.45 * Math.sin(t * p.tw + p.ph * 3);
        const blur = focusZ == null ? p.z * bokeh : Math.abs(p.z - focusZ) * 0.9;
        const rad = p.sz * (1 + blur * 1.8);
        const a = alpha * p.a * tw * (0.5 + 0.5 * (1 - blur * 0.8));
        if (a < 0.01) continue;
        if (streak > 0.01) {
          const dx = x - cx, dy = yy - cy, d = Math.hypot(dx, dy) || 1;
          const L = streak * (60 + p.z * 380);
          const g = ctx.createLinearGradient(x, yy, x + (dx / d) * L, yy + (dy / d) * L);
          g.addColorStop(0, `rgba(${tint},${clamp(a * 1.4)})`); g.addColorStop(1, `rgba(${tint},0)`);
          ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.2, rad * 0.5); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + (dx / d) * L, yy + (dy / d) * L); ctx.stroke();
        }
        const g = ctx.createRadialGradient(x, yy, 0, x, yy, rad);
        const core = 1 - blur * 0.75;
        g.addColorStop(0, `rgba(${tint},${a})`);
        g.addColorStop(clamp(core * 0.5), `rgba(${tint},${a * 0.55})`);
        g.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yy, rad, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
