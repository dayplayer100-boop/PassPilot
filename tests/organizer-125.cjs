'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{chromium}=require('playwright'),api=require('../app/src/main/assets/app/obligations.js');
const auto=api.normalize({id:'credit',kind:'credit',autoFinal:true,totalAmount:'1000',downPayment:'100',rateCount:12,amount:'50',paidCount:3,firstDue:'2026-01-31'});
assert.equal(api.finalCents(auto),30000);assert.equal(api.summary(auto).remainingCents,75000);
assert.equal(api.finalCents({...auto,totalAmount:'0.30',downPayment:'',amount:'0.10',rateCount:3}),0);
assert.equal(api.nextOccurrence({repeat:true,repeatEvery:1,repeatUnit:'months'},'2026-01-31'),'2026-02-28');
assert.equal(api.nextOccurrence({repeat:true,repeatEvery:1,repeatUnit:'years'},'2024-02-29'),'2025-02-28');
assert.equal(api.nextOccurrence({repeat:true,repeatEvery:2,repeatUnit:'weeks'},'2026-12-25'),'2027-01-08');
assert.equal(api.nextOccurrence({repeat:false},'2026-12-25'),'');
(async()=>{
const b=await chromium.launch({headless:true,args:['--no-sandbox']}),p=await b.newPage({viewport:{width:360,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
try{
 await p.goto('file://'+path.resolve('app/src/main/assets/app/index.html'));
 await p.evaluate(()=>{state.settings.introSeen=true;state.settings.accountLoginRequired=false;state.products=[normalizeProduct({id:'device',name:'Waschmaschine',documents:[]})];saveState();closeModal();PassPilotOrganizer.show('contracts');});
 // An own type keeps its label when removed from the picker, and all categories stay accessible.
 await p.locator('[data-action=contract-new]').last().click();assert.equal(await p.locator('#organizerAdd [value=service]').count(),1);
 await p.locator('[data-action=obligation-types]').click();await p.locator('#type-label').fill('Gartenpflege');await p.locator('#type-base').selectOption('service');await p.locator('#organizerType .primary-btn').click();
 const custom=await p.evaluate(()=>state.settings.customObligationTypes[0].id);await p.locator('[data-action=contract-new]').last().click();await p.locator('#organizerAdd [value="'+custom+'"]').check();await p.locator('#organizerAdd .primary-btn').click();await p.locator('[name=nextDate]').fill('2026-11-01');await p.locator('#obligationForm .primary-btn').click();
 const record=await p.evaluate(()=>state.products.find(x=>x.recordKind==='contract').id);assert.equal(await p.evaluate(id=>getProduct(id).obligations[0].kindLabel,record),'Gartenpflege');
 await p.evaluate(()=>PassPilotOrganizer.choose());await p.locator('[data-action=obligation-types]').click();await p.locator('[data-type-id="'+custom+'"]').click();assert.equal(await p.evaluate(()=>state.settings.customObligationTypes.length),0);
 await p.reload();await p.evaluate(id=>PassPilotObligations.open(id,getProduct(id).obligations[0].id),record);assert.equal(await p.locator('[name=kind] option:checked').innerText(),'Gartenpflege');
 await p.locator('[data-action=obligation-complete]').click();assert.equal(await p.evaluate(id=>getProduct(id).obligations[0].active,record),false);
 // Automatic balloon calculation, invalid overpayment rejected, changing terms recalculates cents.
 await p.evaluate(()=>PassPilotObligations.open('device'));await p.locator('[name=kind]').selectOption('credit');await p.locator('[name=totalAmount]').fill('1000');await p.locator('[name=amount]').fill('50');await p.locator('[name=rateCount]').fill('12');await p.locator('[name=downPayment]').fill('100');await p.locator('[name=firstDue]').fill('2026-10-05');assert.equal(await p.locator('[name=finalPayment]').inputValue(),'300.00');assert(await p.locator('[name=finalPayment]').isEditable()===false);
 await p.locator('[name=amount]').fill('100');await p.locator('#obligationForm .primary-btn').click();assert.equal(await p.evaluate(()=>getProduct('device').obligations.length),0);await p.locator('[name=amount]').fill('50');await p.locator('#obligationForm .primary-btn').click();assert.equal(await p.evaluate(()=>getProduct('device').obligations[0].finalPayment),'300');
 // A warranty is linked to a real product; it cannot be saved as a freestanding contract.
 await p.evaluate(()=>PassPilotOrganizer.choose());await p.locator('#organizerAdd [value=warranty]').check();await p.locator('#organizerAdd .primary-btn').click();assert(await p.locator('[name=productId]').getAttribute('required')!==null);assert.equal(await p.locator('[name=productId] option').count(),2);await p.locator('[name=endDate]').fill('2028-10-05');await p.locator('#obligationForm .primary-btn').click();assert.equal(await p.evaluate(()=>getProduct('device').obligations.length),1);await p.locator('[name=productId]').selectOption('device');await p.locator('#obligationForm .primary-btn').click();assert.equal(await p.evaluate(()=>getProduct('device').obligations.length),2);
 // Recurring service updates only after confirmation and survives reload.
 await p.evaluate(()=>PassPilotObligations.open('device','',{kind:'service'}));await p.locator('[name=nextDate]').fill('2026-11-05');await p.locator('[name=repeat]').check();await p.locator('[name=repeatEvery]').fill('2');await p.locator('[name=repeatUnit]').selectOption('weeks');await p.locator('#obligationForm .primary-btn').click();
 await p.reload();const oid=await p.evaluate(()=>getProduct('device').obligations.find(o=>o.kind==='service').id);await p.evaluate(id=>PassPilotObligations.open('device',id),oid);await p.locator('[data-action=obligation-complete]').click();assert(await p.evaluate(()=>{const o=getProduct('device').obligations.find(o=>o.kind==='service');return o.active&&o.nextDate===PassPilotObligations.nextOccurrence(o,localDate());}));
 for(const width of [320,360,412,768]){await p.setViewportSize({width,height:800});await p.evaluate(()=>PassPilotObligations.open('device',getProduct('device').obligations[0].id));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const gap=await p.locator('#obligationForm').evaluate(e=>parseFloat(getComputedStyle(e).rowGap));assert(gap>=16);await p.evaluate(()=>PassPilotObligations.chart('device'));await p.locator('.finance-stats').waitFor();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);console.log('PASS: custom type retention, generic add, automatic credit balloon, overpayment rejection, required warranty product, single/recurring completion, persistence and financing layouts at 320–768px.');
}finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
