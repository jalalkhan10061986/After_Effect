const $=s=>document.querySelector(s),cv=$('#cv'),ctx=cv.getContext('2d'),dlg=$('#dlg');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bn=x=>{const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375};
const E={linear:x=>x,easeIn:x=>x*x*x,easeOut:x=>1-(1-x)**3,easeInOut:x=>x<.5?4*x*x*x:1-(-2*x+2)**3/2,bounce:bn,elastic:x=>x==0||x==1?x:2**(-10*x)*Math.sin((x*10-.75)*2.094)+1,hold:x=>x<1?0:1};
const KEYS=[['x','Position X'],['y','Position Y'],['scale','Scale %'],['rot','Rotation °'],['opacity','Opacity %']];
const BLENDS=['source-over','lighter','multiply','screen','overlay','difference','exclusion','color-dodge'];
let P,sel=null,t=0,playing=false,last=0,hist=[],hi=-1,drag=null,defEase='easeInOut',uid=1,exporting=null,pps=90;
const pr=()=>({x:{v:480,k:[]},y:{v:270,k:[]},scale:{v:100,k:[]},rot:{v:0,k:[]},opacity:{v:100,k:[]}});
function mk(type,name,o={},keys={}){const l=Object.assign({id:uid++,name,type,fill:'#8b7bff',w:200,h:200,text:'Text',size:80,inT:0,out:P.duration,vis:true,blend:'source-over',blur:0,glow:0,br:100,co:100,sa:100,hu:0,gr:0,se:0,rad:0,fh:false,fv:false,sk:'#ffffff',skw:0,lock:true,speed:1,trim:0,vol:100,props:pr()},o);
 for(const k in keys){const a=keys[k];l.props[k].k=a.map(([tt,v,e])=>({t:tt,v,e:e||'easeInOut'}));l.props[k].v=a[0][1]}return l}
function sample(){P={name:'Untitled comp',w:960,h:540,duration:6,fps:30,bg:'#101018',layers:[]};
 P.layers=[
  mk('text','Title',{text:'After Effect',size:104,fill:'#ffffff',glow:12},{y:[[0,330],[1.2,250,'easeOut']],opacity:[[0,0],[1,100]],scale:[[0,90],[1.2,100,'easeOut']]}),
  mk('text','Subtitle',{text:'motion, keyframed',size:34,fill:'#ffc857'},{x:[[.8,300],[1.8,480,'easeOut']],y:[[0,340]],opacity:[[.8,0],[1.6,100]]}),
  mk('star','Star',{fill:'#ff5a36',w:130,h:130,glow:24,blend:'lighter'},{x:[[0,150],[3,810,'easeInOut'],[6,150,'easeInOut']],y:[[0,420],[1.5,400],[3,420],[4.5,400],[6,420]],rot:[[0,0],[6,360,'linear']],scale:[[0,100],[1.5,140],[3,100],[4.5,140],[6,100]]}),
  mk('ellipse','Orb',{fill:'#8b7bff',w:240,h:240,blur:6,blend:'screen'},{x:[[0,480]],y:[[0,300],[3,260],[6,300]],scale:[[0,70],[3,130],[6,70]],opacity:[[0,25],[3,55],[6,25]]}),
  mk('rect','Bar',{fill:'#4ee0b4',w:520,h:6},{y:[[0,372]],scale:[[0,0],[1.6,100,'easeOut']]})];sel=P.layers[0].id}
function val(l,k,tt=t){const p=l.props[k],a=p.k;if(!a.length)return p.v;if(tt<=a[0].t)return a[0].v;const z=a[a.length-1];if(tt>=z.t)return z.v;
 let i=0;while(a[i+1].t<=tt)i++;return a[i].v+(a[i+1].v-a[i].v)*(E[a[i].e]||E.easeInOut)((tt-a[i].t)/(a[i+1].t-a[i].t))}
