// ============================================================
// ui.js — UI 系统：标题画面、过关动画、排行榜
// ============================================================

const UI = (() => {
  const W = 800, H = 500;
  // 部署后将 RAILWAY_URL 改为你的 Railway 后端地址，例如：
  // const API_BASE = 'https://your-app.up.railway.app';
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

  // 标题画面（Canvas绘制）
  function drawTitle(ctx, f) {
    ctx.clearRect(0,0,W,H);
    // 背景
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a1a0a');
    bg.addColorStop(1,'#1a2a0a');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    // 星星
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137 + 50) % W);
      const sy = ((i * 97 + 30) % (H*0.6));
      const sa = 0.4 + Math.sin(f*0.05 + i)*0.4;
      ctx.fillStyle = `rgba(255,255,200,${sa})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI*2);
      ctx.fill();
    }

    // 三角力量（大）
    Assets.drawTriforce(ctx, W/2-40, 60, 80);

    // 标题
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20 + Math.sin(f*0.05)*8;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 42px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('塞尔达传说', W/2, 200);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#4adf3f';
    ctx.font = '22px Courier New';
    ctx.fillText('— 勇者三试炼 —', W/2, 240);
    ctx.restore();

    // 说明
    ctx.fillStyle = '#aaa';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('第1关: 绿野大地 (平台跳跃)', W/2, 285);
    ctx.fillText('第2关: 地牢迷宫 (吃豆人)', W/2, 308);
    ctx.fillText('第3关: 魔塔圣地 (RPG策略)', W/2, 331);

    // 按任意键开始（闪烁）
    if (Math.floor(f/20) % 2 === 0) {
      ctx.fillStyle = '#4adf3f';
      ctx.font = 'bold 18px Courier New';
      ctx.fillText('按任意键开始冒险', W/2, 385);
    }

    // 小勇者装饰
    Assets.drawHero(ctx, W/2 - 80, 400, 24, 32, -1, Math.floor(f/8)%2);
    Assets.drawHero(ctx, W/2 + 56, 400, 24, 32,  1, Math.floor(f/8)%2);

    // 卢比装饰
    for (let i = 0; i < 5; i++) {
      Assets.drawRuby(ctx, 80 + i*140, 430, 12);
    }

    frame = f;
  }

  // 关卡完成画面
  function drawLevelClear(ctx, levelNum, levelScore, totalScore, f) {
    ctx.clearRect(0,0,W,H);
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a0a1a');
    bg.addColorStop(1,'#1a3a1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    // 粒子效果（简单版）
    for (let i = 0; i < 30; i++) {
      const px = (i * 113 + f * 2) % W;
      const py = ((i * 97 + f) % H);
      const size = 2 + (i%3);
      ctx.fillStyle = i%3===0 ? '#ffd700' : i%3===1 ? '#4adf3f' : '#88eeff';
      ctx.globalAlpha = 0.6 + Math.sin(f*0.1+i)*0.4;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`第${levelNum}关 通过！`, W/2, 160);
    ctx.restore();

    ctx.fillStyle = '#4adf3f';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`本关得分: ${levelScore}`, W/2, 220);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px Courier New';
    ctx.fillText(`累计总分: ${totalScore}`, W/2, 270);

    if (Math.floor(f/20) % 2 === 0) {
      ctx.fillStyle = '#88eeff';
      ctx.font = '18px Courier New';
      ctx.fillText(levelNum < 3 ? '按任意键继续下一关' : '按任意键查看最终结果', W/2, 340);
    }

    Assets.drawTriforce(ctx, W/2-12, 370, 24);
  }

  // 游戏结束（失败）
  function drawGameOver(ctx, f) {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0a0000';
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 52px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, H/2 - 30);
    ctx.restore();

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('勇者倒下了...', W/2, H/2 + 20);

    if (Math.floor(f/20)%2 === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '14px Courier New';
      ctx.fillText('按任意键重新挑战本关', W/2, H/2 + 60);
    }
  }

  // 最终通关 + 提交分数
  function showFinalScreen(totalScore, onSubmit, onViewLeaderboard) {
    showOverlay(`
      <h1>恭喜通关！</h1>
      <h2>三试炼全部完成</h2>
      <div class="score-big">${totalScore}</div>
      <p>请输入你的名字加入排行榜</p>
      <input type="text" id="playerName" maxlength="16" placeholder="勇者名字..." />
      <br/>
      <button class="btn" id="btnSubmit">提交分数</button>
      <button class="btn" id="btnLeaderboard">查看排行榜</button>
    `);
    document.getElementById('btnSubmit').onclick = () => {
      const name = document.getElementById('playerName').value.trim() || '无名勇者';
      onSubmit(name, totalScore);
    };
    document.getElementById('btnLeaderboard').onclick = onViewLeaderboard;
  }

  // 排行榜
  async function showLeaderboard(currentScore) {
    showOverlay(`<h2>排行榜加载中...</h2>`);
    try {
      const res = await fetch(`${API_BASE}/scores`);
      const data = await res.json();
      const rows = data.map((entry, i) => {
        const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `<tr><td class="${rankClass}">${medal}</td><td class="${rankClass}">${entry.name}</td><td>${new Date(entry.created_at).toLocaleDateString('zh-CN')}</td><td>${entry.score}</td></tr>`;
      }).join('');
      showOverlay(`
        <h1>排行榜</h1>
        <h2>勇者荣耀殿堂</h2>
        <table class="leaderboard">
          <thead><tr><th>#</th><th>名字</th><th>日期</th><th>分数</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">暂无记录</td></tr>'}</tbody>
        </table>
        <br/>
        <button class="btn" id="btnReplay">再次挑战</button>
      `);
      document.getElementById('btnReplay').onclick = () => {
        hideOverlay();
        if (window.Game) window.Game.restart();
      };
    } catch(e) {
      showOverlay(`
        <h2>排行榜</h2>
        <p style="color:#ff8888">无法连接排行榜服务器<br/>请确保 server.py 已启动<br/>(python server.py)</p>
        <p>你的分数: <span style="color:#ffd700;font-size:24px">${currentScore}</span></p>
        <button class="btn" id="btnReplay2">再次挑战</button>
      `);
      document.getElementById('btnReplay2').onclick = () => {
        hideOverlay();
        if (window.Game) window.Game.restart();
      };
    }
  }

  async function submitScore(name, score) {
    try {
      await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, score})
      });
    } catch(e) {}
    showLeaderboard(score);
  }

  return {
    drawTitle,
    drawLevelClear,
    drawGameOver,
    showFinalScreen,
    showLeaderboard,
    submitScore,
    hideOverlay,
  };
})();
