(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=n=>Math.round(n).toLocaleString('ru-RU')+' ₽';
const plural=(n,a)=>a[(n%10===1&&n%100!==11)?0:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?1:2];
const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200)};

/* ---------- decode effect for mono captions ---------- */
const GLYPHS='АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789';
function decode(el,dur=900){
  const text=el.dataset.text??el.textContent;el.dataset.text=text;if(reduce)return;
  const t0=performance.now(),L=text.length;
  const f=t=>{const k=Math.min(1,(t-t0)/dur);let out='';for(let i=0;i<L;i++){const c=text[i];out+=(/[\s·:–—.,]/.test(c)||k>=.25+.75*i/L)?c:GLYPHS[(Math.random()*GLYPHS.length)|0]}el.textContent=out;if(k<1)requestAnimationFrame(f)};
  requestAnimationFrame(f);
}

/* ---------- reveal ---------- */
const targets=$$('.wipe,.sweep,.fade,[data-decode]');
const show=el=>{el.classList.remove('pending');el.classList.add('in');if(el.hasAttribute('data-decode'))decode(el)};
if(!reduce&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){show(e.target);io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  targets.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)show(el);else{if(!el.hasAttribute('data-decode'))el.classList.add('pending');io.observe(el)}});
}else targets.forEach(el=>el.classList.add('in'));

/* ---------- rotator (blur swap) ---------- */
const rot=$$('#rot span');let ri=0;
if(!reduce)setInterval(()=>{const cur=rot[ri];cur.classList.replace('on','out');setTimeout(()=>cur.classList.remove('out'),800);ri=(ri+1)%rot.length;rot[ri].classList.add('on')},2800);

/* ---------- counters ---------- */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,to=+el.dataset.count,dec=+(el.dataset.dec||0);
  const out=v=>el.textContent=v.toLocaleString('ru-RU',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  if(reduce){out(to);return}
  const t0=performance.now()+300,dur=1800;
  const tick=t=>{const k=Math.max(0,Math.min(1,(t-t0)/dur)),v=to*(1-Math.pow(1-k,4));out(dec?v:Math.round(v));if(k<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}),{threshold:.3});
$$('[data-count]').forEach(el=>cio.observe(el));

/* ---------- header, progress, cursor light ---------- */
const prog=$('#progress'),spot=$('#spot');
addEventListener('scroll',()=>{const h=document.documentElement;prog.style.transform=`scaleX(${h.scrollTop/(h.scrollHeight-h.clientHeight||1)})`},{passive:true});
if(matchMedia('(hover:hover)').matches&&!reduce){let mx=-999,my=-999,q=false;addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(!q){q=true;requestAnimationFrame(()=>{spot.style.setProperty('--mx',mx+'px');spot.style.setProperty('--my',my+'px');q=false})}},{passive:true})}
const burger=$('#burger'),mm=$('#mm');
burger.onclick=()=>{const o=burger.getAttribute('aria-expanded')==='true';burger.setAttribute('aria-expanded',String(!o));mm.hidden=o};
mm.addEventListener('click',e=>{if(e.target.tagName==='A'){mm.hidden=true;burger.setAttribute('aria-expanded','false')}});