const cur=()=>P.layers.find(l=>l.id===sel);
const near=a=>a.find(x=>Math.abs(x.t-t)<.5/P.fps);
function setProp(l,k,v){const p=l.props[k];if(p.k.length){const e=near(p.k);if(e)e.v=v;else{p.k.push({t,v,e:defEase});p.k.sort((a,b)=>a.t-b.t)}}else p.v=v}
function sw(l,k){const p=l.props[k];if(p.k.length){p.v=val(l,k);p.k=[]}else p.k=[{t,v:p.v,e:defEase}]}
function keyAll(l){KEYS.forEach(([k])=>{const p=l.props[k],v=val(l,k),e=near(p.k);if(e)e.v=v;else{p.k.push({t,v,e:defEase});p.k.sort((a,b)=>a.t-b.t)}})}
const PRESETS={
 'Fade in':l=>[['opacity',[[0,0],[1,100]]]],'Fade out':l=>[['opacity',[[0,val(l,'opacity')],[1,0]]]],
 'Slide in':l=>{const b=val(l,'x');return[['x',[[0,b-500,'easeOut'],[1,b]]]]},
 'Pop':l=>{const b=val(l,'scale');return[['scale',[[0,0,'easeOut'],[.7,b,'elastic']]]]},
 'Spin':l=>{const b=val(l,'rot');return[['rot',[[0,b],[1.5,b+360]]]]},
 'Drop bounce':l=>{const b=val(l,'y');return[['y',[[0,b-300,'bounce'],[1,b]]]]},
 'Pulse':l=>{const b=val(l,'scale');return[['scale',[[0,b],[.5,b*1.25],[1,b]]]]},
 'Wiggle':l=>{const b=val(l,'rot');return[['rot',[[0,b,'linear'],[.1,b+8,'linear'],[.2,b-8,'linear'],[.3,b+8,'linear'],[.4,b,'linear']]]]},'Ken Burns':l=>{const s=val(l,'scale'),x=val(l,'x'),d=Math.max(1,Math.min(P.duration-t,5));return[['scale',[[0,s],[d,s*1.25,'linear']]],['x',[[0,x],[d,x-40,'linear']]]]},'Zoom out':l=>{const b=val(l,'scale');return[['scale',[[0,b*1.6,'easeOut'],[1,b]]]]}};
function preset(n){const l=cur();if(!l)return;PRESETS[n](l).forEach(([k,arr])=>{const p=l.props[k],m=arr[arr.length-1][0];
 p.k=p.k.filter(a=>a.t<t-1e-6||a.t>t+m+1e-6).concat(arr.map(([d,v,e])=>({t:t+d,v,e:e||'easeInOut'}))).sort((a,b)=>a.t-b.t)});commit();all()}
/* media */
const MEDIA={},SRC={};
function fullJSON(p){return JSON.stringify(P,(k,v)=>v&&v.type&&v.id!=null&&SRC[v.id]?{...v,src:SRC[v.id]}:v,p?2:0)}
function loadP(){for(const k in MEDIA)delete MEDIA[k];for(const k in SRC)delete SRC[k];P.layers.forEach(l=>{if(l.src){SRC[l.id]=l.src;delete l.src}})}
function fstr(l){const f=[];if(l.blur)f.push(`blur(${l.blur}px)`);if((l.br??100)!=100)f.push(`brightness(${l.br}%)`);if((l.co??100)!=100)f.push(`contrast(${l.co}%)`);if((l.sa??100)!=100)f.push(`saturate(${l.sa}%)`);if(l.hu)f.push(`hue-rotate(${l.hu}deg)`);if(l.gr)f.push(`grayscale(${l.gr}%)`);if(l.se)f.push(`sepia(${l.se}%)`);return f.join(' ')||'none'}
function rr(w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(-w/2,-h/2,w,h,r||0):ctx.rect(-w/2,-h/2,w,h)}
function drawBody(l){
 if(l.type==='text'){setFont(l);ctx.fillText(l.text,0,0);if(l.skw){ctx.lineWidth=l.skw;ctx.strokeStyle=l.sk;ctx.strokeText(l.text,0,0)}return}
 if(l.type==='image'||l.type==='video'){const m=MEDIA[l.id],ok=l.type==='image'?m&&m.complete&&m.naturalWidth:m&&m.readyState>=2&&!m.error;
  if(!ok){ctx.save();ctx.shadowBlur=0;rr(l.w,l.h);ctx.setLineDash([10,8]);ctx.strokeStyle='#8b7bff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#8b7bff';ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText(l.type==='video'?(m&&!m.error?'Loading video…':'Re-link this video in the panel'):'Loading…',0,0);ctx.restore();return}
  ctx.save();rr(l.w,l.h,l.rad);ctx.clip();ctx.drawImage(m,-l.w/2,-l.h/2,l.w,l.h);ctx.restore();
  if(l.skw){rr(l.w,l.h,l.rad);ctx.lineWidth=l.skw;ctx.strokeStyle=l.sk;ctx.stroke()}return}
 shape(l);ctx.fill();if(l.skw){ctx.lineWidth=l.skw;ctx.strokeStyle=l.sk;ctx.stroke()}}
function syncVid(l,on){const v=MEDIA[l.id];if(!v||v.error)return;const want=Math.max(0,(t-l.inT)*(l.speed||1)+(l.trim||0));v.playbackRate=l.speed||1;v.muted=!l.vol;v.volume=Math.min(1,(l.vol??100)/100);
 if(on&&playing){if(v.paused)v.play().catch(()=>{});if(Math.abs(v.currentTime-want)>.3)v.currentTime=want}
 else{if(!v.paused)v.pause();if(v.readyState>0&&Math.abs(v.currentTime-want)>.04)v.currentTime=Math.min(want,v.duration||want)}}
