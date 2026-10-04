const {reveal}=require('./ui-helpers.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');
const {chromium} = require('playwright');

const EAN = '4006381333931';
const SECOND_EAN = '9780201379624';
const label = 'BOSCH\nWaschmaschine\nModel No.: WGG244Z0\nS/N ABC123\nEAN: ' + EAN + '\nManufactured: 02.09.2024\nPRIVATE_LABEL_OWNER\nPRIVATE_LABEL_ADDRESS';

(async () => {
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  const context = await browser.newContext({viewport:{width:360,height:800}});
  await context.addInitScript(() => {
    window.scanCalls = [];
    window.lookupCalls = [];
    window.PassPilotAndroid = {
      scanProduct(requestId) { window.scanCalls.push(requestId); },
      lookupBarcode(code, requestId) { window.lookupCalls.push({code,requestId}); }
    };
  });
  await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>{const form=document.querySelector('#productForm.quick-product');if(form){if(form._capture&&!form.classList.contains('capture-manual'))form.querySelector('[data-action="capture-manual"]').click();form.querySelector('[data-action="quick-details"]').click();}}).observe(document.body,{childList:true,subtree:true})));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('file://' + path.resolve(__dirname,'../app/src/main/assets/app/index.html'));
  await page.evaluate(() => localStorage.setItem('passpilot-state-v2', JSON.stringify({version:4,settings:{introSeen:true},products:[],calendarEvents:[]})));
  await page.reload();
  const input = name => page.locator('#productForm [name="' + name + '"]');
  const value = name => input(name).inputValue();
  const openNew = async () => {
    await page.evaluate(() => localStorage.removeItem('passpilot-catalog-v1'));
    if (await page.locator('#modal[open]').count()) {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
    await reveal(page.locator('.bottom-nav [data-action="new-product"]'));await page.locator('.bottom-nav [data-action="new-product"]').click();
  };
  const scan = async result => {
    await reveal(page.locator('#productForm [data-action="scan-product"]'));await page.locator('#productForm [data-action="scan-product"]').click();
    const id = await page.evaluate(() => scanCalls.at(-1));
    assert.equal(typeof id, 'string');
    await page.evaluate(({id,result}) => PassPilotScan.receiveNativeResult(id,result), {id,result});
    return id;
  };
  const deliverCatalog = async fields => {
    const request = await page.evaluate(() => lookupCalls.at(-1));
    assert(request, 'Catalog request missing');
    await page.evaluate(({request,fields}) => PassPilotScan.receiveCatalogResult(request.requestId,{status:'success',code:request.code,source:'Testkatalog',fields}),{request,fields});
    return request;
  };

  // Checksums, GS1 and UPC-E: product identifiers must never be guessed as serial numbers.
  const parsed = await page.evaluate(({EAN,SECOND_EAN}) => ({
    checks: [EAN, SECOND_EAN, '96385074', '036000291452', '04006381333931'].map(PassPilotScan.validGtin),
    invalid: ['4006381333932','EAN ABC','1234567'].map(PassPilotScan.validGtin),
    upce: PassPilotScan.parseBarcodes([{rawValue:'04252614',format:1024}]),
    webUpce: PassPilotScan.parseBarcodes([{rawValue:'04252614',format:'upc_e'}]),
    gs1: PassPilotScan.parseBarcodes([{rawValue:'(01)04006381333931(21)FRAME123'}]),
    gs1raw: PassPilotScan.parseBarcodes([{rawValue:']C1010400638133393121FRAME123'}]),
    digital: PassPilotScan.parseBarcodes([{rawValue:'https://id.example/01/04006381333931/21/SN%20123'}]),
    multiple: PassPilotScan.parseBarcodes([EAN,SECOND_EAN]),
    ordinary: PassPilotScan.parseBarcodes([{rawValue:EAN}]),
    ambiguous: PassPilotScan.parseLabel('Manufactured: 03.10.2026\nWarranty: 24 months\nPrice: 999 EUR\n123456789\nUnknown machine'),
    simple: PassPilotScan.parseLabel('Sony WH-1000XM5\nSerial No ABC999\nHeadphones'),
    multiline: PassPilotScan.parseLabel('Marke\nCanon\nModell\nEOS R5\nSeriennummer\n123XYZ'),
    dates: PassPilotScan.parseLabel('Kaufdatum: 29.02.2024\nGarantie bis: 30.02.2026\nNächste Wartung: 2026-12-10\nKaufpreis: 1.299,99 EUR'),
    zero: PassPilotScan.missingFields({category:'other',name:'Test',brand:'Test',model:'Test',serial:'Test',purchaseDate:'2026-10-03',retailer:'Test',price:0})
  }), {EAN,SECOND_EAN});
  assert.deepEqual(parsed.checks, [true,true,true,true,true]);
  assert.deepEqual(parsed.invalid, [false,false,false]);
  assert.equal(parsed.upce.fields.barcode, '042100005264');
  assert.equal(parsed.webUpce.fields.barcode, '042100005264');
  assert.equal(parsed.gs1.fields.serial, 'FRAME123');
  assert.equal(parsed.gs1raw.fields.serial, 'FRAME123');
  assert.equal(parsed.digital.fields.serial, 'SN 123');
  assert.equal(parsed.multiple.codes.length,2);
  assert(!Object.hasOwn(parsed.multiple.fields,'barcode'));
  assert(!Object.hasOwn(parsed.ordinary.fields,'serial'));
  assert.deepEqual(parsed.ambiguous,{});
  assert.equal(parsed.simple.model,'WH-1000XM5');
  assert.equal(parsed.simple.brand,'Sony');
  assert.equal(parsed.simple.serial,'ABC999');
  assert.equal(parsed.multiline.model,'EOS R5');
  assert.equal(parsed.dates.purchaseDate,'2024-02-29');
  assert(!Object.hasOwn(parsed.dates,'warrantyUntil'));
  assert.equal(parsed.dates.nextMaintenance,'2026-12-10');
  assert.equal(parsed.dates.price,'1299.99');
  assert.deepEqual(parsed.zero,[]);

  await openNew();
  assert.equal(await page.locator('.field-incomplete').count(),7);
  assert.equal(await value('category'),'other');
  assert((await page.locator('#productMissingSummary').textContent()).includes('Kaufdatum'));
  assert((await input('brand').getAttribute('aria-describedby')).includes('completion-brand'));
  await scan({status:'success',text:label,barcodes:[{rawValue:EAN,format:32}]});
  assert.equal(await value('brand'),'Bosch');
  assert.equal(await value('model'),'WGG244Z0');
  assert.equal(await value('name'),'Bosch WGG244Z0');
  assert.equal(await value('serial'),'ABC123');
  assert.equal(await value('category'),'appliance');
  assert.equal(await value('barcode'),EAN);
  assert.equal(await value('purchaseDate'),'');
  assert.equal(await value('price'),'');
  assert.equal(await page.locator('.field-incomplete').count(),3);
  const lookup = await page.evaluate(() => lookupCalls.at(-1));
  assert.deepEqual(Object.keys(lookup).sort(),['code','requestId']);
  assert.equal(lookup.code,EAN);
  assert(!JSON.stringify(lookup).includes('PRIVATE_LABEL'));
  assert((await page.locator('#scanRecognizedText').textContent()).includes('PRIVATE_LABEL_OWNER'));
  await reveal(input('name'));await input('name').fill('Mein eigener Produktname');
  await deliverCatalog({name:'Catalog washing machine',brand:'Bosch',model:'WGG244Z0',categoryText:'Washing machines',price:42,serial:'WRONG_SERIAL',purchaseDate:'2000-01-01',retailer:'WRONG_RETAILER',location:'WRONG_ADDRESS',notes:'WRONG_NOTES'});
  assert.equal(await value('name'),'Mein eigener Produktname');
  assert.equal(await value('serial'),'ABC123');
  for (const field of ['price','purchaseDate','retailer','location','notes']) assert.equal(await value(field),'');
  for (const width of [320,360,768]) {
    await page.setViewportSize({width,height:800});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Product scan overflow at ' + width);
    assert(await page.locator('#productForm').evaluate(form => form.scrollWidth <= form.clientWidth + 1), 'Form overflow at ' + width);
  }
  await page.setViewportSize({width:360,height:800});
  await page.screenshot({path:'/workspace/toolchains/product-scan-1.6.png',fullPage:true});
  await reveal(page.locator('#productForm .form-actions .primary-btn'));await page.locator('#productForm .form-actions .primary-btn').click();
  await page.getByRole('heading',{name:'Mein eigener Produktname',exact:true}).waitFor();
  assert((await page.locator('.product-completion-summary').textContent()).includes('3 Angaben ergänzen'));
  assert.equal(await page.locator('.kv .badge.warn').filter({hasText:'Fehlt'}).count(),3);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('passpilot-state-v2')));
  assert.equal(saved.products[0].barcode,EAN);
  assert(!JSON.stringify(saved).includes('PRIVATE_LABEL'));
  assert(!Object.hasOwn(saved.products[0],'text'));
  assert.equal(saved.products[0].coverImage,'');
  assert.equal(saved.products[0].documents.length,0);
  const sale = await page.evaluate(() => saleSnapshot(state.products[0],{title:'Öffentliches Produkt',includeSerial:false,includePurchaseDate:false}));
  for (const key of ['barcode','retailer','price','notes','location','text']) assert(!Object.hasOwn(sale,key));
  assert(!JSON.stringify(sale).includes('PRIVATE_LABEL'));
  await page.reload();
  await reveal(page.locator('nav [data-nav="products"]'));await page.locator('nav [data-nav="products"]').click();
  await reveal(page.locator('[data-action="open-product"]').first());await page.locator('[data-action="open-product"]').first().click();
  assert((await page.locator('.product-completion-summary').textContent()).includes('Kaufdatum'));
  await reveal(page.locator('[data-action="edit-product"]').filter({hasText:'Angaben ergänzen'}));await page.locator('[data-action="edit-product"]').filter({hasText:'Angaben ergänzen'}).click();
  assert.equal(await value('barcode'),EAN);
  await reveal(input('purchaseDate'));await input('purchaseDate').fill('2026-10-03');
  await reveal(input('retailer'));await input('retailer').fill('Mein Händler');
  await reveal(input('price'));await input('price').fill('0');
  assert.equal(await page.locator('.field-incomplete').count(),0);
  assert((await page.locator('#productMissingSummary').textContent()).includes('Alle wichtigen'));
  await reveal(page.locator('#productForm .form-actions .primary-btn'));await page.locator('#productForm .form-actions .primary-btn').click();
  assert.equal(await page.locator('.product-completion-summary').count(),0);

  // Offline/cancel/no match and user-entered data stay usable.
  await openNew();
  await reveal(input('scanOnline'));await input('scanOnline').uncheck();
  const countBefore = await page.evaluate(() => lookupCalls.length);
  await reveal(input('brand'));await input('brand').fill('Eigene Marke');
  await scan({status:'success',text:'Marke: Sony\nModell: WH-1000XM5\nSeriennummer: SN001',barcodes:[{rawValue:EAN}]});
  assert.equal(await value('brand'),'Eigene Marke');
  assert.equal(await page.evaluate(() => lookupCalls.length),countBefore);
  assert((await page.locator('#productScanStatus').textContent()).includes('ausgeschaltet'));
  await scan({status:'cancelled',message:'Scan abgebrochen.'});
  assert.equal(await page.locator('[data-action="scan-product"]').isDisabled(),false);
  await scan({status:'success',text:'',barcodes:[]});
  assert((await page.locator('#productScanStatus').textContent()).includes('Keine sicheren'));
  await scan({status:'error',message:'Foto konnte nicht geöffnet werden.'});
  assert.equal(await page.locator('[data-action="scan-product"]').isDisabled(),false);

  // Several barcodes require explicit selection, even when OCR sees one of them.
  await openNew();
  await scan({status:'success',text:EAN,barcodes:[{rawValue:EAN},{rawValue:SECOND_EAN}]});
  assert.equal(await value('barcode'),'');
  assert.equal(await page.locator('[data-action="scan-select-code"]').count(),2);
  assert.equal(await page.evaluate(() => lookupCalls.length),countBefore);
  await page.locator('[data-action="scan-select-code"][data-code="'+SECOND_EAN+'"]').click();
  assert.equal(await value('barcode'),SECOND_EAN);
  const unavailable = await page.evaluate(() => lookupCalls.at(-1));
  await page.evaluate(request => PassPilotScan.receiveCatalogResult(request.requestId,{status:'unavailable',code:request.code}),unavailable);
  assert((await page.locator('#productScanStatus').textContent()).includes('Keine Katalogdaten'));

  // Late results from closed forms or changed codes must not populate another product.
  await reveal(page.locator('[data-action="scan-product"]'));await page.locator('[data-action="scan-product"]').click();
  const staleScan = await page.evaluate(() => scanCalls.at(-1));
  await openNew();
  await page.evaluate(({staleScan,unavailable}) => {
    PassPilotScan.receiveNativeResult(staleScan,{status:'success',text:'Marke: WRONG',barcodes:[]});
    PassPilotScan.receiveCatalogResult(unavailable.requestId,{status:'success',code:unavailable.code,fields:{brand:'WRONG'}});
  },{staleScan,unavailable});
  assert.equal(await value('brand'),'');
  await scan({status:'success',text:'',barcodes:[{rawValue:EAN}]});
  const changed = await page.evaluate(() => lookupCalls.at(-1));
  await reveal(input('barcode'));await input('barcode').fill(SECOND_EAN);
  await page.evaluate(request => PassPilotScan.receiveCatalogResult(request.requestId,{status:'success',code:request.code,fields:{brand:'WRONG'}}),changed);
  assert.equal(await value('brand'),'');
  await reveal(input('barcode'));await input('barcode').fill(EAN);
  await reveal(input('scanOnline'));await input('scanOnline').uncheck();
  await page.evaluate(request => PassPilotScan.receiveCatalogResult(request.requestId,{status:'success',code:request.code,fields:{brand:'WRONG'}}),changed);
  assert.equal(await value('brand'),'');

  // Manual fallback, foreign currency and hostile text.
  await openNew();
  await reveal(input('scanOnline'));await input('scanOnline').uncheck();
  await page.locator('#scanManualText').evaluate(node => node.closest('details').open = true);
  await reveal(page.locator('#scanManualText'));await page.locator('#scanManualText').fill('Marke: Canon\nModell: EOS R5\nS/N: CAM123\nKamera\nKaufpreis: 1299.99 usd\nKaufdatum: 03.10.2026');
  await reveal(page.locator('[data-action="scan-manual"]'));await page.locator('[data-action="scan-manual"]').click();
  assert.equal(await value('brand'),'Canon');
  assert.equal(await value('category'),'camera');
  assert.equal(await value('price'),'1299.99');
  assert.equal(await value('currency'),'USD');
  assert.equal(await value('purchaseDate'),'2026-10-03');
  await openNew();
  await reveal(input('currency'));await input('currency').selectOption('EUR');
  await scan({status:'success',text:'Kaufpreis: 50 USD\n<img src=x onerror="window.leaked=true">',barcodes:[]});
  assert.equal(await value('price'),'');
  assert.equal(await value('currency'),'EUR');
  assert.equal(await page.evaluate(() => !!window.leaked),false);
  assert.equal(await page.locator('#scanRecognizedText img').count(),0);

  // Private buyer dates/prices are not copied from somebody else's PassPilot QR.
  const passFields = await page.evaluate(() => {
    const publicPass = {v:2,type:'sale',title:'Kamera',category:'camera',brand:'Canon',model:'EOS R5',serial:'CAM123',purchaseDate:'2020-01-01',askingPrice:'500',condition:'Gut',note:'Kontaktdaten nicht importieren'};
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(publicPass)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
    return PassPilotScan.parseBarcodes([{rawValue:'https://passpilot-product-pass.dayplayer100.chatgpt.site/#pass='+encoded}]).fields;
  });
  assert.equal(passFields.brand,'Canon');
  assert.equal(passFields.model,'EOS R5');
  for (const key of ['purchaseDate','price','askingPrice','note','notes']) assert(!Object.hasOwn(passFields,key));

  // A browser without image detection offers a clear manual/native fallback.
  await page.evaluate(() => { delete window.BarcodeDetector; });
  await page.evaluate(() => PassPilotScan.photoChanged(new File(['test'],'label.jpg',{type:'image/jpeg'})));
  assert((await page.locator('#productScanStatus').textContent()).includes('Android-App'));
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: label fields, GTIN/UPC-E/GS1, native callbacks, catalog allowlist, offline/no-match, multiple-code choice, user inputs, missing-field markers, save/restart/edit, stale callbacks, currency, QR privacy and hostile text. Camera and ML Kit recognition require an Android-device test.');
})().catch(error => { console.error(error); process.exit(1); });
