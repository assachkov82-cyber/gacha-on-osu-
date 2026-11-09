// ---------- НАСТРОЙКИ ОНЛАЙНА ----------
const CFG={
 firebase:{apiKey:"AIzaSyA80Osn_rxK4tfV_0yddmdw2WmHPq0ijvI",authDomain:"gacha-on-osu.firebaseapp.com",projectId:"gacha-on-osu",storageBucket:"gacha-on-osu.firebasestorage.app",messagingSenderId:"256851083330",appId:"1:256851083330:web:19df7a78f7a610417feddb",measurementId:"G-HJP2PZ8CM2"},
 osuClientId:"74801",   // Client ID приложения OAuth на osu.ppy.sh
 osuWorker:"https://gacha-on-osu.vercel.app/api/osu"      // адрес Cloudflare Worker из server/osu-auth-worker.js, например https://osu-auth.имя.workers.dev
};
const FBV="10.12.2";let FB=null,fbLoading=null;
function fbInit(){if(FB)return Promise.resolve(FB);if(fbLoading)return fbLoading;if(!CFG.firebase)return Promise.reject(new Error("no config"));
 const g=m=>import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-${m}.js`);
 fbLoading=Promise.all([g("app"),g("auth"),g("firestore")]).then(([app,A,F])=>{const a=app.initializeApp(CFG.firebase);FB={A,F,auth:A.getAuth(a),db:F.getFirestore(a),user:null};
  A.onAuthStateChanged(FB.auth,u=>{FB.user=u;onUser(u)});return FB}).catch(e=>{fbLoading=null;throw e});return fbLoading}
const isWeb=()=>/^https?:$/.test(location.protocol);
function me(){return FB&&FB.user}
function myName(){const u=me();return u?(u.displayName||(u.email||"").split("@")[0]||"Player"):"Гость"}
function onUser(u){renderAcct();if(u){pushProfile(true);claimSales().catch(()=>{});toast(tr("Вы вошли как")+" "+myName())}if(tab==="top"||tab==="market"||tab==="arena")render()}
async function loginGoogle(){if(!isWeb())return toast("Откройте игру с сайта, чтобы войти");try{const f=await fbInit();await f.A.signInWithPopup(f.auth,new f.A.GoogleAuthProvider())}catch(e){console.error(e);toast(tr("Не удалось войти")+": "+(e.code||e.message))}}
function loginOsu(){if(!CFG.osuClientId||!CFG.osuWorker)return toast("Вход через osu! ещё не настроен владельцем игры");if(!isWeb())return toast("Откройте игру с сайта, чтобы войти");
 const back=location.href.split("#")[0];location.href=`https://osu.ppy.sh/oauth/authorize?client_id=${encodeURIComponent(CFG.osuClientId)}&redirect_uri=${encodeURIComponent(CFG.osuWorker.replace(/\/$/,"")+"/callback")}&response_type=code&scope=identify&state=${encodeURIComponent(back)}`}
async function osuReturn(){const h=new URLSearchParams(location.hash.slice(1));const t=h.get("osutoken");if(!t)return;history.replaceState(null,"",location.pathname+location.search);
 try{const f=await fbInit();const cr=await f.A.signInWithCustomToken(f.auth,t);const nm=h.get("name"),av=h.get("avatar");if(nm&&cr.user)await f.A.updateProfile(cr.user,{displayName:nm,photoURL:av||null});onUser(cr.user)}catch(e){console.error(e);toast(tr("Не удалось войти")+": "+(e.code||e.message))}}
async function logout(){if(FB)await FB.A.signOut(FB.auth);renderAcct();render()}
const teamBP=()=>S.team.reduce((a,u)=>a+curBP(u),0);
let pushT=0;
async function pushProfile(force){const u=me();if(!u)return;if(!force&&Date.now()-pushT<20000)return;pushT=Date.now();const{F,db}=FB;
 const team=S.team.map(x=>{const o=S.col[x];return{u:+x,l:o.lvl,s:o.stars,r:o.rk||"",k:o.sk}});
 try{await F.setDoc(F.doc(db,"players",u.uid),{name:myName().slice(0,32),photo:u.photoURL||"",bp:teamBP(),power:teamPower(),team,alv:S.alv,floor:S.floor-1,rating:S.arena.rating,t:Date.now()});
  await F.setDoc(F.doc(db,"players",u.uid,"private","save"),{d:JSON.stringify(S),t:Date.now()})}catch(e){console.warn("push",e.code||e)}}
async function cloudLoad(){const u=me();if(!u)return;try{const s=await FB.F.getDoc(FB.F.doc(FB.db,"players",u.uid,"private","save"));if(!s.exists())return toast("В облаке нет сохранения");
 if(!confirm(tr("Загрузить облачное сохранение? Текущий прогресс на этом устройстве будет заменён.")))return;S=Object.assign(fresh(),JSON.parse(s.data().d));sanitize();save();render();toast("Загружено из облака")}catch(e){toast(tr("Ошибка")+": "+(e.code||e.message))}}
async function cloudSave(){if(!me())return;pushT=0;await pushProfile(true);toast("Сохранено в облако")}
function renderAcct(){const b=$("acctBtn");if(!b)return;const u=me();b.innerHTML=u?`${u.photoURL?`<img src="${esc(u.photoURL)}" alt="">`:"👤"} ${esc(myName())}`:"👤 Войти";if(LANG!=="ru")trNode(b)}
function showAcct(){const u=me();$("mbox").innerHTML=`<h3>Аккаунт</h3>${u?`<p>Вы вошли как <b>${esc(myName())}</b></p><div class="row" style="justify-content:center"><button id="cSave">☁ Сохранить в облако</button><button id="cLoad" class="sec">☁ Загрузить из облака</button><button id="lgOut" class="sec">Выйти</button></div>`
 :`<p class="mu">Вход нужен для Рынка, Топа, Арены против живых игроков и облачного сохранения.</p><div class="row" style="justify-content:center"><button id="lgG">G · Войти через Google</button><button id="lgO" class="pink">osu! · Войти через osu!</button></div>`}
 <h3 style="margin-top:18px">Настройки</h3><div class="row" style="justify-content:center"><label>Язык <select id="langSel2">${Object.entries(LANGS).map(([k,v])=>`<option value="${k}" ${LANG===k?"selected":""}>${v}</option>`).join("")}</select></label>
 <label><input type="checkbox" id="pSfx" ${PREF.sfx?"checked":""}> Звук</label><label><input type="checkbox" id="pMus" ${PREF.mus?"checked":""}> Музыка</label><label>Громкость <input type="range" id="pVol" min="0" max="100" value="${Math.round(PREF.vol*100)}"></label></div>
 <div class="row" style="justify-content:center;margin-top:14px"><button class="sec" id="closeM">Закрыть</button></div>`;openModal();
 const on=(i,f)=>{const e=$(i);if(e)e.onclick=f};on("lgG",loginGoogle);on("lgO",loginOsu);on("lgOut",()=>{logout();closeModal()});on("cSave",cloudSave);on("cLoad",cloudLoad);on("closeM",closeModal);
 $("langSel2").onchange=e=>setLang(e.target.value);$("pSfx").onchange=e=>{PREF.sfx=e.target.checked;savePref()};$("pMus").onchange=e=>{PREF.mus=e.target.checked;savePref();PREF.mus?musicStart():musicStop()};$("pVol").oninput=e=>{PREF.vol=e.target.value/100;savePref()}}
// ---------- ТОП ----------
let topCache=null,topT=0;
async function loadTop(force){if(!force&&topCache&&Date.now()-topT<60000)return topCache;const f=await fbInit();const q=f.F.query(f.F.collection(f.db,"players"),f.F.orderBy("bp","desc"),f.F.limit(100));
 const s=await f.F.getDocs(q);topCache=s.docs.map(d=>Object.assign({id:d.id},d.data()));topT=Date.now();return topCache}
function renderTop(){const el=$("topBody");el.innerHTML=`<tr><td colspan="6" class="mu">Загрузка…</td></tr>`;$("topMe").innerHTML=me()?`Ваш BP команды: <b>${fmt(teamBP())}</b>`:`Войдите в аккаунт, чтобы попасть в топ`;
 loadTop().then(list=>{if(tab!=="top")return;el.innerHTML=list.length?list.map((p,i)=>{const t=(p.team||[]).slice(0,5);return`<tr class="${me()&&me().uid===p.id?"meRow":""}"><td><b>${i+1}</b></td><td>${p.photo?`<img src="${esc(p.photo)}" alt="">`:""} <b>${esc(p.name||"?")}</b></td><td><b style="color:var(--pink)">${fmt(p.bp||0)}</b></td><td class="hide-m">${fmt(p.power||0)}</td><td class="hide-m">${p.rating||1000}</td><td class="tteam">${t.map(m=>C(m.u)?`<img title="${esc(C(m.u).name)}" src="https://a.ppy.sh/${m.u}" onerror="this.style.display='none'">`:"").join("")}</td></tr>`}).join(""):`<tr><td colspan="6" class="mu">Пока пусто</td></tr>`;
  if(me()){const i=list.findIndex(p=>p.id===me().uid);$("topMe").innerHTML=`Ваш BP команды: <b>${fmt(teamBP())}</b> · Ваше место: <b>${i>=0?i+1:"100+"}</b>`}})
 .catch(e=>{el.innerHTML=`<tr><td colspan="6" class="mu">Онлайн недоступен (${esc(e.code||e.message||"")})</td></tr>`})}
// ---------- РЫНОК (P2P) ----------
const MKT_ITEMS=["books","aim","hp","acc","spd","chip","ess","tik"];
const itemName=k=>k==="books"?"📘 Книги навыков":`${MATIC[k]} ${MATN[k]}`;
const itemHave=k=>k==="books"?S.books:S.mat[k];
function itemAdd(k,n){if(k==="books")S.books+=n;else S.mat[k]+=n}
async function loadMarket(){const f=await fbInit();const s=await f.F.getDocs(f.F.query(f.F.collection(f.db,"market"),f.F.where("status","==","open"),f.F.limit(300)));
 return s.docs.map(d=>Object.assign({id:d.id},d.data())).sort((a,b)=>(b.created||0)-(a.created||0))}
let mktFilter="all";
function lotHtml(l){const mine=me()&&l.seller===me().uid;let what="";
 if(l.type==="card"){const c=C(l.uid);what=c?`<div class="lotc r-${(l.o&&l.o.rk)||c.rank}" style="${cvStyle(c)}">${img(c)}<div><b>${esc(c.name)}</b> <span style="color:${RCOL[(l.o&&l.o.rk)||c.rank]}">[${(l.o&&l.o.rk)||c.rank}]</span><div class="mu">Ур.${(l.o&&l.o.lvl)||1}${l.o&&l.o.stars?" · "+l.o.stars+"★":""} · BP ${c.bp}</div><div class="mu" style="font-size:11px">✨ ${esc(skName(c))} · 🧬 ${PAS[c.pas][0]}</div></div></div>`:"?"}
 else what=`<div class="loti"><b>${itemName(l.item)}</b> × ${l.qty}</div>`;
 return`<div class="lot">${what}<div class="row sp" style="margin-top:6px"><span class="mu">Продавец: ${esc(l.sellerName||"?")}</span><b style="color:var(--pink)">Ⓟ${fmt(l.price)}</b></div>
 <div class="row" style="margin-top:6px">${mine?`<button class="sm sec" data-unlist="${l.id}">Снять</button>`:`<button class="sm" data-buy="${l.id}" ${S.gems<l.price?"disabled":""}>Купить</button>`}</div></div>`}
let mktCache=[];
function renderMarket(){$("mktInfo").innerHTML=me()?`Вы вошли как <b>${esc(myName())}</b> · Комиссия рынка 5%`:`Чтобы торговать, войдите в аккаунт`;$("mktSellC").disabled=$("mktSellI").disabled=!me();
 const el=$("mktList");el.innerHTML=`<p class="mu">Загрузка…</p>`;
 loadMarket().then(list=>{mktCache=list;if(tab!=="market")return;const L=list.filter(l=>mktFilter==="all"||(mktFilter==="mine"?me()&&l.seller===me().uid:l.type===mktFilter));el.innerHTML=L.length?L.map(lotHtml).join(""):`<p class="mu">Лотов нет</p>`})
 .catch(e=>{el.innerHTML=`<p class="mu">Онлайн недоступен (${esc(e.code||e.message||"")})</p>`})}
async function buyLot(id){if(!me())return toast("Чтобы торговать, войдите в аккаунт");const l=mktCache.find(x=>x.id===id);if(!l)return;if(l.seller===me().uid)return toast("Это ваш лот");if(S.gems<l.price)return toast("Недостаточно PP");
 const{F,db}=FB;const ref=F.doc(db,"market",id);
 try{await F.runTransaction(db,async t=>{const d=await t.get(ref);if(!d.exists()||d.data().status!=="open")throw new Error("sold");t.update(ref,{status:"sold",buyer:me().uid,buyerName:myName().slice(0,32),soldAt:Date.now()})});
  S.gems-=l.price;if(l.type==="card"){const o=Object.assign(newO(),l.o||{});if(S.col[l.uid]){S.col[l.uid].dup++;S.mat.ess+=10}else S.col[l.uid]=o}else itemAdd(l.item,l.qty);save();sfx("lvl");toast("Покупка совершена");render()}
 catch(e){toast(e.message==="sold"?"Лот уже продан":tr("Ошибка")+": "+(e.code||e.message));render()}}
async function unlist(id){const l=mktCache.find(x=>x.id===id);if(!l||!me())return;try{await FB.F.deleteDoc(FB.F.doc(FB.db,"market",id));if(l.type==="card"){if(S.col[l.uid])S.col[l.uid].dup++;else S.col[l.uid]=Object.assign(newO(),l.o||{})}else itemAdd(l.item,l.qty);save();render()}catch(e){toast(tr("Ошибка")+": "+(e.code||e.message))}}
async function listLot(data){const{F,db}=FB;await F.addDoc(F.collection(db,"market"),Object.assign({seller:me().uid,sellerName:myName().slice(0,32),status:"open",created:Date.now()},data))}
function sellCardUI(){if(!me())return toast("Чтобы торговать, войдите в аккаунт");const owned=Object.keys(S.col).map(Number).filter(u=>!S.team.includes(u)).sort((a,b)=>curBP(b)-curBP(a)).slice(0,120);
 $("mbox").innerHTML=`<h3>Продать карту</h3><p class="mu">Выберите карту (карты команды продать нельзя)</p><div class="grid" id="sellGrid">${owned.map(u=>card(u)).join("")||"<p class='mu'>Пусто</p>"}</div><div class="row" style="justify-content:center;margin-top:10px"><button class="sec" id="closeM">Закрыть</button></div>`;openModal();$("closeM").onclick=closeModal;
 $("sellGrid").onclick=e=>{const c=e.target.closest(".card");if(!c)return;const u=+c.dataset.u;const price=parseInt(prompt(tr("Цена")+" (Ⓟ PP):",String(Math.max(50,curBP(u)))),10);if(!(price>0))return;
  const o=S.col[u];if(!o||S.team.includes(u))return;delete S.col[u];save();listLot({type:"card",uid:u,o,price}).then(()=>{toast("Выставлено на рынок");closeModal()}).catch(err=>{S.col[u]=o;save();toast(tr("Ошибка")+": "+(err.code||err.message))})}}
function sellItemUI(){if(!me())return toast("Чтобы торговать, войдите в аккаунт");$("mbox").innerHTML=`<h3>Продать предмет</h3><div class="row" style="justify-content:center"><select id="siK">${MKT_ITEMS.map(k=>`<option value="${k}">${itemName(k)} (${itemHave(k)})</option>`).join("")}</select>
 <label>Количество <input id="siN" type="number" min="1" value="5" style="width:90px"></label><label>Цена <input id="siP" type="number" min="1" value="100" style="width:100px"></label><button id="siGo">Выставить</button><button class="sec" id="closeM">Закрыть</button></div>`;openModal();$("closeM").onclick=closeModal;
 $("siGo").onclick=()=>{const k=$("siK").value,n=parseInt($("siN").value,10),p=parseInt($("siP").value,10);if(!(n>0&&p>0))return;if(itemHave(k)<n)return toast("Недостаточно");itemAdd(k,-n);save();listLot({type:"item",item:k,qty:n,price:p}).then(()=>{toast("Выставлено на рынок");closeModal()}).catch(err=>{itemAdd(k,n);save();toast(tr("Ошибка")+": "+(err.code||err.message))})}}
async function claimSales(){const u=me();if(!u)return;const{F,db}=FB;const s=await F.getDocs(F.query(F.collection(db,"market"),F.where("seller","==",u.uid),F.where("status","==","sold")));let sum=0;
 for(const d of s.docs){if(d.data().claimed)continue;try{await F.updateDoc(d.ref,{claimed:true});sum+=Math.floor(d.data().price*.95)}catch(e){}}if(sum){S.gems+=sum;save();hdr();toast(`${tr("Выручка получена")}: Ⓟ${fmt(sum)}`)}}
// ---------- АРЕНА ----------
function statsFor(u,m){return stats(u,Object.assign(newO(),{lvl:m.l||1,stars:m.s||0,rk:m.r||"",sk:m.k||1}))}
function foesFromTeam(team,name){return team.filter(m=>C(m.u)).map(m=>{const c=C(m.u),s=statsFor(m.u,m);return{name:c.name,c,maxHp:s.hp,atk:s.atk,def:s.def,spd:s.spd,sk:c.sk,skl:m.k||1,rank:m.r||c.rank,lvl:m.l||1,crit:s.crit,cdm:s.cdm,skd:s.skd,eng:s.eng,regen:s.regen}})}
function ghostTeam(seed){const myLv=Math.max(1,Math.round(S.team.reduce((a,u)=>a+S.col[u].lvl,0)/Math.max(1,S.team.length)));const ri=Math.max(0,Math.min(7,Math.round(S.team.reduce((a,u)=>a+RI(curRank(u)),0)/Math.max(1,S.team.length))));
 const out=[];for(let i=0;i<5;i++){const r=RANKS[Math.max(0,Math.min(7,ri+((seed+i)%3)-1))],p=POOL[r];out.push({u:p[(seed*7919+i*31337)%p.length],l:Math.max(1,myLv+((seed>>i)%5)-2),s:0,r:"",k:1+((seed+i)%3)})}return out}
let arenaOpp=null;
async function loadArena(force){if(arenaOpp&&!force)return arenaOpp;const opp=[];
 try{if(CFG.firebase){const list=await loadTop(force);const my=teamBP();list.filter(p=>(!me()||p.id!==me().uid)&&(p.team||[]).length).sort((a,b)=>Math.abs(a.bp-my)-Math.abs(b.bp-my)).slice(0,3).forEach(p=>opp.push({name:p.name,team:p.team,bp:p.bp,rating:p.rating||1000,live:true}))}}catch(e){}
 const seed0=Math.floor(Math.random()*1e6);for(let i=opp.length;i<3;i++){const t=ghostTeam(seed0+i*977);opp.push({name:C(t[0].u).name+" Team",team:t,bp:t.reduce((a,m)=>a+C(m.u).bp,0),rating:S.arena.rating+((i*37)%80)-40,live:false})}
 arenaOpp=opp;return opp}
function renderArena(){$("arRating").textContent=S.arena.rating;$("arTix").textContent=`${S.arena.tix}/5`;$("arW").textContent=S.arena.wins;const el=$("arOpp");el.innerHTML=`<p class="mu">Загрузка…</p>`;
 loadArena().then(opp=>{if(tab!=="arena")return;el.innerHTML=opp.map((o,i)=>`<div class="lot"><div class="row sp"><b>${esc(o.name)}</b><span class="mu">${o.live?"🌐 онлайн-игрок":"🤖 тренировочный соперник"}</span></div><div class="tteam" style="margin:8px 0">${o.team.map(m=>C(m.u)?`<img title="${esc(C(m.u).name)}" src="https://a.ppy.sh/${m.u}" onerror="this.style.display='none'">`:"").join("")}</div>
  <div class="row sp"><span class="mu">BP ${fmt(o.bp)} · Рейтинг ${o.rating}</span><button class="sm" data-arena="${i}" ${S.arena.tix<1||!S.team.length?"disabled":""}>⚔ Вызвать</button></div></div>`).join("")})}
function arenaFight(i){const o=arenaOpp&&arenaOpp[i];if(!o)return;checkDay();if(S.arena.tix<1)return toast("Нет билетов арены — приходите завтра");
 if(startBattle(`Арена — ${o.name}`,foesFromTeam(o.team),win=>{prog("arena");if(win){const d=Math.max(8,Math.round(20+(o.rating-S.arena.rating)/20));S.arena.rating+=d;S.arena.wins++;arenaOpp=null;return giveDrop({gems:40*evm("arena"),gold:600,xp:40},1)+` · ${tr("Рейтинг")} +${d}`}
  S.arena.rating=Math.max(0,S.arena.rating-10);return`${tr("Рейтинг")} −10`},{n:"Арена",c:"#ff1f3d",g:"⚔",mod:""}))S.arena.tix--}