function mkVid(l,url){const v=document.createElement('video');v.playsInline=true;v.preload='auto';v.onseeked=v.onloadeddata=v.onerror=()=>draw();v.src=url;MEDIA[l.id]=v;return v}
function hydrate(){P.layers.forEach(l=>{if(MEDIA[l.id])return;if(l.type==='image'&&SRC[l.id]){const i=new Image();i.onload=()=>draw();i.src=SRC[l.id];MEDIA[l.id]=i}else if(l.type==='video'&&l.vurl)mkVid(l,l.vurl)})}
function fit(w,h){const s=Math.min(P.w*.7/w,P.h*.7/h,1);return[Math.round(w*s),Math.round(h*s)]}
function addMedia(fs){[...fs].forEach(f=>f.type.startsWith('image/')?addPhoto(f):f.type.startsWith('video/')&&addVideo(f))}
function addPhoto(f){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{let w=im.naturalWidth,h=im.naturalHeight,src=r.result;
  if(Math.max(w,h)>1600||f.size>1.5e6){const k=Math.min(1,1600/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.88)}
  const[fw,fh]=fit(w,h),l=mk('image',f.name.replace(/\.[^.]+$/,'').slice(0,24),{w:fw,h:fh,ar:w/h,inT:Math.min(t,P.duration-.5)});SRC[l.id]=src;P.layers.unshift(l);sel=l.id;hydrate();commit();all()};im.src=r.result};r.readAsDataURL(f)}
function addVideo(f){const u=URL.createObjectURL(f),l=mk('video',f.name.replace(/\.[^.]+$/,'').slice(0,24),{w:480,h:270,vurl:u,inT:Math.min(t,P.duration-.5)});P.layers.unshift(l);sel=l.id;const v=mkVid(l,u);
 v.onloadedmetadata=()=>{const[fw,fh]=fit(v.videoWidth,v.videoHeight);l.w=fw;l.h=fh;l.ar=v.videoWidth/v.videoHeight;l.out=Math.min(P.duration,l.inT+v.duration);commit();all()};commit();all()}
function fitL(l,m){if(m==='center'){setProp(l,'x',P.w/2);setProp(l,'y',P.h/2);commit();all();return}const ar=l.ar||l.w/l.h,wide=P.w/P.h>ar;
 if(m==='fit'||m==='fill'){const byH=(m==='fit')===wide;l.h=byH?P.h:Math.round(P.w/ar);l.w=byH?Math.round(P.h*ar):P.w}
 if(m==='reset'){l.w=Math.round(P.w*.5);l.h=Math.round(l.w/ar)}
 setProp(l,'x',P.w/2);setProp(l,'y',P.h/2);setProp(l,'scale',100);setProp(l,'rot',0);commit();all()}
