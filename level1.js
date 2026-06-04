// ============================================================
// level1.js — 关卡1: 彩虹王国（卡通2D平台跳跃）
// ============================================================

const Level1 = (() => {
  const W = 800, H = 500;
  const GRAVITY = 0.55;
  const JUMP_FORCE = -12;
  const SPEED = 3.8;
  const WORLD_W = 3200;

  let state, keys, cameraX, frame, score, hp, maxHp, player;

  // 平台：彩色圆润砖块
  const platforms = [
    // 地面
    {x:0,    y:440, w:420,  h:60, color:'#4ade80'},
    {x:470,  y:440, w:220,  h:60, color:'#4ade80'},
    {x:740,  y:440, w:280,  h:60, color:'#4ade80'},
    {x:1070, y:440, w:180,  h:60, color:'#4ade80'},
    {x:1300, y:440, w:380,  h:60, color:'#4ade80'},
    {x:1750, y:440, w:320,  h:60, color:'#4ade80'},
    {x:2150, y:440, w:380,  h:60, color:'#4ade80'},
    {x:2620, y:440, w:300,  h:60, color:'#4ade80'},
    {x:3000, y:440, w:220,  h:60, color:'#4ade80'},
    // 浮空台
    {x:100,  y:360, w:100, h:18, color:'#fb923c'},
    {x:300,  y:310, w:80,  h:18, color:'#facc15'},
    {x:510,  y:360, w:90,  h:18, color:'#f472b6'},
    {x:700,  y:315, w:80,  h:18, color:'#a78bfa'},
    {x:860,  y:370, w:100, h:18, color:'#34d399'},
    {x:1090, y:345, w:80,  h:18, color:'#fb923c'},
    {x:1350, y:375, w:80,  h:18, color:'#facc15'},
    {x:1500, y:320, w:80,  h:18, color:'#f472b6'},
    {x:1660, y:365, w:100, h:18, color:'#60a5fa'},
    {x:1870, y:345, w:80,  h:18, color:'#a78bfa'},
    {x:2000, y:385, w:80,  h:18, color:'#34d399'},
    {x:2250, y:360, w:80,  h:18, color:'#fb923c'},
    {x:2390, y:305, w:80,  h:18, color:'#facc15'},
    {x:2530, y:360, w:90,  h:18, color:'#f472b6'},
    {x:2750, y:380, w:80,  h:18, color:'#60a5fa'},
    {x:2880, y:335, w:80,  h:18, color:'#a78bfa'},
    {x:3030, y:375, w:80,  h:18, color:'#34d399'},
  ];

  const coins = [
    {x:120,y:335},{x:180,y:335},{x:315,y:285},{x:375,y:285},
    {x:525,y:335},{x:580,y:415},{x:715,y:290},{x:780,y:415},
    {x:875,y:345},{x:940,y:415},{x:1105,y:320},{x:1170,y:415},
    {x:1365,y:350},{x:1430,y:415},{x:1515,y:295},{x:1590,y:415},
    {x:1675,y:340},{x:1740,y:415},{x:1885,y:320},{x:1960,y:415},
    {x:2015,y:360},{x:2080,y:415},{x:2265,y:335},{x:2330,y:415},
    {x:2405,y:280},{x:2480,y:415},{x:2545,y:335},{x:2620,y:415},
    {x:2765,y:355},{x:2895,y:310},{x:3045,y:350},
  ].map(c => ({...c, w:16, h:16, collected:false}));

  const enemies = [
    {x:560, y:412, left:510, right:650},
    {x:900, y:412, left:760, right:1010},
    {x:1180,y:412, left:1090,right:1240},
    {x:1430,y:412, left:1320,right:1640},
    {x:1820,y:412, left:1770,right:2050},
    {x:2300,y:412, left:2170,right:2510},
    {x:2680,y:412, left:2640,right:2900},
    {x:3060,y:412, left:3010,right:3200},
  ].map((e,i) => ({...e, w:30, h:30, vx:1.2+i*0.1, alive:true, frame:0}));

  const portal = {x:3130, y:380, w:52, h:60};

  function init() {
    keys = {};
    cameraX = 0; frame = 0; score = 0;
    hp = 3; maxHp = 3;
    coins.forEach(c => c.collected = false);
    enemies.forEach(e => { e.alive = true; e.x = e.left + 60; });
    player = {x:50, y:380, w:28, h:34, vx:0, vy:0, onGround:false, dir:1, invincible:0, walkFrame:0};
    return {type:'level1', done:false};
  }

  function onKeyDown(e) { keys[e.code] = true; }
  function onKeyUp(e)   { keys[e.code] = false; }

  function rectsOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function update() {
    frame++;
    if (player.invincible > 0) player.invincible--;

    const left  = keys['ArrowLeft']  || keys['KeyA'];
    const right = keys['ArrowRight'] || keys['KeyD'];
    const jump  = keys['ArrowUp']    || keys['KeyW'] || keys['Space'];

    if (left)       { player.vx = -SPEED; player.dir = -1; }
    else if (right) { player.vx = SPEED;  player.dir = 1;  }
    else player.vx = 0;

    if (jump && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      Assets.playBeep(560, 0.07);
    }
    if ((left||right) && player.onGround && frame%7===0) player.walkFrame ^= 1;

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;
    player.onGround = false;

    for (const p of platforms) {
      if (!rectsOverlap(player, p)) continue;
      const ox = Math.min(player.x+player.w, p.x+p.w) - Math.max(player.x, p.x);
      const oy = Math.min(player.y+player.h, p.y+p.h) - Math.max(player.y, p.y);
      if (oy < ox) {
        if (player.vy >= 0 && player.y+player.h - player.vy <= p.y+4) {
          player.y = p.y - player.h; player.vy = 0; player.onGround = true;
        } else if (player.vy < 0) { player.y = p.y+p.h; player.vy = 0; }
      } else {
        player.x = player.vx > 0 ? p.x-player.w : p.x+p.w; player.vx = 0;
      }
    }

    if (player.x < 0) player.x = 0;
    if (player.x+player.w > WORLD_W) player.x = WORLD_W-player.w;
    if (player.y > H+60) { hp--; Assets.playBeep(220,0.3); player.x=50; player.y=380; player.vy=0; }

    cameraX = Math.max(0, Math.min(WORLD_W-W, player.x - W/3));

    for (const c of coins) {
      if (!c.collected && rectsOverlap(player, c)) {
        c.collected = true; score += 10; Assets.playBeep(700,0.07);
      }
    }

    for (const e of enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      e.frame++;
      if (e.x < e.left || e.x+e.w > e.right) e.vx *= -1;
      if (rectsOverlap(player, e) && player.invincible<=0) {
        if (player.vy>0 && player.y+player.h - player.vy < e.y+e.h*0.5) {
          e.alive=false; score+=50; player.vy=-9; Assets.playBeep(330,0.1);
        } else {
          hp--; player.invincible=80; Assets.playBeep(220,0.25,'sawtooth');
        }
      }
    }

    if (rectsOverlap(player, portal)) {
      score += hp*50;
      return {type:'level1', done:true, score};
    }
    if (hp<=0) return {type:'level1', done:true, score, failed:true};
    return null;
  }

  // ---- 绘图 ----

  function drawBg(ctx, cam) {
    // 渐变天空
    const sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#bfdbfe');
    sky.addColorStop(0.6,'#e0f2fe');
    sky.addColorStop(1,'#bbf7d0');
    ctx.fillStyle = sky;
    ctx.fillRect(0,0,W,H);

    // 白云
    const clouds = [
      {x:120,y:60,s:1},{x:350,y:40,s:0.8},{x:600,y:80,s:1.1},
      {x:900,y:50,s:0.9},{x:1150,y:70,s:1},{x:1400,y:45,s:0.85},
    ];
    for (const cl of clouds) {
      const cx = ((cl.x - cam*0.25) % (W+200) + W+200) % (W+200) - 100;
      drawCloud(ctx, cx, cl.y, cl.s);
    }

    // 远山（绿色圆丘）
    ctx.fillStyle = '#86efac';
    for (let i=0;i<6;i++){
      const mx = ((i*500-cam*0.15)%(W+300)+W+300)%(W+300)-150;
      ctx.beginPath();
      ctx.ellipse(mx, H-20, 180, 120, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = '#4ade80';
    for (let i=0;i<8;i++){
      const mx = ((i*380-cam*0.3)%(W+200)+W+200)%(W+200)-100;
      ctx.beginPath();
      ctx.ellipse(mx, H-10, 120, 80, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  function drawCloud(ctx, x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(x,    y,    50*s, 28*s, 0,0,Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x+40*s, y-8*s, 38*s, 24*s, 0,0,Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x-30*s, y-4*s, 32*s, 20*s, 0,0,Math.PI*2); ctx.fill();
  }

  function drawPlatformCartoon(ctx, p) {
    const r = 10;
    // 主体
    ctx.fillStyle = p.color;
    roundRect(ctx, p.x, p.y, p.w, p.h, r);
    ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, p.x+4, p.y+3, p.w-8, p.h*0.35, r-4);
    ctx.fill();
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    roundRect(ctx, p.x+4, p.y+p.h-6, p.w-8, 4, 3);
    ctx.fill();
    // 地面砖块纹理
    if (p.h > 20) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let bx = p.x+32; bx < p.x+p.w; bx+=32) {
        ctx.beginPath(); ctx.moveTo(bx, p.y); ctx.lineTo(bx, p.y+p.h); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(p.x, p.y+p.h*0.4); ctx.lineTo(p.x+p.w, p.y+p.h*0.4); ctx.stroke();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y, x+w,y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w,y+h, x+w-r,y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,y+h, x,y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,y, x+r,y);
    ctx.closePath();
  }

  function drawCoin(ctx, c) {
    const pulse = 1 + Math.sin(frame*0.12 + c.x*0.01)*0.12;
    ctx.save();
    ctx.translate(c.x+c.w/2, c.y+c.h/2);
    ctx.scale(pulse, pulse);
    // 金币
    const g = ctx.createRadialGradient(-3,-3,1,0,0,c.w/2);
    g.addColorStop(0,'#fef08a'); g.addColorStop(0.5,'#facc15'); g.addColorStop(1,'#ca8a04');
    ctx.fillStyle = g;
    ctx.shadowColor = '#facc15'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0,0,c.w/2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fef9c3';
    ctx.font = `bold ${c.w*0.55}px Arial`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('★',0,1);
    ctx.restore();
  }

  function drawEnemy(ctx, e) {
    const x=e.x, y=e.y, s=e.w;
    const bounce = Math.sin(e.frame*0.18)*2;
    ctx.save();
    if (e.vx < 0) { ctx.translate(x+s, y+bounce); ctx.scale(-1,1); ctx.translate(-s,0); }
    else ctx.translate(x, y+bounce);

    // 身体（蘑菇怪）
    ctx.fillStyle = '#f87171';
    ctx.beginPath(); ctx.ellipse(s/2, s*0.65, s*0.48, s*0.38, 0,0,Math.PI*2); ctx.fill();
    // 帽子
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.ellipse(s/2, s*0.35, s*0.5, s*0.42, 0,0,Math.PI*2); ctx.fill();
    // 帽檐
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.ellipse(s/2, s*0.56, s*0.55, s*0.12, 0,0,Math.PI*2); ctx.fill();
    // 白点
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.3, s*0.25, s*0.1, 0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.65, s*0.2, s*0.07, 0,Math.PI*2); ctx.fill();
    // 眼睛
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.arc(s*0.35, s*0.6, s*0.08, 0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.65, s*0.6, s*0.08, 0,Math.PI*2); ctx.fill();
    // 眉毛（凶）
    ctx.strokeStyle='#1c1917'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(s*0.25,s*0.5); ctx.lineTo(s*0.45,s*0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.75,s*0.5); ctx.lineTo(s*0.55,s*0.55); ctx.stroke();
    ctx.restore();
  }

  function drawHero(ctx) {
    const p = player;
    const s = p.w;
    ctx.save();
    if (p.invincible>0 && Math.floor(frame/4)%2===0) { ctx.restore(); return; }
    ctx.translate(p.x, p.y);
    if (p.dir<0) { ctx.translate(s,0); ctx.scale(-1,1); }

    // 身体（可爱2D角色）
    // 帽子
    ctx.fillStyle = '#dc2626';
    roundRect(ctx, 2, 0, s-4, 10, 4); ctx.fill();
    ctx.fillStyle = '#dc2626';
    roundRect(ctx, -2, 8, s+4, 6, 3); ctx.fill();
    // 脸
    ctx.fillStyle = '#fcd34d';
    roundRect(ctx, 3, 13, s-6, 12, 5); ctx.fill();
    // 眼睛
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.arc(s*0.28, 18, 2.5, 0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s*0.65, 18, 2.5, 0,Math.PI*2); ctx.fill();
    // 胡子（马里奥风）
    ctx.fillStyle = '#92400e';
    ctx.beginPath(); ctx.ellipse(s/2, 22, s*0.32, 4, 0,0,Math.PI*2); ctx.fill();
    // 身体
    ctx.fillStyle = '#2563eb';
    roundRect(ctx, 2, 24, s-4, 10, 4); ctx.fill();
    // 背带
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(s*0.3, 25, 4, 10);
    ctx.fillRect(s*0.58, 25, 4, 10);
    // 腿
    const legL = p.onGround ? (p.walkFrame?-3:3) : 0;
    ctx.fillStyle = '#92400e';
    roundRect(ctx, 2, 33, s*0.4, 7-legL, 3); ctx.fill();
    roundRect(ctx, s*0.48, 33, s*0.44, 7+legL, 3); ctx.fill();
    // 鞋
    ctx.fillStyle = '#1c1917';
    roundRect(ctx, 0, 38-legL, s*0.42+2, 5, 3); ctx.fill();
    roundRect(ctx, s*0.46, 38+legL, s*0.46+2, 5, 3); ctx.fill();
    ctx.restore();
  }

  function drawPortalCartoon(ctx, p) {
    const cx=p.x+p.w/2, cy=p.y+p.h/2;
    const pulse = 1+Math.sin(frame*0.08)*0.06;
    ctx.save();
    // 外圈光晕
    for (let i=3;i>0;i--) {
      ctx.globalAlpha = 0.08*i;
      ctx.fillStyle='#818cf8';
      ctx.beginPath(); ctx.ellipse(cx,cy,p.w*0.6*pulse+i*8,p.h*0.6*pulse+i*8,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    // 主体
    const g=ctx.createRadialGradient(cx,cy,4,cx,cy,p.w*0.55);
    g.addColorStop(0,'#e0e7ff'); g.addColorStop(0.4,'#818cf8'); g.addColorStop(1,'#4338ca');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(cx,cy,p.w*0.55*pulse,p.h*0.55*pulse,0,0,Math.PI*2); ctx.fill();
    // 旋转星星
    for (let i=0;i<6;i++){
      const a=frame*0.04+i*Math.PI/3;
      const px2=cx+Math.cos(a)*p.w*0.5, py2=cy+Math.sin(a)*p.h*0.5;
      ctx.fillStyle='#fef08a'; ctx.shadowColor='#fef08a'; ctx.shadowBlur=6;
      ctx.beginPath(); ctx.arc(px2,py2,3,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    ctx.fillStyle='#fff'; ctx.font='bold 12px Arial'; ctx.textAlign='center';
    ctx.fillText('GOAL',cx,cy+4);
    ctx.restore();
  }

  function drawHUD(ctx) {
    // 顶部半透明条
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.fillRect(0,0,W,36);
    // 血量
    for (let i=0;i<maxHp;i++) {
      const hx=10+i*26, hy=8;
      ctx.font='20px Arial'; ctx.textAlign='left';
      ctx.fillText(i<hp?'❤️':'🖤', hx, hy+18);
    }
    // 分数
    ctx.fillStyle='#7c3aed'; ctx.font='bold 15px Arial'; ctx.textAlign='center';
    ctx.fillText(`⭐ ${score}`, W/2, 24);
    // 标题
    ctx.fillStyle='#059669'; ctx.textAlign='right';
    ctx.fillText('第1关 — 彩虹王国', W-10, 24);
    // 操作提示
    ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,W,0);
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);
    drawBg(ctx, cameraX);
    ctx.save(); ctx.translate(-cameraX,0);

    for (const p of platforms) {
      if (p.x+p.w < cameraX-10 || p.x > cameraX+W+10) continue;
      drawPlatformCartoon(ctx, p);
    }
    for (const c of coins) {
      if (c.collected) continue;
      if (c.x < cameraX-20 || c.x > cameraX+W+20) continue;
      drawCoin(ctx, c);
    }
    for (const e of enemies) {
      if (!e.alive) continue;
      if (e.x < cameraX-40 || e.x > cameraX+W+40) continue;
      drawEnemy(ctx, e);
    }
    drawPortalCartoon(ctx, portal);
    drawHero(ctx);
    ctx.restore();
    drawHUD(ctx);
  }

  return {init, update, draw, onKeyDown, onKeyUp};
})();
