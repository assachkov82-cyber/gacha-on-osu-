const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!m.text().includes('Failed to load')&&errs.push(m.text()));
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'');
await p.evaluate(()=>{const modes=['o','t','c','m'];const us=[];for(const k of ['aim','tank','slider','stream','spinner'])us.push(CH.find(c=>c.sk===k&&c.mode===modes[us.length%4]).uid);us.forEach(u=>S.col[u]=newO());S.team=us;S.alv=12;S.floor=58;render()});
await p.click('[data-t=tower]');await p.screenshot({path:'tw.png'});
await p.click('#fight');for(let i=0;i<4;i++){await p.waitForTimeout(500);await p.screenshot({path:`bt${i}.png`})}
await p.click('#arSkip',{timeout:500}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});await p.screenshot({path:'bend.png'});await p.click('#arClose');
for(const f of [85,95,125]){await p.evaluate(f=>towerFight(f,true),f);await p.waitForTimeout(1200);await p.click('#arSkip',{timeout:500}).catch(()=>{});await p.waitForSelector('#arClose',{timeout:30000});await p.click('#arClose')}
await p.click('[data-t=quest]');await p.screenshot({path:'q.png'});console.log(await p.textContent('#qCount'));await p.click('[data-lv="2"]');await p.click('#claimAll');console.log(await p.textContent('#qCount'),await p.textContent('nav [data-t=quest]'));
await p.click('[data-t=dung]');await p.click('[data-dg="0"]');await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose');await p.click('#arClose');
await p.setViewportSize({width:390,height:800});await p.click('[data-t=farm]');await p.click('[data-loc="0"]');await p.waitForTimeout(1500);await p.screenshot({path:'mob.png',fullPage:false});await p.click('#arSkip',{timeout:800}).catch(()=>{});await p.waitForSelector('#arClose');await p.click('#arClose');
console.log('errors',errs);await b.close()})();