/* ---------- data ---------- */
const SERVICES=[
  {id:'wash',cat:'Мойка',name:'Двухфазная мойка',d:'Бесконтактная пена, ручная мойка в два ведра, сушка воздухом.',price:1450,h:1.5},
  {id:'wash2',cat:'Мойка',name:'Мойка с гидрофобом',d:'Двухфазная мойка и кварцевый силант, который держится 4–6 недель.',price:2450,h:2},
  {id:'disks',cat:'Мойка',name:'Глубокая мойка дисков',d:'Снимаем колёса, моем внутреннюю сторону дисков и суппорты, покрываем диски керамикой.',price:4000,h:2.5},
  {id:'pol1',cat:'Детейлинг',name:'Лёгкая полировка',d:'Один шаг. Убирает паутинку после зимы и возвращает блеск.',price:8000,h:6},
  {id:'pol3',cat:'Детейлинг',name:'Полировка в три шага',d:'С замером толщины лака. Убирает до 90% царапин и голограмм.',price:14000,h:12},
  {id:'glass',cat:'Детейлинг',name:'Полировка фар и стёкол',d:'Убираем желтизну и муть с фар, следы дворников со стекла.',price:3250,h:2},
  {id:'cer',cat:'Защита',name:'Керамика 9H, два слоя',d:'Твёрдое покрытие с гарантией 5 лет. Подготовка и обезжиривание входят в цену.',price:22500,h:10},
  {id:'ppf',cat:'Защита',name:'Плёнка на зоны риска',d:'Капот, бампер, фары, зеркала. Полиуретан 190 мкм, мелкие царапины затягиваются сами.',price:32500,h:16},
  {id:'ppf2',cat:'Защита',name:'Плёнка на весь кузов',d:'Полная оклейка глянцевым или матовым полиуретаном.',price:120000,h:48},
  {id:'dry',cat:'Интерьер',name:'Химчистка салона',d:'Сиденья, потолок, ковры, багажник. Сушим и консервируем пластик.',price:7000,h:6},
  {id:'leather',cat:'Интерьер',name:'Уход за кожей',d:'Чистим, питаем и покрываем кожу защитой от потёртостей.',price:3750,h:3},
  {id:'ozone',cat:'Интерьер',name:'Озонирование',d:'Убираем запах табака, животных и сырости без отдушек.',price:1750,h:1},
];
const CLASSES=[{id:'sedan',n:'Седан',s:'хэтчбек, купе',k:1},{id:'cross',n:'Кроссовер',s:'компактный SUV',k:1.2},{id:'suv',n:'Внедорожник',s:'минивэн, пикап',k:1.4}];
const hrs=h=>{if(h<8)return String(h).replace('.',',')+' ч';const d=Math.ceil(h/8);return d+' '+plural(d,['день','дня','дней'])};

/* ---------- marquee ---------- */
const MQ=['wash','pol3','cer','ppf','dry','ozone','disks'];
const mqHTML=hidden=>MQ.map(id=>{const s=SERVICES.find(x=>x.id===id);return `<a class="mq" href="#calc" data-svc="${id}" ${hidden?'aria-hidden="true" tabindex="-1"':''}><span class="mq-box"><span class="mq-in"><span>${s.name}</span><span class="p">от ${fmt(s.price)}</span></span></span></a>`}).join('');
$('#mqTrack').innerHTML=mqHTML(false)+mqHTML(true);
$('#mqTrack').addEventListener('click',e=>{
  const a=e.target.closest('.mq');if(!a)return;e.preventDefault();
  const cb=document.getElementById('o-'+a.dataset.svc);
  if(cb){cb.checked=true;calc();const row=cb.closest('.opt');row.classList.remove('flash');void row.offsetWidth;row.classList.add('flash')}
  $('#calc').scrollIntoView({behavior:reduce?'auto':'smooth'});toast('Услуга добавлена в калькулятор');
});

