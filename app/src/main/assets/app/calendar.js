'use strict';

function localDate(date=new Date()) {
  return `${String(date.getFullYear()).padStart(4,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function calendarDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return '';
  const [year,month,day]=value.split('-').map(Number);
  const date=new Date(0);date.setHours(12,0,0,0);date.setFullYear(year,month-1,day);
  return localDate(date)===value?value:'';
}
function dateFromLocal(value) {
  const [year,month,day]=value.split('-').map(Number);const date=new Date(0);
  date.setHours(12,0,0,0);date.setFullYear(year,month-1,day);return date;
}
let calendarSelectedDate=localDate();
let calendarMonth=calendarSelectedDate.slice(0,7);
function normalizeCalendarEvent(event) {
  if(!event||typeof event!=='object'||Array.isArray(event)||!calendarDate(event.date))return null;
  return {id:typeof event.id==='string'&&event.id?clean(event.id,100):uid('event'),title:clean(event.title||'Termin',120),date:event.date,time:typeof event.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)?event.time:'',notes:clean(event.notes||'',500),productId:typeof event.productId==='string'?clean(event.productId,100):''};
}
function getCalendarEvents() {
  const events=[];
  for(const product of state.products){
    for(const [field,label,icon] of [['purchaseDate','Kaufdatum','🛒'],['returnUntil','Rückgabefrist','↩️'],['warrantyUntil','Garantie / Zusage endet','🛡️'],['nextMaintenance','Wartung','🔧']]){
      if(calendarDate(product[field]))events.push({id:`${product.id}:${field}`,date:product[field],time:'',title:label,detail:productTitle(product),productId:product.id,icon,source:'product'});
    }
    events.push(...PassPilotObligations.events(product));
    for(const plan of product.maintenancePlans||[])if(calendarDate(plan.due)&&plan.due!==product.nextMaintenance)events.push({id:product.id+':plan:'+plan.id,date:plan.due,time:'',title:plan.title||'Wartung',detail:productTitle(product),productId:product.id,icon:'🔧',source:'product'});
    for(const history of product.history||[]){
      if(!calendarDate(history.date)||(history.type==='purchase'&&history.date===product.purchaseDate))continue;
      events.push({id:`${product.id}:history:${history.id}`,date:history.date,time:'',title:history.title||'Historieneintrag',detail:productTitle(product),productId:product.id,icon:'📖',source:'history'});
    }
  }
  for(const event of state.calendarEvents){
    const product=getProduct(event.productId);
    events.push({...event,detail:product?productTitle(product):'Eigener Termin',icon:'📅',source:'custom'});
  }
  return events.sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')||a.title.localeCompare(b.title));
}
function calendarEventRow(event) {
  const action=event.source==='custom'?'edit-calendar-event':'open-calendar-product';
  return `<button type="button" class="action-row" data-action="${action}" data-id="${esc(event.source==='custom'?event.id:event.productId)}" data-source="${esc(event.source)}"><span class="product-icon">${event.icon}</span><span class="product-main"><strong>${esc(event.title)}</strong><small>${event.time?`${esc(event.time)} Uhr · `:''}${esc(event.detail)}</small></span><span class="row-end" aria-hidden="true">›</span></button>`;
}
function calendarView() {
  const events=getCalendarEvents().filter(e=>calendarFilter==='all'||(calendarFilter==='purchase'?e.id.endsWith(':purchaseDate'):calendarFilter==='custom'?e.source==='custom':e.source==='product'&&!e.id.endsWith(':purchaseDate')));const first=dateFromLocal(`${calendarMonth}-01`);
  const start=new Date(first);start.setDate(first.getDate()-(first.getDay()+6)%7);
  const counts=new Map();events.forEach(e=>counts.set(e.date,(counts.get(e.date)||0)+1));
  const today=localDate();const dayEvents=events.filter(e=>e.date===calendarSelectedDate);
  const monthLabel=new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric'}).format(first);
  const dayLabel=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dateFromLocal(calendarSelectedDate));
  const days=Array.from({length:42},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);const iso=localDate(date);const count=counts.get(iso)||0;return `<button type="button" class="calendar-day${iso.slice(0,7)!==calendarMonth?' outside-month':''}${iso===today?' is-today':''}" data-action="calendar-day" data-date="${iso}" aria-label="${esc(formatDate(iso))}, ${count} ${count===1?'Eintrag':'Einträge'}" aria-pressed="${iso===calendarSelectedDate}"><span>${date.getDate()}</span>${count?`<small class="calendar-count" aria-hidden="true">${count}</small>`:'<small class="calendar-count empty-count" aria-hidden="true">·</small>'}</button>`}).join('');
  return `<div class="section-title"><h2>Kalender</h2><button type="button" class="primary-btn" data-action="new-calendar-event">＋ Termin</button></div><p class="muted">Kaufdaten, Fristen und Historie erscheinen automatisch. Eigene Termine bleiben privat auf deinem Gerät.</p><section class="card calendar-card" aria-label="Monatskalender"><div class="calendar-toolbar"><button type="button" class="ghost-btn" data-action="calendar-prev" aria-label="Vorheriger Monat">‹</button><h3>${esc(monthLabel)}</h3><button type="button" class="ghost-btn" data-action="calendar-next" aria-label="Nächster Monat">›</button></div><label for="calendarMode">Ansicht</label><select id="calendarMode">${[['month','Monatskalender'],['list','Liste im Monat'],['day','Tag']].map(([v,t])=>`<option value="${v}" ${v===calendarMode?'selected':''}>${t}</option>`).join('')}</select><label for="calendarFilter">Einträge</label><select id="calendarFilter">${[['all','Alle'],['purchase','Käufe'],['custom','Eigene Termine'],['reminder','Fristen & Erinnerungen']].map(([v,t])=>`<option value="${v}" ${v===calendarFilter?'selected':''}>${t}</option>`).join('')}</select><div class="calendar-controls"><label for="calendarMonth">Monat wählen</label><input id="calendarMonth" type="month" value="${calendarMonth}"><button type="button" class="soft-btn" data-action="calendar-today">Heute</button></div>${calendarMode==='day'?`<label for="calendarDateInput">Tag wählen</label><input id="calendarDateInput" type="date" value="${calendarSelectedDate}"><button type="button" class="soft-btn" data-action="calendar-day" data-date="${calendarSelectedDate}">Einträge öffnen</button>`:''}<div class="calendar-weekdays" aria-hidden="true" ${calendarMode!=='month'?'hidden':''}>${['Mo','Di','Mi','Do','Fr','Sa','So'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-days" ${calendarMode!=='month'?'hidden':''}>${days}</div>${calendarMode==='list'?`<div class="action-list">${events.filter(e=>e.date.slice(0,7)===calendarMonth).map(e=>`<div><small>${esc(formatDate(e.date))}</small>${calendarEventRow(e)}</div>`).join('')||'<p>Keine Einträge in diesem Monat.</p>'}</div>`:''}</section><p class="muted">Tag antippen, um die Einträge zu öffnen.</p>`;
}
function shiftCalendarMonth(delta) {
  const date=dateFromLocal(`${calendarMonth}-01`);date.setMonth(date.getMonth()+delta);
  if(date.getFullYear()<1||date.getFullYear()>9999)return;
  calendarMonth=localDate(date).slice(0,7);calendarSelectedDate=`${calendarMonth}-01`;render();
}
function openCalendarEvent(id='') {
  const existing=state.calendarEvents.find(event=>event.id===id);if(id&&!existing)return;
  const event=existing||{id:'',date:calendarSelectedDate,title:'',time:'',notes:'',productId:''};
  const linkedProduct=getProduct(event.productId);
  modal(`<div class="modal-head"><h2>${existing?'Termin bearbeiten':'Wichtigen Termin hinzufügen'}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">✕</button></div><form id="calendarEventForm" data-id="${esc(event.id)}"><div class="form-grid"><div class="field full"><label for="eventTitle">Titel</label><input id="eventTitle" name="title" required maxlength="120" value="${esc(event.title)}" placeholder="z. B. Werkstatttermin"></div><div class="field"><label for="eventDate">Datum</label><input id="eventDate" name="date" type="date" required value="${esc(event.date)}"></div><div class="field"><label for="eventTime">Uhrzeit (optional)</label><input id="eventTime" name="time" type="time" value="${esc(event.time)}"></div><div class="field full"><label for="eventProduct">Produkt (optional)</label><select id="eventProduct" name="productId"><option value="">Kein Produkt zuordnen</option>${state.products.map(product=>`<option value="${esc(product.id)}" ${event.productId===product.id?'selected':''}>${esc(productTitle(product))}</option>`).join('')}</select></div><div class="field full"><label for="eventNotes">Private Notiz (optional)</label><textarea id="eventNotes" name="notes" maxlength="500">${esc(event.notes)}</textarea></div></div><p class="muted">Eigene Termine werden im Kalender gespeichert. Handy-Erinnerungen kannst du in der Android-App unter Einstellungen aktivieren. Im Web ist ein Kalenderdatei-Export verfügbar.</p><div class="form-actions">${existing?`<button type="button" class="danger-btn" data-action="delete-calendar-event" data-id="${esc(event.id)}">Termin löschen</button>`:''}${linkedProduct?`<button type="button" class="soft-btn" data-action="open-calendar-product" data-id="${esc(linkedProduct.id)}">Produkt öffnen</button>`:''}<button type="button" class="ghost-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn">Termin speichern</button></div></form>`);
}

function openCalendarDay(){const events=getCalendarEvents().filter(e=>e.date===calendarSelectedDate&&(!calendarFilter||calendarFilter==='all'||(calendarFilter==='purchase'?e.id.endsWith(':purchaseDate'):calendarFilter==='custom'?e.source==='custom':e.source==='product'&&!e.id.endsWith(':purchaseDate'))));modal(`<div class="modal-head"><h2>${esc(formatDate(calendarSelectedDate))}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">✕</button></div><div class="action-list">${events.map(calendarEventRow).join('')||'<p>Keine Einträge für diesen Tag.</p>'}</div><button type="button" class="primary-btn" data-action="new-calendar-event">＋ Termin</button>`);}
let calendarFilter='all';let calendarMode='month';
