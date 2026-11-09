// ---------- НАСТРОЙКИ ИГРОКА ----------
let PREF={lang:"ru",sfx:true,mus:false,vol:.5};
try{Object.assign(PREF,JSON.parse(localStorage.getItem("osuPrefs")||"{}"))}catch(e){}
if(!localStorage.getItem("osuPrefs")){const nl=(navigator.language||"ru").slice(0,2);PREF.lang=nl==="es"?"es":nl==="ru"?"ru":"en"}
function savePref(){try{localStorage.setItem("osuPrefs",JSON.stringify(PREF))}catch(e){}}
// ---------- ЗВУК И МУЗЫКА (WebAudio, без файлов) ----------
let ACX=null;function ac(){if(!ACX){try{ACX=new(window.AudioContext||window.webkitAudioContext)()}catch(e){ACX=null}}if(ACX&&ACX.state==="suspended")ACX.resume().catch(()=>{});return ACX}
function tone(f,d,type,v,delay){const c=ac();if(!c)return;const t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();o.type=type||"square";o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(Math.max(.0001,(v||.1)*PREF.vol),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
let sfxLast=0;
function sfx(n){if(!PREF.sfx)return;try{const now=performance.now();if((n==="hit"||n==="crit")&&(typeof skip!=="undefined"&&skip||now-sfxLast<45))return;if(n==="hit"||n==="crit")sfxLast=now;
 const seq=(a,dt,type,v)=>a.forEach((f,i)=>tone(f,.18,type||"square",v||.07,i*dt));
 switch(n){case"click":tone(880,.04,"square",.04);break;case"hit":tone(180+Math.random()*60,.07,"triangle",.09);break;case"crit":tone(620,.08,"sawtooth",.07);tone(930,.12,"square",.05,.05);break;
 case"skill":seq([523,659,784,1047],.05,"square",.06);break;case"win":seq([523,659,784,1047,1319],.09,"square",.07);break;case"lose":seq([392,330,262,196],.12,"triangle",.09);break;
 case"lvl":seq([784,988,1175,1568],.07,"square",.06);break;case"pull":tone(330,.3,"sine",.08);break;
 case"A":seq([659,880,1047],.07,"triangle",.08);break;case"S":seq([659,880,1047,1319],.07,"square",.07);break;case"SS":seq([523,784,1047,1319,1568],.06,"sawtooth",.06);break;
 case"EX":seq([523,659,784,1047,1319,1568,2093],.05,"square",.07);seq([262,330,392],.0,"sawtooth",.05);break}}catch(e){}}
let musT=0,musStep=0;const MUS_CH=[[220,262,330],[175,220,262],[262,330,392],[196,247,294]];
function musicStart(){if(musT||!PREF.mus)return;if(!ac())return;musT=setInterval(()=>{if(!PREF.mus)return musicStop();const ch=MUS_CH[Math.floor(musStep/16)%4],s=musStep%16;
 if(s%4===0)tone(ch[0]/2,.25,"triangle",.07);tone(ch[s%3]*(s%8<4?2:4),.12,"square",.025);if(s%8===4)tone(90,.05,"sawtooth",.03);musStep++},60000/140/4)}
function musicStop(){clearInterval(musT);musT=0}
document.addEventListener("pointerdown",()=>{ac();if(PREF.mus)musicStart()},{once:true});
// ---------- СОБЫТИЯ ДНЯ ----------
const EVENTS=[{n:"Воскресный марафон",d:"x2 награды Арены",k:"arena"},{n:"PP-понедельник",d:"x2 Ⓟ на PP-фарм картах",k:"ppmap"},{n:"Данж-вторник",d:"x2 добыча данжей",k:"dung"},{n:"Золотая среда",d:"x2 золото с боёв",k:"gold"},{n:"Четверг опыта",d:"x2 опыт аккаунта",k:"xp"},{n:"Книжная пятница",d:"x2 книги навыков",k:"books"},{n:"Субботний турнир",d:"x2 награды Арены",k:"arena"}];
const ev=()=>EVENTS[new Date().getUTCDay()];const evm=k=>ev().k===k?2:1;
function untilUTC(days){const d=new Date(),e=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+days));const ms=e-d,h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);return h>=24?`${Math.floor(h/24)}d ${h%24}h`:`${h}h ${m}m`}
// ---------- СМЕННЫЕ БАННЕРЫ ----------
const WEEK=Math.floor((Date.now()/864e5+3)/7);const BIG_CC=["US","RU","JP","KR","PL","DE","CN","BR","FR","CA","GB","TW","PH","ID","CL","AU","FI","VN","UA","AR"];
const BANNERS=[{id:"std",n:"Легенды круга",d:"Стандартный баннер со всеми игроками."},{id:"feat",n:"Фокус недели",d:"Повышенный шанс: 50% S+ и A выпадений — игроки недели"},{id:"cc",n:"Страна недели",d:"Все крутки — игроки из страны недели"},{id:"mode",n:"Режим недели",d:"Все крутки — игроки режима недели"}];
const weekCC=BIG_CC[WEEK%BIG_CC.length],weekMode=["t","c","m","o"][WEEK%4];
function featured(){const hi=POOL.EX.concat(POOL.SS,POOL.S),a=POOL.A;return{s:hi[WEEK%hi.length],a:[a[(WEEK*7919)%a.length],a[(WEEK*104729+13)%a.length]]}}
const FPOOL={};function filtPool(key,rank,fn){const k=key+rank;if(!FPOOL[k])FPOOL[k]=POOL[rank].filter(u=>fn(C(u)));return FPOOL[k]}
function bannerPool(rank){const b=S.banner||"std";if(b==="feat"){const f=featured();if(RI(rank)>=6&&Math.random()<.5)return[f.s];if(rank==="A"&&Math.random()<.5)return f.a}
 if(b==="cc"){const p=filtPool("cc"+weekCC,rank,c=>c.cc===weekCC);if(p.length)return p}if(b==="mode"){const p=filtPool("m"+weekMode,rank,c=>c.mode===weekMode);if(p.length)return p}return POOL[rank].length?POOL[rank]:POOL.F}
function bannerTitle(b){return b.id==="cc"?`${tr(b.n)}: ${weekCC}`:b.id==="mode"?`${tr(b.n)}: ${MODE[weekMode]}`:tr(b.n)}
