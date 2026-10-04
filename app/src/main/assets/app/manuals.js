(function(global){
  'use strict';
  const text=(value,max)=>typeof value==='string'?value.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
  function safeUrl(value){
    if(typeof value!=='string'||value.length>2048||/[\\\u0000-\u001f]/.test(value))return '';
    try{const url=new URL(value.trim());return url.protocol==='https:'&&url.hostname&&!url.username&&!url.password?url.href:''}catch{return ''}
  }
  function normalizeLink(doc){
    const url=safeUrl(doc?.url);if(!url)return null;
    return {id:text(doc.id,100)||uid('doc'),kind:'link',category:'Bedienungsanleitung',name:text(doc.name,120)||'Bedienungsanleitung',url,share:doc.share===true,createdAt:text(doc.createdAt,40)||new Date().toISOString(),linkStatus:['ok','gone','unknown'].includes(doc.linkStatus)?doc.linkStatus:'',linkCheckedAt:text(doc.linkCheckedAt,40)};
  }
  const officialDomains={rowenta:['rowenta.de','rowenta.com'],tefal:['tefal.de','tefal.com'],bosch:['bosch-professional.com','bosch-home.com','bosch-diy.com'],siemens:['siemens-home.bsh-group.com'],sony:['sony.de','sony.com','sony.net'],samsung:['samsung.com'],razer:['razer.com','razerzone.com'],casio:['casio.com'],makita:['makita.de','makita.com'],miele:['miele.de'],apple:['apple.com'],philips:['philips.com','philips.de'],canon:['canon.de','canon-europe.com'],nikon:['nikon.de','nikonimglib.com'],panasonic:['panasonic.com'],lg:['lg.com'],logitech:['logitech.com'],yamaha:['yamaha.com'],bose:['bose.com'],lenovo:['lenovo.com'],dell:['dell.com'],hp:['hp.com'],dyson:['dyson.de','dyson.com']};
  function autoSave(product,entries){if((product.documents||[]).some(d=>d.category==='Bedienungsanleitung'))return null;const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');const exact=v=>new RegExp('(?<![a-z0-9])'+norm(product.model).split('').join('[\\s_/-]*')+'(?![a-z0-9])','i').test(v);const domains=officialDomains[String(product.brand||'').toLowerCase()]||[],model=norm(product.model);if(model.length<4)return null;const candidates=entries.filter(r=>{const url=safeUrl(r.url);if(!url||r.type!=='PDF'||!model)return false;const u=new URL(url);return domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d))&&exact(r.title+' '+decodeURIComponent(u.pathname));});if(!candidates.length)return null;const preferred=candidates.filter(r=>/\/de\/|deutsch|german/i.test(r.url+' '+r.title));if(!preferred.length&&candidates.length>1)return null;const result=(preferred.length?preferred:candidates)[0],doc=normalizeLink({name:result.title,url:result.url,share:false});if(!doc)return null;product.documents.push(doc);saveState();return doc;}
  function searchUrl(product,kind){
    let query='';
    if(kind==='barcode'){
      const code=text(product.barcode,180),serial=text(product.serial,100).replace(/\s/g,'');
      if(!PassPilotScan.validGtin(code)||code===serial||(PassPilotScan.validGtin(serial)&&serial.padStart(14,'0')===code.padStart(14,'0')))return '';
      query='"'+code+'" Bedienungsanleitung PDF';
    }else{
      const model=text(product.model,100).replaceAll('"',''),brand=text(product.brand,80).replaceAll('"','');
      if(!model)return '';
      query=[brand,model].filter(Boolean).map(value=>'"'+value+'"').join(' ')+' Bedienungsanleitung manual PDF';if(kind==='official'){const domains=officialDomains[brand.toLowerCase()];if(!domains)return '';query+=' ('+domains.map(domain=>'site:'+domain).join(' OR ')+')';}
    }
    return 'https://www.google.com/search?q='+encodeURIComponent(query);
  }
  function open(value){const url=safeUrl(value);if(!url)return false;if(global.PassPilotAndroid?.openExternalLink)global.PassPilotAndroid.openExternalLink(url);else global.open(url,'_blank','noopener,noreferrer');return true}
  function search(product,kind){const url=searchUrl(product,kind);if(url)open(url);else toast('Für diese Suche fehlt eine passende EAN/UPC oder Modellangabe.')}
  function row(productId,doc){
    const url=safeUrl(doc.url);if(!url)return '';
    const host=new URL(url).hostname;
    return `<div class="document-row"><div class="product-main"><strong>${esc(doc.name||'Bedienungsanleitung')}</strong><small>Online-Link · ${esc(host)} · ${doc.share?'übergabefähig':'privat'}${doc.linkStatus==='gone'?' · ⚠ Link nicht erreichbar':''}</small></div><div class="doc-actions"><button class="ghost-btn" data-action="open-document" data-product-id="${esc(productId)}" data-doc-id="${esc(doc.id)}">Öffnen</button><button class="ghost-btn" data-action="edit-manual-link" data-product-id="${esc(productId)}" data-doc-id="${esc(doc.id)}">Bearbeiten</button><button class="ghost-btn" data-action="manual-check-link" data-product-id="${esc(productId)}" data-doc-id="${esc(doc.id)}">Link prüfen</button><button class="ghost-btn" data-action="manual-download" data-product-id="${esc(productId)}" data-doc-id="${esc(doc.id)}">PDF offline</button><button class="danger-btn" data-action="delete-document" data-product-id="${esc(productId)}" data-doc-id="${esc(doc.id)}">×</button></div></div>`;
  }
  function section(product){
    const manuals=(product.documents||[]).filter(doc=>doc.kind==='link'||doc.category==='Bedienungsanleitung');
    return `<section id="productManuals" class="card" style="margin-top:14px"><h2>Anleitungen & Hilfe</h2><p class="muted">Passende PDF- oder Herstellerseite suchen und den Link direkt bei diesem Produkt hinterlegen. Prüfe im Treffer, ob das Modell passt.</p><div class="detail-actions"><button class="primary-btn" data-action="find-manual" data-id="${esc(product.id)}">Anleitung finden</button><button class="soft-btn" data-action="search-manual" data-id="${esc(product.id)}" data-kind="official" ${searchUrl(product,'official')?'':'disabled'}>Beim Hersteller suchen</button><button class="soft-btn" data-action="search-manual" data-id="${esc(product.id)}" data-kind="model" ${searchUrl(product,'model')?'':'disabled'}>Mit Modell suchen</button><button class="soft-btn" data-action="search-manual" data-id="${esc(product.id)}" data-kind="barcode" ${searchUrl(product,'barcode')?'':'disabled'}>Mit Barcode suchen</button><button class="soft-btn" data-action="add-manual-link" data-id="${esc(product.id)}">＋ Anleitungslink</button><button class="ghost-btn" data-action="add-manual-file" data-id="${esc(product.id)}">PDF lokal speichern</button></div><div id="manualResults" role="status"></div><small class="muted">Die Websuche öffnet den Browser mit EAN/UPC oder Marke und Modell. Seriennummer, privater Produktname und Notizen werden nicht mitgesendet.</small>${manuals.length?`<div class="product-list" style="margin-top:12px">${manuals.map(doc=>documentRow(product.id,doc)).join('')}</div>`:'<p class="muted">Noch keine Anleitung hinterlegt. Online-Links benötigen Internet; gespeicherte PDF-Dateien bleiben lokal verfügbar.</p>'}</section>`;
  }
  function form(product,doc={}){
    return `<div class="modal-head"><h2>${doc.id?'Anleitungslink bearbeiten':'Anleitungslink hinterlegen'}</h2><button class="icon-btn" data-action="close-modal">✕</button></div><form id="manualLinkForm" data-id="${esc(product.id)}" data-doc-id="${esc(doc.id||'')}"><p>PDF-Link oder Herstellerseite einfügen. Das richtige Modell in der Anleitung prüfen.</p><div class="form-grid"><div class="field full"><label for="manualName">Titel (optional)</label><input id="manualName" name="name" maxlength="120" value="${esc(doc.name||'')}" placeholder="Bedienungsanleitung"></div><div class="field full"><label for="manualUrl">PDF- oder Herstellerlink</label><input id="manualUrl" name="url" type="url" required maxlength="2048" value="${esc(doc.url||'')}" placeholder="https://…"></div><div class="field full"><label class="checkbox-row"><input name="share" type="checkbox" ${doc.share?'checked':''}> Bei digitaler Übergabe mitgeben</label></div></div><div class="form-actions"><button type="button" class="ghost-btn" data-action="preview-manual-link">Link öffnen / prüfen</button><button class="primary-btn">Speichern</button></div></form>`;
  }
  global.PassPilotManuals={safeUrl,normalizeLink,autoSave,searchUrl,open,search,row,section,form};
})(window);
