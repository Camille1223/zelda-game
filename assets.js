// ============================================================
// assets.js — 像素风绘制工具函数（无外部图片）
// ============================================================

const Assets = {
  // 绘制 Link 风格勇者（绿帽小人）
  drawHero(ctx, x, y, w, h, dir = 1, frame = 0) {
    const s = w / 16;
    ctx.save();
    if (dir < 0) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.translate(-w, 0);
    } else {
      ctx.translate(x, y);
    }

    // 帽子
    ctx.fillStyle = '#2d8a2d';
    ctx.fillRect(2*s, 0, 12*s, 5*s);
    ctx.fillRect(0, 2*s, 16*s, 3*s);

    // 脸
    ctx.fillStyle = '#f5c887';
    ctx.fillRect(3*s, 5*s, 10*s, 6*s);
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(5*s, 7*s, 2*s, 2*s);
    ctx.fillRect(10*s, 7*s, 2*s, 2*s);

    // 身体（绿色外套）
    ctx.fillStyle = '#2d8a2d';
    ctx.fillRect(3*s, 11*s, 10*s, 8*s);

    // 腿（走路动画）
    ctx.fillStyle = '#8B4513';
    const legOff = (frame % 2 === 0) ? 0 : 2*s;
    ctx.fillRect(3*s, 19*s, 4*s, 5*s - legOff);
    ctx.fillRect(9*s, 19*s, 4*s, 5*s + legOff);

    // 剑（右手）
    ctx.fillStyle = '#aaa';
    ctx.fillRect(14*s, 10*s, 2*s, 8*s);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(12*s, 13*s, 4*s, 2*s);

    ctx.restore();
  },

  // 绘制卢比（宝石）
  drawRuby(ctx, x, y, size = 12, color = '#22dd22') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(size, size*0.4);
    ctx.lineTo(size, size*0.7);
    ctx.lineTo(size/2, size);
    ctx.lineTo(0, size*0.7);
    ctx.lineTo(0, size*0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(size*0.3, size*0.1, size*0.15, size*0.3);
    ctx.restore();
  },

  // 绘制心
  drawHeart(ctx, x, y, size = 14, filled = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = filled ? '#e83030' : '#333';
    ctx.strokeStyle = '#a00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size/2, size*0.35);
    ctx.bezierCurveTo(size/2, size*0.1, 0, size*0.1, 0, size*0.35);
    ctx.bezierCurveTo(0, size*0.6, size/2, size*0.9, size/2, size);
    ctx.bezierCurveTo(size/2, size*0.9, size, size*0.6, size, size*0.35);
    ctx.bezierCurveTo(size, size*0.1, size/2, size*0.1, size/2, size*0.35);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  // 绘制布林怪（蓝色圆形小怪）
  drawBlin(ctx, x, y, w, h, frame = 0) {
    const cx = x + w/2, cy = y + h/2, r = w/2;
    const bounce = Math.sin(frame * 0.2) * 2;
    ctx.save();
    // 身体
    ctx.fillStyle = '#3355cc';
    ctx.beginPath();
    ctx.ellipse(cx, cy + bounce, r*0.9, r*0.85, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2244aa';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 眼睛（红色发光）
    ctx.fillStyle = '#ff2222';
    ctx.beginPath();
    ctx.arc(cx - r*0.3, cy - r*0.1 + bounce, r*0.18, 0, Math.PI*2);
    ctx.arc(cx + r*0.3, cy - r*0.1 + bounce, r*0.18, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  },

  // 绘制骷髅怪
  drawSkeleton(ctx, x, y, w, h, frame = 0) {
    const s = w / 16;
    ctx.save();
    ctx.translate(x, y);
    // 头骨
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.ellipse(8*s, 5*s, 5*s, 5*s, 0, 0, Math.PI*2);
    ctx.fill();
    // 眼眶
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(5.5*s, 5*s, 2*s, 2.5*s, 0, 0, Math.PI*2);
    ctx.ellipse(10.5*s, 5*s, 2*s, 2.5*s, 0, 0, Math.PI*2);
    ctx.fill();
    // 骨架身体
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(6*s, 10*s, 4*s, 8*s);
    const legOff = (frame % 2 === 0) ? 0 : 2*s;
    ctx.fillRect(4*s, 18*s, 3*s, 4*s + legOff);
    ctx.fillRect(9*s, 18*s, 3*s, 4*s - legOff);
    ctx.restore();
  },

  // 绘制三角力量碎片
  drawTriforce(ctx, x, y, size = 16) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    const h = size * 0.866;
    ctx.beginPath();
    ctx.moveTo(x + size/2, y);
    ctx.lineTo(x + size, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  // 绘制传送门
  drawPortal(ctx, x, y, w, h, frame = 0) {
    const cx = x + w/2, cy = y + h/2;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, w/2);
    grd.addColorStop(0, `rgba(100,220,255,${0.6 + Math.sin(frame*0.1)*0.2})`);
    grd.addColorStop(0.5, `rgba(30,100,200,0.5)`);
    grd.addColorStop(1, 'rgba(0,30,80,0)');
    ctx.save();
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w/2, h/2, 0, 0, Math.PI*2);
    ctx.fill();
    // 旋转光环
    for (let i = 0; i < 6; i++) {
      const angle = (frame * 0.05) + i * Math.PI / 3;
      const px = cx + Math.cos(angle) * w * 0.45;
      const py = cy + Math.sin(angle) * h * 0.45;
      ctx.fillStyle = '#88eeff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  },

  // 绘制宝箱
  drawChest(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + h*0.4, w, h*0.6);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x, y, w, h*0.45);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + w*0.3, y + h*0.35, w*0.4, h*0.3);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.5, w*0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  },

  // 绘制钥匙
  drawKey(ctx, x, y, size = 14) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.fillStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size*0.35, y + size*0.35, size*0.3, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillRect(x + size*0.55, y + size*0.3, size*0.5, size*0.12);
    ctx.fillRect(x + size*0.85, y + size*0.42, size*0.12, size*0.2);
    ctx.fillRect(x + size*0.7, y + size*0.42, size*0.12, size*0.15);
    ctx.restore();
  },

  // 绘制平台（石砖风格）
  drawPlatform(ctx, x, y, w, h) {
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6b5b4b';
    const bw = 32, bh = 16;
    for (let bx = x; bx < x + w; bx += bw) {
      for (let by = y; by < y + h; by += bh) {
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, Math.min(bw, x + w - bx), Math.min(bh, y + h - by));
      }
    }
    ctx.fillStyle = '#7b6b5b';
    ctx.fillRect(x, y, w, 3);
  },

  // 播放 8bit 音效
  playBeep(freq = 440, duration = 0.1, type = 'square') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }
};
