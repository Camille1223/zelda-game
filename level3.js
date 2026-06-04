// ============================================================
// level3.js — 关卡3: 魔塔圣殿（卡通2D RPG）
// ============================================================

const Level3 = (() => {
  const W = 800, H = 500;
  const COLS = 9, ROWS = 11;
  const TW = 56, TH = 42;
  const MAP_OFFX = Math.floor((W - COLS*TW) / 2);
  const MAP_OFFY = 36;

  const T = {EMPTY:0,WALL:1,ENEMY:2,BOSS:3,CHEST:4,KEY:5,DOOR:6,STAIR:7};

  const FLOORS = [
    // 第1层（简单热身）
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
    // 第2层（中等）
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
    // 第3层（有BOSS，但可通关）
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

  const ENEMY_STATS = [
    [{name:'🐷 小猪兵', hp:18, atk:7,  def:2, exp:30, color:'#fca5a5'}],
    [{name:'🐸 毒蛙卫', hp:30, atk:12, def:4, exp:60, color:'#86efac'}],
    [{name:'🐲 火龙将', hp:40, atk:16, def:6, exp:90, color:'#fbbf24'},
     {name:'👑 魔王',   hp:80, atk:20, def:8, exp:280,color:'#f87171'}],
  ];

  const CHEST_REWARDS = [
    {hp:35, atk:4,  def:2,  text:'💊 +35HP  ⚔️+4ATK  🛡️+2DEF'},
    {hp:30, atk:6,  def:3,  text:'💊 +30HP  ⚔️+6ATK  🛡️+3DEF'},
    {hp:60, atk:10, def:6,  text:'💊 +60HP  ⚔️+10ATK 🛡️+6DEF'},
  ];

  let floor, map, player, entities, keys, score;
  let message, msgTimer, frame, cleared, battleFlash;

  function init() {
    floor=0; score=0; frame=0;
    message=''; msgTimer=0; cleared=false; battleFlash=0;
    keys={};
    player={col:4,row:8,hp:120,maxHp:120,atk:18,def:6,keys:0};
    loadFloor(0);
    return {type:'level3',done:false};
  }

  function loadFloor(f) {
    floor=f;
    map=FLOORS[f].map(r=>[...r]);
    entities={};
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const t=map[r][c];
      if(t===T.ENEMY){
        const s=ENEMY_STATS[f][0];
        entities[`${r}_${c}`]={type:'enemy',...s,col:c,row:r,maxHp:s.hp};
      } else if(t===T.BOSS){
        const s=ENEMY_STATS[f].find(e=>e.name.includes('魔王'))||ENEMY_STATS[f][ENEMY_STATS[f].length-1];
        entities[`${r}_${c}`]={type:'boss',...s,col:c,row:r,maxHp:s.hp};
      } else if(t===T.CHEST){
        entities[`${r}_${c}`]={type:'chest',...CHEST_REWARDS[f],col:c,row:r};
      } else if(t===T.KEY){
        entities[`${r}_${c}`]={type:'key',col:c,row:r};
      }
    }
    player.col=4; player.row=8;
  }

  function showMsg(text,dur=100){ message=text; msgTimer=dur; }

  function battle(enemy){
    let eHp=enemy.hp;
    const pAtk=Math.max(1,player.atk-enemy.def);
    const eAtk=Math.max(1,enemy.atk-player.def);
    let rounds=0;
    while(eHp>0&&player.hp>0&&rounds<30){ eHp-=pAtk; if(eHp>0) player.hp-=eAtk; rounds++; }
    return eHp<=0;
  }

  function tryMove(dc,dr){
    if(msgTimer>30) return;
    const nc=player.col+dc, nr=player.row+dr;
    if(nr<0||nr>=ROWS||nc<0||nc>=COLS) return;
    const cell=map[nr][nc];
    const key=`${nr}_${nc}`;
    if(cell===T.WALL) return;
    if(cell===T.DOOR){
      if(player.keys>0){ player.keys--; map[nr][nc]=T.EMPTY; showMsg('🔓 开门！',60); Assets.playBeep(600,0.1); }
      else{ showMsg('🔑 需要钥匙！',80); Assets.playBeep(200,0.1); return; }
    } else if(cell===T.ENEMY||cell===T.BOSS){
      const e=entities[key];
      if(e){
        battleFlash=20;
        const won=battle(e);
        if(won){ score+=e.exp; delete entities[key]; map[nr][nc]=T.EMPTY; showMsg(`✨ 击败${e.name}！+${e.exp}分`,90); Assets.playBeep(500,0.15); }
        else{ showMsg('💀 被击败了...'); Assets.playBeep(200,0.5,'sawtooth'); }
      }
      return;
    } else if(cell===T.CHEST){
      const c=entities[key];
      if(c){ player.maxHp+=c.hp; player.hp=Math.min(player.hp+c.hp,player.maxHp); player.atk+=c.atk; player.def+=c.def; showMsg(c.text,100); delete entities[key]; map[nr][nc]=T.EMPTY; Assets.playBeep(700,0.15); }
    } else if(cell===T.KEY){
      player.keys++; delete entities[key]; map[nr][nc]=T.EMPTY; showMsg('🔑 获得钥匙！',60); Assets.playBeep(800,0.1);
    } else if(cell===T.STAIR){
      if(floor<2){ loadFloor(floor+1); showMsg(`🌟 进入第${floor+1}层！`,80); Assets.playBeep(900,0.2); return; }
      else{ score+=500+player.hp*5; cleared=true; showMsg('🎉 魔王已败！恭喜通关！',150); Assets.playBeep(1000,0.4); return; }
    }
    player.col=nc; player.row=nr;
  }

  function onKeyDown(e){
    if(keys[e.code]) return;
    keys[e.code]=true;
    if(msgTimer>30){ msgTimer=Math.min(msgTimer,20); return; }
    switch(e.code){
      case'ArrowUp':  case'KeyW': tryMove(0,-1); break;
      case'ArrowDown':case'KeyS': tryMove(0,1);  break;
      case'ArrowLeft':case'KeyA': tryMove(-1,0); break;
      case'ArrowRight':case'KeyD':tryMove(1,0);  break;
    }
  }
  function onKeyUp(e){ keys[e.code]=false; }

  function update(){
    frame++;
    if(msgTimer>0) msgTimer--;
    if(battleFlash>0) battleFlash--;
    if(player.hp<=0) return{type:'level3',done:true,score,failed:true};
    if(cleared&&msgTimer<=0) return{type:'level3',done:true,score};
    return null;
  }

  // ---- 绘图 ----
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function drawTile(ctx,x,y,cell,entity){
    if(cell===T.WALL){
      const g=ctx.createLinearGradient(x,y,x,y+TH);
      g.addColorStop(0,'#818cf8'); g.addColorStop(1,'#4f46e5');
      ctx.fillStyle=g; roundRect(ctx,x+1,y+1,TW-2,TH-2,8); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; roundRect(ctx,x+4,y+4,TW-8,TH*0.3,5); ctx.fill();
      return;
    }
    // 通道
    ctx.fillStyle='rgba(255,255,255,0.35)';
    roundRect(ctx,x+1,y+1,TW-2,TH-2,6); ctx.fill();

    if(cell===T.DOOR){
      // 门
      const dg=ctx.createLinearGradient(x,y,x,y+TH);
      dg.addColorStop(0,'#fbbf24'); dg.addColorStop(1,'#d97706');
      ctx.fillStyle=dg; roundRect(ctx,x+6,y+3,TW-12,TH-3,6); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.3)'; roundRect(ctx,x+9,y+6,TW-18,TH*0.3,4); ctx.fill();
      ctx.fillStyle='#92400e'; ctx.font='16px Arial'; ctx.textAlign='center';
      ctx.fillText('🔒',x+TW/2,y+TH/2+6);
    } else if(cell===T.STAIR){
      ctx.fillStyle='#6ee7b7';
      for(let i=0;i<3;i++) ctx.fillRect(x+6+i*10,y+TH-10-i*9,TW-12-i*20,9);
      ctx.font='14px Arial'; ctx.textAlign='center';
      ctx.fillText(floor<2?'⬆️':'🏆',x+TW/2,y+TH/2+5);
    }

    if(!entity) return;
    if(entity.type==='enemy'||entity.type==='boss'){
      const flash=battleFlash>0&&Math.floor(battleFlash/4)%2===0;
      ctx.save();
      if(flash){ ctx.fillStyle='rgba(255,200,0,0.4)'; roundRect(ctx,x,y,TW,TH,6); ctx.fill(); }
      ctx.font=entity.type==='boss'?'26px Arial':'20px Arial';
      ctx.textAlign='center';
      const bob=Math.sin(frame*0.1+entity.col)*2;
      ctx.fillText(entity.name.split(' ')[0],x+TW/2,y+TH*0.68+bob);
      // 血条
      ctx.fillStyle='rgba(0,0,0,0.25)'; roundRect(ctx,x+4,y+3,TW-8,6,3); ctx.fill();
      ctx.fillStyle=entity.type==='boss'?'#ef4444':'#4ade80';
      const hw=(TW-8)*(entity.hp/entity.maxHp);
      roundRect(ctx,x+4,y+3,hw,6,3); ctx.fill();
      if(entity.type==='boss'){
        ctx.fillStyle='#fef08a'; ctx.font='bold 9px Arial'; ctx.textAlign='center';
        ctx.fillText('BOSS',x+TW/2,y+TH-4);
      }
      ctx.restore();
    } else if(entity.type==='chest'){
      ctx.font='22px Arial'; ctx.textAlign='center';
      ctx.fillText('📦',x+TW/2,y+TH*0.7);
    } else if(entity.type==='key'){
      const pulse=1+Math.sin(frame*0.15)*0.1;
      ctx.save(); ctx.translate(x+TW/2,y+TH/2); ctx.scale(pulse,pulse);
      ctx.font='20px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🗝️',0,0);
      ctx.restore();
    }
  }

  function drawPlayer(ctx){
    const x=MAP_OFFX+player.col*TW, y=MAP_OFFY+player.row*TH;
    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=12;
    const bob=Math.sin(frame*0.12)*1.5;
    ctx.font='26px Arial'; ctx.textAlign='center';
    ctx.fillText('🧝',x+TW/2,y+TH*0.72+bob);
    ctx.restore();
  }

  function draw(ctx){
    ctx.clearRect(0,0,W,H);
    // 背景
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#1e1b4b'); bg.addColorStop(1,'#312e81');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    // 星星背景
    ctx.save(); ctx.globalAlpha=0.4;
    for(let i=0;i<40;i++){
      const sx=(i*137+50)%W, sy=(i*97+30)%H;
      const sa=0.3+Math.sin(frame*0.04+i)*0.3;
      ctx.fillStyle=`rgba(255,255,200,${sa})`;
      ctx.beginPath(); ctx.arc(sx,sy,1.2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // 地图
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const x=MAP_OFFX+c*TW, y=MAP_OFFY+r*TH;
      drawTile(ctx,x,y,map[r][c],entities[`${r}_${c}`]);
    }
    drawPlayer(ctx);

    // 左侧状态栏
    const sx=8;
    ctx.fillStyle='rgba(255,255,255,0.1)';
    roundRect(ctx,sx,MAP_OFFY,130,240,10); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    roundRect(ctx,sx,MAP_OFFY,130,240,10); ctx.stroke();

    ctx.fillStyle='#fde68a'; ctx.font='bold 13px Arial'; ctx.textAlign='left';
    ctx.fillText('🧝 勇者',sx+8,MAP_OFFY+20);
    ctx.fillStyle='#fca5a5'; ctx.font='12px Arial';
    ctx.fillText(`❤️ ${player.hp}/${player.maxHp}`,sx+8,MAP_OFFY+40);
    ctx.fillStyle='rgba(50,0,0,0.4)'; roundRect(ctx,sx+8,MAP_OFFY+44,112,7,4); ctx.fill();
    ctx.fillStyle='#ef4444'; roundRect(ctx,sx+8,MAP_OFFY+44,112*(player.hp/player.maxHp),7,4); ctx.fill();
    ctx.fillStyle='#fbbf24'; ctx.fillText(`⚔️ ATK: ${player.atk}`,sx+8,MAP_OFFY+68);
    ctx.fillStyle='#86efac'; ctx.fillText(`🛡️ DEF: ${player.def}`,sx+8,MAP_OFFY+86);
    ctx.fillStyle='#fde68a'; ctx.fillText(`🗝️ 钥匙: ${player.keys}`,sx+8,MAP_OFFY+104);
    ctx.fillStyle='#c4b5fd'; ctx.fillText(`⭐ 分数: ${score}`,sx+8,MAP_OFFY+122);
    ctx.fillStyle='#e0e7ff'; ctx.fillText(`📍 第${floor+1}层`,sx+8,MAP_OFFY+140);

    // 当前层敌人信息
    ctx.fillStyle='#a5b4fc'; ctx.font='bold 11px Arial';
    ctx.fillText('── 本层敌人 ──',sx+8,MAP_OFFY+162);
    ENEMY_STATS[floor].forEach((e,i)=>{
      ctx.fillStyle=e.color; ctx.font='11px Arial';
      ctx.fillText(e.name,sx+8,MAP_OFFY+178+i*32);
      ctx.fillStyle='#fca5a5'; ctx.fillText(`HP:${e.hp} ATK:${e.atk}`,sx+8,MAP_OFFY+191+i*32);
    });

    // 消息框
    if(msgTimer>0){
      const alpha=Math.min(1,msgTimer/15);
      ctx.fillStyle=`rgba(0,0,0,${alpha*0.8})`;
      roundRect(ctx,W/2-200,H/2-30,400,60,12); ctx.fill();
      ctx.strokeStyle=`rgba(253,230,138,${alpha})`; ctx.lineWidth=2;
      roundRect(ctx,W/2-200,H/2-30,400,60,12); ctx.stroke();
      ctx.fillStyle=`rgba(255,255,255,${alpha})`;
      ctx.font='bold 15px Arial'; ctx.textAlign='center';
      ctx.fillText(message,W/2,H/2+6);
    }

    // HUD顶部
    ctx.fillStyle='rgba(30,27,75,0.85)'; ctx.fillRect(0,0,W,MAP_OFFY);
    ctx.fillStyle='#fde68a'; ctx.font='bold 14px Arial'; ctx.textAlign='center';
    ctx.fillText('第3关 — 魔塔圣殿',W/2,MAP_OFFY-10);
    ctx.fillStyle='#a5b4fc'; ctx.textAlign='right';
    ctx.fillText('踩敌战斗 | 宝箱强化 | 找钥开门 | 踩楼梯上层',W-8,MAP_OFFY-10);
  }

  return {init,update,draw,onKeyDown,onKeyUp};
})();
