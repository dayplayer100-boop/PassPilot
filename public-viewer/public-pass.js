(function (global) {
  'use strict';
  const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
  const categories = {vehicle:'Auto / Fahrzeug',building:'Heizung / Haustechnik',ebike:'E-Bike / Fahrrad',electronics:'Elektronik',appliance:'Haushaltsgerät',tool:'Werkzeug',camera:'Kamera',instrument:'Instrument',other:'Sonstiges'};
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '';
  const count=value=>Number.isInteger(value)&&value>=0?Math.min(value,9999):0;
  const formatDate = value => value ? esc(value.split('-').reverse().join('.')) : '—';
  const conditions = {new:'Neu',likeNew:'Wie neu',good:'Gut',used:'Gebraucht',repair:'Reparaturbedürftig'};
  function safePhoto(value){return typeof value==='string'&&value.length<=2000000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);}
  function assetUrl(v){try{const u=new URL(v),q=new URLSearchParams(u.hash.slice(1));return u.protocol==='https:'&&['passpilot-app.web.app','passpilot-69f7c.firebaseapp.com','passpilot-product-pass.dayplayer100.chatgpt.site'].includes(u.hostname)&&/^[a-f0-9]{40}$/.test(q.get('asset')||'')?u.href:'';}catch{return '';}}
  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || ![1,2].includes(input.v)) return null;
    const sale = input.purpose === 'sale';
    const price = typeof input.askingPrice === 'number' && Number.isFinite(input.askingPrice) && input.askingPrice >= 0 ? input.askingPrice : null;
    return {assetStatusUrl:assetUrl(input.assetStatusUrl),photos:(Array.isArray(input.photos)?input.photos:[]).slice(0,3).filter(p=>safePhoto(p)&&p.length<=65000),evidence:sale&&input.evidence&&typeof input.evidence==='object'?{receipt:input.evidence.receipt===true,manual:input.evidence.manual===true,serialRecorded:input.evidence.serialRecorded===true,services:count(input.evidence.services),repairs:count(input.evidence.repairs)}:null,v:input.v,createdAt:date(typeof input.createdAt==='string'?input.createdAt.slice(0,10):''),purpose:sale?'sale':'pass',title:text(input.title,80),category:Object.hasOwn(categories,input.category)?input.category:'other',brand:text(input.brand,50),model:text(input.model,70),status:['active','sale','lost'].includes(input.status)?input.status:'active',serial:text(input.serial,70),purchaseDate:date(input.purchaseDate),warrantyUntil:date(input.warrantyUntil),nextMaintenance:date(input.nextMaintenance),askingPrice:sale?price:null,currency:input.currency==='USD'?'USD':'EUR',condition:Object.hasOwn(conditions,input.condition)?input.condition:'',description:sale?text(input.description,360):text(input.publicNote,180),history:(Array.isArray(input.history)?input.history:[]).slice(0,5).filter(h=>h&&typeof h==='object').map(h=>({date:date(h.date),title:text(h.title,60),details:text(h.details,80)}))};
  }
  function decode(encoded) {
    try {
      if (typeof encoded !== 'string' || encoded.length > 6000 || !/^[a-zA-Z0-9_-]+$/.test(encoded)) return null;
      const padded=encoded.replaceAll('-','+').replaceAll('_','/').padEnd(Math.ceil(encoded.length/4)*4,'=');
      return normalize(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded),c=>c.charCodeAt(0)))));
    } catch { return null; }
  }
  function render(input,options={}) {
    const data=normalize(input);
    if(!data) return '<section class="card"><h1>Ungültiger Produktpass</h1><p>Dieser QR-Link konnte nicht gelesen werden.</p></section>';
    const rows=[['Kategorie',categories[data.category]],['Marke',data.brand],['Modell',data.model],['Zustand',conditions[data.condition]],['Seriennummer',data.serial]];
    if(data.askingPrice!==null) rows.push(['Verkaufspreis',new Intl.NumberFormat('de-DE',{style:'currency',currency:data.currency}).format(data.askingPrice)]);
    let html=`<section class="card"><div class="eyebrow">${data.purpose==='sale'?'Öffentlicher Verkaufspass':'Öffentlicher Produktpass'}</div><h1>${esc(data.title||'Produkt')}</h1>${data.photos.length?'<div class="pass-photos">'+data.photos.map((src,i)=>`<img src="${esc(src)}" alt="Produktfoto ${i+1}" loading="lazy">`).join('')+'</div>':''}<p class="sale-status">${data.status==='sale'?'🏷 Zum Verkauf':data.status==='lost'?'Als verloren markiert':'Produktinformationen'}</p><dl class="public-fields">${rows.filter(([,value])=>value).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}${[['Kaufdatum',data.purchaseDate],['Garantie / Zusage bis',data.warrantyUntil],['Nächste Wartung',data.nextMaintenance]].filter(([,value])=>value).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${formatDate(value)}</dd></div>`).join('')}</dl>${data.description?`<h2>${data.purpose==='sale'?'Beschreibung':'Hinweis'}</h2><p class="public-description">${esc(data.description)}</p>`:''}</section>`;
    if(data.assetStatusUrl)html+='<section class="card"><h2>Identität dieses Exemplars</h2><a class="soft-btn" href="'+esc(data.assetStatusUrl)+'" rel="noreferrer">Aktuellen registrierten Status prüfen</a><p>Separater Serverstand. Registrierung und Nachweise sind keine unabhängige Eigentumsprüfung.</p></section>';
    if(data.evidence)html+=`<section class="card"><h2>Nachweisübersicht</h2><p>${data.evidence.receipt?'✓ Rechnung vorhanden':'Keine Rechnung erfasst'} · ${data.evidence.manual?'✓ Anleitung vorhanden':'Keine Anleitung erfasst'}</p><p>${data.evidence.serialRecorded?'✓ Seriennummer erfasst':'Keine Seriennummer erfasst'} · ${data.evidence.services} Wartungen · ${data.evidence.repairs} Reparaturen</p><small>Angaben des Eigentümers. Vorhandensein und Seriennummer sind nicht unabhängig verifiziert. Dateien werden nicht mit dieser Übersicht geteilt.</small></section>`;
    if(data.history.length) html+=`<section class="card"><h2>Freigegebene Historie</h2>${data.history.map(h=>`<article class="public-history"><h3>${esc(h.title||'Eintrag')}</h3><small>${formatDate(h.date)}</small>${h.details?`<p class="public-description">${esc(h.details)}</p>`:''}</article>`).join('')}</section>`;
    if(data.createdAt)html+=`<p class="public-footnote">Stand der Daten: ${formatDate(data.createdAt)}</p>`;
    html+=`<p class="public-footnote">Nur vom Eigentümer freigegebene Produktangaben. Angaben sind nicht unabhängig geprüft. ${options.online===true?'Dieser Online-Pass zeigt den zuletzt geladenen Stand und kann vom Besitzer aktualisiert oder deaktiviert werden.':'Dieser Pass enthält den Stand beim Erstellen; spätere Änderungen aktualisieren einen bereits geteilten QR-Code nicht.'}</p>`;
    return html;
  }
  global.PassPilotPublic={normalize,decode,render,safePhoto};
})(window);
