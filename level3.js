// ============================================================
// level3.js — 关卡3: 魔塔圣地（RPG 策略）
// ============================================================

const Level3 = (() => {
  const W = 800, H = 500;
  const COLS = 9, ROWS = 11;
  const TW = 56, TH = 42;
  const MAP_OFFX = Math.floor((W - COLS*TW) / 2);
  const MAP_OFFY = 30;

  // 格子类型
  const T = { EMPTY:0, WALL:1, ENEMY:2, BOSS:3, CHEST:4, KEY:5, DOOR:6, STAIR:7, PLAYER:8 };

  // 三层地图
  const FLOORS = [
    // 第1层
    [
      [1,1,1,1,1,1,1,1,1],
      [1,0,2,0,0,0,2,0,1],
      [1,0,1,1,0,1,1,0,1],
      [1,0,4,0,0,0,4,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,0,5,0,0,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,2,0,0,6,0,0,2,1],
      [1,0,1,1,0,1,1,0,1],
      [1,0,0,0,7,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    // 第2层
    [
      [1,1,1,1,1,1,1,1,1],
      [1,0,2,0,2,0,2,0,1],
      [1,0,1,1,0,1,1,0,1],
      [1,4,0,0,0,0,0,4,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,0,5,0,5,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,2,0,0,6,0,0,2,1],
      [1,0,1,1,0,1,1,0,1],
      [1,0,0,0,7,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    // 第3层（有BOSS）
    [
      [1,1,1,1,1,1,1,1,1],
      [1,0,2,0,3,0,2,0,1],
      [1,0,1,1,0,1,1,0,1],
      [1,4,0,0,0,0,0,4,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,0,5,0,5,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,2,0,6,0,6,0,2,1],
      [1,0,1,1,0,1,1,0,1],
      [1,0,0,0,7,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
  ];

  // 敌人属性（按楼层）
  const ENEMY_STATS = [
    [{name:'骷髅兵',   hp:20, atk:8,  def:2, exp:30, color:'#aaa'}],
    [{name:'暗影卫兵', hp:35, atk:14, def:5, exp:60, color:'#7755aa'}],
    [{name:'魔法师',   hp:25, atk:18, def:3, exp:80, color:'#5599ff'},
     {name:'BOSS·魔王',hp:120,atk:22, def:8, exp:300,color:'#ff3333'}],
  ];

  const CHEST_REWARDS = [
    {hp:30, atk:3,  def:2,  text:'+30HP  +3ATK  +2DEF'},
    {hp:20, atk:5,  def:3,  text:'+20HP  +5ATK  +3DEF'},
    {hp:50, atk:8,  def:5,  text:'+50HP  +8ATK  +5DEF'},
  ];

  let floor, map, player, entities, keys, score;
  let message, msgTimer, battleAnim, frame, cleared;

  function init() {
    floor = 0;
    score = 0;
    frame = 0;
    message = '';
    msgTimer = 0;
    battleAnim = null;
    cleared = false;
    keys = {};
    player = { col:4, row:9, hp:100, maxHp:100, atk:15, def:5, keys:0 };
    loadFloor(0);
    return { type:'level3', done:false };
  }

  function loadFloor(f) {
    floor = f;
    map = FLOORS[f].map(row => [...row]);
    entities = {};
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = map[r][c];
        if (t === T.ENEMY) {
          const stats = ENEMY_STATS[f][0];
          entities[`${r}_${c}`] = { type:'enemy', ...stats, col:c, row:r };
        } else if (t === T.BOSS) {
          const stats = ENEMY_STATS[f].find(e => e.name.startsWith('BOSS')) || ENEMY_STATS[f][0];
          entities[`${r}_${c}`] = { type:'boss', ...stats, col:c, row:r };
        } else if (t === T.CHEST) {
          entities[`${r}_${c}`] = { type:'chest', ...CHEST_REWARDS[f], col:c, row:r };
        } else if (t === T.KEY) {
          entities[`${r}_${c}`] = { type:'key', col:c, row:r };
        }
      }
    }
    // 玩家出生在楼梯位置正上方的通道
    player.col = 4; player.row = 9;
    // 往上走到第一个空格
    for (let r = ROWS-2; r >= 1; r--) {
      if (map[r][4] === T.STAIR) { player.row = r - 1; break; }
    }
  }

  function showMsg(text, duration = 120) {
    message = text;
    msgTimer = duration;
  }

  function battle(enemy) {
    let rounds = 0, log = '';
    let eHp = enemy.hp;
    const playerAtk = Math.max(1, player.atk - enemy.def);
    const enemyAtk = Math.max(1, enemy.atk - player.def);
    while (eHp > 0 && player.hp > 0 && rounds < 20) {
      eHp -= playerAtk;
      if (eHp > 0) player.hp -= enemyAtk;
      rounds++;
    }
    if (eHp <= 0) {
      score += enemy.exp;
      const expText = `击败${enemy.name}！+${enemy.exp}分`;
      showMsg(expText);
      Assets.playBeep(440, 0.12);
      return true;
    }
    return false;
  }

  function tryMove(dc, dr) {
    if (battleAnim) return;
    const nc = player.col + dc, nr = player.row + dr;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
    const cell = map[nr][nc];
    const key = `${nr}_${nc}`;

    if (cell === T.WALL) return;
    if (cell === T.DOOR) {
      if (player.keys > 0) {
        player.keys--;
        map[nr][nc] = T.EMPTY;
        showMsg('开门！');
        Assets.playBeep(550, 0.1);
      } else {
        showMsg('需要钥匙！');
        Assets.playBeep(200, 0.1);
        return;
      }
    } else if (cell === T.ENEMY || cell === T.BOSS) {
      const e = entities[key];
      if (e) {
        battleAnim = {e, frames:30};
        const won = battle(e);
        if (won) {
          delete entities[key];
          map[nr][nc] = T.EMPTY;
          player.col = nc; player.row = nr;
        } else {
          showMsg('力量不足，被击败...');
          Assets.playBeep(200, 0.4, 'sawtooth');
        }
      }
      return;
    } else if (cell === T.CHEST) {
      const c = entities[key];
      if (c) {
        player.hp = Math.min(player.maxHp + c.hp, player.maxHp + c.hp);
        player.maxHp += c.hp;
        player.hp = player.maxHp;
        player.atk += c.atk;
        player.def += c.def;
        showMsg(c.text);
        delete entities[key];
        map[nr][nc] = T.EMPTY;
        Assets.playBeep(660, 0.15);
      }
    } else if (cell === T.KEY) {
      player.keys++;
      delete entities[key];
      map[nr][nc] = T.EMPTY;
      showMsg('获得钥匙！');
      Assets.playBeep(770, 0.1);
    } else if (cell === T.STAIR) {
      if (floor < 2) {
        loadFloor(floor + 1);
        showMsg(`进入第 ${floor+1} 层！`);
        Assets.playBeep(880, 0.2);
        return;
      } else {
        // 通关！
        score += 500 + player.hp * 5;
        cleared = true;
        Assets.playBeep(880, 0.4);
        showMsg('魔王已败！通关！');
        return;
      }
    }

    player.col = nc;
    player.row = nr;
  }

  function onKeyDown(e) {
    if (keys[e.code]) return;
    keys[e.code] = true;
    if (msgTimer > 0) { msgTimer = 0; return; }
    switch(e.code) {
      case 'ArrowUp':    case 'KeyW': tryMove(0, -1); break;
      case 'ArrowDown':  case 'KeyS': tryMove(0,  1); break;
      case 'ArrowLeft':  case 'KeyA': tryMove(-1, 0); break;
      case 'ArrowRight': case 'KeyD': tryMove(1,  0); break;
    }
  }
  function onKeyUp(e) { keys[e.code] = false; }

  function update() {
    frame++;
    if (msgTimer > 0) msgTimer--;
    if (battleAnim) {
      battleAnim.frames--;
      if (battleAnim.frames <= 0) battleAnim = null;
    }
    if (player.hp <= 0) return { type:'level3', done:true, score, failed:true };
    if (cleared && msgTimer <= 0) return { type:'level3', done:true, score };
    return null;
  }

  function cellColor(t) {
    switch(t) {
      case T.WALL:  return '#1a1a3a';
      case T.EMPTY: return '#0d0d20';
      default:      return '#0d0d20';
    }
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);
    // 背景
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a0a1a');
    bg.addColorStop(1,'#1a0a2a');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    // 地图
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = MAP_OFFX + c*TW, y = MAP_OFFY + r*TH;
        const cell = map[r][c];

        ctx.fillStyle = cellColor(cell);
        ctx.fillRect(x,y,TW,TH);

        if (cell === T.WALL) {
          ctx.strokeStyle = '#2a2a5a';
          ctx.lineWidth = 1;
          ctx.strokeRect(x+1,y+1,TW-2,TH-2);
          ctx.fillStyle = '#222244';
          ctx.fillRect(x+2,y+2,TW-4,6);
        } else {
          ctx.strokeStyle = '#111128';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x,y,TW,TH);
        }

        const key = `${r}_${c}`;
        const entity = entities[key];

        if (cell === T.DOOR) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x+8,y+4,TW-16,TH-4);
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(x+TW/2, y+TH/2, 4, 0, Math.PI*2);
          ctx.fill();
        } else if (cell === T.STAIR) {
          ctx.fillStyle = '#4a3a2a';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(x+i*10+4, y+TH-8-i*7, TW-i*20-8, 8);
          }
          ctx.fillStyle = '#ffd700';
          ctx.font = '10px Courier New';
          ctx.textAlign = 'center';
          ctx.fillText(floor < 2 ? '↑上层' : '↑通关', x+TW/2, y+TH/2-4);
        } else if (entity) {
          if (entity.type === 'enemy' || entity.type === 'boss') {
            const pulse = battleAnim && battleAnim.e === entity ? Math.sin(frame*0.5)*4 : 0;
            Assets.drawSkeleton(ctx, x+6+pulse, y+3, TW-12, TH-6, frame);
            if (entity.type === 'boss') {
              ctx.fillStyle = '#ff3333';
              ctx.globalAlpha = 0.3 + Math.sin(frame*0.1)*0.2;
              ctx.beginPath();
              ctx.arc(x+TW/2, y+TH/2, TW*0.45, 0, Math.PI*2);
              ctx.fill();
              ctx.globalAlpha = 1;
              ctx.fillStyle = '#ff3333';
              ctx.font = 'bold 9px Courier New';
              ctx.textAlign = 'center';
              ctx.fillText('BOSS', x+TW/2, y+TH-3);
            }
            // 血条
            ctx.fillStyle = '#300';
            ctx.fillRect(x+4, y+2, TW-8, 4);
            ctx.fillStyle = '#e83030';
            ctx.fillRect(x+4, y+2, (TW-8)*(entity.hp/ENEMY_STATS[floor][entity.type==='boss'?ENEMY_STATS[floor].length-1:0].hp), 4);
          } else if (entity.type === 'chest') {
            Assets.drawChest(ctx, x+8, y+6, TW-16, TH-12);
          } else if (entity.type === 'key') {
            Assets.drawKey(ctx, x+TW/2-8, y+TH/2-8, 16);
          }
        }
      }
    }

    // 玩家
    const px = MAP_OFFX + player.col*TW;
    const py = MAP_OFFY + player.row*TH;
    Assets.drawHero(ctx, px+TW*0.1, py+TH*0.05, TW*0.8, TH*0.9, 1, Math.floor(frame/10)%2);

    // 侧边状态栏
    const sx = 10;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(sx, H/2-120, 130, 240);
    ctx.strokeStyle = '#4a3a8a';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, H/2-120, 130, 240);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('勇者状态', sx+8, H/2-100);

    ctx.fillStyle = '#e83030';
    ctx.font = '12px Courier New';
    ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, sx+8, H/2-78);
    // HP条
    ctx.fillStyle = '#300';
    ctx.fillRect(sx+8, H/2-70, 110, 8);
    ctx.fillStyle = '#e83030';
    ctx.fillRect(sx+8, H/2-70, 110*(player.hp/player.maxHp), 8);

    ctx.fillStyle = '#88ccff';
    ctx.fillText(`ATK: ${player.atk}`, sx+8, H/2-52);
    ctx.fillStyle = '#88ff88';
    ctx.fillText(`DEF: ${player.def}`, sx+8, H/2-34);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`钥匙: ${player.keys}`, sx+8, H/2-16);

    ctx.fillStyle = '#4adf3f';
    ctx.fillText(`分数: ${score}`, sx+8, H/2+4);
    ctx.fillStyle = '#aaa';
    ctx.fillText(`第${floor+1}层`, sx+8, H/2+22);

    // 右侧敌人预览（当前层）
    const rx = W - 140;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(rx, H/2-80, 130, 160);
    ctx.strokeStyle = '#4a3a8a';
    ctx.strokeRect(rx, H/2-80, 130, 160);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('本层敌人', rx+8, H/2-60);
    ENEMY_STATS[floor].forEach((e, i) => {
      ctx.fillStyle = e.color;
      ctx.fillText(e.name, rx+8, H/2-40+i*36);
      ctx.fillStyle = '#e83030';
      ctx.fillText(`HP:${e.hp} ATK:${e.atk}`, rx+8, H/2-26+i*36);
      ctx.fillStyle = '#88ccff';
      ctx.fillText(`DEF:${e.def} +${e.exp}分`, rx+8, H/2-12+i*36);
    });

    // 消息框
    if (msgTimer > 0) {
      const alpha = Math.min(1, msgTimer/20);
      ctx.fillStyle = `rgba(0,0,0,${alpha*0.85})`;
      ctx.fillRect(W/2-180, H/2-25, 360, 50);
      ctx.strokeStyle = `rgba(255,215,0,${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(W/2-180, H/2-25, 360, 50);
      ctx.fillStyle = `rgba(255,215,0,${alpha})`;
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(message, W/2, H/2+6);
    }

    // 操作提示
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W/2-200, H-24, 400, 20);
    ctx.fillStyle = '#888';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('WASD/方向键 移动 | 踩敌人战斗 | 找钥匙开门 | 上楼梯↑', W/2, H-10);

    ctx.fillStyle = '#ffd700';
    ctx.font = '13px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('第3关 — 魔塔圣地', W/2, 20);
  }

  return { init, update, draw, onKeyDown, onKeyUp };
})();
