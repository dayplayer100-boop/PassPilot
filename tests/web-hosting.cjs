const {reveal}=require('./ui-helpers.cjs');
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'web-dist');
execFileSync(process.execPath,[path.join(root,'scripts/build-web.cjs')]);
// Test the worker's security boundary without making any external requests.
const listeners={},deleted=[],currentCache=fs.readFileSync(path.join(dist,'sw.js'),'utf8').match(/const CACHE='([^']+)'/)[1];
vm.runInNewContext(fs.readFileSync(path.join(dist,'sw.js'),'utf8'),{
  URL,Response,self:{registration:{scope:'https://example.test/'},addEventListener:(type,fn)=>listeners[type]=fn,clients:{claim:()=>Promise.resolve()},skipWaiting(){}},
  caches:{keys:async()=>['passpilot-old','unrelated-cache',currentCache],delete:async name=>deleted.push(name)},
});
function intercepted(url,options={}){let handled=false;listeners.fetch({request:new Request(url,options),respondWith:()=>{handled=true;},waitUntil(){}});return handled;}
// Forbidden requests return before calling fetch/cache methods.
for(const url of ['https://firestore.googleapis.com/v1/private','https://identitytoolkit.googleapis.com/v1/accounts','https://example.test/secret.pdf','https://example.test/app.js?token=private'])assert.equal(intercepted(url),false,url);
assert.equal(intercepted('https://example.test/app.js',{headers:{Authorization:'Bearer test'}}),false);
(async()=>{
  let cleanup;listeners.activate({waitUntil:p=>cleanup=p});await cleanup;assert.deepEqual(deleted,['passpilot-old']);
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
  const server=http.createServer((req,res)=>{const file=path.join(dist,decodeURIComponent(new URL(req.url,'http://localhost').pathname),req.url.endsWith('/')?'index.html':'');if(!file.startsWith(dist+path.sep)){res.writeHead(403);return res.end();}try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{if(!localStorage.getItem('passpilot-state-v2'))localStorage.setItem('passpilot-state-v2',JSON.stringify({products:[],calendarEvents:[],settings:{introSeen:true}}));});
    const base='http://127.0.0.1:'+server.address().port+'/';
    await page.goto(base);await page.locator('.mode-pill').filter({hasText:'Web · lokal gespeichert'}).waitFor();
    await reveal(page.locator('[data-action="new-product"]').first());await page.locator('[data-action="new-product"]').first().click();
    await reveal(page.locator('[data-action="capture-manual"]'));await page.locator('[data-action="capture-manual"]').click();await reveal(page.locator('#productForm [name="name"]'));await page.locator('#productForm [name="name"]').fill('Web-Testprodukt');
    await reveal(page.locator('#productForm .form-actions .primary-btn'));await page.locator('#productForm .form-actions .primary-btn').click();
    await page.waitForFunction(()=>state.products.some(p=>p.name==='Web-Testprodukt'));
    const passBase=await page.evaluate(()=>getBaseUrl());assert.equal(passBase,base+'pass/');
    await reveal(page.locator('[data-action="settings"]'));await page.locator('[data-action="settings"]').click();
    await page.locator('.settings-advanced > summary').click();await page.getByRole('heading',{name:'Web-Version',exact:true}).waitFor();
    assert.equal(await page.locator('[data-action="enable-lock"]').count(),0);
    await reveal(page.locator('[data-action="firebase-connect"]'));await page.locator('[data-action="firebase-connect"]').click();
    await page.locator('#firebaseAuth').waitFor();
    assert.equal(await page.locator('#firebaseConfig').count(),0);
    await page.locator('summary').filter({hasText:'Projektverbindung'}).click();await page.getByText('passpilot-69f7c',{exact:true}).waitFor();
    await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();
    await page.reload();assert(await page.evaluate(()=>state.products.some(p=>p.name==='Web-Testprodukt')));
    const hash=await page.evaluate(()=>encodeSnapshot({v:1,title:'Öffentlicher Test',category:'other',brand:'Test',model:'Web',status:'active',history:[]}));
    await page.goto(base+'#pass='+hash);await page.waitForURL('**/pass/**');
    await page.getByText('Öffentlicher Test',{exact:true}).waitFor();
    assert.equal(await page.locator('.bottom-nav').count(),0);
    assert.deepEqual(errors,[]);
    console.log('PASS: full web app, product persistence, browser settings, own QR viewer route, public/private separation, service-worker exclusion of API/auth/document requests.');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exit(1)});
