const {reveal}=require('./ui-helpers.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
const EAN='4548736132580';
const SONY={name:'Sony Wireless Noise Cancelling Headphones WH-1000XM5 Black',brand:'Sony',categoryText:'Headphones'};

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:360,height:800}});
  await context.addInitScript(()=>{
    window.scans=[];window.catalogRequests=[];
    window.PassPilotAndroid={scanProduct:id=>scans.push(id),lookupBarcode:(code,id)=>catalogRequests.push({code,id})};
  });
  await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>{const form=document.querySelector('#productForm.quick-product');if(form){if(form._capture&&!form.classList.contains('capture-manual'))form.querySelector('[data-action="capture-manual"]').click();form.querySelector('[data-action="quick-details"]').click();}}).observe(document.body,{childList:true,subtree:true})));
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../app/src/main/assets/app/index.html'));
  await page.evaluate(()=>{localStorage.setItem('passpilot-state-v2',JSON.stringify({version:4,settings:{introSeen:true},products:[]}));localStorage.removeItem('passpilot-catalog-v1')});
  await page.reload();
  const field=name=>page.locator('#productForm [name="'+name+'"]');
  const open=async()=>{if(await page.locator('#modal[open]').count()){await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}await reveal(page.locator('.bottom-nav [data-action="add-entry"]'));await page.locator('.bottom-nav [data-action="add-entry"]').click();await page.locator('#modal [data-action=entry-category][data-kind=product]').click()};
  const scan=async code=>{await reveal(page.locator('[data-action="scan-product"]'));await page.locator('[data-action="scan-product"]').click();await page.evaluate(code=>PassPilotScan.receiveNativeResult(scans.at(-1),{status:'success',text:'',barcodes:[{rawValue:code,format:32}]}),code)};
  const result=async(fields,complete=true)=>page.evaluate(({fields,complete})=>{const r=catalogRequests.at(-1);PassPilotScan.receiveCatalogResult(r.id,{code:r.code,status:'success',fields,source:'Go-UPC',complete})},{fields,complete});
  const count=()=>page.evaluate(()=>catalogRequests.length);
  const cache=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('passpilot-catalog-v1')||'[]'));

  const cases=await page.evaluate(SONY=>({
    sony:PassPilotScan.catalogFields(SONY),
    brandFromName:PassPilotScan.catalogFields({name:'Canon EOS R5 Camera'}),
    phone:PassPilotScan.catalogFields({name:'Samsung Galaxy S24 Ultra Smartphone 256GB 5G'}),
    capacity:PassPilotScan.inferModel('Headphones 500g 30h 5GHz 4K'),
    ambiguous:PassPilotScan.inferModel('Sony WH-1000XM5 WH-1000XM4'),
    food:PassPilotScan.catalogFields({name:'Nutella',brand:'Nutella, Ferrero',categoryText:'en:spreads'}),
    unknown:PassPilotScan.catalogFields({name:'Harry Potter und der Stein der Weisen',categoryText:'Books',purchaseDate:'1998-01-01',price:5,serial:'WRONG'})
  }),SONY);
  assert.equal(cases.sony.name,SONY.name);assert.equal(cases.sony.brand,'Sony');assert.equal(cases.sony.model,'WH-1000XM5');assert.equal(cases.sony.category,'electronics');
  assert.equal(cases.brandFromName.brand,'Canon');assert.equal(cases.brandFromName.model,'EOS R5');assert.equal(cases.brandFromName.category,'camera');
  assert.equal(cases.phone.brand,'Samsung');assert.equal(cases.phone.model,'Galaxy S24 Ultra');
  assert.equal(cases.capacity,'');assert.equal(cases.ambiguous,'');assert.equal(cases.food.category,'other');
  assert.deepEqual(cases.unknown,{name:'Harry Potter und der Stein der Weisen',category:'other'});

  // A live barcode alone fills the product and enables saving without purchase details.
  await open();assert(await page.locator('#scanQuickSave').isHidden());
  await scan(EAN);assert.equal(await count(),1);
  await result({...SONY,price:299,retailer:'PRIVATE_SHOP',serial:'WRONG',notes:'PRIVATE_NOTES'},false);
  for(const [name,value]of Object.entries(cases.sony))assert.equal(await field(name).inputValue(),value);
  for(const name of ['price','retailer','serial','purchaseDate','notes','location'])assert.equal(await field(name).inputValue(),'');
  await reveal(page.locator('#scanQuickSave'));assert(await page.locator('#scanQuickSave').isVisible());
  assert((await page.locator('#productMissingSummary').textContent()).includes('bereits anlegen'));
  // Additional sources and a late response preserve user changes, and never cache them.
  await reveal(field('name'));await field('name').fill('PRIVATE_PERSONAL_NAME');await reveal(field('notes'));await field('notes').fill('PRIVATE_PERSONAL_NOTES');
  await result({...SONY,model:'WH-1000XM5'});
  assert.equal(await field('name').inputValue(),'PRIVATE_PERSONAL_NAME');
  assert(!JSON.stringify(await cache()).includes('PRIVATE'));assert(!JSON.stringify(await cache()).includes('299'));
  assert.equal((await cache())[0].fields.name,SONY.name);
  await reveal(page.locator('#scanQuickSave'));await page.locator('#scanQuickSave').click();
  const products=await page.evaluate(()=>JSON.parse(localStorage.getItem('passpilot-state-v2')).products);
  assert.equal(products.length,1);assert.equal(products[0].name,'PRIVATE_PERSONAL_NAME');assert.equal(products[0].model,'WH-1000XM5');assert.equal(products[0].purchaseDate,'');

  // Repeated/padded scans reuse only catalogue data, including when no network exists.
  await open();await scan('0'+EAN);assert.equal(await count(),1);
  assert.equal(await field('name').inputValue(),SONY.name);assert.equal(await field('model').inputValue(),'WH-1000XM5');
  assert.equal(await field('barcode').inputValue(),'0'+EAN);assert.equal(await field('notes').inputValue(),'');
  assert((await page.locator('#productScanStatus').textContent()).includes('Gespeicherte'));
  await reveal(page.locator('[data-action="scan-lookup"]'));await page.locator('[data-action="scan-lookup"]').click();assert.equal(await count(),2);
  await page.evaluate(()=>{const r=catalogRequests.at(-1);PassPilotScan.receiveCatalogResult(r.id,{code:r.code,status:'unavailable'})});
  assert.equal(await field('name').inputValue(),SONY.name);assert.equal((await cache()).length,1);

  // Turning off online enrichment disables requests; late/foreign responses cannot fill or cache.
  await open();await reveal(field('scanOnline'));await field('scanOnline').uncheck();await scan(EAN);assert.equal(await count(),2);assert.equal(await field('name').inputValue(),'');
  await open();await page.evaluate(()=>localStorage.removeItem('passpilot-catalog-v1'));await scan(EAN);
  const stale=await page.evaluate(()=>catalogRequests.at(-1));
  await page.evaluate(()=>{const r=catalogRequests.at(-1);PassPilotScan.receiveCatalogResult(r.id,{code:'3017620422003',status:'success',fields:{name:'WRONG'},complete:true})});
  assert.equal(await field('name').inputValue(),'');assert.equal((await cache()).length,0);
  {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
  await page.evaluate(({stale,SONY})=>PassPilotScan.receiveCatalogResult(stale.id,{code:stale.code,status:'success',fields:SONY}),{stale,SONY});
  assert.equal((await cache()).length,0);

  // Expired/corrupt data and unavailable localStorage leave ordinary lookup usable.
  await page.evaluate(({EAN,SONY})=>localStorage.setItem('passpilot-catalog-v1',JSON.stringify([{code:EAN,fields:SONY,savedAt:Date.now()-31*86400000,source:'Old'}])),{EAN,SONY});
  await open();const before=await count();await scan(EAN);assert.equal(await count(),before+1);assert.equal(await field('name').inputValue(),'');
  await result(SONY);assert.equal((await cache()).length,1);
  await open();await page.evaluate(()=>localStorage.setItem('passpilot-catalog-v1','broken-json'));await scan(EAN);assert.equal(await count(),before+2);await result(SONY);

  // A second product must not keep machine-filled details from the previous barcode.
  await reveal(page.locator('[data-action="scan-product"]'));await page.locator('[data-action="scan-product"]').click();
  await page.evaluate(()=>PassPilotScan.receiveNativeResult(scans.at(-1),{status:'success',text:'',barcodes:[{rawValue:'3017620422003'}]}));
  for(const name of ['name','brand','model','category'])assert.equal(await field(name).inputValue(),'');
  assert(await page.locator('#scanQuickSave').isHidden());

  // Browser JSON fallback validates response codes and ignores failed/foreign catalogues.
  await open();await page.evaluate(({SONY,EAN})=>{
    localStorage.removeItem('passpilot-catalog-v1');delete PassPilotAndroid.lookupBarcode;window.urls=[];
    window.fetch=async url=>{
      urls.push(url);
      if(url.includes('upcitemdb'))return{ok:false,status:429};
      if(url.includes('openproductsfacts'))return{ok:true,json:async()=>({status:1,code:EAN,product:{code:EAN,product_name:SONY.name,brands:SONY.brand,categories_tags:['en:headphones'],serial:'WRONG',price:299}})};
      if(url.includes('openfoodfacts'))return{ok:true,json:async()=>({status:1,code:'3017620422003',product:{code:'3017620422003',product_name:'Wrong product'}})};
      return{ok:false,status:404};
    };
  },{SONY,EAN});
  await scan(EAN);await page.waitForFunction(name=>document.querySelector('#productForm [name="name"]').value===name,SONY.name);
  assert.equal(await field('model').inputValue(),'WH-1000XM5');assert.equal(await field('price').inputValue(),'');assert.equal(await field('serial').inputValue(),'');
  assert.equal(await page.evaluate(()=>urls.filter(u=>/upcitemdb|openproductsfacts|openfoodfacts|openbeautyfacts/.test(u)).length),4);assert(await page.evaluate(()=>urls.every(u=>/upcitemdb|openproductsfacts|openfoodfacts|openbeautyfacts|\/modelFacts\//.test(u))));assert.equal((await cache()).length,1);

  // The existing full reset also removes the new catalogue cache.
  {await reveal(page.locator('#modal [data-action="close-modal"]').first());await page.locator('#modal [data-action="close-modal"]').first().click();}
  await page.getByRole('button',{name:'Einstellungen',exact:true}).click();
  page.once('dialog',dialog=>dialog.accept());
  await reveal(page.locator('[data-action="reset-app"]'));await page.locator('[data-action="reset-app"]').click();
  await page.waitForFunction(()=>localStorage.getItem('passpilot-catalog-v1')===null);
  assert.deepEqual(errors,[]);await browser.close();
  console.log('PASS: barcode-only product name/brand/model/category, realistic title parsing, quick save with missing purchase fields, user edits, metadata-only cache, repeat/offline/padded scans, force refresh, opt-out, stale and mismatched results, expiry/corrupt cache, subsequent products, browser fallback and full reset.');
})().catch(error=>{console.error(error);process.exit(1)});
