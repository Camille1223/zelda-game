// ============================================================
// level2.js — 关卡2: 糖果迷宫（吃豆人风格）可爱版
// ============================================================

const Level2 = (() => {
  const W = 800, H = 500;

  // 更小的地图：15列 x 13行，格子更大更好走
  const COLS = 15, ROWS = 13;
  const TW = 44, TH = 36;
  const offX = Math.floor((W - COLS*TW) / 2);
  const offY = Math.floor((H - ROWS*TH) / 2);

  // 0=通道, 1=墙, 2=小星星, 3=大糖果, 4=空格
  const MAP_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,1,2,2,2,2,2,1],
    [1,3,1,1,2,2,1,2,1,2,2,1,1,3,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,2,2,1,1,2,4,2,1,1,2,2,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,2,1,4,2,2,2,4,1,2,1,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,2,2,1,1,2,4,2,1,1,2,2,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,3,1,1,2,2,1,2,1,2,2,1,1,3,1],
    [1,2,2,2,2,2,1,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  let map, player, ghosts, score, frame, powerTimer, moveTimer;
  let totalDots, collectedDots;

  const DIRS = {
    ArrowUp:    {dx:0,  dy:-1},
    ArrowDown:  {dx:0,  dy:1},
    ArrowLeft:  {dx:-1, dy:0},
    ArrowRight: {dx:1,  dy:0},
    KeyW: {dx:0, dy:-1},
    KeyS: {dx:0, dy:1},
    KeyA: {dx:-1, dy:0},
    KeyD: {dx:1,  dy:0},
  };

  // 可爱幽灵颜色
  const GHOST_COLORS = ['#ff88bb', '#ffaa44', '#88ddff'];

  function init() {
    frame = 0;
    score = 0;
    powerTimer = 0;
    moveTimer = 0;
    map = MAP_TEMPLATE.map(row => [...row]);

    totalDots = 0;
    collectedDots = 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (map[r][c] === 2 || map[r][c] === 3) totalDots++;

    player = { col:7, row:6, dx:0, dy:0, nextDx:0, nextDy:0 };

    ghosts = [
      {col:1,  row:1,  dx:1,  dy:0, color:GHOST_COLORS[0], scared:false, id:0},
      {col:13, row:1,  dx:-1, dy:0, color:GHOST_COLORS[1], scared:false, id:1},
      {col:7,  row:11, dx:0,  dy:-1,color:GHOST_COLORS[2], scared:false, id:2},
    ];
    return { type:'level2', done:false };
  }

  function onKeyDown(e) {
    if (DIRS[e.code]) {
      player.nextDx = DIRS[e.code].dx;
      player.nextDy = DIRS[e.code].dy;
      e.preventDefault();
    }
  }
  function onKeyUp(e) {}

  function canMove(col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
    return map[row][col] !== 1;
  }

  function ghostDir(ghost) {
    const {col, row} = ghost;
    const {col:tc, row:tr} = player;
    const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
    // 不走回头路
    const valid = dirs.filter(d => canMove(col+d.dx, row+d.dy) && !(d.dx===-ghost.dx && d.dy===-ghost.dy));
    if (!valid.length) return {dx:-ghost.dx||1, dy:-ghost.dy};
    if (ghost.scared) {
      // 逃跑：远离玩家
      valid.sort((a,b) =>
        (Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr)) - (Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr))
      );
    } else {
      // 追玩家，加一点随机性避免死缠
      if (Math.random() < 0.3) return valid[Math.floor(Math.random()*valid.length)];
      valid.sort((a,b) =>
        (Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr)) - (Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr))
      );
    }
    return valid[0];
  }

  function update() {
    frame++;
    if (powerTimer > 0) powerTimer--;
    ghosts.forEach(g => g.scared = powerTimer > 0);

    // 玩家移动（每7帧一格，流畅好操控）
    moveTimer++;
    if (moveTimer >= 7) {
      moveTimer = 0;

      // 优先尝试新方向（拐弯）
      if ((player.nextDx !== player.dx || player.nextDy !== player.dy) &&
          canMove(player.col + player.nextDx, player.row + player.nextDy)) {
        player.dx = player.nextDx;
        player.dy = player.nextDy;
      }
      if (canMove(player.col + player.dx, player.row + player.dy)) {
        player.col += player.dx;
        player.row += player.dy;
      }

      // 收集道具
      const cell = map[player.row][player.col];
      if (cell === 2) {
        map[player.row][player.col] = 0;
        score += 20;
        collectedDots++;
        Assets.playBeep(600 + collectedDots*2, 0.04);
      } else if (cell === 3) {
        map[player.row][player.col] = 0;
        score += 100;
        collectedDots++;
        powerTimer = 250;
        Assets.playBeep(880, 0.15);
      }

      // 幽灵移动（每8帧）
      if (frame % 8 === 0) {
        for (const g of ghosts) {
          const dir = ghostDir(g);
          g.dx = dir.dx; g.dy = dir.dy;
          g.col += dir.dx; g.row += dir.dy;
        }
      }

      // 碰撞
      for (const g of ghosts) {
        if (g.col === player.col && g.row === player.row) {
          if (g.scared) {
            // 被吃掉，回到出生点
            g.col = g.id===0?1 : g.id===1?13 : 7;
            g.row = g.id===0?1 : g.id===1?1 : 11;
            g.scared = false;
            score += 150;
            Assets.playBeep(440, 0.1);
          } else {
            Assets.playBeep(200, 0.4, 'sawtooth');
            return { type:'level2', done:true, score, failed:true };
          }
        }
      }
    }

    // 通关：收集 60% 星星
    if (collectedDots >= Math.ceil(totalDots * 0.6)) {
      Assets.playBeep(880, 0.3);
      return { type:'level2', done:true, score };
    }
    return null;
  }

  // ---- 可爱风绘图 ----

  function drawWall(ctx, x, y) {
    // 粉紫色圆角砖块
    ctx.fillStyle = '#c084fc';
    roundRect(ctx, x+1, y+1, TW-2, TH-2, 6);
    ctx.fill();
    ctx.fillStyle = '#a855f7';
    roundRect(ctx, x+3, y+3, TW-6, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#e9d5ff';
    ctx.globalAlpha = 0.4;
    roundRect(ctx, x+4, y+4, TW-8, 4, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  function drawStar(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI / 5) - Math.PI/2;
      const b = (i * 4 * Math.PI / 5) + Math.PI/5 - Math.PI/2;
      if (i===0) ctx.moveTo(x+Math.cos(a)*r, y+Math.sin(a)*r);
      else ctx.lineTo(x+Math.cos(a)*r, y+Math.sin(a)*r);
      ctx.lineTo(x+Math.cos(b)*(r*0.4), y+Math.sin(b)*(r*0.4));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCandy(ctx, x, y, r) {
    // 大糖果：彩色圆形+闪光
    const alpha = 0.7 + Math.sin(frame*0.15)*0.3;
    ctx.save();
    ctx.shadowColor = '#ff88ff';
    ctx.shadowBlur = 12;
    const g = ctx.createRadialGradient(x-r*0.3, y-r*0.3, r*0.1, x, y, r);
    g.addColorStop(0, `rgba(255,200,255,${alpha})`);
    g.addColorStop(0.5, `rgba(255,100,200,${alpha})`);
    g.addColorStop(1, `rgba(180,0,150,${alpha})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x-r*0.3, y-r*0.3, r*0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawGhost(ctx, g) {
    const x = offX + g.col*TW + TW/2;
    const y = offY + g.row*TH + TH/2;
    const r = TW*0.38;
    const bounce = Math.sin(frame*0.15 + g.id)*2;

    ctx.save();
    if (g.scared) {
      const flicker = powerTimer < 80 && Math.floor(frame/5)%2===0;
      ctx.fillStyle = flicker ? '#ffffff' : '#6699ff';
      ctx.shadowColor = '#6699ff';
    } else {
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color;
    }
    ctx.shadowBlur = 10;

    // 身体（圆顶+波浪底）
    ctx.beginPath();
    ctx.arc(x, y-2+bounce, r, Math.PI, 0, false);
    ctx.lineTo(x+r, y+r*0.8+bounce);
    const waves = 3;
    for (let i = waves; i >= 0; i--) {
      const wx = x + r - (i+0.5)*(r*2/waves);
      const wy = y + r*0.8 + (i%2===0 ? r*0.18 : -r*0.18) + bounce;
      ctx.quadraticCurveTo(wx, wy, x + r - i*(r*2/waves), y+r*0.8+bounce);
    }
    ctx.closePath();
    ctx.fill();

    // 眼睛
    if (!g.scared) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x-r*0.3, y-r*0.1+bounce, r*0.22, r*0.28, 0, 0, Math.PI*2);
      ctx.ellipse(x+r*0.3, y-r*0.1+bounce, r*0.22, r*0.28, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(x-r*0.25, y-r*0.05+bounce, r*0.12, 0, Math.PI*2);
      ctx.arc(x+r*0.35, y-r*0.05+bounce, r*0.12, 0, Math.PI*2);
      ctx.fill();
    } else {
      // X眼（被吓到）
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x-r*0.42, y-r*0.25+bounce); ctx.lineTo(x-r*0.18, y+bounce);
      ctx.moveTo(x-r*0.18, y-r*0.25+bounce); ctx.lineTo(x-r*0.42, y+bounce);
      ctx.moveTo(x+r*0.18, y-r*0.25+bounce); ctx.lineTo(x+r*0.42, y+bounce);
      ctx.moveTo(x+r*0.42, y-r*0.25+bounce); ctx.lineTo(x+r*0.18, y+bounce);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer(ctx) {
    const x = offX + player.col*TW + TW/2;
    const y = offY + player.row*TH + TH/2;
    const r = TW*0.38;
    const mouthAngle = 0.25 + Math.abs(Math.sin(frame*0.25))*0.35;

    // 身体（黄色小精灵）
    ctx.save();
    const g = ctx.createRadialGradient(x-r*0.2, y-r*0.2, r*0.1, x, y, r);
    g.addColorStop(0, '#fff176');
    g.addColorStop(0.6, '#ffd700');
    g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;

    let startAngle = mouthAngle;
    let endAngle = Math.PI*2 - mouthAngle;
    // 根据方向旋转嘴巴
    const rot = player.dx < 0 ? Math.PI : player.dy < 0 ? -Math.PI/2 : player.dy > 0 ? Math.PI/2 : 0;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(r*0.1, -r*0.5, r*0.12, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);

    // 可爱粉色渐变背景
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0, '#fce7f3');
    bg.addColorStop(1, '#ede9fe');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    // 背景装饰小点
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i%2===0 ? '#f9a8d4' : '#c4b5fd';
      ctx.beginPath();
      ctx.arc((i*137)%W, (i*97)%H, 8+i%5*3, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 地图
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = offX + c*TW, y = offY + r*TH;
        const cell = map[r][c];
        if (cell === 1) {
          drawWall(ctx, x, y);
        } else {
          // 通道底色
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          roundRect(ctx, x+1, y+1, TW-2, TH-2, 4);
          ctx.fill();
          if (cell === 2) {
            // 小星星
            drawStar(ctx, x+TW/2, y+TH/2, 5, '#f472b6');
          } else if (cell === 3) {
            // 大糖果
            drawCandy(ctx, x+TW/2, y+TH/2, 10);
          }
        }
      }
    }

    // 幽灵
    for (const g of ghosts) drawGhost(ctx, g);

    // 玩家
    drawPlayer(ctx);

    // HUD 顶部
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, 0, 0, W, offY, 0);
    ctx.fill();

    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`✨ 分数: ${score}`, 12, offY - 8);

    const target = Math.ceil(totalDots * 0.6);
    ctx.fillStyle = '#db2777';
    ctx.textAlign = 'center';
    ctx.fillText(`⭐ ${collectedDots} / ${target}  (集满过关)`, W/2, offY - 8);

    ctx.fillStyle = '#7c3aed';
    ctx.textAlign = 'right';
    ctx.fillText('第2关 — 糖果迷宫', W-12, offY - 8);

    // 进度条
    const barW = W - 24;
    ctx.fillStyle = '#e9d5ff';
    roundRect(ctx, 12, offY - 6, barW, 4, 2); ctx.fill();
    ctx.fillStyle = '#a855f7';
    roundRect(ctx, 12, offY - 6, barW * Math.min(collectedDots/target, 1), 4, 2); ctx.fill();

    // 强力模式提示
    if (powerTimer > 0) {
      ctx.fillStyle = `rgba(168,85,247,${0.15 + Math.sin(frame*0.15)*0.08})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 13px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(`💫 强力模式 ${Math.ceil(powerTimer/60)}s！去吃幽灵！`, W/2, H - offY + 14);
    }

    // 底部操作提示
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(0, H - offY, W, offY);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('方向键 / WASD 移动  |  吃大糖果可以反击幽灵', W/2, H - offY + 14);
  }

  return { init, update, draw, onKeyDown, onKeyUp };
})();
