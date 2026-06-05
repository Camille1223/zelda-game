// ============================================================
// level2.js — 关卡2: 糖果迷宫（竖屏400×700）
// ============================================================

const Level2 = (() => {
  const W = 400, H = 700;
  const COLS = 11, ROWS = 15;
  const TW = 32, TH = 32;
  const offX = Math.floor((W - COLS*TW) / 2);  // 24
  const offY = 44;  // top HUD height

  // 0=通道 1=墙 2=小星 3=大糖果
  const MAP_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,1,2,1,2,2,2,1],
    [1,3,1,2,2,2,2,2,1,3,1],
    [1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1],
    [1,3,1,2,2,2,2,2,1,3,1],
    [1,2,2,2,1,2,1,2,2,2,1],
    [1,2,1,2,2,2,2,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1],
  ];

  let map, player, ghosts, score, frame, powerTimer, moveTimer;
  let totalDots, collectedDots;

  const GHOST_DEFS = [
    {col:1,  row:1,  dx:1,  dy:0, color:'#fb7185', eyeColor:'#be123c'},
    {col:9,  row:1,  dx:-1, dy:0, color:'#fb923c', eyeColor:'#c2410c'},
    {col:5,  row:7,  dx:0,  dy:-1,color:'#a78bfa', eyeColor:'#6d28d9'},
  ];

  const DIRS = {
    ArrowUp:{dx:0,dy:-1}, ArrowDown:{dx:0,dy:1},
    ArrowLeft:{dx:-1,dy:0}, ArrowRight:{dx:1,dy:0},
    KeyW:{dx:0,dy:-1}, KeyS:{dx:0,dy:1},
    KeyA:{dx:-1,dy:0}, KeyD:{dx:1,dy:0},
  };

  function init() {
    frame=0; score=0; powerTimer=0; moveTimer=0;
    map = MAP_TEMPLATE.map(r=>[...r]);
    totalDots=0; collectedDots=0;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
      if(map[r][c]===2||map[r][c]===3) totalDots++;
    player={col:5,row:7,dx:0,dy:0,nextDx:0,nextDy:0};
    ghosts=GHOST_DEFS.map(g=>({...g,scared:false}));
    return {type:'level2',done:false};
  }

  function onKeyDown(e) {
    if(DIRS[e.code]){ player.nextDx=DIRS[e.code].dx; player.nextDy=DIRS[e.code].dy; e.preventDefault(); }
  }
  function onKeyUp(e) {}

  function canMove(c,r){ return r>=0&&r<ROWS&&c>=0&&c<COLS&&map[r][c]!==1; }

  function ghostAI(g) {
    const {col,row}=g, {col:tc,row:tr}=player;
    const dirs=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
    const valid=dirs.filter(d=>canMove(col+d.dx,row+d.dy)&&!(d.dx===-g.dx&&d.dy===-g.dy));
    if(!valid.length) return {dx:-g.dx||1,dy:0};
    if(g.scared){
      valid.sort((a,b)=>(Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr))-(Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr)));
    } else {
      if(Math.random()<0.25) return valid[Math.floor(Math.random()*valid.length)];
      valid.sort((a,b)=>(Math.abs(col+a.dx-tc)+Math.abs(row+a.dy-tr))-(Math.abs(col+b.dx-tc)+Math.abs(row+b.dy-tr)));
    }
    return valid[0];
  }

  function update() {
    frame++;
    if(powerTimer>0) powerTimer--;
    ghosts.forEach(g=>g.scared=powerTimer>0);

    moveTimer++;
    if(moveTimer>=7){
      moveTimer=0;
      if((player.nextDx!==player.dx||player.nextDy!==player.dy)&&canMove(player.col+player.nextDx,player.row+player.nextDy)){
        player.dx=player.nextDx; player.dy=player.nextDy;
      }
      if(canMove(player.col+player.dx,player.row+player.dy)){
        player.col+=player.dx; player.row+=player.dy;
      }
      const cell=map[player.row][player.col];
      if(cell===2){ map[player.row][player.col]=0; score+=20; collectedDots++; Assets.playBeep(600+collectedDots*3,0.04); }
      else if(cell===3){ map[player.row][player.col]=0; score+=120; collectedDots++; powerTimer=280; Assets.playBeep(900,0.15); }

      if(frame%8===0){
        for(const g of ghosts){ const d=ghostAI(g); g.dx=d.dx; g.dy=d.dy; g.col+=d.dx; g.row+=d.dy; }
      }
      for(let i=0;i<ghosts.length;i++){
        const g=ghosts[i];
        if(g.col===player.col&&g.row===player.row){
          if(g.scared){ g.col=GHOST_DEFS[i].col; g.row=GHOST_DEFS[i].row; g.scared=false; score+=150; Assets.playBeep(500,0.1); }
          else{ Assets.playBeep(180,0.4,'sawtooth'); return{type:'level2',done:true,score,failed:true}; }
        }
      }
    }
    if(collectedDots>=Math.ceil(totalDots*0.6)){ Assets.playBeep(900,0.3); return{type:'level2',done:true,score}; }
    return null;
  }

  // ---- 绘图工具 ----
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function drawWall(ctx,x,y){
    const g=ctx.createLinearGradient(x,y,x,y+TH);
    g.addColorStop(0,'#c084fc'); g.addColorStop(1,'#9333ea');
    ctx.fillStyle=g; roundRect(ctx,x+1,y+1,TW-2,TH-2,8); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)'; roundRect(ctx,x+4,y+4,TW-8,TH*0.38,5); ctx.fill();
    if((Math.floor(x/TW)+Math.floor(y/TH))%3===0){
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px Arial'; ctx.textAlign='center';
      ctx.fillText('♥',x+TW/2,y+TH/2+4);
    }
  }

  function drawDot(ctx,x,y){
    const pulse=0.85+Math.sin(frame*0.1+x*0.05)*0.15;
    ctx.save();
    ctx.shadowColor='#f472b6'; ctx.shadowBlur=8;
    ctx.fillStyle='#f9a8d4';
    ctx.beginPath(); ctx.arc(x+TW/2,y+TH/2,5*pulse,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawCandy(ctx,x,y){
    const pulse=1+Math.sin(frame*0.12+x*0.03)*0.15;
    ctx.save();
    ctx.shadowColor='#e879f9'; ctx.shadowBlur=14;
    const g=ctx.createRadialGradient(x+TW/2-3,y+TH/2-3,1,x+TW/2,y+TH/2,11*pulse);
    g.addColorStop(0,'#fae8ff'); g.addColorStop(0.5,'#e879f9'); g.addColorStop(1,'#a21caf');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(x+TW/2,y+TH/2,11*pulse,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(x+TW/2-3,y+TH/2-3,4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawGhostCartoon(ctx,g,idx){
    const x=offX+g.col*TW, y=offY+g.row*TH;
    const cx=x+TW/2, cy=y+TH/2;
    const r=TW*0.4;
    const bob=Math.sin(frame*0.13+idx)*2.5;
    ctx.save();
    const scared=g.scared;
    const flicker=scared&&powerTimer<90&&Math.floor(frame/6)%2===0;
    const bodyColor=flicker?'#e2e8f0':scared?'#93c5fd':g.color;

    ctx.shadowColor=bodyColor; ctx.shadowBlur=12;
    ctx.fillStyle=bodyColor;
    ctx.beginPath();
    ctx.arc(cx,cy-2+bob,r,Math.PI,0);
    ctx.lineTo(cx+r,cy+r*0.9+bob);
    for(let i=3;i>=0;i--){
      const wx=cx+r-i*(r*2/3);
      const wy=cy+r*0.9+(i%2===0?r*0.2:-r*0.2)+bob;
      ctx.quadraticCurveTo(wx,wy,cx+r-(i+0.5)*(r*2/3),cy+r*0.9+bob);
    }
    ctx.lineTo(cx-r,cy+r*0.9+bob);
    ctx.closePath(); ctx.fill();

    if(!scared){
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.ellipse(cx-r*0.3,cy-r*0.1+bob,r*0.22,r*0.3,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+r*0.3,cy-r*0.1+bob,r*0.22,r*0.3,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=g.eyeColor||'#1e1b4b';
      ctx.beginPath(); ctx.arc(cx-r*0.26,cy-r*0.05+bob,r*0.13,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.34,cy-r*0.05+bob,r*0.13,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(cx-r*0.2,cy-r*0.18+bob,r*0.07,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.4,cy-r*0.18+bob,r*0.07,0,Math.PI*2); ctx.fill();
    } else {
      ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2;
      [[cx-r*0.43,cy-r*0.28+bob,cx-r*0.17,cy+bob],
       [cx-r*0.17,cy-r*0.28+bob,cx-r*0.43,cy+bob],
       [cx+r*0.17,cy-r*0.28+bob,cx+r*0.43,cy+bob],
       [cx+r*0.43,cy-r*0.28+bob,cx+r*0.17,cy+bob]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let i=0;i<=10;i++){
        const wx=cx-r*0.35+i*r*0.07;
        const wy=cy+r*0.35+bob+(i%2===0?3:-3);
        i===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayerCartoon(ctx){
    const x=offX+player.col*TW, y=offY+player.row*TH;
    const cx=x+TW/2, cy=y+TH/2;
    const r=TW*0.38;
    const mouthOpen=0.2+Math.abs(Math.sin(frame*0.22))*0.38;
    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=14;
    let rot=0;
    if(player.dx<0) rot=Math.PI;
    else if(player.dy<0) rot=-Math.PI/2;
    else if(player.dy>0) rot=Math.PI/2;
    ctx.translate(cx,cy); ctx.rotate(rot);

    const g=ctx.createRadialGradient(-r*0.2,-r*0.2,r*0.05,0,0,r);
    g.addColorStop(0,'#fef9c3'); g.addColorStop(0.5,'#fde047'); g.addColorStop(1,'#eab308');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,r,mouthOpen,Math.PI*2-mouthOpen);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(-r*0.25,-r*0.3,r*0.22,0,Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.fillStyle='#1c1917';
    let ex=cx, ey=cy-r*0.45;
    if(rot===Math.PI) ey=cy+r*0.45;
    else if(rot===-Math.PI/2){ ex=cx+r*0.45; ey=cy; }
    else if(rot===Math.PI/2){ ex=cx-r*0.45; ey=cy; }
    ctx.beginPath(); ctx.arc(ex,ey,r*0.13,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(ex-r*0.04,ey-r*0.04,r*0.06,0,Math.PI*2); ctx.fill();
  }

  function draw(ctx){
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#fdf4ff'); bg.addColorStop(0.5,'#fce7f3'); bg.addColorStop(1,'#ede9fe');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    ctx.save(); ctx.globalAlpha=0.1;
    for(let i=0;i<18;i++){
      ctx.fillStyle=i%3===0?'#f0abfc':i%3===1?'#c4b5fd':'#fbcfe8';
      ctx.beginPath(); ctx.arc((i*137+30)%W,(i*97+60)%H,10+i%4*5,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // 地图
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const x=offX+c*TW, y=offY+r*TH;
        const cell=map[r][c];
        if(cell===1){ drawWall(ctx,x,y); }
        else{
          ctx.fillStyle='rgba(255,255,255,0.45)';
          roundRect(ctx,x+1,y+1,TW-2,TH-2,6); ctx.fill();
          if(cell===2) drawDot(ctx,x,y);
          else if(cell===3) drawCandy(ctx,x,y);
        }
      }
    }

    ghosts.forEach((g,i)=>drawGhostCartoon(ctx,g,i));
    drawPlayerCartoon(ctx);

    // HUD 顶部
    ctx.fillStyle='rgba(255,255,255,0.88)';
    ctx.fillRect(0,0,W,offY);
    ctx.fillStyle='#7c3aed'; ctx.font='bold 13px Arial'; ctx.textAlign='left';
    ctx.fillText(`⭐ ${score}`, 10, 28);
    const target=Math.ceil(totalDots*0.6);
    ctx.fillStyle='#db2777'; ctx.textAlign='center';
    ctx.fillText(`🍬 ${collectedDots}/${target}`, W/2, 28);
    ctx.fillStyle='#7c3aed'; ctx.textAlign='right';
    ctx.fillText('第2关', W-10, 28);
    // 进度条
    const bw=W-24;
    ctx.fillStyle='#e9d5ff'; roundRect(ctx,12,36,bw,5,3); ctx.fill();
    ctx.fillStyle='#a855f7'; roundRect(ctx,12,36,bw*Math.min(collectedDots/target,1),5,3); ctx.fill();

    // 强力模式
    if(powerTimer>0){
      ctx.fillStyle=`rgba(168,85,247,${0.06+Math.sin(frame*0.1)*0.04})`;
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#7c3aed'; ctx.font='bold 13px Arial'; ctx.textAlign='center';
      ctx.fillText(`💫 强力模式 ${Math.ceil(powerTimer/60)}s`,W/2,H-12);
    }
  }

  return {init,update,draw,onKeyDown,onKeyUp};
})();