/* ---------- services tabs ---------- */
const cats=[...new Set(SERVICES.map(s=>s.cat))],panel=$('#svcPanel');
function showCat(c){
  $$('#tabs .tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.c===c)));
  panel.classList.remove('swap');void panel.offsetWidth;panel.classList.add('swap');
  panel.innerHTML='<ul class="svc-list">'+SERVICES.filter(s=>s.cat===c).map(s=>`<li class="svc"><h3>${s.name}</h3><p>${s.d}</p><span class="time">${hrs(s.h)}</span><span class="price">от ${fmt(s.price)}</span></li>`).join('')+'</ul>';
}
cats.forEach(c=>{const b=document.createElement('button');b.className='tab';b.setAttribute('role','tab');b.dataset.c=c;b.textContent=c;b.onclick=()=>showCat(c);$('#tabs').append(b)});
showCat(cats[0]);

/* ---------- calculator ---------- */
$('#classes').innerHTML=CLASSES.map((c,i)=>`<label><input type="radio" name="cls" id="cls-${c.id}" value="${c.id}" ${i===1?'checked':''}><span class="card"><b>${c.n}</b><small>${c.s} · ×${String(c.k).replace('.',',')}</small></span></label>`).join('');
const pre=['wash2','pol3','cer'];
$('#opts').innerHTML=SERVICES.filter(s=>s.id!=='ppf2').map(s=>`<label class="opt" for="o-${s.id}"><input type="checkbox" id="o-${s.id}" value="${s.id}" ${pre.includes(s.id)?'checked':''}><span><b>${s.name}</b><small>${hrs(s.h)}</small></span><span class="p" data-base="${s.price}"></span></label>`).join('');
let shown=0,anim;
function calc(){
  const k=CLASSES.find(c=>c.id===document.querySelector('[name=cls]:checked').value).k;
  $$('#opts .p').forEach(p=>p.textContent=fmt(+p.dataset.base*k));
  const sel=$$('#opts input:checked').map(i=>SERVICES.find(s=>s.id===i.value));
  const sum=sel.reduce((a,s)=>a+s.price*k,0),h=sel.reduce((a,s)=>a+s.h,0);
  const disc=sel.filter(s=>['pol1','pol3','cer','ppf','glass'].includes(s.id)).reduce((a,s)=>a+s.price*k*.15,0);
  $('#sCount').textContent=sel.length;$('#sTime').textContent=h?hrs(h):'—';$('#sSave').textContent=disc?'−'+fmt(disc):'—';
  cancelAnimationFrame(anim);const from=shown,t0=performance.now();
  const tick=t=>{const q=reduce?1:Math.min(1,(t-t0)/700);shown=from+(sum-from)*(1-Math.pow(1-q,3));$('#total').textContent=fmt(shown);if(q<1)anim=requestAnimationFrame(tick)};
  anim=requestAnimationFrame(tick);return{sel,sum};
}
$('#calcForm').addEventListener('change',calc);calc();

/* ---------- reviews ---------- */
const revs=$$('.rev'),dots=$$('#dots i');let rv=0,rvT;
const showRev=n=>{revs[rv].classList.remove('on');dots[rv].classList.remove('on');rv=(n+revs.length)%revs.length;revs[rv].classList.add('on');dots[rv].classList.add('on')};
const auto=()=>{clearInterval(rvT);if(!reduce)rvT=setInterval(()=>showRev(rv+1),7000)};
$('#revPrev').onclick=()=>{showRev(rv-1);auto()};$('#revNext').onclick=()=>{showRev(rv+1);auto()};auto();
const MINI=[['Игорь','Керамика на новую машину, вода скатывается с капота как с утки.'],['Марина','Химчистка вывела пятно от кофе, которое я считала вечным.'],['Сергей','Сделали фары, ночью дорогу видно заметно лучше.'],['Анна','Записалась онлайн, приехала к своему времени, ждать не пришлось.'],['Павел','Плёнка на капоте после сезона трасс без единого скола.'],['Кирилл','Мастер объяснил, как мыть машину после керамики, и дал памятку.'],['Елена','Озонирование убрало запах от собаки за час.'],['Роман','Полировка в три шага, чёрный цвет как из салона.']];
const miniHTML=hidden=>MINI.map(([n,t])=>`<div class="mini" ${hidden?'aria-hidden="true"':''}><b>${n}<span>★★★★★</span></b>${t}</div>`).join('');
$('#revCol').innerHTML=miniHTML(false)+miniHTML(true);
new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){$('#score').classList.add('in');o.disconnect()}},{threshold:.4}).observe($('#score'));

