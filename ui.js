// ============================================================
// ui.js — 竖屏版 UI（400×700）
// ============================================================

const UI = (() => {
  const W = 400, H = 700;
  const API_BASE = window.GAME_API_BASE || 'http://localhost:8000';

  function showOverlay(html) {
    const o = document.getElementById('overlay');
    document.getElementById('overlay-content').innerHTML = html;
    o.classList.remove('hidden');
    document.body.classList.add('overlay-open');
  }
  function hideOverlay() {
    document.getElementById('overlay').classList.add('hidden');
    document.body.classList.remove('overlay-open');
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  // ── 标题画面 ──
  function drawTitle(ctx, f) {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#1e1b4b'); bg.addColorStop(0.6,'#312e81'); bg.addColorStop(1,'#1e1b4b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 星星
    for(let i=0;i<50;i++){
      const sx=(i*137+50)%W, sy=(i*97+20)%(H*0.55);
      ctx.fillStyle=`rgba(255,255,200,${0.3+Math.sin(f*0.04+i)*0.4})`;
      ctx.beginPath(); ctx.arc(sx,sy,1+i%2*0.5,0,Math.PI*2); ctx.fill();
    }
    // 彩色粒子
    for(let i=0;i<16;i++){
      const px=((i*113+f*0.8)%W), py=((i*73+f*0.5)%H);
      const c=['#f9a8d4','#c4b5fd','#fde68a','#6ee7b7'][i%4];
      ctx.fillStyle=c; ctx.globalAlpha=0.4+Math.sin(f*0.06+i)*0.3;
      ctx.beginPath(); ctx.arc(px,py,3+i%3,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    // 主卡片
    ctx.fillStyle='rgba(255,255,255,0.07)';
    roundRect(ctx,20,80,360,280,20); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.35)'; ctx.lineWidth=1.5;
    roundRect(ctx,20,80,360,280,20); ctx.stroke();

    // 游戏icon
    ctx.font='54px Arial'; ctx.textAlign='center';
    ctx.fillText('🏆',W/2,154);

    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=20+Math.sin(f*0.05)*6;
    ctx.fillStyle='#fde68a'; ctx.font='bold 30px Arial'; ctx.textAlign='center';
    ctx.fillText('✨ 勇者三试炼 ✨',W/2,202);
    ctx.restore();

    ctx.fillStyle='#c4b5fd'; ctx.font='14px Arial';
    ctx.fillText('一场充满魔法的冒险！',W/2,232);

    const levels=[
      {icon:'🌈',text:'第1关：彩虹王国',color:'#86efac'},
      {icon:'🍬',text:'第2关：糖果迷宫',color:'#f9a8d4'},
      {icon:'🐍',text:'第3关：彩虹贪吃蛇',color:'#fbbf24'},
    ];
    levels.forEach((l,i)=>{
      ctx.fillStyle=l.color; ctx.font='15px Arial'; ctx.textAlign='center';
      ctx.fillText(`${l.icon} ${l.text}`,W/2,268+i*28);
    });

    // 开始提示
    if(Math.floor(f/18)%2===0){
      ctx.fillStyle='#6ee7b7'; ctx.font='bold 17px Arial';
      ctx.shadowColor='#6ee7b7'; ctx.shadowBlur=8;
      ctx.fillText('👆 点击屏幕开始冒险',W/2,400);
      ctx.shadowBlur=0;
    }

    // 公主预告
    ctx.fillStyle='rgba(255,255,255,0.06)';
    roundRect(ctx,20,430,360,100,16); ctx.fill();
    ctx.fillStyle='rgba(253,230,138,0.65)'; ctx.font='12px Arial';
    ctx.fillText('🌟 通关解锁迪士尼公主庆典！',W/2,460);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='20px Arial';
    ctx.fillText('👸 🌹 ❄️ 🌊 🌸 🌿',W/2,494);
    ctx.fillStyle='rgba(196,181,253,0.7)'; ctx.font='12px Arial';
    ctx.fillText('集齐三关，公主们等你！',W/2,518);

    // 控制说明
    ctx.fillStyle='rgba(255,255,255,0.05)';
    roundRect(ctx,20,548,360,80,12); ctx.fill();
    ctx.fillStyle='#9ca3af'; ctx.font='12px Arial';
    ctx.fillText('第1关：底部按钮控制',W/2,574);
    ctx.fillText('第2关：滑动屏幕控制方向',W/2,596);
    ctx.fillText('第3关：滑动控制蛇的方向',W/2,618);
  }

  // ── 关卡完成 ──
  function drawLevelClear(ctx, levelNum, levelScore, totalScore, f) {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0f172a'); bg.addColorStop(1,'#1e1b4b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 烟花
    const fws=[{cx:80,cy:150,c:'#f9a8d4'},{cx:W/2,cy:100,c:'#fde68a'},{cx:320,cy:160,c:'#86efac'},{cx:60,cy:300,c:'#c4b5fd'},{cx:340,cy:280,c:'#fb923c'}];
    for(const fw of fws) for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2+f*0.025;
      const r=25+Math.sin(f*0.09+i)*12;
      ctx.fillStyle=fw.c; ctx.globalAlpha=0.35+Math.sin(f*0.1+i)*0.35;
      ctx.beginPath(); ctx.arc(fw.cx+Math.cos(a)*r,fw.cy+Math.sin(a)*r,2.5,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    // 彩带
    for(let i=0;i<14;i++){
      const rx=((i*53+f*2.5)%W), ry=((i*37+f*2)%H);
      const c=['#f9a8d4','#fde68a','#86efac','#c4b5fd','#fb923c'][i%5];
      ctx.fillStyle=c; ctx.globalAlpha=0.6;
      ctx.save(); ctx.translate(rx,ry); ctx.rotate(f*0.05+i);
      ctx.fillRect(-10,-2,20,4); ctx.restore();
    }
    ctx.globalAlpha=1;

    // 卡片
    ctx.fillStyle='rgba(255,255,255,0.09)';
    roundRect(ctx,30,200,340,280,20); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.5)'; ctx.lineWidth=2;
    roundRect(ctx,30,200,340,280,20); ctx.stroke();

    ctx.font='52px Arial'; ctx.textAlign='center';
    ctx.fillText(['🌈','🍬','🐍'][levelNum-1],W/2,274);

    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=16;
    ctx.fillStyle='#fde68a'; ctx.font='bold 28px Arial'; ctx.textAlign='center';
    ctx.fillText(`第${levelNum}关 通过！ 🎉`,W/2,322);
    ctx.restore();

    ctx.fillStyle='#86efac'; ctx.font='17px Arial';
    ctx.fillText(`本关得分: ${levelScore}`,W/2,362);
    ctx.fillStyle='#fbbf24'; ctx.font='bold 22px Arial';
    ctx.fillText(`累计总分: ${totalScore}`,W/2,398);

    if(Math.floor(f/18)%2===0){
      ctx.fillStyle='#c4b5fd'; ctx.font='15px Arial';
      ctx.fillText(levelNum<3?'👆 点击继续':'👆 点击见证公主庆典！',W/2,454);
    }
  }

  // ── Game Over ──
  function drawGameOver(ctx, f) {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,350);
    bg.addColorStop(0,'#1c0a0a'); bg.addColorStop(1,'#0a0000');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.shadowColor='#ef4444'; ctx.shadowBlur=28+Math.sin(f*0.08)*8;
    ctx.fillStyle='#ef4444'; ctx.font='bold 50px Arial'; ctx.textAlign='center';
    ctx.fillText('💀',W/2,260);
    ctx.font='bold 38px Arial';
    ctx.fillText('GAME OVER',W/2,318);
    ctx.restore();

    ctx.fillStyle='#fca5a5'; ctx.font='16px Arial'; ctx.textAlign='center';
    ctx.fillText('勇者倒下了…',W/2,366);
    if(Math.floor(f/20)%2===0){
      ctx.fillStyle='#f87171'; ctx.font='15px Arial';
      ctx.fillText('👆 点击重新挑战本关',W/2,420);
    }
  }

  // ── 迪士尼公主3D旋转庆典（竖屏版）──
  const PRINCESSES=[
    {name:'灰姑娘',emoji:'👸',color:'#93c5fd',dress:'#3b82f6',desc:'梦想成真'},
    {name:'贝 儿', emoji:'🌹',color:'#fca5a5',dress:'#ef4444',desc:'智慧勇敢'},
    {name:'艾 莎', emoji:'❄️',color:'#a5f3fc',dress:'#06b6d4',desc:'冰雪女王'},
    {name:'莫阿娜',emoji:'🌊',color:'#6ee7b7',dress:'#10b981',desc:'勇闯大海'},
    {name:'花木兰',emoji:'🌸',color:'#fda4af',dress:'#e11d48',desc:'巾帼英雄'},
    {name:'爱 洛', emoji:'🌿',color:'#d9f99d',dress:'#65a30d',desc:'睡美人'},
  ];

  function drawPrincessCard(ctx,p,cx,cy,scale,alpha) {
    const cw=110,ch=145,r=12;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(cx,cy);
    ctx.scale(scale,scale);
    const g=ctx.createLinearGradient(-cw/2,-ch/2,-cw/2,ch/2);
    g.addColorStop(0,'rgba(255,255,255,0.95)'); g.addColorStop(1,p.color+'cc');
    ctx.fillStyle=g; roundRect(ctx,-cw/2,-ch/2,cw,ch,r); ctx.fill();
    ctx.strokeStyle=p.dress; ctx.lineWidth=2.5;
    roundRect(ctx,-cw/2,-ch/2,cw,ch,r); ctx.stroke();
    ctx.font='40px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.emoji,0,-22);
    ctx.fillStyle=p.dress; ctx.font='bold 13px Arial'; ctx.textBaseline='alphabetic';
    ctx.fillText(p.name,0,26);
    ctx.fillStyle='#374151'; ctx.font='10px Arial';
    ctx.fillText(p.desc,0,44);
    ctx.fillStyle=p.dress; ctx.fillText('✦ ✦ ✦',0,60);
    ctx.fillStyle='rgba(255,255,255,0.22)';
    roundRect(ctx,-cw/2+5,-ch/2+5,cw-10,ch*0.32,r-5); ctx.fill();
    ctx.restore();
  }

  function drawCelebration(ctx, f) {
    ctx.clearRect(0,0,W,H);
    const t=f*0.012;
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,`hsl(${280+Math.sin(t)*30},60%,18%)`);
    bg.addColorStop(1,`hsl(${320+Math.sin(t+2)*30},55%,14%)`);
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 粒子
    for(let i=0;i<50;i++){
      const px=((i*137+f*0.7)%W), py=((i*97+f*0.5)%H);
      ctx.fillStyle=['#fde68a','#f9a8d4','#c4b5fd','#6ee7b7','#fbbf24'][i%5];
      ctx.globalAlpha=0.08+Math.sin(f*0.07+i)*0.1;
      ctx.beginPath(); ctx.arc(px,py,1.5+i%3,0,Math.PI*2); ctx.fill();
    }
    // 彩带
    for(let i=0;i<20;i++){
      ctx.fillStyle=['#f9a8d4','#fde68a','#86efac','#c4b5fd','#fb923c','#a5f3fc'][i%6];
      ctx.globalAlpha=0.65;
      ctx.save(); ctx.translate(((i*71+f*2)%W),((i*43+f*1.5)%H));
      ctx.rotate(f*0.04+i*0.5); ctx.fillRect(-9,-2,18,4); ctx.restore();
    }
    ctx.globalAlpha=1;

    // 标题
    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=16+Math.sin(f*0.08)*5;
    ctx.fillStyle='#fde68a'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
    ctx.fillText('🎊 通关！公主来庆祝啦！🎊',W/2,54);
    ctx.restore();

    // 6张公主卡片：竖屏圆盘旋转
    const R=130, cx=W/2, cy=H/2-20;
    const angleOff=f*0.022;
    const cards=PRINCESSES.map((p,i)=>{
      const a=angleOff+i*(Math.PI*2/6);
      const x=cx+Math.sin(a)*R;
      const z=Math.cos(a);
      const y=cy+z*20;
      const scale=0.6+((z+1)/2)*0.42;
      const alpha=0.35+((z+1)/2)*0.65;
      return {p,x,y,scale,alpha,z};
    });
    cards.sort((a,b)=>a.z-b.z);
    cards.forEach(c=>drawPrincessCard(ctx,c.p,c.x,c.y,c.scale,c.alpha));
    const front=cards[cards.length-1];
    drawPrincessCard(ctx,front.p,front.x,front.y,front.scale*1.06,1);

    // 底部提示
    ctx.fillStyle='rgba(0,0,0,0.5)';
    roundRect(ctx,20,H-110,360,90,14); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.3)'; ctx.lineWidth=1;
    roundRect(ctx,20,H-110,360,90,14); ctx.stroke();
    ctx.fillStyle='#fde68a'; ctx.font='bold 15px Arial'; ctx.textAlign='center';
    ctx.fillText('✨ 三试炼全部完成！✨',W/2,H-82);
    ctx.fillStyle='#c4b5fd'; ctx.font='13px Arial';
    ctx.fillText('勇者万岁！',W/2,H-58);
    if(Math.floor(f/20)%2===0){
      ctx.fillStyle='#86efac'; ctx.font='13px Arial';
      ctx.fillText('👆 点击提交分数',W/2,H-32);
    }
  }

  // ── 最终通关 ──
  function showFinalScreen(totalScore, onSubmit, onViewLeaderboard) {
    showOverlay(`
      <h1>🎊 三试炼完成！</h1>
      <h2>你是真正的勇者！</h2>
      <div class="score-big">${totalScore}</div>
      <p style="font-size:20px;margin:8px 0">👸 🌹 ❄️ 🌊 🌸 🌿</p>
      <p>输入名字加入荣耀排行榜</p>
      <input type="text" id="playerName" maxlength="12" placeholder="你的名字..." />
      <br/>
      <button class="btn" id="btnSubmit">🏆 提交分数</button>
      <button class="btn" id="btnLeaderboard">📊 排行榜</button>
    `);
    document.getElementById('btnSubmit').onclick=()=>{
      const name=document.getElementById('playerName').value.trim()||'无名勇者';
      onSubmit(name,totalScore);
    };
    document.getElementById('btnLeaderboard').onclick=onViewLeaderboard;
  }

  // ── 排行榜 ──
  async function showLeaderboard(currentScore) {
    showOverlay(`<h2>⏳ 加载中...</h2>`);
    try {
      const res=await fetch(`${API_BASE}/scores`);
      const data=await res.json();
      const medals=['🥇','🥈','🥉'];
      const rows=data.map((e,i)=>`<tr><td class="${i<3?'rank-'+(i+1):''}">${i<3?medals[i]:i+1+'.'}</td><td>${e.name}</td><td>${e.score}</td></tr>`).join('');
      showOverlay(`
        <h1>🏆 排行榜</h1>
        <h2>👸 勇者荣耀殿堂</h2>
        <table class="leaderboard">
          <thead><tr><th>#</th><th>名字</th><th>分数</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="3">暂无记录</td></tr>'}</tbody>
        </table><br/>
        <button class="btn" id="btnReplay">🎮 再次挑战</button>
      `);
      document.getElementById('btnReplay').onclick=()=>{ hideOverlay(); if(window.Game) window.Game.restart(); };
    } catch(e) {
      showOverlay(`
        <h2>排行榜</h2>
        <p style="color:#fca5a5">无法连接服务器</p>
        <p>你的分数: <span style="color:#fde68a;font-size:28px">${currentScore}</span></p>
        <button class="btn" id="btnReplay2">🎮 再次挑战</button>
      `);
      document.getElementById('btnReplay2').onclick=()=>{ hideOverlay(); if(window.Game) window.Game.restart(); };
    }
  }

  async function submitScore(name, score) {
    try {
      await fetch(`${API_BASE}/scores`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score})});
    } catch(e){}
    showLeaderboard(score);
  }

  return {drawTitle,drawLevelClear,drawGameOver,drawCelebration,showFinalScreen,showLeaderboard,submitScore,hideOverlay};
})();
