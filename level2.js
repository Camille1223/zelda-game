// ============================================================
// level2.js — 关卡2: 地牢迷宫（吃豆人风格）
// ============================================================

const Level2 = (() => {
  const W = 800, H = 500;
  const COLS = 25, ROWS = 16;
  const TW = Math.floor(W / COLS);   // 32
  const TH = Math.floor(H / ROWS);   // 31

  // 迷宫地图：0=通道, 1=墙, 2=小碎片, 3=大宝石, 4=空(初始玩家/敌人格)
  const MAP_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,1,3,2,2,1],
    [1,2,1,1,2,2,1,2,1,1,2,1,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,2,1,3,2,2,2,2,1,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,1],
    [1,2,1,1,1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,1,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,2,1,1,1,2,1,1,4,1,1,1,4,1,1,2,1,1,1,2,1,2,1],
    [1,2,2,2,1,3,2,2,1,2,2,2,2,2,2,2,1,2,2,3,1,2,2,2,1],
    [1,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1],
    [1,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,1],
    [1,3,1,2,1,2,1,2,1,1,2,1,1,2,1,2,1,2,1,2,1,2,1,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  let map, player, ghosts, score, frame, powerTimer, keys, moveTimer;
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

  function init() {
    keys = {};
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

    player = { col:12, row:7, dx:0, dy:0, nextDx:0, nextDy:0 };

    ghosts = [
      {col:3,  row:3,  dx:1, dy:0, color:'#e8304a', scared:false, id:0},
      {col:21, row:3,  dx:-1,dy:0, color:'#e88030', scared:false, id:1},
      {col:3,  row:12, dx:0, dy:1, color:'#3080e8', scared:false, id:2},
    ];
    return { type:'level2', done:false };
  }

  function onKeyDown(e) {
    if (DIRS[e.code]) {
      // 立即记录期望方向，不等下一移动帧
      player.nextDx = DIRS[e.code].dx;
      player.nextDy = DIRS[e.code].dy;
      e.preventDefault();
    }
  }
  function onKeyUp(e) { if (DIRS[e.code]) keys[e.code] = false; }

  function canMove(col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
    return map[row][col] !== 1;
  }

  function bfsDir(ghost) {
    const {col, row} = ghost;
    const {col:tc, row:tr} = player;
    if (ghost.scared) {
      // 逃跑：远离玩家
      const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
      const valid = dirs.filter(d => canMove(col+d.dx, row+d.dy) && !(d.dx===-ghost.dx && d.dy===-ghost.dy));
      if (!valid.length) return {dx:0,dy:0};
      valid.sort((a,b)=>{
        const da = Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr);
        const db = Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr);
        return db - da;
      });
      return valid[0];
    }
    // BFS 追玩家（简化，直接走曼哈顿近方向）
    const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
    const valid = dirs.filter(d => canMove(col+d.dx, row+d.dy) && !(d.dx===-ghost.dx && d.dy===-ghost.dy));
    if (!valid.length) return {dx:-ghost.dx, dy:-ghost.dy};
    valid.sort((a,b)=>{
      const da = Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr);
      const db = Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr);
      return da - db;
    });
    return valid[0];
  }

  function update() {
    frame++;
    if (powerTimer > 0) powerTimer--;
    const powered = powerTimer > 0;

    // 更新骷髅scared状态
    ghosts.forEach(g => g.scared = powered);

    // 玩家输入（onKeyDown 已实时更新 nextDx/nextDy，无需再轮询）

    // 每6帧移动一格（比原来8帧更流畅，拐弯响应更快）
    moveTimer++;
    if (moveTimer >= 6) {
      moveTimer = 0;
      // 优先尝试期望方向（拐弯）
      if ((player.nextDx !== player.dx || player.nextDy !== player.dy) &&
          canMove(player.col + player.nextDx, player.row + player.nextDy)) {
        player.dx = player.nextDx;
        player.dy = player.nextDy;
      }
      // 继续当前方向
      if (canMove(player.col + player.dx, player.row + player.dy)) {
        player.col += player.dx;
        player.row += player.dy;
      }

      // 收集
      const cell = map[player.row][player.col];
      if (cell === 2) {
        map[player.row][player.col] = 0;
        score += 20;
        collectedDots++;
        Assets.playBeep(440, 0.04);
      } else if (cell === 3) {
        map[player.row][player.col] = 0;
        score += 80;
        collectedDots++;
        powerTimer = 200;
        ghosts.forEach(g => g.scared = true);
        Assets.playBeep(660, 0.12);
      }

      // 移动骷髅（每16帧）
      // 每6格移动一次（速度更慢）
      if (frame % 6 === 0) {
        for (const g of ghosts) {
          const dir = bfsDir(g);
          if (canMove(g.col + dir.dx, g.row + dir.dy)) {
            g.dx = dir.dx; g.dy = dir.dy;
            g.col += dir.dx; g.row += dir.dy;
          } else {
            const dirs2 = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}]
              .filter(d => canMove(g.col+d.dx, g.row+d.dy));
            if (dirs2.length) {
              const d = dirs2[Math.floor(Math.random()*dirs2.length)];
              g.dx = d.dx; g.dy = d.dy;
              g.col += d.dx; g.row += d.dy;
            }
          }
        }
      }

      // 碰撞检测
      for (const g of ghosts) {
        if (!g.alive && g.alive !== undefined) continue;
        if (g.col === player.col && g.row === player.row) {
          if (g.scared) {
            g.col = g.id === 0 ? 3 : g.id === 1 ? 21 : 3;
            g.row = g.id === 0 ? 3 : g.id === 1 ? 3 : 12;
            g.scared = false;
            score += 100;
            Assets.playBeep(300, 0.15);
          } else {
            Assets.playBeep(200, 0.4, 'sawtooth');
            return { type:'level2', done:true, score, failed:true };
          }
        }
      }
    }

    // 通关：全部碎片收集
    if (collectedDots >= totalDots) {
      Assets.playBeep(880, 0.3);
      return { type:'level2', done:true, score };
    }
    return null;
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);
    // 背景
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0,0,W,H);

    const offX = Math.floor((W - COLS*TW) / 2);
    const offY = Math.floor((H - ROWS*TH) / 2);

    // 地图
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = offX + c*TW, y = offY + r*TH;
        const cell = map[r][c];
        if (cell === 1) {
          // 墙壁（石砖）
          ctx.fillStyle = '#1a1a4a';
          ctx.fillRect(x, y, TW, TH);
          ctx.strokeStyle = '#2a2a6a';
          ctx.lineWidth = 1;
          ctx.strokeRect(x+1, y+1, TW-2, TH-2);
        } else {
          ctx.fillStyle = '#050510';
          ctx.fillRect(x, y, TW, TH);
          if (cell === 2) {
            // 心之碎片
            ctx.fillStyle = '#cc3333';
            ctx.beginPath();
            ctx.arc(x+TW/2, y+TH/2, 3, 0, Math.PI*2);
            ctx.fill();
          } else if (cell === 3) {
            // 大宝石（蓝色闪烁）
            const alpha = 0.6 + Math.sin(frame*0.1)*0.4;
            ctx.fillStyle = `rgba(50,150,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(x+TW/2, y+TH/2, 7, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = `rgba(150,220,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(x+TW/2-2, y+TH/2-2, 3, 0, Math.PI*2);
            ctx.fill();
          }
        }
      }
    }

    // 骷髅怪
    for (const g of ghosts) {
      const px = offX + g.col*TW;
      const py = offY + g.row*TH;
      if (g.scared) {
        // 蓝色逃跑状态
        ctx.fillStyle = powerTimer < 60 && Math.floor(frame/4)%2===0 ? '#aaa' : '#2255cc';
        ctx.beginPath();
        ctx.arc(px+TW/2, py+TH/2-2, TW*0.38, Math.PI, 0, false);
        ctx.lineTo(px+TW*0.9, py+TH*0.9);
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(px+TW*(0.9-i*0.2), py+TH*(0.75 + (i%2)*0.15));
        }
        ctx.lineTo(px+TW*0.1, py+TH*0.9);
        ctx.closePath();
        ctx.fill();
      } else {
        Assets.drawSkeleton(ctx, px+TW*0.1, py+TH*0.05, TW*0.8, TH*0.9, frame);
        ctx.fillStyle = g.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(px+TW/2, py+TH/2, TW*0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // 玩家（Link）
    const px = offX + player.col*TW;
    const py = offY + player.row*TH;
    Assets.drawHero(ctx, px+TW*0.05, py+TH*0.05, TW*0.9, TH*0.9,
      player.dx < 0 ? -1 : 1, Math.floor(frame/6)%2);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, offY);
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${score}`, 10, offY - 6);
    ctx.fillStyle = '#4adf3f';
    ctx.textAlign = 'center';
    ctx.fillText(`心之碎片: ${collectedDots} / ${totalDots}`, W/2, offY - 6);
    ctx.fillStyle = '#ffd700';
    ctx.font = '13px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText('第2关 — 地牢迷宫', W - 10, offY - 6);

    if (powerTimer > 0) {
      ctx.fillStyle = `rgba(50,150,255,${0.5 + Math.sin(frame*0.15)*0.3})`;
      ctx.fillRect(0, H - offY, W, offY);
      ctx.fillStyle = '#88ccff';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(`强力模式！${Math.ceil(powerTimer/60)}s`, W/2, H - 4);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W/2-180, H - offY + 4, 360, 18);
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('WASD/方向键 移动 | 吃大蓝宝石可消灭骷髅', W/2, H - offY + 16);
  }

  return { init, update, draw, onKeyDown, onKeyUp };
})();
