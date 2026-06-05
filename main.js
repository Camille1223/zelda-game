// ============================================================
// main.js — 游戏主状态机（竖屏全屏版）
// ============================================================

window.Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = 400, H = 700;

  const STATE = {
    TITLE:'title', LEVEL1:'level1', LEVEL1_CLEAR:'level1_clear',
    LEVEL2:'level2', LEVEL2_CLEAR:'level2_clear',
    LEVEL3:'level3', LEVEL3_CLEAR:'level3_clear',
    CELEBRATE:'celebrate', GAMEOVER:'gameover', FINAL:'final',
  };

  let state = STATE.TITLE;
  let frame = 0, clearFrame = 0, celebrateFrame = 0;
  let scores = { level1:0, level2:0, level3:0 };
  let currentLevel = null, currentLevelNum = 1;

  function isOverlayOpen() {
    return !document.getElementById('overlay').classList.contains('hidden');
  }

  // ── 全屏竖屏缩放 ──
  function resizeCanvas() {
    const sw = window.innerWidth, sh = window.innerHeight;
    const scale = Math.min(sw / W, sh / H);
    const dw = Math.round(W * scale), dh = Math.round(H * scale);
    canvas.style.width  = dw + 'px';
    canvas.style.height = dh + 'px';
    canvas.style.position = 'absolute';
    canvas.style.left = Math.round((sw - dw) / 2) + 'px';
    canvas.style.top  = Math.round((sh - dh) / 2) + 'px';
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 300));
  resizeCanvas();

  // ── 触屏事件 ──
  let touchStartX = 0, touchStartY = 0, swipeFired = false;
  const SWIPE_MIN = 12;

  document.addEventListener('touchstart', e => {
    // overlay 打开时（输入名字/排行榜），完全放行，不做任何游戏操作
    if (isOverlayOpen()) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swipeFired = false;

    // 非游戏关卡界面：点击继续
    if ([STATE.TITLE, STATE.LEVEL1_CLEAR, STATE.LEVEL2_CLEAR,
         STATE.LEVEL3_CLEAR, STATE.GAMEOVER, STATE.CELEBRATE].includes(state)) {
      document.dispatchEvent(new KeyboardEvent('keydown', {code:'Space', bubbles:true}));
    }
    e.preventDefault();
  }, {passive:false});

  document.addEventListener('touchmove', e => {
    // overlay 打开时放行，保证软键盘和滚动正常
    if (isOverlayOpen()) return;

    // 第三关：实时滑动转向
    if (state === STATE.LEVEL3 && currentLevel && !swipeFired) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) >= SWIPE_MIN || Math.abs(dy) >= SWIPE_MIN) {
        const code = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
          : (dy > 0 ? 'ArrowDown'  : 'ArrowUp');
        currentLevel.onKeyDown({code, preventDefault:()=>{}});
        swipeFired = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }
    e.preventDefault();
  }, {passive:false});

  document.addEventListener('touchend', e => {
    // overlay 打开时放行
    if (isOverlayOpen()) return;

    // 第二关：抬手判断方向
    if (state === STATE.LEVEL2 && currentLevel) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= SWIPE_MIN || Math.abs(dy) >= SWIPE_MIN) {
        const code = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
          : (dy > 0 ? 'ArrowDown'  : 'ArrowUp');
        currentLevel.onKeyDown({code, preventDefault:()=>{}});
      }
    }
    e.preventDefault();
  }, {passive:false});

  // ── 第一关触屏按钮 ──
  const touchControls = document.getElementById('touch-controls');
  const btnLeft  = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump  = document.getElementById('btn-jump');

  // ── 第二关方向键 ──
  const dpad      = document.getElementById('dpad');
  const dpadUp    = document.getElementById('dpad-up');
  const dpadDown  = document.getElementById('dpad-down');
  const dpadLeft  = document.getElementById('dpad-left');
  const dpadRight = document.getElementById('dpad-right');

  function bindTouchBtn(btn, code) {
    const down = e => {
      if (isOverlayOpen()) return;
      btn.classList.add('pressed');
      if (currentLevel) currentLevel.onKeyDown({code, preventDefault:()=>{}});
      e.preventDefault();
    };
    const up = e => {
      btn.classList.remove('pressed');
      if (currentLevel) currentLevel.onKeyUp({code, preventDefault:()=>{}});
      if (e) e.preventDefault();
    };
    btn.addEventListener('touchstart',  down, {passive:false});
    btn.addEventListener('touchend',    up,   {passive:false});
    btn.addEventListener('touchcancel', up,   {passive:false});
    btn.addEventListener('mousedown',   down);
    btn.addEventListener('mouseup',     up);
    btn.addEventListener('mouseleave',  up);
  }
  bindTouchBtn(btnLeft,   'ArrowLeft');
  bindTouchBtn(btnRight,  'ArrowRight');
  bindTouchBtn(btnJump,   'Space');
  bindTouchBtn(dpadUp,    'ArrowUp');
  bindTouchBtn(dpadDown,  'ArrowDown');
  bindTouchBtn(dpadLeft,  'ArrowLeft');
  bindTouchBtn(dpadRight, 'ArrowRight');

  function showTouchControls(levelKey) {
    const isL1   = levelKey === STATE.LEVEL1;
    const isDpad = levelKey === STATE.LEVEL2;  // 第三关用滑动，不显示dpad
    touchControls.classList.toggle('hidden',  !isL1);
    touchControls.classList.toggle('visible',  isL1);
    dpad.classList.toggle('hidden',  !isDpad);
    dpad.classList.toggle('visible',  isDpad);
  }

  // ── 状态机 ──
  function totalScore() { return scores.level1 + scores.level2 + scores.level3; }

  function startLevel(mod, key) {
    state = key; currentLevel = mod; mod.init();
    ['keydown','keyup'].forEach(ev => {
      document.removeEventListener(ev, onTitleKey);
      document.removeEventListener(ev, onClearKey);
      document.removeEventListener(ev, onGameOverKey);
      document.removeEventListener(ev, onCelebrateKey);
    });
    document.addEventListener('keydown', mod.onKeyDown);
    document.addEventListener('keyup',   mod.onKeyUp);
    UI.hideOverlay();
    showTouchControls(key);
  }

  function stopLevel() {
    if (currentLevel) {
      document.removeEventListener('keydown', currentLevel.onKeyDown);
      document.removeEventListener('keyup',   currentLevel.onKeyUp);
      currentLevel = null;
    }
    showTouchControls(null);
  }

  function onTitleKey(e) {
    if (isOverlayOpen()) return;
    document.removeEventListener('keydown', onTitleKey);
    currentLevelNum = 1; startLevel(Level1, STATE.LEVEL1);
  }
  function onClearKey(e) {
    if (isOverlayOpen()) return;
    document.removeEventListener('keydown', onClearKey);
    if      (state===STATE.LEVEL1_CLEAR) { currentLevelNum=2; startLevel(Level2,STATE.LEVEL2); }
    else if (state===STATE.LEVEL2_CLEAR) { currentLevelNum=3; startLevel(Level3,STATE.LEVEL3); }
    else if (state===STATE.LEVEL3_CLEAR) {
      state=STATE.CELEBRATE; celebrateFrame=0;
      setTimeout(()=>document.addEventListener('keydown',onCelebrateKey),800);
    }
  }
  function onCelebrateKey(e) {
    if (isOverlayOpen()) return;
    document.removeEventListener('keydown',onCelebrateKey); showFinal();
  }
  function onGameOverKey(e) {
    if (isOverlayOpen()) return;
    document.removeEventListener('keydown',onGameOverKey); restartCurrentLevel();
  }

  function restartCurrentLevel() {
    if      (currentLevelNum===1) { scores.level1=0; startLevel(Level1,STATE.LEVEL1); }
    else if (currentLevelNum===2) { scores.level2=0; startLevel(Level2,STATE.LEVEL2); }
    else                          { scores.level3=0; startLevel(Level3,STATE.LEVEL3); }
  }

  function showClear(n) {
    stopLevel(); clearFrame=0;
    if(n===1) state=STATE.LEVEL1_CLEAR;
    else if(n===2) state=STATE.LEVEL2_CLEAR;
    else state=STATE.LEVEL3_CLEAR;
    setTimeout(()=>document.addEventListener('keydown',onClearKey),500);
  }

  function showFinal() {
    state=STATE.FINAL;
    UI.showFinalScreen(totalScore(),
      (name,score)=>UI.submitScore(name,score),
      ()=>UI.showLeaderboard(totalScore()));
  }

  function restart() {
    scores={level1:0,level2:0,level3:0}; frame=0; currentLevelNum=1;
    state=STATE.TITLE; UI.hideOverlay();
    document.addEventListener('keydown',onTitleKey);
  }

  // ── 主循环 ──
  function loop() {
    frame++;
    ctx.clearRect(0,0,W,H);
    switch(state) {
      case STATE.TITLE: UI.drawTitle(ctx,frame); break;
      case STATE.LEVEL1: case STATE.LEVEL2: case STATE.LEVEL3: {
        const r=currentLevel.update(); currentLevel.draw(ctx);
        if(r&&r.done) {
          const t=r.type; stopLevel();
          if(r.failed){ state=STATE.GAMEOVER; document.addEventListener('keydown',onGameOverKey); }
          else {
            if(t==='level1'){scores.level1=r.score||0;showClear(1);}
            else if(t==='level2'){scores.level2=r.score||0;showClear(2);}
            else{scores.level3=r.score||0;showClear(3);}
          }
        }
        break;
      }
      case STATE.LEVEL1_CLEAR: clearFrame++; UI.drawLevelClear(ctx,1,scores.level1,totalScore(),clearFrame); break;
      case STATE.LEVEL2_CLEAR: clearFrame++; UI.drawLevelClear(ctx,2,scores.level2,totalScore(),clearFrame); break;
      case STATE.LEVEL3_CLEAR: clearFrame++; UI.drawLevelClear(ctx,3,scores.level3,totalScore(),clearFrame); break;
      case STATE.CELEBRATE:    celebrateFrame++; UI.drawCelebration(ctx,celebrateFrame); break;
      case STATE.GAMEOVER:     UI.drawGameOver(ctx,frame); break;
      case STATE.FINAL:        celebrateFrame++; UI.drawCelebration(ctx,celebrateFrame); break;
    }
    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', onTitleKey);
  window.addEventListener('keydown', e=>{
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  loop();
  return {restart};
})();
