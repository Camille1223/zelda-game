// ============================================================
// main.js — 游戏主状态机 + 手机适配
// ============================================================

window.Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const LOGIC_W = 800, LOGIC_H = 500;

  const STATE = {
    TITLE:        'title',
    LEVEL1:       'level1',
    LEVEL1_CLEAR: 'level1_clear',
    LEVEL2:       'level2',
    LEVEL2_CLEAR: 'level2_clear',
    LEVEL3:       'level3',
    LEVEL3_CLEAR: 'level3_clear',
    CELEBRATE:    'celebrate',
    GAMEOVER:     'gameover',
    FINAL:        'final',
  };

  let state = STATE.TITLE;
  let frame = 0, clearFrame = 0, celebrateFrame = 0;
  let scores = { level1:0, level2:0, level3:0 };
  let currentLevel = null, currentLevelNum = 1;

  // ── 屏幕自适应缩放 ──
  function resizeCanvas() {
    const container = document.getElementById('game-container');
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const scale = Math.min(winW / LOGIC_W, winH / LOGIC_H);
    container.style.width  = LOGIC_W + 'px';
    container.style.height = LOGIC_H + 'px';
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'center center';
    // 居中
    container.style.position = 'absolute';
    container.style.left = Math.round((winW - LOGIC_W * scale) / 2) + 'px';
    container.style.top  = Math.round((winH - LOGIC_H * scale) / 2) + 'px';
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 300));
  resizeCanvas();

  // ── 竖屏提示 ──
  const rotateTip = document.getElementById('rotate-tip');
  let ignoreRotate = false;
  function checkOrientation() {
    if (ignoreRotate) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    rotateTip.classList.toggle('show', isPortrait);
  }
  document.getElementById('btnIgnoreRotate').onclick = () => {
    ignoreRotate = true;
    rotateTip.classList.remove('show');
  };
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 300));
  checkOrientation();

  // ── 触屏滑动手势（第2、3关用）──
  let touchStartX = 0, touchStartY = 0;
  const SWIPE_MIN = 30;

  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    // 标题/过关画面点击继续
    if (state === STATE.TITLE || state === STATE.LEVEL1_CLEAR ||
        state === STATE.LEVEL2_CLEAR || state === STATE.LEVEL3_CLEAR ||
        state === STATE.GAMEOVER || state === STATE.CELEBRATE) {
      document.dispatchEvent(new KeyboardEvent('keydown', {code:'Space'}));
    }
    e.preventDefault();
  }, {passive: false});

  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
    let code;
    if (Math.abs(dx) > Math.abs(dy)) {
      code = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
    } else {
      code = dy > 0 ? 'ArrowDown' : 'ArrowUp';
    }
    if (currentLevel) {
      currentLevel.onKeyDown({code, preventDefault:()=>{}});
      currentLevel.onKeyUp({code, preventDefault:()=>{}});
    }
    e.preventDefault();
  }, {passive: false});

  // ── 第一关触屏按钮（左/右/跳）──
  const touchControls = document.getElementById('touch-controls');
  const btnLeft  = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump  = document.getElementById('btn-jump');

  function bindTouchBtn(btn, code) {
    const down = () => { btn.classList.add('pressed'); if(currentLevel) currentLevel.onKeyDown({code, preventDefault:()=>{}}); };
    const up   = () => { btn.classList.remove('pressed'); if(currentLevel) currentLevel.onKeyUp({code, preventDefault:()=>{}}); };
    btn.addEventListener('touchstart', e => { down(); e.preventDefault(); }, {passive:false});
    btn.addEventListener('touchend',   e => { up();   e.preventDefault(); }, {passive:false});
    btn.addEventListener('touchcancel',e => { up();   e.preventDefault(); }, {passive:false});
    btn.addEventListener('mousedown',  down);
    btn.addEventListener('mouseup',    up);
    btn.addEventListener('mouseleave', up);
  }
  bindTouchBtn(btnLeft,  'ArrowLeft');
  bindTouchBtn(btnRight, 'ArrowRight');
  bindTouchBtn(btnJump,  'Space');

  function showTouchControls(show) {
    touchControls.classList.toggle('hidden',  !show);
    touchControls.classList.toggle('visible',  show);
  }

  // ── 状态机 ──
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
    // 第一关显示按钮，其他关隐藏（用滑动）
    showTouchControls(stateKey === STATE.LEVEL1);
  }

  function stopLevel() {
    if (currentLevel) {
      document.removeEventListener('keydown', currentLevel.onKeyDown);
      document.removeEventListener('keyup',   currentLevel.onKeyUp);
      currentLevel = null;
    }
    showTouchControls(false);
  }

  function onTitleKey(e) {
    document.removeEventListener('keydown', onTitleKey);
    currentLevelNum = 1;
    startLevel(Level1, STATE.LEVEL1);
  }

  function onClearKey(e) {
    document.removeEventListener('keydown', onClearKey);
    if (state === STATE.LEVEL1_CLEAR) {
      currentLevelNum = 2; startLevel(Level2, STATE.LEVEL2);
    } else if (state === STATE.LEVEL2_CLEAR) {
      currentLevelNum = 3; startLevel(Level3, STATE.LEVEL3);
    } else if (state === STATE.LEVEL3_CLEAR) {
      state = STATE.CELEBRATE; celebrateFrame = 0;
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
    if      (currentLevelNum===1) { scores.level1=0; startLevel(Level1, STATE.LEVEL1); }
    else if (currentLevelNum===2) { scores.level2=0; startLevel(Level2, STATE.LEVEL2); }
    else                          { scores.level3=0; startLevel(Level3, STATE.LEVEL3); }
  }

  function showClear(levelNum) {
    stopLevel();
    clearFrame = 0;
    if      (levelNum===1) state = STATE.LEVEL1_CLEAR;
    else if (levelNum===2) state = STATE.LEVEL2_CLEAR;
    else                   state = STATE.LEVEL3_CLEAR;
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
    frame = 0; currentLevelNum = 1;
    state = STATE.TITLE;
    UI.hideOverlay();
    document.addEventListener('keydown', onTitleKey);
  }

  // ── 主循环 ──
  function loop() {
    frame++;
    ctx.clearRect(0, 0, LOGIC_W, LOGIC_H);

    switch (state) {
      case STATE.TITLE:
        UI.drawTitle(ctx, frame); break;

      case STATE.LEVEL1:
      case STATE.LEVEL2:
      case STATE.LEVEL3: {
        const result = currentLevel.update();
        currentLevel.draw(ctx);
        if (result && result.done) {
          const t = result.type; stopLevel();
          if (result.failed) {
            state = STATE.GAMEOVER;
            document.addEventListener('keydown', onGameOverKey);
          } else {
            if      (t==='level1') { scores.level1=result.score||0; showClear(1); }
            else if (t==='level2') { scores.level2=result.score||0; showClear(2); }
            else if (t==='level3') { scores.level3=result.score||0; showClear(3); }
          }
        }
        break;
      }

      case STATE.LEVEL1_CLEAR: clearFrame++; UI.drawLevelClear(ctx,1,scores.level1,totalScore(),clearFrame); break;
      case STATE.LEVEL2_CLEAR: clearFrame++; UI.drawLevelClear(ctx,2,scores.level2,totalScore(),clearFrame); break;
      case STATE.LEVEL3_CLEAR: clearFrame++; UI.drawLevelClear(ctx,3,scores.level3,totalScore(),clearFrame); break;

      case STATE.CELEBRATE:
        celebrateFrame++; UI.drawCelebration(ctx, celebrateFrame); break;

      case STATE.GAMEOVER:
        UI.drawGameOver(ctx, frame); break;

      case STATE.FINAL:
        celebrateFrame++; UI.drawCelebration(ctx, celebrateFrame); break;
    }

    requestAnimationFrame(loop);
  }

  // 禁止页面滚动（微信浏览器需要）
  document.addEventListener('touchmove', e => e.preventDefault(), {passive:false});

  document.addEventListener('keydown', onTitleKey);
  window.addEventListener('keydown', e => {
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });

  loop();
  return { restart };
})();
