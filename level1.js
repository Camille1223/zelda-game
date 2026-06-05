// ============================================================
// level1.js — 关卡1: 彩虹王国（竖屏400×700）
// ============================================================

const Level1 = (() => {
  const W = 400, H = 700;
  const GAME_H = 560;   // 游戏区域高度（底部留给按钮）
  const GRAVITY = 0.5, JUMP_FORCE = -11, SPEED = 3.2;
  const WORLD_W = 2400;

  let keys, cameraX, frame, score, hp, maxHp, player;

  const platforms = [
    {x:0,    y:500, w:300,  h:60, color:'#4ade80'},
    {x:340,  y:500, w:180,  h:60, color:'#4ade80'},
    {x:560,  y:500, w:240,  h:60, color:'#4ade80'},
    {x:850,  y:500, w:160,  h:60, color:'#4ade80'},
    {x:1060, y:500, w:300,  h:60, color:'#4ade80'},
    {x:1420, y:500, w:260,  h:60, color:'#4ade80'},
    {x:1740, y:500, w:300,  h:60, color:'#4ade80'},
    {x:2100, y:500, w:320,  h:60, color:'#4ade80'},
    // 浮台
    {x:80,   y:420, w:80,  h:16, color:'#fb923c'},
    {x:230,  y:375, w:70,  h:16, color:'#facc15'},
    {x:380,  y:415, w:75,  h:16, color:'#f472b6'},
    {x:510,  y:370, w:70,  h:16, color:'#a78bfa'},
    {x:640,  y:420, w:80,  h:16, color:'#34d399'},
    {x:780,  y:385, w:70,  h:16, color:'#fb923c'},
    {x:900,  y:435, w:70,  h:16, color:'#facc15'},
    {x:1020, y:395, w:70,  h:16, color:'#f472b6'},
    {x:1140, y:430, w:80,  h:16, color:'#60a5fa'},
    {x:1280, y:390, w:70,  h:16, color:'#a78bfa'},
    {x:1380, y:425, w:70,  h:16, color:'#34d399'},
    {x:1500, y:385, w:75,  h:16, color:'#fb923c'},
    {x:1620, y:420, w:70,  h:16, color:'#facc15'},
    {x:1760, y:400, w:70,  h:16, color:'#f472b6'},
    {x:1880, y:435, w:75,  h:16, color:'#60a5fa'},
    {x:2000, y:400, w:70,  h:16, color:'#a78bfa'},
    {x:2130, y:430, w:70,  h:16, color:'#34d399'},
    {x:2260, y:395, w:70,  h:16, color:'#fb923c'},
  ];

  const coins = [
    90,240,395,520,645,790,910,1030,1150,1290,1395,
    1510,1630,1770,1890,2010,2140,2270
  ].map((x,i)=>({x,y:platforms.find(p=>p.x<=x&&x<=p.x+p.w&&p.h===16)?.y-22||470,w:14,h:14,collected:false}));

  const enemies = [
    {x:380, left:340, right:510},
    {x:620, left:560, right:780},
    {x:880, left:850, right:1000},
    {x:1150,left:1060,right:1340},
    {x:1520,left:1420,right:1660},
    {x:1850,left:1740,right:2050},
    {x:2200,left:2100,right:2380},
  ].map((e,i)=>({...e,y:472,w:28,h:28,vx:1.1+i*0.1,alive:true,ef:0}));

  const portal = {x:2340, y:450, w:46, h:56};

  function init() {
    keys={}; cameraX=0; frame=0; score=0; hp=3; maxHp=3;
    coins.forEach(c=>c.collected=false);
    enemies.forEach(e=>{e.alive=true;e.ef=0;});
    player={x:40,y:440,w:26,h:32,vx:0,vy:0,onGround:false,dir:1,invincible:0,walkFrame:0};
    return {type:'level1',done:false};
  }

  function onKeyDown(e){keys[e.code]=true;}
  function onKeyUp(e){keys[e.code]=false;}

  function rectsOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function update() {
    frame++;
    if(player.invincible>0) player.invincible--;
    const left=keys['ArrowLeft']||keys['KeyA'];
    const right=keys['ArrowRight']||keys['KeyD'];
    const jump=keys['ArrowUp']||keys['KeyW']||keys['Space'];

    if(left){player.vx=-SPEED;player.dir=-1;}
    else if(right){player.vx=SPEED;player.dir=1;}
    else player.vx=0;

    if(jump&&player.onGround){player.vy=JUMP_FORCE;player.onGround=false;Assets.playBeep(560,0.07);}
    if((left||right)&&player.onGround&&frame%7===0) player.walkFrame^=1;

    player.vy+=GRAVITY;
    player.x+=player.vx; player.y+=player.vy;
    player.onGround=false;

    for(const p of platforms){
      if(!rectsOverlap(player,p)) continue;
      const ox=Math.min(player.x+player.w,p.x+p.w)-Math.max(player.x,p.x);
      const oy=Math.min(player.y+player.h,p.y+p.h)-Math.max(player.y,p.y);
      if(oy<ox){
        if(player.vy>=0&&player.y+player.h-player.vy<=p.y+4){player.y=p.y-player.h;player.vy=0;player.onGround=true;}
        else if(player.vy<0){player.y=p.y+p.h;player.vy=0;}
      } else {
        player.x=player.vx>0?p.x-player.w:p.x+p.w;player.vx=0;
      }
    }
    if(player.x<0) player.x=0;
    if(player.x+player.w>WORLD_W) player.x=WORLD_W-player.w;
    if(player.y>GAME_H+40){hp--;Assets.playBeep(220,0.3);player.x=40;player.y=440;player.vy=0;}

    cameraX=Math.max(0,Math.min(WORLD_W-W,player.x-W/3));

    for(const c of coins){
      if(!c.collected&&rectsOverlap(player,c)){c.collected=true;score+=10;Assets.playBeep(700,0.07);}
    }
    for(const e of enemies){
      if(!e.alive) continue;
      e.x+=e.vx; e.ef++;
      if(e.x<e.left||e.x+e.w>e.right) e.vx*=-1;
      if(rectsOverlap(player,e)&&player.invincible<=0){
        if(player.vy>0&&player.y+player.h-player.vy<e.y+e.h*0.5){
          e.alive=false;score+=50;player.vy=-9;Assets.playBeep(330,0.1);
        } else {
          hp--;player.invincible=80;Assets.playBeep(220,0.25,'sawtooth');
        }
      }
    }
    if(rectsOverlap(player,portal)){score+=hp*50;return{type:'level1',done:true,score};}
    if(hp<=0) return{type:'level1',done:true,score,failed:true};
    return null;
  }

  function drawBg(ctx,cam){
    const sky=ctx.createLinearGradient(0,0,0,GAME_H);
    sky.addColorStop(0,'#bfdbfe');sky.addColorStop(0.6,'#e0f2fe');sky.addColorStop(1,'#bbf7d0');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,GAME_H);
    // 云
    const clouds=[{x:60,y:50,s:0.7},{x:200,y:35,s:0.6},{x:320,y:60,s:0.8}];
    for(const cl of clouds){
      const cx=((cl.x-cam*0.2)%(W+150)+W+150)%(W+150)-75;
      drawCloud(ctx,cx,cl.y,cl.s);
    }
    ctx.fillStyle='#86efac';
    for(let i=0;i<5;i++){
      const mx=((i*480-cam*0.12)%(W+300)+W+300)%(W+300)-150;
      ctx.beginPath();ctx.ellipse(mx,GAME_H-15,130,90,0,Math.PI,0);ctx.fill();
    }
    ctx.fillStyle='#4ade80';
    for(let i=0;i<7;i++){
      const mx=((i*350-cam*0.28)%(W+200)+W+200)%(W+200)-100;
      ctx.beginPath();ctx.ellipse(mx,GAME_H-8,90,60,0,Math.PI,0);ctx.fill();
    }
  }

  function drawCloud(ctx,x,y,s){
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.beginPath();ctx.ellipse(x,y,45*s,24*s,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+35*s,y-6*s,32*s,20*s,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x-25*s,y-3*s,28*s,17*s,0,0,Math.PI*2);ctx.fill();
  }

  function draw(ctx){
    ctx.clearRect(0,0,W,H);
    drawBg(ctx,cameraX);
    // 底部HUD区域背景
    ctx.fillStyle='rgba(255,255,255,0.82)';
    ctx.fillRect(0,GAME_H,W,H-GAME_H);

    ctx.save();ctx.translate(-cameraX,0);
    // 平台
    for(const p of platforms){
      if(p.x+p.w<cameraX-10||p.x>cameraX+W+10) continue;
      ctx.fillStyle=p.color;
      roundRect(ctx,p.x,p.y,p.w,p.h,p.h>20?10:6);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.3)';
      roundRect(ctx,p.x+3,p.y+2,p.w-6,p.h>20?p.h*0.3:5,4);ctx.fill();
    }
    // 金币
    for(const c of coins){
      if(c.collected||c.x<cameraX-20||c.x>cameraX+W+20) continue;
      const pulse=1+Math.sin(frame*0.12+c.x*0.01)*0.1;
      ctx.save();ctx.translate(c.x+c.w/2,c.y+c.h/2);ctx.scale(pulse,pulse);
      const g2=ctx.createRadialGradient(-2,-2,1,0,0,c.w/2);
      g2.addColorStop(0,'#fef08a');g2.addColorStop(0.5,'#facc15');g2.addColorStop(1,'#ca8a04');
      ctx.fillStyle=g2;ctx.shadowColor='#facc15';ctx.shadowBlur=6;
      ctx.beginPath();ctx.arc(0,0,c.w/2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fef9c3';ctx.font=`bold ${c.w*0.6}px Arial`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,1);
      ctx.restore();
    }
    // 敌人（蘑菇怪）
    for(const e of enemies){
      if(!e.alive||e.x<cameraX-40||e.x>cameraX+W+40) continue;
      const s=e.w, bob=Math.sin(e.ef*0.18)*2;
      ctx.save();
      if(e.vx<0){ctx.translate(e.x+s,e.y+bob);ctx.scale(-1,1);ctx.translate(-s,0);}
      else ctx.translate(e.x,e.y+bob);
      ctx.fillStyle='#f87171';ctx.beginPath();ctx.ellipse(s/2,s*0.65,s*0.46,s*0.36,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#dc2626';ctx.beginPath();ctx.ellipse(s/2,s*0.35,s*0.48,s*0.4,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fca5a5';ctx.beginPath();ctx.ellipse(s/2,s*0.54,s*0.52,s*0.11,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s*0.3,s*0.24,s*0.09,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(s*0.64,s*0.19,s*0.06,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#1c1917';ctx.beginPath();ctx.arc(s*0.35,s*0.59,s*0.07,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(s*0.64,s*0.59,s*0.07,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // 传送门
    const {x:px2,y:py2,w:pw,h:ph}=portal;
    const pcx=px2+pw/2,pcy=py2+ph/2,pulse2=1+Math.sin(frame*0.08)*0.06;
    ctx.save();
    for(let i=3;i>0;i--){ctx.globalAlpha=0.07*i;ctx.fillStyle='#818cf8';ctx.beginPath();ctx.ellipse(pcx,pcy,pw*0.6*pulse2+i*6,ph*0.6*pulse2+i*6,0,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    const pg=ctx.createRadialGradient(pcx,pcy,3,pcx,pcy,pw*0.52);
    pg.addColorStop(0,'#e0e7ff');pg.addColorStop(0.4,'#818cf8');pg.addColorStop(1,'#4338ca');
    ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(pcx,pcy,pw*0.52*pulse2,ph*0.52*pulse2,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<6;i++){const a=frame*0.04+i*Math.PI/3;ctx.fillStyle='#fef08a';ctx.shadowColor='#fef08a';ctx.shadowBlur=4;ctx.beginPath();ctx.arc(pcx+Math.cos(a)*pw*0.46,pcy+Math.sin(a)*ph*0.46,2.5,0,Math.PI*2);ctx.fill();}
    ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('GOAL',pcx,pcy+4);
    ctx.restore();

    // 玩家
    if(!(player.invincible>0&&Math.floor(frame/4)%2===0)){
      const p=player,s=p.w;
      ctx.save();ctx.translate(p.x,p.y);
      if(p.dir<0){ctx.translate(s,0);ctx.scale(-1,1);}
      ctx.fillStyle='#dc2626';roundRect(ctx,2,0,s-4,9,4);ctx.fill();
      ctx.fillStyle='#dc2626';roundRect(ctx,-2,7,s+4,5,3);ctx.fill();
      ctx.fillStyle='#fcd34d';roundRect(ctx,3,11,s-6,11,4);ctx.fill();
      ctx.fillStyle='#1c1917';ctx.beginPath();ctx.arc(s*0.28,16,2.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(s*0.65,16,2.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#92400e';ctx.beginPath();ctx.ellipse(s/2,20,s*0.3,3.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#2563eb';roundRect(ctx,2,22,s-4,9,3);ctx.fill();
      ctx.fillStyle='#dc2626';ctx.fillRect(s*0.3,23,3,9);ctx.fillRect(s*0.57,23,3,9);
      const ll=p.onGround?(p.walkFrame?-3:3):0;
      ctx.fillStyle='#92400e';roundRect(ctx,2,30,s*0.4,6-ll,3);ctx.fill();roundRect(ctx,s*0.47,30,s*0.43,6+ll,3);ctx.fill();
      ctx.fillStyle='#1c1917';roundRect(ctx,0,35-ll,s*0.42+2,5,3);ctx.fill();roundRect(ctx,s*0.45,35+ll,s*0.45+2,5,3);ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // HUD（游戏区顶部）
    ctx.fillStyle='rgba(255,255,255,0.75)';ctx.fillRect(0,0,W,32);
    for(let i=0;i<maxHp;i++){ctx.font='18px Arial';ctx.textAlign='left';ctx.fillText(i<hp?'❤️':'🖤',8+i*24,24);}
    ctx.fillStyle='#7c3aed';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText(`⭐ ${score}`,W/2,22);
    ctx.fillStyle='#059669';ctx.textAlign='right';ctx.fillText('第1关',W-8,22);
  }

  return {init,update,draw,onKeyDown,onKeyUp};
})();
