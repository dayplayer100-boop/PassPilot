'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const {reveal}=require('./ui-helpers.cjs');
const root=path.resolve(__dirname,'..');
execFileSync(process.execPath,[path.join(root,'scripts/build-web.cjs')]);
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
(async()=>{
 const server=http.createServer((req,res)=>{let name=new URL(req.url,'http://localhost').pathname;if(name.endsWith('/'))name+='index.html';try{res.setHeader('Content-Type',mime[path.extname(name)]||'application/octet-stream');res.end(fs.readFileSync(path.join(root,'web-dist',name)));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),p=await browser.newPage({viewport:{width:360,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 let verified=false,wrongRefresh=false,loseResponse=true,refreshes=0,commits=0,lookupCount=0,records=new Map();
 await p.route('https://www.gstatic.com/**',r=>r.abort());
 await p.route('https://**googleapis.com/**',async route=>{
  const req=route.request(),url=req.url(),reply=(status,data)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(url.includes('securetoken.')){refreshes++;return reply(200,{user_id:wrongRefresh?'different_owner':'owner_124',id_token:'REFRESHED_TOKEN',refresh_token:'REFRESH_TOKEN',expires_in:'3600'});}
  if(url.includes('accounts:signInWith'))return reply(200,{localId:'owner_124',email:'owner@example.com',idToken:'TEST_TOKEN',refreshToken:'REFRESH_TOKEN',expiresIn:3600});
  if(url.includes('accounts:lookup')){lookupCount++;return reply(200,{users:[{localId:'owner_124',email:'owner@example.com',emailVerified:verified}]});}
  const name=url.split('/v1/')[1]?.split('?')[0];
  if(name?.endsWith(':commit')){const body=req.postDataJSON();commits++;for(const write of body.writes){const old=records.get(write.update.name);if(write.currentDocument.exists===false&&old)return reply(409,{error:{message:'already exists'}});const fields={...write.update.fields};for(const transform of write.updateTransforms||[])fields[transform.fieldPath]={timestampValue:new Date().toISOString()};records.set(write.update.name,{name:write.update.name,fields,updateTime:'t'+commits});}if(loseResponse){loseResponse=false;return reply(500,{error:{message:'Simulated lost response after successful commit'}});}return reply(200,{writeResults:[{updateTime:'t'+commits}]});}
  if(req.method()==='GET')return records.has(name)?reply(200,records.get(name)):reply(404,{error:{message:'not found'}});
  throw Error('Unexpected '+req.method()+' '+url);
 });
 try{
  await p.goto('http://127.0.0.1:'+server.address().port);
  await p.evaluate(()=>localStorage.setItem('passpilot-state-v2',JSON.stringify({settings:{introSeen:true,accountLoginRequired:false},calendarEvents:[],products:[{id:'heat',name:'Meine Heizung',category:'building',documents:[]},{id:'long',name:'EinsehrlangerProduktnameohneLeerzeichenfürdenUmbruchimProduktpass',brand:'LG',documents:[]}]})));
  await p.reload();
  assert.equal(await p.locator('.hub-tile').count(),4);assert.equal(await p.locator('.bottom-nav [data-nav]').count(),3);
  // Create a standalone phone contract through the new dashboard, without creating a physical product.
  await p.locator('.hub-tile[data-nav=contracts]').click();await p.locator('[data-action=contract-new]').click();
  await p.locator('#organizerAdd [value=contract]').check();await p.locator('#organizerAdd button.primary-btn').click();
  await p.locator('#obligationForm [name=title]').fill('Mein Mobilfunktarif');await p.locator('#obligationForm [name=provider]').fill('Testanbieter');await p.locator('#obligationForm [name=endDate]').fill('2027-10-04');
  await reveal(p.locator('[name=noticeCount]'));await p.locator('[name=noticeCount]').fill('1');await p.locator('#obligationForm button.primary-btn').click();
  assert.match(await p.locator('#app').innerText(),/Mein Mobilfunktarif/);assert.equal(await p.evaluate(()=>state.products.filter(x=>x.recordKind!=='contract').length),2);
  assert(await p.evaluate(()=>getCalendarEvents().some(e=>e.date==='2027-09-04'&&e.title.includes('Kündigungsfrist'))));
  await p.reload();assert(await p.evaluate(()=>state.products.some(x=>x.recordKind==='contract'&&x.name==='Mein Mobilfunktarif')));
  await p.evaluate(()=>PassPilotOrganizer.show('products'));assert.doesNotMatch(await p.locator('#app').innerText(),/Mein Mobilfunktarif/);
  // Maintenance requires only a task and next date; recurrence and documents remain optional.
  await p.evaluate(()=>PassPilotOrganizer.show('maintenance'));await p.locator('[data-action=maintenance-new]').click();await p.locator('#organizerProduct').selectOption('heat');await p.locator('#organizerAdd button.primary-btn').click();
  await p.locator('#obligationForm [name=title]').fill('Heizungswartung');await p.locator('[name=nextDate]').fill('2027-04-02');await p.locator('[name=repeat]').check();await p.locator('[name=repeatEvery]').fill('12');
  assert(!await p.locator('[name=amount]').isVisible());await p.locator('#obligationForm button.primary-btn').click();assert.match(await p.locator('#app').innerText(),/Heizungswartung/);
  assert.equal(await p.evaluate(()=>getProduct('heat').obligations[0].intervalMonths),12);
  // Test mode exposes existing premium services immediately, without payment or an artificial product cap.
  assert(await p.evaluate(()=>PassPilotUpgrades.requirePaidFeature('financeCharts')));assert.equal(await p.evaluate(()=>PassPilotUpgrades.paidCached('contractReminders')),true);assert.equal(await p.evaluate(()=>PassPilotUpgrades.enforced()),false);
  await p.evaluate(()=>PassPilotUpgrades.open());assert.equal(await p.locator('#subscriptionPlans section').count(),3);assert.equal(await p.locator('#subscriptionPlans button:disabled').count(),2);
  // Device vault is separate, and opening another modal removes plaintext access immediately.
  const envelope=await p.evaluate(()=>PassPilotDeviceAccess.seal({kind:'pin',value:'8675',hint:'Test reminder'},'Separate protection password'));
  await p.evaluate(e=>{getProduct('heat').deviceAccess=e;saveState();closeModal();PassPilotOrganizer.show('vault');},envelope);
  await p.locator('[data-action=device-access]').click();assert.equal(await p.locator('#deviceAccessUnlock').count(),1);
  await p.locator('#deviceAccessUnlock input[type=password]').fill('Separate protection password');await p.locator('#deviceAccessUnlock button.primary-btn').click();await p.locator('#deviceAccessUnlocked').waitFor();
  await p.locator('#modal [data-action=feedback-open]').click();await p.locator('#feedbackForm').waitFor();assert.equal(await p.locator('.feedback-image').count(),0);assert.match(await p.locator('#feedbackForm').innerText(),/Zugangsdaten/);await p.keyboard.press('Escape');assert.equal(await p.locator('#deviceAccessUnlocked').count(),1);
  await p.evaluate(()=>PassPilotUpgrades.open());assert.equal(await p.locator('#deviceAccessUnlocked').count(),0);
  // Navigation stays within the app; the Android bridge invokes this exact SPA handler.
  await p.evaluate(()=>{closeModal();PassPilotOrganizer.show('products');openProduct('long');PassPilotNavigation.back();});assert.equal(await p.evaluate(()=>document.getElementById('app').dataset.productId||''),'');
  await p.evaluate(()=>{modal(productForm());PassPilotCapture.show(document.getElementById('productForm'),3);});
  await p.evaluate(()=>{const form=document.getElementById('productForm');form.elements.name.value='Unsaved draft';form.dispatchEvent(new Event('input',{bubbles:true}));PassPilotNavigation.back();});assert(!await p.locator('#modal').evaluate(d=>d.open));
  // Account verification refreshes both account information and the Firestore token, without logging out.
  await p.evaluate(()=>{closeModal();PassPilotFirebase.connect();});await p.locator('[data-action=firebase-auth-tab][data-mode=signUp]').click();assert.equal(await p.locator('#authPassword').getAttribute('autocomplete'),'new-password');await p.locator('[data-action=firebase-auth-tab][data-mode=signInWithPassword]').click();
  await p.locator('#authEmail').fill('owner@example.com');await p.locator('#authPassword').fill('Test password only');await p.locator('#firebaseAuth button.primary-btn').click();await p.locator('[data-action=firebase-check-verified]').waitFor();assert.equal(await p.evaluate(()=>PassPilotFirebase.account().verified),false);
  verified=true;await p.locator('[data-action=firebase-check-verified]').click();await p.waitForFunction(()=>PassPilotFirebase.account().verified);assert.equal(refreshes,1);assert(lookupCount>=2);
  // The channel preview must not destroy an unsaved user preference.
  await p.evaluate(()=>PassPilotNotifications.open());await p.locator('#notificationForm [name=popup]').check();await p.locator('[data-action=notification-preview]').click();assert(await p.locator('#notificationForm [name=popup]').isChecked());await p.locator('#notificationForm button.primary-btn').click();assert.equal(await p.evaluate(()=>PassPilotNotifications.preferences().popup),true);
  // A screenshot is local until the user reviews it and explicitly sends the report.
  await p.evaluate(()=>{closeModal();currentView='dashboard';render();});await p.locator('header [data-action=feedback-open]').click();await p.locator('#feedbackForm').waitFor();assert.equal(await p.locator('.feedback-image').count(),1);assert.equal(commits,0);
  await p.locator('#feedbackMessage').fill('Die Wartung könnte auf der Übersicht klarer sein.');await p.locator('#feedbackForm [value=idea]').check();await p.locator('[data-action=feedback-remove-image]').click();assert(await p.locator('#feedbackForm [value=idea]').isChecked());
  await p.locator('#feedbackForm button.primary-btn').click();await p.waitForFunction(()=>document.getElementById('feedbackStatus').textContent.includes('hinterlegt'));assert.equal(commits,1);
  await p.evaluate(()=>document.getElementById('feedbackForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await p.waitForTimeout(100);assert.equal(commits,1);
  const report=[...records.values()].find(x=>x.name.includes('/feedbackReports/'));assert.equal(report.fields.ownerUid.stringValue,'owner_124');assert.equal(report.fields.type.stringValue,'idea');assert.equal(report.fields.screenshot.stringValue,'');
  await p.keyboard.press('Escape');
  await p.evaluate(()=>modal(settingsForm()));await p.locator('.settings-advanced > summary').click();assert.equal(await p.locator('[data-action=upgrades-open]').count(),1);assert.equal(await p.locator('[data-action=notification-settings]').count(),1);assert.equal(await p.locator('[data-action=toggle-native-lock]').count(),0);await p.evaluate(()=>closeModal());
  wrongRefresh=true;await assert.rejects(()=>p.evaluate(()=>PassPilotFirebase.token(true)),/Anmeldung konnte nicht erneuert werden/);assert.equal(await p.evaluate(()=>PassPilotFirebase.user()),'owner_124');wrongRefresh=false;
  for(const width of [320,360,412,768]){
   await p.setViewportSize({width,height:800});await p.evaluate(()=>{closeModal();openProduct('long');});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.evaluate(()=>PassPilotObligations.open('heat','','',{standalone:false}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.locator('#modal button').last().focus();await p.keyboard.press('Tab');assert(await p.evaluate(()=>document.getElementById('modal').contains(document.activeElement)));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: dashboard hubs, standalone contracts, minimal maintenance, persistent records, open test mode, encrypted vault, safe feedback and single-send, verification refresh, notification draft, navigation, keyboard and responsive layouts.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
