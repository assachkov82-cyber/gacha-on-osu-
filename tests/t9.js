// Проверка новых систем: баннеры, языки, карты, арена, топ, рынок, звук
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900},locale:'ru-RU'});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/Failed to load|ERR_/.test(m.text())&&errs.push(m.text()));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));
console.log('lang',await p.evaluate(()=>LANG),'pp',await p.textContent('#gems'),'covers',await p.evaluate(()=>COV.size));
await p.click('[data-t=gacha]');for(const bn of ['feat','cc','mode','std']){await p.click(`[data-bn=${bn}]`);}
await p.click('[data-bn=cc]');await p.check('#skipFx');await p.click('#pull10');await p.waitForTimeout(400);await p.click('#openAll');await p.waitForTimeout(1500);
console.log('cc pulls',await p.evaluate(()=>S.last.slice(0,10).map(u=>C(u).cc).join(',')),'week',await p.evaluate(()=>weekCC));await p.screenshot({path:path.resolve(__dirname,'../../shot_pull.png')});await p.click('#closeM');
await p.click('[data-t=col]');await p.waitForTimeout(800);await p.screenshot({path:path.resolve(__dirname,'../../shot_col.png')});
await p.click('#colGrid .card');await p.waitForTimeout(600);await p.screenshot({path:path.resolve(__dirname,'../../shot_char.png')});await p.click('#closeM');
await p.click('[data-t=team]');await p.click('#autoTeam');
await p.click('[data-t=arena]');await p.waitForTimeout(3000);console.log('arena opp',await p.$$eval('[data-arena]',x=>x.length));await p.click('[data-arena="0"]');await p.waitForTimeout(1500);await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});console.log('arena:',await p.textContent('#arEnd'));await p.click('#arClose');
await p.click('[data-t=top]');await p.waitForTimeout(3000);console.log('top:',(await p.textContent('#topBody')).slice(0,80));
await p.click('[data-t=market]');await p.waitForTimeout(2500);console.log('market:',(await p.textContent('#mktList')).slice(0,80));
await p.evaluate(()=>{S.alv=Math.max(S.alv,3);S.sta=maxSta()});await p.click('[data-t=farm]');console.log('pp loc first:',(await p.textContent('#locs .lc b')));await p.click('[data-loc="7"]');await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});console.log('ppmap:',await p.textContent('#arEnd'));await p.click('#arClose');
await p.click('[data-t=tower]');await p.click('#fight');await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});console.log('tower1:',await p.textContent('#arEnd'));await p.click('#arClose');
await p.click('[data-t=home]');console.log('event:',await p.textContent('#evBox'));
await p.selectOption('#langSel','en');await p.waitForTimeout(400);console.log('EN home:',(await p.textContent('#s-home')).replace(/\s+/g,' ').slice(0,260));await p.screenshot({path:path.resolve(__dirname,'../../shot_en.png')});
await p.click('[data-t=quest]');await p.waitForTimeout(300);console.log('EN quest:',(await p.textContent('#s-quest')).replace(/\s+/g,' ').slice(0,200));
await p.selectOption('#langSel','es');await p.click('[data-t=index]');await p.waitForTimeout(400);console.log('ES nav:',(await p.textContent('nav')));
await p.selectOption('#langSel','ru');await p.waitForTimeout(300);console.log('RU nav:',(await p.textContent('nav')));
await p.click('#acctBtn');await p.waitForTimeout(300);await p.click('#lgG');await p.waitForTimeout(300);console.log('toast:',await p.textContent('#toast'));await p.click('#closeM').catch(()=>{});
await p.evaluate(()=>{setLang('en');render()});await p.click('[data-t=col]');await p.waitForTimeout(500);const cyr=await p.evaluate(()=>{const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);const r=new Set();let n;while(n=w.nextNode()){if(/[А-Яа-яЁё]/.test(n.nodeValue)&&n.parentElement.offsetParent)r.add(n.nodeValue.trim())}return[...r].slice(0,30)});console.log('untranslated visible:',cyr);
console.log('errors',errs);await b.close()})();
