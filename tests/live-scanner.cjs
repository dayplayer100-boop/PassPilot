const {reveal}=require('./ui-helpers.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
const EAN='4006381333931';

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:360,height:800}});
  await context.addInitScript(()=>{
    window.liveCalls=[];window.photoCalls=[];window.catalogCalls=[];window.searchCalls=[];window.pickerClicks=0;
    window.PassPilotAndroid={
      scanProduct:id=>liveCalls.push(id),scanProductPhoto:id=>photoCalls.push(id),
      lookupBarcode:(code,id)=>catalogCalls.push({code,id}),searchBarcodeOnline:code=>searchCalls.push(code)
    };
    document.addEventListener('click',event=>{if(event.target.id==='productScanPhoto')pickerClicks++});
  });
  await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>{const form=document.querySelector('#productForm.quick-product');if(form){if(form._capture&&!form.classList.contains('capture-manual'))form.querySelector('[data-action="capture-manual"]').click();form.querySelector('[data-action="quick-details"]').click();}}).observe(document.body,{childList:true,subtree:true})));
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('file://'+path.resolve(__dirname,'../app/src/main/assets/app/index.html'));
  await page.evaluate(()=>localStorage.setItem('passpilot-state-v2',JSON.stringify({version:4,settings:{introSeen:true},products:[],calendarEvents:[]})));
  await page.reload();
  const button=action=>page.locator('#productForm [data-action="'+action+'"]');
  const field=name=>page.locator('#productForm [name="'+name+'"]');
  const openNew=async()=>{
    await page.evaluate(()=>localStorage.removeItem('passpilot-catalog-v1'));
    if(await page.locator('#modal[open]').count()){await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
    await reveal(page.locator('.bottom-nav [data-action="new-product"]'));await page.locator('.bottom-nav [data-action="new-product"]').click();
  };
  const returnCode=async(rawValue,format=32)=>{
    const id=await page.evaluate(()=>liveCalls.at(-1));
    await page.evaluate(({id,rawValue,format})=>PassPilotScan.receiveNativeResult(id,{status:'success',text:'',barcodes:[{rawValue,format}]}),{id,rawValue,format});
  };

  await openNew();
  assert((await button('scan-product').textContent()).includes('live scannen'));
  await reveal(button('scan-product'));await button('scan-product').click();
  assert.equal(await page.evaluate(()=>liveCalls.length),1);
  assert.equal(await page.evaluate(()=>photoCalls.length),0);
  assert.equal(await page.evaluate(()=>pickerClicks),0,'Live scanning opened a photo picker');
  assert(await button('scan-product').isDisabled());
  assert(await button('scan-photo').isDisabled());
  await returnCode(EAN);
  assert.equal(await field('barcode').inputValue(),EAN);
  assert.equal(await field('coverPhoto').evaluate(input=>input.files.length),0);
  assert.equal(await page.locator('#scanRecognizedDetails').evaluate(node=>node.hidden),true);
  assert(!await button('scan-product').isDisabled());
  assert.deepEqual(await page.evaluate(()=>catalogCalls.map(request=>request.code)),[EAN]);
  assert.deepEqual(await page.evaluate(()=>Object.keys(catalogCalls[0]).sort()),['code','id']);
  await reveal(field('name'));await field('name').fill('Mein eigener Name');
  await reveal(field('notes'));await field('notes').fill('PRIVATE_NOTES');
  await page.evaluate(()=>{const r=catalogCalls.at(-1);PassPilotScan.receiveCatalogResult(r.id,{status:'success',code:r.code,source:'Testkatalog',fields:{name:'Bosch Cordless Drill',brand:'Bosch',model:'GSR 18V',categoryText:'Power tools drill',price:299,serial:'WRONG'}})});
  assert.equal(await field('name').inputValue(),'Mein eigener Name');
  assert.equal(await field('brand').inputValue(),'Bosch');
  assert.equal(await field('model').inputValue(),'GSR 18V');
  assert.equal(await field('category').inputValue(),'tool');
  assert.equal(await field('serial').inputValue(),'');
  assert.equal(await field('price').inputValue(),'');
  assert.equal(await field('purchaseDate').inputValue(),'');
  assert((await page.locator('#productScanStatus').textContent()).includes('Testkatalog'));
  await reveal(button('scan-websearch'));await button('scan-websearch').click();
  assert.deepEqual(await page.evaluate(()=>searchCalls),[EAN]);
  assert(!JSON.stringify(await page.evaluate(()=>catalogCalls)).includes('PRIVATE'));
  await reveal(button('scan-lookup'));await button('scan-lookup').click();
  await page.evaluate(()=>{const r=catalogCalls.at(-1);PassPilotScan.receiveCatalogResult(r.id,{status:'unavailable',code:r.code})});
  assert((await page.locator('#productScanStatus').textContent()).includes('im Internet suchen'));
  await reveal(field('scanOnline'));await field('scanOnline').uncheck();
  assert.equal(await page.locator('#scanCodeTools').evaluate(node=>node.hidden),true);
  await page.evaluate(()=>PassPilotScan.searchWeb());
  assert.equal(await page.evaluate(()=>searchCalls.length),1);

  // Photo OCR is an explicit separate action; barcode camera stays live by default.
  await openNew();
  await reveal(button('scan-photo'));await button('scan-photo').click();
  assert.equal(await page.evaluate(()=>photoCalls.length),1);
  assert.equal(await page.evaluate(()=>liveCalls.length),1);
  const photoId=await page.evaluate(()=>photoCalls.at(-1));
  await page.evaluate(id=>PassPilotScan.receiveNativeResult(id,{status:'success',text:'Sony\nModell: WH-1000XM5\nS/N: PHOTO123',barcodes:[]}),photoId);
  assert.equal(await field('serial').inputValue(),'PHOTO123');
  assert(!await button('scan-photo').isDisabled());

  // Manufacturer stock codes can be retained locally but do not become EANs/serials.
  await openNew();
  const lookupsBefore=await page.evaluate(()=>catalogCalls.length);
  await reveal(button('scan-product'));await button('scan-product').click();await returnCode('TOOL-42',1);
  assert.equal(await field('barcode').inputValue(),'TOOL-42');
  assert.equal(await field('serial').inputValue(),'');
  assert.equal(await page.evaluate(()=>catalogCalls.length),lookupsBefore);
  assert((await page.locator('#productScanStatus').textContent()).includes('keine EAN/UPC'));
  await openNew();await reveal(button('scan-product'));await button('scan-product').click();await returnCode('4006381333932');
  assert.equal(await field('barcode').inputValue(),'');
  assert.equal(await page.evaluate(()=>catalogCalls.length),lookupsBefore);
  await reveal(button('scan-product'));await button('scan-product').click();
  const stale=await page.evaluate(()=>liveCalls.at(-1));
  {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
  await page.evaluate(({stale,EAN})=>PassPilotScan.receiveNativeResult(stale,{status:'success',barcodes:[{rawValue:EAN}]}),{stale,EAN});
  assert.equal(await page.locator('#productForm [name="barcode"]').inputValue(),'','Closed form accepted a late result');
  assert.equal(await page.evaluate(()=>catalogCalls.length),lookupsBefore);

  // The browser fallback uses a running video stream, not a captured/file image.
  await openNew();
  await page.evaluate(EAN=>{
    delete PassPilotAndroid.scanProduct;
    window.mediaCalls=[];window.stoppedTracks=0;window.detectorFrames=0;window.browserCodes=true;
    const makeStream=()=>{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;const ctx=canvas.getContext('2d');ctx.fillRect(0,0,320,240);const stream=canvas.captureStream(10);for(const track of stream.getTracks()){const stop=track.stop.bind(track);track.stop=()=>{stoppedTracks++;stop()}}return stream};
    window.makeStream=makeStream;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async constraints=>{mediaCalls.push(constraints);return makeStream()}}});
    window.BarcodeDetector=class{static async getSupportedFormats(){return ['ean_13']}async detect(video){if(!(video instanceof HTMLVideoElement))throw Error('Expected live video');detectorFrames++;return browserCodes&&detectorFrames>=2?[{rawValue:EAN,format:'ean_13'}]:[]}};
  },EAN);
  const beforeWeb=await page.evaluate(()=>catalogCalls.length);
  await reveal(button('scan-product'));await button('scan-product').click();
  await page.waitForFunction(EAN=>document.querySelector('#productForm [name="barcode"]').value===EAN,EAN);
  assert.equal(await page.evaluate(()=>mediaCalls[0].audio),false);
  assert.equal(await page.evaluate(()=>mediaCalls[0].video.facingMode.ideal),'environment');
  assert(await page.evaluate(()=>detectorFrames>=2));
  assert.equal(await page.evaluate(()=>stoppedTracks),1);
  assert.equal(await page.evaluate(()=>pickerClicks),0);
  assert.equal(await page.locator('#webLiveVideo').evaluate(video=>video.srcObject),null);
  assert.equal(await page.locator('#webLiveScanner').evaluate(node=>node.hidden),true);
  assert.equal(await page.evaluate(()=>catalogCalls.length),beforeWeb+1);

  await openNew();await page.evaluate(()=>{browserCodes=false;detectorFrames=0});
  await reveal(button('scan-product'));await button('scan-product').click();await page.waitForFunction(()=>document.getElementById('webLiveVideo').srcObject!==null);
  await reveal(button('scan-stop'));await button('scan-stop').click();
  assert.equal(await page.evaluate(()=>stoppedTracks),2);
  assert(!await button('scan-product').isDisabled());
  assert((await page.locator('#productScanStatus').textContent()).includes('abgebrochen'));

  await openNew();await reveal(button('scan-product'));await button('scan-product').click();
  await page.waitForFunction(()=>document.getElementById('webLiveVideo').srcObject!==null);
  {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
  assert.equal(await page.evaluate(()=>stoppedTracks),3);

  // Granting browser access after closing the form cannot leak an active camera.
  await openNew();
  await page.evaluate(()=>navigator.mediaDevices.getUserMedia=constraints=>new Promise(resolve=>window.resolveCamera=resolve));
  await reveal(button('scan-product'));await button('scan-product').click();
  {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
  await page.evaluate(()=>resolveCamera(makeStream()));
  await page.waitForFunction(()=>stoppedTracks===4);

  await openNew();
  await page.evaluate(()=>navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError')});
  await reveal(button('scan-product'));await button('scan-product').click();
  await page.waitForFunction(()=>document.getElementById('productScanStatus').textContent.includes('nicht erlaubt'));
  assert(!await button('scan-product').isDisabled());
  assert.equal(await page.evaluate(()=>pickerClicks),0);

  await openNew();await page.evaluate(()=>{delete window.BarcodeDetector});
  await reveal(button('scan-product'));await button('scan-product').click();
  assert((await page.locator('#productScanStatus').textContent()).includes('aktuelle Android-App'));
  assert.equal(await page.evaluate(()=>pickerClicks),0);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: live scanner dispatch without photo picker, automatic code/catalog fill, optional web search, separate OCR, non-EAN handling, closed-form callbacks, continuous browser video, camera stop on success/cancel/close, late permission grant and denied permission. Native camera hardware still requires a device test.');
})().catch(error=>{console.error(error);process.exit(1)});
