// ============================================================
// ui.js — UI 系统：标题画面、过关动画、公主庆典、排行榜
// ============================================================

const UI = (() => {
  const W = 800, H = 500;
  const API_BASE = window.GAME_API_BASE || 'http://localhost:8000';

  let frame = 0;

  function showOverlay(html) {
    const o = document.getElementById('overlay');
    document.getElementById('overlay-content').innerHTML = html;
    o.classList.remove('hidden');
  }
  function hideOverlay() {
    document.getElementById('overlay').classList.add('hidden');
  }

  // ── 工具函数 ──
  function roundRect(ctx, x, y, w, h, r) {
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
    // 彩虹渐变背景
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#1e1b4b'); bg.addColorStop(0.5,'#312e81'); bg.addColorStop(1,'#1e1b4b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 星星
    for(let i=0;i<70;i++){
      const sx=(i*137+50)%W, sy=(i*97+20)%(H*0.7);
      const sa=0.3+Math.sin(f*0.04+i)*0.4;
      const size=1+i%3*0.5;
      ctx.fillStyle=`rgba(255,255,200,${sa})`;
      ctx.beginPath(); ctx.arc(sx,sy,size,0,Math.PI*2); ctx.fill();
    }

    // 飘落粒子
    for(let i=0;i<20;i++){
      const px=((i*113+f*0.8)%W);
      const py=((i*73+f*0.5)%H);
      const colors=['#f9a8d4','#c4b5fd','#fde68a','#6ee7b7'];
      ctx.fillStyle=colors[i%4]; ctx.globalAlpha=0.5+Math.sin(f*0.06+i)*0.3;
      ctx.beginPath(); ctx.arc(px,py,3+i%3,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    // 主标题卡片
    ctx.fillStyle='rgba(255,255,255,0.08)';
    roundRect(ctx,W/2-220,80,440,200,20); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.4)'; ctx.lineWidth=2;
    roundRect(ctx,W/2-220,80,440,200,20); ctx.stroke();

    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=25+Math.sin(f*0.05)*8;
    ctx.fillStyle='#fde68a'; ctx.font='bold 46px Arial'; ctx.textAlign='center';
    ctx.fillText('✨ 勇者三试炼 ✨',W/2,145);
    ctx.restore();

    ctx.fillStyle='#c4b5fd'; ctx.font='18px Arial'; ctx.textAlign='center';
    ctx.fillText('一场充满魔法的冒险！',W/2,182);

    const levels=['🌈 第1关：彩虹王国 — 平台跳跃','🍬 第2关：糖果迷宫 — 吃豆人','🏰 第3关：魔塔圣殿 — RPG策略'];
    levels.forEach((l,i)=>{
      ctx.fillStyle=['#86efac','#f9a8d4','#fbbf24'][i];
      ctx.font='14px Arial'; ctx.textAlign='center';
      ctx.fillText(l,W/2,218+i*22);
    });

    if(Math.floor(f/18)%2===0){
      ctx.fillStyle='#6ee7b7'; ctx.font='bold 19px Arial'; ctx.textAlign='center';
      ctx.shadowColor='#6ee7b7'; ctx.shadowBlur=10;
      ctx.fillText('🎮 按任意键开始冒险',W/2,312);
      ctx.shadowBlur=0;
    }

    // 底部公主预告
    ctx.fillStyle='rgba(255,255,255,0.06)';
    roundRect(ctx,W/2-260,340,520,90,16); ctx.fill();
    ctx.fillStyle='rgba(253,230,138,0.6)'; ctx.font='12px Arial'; ctx.textAlign='center';
    ctx.fillText('🌟 通关后解锁迪士尼公主庆典彩蛋！🌟',W/2,368);
    const princesses=['👸 灰姑娘','🌹 贝儿','❄️ 艾莎','🌊 莫阿娜','🌸 花木兰','🌿 爱洛'];
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='18px Arial';
    ctx.fillText(princesses.join('  '),W/2,400);
    ctx.fillStyle='rgba(196,181,253,0.7)'; ctx.font='12px Arial';
    ctx.fillText('集齐三关，公主们等你！',W/2,422);

    frame=f;
  }

  // ── 关卡完成画面（彩色烟花版）──
  function drawLevelClear(ctx, levelNum, levelScore, totalScore, f) {
    ctx.clearRect(0,0,W,H);
    // 背景
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0f172a'); bg.addColorStop(1,'#1e1b4b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 烟花粒子
    const fireworks=[
      {cx:150,cy:120,color:'#f9a8d4'},{cx:W/2,cy:80,color:'#fde68a'},
      {cx:W-150,cy:110,color:'#86efac'},{cx:200,cy:200,color:'#c4b5fd'},
      {cx:W-200,cy:190,color:'#fb923c'},
    ];
    for(const fw of fireworks){
      for(let i=0;i<12;i++){
        const a=(i/12)*Math.PI*2+f*0.02;
        const r=(30+Math.sin(f*0.08+i)*15);
        const px=fw.cx+Math.cos(a)*r, py=fw.cy+Math.sin(a)*r;
        const alpha=0.4+Math.sin(f*0.1+i)*0.4;
        ctx.fillStyle=fw.color; ctx.globalAlpha=alpha;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha=1;

    // 流动彩带
    for(let i=0;i<15;i++){
      const x=((i*53+f*3)%W);
      const y=((i*37+f*2)%H);
      const colors=['#f9a8d4','#fde68a','#86efac','#c4b5fd','#fb923c'];
      ctx.fillStyle=colors[i%5]; ctx.globalAlpha=0.6;
      ctx.save(); ctx.translate(x,y); ctx.rotate(f*0.05+i);
      ctx.fillRect(-8,-2,16,4); ctx.restore();
    }
    ctx.globalAlpha=1;

    // 通关徽章
    ctx.fillStyle='rgba(255,255,255,0.1)';
    roundRect(ctx,W/2-180,120,360,220,20); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.5)'; ctx.lineWidth=2;
    roundRect(ctx,W/2-180,120,360,220,20); ctx.stroke();

    const icons=['🌈','🍬','🏰'];
    ctx.font='40px Arial'; ctx.textAlign='center';
    ctx.fillText(icons[levelNum-1],W/2,170);

    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=18;
    ctx.fillStyle='#fde68a'; ctx.font='bold 32px Arial'; ctx.textAlign='center';
    ctx.fillText(`第${levelNum}关 通过！ 🎉`,W/2,218);
    ctx.restore();

    ctx.fillStyle='#86efac'; ctx.font='18px Arial'; ctx.textAlign='center';
    ctx.fillText(`本关得分: ${levelScore}`,W/2,258);
    ctx.fillStyle='#fbbf24'; ctx.font='bold 24px Arial';
    ctx.fillText(`累计总分: ${totalScore}`,W/2,292);

    if(Math.floor(f/18)%2===0){
      ctx.fillStyle='#c4b5fd'; ctx.font='16px Arial';
      ctx.fillText(levelNum<3?'▶  按任意键继续':'▶  按任意键见证公主庆典！',W/2,338);
    }
  }

  // ── Game Over ──
  function drawGameOver(ctx, f) {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,400);
    bg.addColorStop(0,'#1c0a0a'); bg.addColorStop(1,'#0a0000');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.shadowColor='#ef4444'; ctx.shadowBlur=30+Math.sin(f*0.08)*10;
    ctx.fillStyle='#ef4444'; ctx.font='bold 56px Arial'; ctx.textAlign='center';
    ctx.fillText('💀 GAME OVER',W/2,H/2-30);
    ctx.restore();
    ctx.fillStyle='#fca5a5'; ctx.font='18px Arial'; ctx.textAlign='center';
    ctx.fillText('勇者倒下了，但传说永不消逝…',W/2,H/2+20);
    if(Math.floor(f/20)%2===0){
      ctx.fillStyle='#f87171'; ctx.font='15px Arial';
      ctx.fillText('按任意键重新挑战本关',W/2,H/2+65);
    }
  }

  // ── 迪士尼公主3D旋转庆典画面 ──
  const PRINCESSES = [
    {name:'灰姑娘', emoji:'👸', color:'#93c5fd', dress:'#3b82f6', desc:'梦想成真'},
    {name:'贝 儿',  emoji:'🌹', color:'#fca5a5', dress:'#ef4444', desc:'智慧勇敢'},
    {name:'艾 莎',  emoji:'❄️', color:'#a5f3fc', dress:'#06b6d4', desc:'冰雪女王'},
    {name:'莫阿娜', emoji:'🌊', color:'#6ee7b7', dress:'#10b981', desc:'勇闯大海'},
    {name:'花木兰', emoji:'🌸', color:'#fda4af', dress:'#e11d48', desc:'巾帼英雄'},
    {name:'爱 洛',  emoji:'🌿', color:'#d9f99d', dress:'#65a30d', desc:'睡美人'},
  ];

  function drawPrincessCard(ctx, p, cx, cy, scale, alpha, rotY) {
    const w=130, h=170, r=14;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(cx,cy);
    // 3D透视：用scaleX模拟旋转
    const scaleX=Math.cos(rotY)*scale;
    if(Math.abs(scaleX)<0.01){ ctx.restore(); return; }
    ctx.scale(scaleX,scale);

    // 卡片背景
    const g=ctx.createLinearGradient(-w/2,-h/2,-w/2,h/2);
    g.addColorStop(0,'rgba(255,255,255,0.95)');
    g.addColorStop(1,p.color+'cc');
    ctx.fillStyle=g;
    roundRect(ctx,-w/2,-h/2,w,h,r); ctx.fill();
    ctx.strokeStyle=p.dress; ctx.lineWidth=3;
    roundRect(ctx,-w/2,-h/2,w,h,r); ctx.stroke();

    // 公主emoji
    ctx.font='52px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.emoji,0,-28);

    // 名字
    ctx.fillStyle=p.dress; ctx.font='bold 15px Arial'; ctx.textBaseline='alphabetic';
    ctx.fillText(p.name,0,28);

    // 描述
    ctx.fillStyle='#374151'; ctx.font='11px Arial';
    ctx.fillText(p.desc,0,50);

    // 装饰星星
    ctx.fillStyle=p.dress; ctx.font='10px Arial';
    ctx.fillText('✦  ✦  ✦',0,72);

    // 高光
    ctx.fillStyle='rgba(255,255,255,0.25)';
    roundRect(ctx,-w/2+6,-h/2+6,w-12,h*0.35,r-6); ctx.fill();

    ctx.restore();
  }

  function drawCelebration(ctx, f) {
    ctx.clearRect(0,0,W,H);

    // 动态彩虹背景
    const t=f*0.012;
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,`hsl(${280+Math.sin(t)*30},60%,20%)`);
    bg.addColorStop(0.5,`hsl(${320+Math.sin(t+1)*30},55%,15%)`);
    bg.addColorStop(1,`hsl(${260+Math.sin(t+2)*30},65%,20%)`);
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // 闪光粒子背景
    for(let i=0;i<60;i++){
      const px=((i*137+f*0.7)%W);
      const py=((i*97+f*0.5)%H);
      const alpha=0.1+Math.sin(f*0.07+i)*0.15;
      const colors=['#fde68a','#f9a8d4','#c4b5fd','#6ee7b7','#fbbf24'];
      ctx.fillStyle=colors[i%5]; ctx.globalAlpha=alpha;
      ctx.beginPath(); ctx.arc(px,py,1.5+i%3,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    // 彩带
    for(let i=0;i<25;i++){
      const rx=((i*71+f*2.5)%W);
      const ry=((i*43+f*1.8)%H);
      const colors=['#f9a8d4','#fde68a','#86efac','#c4b5fd','#fb923c','#a5f3fc'];
      ctx.fillStyle=colors[i%6]; ctx.globalAlpha=0.7;
      ctx.save(); ctx.translate(rx,ry); ctx.rotate(f*0.04+i*0.5);
      ctx.fillRect(-10,-2,20,4);
      ctx.restore();
    }
    ctx.globalAlpha=1;

    // 顶部标题
    ctx.save();
    ctx.shadowColor='#fde68a'; ctx.shadowBlur=20+Math.sin(f*0.08)*6;
    ctx.fillStyle='#fde68a'; ctx.font='bold 30px Arial'; ctx.textAlign='center';
    ctx.fillText('🎊 恭喜通关！公主们来庆祝啦！🎊',W/2,42);
    ctx.restore();

    // 6张公主卡片轮播：3D圆盘旋转
    const CARD_COUNT=PRINCESSES.length;
    const RADIUS=260;
    const angleOffset=f*0.022; // 旋转速度

    // 先画后面的（z排序）
    const cards=PRINCESSES.map((p,i)=>{
      const angle=angleOffset+i*(Math.PI*2/CARD_COUNT);
      const x=W/2+Math.sin(angle)*RADIUS;
      const z=Math.cos(angle); // -1到1
      const y=H/2+10+z*18; // 轻微垂直视差
      const scale=0.65+z*0.35; // 近大远小
      const alpha=0.35+((z+1)/2)*0.65;
      return {p,x,y,scale,alpha,angle,z};
    });
    cards.sort((a,b)=>a.z-b.z);
    cards.forEach(c=>drawPrincessCard(ctx,c.p,c.x,c.y,c.scale,c.alpha,0));

    // 中央展示最近的公主（放大）
    const front=cards[cards.length-1];
    drawPrincessCard(ctx,front.p,front.x,front.y,front.scale*1.08,1,0);

    // 底部分数和按钮提示
    ctx.fillStyle='rgba(0,0,0,0.5)';
    roundRect(ctx,W/2-200,H-70,400,58,14); ctx.fill();
    ctx.strokeStyle='rgba(253,230,138,0.4)'; ctx.lineWidth=1.5;
    roundRect(ctx,W/2-200,H-70,400,58,14); ctx.stroke();
    ctx.fillStyle='#fde68a'; ctx.font='bold 16px Arial'; ctx.textAlign='center';
    ctx.fillText('✨ 三试炼全部完成！勇者万岁！✨',W/2,H-46);
    if(Math.floor(f/20)%2===0){
      ctx.fillStyle='#86efac'; ctx.font='14px Arial';
      ctx.fillText('按任意键提交分数 & 查看排行榜',W/2,H-22);
    }
  }

  // ── 最终通关 + 提交分数 ──
  function showFinalScreen(totalScore, onSubmit, onViewLeaderboard) {
    showOverlay(`
      <h1>🎊 三试炼全部完成！</h1>
      <h2>你是真正的勇者！</h2>
      <div class="score-big">${totalScore}</div>
      <p style="font-size:22px;margin:6px 0">👸 🌹 ❄️ 🌊 🌸 🌿</p>
      <p>输入名字加入公主荣耀排行榜</p>
      <input type="text" id="playerName" maxlength="16" placeholder="你的名字..." />
      <br/>
      <button class="btn" id="btnSubmit">🏆 提交分数</button>
      <button class="btn" id="btnLeaderboard">📊 查看排行榜</button>
    `);
    document.getElementById('btnSubmit').onclick=()=>{
      const name=document.getElementById('playerName').value.trim()||'无名勇者';
      onSubmit(name,totalScore);
    };
    document.getElementById('btnLeaderboard').onclick=onViewLeaderboard;
  }

  // ── 排行榜 ──
  async function showLeaderboard(currentScore) {
    showOverlay(`<h2>⏳ 排行榜加载中...</h2>`);
    try {
      const res=await fetch(`${API_BASE}/scores`);
      const data=await res.json();
      const medals=['🥇','🥈','🥉'];
      const rows=data.map((entry,i)=>{
        const rankClass=i<3?`rank-${i+1}`:'';
        const medal=i<3?medals[i]:`${i+1}.`;
        return `<tr><td class="${rankClass}">${medal}</td><td class="${rankClass}">${entry.name}</td><td>${new Date(entry.created_at).toLocaleDateString('zh-CN')}</td><td>${entry.score}</td></tr>`;
      }).join('');
      showOverlay(`
        <h1>🏆 排行榜</h1>
        <h2>👸 勇者荣耀殿堂 👸</h2>
        <table class="leaderboard">
          <thead><tr><th>#</th><th>名字</th><th>日期</th><th>分数</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="4">暂无记录，快来第一个上榜！</td></tr>'}</tbody>
        </table><br/>
        <button class="btn" id="btnReplay">🎮 再次挑战</button>
      `);
      document.getElementById('btnReplay').onclick=()=>{ hideOverlay(); if(window.Game) window.Game.restart(); };
    } catch(e) {
      showOverlay(`
        <h2>排行榜</h2>
        <p style="color:#fca5a5">无法连接排行榜服务器</p>
        <p>你的分数: <span style="color:#fde68a;font-size:28px">${currentScore}</span></p>
        <p style="font-size:20px">👸 🌹 ❄️ 🌊 🌸 🌿</p>
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

  return {
    drawTitle, drawLevelClear, drawGameOver,
    drawCelebration,
    showFinalScreen, showLeaderboard, submitScore, hideOverlay,
  };
})();
