// ============================================================
// main.js — 游戏主状态机
// ============================================================

window.Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = 800, H = 500;

  const STATE = {
    TITLE:        'title',
    LEVEL1:       'level1',
    LEVEL1_CLEAR: 'level1_clear',
    LEVEL2:       'level2',
    LEVEL2_CLEAR: 'level2_clear',
    LEVEL3:       'level3',
    LEVEL3_CLEAR: 'level3_clear',
    CELEBRATE:    'celebrate',   // 公主庆典
    GAMEOVER:     'gameover',
    FINAL:        'final',
  };

  let state = STATE.TITLE;
  let frame = 0;
  let clearFrame = 0;
  let celebrateFrame = 0;
  let scores = { level1:0, level2:0, level3:0 };
  let currentLevel = null;
  let currentLevelNum = 1;

  function totalScore() { return scores.level1 + scores.level2 + scores.level3; }

  function startLevel(levelModule, stateKey) {
    state = stateKey;
    currentLevel = levelModule;
    levelModule.init();
    document.removeEventListener('keydown', onTitleKey);
    document.removeEventListener('keydown', onClearKey);
    document.removeEventListener('keydown', onGameOverKey);
    document.removeEventListener('keydown', onCelebrateKey);
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
    currentLevelNum = 1;
    startLevel(Level1, STATE.LEVEL1);
  }

  function onClearKey(e) {
    document.removeEventListener('keydown', onClearKey);
    if (state === STATE.LEVEL1_CLEAR) {
      currentLevelNum = 2;
      startLevel(Level2, STATE.LEVEL2);
    } else if (state === STATE.LEVEL2_CLEAR) {
      currentLevelNum = 3;
      startLevel(Level3, STATE.LEVEL3);
    } else if (state === STATE.LEVEL3_CLEAR) {
      // 进入公主庆典
      state = STATE.CELEBRATE;
      celebrateFrame = 0;
      setTimeout(() => document.addEventListener('keydown', onCelebrateKey), 800);
    }
  }

  function onCelebrateKey(e) {
    document.removeEventListener('keydown', onCelebrateKey);
    showFinal();
  }

  function onGameOverKey(e) {
    document.removeEventListener('keydown', onGameOverKey);
    restartCurrentLevel();
  }

  function restartCurrentLevel() {
    if (currentLevelNum === 1)      { scores.level1=0; startLevel(Level1, STATE.LEVEL1); }
    else if (currentLevelNum === 2) { scores.level2=0; startLevel(Level2, STATE.LEVEL2); }
    else                            { scores.level3=0; startLevel(Level3, STATE.LEVEL3); }
  }

  function showClear(levelNum) {
    stopLevel();
    clearFrame = 0;
    if (levelNum === 1)      state = STATE.LEVEL1_CLEAR;
    else if (levelNum === 2) state = STATE.LEVEL2_CLEAR;
    else                     state = STATE.LEVEL3_CLEAR;
    setTimeout(() => document.addEventListener('keydown', onClearKey), 500);
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
    scores = { level1:0, level2:0, level3:0 };
    frame = 0;
    currentLevelNum = 1;
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
            if (levelType==='level1')      { scores.level1=result.score||0; showClear(1); }
            else if (levelType==='level2') { scores.level2=result.score||0; showClear(2); }
            else if (levelType==='level3') { scores.level3=result.score||0; showClear(3); }
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

      case STATE.CELEBRATE:
        celebrateFrame++;
        UI.drawCelebration(ctx, celebrateFrame);
        break;

      case STATE.GAMEOVER:
        UI.drawGameOver(ctx, frame);
        break;

      case STATE.FINAL:
        // 背景动画（overlay显示时）
        celebrateFrame++;
        UI.drawCelebration(ctx, celebrateFrame);
        break;
    }

    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', onTitleKey);
  window.addEventListener('keydown', e => {
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });

  loop();
  return { restart };
})();