function hpts(l){const[w,h]=bounds(l),s=val(l,'scale')/100,a=val(l,'rot')*Math.PI/180,x=val(l,'x'),y=val(l,'y');const T=(px,py)=>[x+(px*Math.cos(a)-py*Math.sin(a))*s,y+(px*Math.sin(a)+py*Math.cos(a))*s];return{c:[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(p=>T(...p)),r:T(0,-h/2-40/s)}}
function mediaUI(l){const m=l.type==='image'||l.type==='video';let h='<h4>Size and shape</h4>';
 if(m)h+=`<div class="f"><span>Keep ratio</span><input type="checkbox" data-s="lock" ${l.lock?'checked':''}></div>`;
 h+=`<div class="f"><span>Flip</span><div class="g2"><label><input type="checkbox" data-s="fh" ${l.fh?'checked':''}>Horiz.</label><label><input type="checkbox" data-s="fv" ${l.fv?'checked':''}>Vert.</label></div></div>`;
 if(l.type!=='text')h+=`<div class="f"><span>Corners</span><input type="range" min="0" max="200" data-s="rad" value="${l.rad||0}"></div>`;
 h+=`<div class="f"><span>Border</span><div class="g2"><input type="color" data-s="sk" value="${l.sk||'#ffffff'}"><input type="number" min="0" data-s="skw" value="${l.skw||0}"></div></div>`;
 if(m)h+='<div class="g2" style="margin:4px 0"><button data-fit="fit">Fit comp</button><button data-fit="fill">Fill comp</button><button data-fit="reset">Reset size</button><button data-fit="center">Center</button></div>';
 if(l.type==='video')h+=`<h4>Video</h4><div class="f"><span>Speed</span><input type="range" min="0.25" max="3" step="0.05" data-s="speed" value="${l.speed||1}"></div><div class="f"><span>Trim start</span><input type="number" min="0" step=".1" data-s="trim" value="${l.trim||0}"></div><div class="f"><span>Volume</span><input type="range" min="0" max="100" data-s="vol" value="${l.vol??100}"></div><button data-relink style="width:100%">Re-link video file</button><p class="hint">Videos stay in this browser session. After a reload, re-link the file.</p>`;return h}
function colorUI(l){const r=(k,n,a,b)=>`<div class="f"><span>${n}</span><input type="range" min="${a}" max="${b}" data-s="${k}" value="${l[k]??(k==='hu'||k==='gr'||k==='se'?0:100)}"></div>`;return'<h4>Color</h4>'+r('br','Brightness',0,300)+r('co','Contrast',0,300)+r('sa','Saturation',0,300)+r('hu','Hue',0,360)+r('gr','Grayscale',0,100)+r('se','Sepia',0,100)}
/* history */
const snap=()=>JSON.stringify({P,sel,uid});
function commit(){hist=hist.slice(0,hi+1);hist.push(snap());hi=hist.length-1;if(hist.length>80){hist.shift();hi--}try{localStorage.setItem('ae-project',fullJSON())}catch(e){}}
function restore(s){const o=JSON.parse(s);P=o.P;sel=o.sel;uid=o.uid;all(true)}
$('#undo').onclick=()=>{if(hi>0){hi--;restore(hist[hi])}};$('#redo').onclick=()=>{if(hi<hist.length-1){hi++;restore(hist[hi])}};
/* drawing */
function shape(l){const w=l.w,h=l.h;ctx.beginPath();
 if(l.type==='rect')ctx.roundRect?ctx.roundRect(-w/2,-h/2,w,h,l.rad||Math.min(8,h/2)):ctx.rect(-w/2,-h/2,w,h);
 else if(l.type==='ellipse')ctx.ellipse(0,0,w/2,h/2,0,0,7);
 else if(l.type==='triangle'){ctx.moveTo(0,-h/2);ctx.lineTo(w/2,h/2);ctx.lineTo(-w/2,h/2);ctx.closePath()}
 else if(l.type==='star'){for(let i=0;i<10;i++){const r=i%2?.45:1,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(Math.cos(a)*w/2*r,Math.sin(a)*h/2*r)}ctx.closePath()}}
function setFont(l){ctx.font=`700 ${l.size}px 'IBM Plex Sans',system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle'}
function bounds(l){if(l.type==='text'){setFont(l);return[ctx.measureText(l.text).width,l.size*1.2]}return[l.w,l.h]}
function xf(l){ctx.translate(val(l,'x'),val(l,'y'));ctx.rotate(val(l,'rot')*Math.PI/180);const s=val(l,'scale')/100;ctx.scale(s,s)}
function draw(){ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.fillStyle=P.bg;ctx.fillRect(0,0,P.w,P.h);
 for(let i=P.layers.length-1;i>=0;i--){const l=P.layers[i],on=l.vis&&t>=l.inT&&t<=l.out;if(l.type==='video')syncVid(l,on);if(!on)continue;
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,val(l,'opacity')/100));ctx.globalCompositeOperation=l.blend;ctx.filter=fstr(l);
  if(l.glow){ctx.shadowColor=l.fill;ctx.shadowBlur=l.glow}xf(l);ctx.scale(l.fh?-1:1,l.fv?-1:1);ctx.fillStyle=l.fill;
  drawBody(l);ctx.restore()}
 const l=!exporting&&cur();if(l&&l.vis){const[w,h]=bounds(l);ctx.save();xf(l);ctx.strokeStyle='#8b7bff';ctx.lineWidth=2/Math.max(.2,val(l,'scale')/100);ctx.strokeRect(-w/2,-h/2,w,h);ctx.restore();const H=hpts(l);ctx.fillStyle='#fff';ctx.strokeStyle='#8b7bff';ctx.lineWidth=2;H.c.forEach(([a,b])=>{ctx.fillRect(a-6,b-6,12,12);ctx.strokeRect(a-6,b-6,12,12)});const tm=[(H.c[0][0]+H.c[1][0])/2,(H.c[0][1]+H.c[1][1])/2];ctx.beginPath();ctx.moveTo(...tm);ctx.lineTo(...H.r);ctx.stroke();ctx.beginPath();ctx.arc(...H.r,8,0,7);ctx.fill();ctx.stroke()}}
/* UI building */
function fmt(s){const m=Math.floor(s/60);return m+':'+(s-m*60).toFixed(2).padStart(5,'0')}
function updTime(){$('#time').textContent=fmt(t)+' / '+fmt(P.duration)+'  f'+Math.round(t*P.fps);const ph=$('.ph');if(ph)ph.style.left=(210+t*pps)+'px'}
function renderTL(){pps=90*$('#zoom').value;const W=P.duration*pps;
 let h=`<div class="inner" style="width:${W+230}px"><div class="row ruler"><div class="lc"></div><div class="tr" data-scrub>`;
 for(let s=0;s<=P.duration;s++)h+=`<i class="tick" style="left:${s*pps}px">${s}s</i>`;h+='</div></div>';
 P.layers.forEach(l=>{const on=l.id===sel;
  h+=`<div class="row${on?' on':''}" data-l="${l.id}"><div class="lc"><button class="eye${l.vis?' v':''}" data-eye="${l.id}" aria-label="Toggle visibility"></button><span class="sw" style="background:${l.fill}"></span><b>${esc(l.name)}</b></div><div class="tr" data-scrub><div class="bar" data-bar="${l.id}" style="left:${l.inT*pps}px;width:${Math.max(4,(l.out-l.inT)*pps)}px"><u data-edge="in"></u><u data-edge="out"></u></div></div></div>`;
  if(on)KEYS.forEach(([k,n])=>{h+=`<div class="row sub"><div class="lc"><em>${n}</em></div><div class="tr" data-scrub>`+l.props[k].k.map((a,i)=>`<s class="kf" data-k="${k}" data-i="${i}" style="left:${a.t*pps}px" title="${a.e}"></s>`).join('')+'</div></div>'})});
 h+=`<div class="ph" style="left:${210+t*pps}px"></div></div>`;$('#tl').innerHTML=h}
function numRow(l,k,n){const p=l.props[k];return`<div class="pr"><span>${n}</span><button data-sw="${k}" class="${p.k.length?'on':''}" title="Toggle animation">◆</button><input type="number" step="${k==='scale'||k==='opacity'?1:.5}" data-p="${k}" value="${(+val(l,k)).toFixed(1)}"></div>`}
function renderProps(){const l=cur(),el=$('#props');if(!l){el.innerHTML='<p class="empty">Select a layer in the timeline or add one from the left to edit its properties.</p>';return}
 const sh=l.type!=='text';
 el.innerHTML=`<h4>Layer</h4><div class="f"><span>Name</span><input type="text" data-s="name" value="${esc(l.name)}"></div>
 <div class="f"><span>Fill</span><input type="color" data-s="fill" value="${l.fill}"></div>
 ${sh?`<div class="f"><span>Size</span><div class="g2"><input type="number" data-s="w" value="${l.w}" aria-label="Width"><input type="number" data-s="h" value="${l.h}" aria-label="Height"></div></div>`
 :`<div class="f"><span>Text</span><input type="text" data-s="text" value="${esc(l.text)}"></div><div class="f"><span>Font size</span><input type="number" data-s="size" value="${l.size}"></div>`}
 <div class="f"><span>In / Out</span><div class="g2"><input type="number" step=".1" data-s="inT" value="${l.inT.toFixed(2)}"><input type="number" step=".1" data-s="out" value="${l.out.toFixed(2)}"></div></div>
 ${mediaUI(l)}<h4>Transform</h4>${KEYS.map(([k,n])=>numRow(l,k,n)).join('')}
 <button id="keyAll" style="width:100%;margin-top:4px">Keyframe all at playhead (K)</button>
 <h4>Easing</h4><div class="f"><span>Keyframe</span><select id="ease">${Object.keys(E).map(e=>`<option ${e===defEase?'selected':''}>${e}</option>`).join('')}</select></div>
 ${colorUI(l)}<h4>Effects</h4>
 <div class="f"><span>Blur</span><input type="number" min="0" data-s="blur" value="${l.blur}"></div>
 <div class="f"><span>Glow</span><input type="number" min="0" data-s="glow" value="${l.glow}"></div>
 <div class="f"><span>Blend</span><select data-s="blend">${BLENDS.map(b=>`<option ${b===l.blend?'selected':''}>${b}</option>`).join('')}</select></div>`}
function syncProps(){const l=cur();if(!l)return;document.querySelectorAll('[data-p]').forEach(i=>{if(i!==document.activeElement)i.value=(+val(l,i.dataset.p)).toFixed(1)})}
function all(full){hydrate();if(full||!$('#props').children.length)renderProps();else renderProps();renderTL();$('#pname').value=P.name;$('#dur').value=P.duration;$('#bg').value=P.bg;draw();updTime()}
/* props events */
$('#props').addEventListener('input',e=>{const l=cur(),i=e.target;if(!l)return;
 if(i.dataset.p){const v=parseFloat(i.value);if(!isNaN(v)){setProp(l,i.dataset.p,v);renderTL();draw()}}
 else if(i.dataset.s){const k=i.dataset.s;l[k]=i.type==='checkbox'?i.checked:(i.type==='number'||i.type==='range')?parseFloat(i.value)||0:i.value;if(l.lock&&l.ar&&(k==='w'||k==='h')){if(k==='w')l.h=Math.round(l.w/l.ar);else l.w=Math.round(l.h*l.ar);const o=$('#props [data-s="'+(k==='w'?'h':'w')+'"]');if(o)o.value=k==='w'?l.h:l.w}if(k==='name'||k==='fill'||k==='inT'||k==='out')renderTL();draw()}});
$('#props').addEventListener('change',e=>{if(e.target.id==='ease'){defEase=e.target.value;const l=cur();KEYS.forEach(([k])=>{const a=near(l.props[k].k);if(a)a.e=defEase});renderTL()}commit();syncProps()});
$('#props').addEventListener('click',e=>{const l=cur(),b=e.target.closest('button');if(!l||!b)return;
 if(b.dataset.sw){sw(l,b.dataset.sw);commit();all()}if(b.id==='keyAll'){keyAll(l);commit();all()}if(b.dataset.fit)fitL(l,b.dataset.fit);if(b.hasAttribute('data-relink'))$('#fRelink').click()});
/* left panel */
$('#adds').innerHTML=['rect','ellipse','star','triangle','text'].map(k=>`<button data-add="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('');
$('#presets').innerHTML=Object.keys(PRESETS).map(n=>`<button data-pre="${n}">${n}</button>`).join('');
$('#left').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.add){const k=b.dataset.add,cols=['#8b7bff','#ff5a36','#4ee0b4','#ffc857','#5ab0ff'];
  const l=mk(k,k[0].toUpperCase()+k.slice(1)+' '+uid,{fill:cols[uid%5],inT:Math.min(t,P.duration-.5)},{});l.out=P.duration;P.layers.unshift(l);sel=l.id;commit();all()}
 if(b.dataset.pre)preset(b.dataset.pre);if(b.dataset.op)op(b.dataset.op)});
