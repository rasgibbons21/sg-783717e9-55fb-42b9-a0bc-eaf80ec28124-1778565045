'use client';
import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const flowerRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) { onComplete(); return; }
    sessionStorage.setItem('splashShown', 'true');

    const fc = flowerRef.current;
    const bgC = bgRef.current;
    if (!fc || !bgC) return;
    
    const ctx = fc.getContext('2d');
    const bgCtx = bgC.getContext('2d');
    if (!ctx || !bgCtx) return;
    
    const W=280, H=280, CX=140, CY=140;
    let animId: number, chimePlayed=false;

    function clamp01(v: number){return Math.max(0,Math.min(1,v));}
    function prog(s: number,e: number,c: number){return clamp01((c-s)/(e-s));}
    function easeOutCubic(t: number){return 1-Math.pow(1-t,3);}
    function easeOutBack(t: number){const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}

    function drawCherryPetalAt(px: number,py: number,angle: number,size: number,color: string,alpha: number,p: number){
      ctx.save();ctx.translate(px,py);ctx.rotate(angle);ctx.globalAlpha=alpha;
      const L=size*p,W2=size*0.38*p;
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);
      ctx.bezierCurveTo(-W2*0.8,-L*0.25,-W2,-L*0.6,-W2*0.7,-L*0.85);
      ctx.bezierCurveTo(-W2*0.3,-L*1.05,-W2*0.1,-L*0.95,0,-L);
      ctx.bezierCurveTo(W2*0.1,-L*0.95,W2*0.3,-L*1.05,W2*0.7,-L*0.85);
      ctx.bezierCurveTo(W2,-L*0.6,W2*0.8,-L*0.25,0,0);ctx.fill();ctx.restore();
    }

    function drawBlossom(x: number,y: number,size: number,rotation: number,bloomP: number,alpha: number){
      if(bloomP<=0)return;
      const colors=['#f0a0b8','#ebb0c5','#e895aa','#f5b8cc','#e888a8'];
      for(let i=0;i<5;i++){
        const a=rotation+(i/5)*Math.PI*2-Math.PI/2;
        const petalP=easeOutBack(clamp01((bloomP*5-i*0.5)/(5*0.8)));
        drawCherryPetalAt(x,y,a,size,colors[i%5],alpha*petalP,petalP);
      }
      if(bloomP>0.7){
        const sp=clamp01((bloomP-0.7)/0.3);
        for(let i=0;i<12;i++){
          const sa=rotation+(i/12)*Math.PI*2;
          const sl=size*0.32*sp;
          ctx.strokeStyle='#27B7C8';ctx.lineWidth=0.8;ctx.globalAlpha=alpha*sp*0.9;
          ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(sa)*sl,y+Math.sin(sa)*sl);ctx.stroke();
          ctx.fillStyle='#e8b040';ctx.globalAlpha=alpha*sp;
          ctx.beginPath();ctx.arc(x+Math.cos(sa)*sl,y+Math.sin(sa)*sl,1.2,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#f0c060';ctx.globalAlpha=alpha*sp;
        ctx.beginPath();ctx.arc(x,y,3*sp,0,Math.PI*2);ctx.fill();
      }
    }

    function drawBranch(p: number){
      ctx.save();ctx.strokeStyle='#5a3a28';ctx.lineCap='round';
      ctx.lineWidth=4*p;ctx.globalAlpha=p;
      ctx.beginPath();ctx.moveTo(CX-90,CY+100);ctx.quadraticCurveTo(CX-30,CY+20,CX+20,CY-30);ctx.stroke();
      if(p>0.3){const bp=clamp01((p-0.3)/0.7);ctx.lineWidth=2.5*bp;ctx.globalAlpha=bp;
        ctx.beginPath();ctx.moveTo(CX-50,CY+55);ctx.quadraticCurveTo(CX-80,CY+20,CX-70,CY-10);ctx.stroke();
        ctx.beginPath();ctx.moveTo(CX+5,CY-10);ctx.quadraticCurveTo(CX+50,CY-40,CX+60,CY-70);ctx.stroke();}
      ctx.restore();
    }

    const fallingPetals: Array<{x:number, y:number, vx:number, vy:number, rot:number, rotV:number, size:number, alpha:number, delay:number, color:string}> = [];
    function initFallingPetals(){
      fallingPetals.length=0;
      for(let i=0;i<18;i++) fallingPetals.push({x:Math.random()*W,y:-20-Math.random()*100,vx:(Math.random()-0.5)*0.4,vy:0.3+Math.random()*0.5,rot:Math.random()*Math.PI*2,rotV:(Math.random()-0.5)*0.04,size:6+Math.random()*8,alpha:0.4+Math.random()*0.5,delay:1800+Math.random()*2000,color:['#f0a0b8','#ebb0c5','#f5b8cc'][Math.floor(Math.random()*3)]});
    }

    function drawFallingPetals(elapsed: number){
      fallingPetals.forEach(fp=>{
        if(elapsed<fp.delay)return;
        const age=elapsed-fp.delay;
        fp.x+=fp.vx;fp.y+=fp.vy+Math.sin(age*0.002)*0.3;fp.rot+=fp.rotV;
        if(fp.y>H+20){fp.y=-20;fp.x=Math.random()*W;}
        drawCherryPetalAt(fp.x,fp.y,fp.rot,fp.size,fp.color,fp.alpha*clamp01(age/500),1);
      });
    }

    function drawBg(p: number){
      bgCtx.clearRect(0,0,360,560);
      const g=bgCtx.createRadialGradient(180,220,0,180,220,260);
      g.addColorStop(0,`rgba(180,80,110,${p*0.14})`);
      g.addColorStop(0.5,`rgba(80,30,50,${p*0.10})`);
      g.addColorStop(1,'rgba(6,6,10,0)');
      bgCtx.fillStyle=g;bgCtx.fillRect(0,0,360,560);
    }

    function playChime(){
      if(chimePlayed)return;chimePlayed=true;
      try{const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ac=new AudioCtx();
        [[392,0],[494,0.1],[587,0.22],[784,0.38],[988,0.55],[784,0.75],[587,0.95]].forEach(([f,d])=>{
          const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);
          o.type='sine';o.frequency.value=f;const t=ac.currentTime+d;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.12,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+1.6);
          o.start(t);o.stop(t+1.8);});
      }catch { /* ignore */ }
    }

    function render(elapsed: number){
      ctx.clearRect(0,0,W,H);
      const tp=clamp01(elapsed/5000);
      drawBg(easeOutCubic(prog(0.3,0.85,tp)));
      drawBranch(easeOutCubic(prog(0,0.20,tp)));
      drawBlossom(CX-72,CY-18,28,0.3,easeOutBack(prog(0.15,0.42,tp)),0.95);
      drawBlossom(CX+18,CY-68,32,1.1,easeOutBack(prog(0.28,0.55,tp)),0.95);
      drawBlossom(CX-30,CY+38,24,0.7,easeOutBack(prog(0.38,0.65,tp)),0.90);
      drawBlossom(CX+45,CY-45,26,-0.4,easeOutBack(prog(0.48,0.72,tp)),0.92);
      drawBlossom(CX-88,CY-48,22,1.8,easeOutBack(prog(0.55,0.80,tp)),0.88);
      if(elapsed>2200)drawFallingPetals(elapsed);
      if(tp>0.62)playChime();
      if(tp>0.58&&wordmarkRef.current&&taglineRef.current){
        const wp=clamp01((tp-0.58)/0.2);
        wordmarkRef.current.style.opacity=String(wp);
        wordmarkRef.current.style.transform=`translateY(${(1-wp)*14}px)`;
        taglineRef.current.style.opacity=String(clamp01((tp-0.70)/0.2));
      }
    }

    function loop(start: number, now: number){
      render(now-start);
      if(now-start<6200){animId=requestAnimationFrame(t=>loop(start,t));}
      else{onComplete();}
    }

    initFallingPetals();
    requestAnimationFrame(t=>loop(t,t));
    return()=>{if(animId)cancelAnimationFrame(animId);};
  }, [onComplete]);

  return (
    <div style={{position:'fixed',inset:0,background:'#06060a',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{position:'relative',width:360,height:560,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <canvas ref={bgRef} width={360} height={560} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
        <canvas ref={flowerRef} width={280} height={280} style={{position:'relative',zIndex:2,width:280,height:280}}/>
        <div ref={wordmarkRef} style={{position:'relative',zIndex:2,textAlign:'center',marginTop:24,opacity:0,transform:'translateY(14px)',transition:'opacity 1s ease, transform 1s ease'}}>
          <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontWeight:300,fontSize:60,color:'#f5f0ea',letterSpacing:10,lineHeight:1}}>Bloom</div>
          <div style={{fontFamily:'sans-serif',fontSize:10,letterSpacing:5,color:'#27B7C8',textTransform:'uppercase',marginTop:6}}>She Blooms Wealth</div>
        </div>
        <div ref={taglineRef} style={{position:'relative',zIndex:2,fontFamily:'sans-serif',fontSize:10,letterSpacing:3,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',marginTop:10,opacity:0,transition:'opacity 1.2s ease 0.3s'}}>Your money. Your terms. Your future.</div>
      </div>
    </div>
  );
}