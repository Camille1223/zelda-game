// ============================================================
// main.js — 游戏主状态机
// ============================================================

window.Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = 800, H = 500;

  const STATE = {
    TITLE:       'title',
    LEVEL1:      'level1',
    LEVEL1_CLEAR:'level1_clear',
    LEVEL2:      'level2',
    LEVEL2_CLEAR:'level2_clear',
    LEVEL3:      'level3',
    LEVEL3_CLEAR:'level3_clear',
    GAMEOVER:    'gameover',
    FINAL:       'final',
  };

  let state = STATE.TITLE;
  let frame = 0;
  let clearFrame = 0;
  let scores = { level1: 0, level2: 0, level3: 0 };
  let currentLevel = null;
  let lastLevelScore = 0;

  function totalScore() {
    return scores.level1 + scores.level2 + scores.level3;
  }

  function startLevel(levelModule, stateKey) {
    state = stateKey;
    currentLevel = levelModule;
    levelModule.init();
    document.removeEventListener('keydown', onTitleKey);
    document.addEventListener('keydown', currentLevel.onKeyDown);
    document.addEventListener('keyup',   currentLevel.onKeyUp);
    UI.hideOverlay();
  }

  function stopLevel() {
    if (currentLevel) {
      document.removeEventListener('keydown', currentLevel.onKeyDown);
      document.removeEventListener('keyup',   currentLevel.onKeyUp);
      currentLevel = null;
    }
  }

  function onTitleKey(e) {
    document.removeEventListener('keydown', onTitleKey);
    startLevel(Level1, STATE.LEVEL1);
  }

  function onClearKey(e) {
    document.removeEventListener('keydown', onClearKey);
    if (state === STATE.LEVEL1_CLEAR) {
      startLevel(Level2, STATE.LEVEL2);
    } else if (state === STATE.LEVEL2_CLEAR) {
      startLevel(Level3, STATE.LEVEL3);
    } else if (state === STATE.LEVEL3_CLEAR) {
      showFinal();
    }
  }

  function onGameOverKey(e) {
    document.removeEventListener('keydown', onGameOverKey);
    restart();
  }

  function showClear(levelNum) {
    stopLevel();
    clearFrame = 0;
    if (levelNum === 1) state = STATE.LEVEL1_CLEAR;
    else if (levelNum === 2) state = STATE.LEVEL2_CLEAR;
    else state = STATE.LEVEL3_CLEAR;
    setTimeout(() => {
      document.addEventListener('keydown', onClearKey);
    }, 500);
  }

  function showFinal() {
    state = STATE.FINAL;
    UI.showFinalScreen(
      totalScore(),
      (name, score) => UI.submitScore(name, score),
      () => UI.showLeaderboard(totalScore())
    );
  }

  function restart() {
    scores = { level1: 0, level2: 0, level3: 0 };
    frame = 0;
    state = STATE.TITLE;
    UI.hideOverlay();
    document.addEventListener('keydown', onTitleKey);
  }

  function loop() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    switch (state) {
      case STATE.TITLE:
        UI.drawTitle(ctx, frame);
        break;

      case STATE.LEVEL1:
      case STATE.LEVEL2:
      case STATE.LEVEL3: {
        const result = currentLevel.update();
        currentLevel.draw(ctx);
        if (result && result.done) {
          const levelType = result.type;
          stopLevel();
          if (result.failed) {
            state = STATE.GAMEOVER;
            document.addEventListener('keydown', onGameOverKey);
          } else {
            if (levelType === 'level1') {
              scores.level1 = result.score || 0;
              lastLevelScore = scores.level1;
              showClear(1);
            } else if (levelType === 'level2') {
              scores.level2 = result.score || 0;
              lastLevelScore = scores.level2;
              showClear(2);
            } else if (levelType === 'level3') {
              scores.level3 = result.score || 0;
              lastLevelScore = scores.level3;
              showClear(3);
            }
          }
        }
        break;
      }

      case STATE.LEVEL1_CLEAR:
        clearFrame++;
        UI.drawLevelClear(ctx, 1, scores.level1, totalScore(), clearFrame);
        break;

      case STATE.LEVEL2_CLEAR:
        clearFrame++;
        UI.drawLevelClear(ctx, 2, scores.level2, totalScore(), clearFrame);
        break;

      case STATE.LEVEL3_CLEAR:
        clearFrame++;
        UI.drawLevelClear(ctx, 3, scores.level3, totalScore(), clearFrame);
        break;

      case STATE.GAMEOVER:
        UI.drawGameOver(ctx, frame);
        break;

      case STATE.FINAL:
        // 背景动画
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0,0,W,H);
        for (let i = 0; i < 40; i++) {
          const x = (i*113+frame*1.5)%W;
          const y = (i*97+frame)%H;
          ctx.fillStyle = i%2===0 ? '#ffd700' : '#4adf3f';
          ctx.globalAlpha = 0.2 + Math.sin(frame*0.05+i)*0.15;
          ctx.beginPath();
          ctx.arc(x,y,2,0,Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
    }

    requestAnimationFrame(loop);
  }

  // 启动
  document.addEventListener('keydown', onTitleKey);
  // 防止空格和方向键滚动页面
  window.addEventListener('keydown', e => {
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });

  loop();

  return { restart };
})();