function op(o){const i=P.layers.findIndex(l=>l.id===sel);if(i<0)return;
 if(o==='del'){P.layers.splice(i,1);sel=P.layers[Math.min(i,P.layers.length-1)]?.id??null}
 if(o==='dup'){const c=JSON.parse(JSON.stringify(P.layers[i]));const oid=c.id;c.id=uid++;if(SRC[oid])SRC[c.id]=SRC[oid];c.name+=' copy';c.props.x.v+=30;c.props.x.k.forEach(a=>a.v+=30);P.layers.splice(i,0,c);sel=c.id}
 if(o==='up'&&i>0)[P.layers[i-1],P.layers[i]]=[P.layers[i],P.layers[i-1]];
 if(o==='down'&&i<P.layers.length-1)[P.layers[i+1],P.layers[i]]=[P.layers[i],P.layers[i+1]];commit();all()}
/* timeline interaction */
const clampT=v=>Math.max(0,Math.min(P.duration,v));
$('#tl').addEventListener('pointerdown',e=>{const tg=e.target,row=tg.closest('[data-l]'),l=row&&P.layers.find(x=>x.id==+row.dataset.l);
 if(tg.dataset.eye){const x=P.layers.find(a=>a.id==+tg.dataset.eye);x.vis=!x.vis;commit();all();return}
 if(tg.classList.contains('kf')){const l2=cur(),a=l2.props[tg.dataset.k].k,i=+tg.dataset.i;
  if(e.altKey||e.shiftKey){a.splice(i,1);commit();all();return}t=a[i].t;drag={type:'kf',a,i,sx:e.clientX,t0:a[i].t};draw();updTime();return}
 if(l&&sel!==l.id){sel=l.id;all()}
 if(tg.dataset.edge){drag={type:tg.dataset.edge,l,sx:e.clientX,v0:tg.dataset.edge==='in'?l.inT:l.out};return}
 if(tg.dataset.bar){drag={type:'bar',l,sx:e.clientX,i0:l.inT,o0:l.out};return}
 if(tg.closest('.lc')&&l)return;
 const tr=tg.closest('[data-scrub]');if(tr){drag={type:'scrub',left:tr.getBoundingClientRect().left};scrub(e)}});
