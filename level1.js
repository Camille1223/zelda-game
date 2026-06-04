// ============================================================
// level1.js — 关卡1: 绿野大地（横版平台跳跃）
// ============================================================

const Level1 = (() => {
  const W = 800, H = 500;
  const GRAVITY = 0.5, JUMP_FORCE = -11, SPEED = 3.5;
  const TILE = 32;
  const WORLD_W = 3200;

  let state, keys, cameraX, frame, score, hp, maxHp;

  const platforms = [
    // 地面段
    {x:0,    y:440, w:400,  h:60},
    {x:450,  y:440, w:200,  h:60},
    {x:700,  y:440, w:300,  h:60},
    {x:1050, y:440, w:150,  h:60},
    {x:1300, y:440, w:400,  h:60},
    {x:1800, y:440, w:300,  h:60},
    {x:2200, y:440, w:400,  h:60},
    {x:2700, y:440, w:300,  h:60},
    {x:3050, y:440, w:200,  h:60},
    // 高台
    {x:120,  y:360, w:100, h:20},
    {x:320,  y:300, w:80,  h:20},
    {x:550,  y:350, w:80,  h:20},
    {x:750,  y:310, w:80,  h:20},
    {x:900,  y:380, w:100, h:20},
    {x:1100, y:340, w:80,  h:20},
    {x:1380, y:370, w:80,  h:20},
    {x:1550, y:310, w:80,  h:20},
    {x:1700, y:360, w:100, h:20},
    {x:1900, y:340, w:80,  h:20},
    {x:2050, y:380, w:80,  h:20},
    {x:2300, y:360, w:80,  h:20},
    {x:2450, y:300, w:80,  h:20},
    {x:2600, y:360, w:100, h:20},
    {x:2800, y:380, w:80,  h:20},
    {x:2950, y:330, w:80,  h:20},
    {x:3100, y:380, w:80,  h:20},
  ];

  const rubies = [
    {x:140,y:340,w:12,h:16},{x:200,y:420,w:12,h:16},{x:340,y:280,w:12,h:16},
    {x:560,y:330,w:12,h:16},{x:760,y:290,w:12,h:16},{x:820,y:420,w:12,h:16},
    {x:920,y:360,w:12,h:16},{x:1000,y:420,w:12,h:16},{x:1120,y:320,w:12,h:16},
    {x:1200,y:420,w:12,h:16},{x:1400,y:350,w:12,h:16},{x:1480,y:420,w:12,h:16},
    {x:1570,y:290,w:12,h:16},{x:1720,y:340,w:12,h:16},{x:1820,y:420,w:12,h:16},
    {x:1920,y:320,w:12,h:16},{x:2070,y:360,w:12,h:16},{x:2150,y:420,w:12,h:16},
    {x:2320,y:340,w:12,h:16},{x:2470,y:280,w:12,h:16},{x:2620,y:340,w:12,h:16},
    {x:2720,y:420,w:12,h:16},{x:2820,y:360,w:12,h:16},{x:2970,y:310,w:12,h:16},
  ].map(r => ({...r, collected: false}));

  const enemies = [
    {x:600,y:410,w:28,h:28,vx:1.2},
    {x:900,y:410,w:28,h:28,vx:-1.0},
    {x:1200,y:410,w:28,h:28,vx:1.5},
    {x:1500,y:410,w:28,h:28,vx:-1.2},
    {x:1900,y:410,w:28,h:28,vx:1.0},
    {x:2300,y:410,w:28,h:28,vx:-1.4},
    {x:2700,y:410,w:28,h:28,vx:1.2},
    {x:2950,y:410,w:28,h:28,vx:-1.0},
  ].map(e => ({...e, alive:true, left:e.x-60, right:e.x+60}));

  const portal = {x: 3120, y: 380, w: 50, h: 60};

  let player;

  function init() {
    keys = {};
    cameraX = 0;
    frame = 0;
    score = 0;
    hp = 3; maxHp = 3;
    rubies.forEach(r => r.collected = false);
    enemies.forEach(e => e.alive = true);
    player = {
      x: 50, y: 380, w: 24, h: 32,
      vx: 0, vy: 0,
      onGround: false,
      dir: 1,
      invincible: 0,
      walkFrame: 0
    };
    return { type: 'level1', done: false };
  }

  function onKeyDown(e) { keys[e.code] = true; }
  function onKeyUp(e)   { keys[e.code] = false; }

  function rectsOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function update() {
    frame++;
    if (player.invincible > 0) player.invincible--;

    // 移动
    const left  = keys['ArrowLeft']  || keys['KeyA'];
    const right = keys['ArrowRight'] || keys['KeyD'];
    const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['Space'];

    if (left)  { player.vx = -SPEED; player.dir = -1; }
    else if (right) { player.vx = SPEED; player.dir = 1; }
    else player.vx = 0;

    if (jump && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      Assets.playBeep(520, 0.08);
    }

    // 行走帧
    if ((left || right) && player.onGround) {
      if (frame % 8 === 0) player.walkFrame ^= 1;
    }

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;
    player.onGround = false;

    // 平台碰撞
    for (const p of platforms) {
      if (rectsOverlap(player, p)) {
        const overlapX = Math.min(player.x+player.w, p.x+p.w) - Math.max(player.x, p.x);
        const overlapY = Math.min(player.y+player.h, p.y+p.h) - Math.max(player.y, p.y);
        if (overlapY < overlapX) {
          if (player.vy > 0 && player.y + player.h - player.vy <= p.y + 2) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
          } else if (player.vy < 0) {
            player.y = p.y + p.h;
            player.vy = 0;
          }
        } else {
          if (player.vx > 0) player.x = p.x - player.w;
          else player.x = p.x + p.w;
          player.vx = 0;
        }
      }
    }

    // 边界
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > WORLD_W) player.x = WORLD_W - player.w;
    if (player.y > H + 50) { hp--; player.x = 50; player.y = 380; Assets.playBeep(200, 0.3); }

    // 摄像机
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W/3));

    // 卢比收集
    for (const r of rubies) {
      if (!r.collected && rectsOverlap(player, r)) {
        r.collected = true;
        score += 10;
        Assets.playBeep(660, 0.08);
      }
    }

    // 敌人逻辑 & 碰撞
    for (const e of enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x < e.left || e.x + e.w > e.right) e.vx *= -1;
      if (rectsOverlap(player, e) && player.invincible <= 0) {
        // 从上方踩死
        if (player.vy > 0 && player.y + player.h - player.vy < e.y + e.h/2) {
          e.alive = false;
          score += 30;
          player.vy = -8;
          Assets.playBeep(300, 0.15);
        } else {
          hp--;
          player.invincible = 90;
          Assets.playBeep(200, 0.3, 'sawtooth');
        }
      }
    }

    // 传送门
    if (rectsOverlap(player, portal)) {
      score += hp * 50;
      Assets.playBeep(880, 0.3);
      return { type:'level1', done: true, score };
    }
    if (hp <= 0) return { type:'level1', done:true, score, failed:true };
    return null;
  }

  function drawBg(ctx, cam) {
    // 天空
    const sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#1a3a5c');
    sky.addColorStop(1,'#2d6b2d');
    ctx.fillStyle = sky;
    ctx.fillRect(0,0,W,H);

    // 远山
    ctx.fillStyle = '#1a4a1a';
    for (let i = 0; i < 8; i++) {
      const mx = (i*500 - cam*0.2) % (W+200) - 100;
      ctx.beginPath();
      ctx.moveTo(mx, H-60);
      ctx.lineTo(mx+120, H-200);
      ctx.lineTo(mx+240, H-60);
      ctx.closePath();
      ctx.fill();
    }
    // 近树
    ctx.fillStyle = '#0d3d0d';
    for (let i = 0; i < 12; i++) {
      const tx = (i*280 - cam*0.5) % (W+100) - 50;
      ctx.fillRect(tx+30, H-120, 14, 60);
      ctx.beginPath();
      ctx.moveTo(tx, H-100);
      ctx.lineTo(tx+37, H-180);
      ctx.lineTo(tx+74, H-100);
      ctx.closePath();
      ctx.fill();
    }
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);
    drawBg(ctx, cameraX);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // 平台
    for (const p of platforms) {
      if (p.x + p.w < cameraX - 10 || p.x > cameraX + W + 10) continue;
      Assets.drawPlatform(ctx, p.x, p.y, p.w, p.h);
    }

    // 卢比
    for (const r of rubies) {
      if (r.collected) continue;
      if (r.x < cameraX-20 || r.x > cameraX+W+20) continue;
      Assets.drawRuby(ctx, r.x, r.y, r.w);
    }

    // 敌人
    for (const e of enemies) {
      if (!e.alive) continue;
      if (e.x < cameraX-40 || e.x > cameraX+W+40) continue;
      Assets.drawBlin(ctx, e.x, e.y, e.w, e.h, frame);
    }

    // 传送门
    Assets.drawPortal(ctx, portal.x, portal.y, portal.w, portal.h, frame);
    ctx.fillStyle = '#88eeff';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('终点', portal.x + portal.w/2, portal.y - 6);

    // 玩家（闪烁无敌时）
    if (player.invincible <= 0 || Math.floor(frame/4) % 2 === 0) {
      Assets.drawHero(ctx, player.x, player.y, player.w, player.h, player.dir, player.walkFrame);
    }

    ctx.restore();

    // HUD
    drawHUD(ctx);
  }

  function drawHUD(ctx) {
    // 血量（心形）
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 8, 80, 26);
    for (let i = 0; i < maxHp; i++) {
      Assets.drawHeart(ctx, 12 + i*22, 12, 16, i < hp);
    }
    // 卢比计数
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 40, 90, 22);
    Assets.drawRuby(ctx, 12, 43, 12);
    ctx.fillStyle = '#4adf3f';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`x ${rubies.filter(r=>r.collected).length}`, 28, 57);
    // 分数
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W-120, 8, 112, 22);
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'right';
    ctx.fillText(`分数: ${score}`, W-10, 24);
    // 操作提示
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(W/2-140, 8, 280, 20);
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('←→/WASD 移动  空格/↑ 跳跃  踩怪消灭敌人', W/2, 21);
    // 关卡标题
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W/2-80, H-30, 160, 22);
    ctx.fillStyle = '#ffd700';
    ctx.font = '13px Courier New';
    ctx.fillText('第1关 — 绿野大地', W/2, H-14);
  }

  return { init, update, draw, onKeyDown, onKeyUp };
})();
