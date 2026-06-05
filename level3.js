// ============================================================
// level3.js — 关卡3: 彩虹贪吃蛇（竖屏400×700）
// ============================================================

const Level3 = (() => {
  const W = 400, H = 700;
  const COLS = 16, ROWS = 18;
  const TW = 22, TH = 22;
  const offX = Math.floor((W - COLS*TW) / 2);  // 16
  const offY = 50;  // top HUD

  const FOODS = [
    {emoji:'🍎', score:10, color:'#ef4444'},
    {emoji:'🍊', score:15, color:'#f97316'},
    {emoji:'🍇', score:20, color:'#a855f7'},
    {emoji:'⭐', score:30, color:'#fbbf24'},
    {emoji:'💎', score:50, color:'#38bdf8'},
  ];

  let snake, dir, nextDir, food, score, frame, moveTimer, alive, cleared;
  let foodEaten, targetFood, particles;

  function init() {
    frame = 0; score = 0; moveTimer = 0;
    alive = true; cleared = false; foodEaten = 0; targetFood = 12;
    particles = [];
    snake = [
      {col:9, row:9},
      {col:8, row:9},
      {col:7, row:9},
    ];
    dir = {dc:1, dr:0};
    nextDir = {dc:1, dr:0};
    spawnFood();
    return {type:'level3', done:false};
  }

  function spawnFood() {
    const type = FOODS[Math.min(Math.floor(foodEaten/3), FOODS.length-1)];
    let col, row;
    do {
      col = 1 + Math.floor(Math.random()*(COLS-2));
      row = 1 + Math.floor(Math.random()*(ROWS-2));
    } while (snake.some(s=>s.col===col&&s.row===row));
    food = {col, row, ...type, pulse:0};
  }

  function onKeyDown(e) {
    switch(e.code) {
      case 'ArrowUp':  case 'KeyW': if(dir.dr!==1)  nextDir={dc:0,dr:-1}; break;
      case 'ArrowDown':case 'KeyS': if(dir.dr!==-1) nextDir={dc:0,dr:1};  break;
      case 'ArrowLeft':case 'KeyA': if(dir.dc!==1)  nextDir={dc:-1,dr:0}; break;
      case 'ArrowRight':case 'KeyD':if(dir.dc!==-1) nextDir={dc:1,dr:0};  break;
    }
    e.preventDefault();
  }
  function onKeyUp(e) {}

  function addParticles(col, row, color) {
    for(let i=0;i<10;i++){
      const angle=Math.random()*Math.PI*2;
      const speed=1.5+Math.random()*2.5;
      particles.push({
        x: offX+col*TW+TW/2, y: offY+row*TH+TH/2,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life: 35+Math.random()*20, maxLife:50,
        color, size: 3+Math.random()*3,
      });
    }
  }

  function update() {
    frame++;
    food.pulse = (food.pulse||0)+1;

    particles = particles.filter(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.life--;
      return p.life>0;
    });

    moveTimer++;
    const speed = Math.max(14, 20 - Math.floor(snake.length/4));
    if(moveTimer < speed) return null;
    moveTimer = 0;

    dir = nextDir;
    const head = snake[0];
    const newHead = {col: head.col+dir.dc, row: head.row+dir.dr};

    if(newHead.col<=0||newHead.col>=COLS-1||newHead.row<=0||newHead.row>=ROWS-1){
      alive = false;
      Assets.playBeep(200, 0.4, 'sawtooth');
      return {type:'level3', done:true, score, failed:true};
    }
    if(snake.some(s=>s.col===newHead.col&&s.row===newHead.row)){
      alive = false;
      Assets.playBeep(200, 0.4, 'sawtooth');
      return {type:'level3', done:true, score, failed:true};
    }

    snake.unshift(newHead);

    if(newHead.col===food.col&&newHead.row===food.row){
      score += food.score;
      foodEaten++;
      addParticles(food.col, food.row, food.color);
      Assets.playBeep(600+foodEaten*20, 0.1);
      spawnFood();
      if(foodEaten >= targetFood){
        score += 300 + snake.length*10;
        cleared = true;
        Assets.playBeep(900, 0.3);
        return {type:'level3', done:true, score};
      }
    } else {
      snake.pop();
    }
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

  function drawGrid(ctx) {
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const x=offX+c*TW, y=offY+r*TH;
      const isWall = r===0||r===ROWS-1||c===0||c===COLS-1;
      if(isWall){
        const g=ctx.createLinearGradient(x,y,x,y+TH);
        g.addColorStop(0,'#6d28d9'); g.addColorStop(1,'#4c1d95');
        ctx.fillStyle=g;
        roundRect(ctx,x+1,y+1,TW-2,TH-2,5); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.15)';
        roundRect(ctx,x+3,y+3,TW-6,TH*0.3,3); ctx.fill();
      } else {
        ctx.fillStyle=(r+c)%2===0?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.03)';
        ctx.fillRect(x,y,TW,TH);
      }
    }
  }

  function drawSnake(ctx) {
    for(let i=snake.length-1;i>=0;i--){
      const s=snake[i];
      const x=offX+s.col*TW, y=offY+s.row*TH;
      const isHead=i===0;
      const t=i/snake.length;
      const hue = 120 + t*60;
      const sat = 70-t*20;
      const lit = isHead?52:45+t*10;

      ctx.save();
      if(isHead){ ctx.shadowColor=`hsl(${hue},${sat}%,${lit}%)`; ctx.shadowBlur=10; }
      ctx.fillStyle=`hsl(${hue},${sat}%,${lit}%)`;
      const r=isHead?7:5;
      roundRect(ctx,x+2,y+2,TW-4,TH-4,r); ctx.fill();

      ctx.fillStyle='rgba(255,255,255,0.25)';
      roundRect(ctx,x+4,y+4,TW-8,TH*0.32,r-2); ctx.fill();

      if(isHead){
        const {dc,dr}=dir;
        let ex1,ey1,ex2,ey2;
        if(dc===1)      {ex1=x+TW*0.65;ey1=y+TH*0.28;ex2=x+TW*0.65;ey2=y+TH*0.72;}
        else if(dc===-1){ex1=x+TW*0.35;ey1=y+TH*0.28;ex2=x+TW*0.35;ey2=y+TH*0.72;}
        else if(dr===-1){ex1=x+TW*0.28;ey1=y+TH*0.35;ex2=x+TW*0.72;ey2=y+TH*0.35;}
        else            {ex1=x+TW*0.28;ey1=y+TH*0.65;ex2=x+TW*0.72;ey2=y+TH*0.65;}
        ctx.fillStyle='#fff'; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(ex1,ey1,3,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2,ey2,3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#1e1b4b';
        ctx.beginPath(); ctx.arc(ex1+dc*1,ey1+dr*1,1.6,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2+dc*1,ey2+dr*1,1.6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(ex1-0.6,ey1-0.6,0.8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2-0.6,ey2-0.6,0.8,0,Math.PI*2); ctx.fill();
        const tx=x+TW/2+dc*TW*0.55, ty=y+TH/2+dr*TH*0.55;
        ctx.strokeStyle='#f43f5e'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(x+TW/2+dc*TW*0.4,y+TH/2+dr*TH*0.4);
        ctx.lineTo(tx,ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(tx+dc*2-dr*2,ty+dr*2+dc*2,1.2,0,Math.PI*2);
        ctx.fillStyle='#f43f5e'; ctx.fill();
        ctx.beginPath(); ctx.arc(tx+dc*2+dr*2,ty+dr*2-dc*2,1.2,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFood(ctx) {
    const x=offX+food.col*TW, y=offY+food.row*TH;
    const pulse=1+Math.sin(food.pulse*0.15)*0.1;
    ctx.save();
    ctx.translate(x+TW/2,y+TH/2);
    ctx.scale(pulse,pulse);
    ctx.shadowColor=food.color; ctx.shadowBlur=12;
    ctx.fillStyle=food.color+'44';
    ctx.beginPath(); ctx.arc(0,0,TW*0.48,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=food.color+'88';
    ctx.beginPath(); ctx.arc(0,0,TW*0.34,0,Math.PI*2); ctx.fill();
    ctx.font=`${TH*0.72}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowBlur=8;
    ctx.fillText(food.emoji,0,2);
    ctx.restore();
  }

  function drawParticles(ctx) {
    for(const p of particles){
      const alpha=p.life/p.maxLife;
      ctx.fillStyle=p.color; ctx.globalAlpha=alpha;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*alpha,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function draw(ctx) {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#fdf4ff'); bg.addColorStop(0.5,'#f0fdf4'); bg.addColorStop(1,'#eff6ff');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    ctx.save(); ctx.globalAlpha=0.08;
    for(let i=0;i<12;i++){
      ctx.fillStyle=i%3===0?'#a855f7':i%3===1?'#10b981':'#3b82f6';
      ctx.beginPath(); ctx.arc((i*173+60)%W,(i*113+80)%H,15+i%4*8,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    drawGrid(ctx);
    drawFood(ctx);
    drawParticles(ctx);
    drawSnake(ctx);

    // HUD 顶部
    ctx.fillStyle='rgba(255,255,255,0.88)';
    ctx.fillRect(0,0,W,offY);
    ctx.fillStyle='#7c3aed'; ctx.font='bold 13px Arial'; ctx.textAlign='left';
    ctx.fillText(`⭐ ${score}`, 10, 28);
    ctx.fillStyle='#059669'; ctx.textAlign='center';
    ctx.fillText(`🍎 ${foodEaten}/${targetFood}`, W/2, 28);
    ctx.fillStyle='#7c3aed'; ctx.textAlign='right';
    ctx.fillText('第3关', W-10, 28);
    // 进度条
    const bw=W-24;
    ctx.fillStyle='#e9d5ff'; roundRect(ctx,12,36,bw,6,3); ctx.fill();
    ctx.fillStyle='#a855f7'; roundRect(ctx,12,36,bw*(foodEaten/targetFood),6,3); ctx.fill();

    // 底部提示
    const gridBottom = offY + ROWS*TH;
    if(gridBottom < H - 10){
      ctx.fillStyle='rgba(255,255,255,0.75)';
      ctx.fillRect(0,gridBottom,W,H-gridBottom);
      ctx.fillStyle='#9ca3af'; ctx.font='11px Arial'; ctx.textAlign='center';
      ctx.fillText('滑动屏幕或方向键控制  |  别撞墙！',W/2,gridBottom+20);
      const nextType = FOODS[Math.min(Math.floor((foodEaten+1)/3), FOODS.length-1)];
      ctx.fillStyle='#6d28d9'; ctx.font='12px Arial';
      ctx.fillText(`下一个: ${nextType.emoji} +${nextType.score}分`,W/2,gridBottom+40);
    }
  }

  return {init, update, draw, onKeyDown, onKeyUp};
})();