function scrub(e){t=clampT((e.clientX-drag.left)/pps);if(playing)playing=false,$('#bPlay').textContent='Play';draw();updTime();syncProps()}
/* canvas interaction */
function cpt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*P.w/r.width,(e.clientY-r.top)*P.h/r.height]}
cv.addEventListener('pointerdown',e=>{const[px,py]=cpt(e),sl=cur();
 if(sl&&sl.vis){const H=hpts(sl),R=16*P.w/cv.getBoundingClientRect().width,x=val(sl,'x'),y=val(sl,'y');
  if(Math.hypot(px-H.r[0],py-H.r[1])<R){drag={type:'rot',l:sl};return}
  if(H.c.some(c=>Math.hypot(px-c[0],py-c[1])<R)){drag={type:'scl',l:sl,d0:Math.hypot(px-x,py-y)||1,s0:val(sl,'scale')};return}}
 for(const l of P.layers){if(!l.vis||t<l.inT||t>l.out)continue;const s=val(l,'scale')/100||1,a=-val(l,'rot')*Math.PI/180,dx=px-val(l,'x'),dy=py-val(l,'y');
  const lx=(dx*Math.cos(a)-dy*Math.sin(a))/s,ly=(dx*Math.sin(a)+dy*Math.cos(a))/s,[w,h]=bounds(l);
  if(Math.abs(lx)<=w/2&&Math.abs(ly)<=h/2){sel=l.id;drag={type:'cv',l,px,py,x0:val(l,'x'),y0:val(l,'y')};all();return}}
 sel=null;all()});