/* ---------- booking ---------- */
const sSel=$('#bService');
sSel.innerHTML=['Набор из калькулятора',...SERVICES.map(s=>s.name),'Абонемент «Лоск»','Абонемент «Сияние»','Абонемент «Зеркало»','Нужна консультация'].map(o=>`<option value="${o}">${o}</option>`).join('');
sSel.value='Двухфазная мойка';let calcSet='';
$('#toBook').onclick=()=>{
  const{sel,sum}=calc();if(!sel.length){toast('Отметьте хотя бы одну услугу');return}
  calcSet=sel.map(s=>s.name).join(', ')+' · '+fmt(sum);
  sSel.options[0].textContent='Набор: '+calcSet;sSel.selectedIndex=0;
  $('#book').scrollIntoView({behavior:reduce?'auto':'smooth'});toast('Набор перенесён в запись');
};
$$('[data-plan]').forEach(a=>a.addEventListener('click',()=>{sSel.value=a.dataset.plan}));
const DAYS=['вс','пн','вт','ср','чт','пт','сб'],TIMES=['09:00','11:00','13:00','15:00','17:00','19:00'];
let pickDay=null,pickTime=null;const daysEl=$('#days'),slotsEl=$('#slots');
const today=new Date();today.setHours(0,0,0,0);
const key=d=>`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
function busy(k,t){let h=0;for(const c of k+t)h=(h*31+c.charCodeAt(0))%997;return h%3===0}
for(let d=0;d<14;d++){
  const dt=new Date(today);dt.setDate(today.getDate()+d);
  const b=document.createElement('button');b.type='button';b.className='day';b.setAttribute('aria-pressed','false');
  b.dataset.key=key(dt);b.dataset.label=dt.toLocaleDateString('ru-RU',{day:'numeric',month:'long',weekday:'long'});
  b.innerHTML=`<small>${d===0?'сегодня':DAYS[dt.getDay()]}</small><b>${dt.getDate()}</b>`;b.onclick=()=>selectDay(b);daysEl.append(b);
}
$('#dPrev').onclick=()=>daysEl.scrollBy({left:-daysEl.clientWidth,behavior:reduce?'auto':'smooth'});
$('#dNext').onclick=()=>daysEl.scrollBy({left:daysEl.clientWidth,behavior:reduce?'auto':'smooth'});
const nowH=new Date().getHours();
const freeToday=TIMES.filter(t=>!busy(key(today),t)&&parseInt(t)>nowH).length;
$('#liveTxt').textContent=freeToday?`Сегодня свободно ${freeToday} ${plural(freeToday,['окно','окна','окон'])}`:'На сегодня мест нет, завтра есть окна';
function selectDay(b){
  $$('.day').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));pickDay=b;pickTime=null;
  const isToday=b===daysEl.firstChild;slotsEl.innerHTML='';
  TIMES.forEach(t=>{
    const s=document.createElement('button');s.type='button';s.className='slot';s.textContent=t;s.setAttribute('aria-pressed','false');
    s.disabled=busy(b.dataset.key,t)||(isToday&&parseInt(t)<=nowH);
    s.onclick=()=>{$$('.slot').forEach(x=>x.setAttribute('aria-pressed',String(x===s)));pickTime=t};slotsEl.append(s);
  });
}
selectDay(freeToday?daysEl.children[0]:daysEl.children[1]);
const ph=$('#bPhone');
ph.addEventListener('input',()=>{
  let d=ph.value.replace(/\D/g,'');if(d[0]==='8')d='7'+d.slice(1);if(d&&d[0]!=='7')d='7'+d;d=d.slice(0,11);
  const p=[d.slice(1,4),d.slice(4,7),d.slice(7,9),d.slice(9,11)];
  ph.value=d?('+7'+(p[0]?` (${p[0]}`:'')+(p[0].length===3?')':'')+(p[1]?` ${p[1]}`:'')+(p[2]?`-${p[2]}`:'')+(p[3]?`-${p[3]}`:'')):'';
});
const esc=s=>s.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
$('#bookForm').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#bErr'),name=$('#bName').value.trim(),digits=ph.value.replace(/\D/g,'');
  if(!pickTime){err.textContent='Выберите время. Занятые окна зачёркнуты.';return}
  if(!name){err.textContent='Укажите имя, чтобы администратор знал, как к вам обратиться.';$('#bName').focus();return}
  if(digits.length<11){err.textContent='Введите номер полностью: 10 цифр после +7.';ph.focus();return}
  err.textContent='';const svc=sSel.selectedIndex===0&&calcSet?calcSet:sSel.value;
  $('#bookBox').innerHTML=`<div class="done fade in"><span class="eyebrow">Заявка сформирована</span><h3>Спасибо, ${esc(name)}</h3><p class="lead">Администратор перезвонит в течение 15 минут и подтвердит запись.</p><dl><dt>Услуга</dt><dd>${esc(svc)}</dd><dt>Дата</dt><dd>${pickDay.dataset.label}</dd><dt>Время</dt><dd>${pickTime}</dd><dt>Телефон</dt><dd>${esc(ph.value)}</dd></dl><p style="font-size:13px;color:var(--mute);margin-top:8px">Демо-версия: заявка пока никуда не уходит. При запуске форму подключим к CRM или Telegram.</p></div>`;
});
$$('.copy').forEach(b=>b.onclick=()=>{
  const el=document.getElementById(b.dataset.copy),t=el.textContent;
  const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Текст выделен, нажмите Ctrl+C')};
  try{navigator.clipboard.writeText(t).then(()=>toast('Скопировано'),sel)}catch(_){sel()}
});

/* ---------- footer links ---------- */
$$('footer [data-cat]').forEach(a=>a.addEventListener('click',()=>showCat(a.dataset.cat)));
$$('footer [data-doc]').forEach(b=>b.onclick=()=>toast('Документ появится на сайте при запуске'));
$$('.foot-social a').forEach(a=>a.addEventListener('click',()=>toast('Ссылку на мессенджер добавим при запуске')));

/* ---------- big before/after ---------- */
const ba=$('#ba'),rg=$('#baRange');rg.addEventListener('input',()=>ba.style.setProperty('--x',rg.value+'%'));

/* ---------- hero: hexagonal LED ceiling reflected in lacquer ---------- */
const bay=$('#bay'),bc=bay.getContext('2d');
let BW=0,BH=0,bdpr=1,visible=true;
function sizeBay(){bdpr=Math.min(devicePixelRatio||1,1.5);BW=bay.clientWidth;BH=bay.clientHeight;bay.width=BW*bdpr;bay.height=BH*bdpr}
const R=.62,DX=Math.sqrt(3)*R,DZ=1.5*R,PERIOD=2*DZ;
function drawBay(t){
  const c=bc;c.setTransform(bdpr,0,0,bdpr,0,0);c.globalCompositeOperation='source-over';c.fillStyle='#07080b';c.fillRect(0,0,BW,BH);
  const hz=BH*.58,f=Math.max(BW,BH)*.55,cx=BW*(BW>860?.66:.5);
  const zOff=reduce?0:(t*.00018)%PERIOD,scanZ=reduce?6:2+((t*.0012)%16);
  c.globalCompositeOperation='lighter';c.lineCap='round';
  for(const [kind,amp] of [['ceil',1],['refl',.32]]){
    for(let j=0;j<22;j++){
      const zc=.9+j*DZ-zOff;if(zc-R<.35)continue;
      const odd=(j%2)===1,n=Math.ceil(((zc*BW/(f*2))+2*DX)/DX);
      const fog=Math.max(0,Math.min(1,1.6/zc))*Math.max(0,1-zc/30),scan=Math.exp(-Math.pow((zc-scanZ)/1.2,2));
      const a=amp*(fog*.85+scan*.6);if(a<.02)continue;
      const lw=Math.max(.6,f*.008/zc),tint=scan>.3?'150,172,255':'232,238,255';
      for(let i=-n;i<=n;i++){
        const xc=i*DX+(odd?DX/2:0);c.beginPath();
        for(let k=0;k<=6;k++){const ang=Math.PI/6+k*Math.PI/3,vx=xc+R*.9*Math.cos(ang),vz=zc+R*.9*Math.sin(ang);
          const sx=cx+f*vx/vz,sy=kind==='ceil'?hz-f/vz:hz+f*.3025/vz;k?c.lineTo(sx,sy):c.moveTo(sx,sy)}
        c.strokeStyle=`rgba(${tint},${a*.16})`;c.lineWidth=lw*4;c.stroke();
        c.strokeStyle=`rgba(${tint},${a*.9})`;c.lineWidth=lw;c.stroke();
      }
    }
  }
  c.globalCompositeOperation='source-over';
  let g=c.createLinearGradient(0,hz,0,BH);g.addColorStop(0,'rgba(7,8,11,.15)');g.addColorStop(.5,'rgba(7,8,11,.55)');g.addColorStop(1,'rgba(7,8,11,.9)');c.fillStyle=g;c.fillRect(0,hz,BW,BH-hz);
  g=c.createLinearGradient(0,0,BW,0);g.addColorStop(0,'rgba(159,177,255,0)');g.addColorStop(.6,'rgba(200,212,255,.55)');g.addColorStop(1,'rgba(159,177,255,0)');c.fillStyle=g;c.fillRect(0,hz-1,BW,1.5);
  const r2=c.createRadialGradient(cx,hz,0,cx,hz,BW*.35);r2.addColorStop(0,'rgba(100,125,255,.22)');r2.addColorStop(1,'rgba(100,125,255,0)');c.fillStyle=r2;c.fillRect(0,0,BW,BH);
}
/* ---------- hero video: playback from embedded data, reflection, parallax ---------- */
const artMove=$('#artMove'),vid=$('#artVid'),rcv=$('#artRefl'),rx=rcv.getContext('2d');
const P={tx:0,ty:0,rx:0,ry:0},PT={tx:0,ty:0,rx:0,ry:0};
vid.src='assets/wash.mp4';if(!reduce)vid.play().catch(()=>{});
function sizeArt(){const w=rcv.clientWidth,h=rcv.clientHeight;if(!w)return;rcv.width=Math.round(w*.6);rcv.height=Math.round(h*.6);drawRefl(true)}
const posterImg=new Image();posterImg.src=vid.poster;posterImg.onload=()=>drawRefl(true);
function drawRefl(force){
  const src=vid.readyState>=2?vid:(posterImg.complete?posterImg:null);if(!src||!rcv.width)return;
  const sw=src.videoWidth||src.naturalWidth,sh=src.videoHeight||src.naturalHeight;if(!sw)return;
  const W=rcv.width,H=rcv.height,top=sh*.36,bot=sh*.89;
  rx.setTransform(1,0,0,-1,0,H);rx.clearRect(0,0,W,H);
  rx.drawImage(src,0,top,sw,bot-top,0,H-W*(bot-top)/sw,W,W*(bot-top)/sw);
}
if(matchMedia('(hover:hover)').matches&&!reduce)addEventListener('pointermove',e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;PT.tx=-nx*16;PT.ty=-ny*8;PT.ry=nx*4;PT.rx=-ny*2.5},{passive:true});
let fr=0;
function artTick(){
  for(const k in P)P[k]+=(PT[k]-P[k])*.06;
  artMove.style.setProperty('--tx',P.tx.toFixed(2)+'px');artMove.style.setProperty('--ty',P.ty.toFixed(2)+'px');
  artMove.style.setProperty('--rx',P.rx.toFixed(2)+'deg');artMove.style.setProperty('--ry',P.ry.toFixed(2)+'deg');
  if(!vid.paused&&(++fr%2===0))drawRefl();
}
new IntersectionObserver(es=>{if(reduce)return;if(es[0].isIntersecting)vid.play().catch(()=>{});else vid.pause()}).observe($('#art'));
sizeArt();
function loop(t){if(visible&&!document.hidden){drawBay(t);artTick(t)}requestAnimationFrame(loop)}
sizeBay();drawBay(0);if(!reduce)requestAnimationFrame(loop);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(bay);

/* ---------- procedural lacquer panels ---------- */
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
const PRESETS={
  after:{base:['#030405','#10131a','#040506'],beads:0,seed:11,curve:.6},
  before:{base:['#030405','#10131a','#040506'],beads:0,seed:11,curve:.6,dirty:true},
  g1:{base:['#040507','#151821','#05060a'],beads:0,seed:3,curve:.7},
  g2:{base:['#1a0306','#5a0d16','#200408'],beads:120,seed:5,curve:1},
  g3:{base:['#03060f','#0e1a35','#040812'],beads:60,seed:9,curve:.5},
  g4:{base:['#0b0c0e','#2a2d33','#101114'],beads:0,seed:13,curve:.8,foam:true},
  g5:{base:['#0b0d06','#33391e','#0e1008'],beads:40,seed:17,curve:.4},
  hydro:{base:['#050814','#12204a','#060a18'],beads:0,seed:21,curve:.5},
};
function drawBead(c,x,y,r,sq=.92){
  c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(x+r*.25,y+r*.35,r,r*sq,0,0,7);c.fill();
  const bg=c.createRadialGradient(x,y+r*.3,r*.1,x,y,r);bg.addColorStop(0,'rgba(255,255,255,.05)');bg.addColorStop(.8,'rgba(255,255,255,.08)');bg.addColorStop(1,'rgba(255,255,255,.38)');
  c.fillStyle=bg;c.beginPath();c.ellipse(x,y,r,r*sq,0,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.92)';c.beginPath();c.ellipse(x-r*.35,y-r*.4,r*.22,r*.14,-.6,0,7);c.fill();
}
function paintTo(c,w,h,P){
  const Rn=rng(P.seed*7919);
  let g=c.createLinearGradient(0,0,w*.3,h);P.base.forEach((col,i)=>g.addColorStop(i/(P.base.length-1),col));c.fillStyle=g;c.fillRect(0,0,w,h);
  [{y:.22,wd:.07,a:.75},{y:.3,wd:.025,a:.9},{y:.62,wd:.12,a:.28},{y:.78,wd:.02,a:.55}].forEach(s=>{
    const cy=h*s.y,amp=h*.12*P.curve,th=Math.max(h*s.wd,6);
    c.beginPath();c.moveTo(-20,cy+amp);c.bezierCurveTo(w*.3,cy-amp,w*.7,cy-amp*.4,w+20,cy+amp*.6);
    c.lineTo(w+20,cy+amp*.6+th);c.bezierCurveTo(w*.7,cy-amp*.4+th,w*.3,cy-amp+th,-20,cy+amp+th);c.closePath();
    const lg=c.createLinearGradient(0,cy-amp,0,cy+amp+th);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,`rgba(240,244,255,${s.a*(P.dirty?.4:1)})`);lg.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=lg;c.fill();
  });
  const sh=c.createLinearGradient(0,h*.4,0,h*.55);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=sh;c.fillRect(0,h*.4,w,h*.6);
  if(P.dirty){
    c.fillStyle='rgba(120,115,105,.2)';c.fillRect(0,0,w,h);const cx=w*.42,cy=h*.26;c.lineWidth=.6;
    for(let i=0;i<420;i++){const r=20+Rn()*Math.max(w,h)*.7,a0=Rn()*Math.PI*2;c.strokeStyle=`rgba(255,250,240,${.04+Rn()*.14})`;c.beginPath();c.arc(cx,cy,r,a0,a0+.05+Rn()*.18);c.stroke()}
    for(let i=0;i<1600;i++){c.fillStyle=`rgba(200,190,170,${Rn()*.25})`;c.fillRect(Rn()*w,Rn()*h,1+Rn()*1.5,1+Rn()*1.5)}
    for(let i=0;i<40;i++){c.strokeStyle='rgba(220,215,200,.18)';c.lineWidth=1;c.beginPath();c.arc(Rn()*w,Rn()*h,4+Rn()*14,0,7);c.stroke()}
  }else{
    if(P.foam)for(let i=0;i<900;i++){const x=Rn()*w,y=h*.55+Rn()*h*.5,r=2+Rn()*16,fg=c.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);fg.addColorStop(0,'rgba(255,255,255,.75)');fg.addColorStop(.7,'rgba(230,232,236,.35)');fg.addColorStop(1,'rgba(230,232,236,0)');c.fillStyle=fg;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
    for(let i=0;i<P.beads;i++)drawBead(c,Rn()*w,Rn()*h,(Rn()**2)*14+1.5);
  }
  const v=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,w,h);
}
function paint(cv){
  const base=PRESETS[cv.dataset.paint];if(!base)return;
  const P=Object.assign({},base,cv.hasAttribute('data-dirty')?{dirty:true}:{});
  const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(cv._done&&cv.width===Math.round(w*dpr)&&cv.height===Math.round(h*dpr))return;
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const c=cv.getContext('2d');c.scale(dpr,dpr);paintTo(c,w,h,P);cv._done=true;
}
function paintAll(){$$('canvas[data-paint]').forEach(paint)}
paintAll();

/* ---------- works: filters + per-tile before/after under the cursor ---------- */
const tiles=$$('#gallery .tile');
['Все','Полировка','Керамика','Плёнка','Мойка'].forEach((f,i)=>{
  const b=document.createElement('button');b.type='button';b.className='tab';b.textContent=f;b.setAttribute('aria-pressed',String(i===0));b.setAttribute('aria-selected',String(i===0));
  b.onclick=()=>{$$('#filters .tab').forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.setAttribute('aria-pressed',String(x===b))});tiles.forEach(t=>t.classList.toggle('off',f!=='Все'&&!t.dataset.tags.includes(f)));paintAll()};
  $('#filters').append(b);
});
tiles.forEach(t=>{
  const set=x=>{const r=t.getBoundingClientRect();t.style.setProperty('--x',Math.max(0,Math.min(100,(x-r.left)/r.width*100))+'%')};
  t.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')set(e.clientX)});
  t.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')t.style.setProperty('--x','100%')});
  t.addEventListener('click',e=>{if(e.pointerType==='mouse')return;if(t.classList.toggle('show'))set(e.clientX);else t.style.setProperty('--x','100%')});
});

/* ---------- hydrophobic test ---------- */
const HY=$$('.hydro').map(el=>{const cv=el.querySelector('canvas');return{el,cv,c:cv.getContext('2d'),bg:document.createElement('canvas'),side:el.dataset.side,drops:[],w:0,h:0,dpr:1,vis:false,last:0}});
function sizeHydro(H){H.dpr=Math.min(devicePixelRatio||1,2);H.w=H.cv.clientWidth;H.h=H.cv.clientHeight;if(!H.w)return;H.cv.width=H.w*H.dpr;H.cv.height=H.h*H.dpr;H.bg.width=H.cv.width;H.bg.height=H.cv.height;const b=H.bg.getContext('2d');b.setTransform(H.dpr,0,0,H.dpr,0,0);paintTo(b,H.w,H.h,PRESETS.hydro)}
function spawn(H,x,y,n=1){
  for(let i=0;i<n;i++){
    if(H.drops.length>260)H.drops.shift();
    const jx=x+(Math.random()-.5)*24,jy=y+(Math.random()-.5)*24;
    H.drops.push(H.side==='cer'?{x:jx,y:jy,r:2.5+Math.random()*3.5,vy:0,life:Math.random()*1200}:{x:jx,y:jy,r:2,max:10+Math.random()*16,life:0,seed:Math.random()*6});
  }
}
function stepHydro(H,dt){
  const c=H.c;c.setTransform(H.dpr,0,0,H.dpr,0,0);c.drawImage(H.bg,0,0,H.w,H.h);
  const keep=[];
  for(const d of H.drops){
    if(d.dead)continue;d.life+=dt;
    if(H.side==='cer'){
      if(d.r>=6.5||d.life>2600){d.vy+=.00045*dt*(d.r/5);d.y+=d.vy*dt;d.x+=Math.sin((d.y+d.r*13)*.02)*.15}
      for(const o of H.drops){if(o!==d&&!o.dead&&o.r<=d.r&&Math.abs(o.x-d.x)<d.r+o.r&&Math.abs(o.y-d.y)<d.r+o.r){d.r=Math.min(14,Math.hypot(d.r,o.r));o.dead=true}}
      if(d.y-d.r>H.h)continue;
      if(d.vy>.05){c.strokeStyle='rgba(200,215,255,.08)';c.lineWidth=d.r*.6;c.beginPath();c.moveTo(d.x,d.y-d.r);c.lineTo(d.x,d.y-d.r-Math.min(60,d.vy*120));c.stroke()}
      drawBead(c,d.x,d.y,d.r,.95);
    }else{
      d.r=Math.min(d.max,d.r+dt*.03);d.y+=dt*.004;
      const fade=d.life>5000?Math.max(0,1-(d.life-5000)/3000):1;if(fade<=0)continue;
      c.save();c.globalAlpha=fade;c.translate(d.x,d.y);
      c.fillStyle='rgba(190,200,215,.10)';c.strokeStyle='rgba(230,235,245,.28)';c.lineWidth=1;c.beginPath();
      for(let k=0;k<=12;k++){const a=k/12*Math.PI*2,rr=d.r*(1+.22*Math.sin(a*3+d.seed)+.12*Math.cos(a*5+d.seed));k?c.lineTo(Math.cos(a)*rr*1.3,Math.sin(a)*rr*.8):c.moveTo(Math.cos(a)*rr*1.3,Math.sin(a)*rr*.8)}
      c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-d.r*.4,-d.r*.2,d.r*.25,d.r*.08,-.3,0,7);c.fill();c.restore();
    }
    keep.push(d);
  }
  H.drops=keep;
}
HY.forEach(H=>{
  sizeHydro(H);
  const at=e=>{const r=H.cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
  H.el.addEventListener('pointermove',e=>{const[x,y]=at(e),now=performance.now();if(now-H.last>40){H.last=now;HY.forEach(o=>spawn(o,x*o.w,y*o.h,2))}});
  H.el.addEventListener('pointerdown',e=>{const[x,y]=at(e);HY.forEach(o=>spawn(o,x*o.w,y*o.h,6))});
  new IntersectionObserver(es=>{H.vis=es[0].isIntersecting}).observe(H.el);
});
let lastT=performance.now(),rainT=0;
function hydroLoop(t){
  const dt=Math.min(50,t-lastT);lastT=t;rainT+=dt;
  if(HY.some(H=>H.vis)){
    if(rainT>260){rainT=0;const fx=Math.random(),fy=Math.random()*.7;HY.forEach(o=>spawn(o,fx*o.w,fy*o.h,1))}
    HY.forEach(H=>{if(H.w)stepHydro(H,dt)});
  }
  requestAnimationFrame(hydroLoop);
}
if(!reduce)requestAnimationFrame(hydroLoop);else HY.forEach(H=>{for(let i=0;i<30;i++)spawn(H,Math.random()*H.w,Math.random()*H.h);stepHydro(H,16)});

let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{$$('canvas[data-paint]').forEach(c=>c._done=false);paintAll();sizeBay();drawBay(performance.now());sizeArt();HY.forEach(sizeHydro)},150)});
})();
