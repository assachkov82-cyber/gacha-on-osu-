const {chromium}=require('playwright');(async()=>{const f=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!m.text().includes('Failed to load')&&errs.push(m.text()));
const t0=Date.now();await p.goto('file://'+f);console.log('load ms',Date.now()-t0);
console.log(await p.evaluate(()=>({n:CH.length,pools:Object.fromEntries(RANKS.map(r=>[r,POOL[r].length])),mem:performance.memory&&Math.round(performance.memory.usedJSHeapSize/1e6),top4i:C(16540828)&&skName(C(16540828))})));
await p.click('[data-t=gacha]');await p.check('#skipFx');await p.click('#pull10');await p.click('#openAll');await p.waitForTimeout(1500);await p.click('#closeM');
await p.click('[data-t=team]');await p.click('#autoTeam');await p.click('[data-t=tower]');await p.click('#fight');await p.waitForTimeout(1500);await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});await p.click('#arClose');
await p.click('[data-t=index]');let t=Date.now();await p.fill('#ixQ','cook');await p.waitForTimeout(600);console.log('search',Date.now()-t,await p.textContent('#ixInfo'));await p.fill('#ixQ','');await p.fill('#ixC','RU');await p.waitForTimeout(600);console.log(await p.textContent('#ixInfo'));await p.screenshot({path:'ix5.png'});
await p.click('[data-ix]');await p.waitForTimeout(300);console.log(await p.textContent('#mbox p:nth-of-type(2)'));await p.click('#closeM');
await p.reload();console.log('reload owned',await p.evaluate(()=>Object.keys(S.col).length));
console.log('errors',errs);await b.close()})();