document.addEventListener('pointermove',e=>{if(!drag)return;const d=drag;
 if(d.type==='scrub')scrub(e);
 else if(d.type==='rot'){const[px,py]=cpt(e),a=Math.atan2(py-val(d.l,'y'),px-val(d.l,'x'))*180/Math.PI+90;setProp(d.l,'rot',e.shiftKey?Math.round(a/15)*15:a);draw();renderTL();syncProps()}
 else if(d.type==='scl'){const[px,py]=cpt(e);setProp(d.l,'scale',Math.max(1,d.s0*Math.hypot(px-val(d.l,'x'),py-val(d.l,'y'))/d.d0));draw();renderTL();syncProps()}
 else if(d.type==='cv'){const[px,py]=cpt(e);setProp(d.l,'x',d.x0+px-d.px);setProp(d.l,'y',d.y0+py-d.py);draw();renderTL();syncProps()}
 else if(d.type==='kf'){d.a[d.i].t=clampT(d.t0+(e.clientX-d.sx)/pps);t=d.a[d.i].t;renderTL();draw();updTime()}
 else{const dt=(e.clientX-d.sx)/pps,l=d.l;
  if(d.type==='in')l.inT=Math.max(0,Math.min(l.out-.1,d.v0+dt));
  else if(d.type==='out')l.out=Math.min(P.duration,Math.max(l.inT+.1,d.v0+dt));
  else{const len=d.o0-d.i0,s=Math.max(0,Math.min(P.duration-len,d.i0+dt));l.inT=s;l.out=s+len}renderTL();draw()}});
document.addEventListener('pointerup',()=>{if(!drag)return;if(drag.type==='kf')drag.a.sort((a,b)=>a.t-b.t);if(drag.type!=='scrub')commit();drag=null;all()});
/* transport */
function play(on){playing=on;if(!on)Object.values(MEDIA).forEach(m=>m.pause&&m.pause());$('#bPlay').textContent=on?'Pause':'Play';last=performance.now();if(on&&t>=P.duration-.01&&!exporting)t=0}
function tick(now){if(playing){t+=(now-last)/1000;last=now;
  if(t>=P.duration){if(exporting){const r=exporting;exporting=null;t=P.duration;playing=false;$('#bPlay').textContent='Play';r.stop()}
   else if($('#loop').checked)t=0;else{t=P.duration;play(false)}}
  draw();updTime();syncProps()}requestAnimationFrame(tick)}
