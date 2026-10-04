const {reveal}=require('./ui-helpers.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
// Layouts from the supplied labels. Device-specific serials/shipping data are synthetic.
const RAZER='Razer™\nBLACKWIDOW CHROMA\nS/N: EXAMPLE123\nMODEL NUMBER [型号/型號]: RZ03-0122\nMulti-color Mechanical Gaming Keyboard\nPRODUCT NO. [代号/代號]: RZ03-01220500-R3G1\nRATING [额定/額定]: 5V === 500mA\nWARNING\nRAZER INC\nMADE IN CHINA';
const CASIO='CASIO®\nRATING: SOLAR CELL, BATTERY\nDC 1.5V USE BATTERY LR44X1\nCE N78\nCASIO COMPUTER CO., LTD. MADE IN CHINA';
const SHIPPING='GLS\nDE\nGLS packet ID\nPRIVATE_RECIPIENT\nPRIVATE_ADDRESS\n09-01-2026\n4006381333931';

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:360,height:800}});
  await context.addInitScript(()=>{
    window.labelCalls=[];window.lookups=[];window.photoCalls=[];
    window.PassPilotAndroid={scanProduct:id=>labelCalls.push(id),scanProductLabel:id=>labelCalls.push(id),lookupBarcode:(code,id)=>lookups.push({code,id}),scanProductPhoto:id=>photoCalls.push(id)};
  });
  await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>{const form=document.querySelector('#productForm.quick-product');if(form){if(form._capture&&!form.classList.contains('capture-manual'))form.querySelector('[data-action="capture-manual"]').click();form.querySelector('[data-action="quick-details"]').click();}}).observe(document.body,{childList:true,subtree:true})));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../app/src/main/assets/app/index.html'));
  await page.evaluate(()=>localStorage.setItem('passpilot-state-v2',JSON.stringify({version:4,settings:{introSeen:true},products:[]})));await page.reload();
  const field=name=>page.locator('#productForm [name="'+name+'"]');
  const open=async()=>{if(await page.locator('#modal[open]').count()){await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}await reveal(page.locator('.bottom-nav [data-action="new-product"]'));await page.locator('.bottom-nav [data-action="new-product"]').click()};
  const read=async(text,barcodes=[])=>{await reveal(page.locator('[data-action="scan-label"]'));await page.locator('[data-action="scan-label"]').click();assert(await page.locator('[data-action="scan-label"]').isDisabled());await page.evaluate(({text,barcodes})=>PassPilotScan.receiveNativeResult(labelCalls.at(-1),{status:'success',text,barcodes}),{text,barcodes});assert(!await page.locator('[data-action="scan-label"]').isDisabled())};
  const parsed=await page.evaluate(({RAZER,CASIO,SHIPPING})=>({razer:PassPilotScan.parseLabel(RAZER),casio:PassPilotScan.parseLabel(CASIO),shipping:PassPilotScan.parseLabel(SHIPPING),multiline:PassPilotScan.parseLabel('Razer\nBLACKWIDOW CHROMA\nModel Number [型号/型號]\nRZ03-0122\nProduct No. [代号]\nRZ03-01220500-R3G1\nS/N\nEXAMPLE123')}),{RAZER,CASIO,SHIPPING});
  assert.deepEqual(parsed.razer,{brand:'Razer',name:'Razer BLACKWIDOW CHROMA',model:'RZ03-0122',serial:'EXAMPLE123',partNumber:'RZ03-01220500-R3G1',category:'electronics'});
  assert.deepEqual(parsed.casio,{brand:'Casio',category:'electronics'});
  assert.deepEqual(parsed.shipping,{});assert.equal(parsed.multiline.model,'RZ03-0122');assert.equal(parsed.multiline.partNumber,'RZ03-01220500-R3G1');
  await open();await read(RAZER,[{rawValue:'EXAMPLE123',format:1}]);
  for(const [name,value]of Object.entries(parsed.razer))assert.equal(await field(name).inputValue(),value);
  for(const name of ['barcode','price','retailer','purchaseDate','notes','location'])assert.equal(await field(name).inputValue(),'');
  assert.equal(await page.evaluate(()=>lookups.length),0);assert.equal(await page.evaluate(()=>photoCalls.length),0);
  await reveal(page.locator('#scanQuickSave'));await page.locator('#scanQuickSave').click();
  const product=await page.evaluate(()=>JSON.parse(localStorage.getItem('passpilot-state-v2')).products[0]);
  assert.equal(product.partNumber,'RZ03-01220500-R3G1');assert.equal(product.serial,'EXAMPLE123');assert(!JSON.stringify(product).includes('WARNING'));
  await page.reload();await reveal(page.locator('.bottom-nav [data-nav="products"]'));await page.locator('.bottom-nav [data-nav="products"]').click();
  assert((await page.locator('body').textContent()).includes('Razer BLACKWIDOW CHROMA'));
  await page.evaluate(()=>{const p=state.products[0];const pass=publicSnapshot(p);window.labelPublic=JSON.stringify(pass)});
  assert(!(await page.evaluate(()=>labelPublic)).includes('EXAMPLE123'));
  await open();await reveal(page.locator('[data-action="scan-product"]'));await page.locator('[data-action="scan-product"]').click();
  await page.evaluate(text=>PassPilotScan.receiveNativeResult(labelCalls.at(-1),{status:'success',text,barcodes:[{rawValue:'EXAMPLE123',format:1}]}),RAZER);
  assert.equal(await field('model').inputValue(),'RZ03-0122');assert.equal(await field('name').inputValue(),'Razer BLACKWIDOW CHROMA');assert.equal(await page.evaluate(()=>lookups.length),0);
  await open();await read(CASIO);
  assert.equal(await field('brand').inputValue(),'Casio');assert.equal(await field('model').inputValue(),'');assert.equal(await field('serial').inputValue(),'');assert.equal(await field('partNumber').inputValue(),'');assert.equal(await field('name').inputValue(),'');
  await open();await reveal(field('name'));await field('name').fill('Mein vorhandener Name');await read(SHIPPING,[{rawValue:'4006381333931',format:32}]);
  assert.equal(await field('name').inputValue(),'Mein vorhandener Name');assert.equal(await field('barcode').inputValue(),'');assert.equal(await field('purchaseDate').inputValue(),'');
  assert((await page.locator('#productScanStatus').textContent()).includes('Versandetikett'));assert.equal(await page.locator('#scanRecognizedText').textContent(),'');assert.equal(await page.evaluate(()=>lookups.length),0);
  // A explicitly labelled serial remains local even if its digits have a valid GTIN checksum.
  await open();await read('Razer\nBLACKWIDOW CHROMA\nS/N: 4006381333931\nModel Number: RZ03-0122',[{rawValue:'4006381333931',format:1}]);
  assert.equal(await field('serial').inputValue(),'4006381333931');assert.equal(await field('barcode').inputValue(),'');assert.equal(await page.evaluate(()=>lookups.length),0);
  await open();await read('Razer\nBLACKWIDOW CHROMA\nS/N\n4006381333931\nModel Number: RZ03-0122',[{rawValue:'4006381333931',format:1}]);
  assert.equal(await field('barcode').inputValue(),'');assert.equal(await page.evaluate(()=>lookups.length),0);
  for(const width of [320,360,768]){await page.setViewportSize({width,height:800});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}
  assert.deepEqual(errors,[]);await browser.close();
  console.log('PASS: live label bridge without photo, Razer title/model/serial/article number, multilingual and multiline labels, Casio without invented model/battery-as-model, shipping rejection, serial-only privacy, save/reload, QR exclusion and responsive form. Actual ML Kit camera OCR still needs a device test.');
})().catch(e=>{console.error(e);process.exit(1)});