$('#bPlay').onclick=()=>play(!playing);$('#bStart').onclick=()=>{t=0;draw();updTime();syncProps()};$('#bEnd').onclick=()=>{t=P.duration;draw();updTime();syncProps()};
$('#zoom').oninput=renderTL;
$('#dur').onchange=e=>{P.duration=Math.max(1,Math.min(30,+e.target.value||6));P.layers.forEach(l=>{l.out=Math.min(l.out,P.duration);l.inT=Math.min(l.inT,l.out-.1)});t=Math.min(t,P.duration);commit();all()};
$('#bg').oninput=e=>{P.bg=e.target.value;draw()};$('#bg').onchange=commit;
$('#pname').oninput=e=>{P.name=e.target.value};$('#pname').onchange=commit;
$('#bTheme').onclick=()=>{const d=document.documentElement,light=matchMedia('(prefers-color-scheme:light)').matches;const now=d.dataset.theme||(light?'light':'dark');d.dataset.theme=now==='dark'?'light':'dark'};
$('#bNew').onclick=()=>{if(!confirm('Start a new empty composition?'))return;P={name:'Untitled comp',w:960,h:540,duration:6,fps:30,bg:'#101018',layers:[]};sel=null;t=0;loadP();commit();all()};
/* JSON + render */
function modal(title,html){$('#dt').textContent=title;$('#db').innerHTML=html;dlg.showModal()}
$('#bJson').onclick=()=>{modal('Project JSON',`<textarea id="jt" spellcheck="false">${esc(fullJSON(1))}</textarea><p><button id="jc">Copy</button> <button id="jl" class="pri">Load JSON into editor</button> <span id="jm" class="empty"></span></p><p class="empty">Edit the JSON directly or paste a project, then load it. Your work also autosaves in this browser.</p>`);
 $('#jc').onclick=async()=>{const x=$('#jt');x.select();try{await navigator.clipboard.writeText(x.value);$('#jm').textContent='Copied'}catch(e){$('#jm').textContent='Press Ctrl+C to copy'}};
 $('#jl').onclick=()=>{try{const o=JSON.parse($('#jt').value);if(!o.layers||!o.duration)throw 0;P=o;uid=Math.max(0,...P.layers.map(l=>l.id))+1;sel=P.layers[0]?.id??null;t=0;loadP();commit();all();dlg.close()}catch(e){$('#jm').textContent='That JSON is not a valid project.'}}};
$('#bRender').onclick=()=>{try{const st=cv.captureStream(P.fps),mt=['video/webm;codecs=vp9','video/webm'].find(m=>MediaRecorder.isTypeSupported(m)),rec=new MediaRecorder(st,{mimeType:mt}),ch=[];
 rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
 rec.onstop=()=>{const u=URL.createObjectURL(new Blob(ch,{type:'video/webm'}));modal('Render complete',`<video src="${u}" controls autoplay loop></video><p class="empty">Right-click (or long-press) the video and choose Save video as to keep it.</p>`);draw()};
 exporting=rec;t=0;play(true);rec.start()}catch(e){exporting=null;modal('Render unavailable','<p>This browser cannot record the canvas to video. Try Chrome, Edge or Firefox.</p>')}};
/* keyboard */
document.addEventListener('keydown',e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&document.activeElement.type!=='range'&&document.activeElement.type!=='checkbox';
 if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();$(e.shiftKey?'#redo':'#undo').click();return}
 if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();$('#redo').click();return}
 if(typing)return;
 if(e.code==='Space'){e.preventDefault();$('#bPlay').click()}
 else if(e.key==='k'||e.key==='K'){const l=cur();if(l){keyAll(l);commit();all()}}
 else if(e.key==='Delete'||e.key==='Backspace')op('del');
 else if((e.ctrlKey||e.metaKey)&&e.key==='d'){e.preventDefault();op('dup')}
 else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){t=clampT(t+(e.key==='ArrowRight'?1:-1)/P.fps);draw();updTime();syncProps();$('.ph').style.left=(210+t*pps)+'px'}});
/* uploads */
$('#upPhoto').onclick=()=>$('#fPhoto').click();$('#upVideo').onclick=()=>$('#fVideo').click();
['#fPhoto','#fVideo'].forEach(s=>$(s).onchange=e=>{addMedia(e.target.files);e.target.value=''});
$('#fRelink').onchange=e=>{const l=cur(),f=e.target.files[0];if(l&&f){l.vurl=URL.createObjectURL(f);delete MEDIA[l.id];mkVid(l,l.vurl);commit();all()}e.target.value=''};
const stg=$('#stage');['dragenter','dragover'].forEach(n=>stg.addEventListener(n,e=>{e.preventDefault();stg.classList.add('stage-drop')}));
['dragleave','drop'].forEach(n=>stg.addEventListener(n,e=>{e.preventDefault();stg.classList.remove('stage-drop')}));
stg.addEventListener('drop',e=>addMedia(e.dataTransfer.files));
document.addEventListener('paste',e=>{const f=[...(e.clipboardData?.files||[])];if(f.length)addMedia(f)});
/* boot */
(function(){let ok=false;try{const s=localStorage.getItem('ae-project');if(s){const o=JSON.parse(s);if(o.layers&&o.duration){P=o;uid=Math.max(0,...P.layers.map(l=>l.id))+1;sel=P.layers[0]?.id??null;loadP();ok=true}}}catch(e){}
 if(!ok)sample();commit();all();requestAnimationFrame(tick);if(document.fonts)document.fonts.ready.then(draw)})();
