'use strict';

const APP_VERSION = '1.24.0-test';
const PUBLIC_VIEWER_URL = 'https://passpilot-app.web.app/pass/';
const UPDATE_HISTORY = [
  {version:'1.24.0-test',date:'04.10.2026',changes:['Kompakte Übersicht mit direkten Zugängen zu Verträgen, Wartungen und geschützten Gerätepasswörtern.','Verträge und Wartungen direkt anlegen, mit oder ohne Gerät; weniger Pflichtfelder und einheitliche Auswahlfelder und Schalter.','E-Mail-Bestätigung ohne Abmelden prüfen; Google-Anmeldung für Web und Android vorbereitet.','Verschlüsselter Sync fängt gleichzeitige Ersteinrichtung und wechselnde Dateistände ab.','Fehler und Ideen mit geprüfter Bildschirmvorschau melden; Benachrichtigungskanäle zentral wählen.','Alle vorhandenen Plus-Funktionen im Testmodus offen, Zahlungen aus; Android-Zurück schließt Dialoge und navigiert innerhalb der App.']},
  {version:'1.23.0-test',date:'04.10.2026',changes:['Ratenkauf, Leasing, Geräteverträge, Versicherungen und Garantieverlängerungen privat am Produkt verwalten.','Bestätigte Zahlungen, Restbeträge, Rückgabe- und Kündigungsfristen im Kalender; Finanzierungsdiagramme nur Plus / Family / Dauerfreischaltung.','Wartungsvorschläge für Fahrzeuge, Heizung und Pumpen; Folge-Termine erst nach bestätigter Erledigung.','Verschlüsselte Geräte-PINs und Eselsbrücken mit separatem Passwort, automatischem Sperren und Ausschluss aus öffentlichen Freigaben.','Kleinanzeigen-/eBay-Vorbereitung mit kopierbaren Daten und Produktfotos. Tarife und Einmalcode-Register für Firebase vorbereitet, Zahlungen bleiben deaktiviert.']},
  {version:'1.20.0-test',date:'04.10.2026',changes:['Funktionsabos statt Produktstaffel: lokale Akte bleibt kostenlos; Plus für Sync/Online-Pässe und Komfort, Pro zusätzlich KI mit Kontingent.','Kündigung vorbereitet: 30 Tage Restzugriff, mindestens bis zum bezahlten Ende; danach nur Premium-Aktionen eingeschränkt. Daten, Lesen und Backup bleiben erhalten.','Serverseitige Berechtigungen und eindeutige Kaufzuordnung vorbereitet; keine Selbstfreigabe und keine Verlängerung durch wiederholte Kündigung. Zahlungen und Sperren noch deaktiviert.']},
  {version:'1.19.0-test',date:'04.10.2026',changes:['Rechnungspositionen besser erkennen und Produktangaben sofort darunter prüfen; Einzelpreis getrennt vom Gesamtbetrag.','Diebstahlmeldung nur mit individuell bestätigter Seriennummer; EAN und Artikelnummer reichen nicht.','Kalendertage als Fenster, Filter nach Käufen, Terminen und Fristen; Sicherheitsschalter mit Aktiv-Status.','Android-Zoom deaktiviert, Rücksprung zur Startseite korrigiert, lange Titel umbrechen.','Verkaufstext vorgeschlagen und Datenlink ohne Konto; Monatsabos und signierte Freischaltcodes vorbereitet, Zahlungen noch deaktiviert.']},
  {version:'1.18.0-test',date:'04.10.2026',changes:['Jedes physische Exemplar bekommt eine dauerhafte Asset-ID, private Merkmale, einen QR-Tag und getrennte Verleihnotizen.','Optionale Online-Registrierung mit Duplikatprüfung und durch Datenbankregeln geschütztem Identitätsprotokoll.','Registrierte Übergabe: Empfänger akzeptiert, Absender bestätigt endgültig, erst danach wechselt das registrierte Konto.','Öffentlicher Status ohne private Besitzerangaben; Angaben und Nachweise sind ausdrücklich nicht unabhängig verifiziert.']},
  {version:'1.17.0-test',date:'04.10.2026',changes:['Bilder bei der Erfassung mit Vorschau entfernen oder ersetzen; Auswahl auch vor dem Speichern prüfen.','Rechnungs-PDF direkt auswählen und zusätzliche PDFs oder Bilder schon beim Erstellen hinzufügen; einzelne Unterlagen wieder entfernen.','Produktfotos und Kaufdaten in der gesamten Historie und beim Lebenslauf sichtbar.']},
  {version:'1.16.0-test',date:'04.10.2026',changes:['Lebenslauf öffnet eine Gesamtübersicht mit Foto, Kaufdaten und allen Ereignissen; gezielt bearbeiten oder hinzufügen.','Kaufpreis mit automatischem Kauf-Eintrag verbunden und nach Neustart sichtbar; Gesamtkosten zählen den Kauf nur einmal.','Kaufdatum und Kaufpreis im letzten Erfassungsschritt sofort sichtbar; erkannte Rechnungsbeträge lassen sich dort bewusst übernehmen.']},
  {version:'1.15.0-test',date:'04.10.2026',changes:['Typenschild und Barcode gemeinsam lesen; Ausschnitt wählen, drehen und erneut erkennen. Rechnungs-PDFs bis zehn Seiten, bessere Datum-/Betragvorschläge.','Produktfotos im Produktpass und optional im öffentlichen Verkaufslink. Übergabe direkt per QR, Link oder E-Mail-Entwurf.','Assistenten-Überlagerung auf kleinen Displays korrigiert; Rechnung oder PDF lokal im Helfer auslesen. Optionale Dokument-KI vorbereitet, noch deaktiviert.']},
  {version:'1.14.0-test',date:'04.10.2026',changes:['Einfachere Startseite, Produktaktionen und Einstellungen; weitere Optionen bei Bedarf öffnen.','Verschiebbare Hilfe-Bubble mit Chat-Fragen, lokalen Antworten und vorbereiteter optionaler KI-Anbindung.','Copyright- und Lizenzhinweise; öffentlicher Quellcode-Download entfernt.']},
  {version:'1.13.0-test',date:'04.10.2026',changes:['Code, Rechnung und Produktfoto bleiben der schnelle Erfassungsweg. Neue lokale Hilfe und Updatezugänge.','Verschlüsselte, freiwillige Synchronisation mit demselben Konto und eigenem Sync-Passwort.','Diebstahl bleibt privat im Lebenslauf; normaler Verlust ändert nur den Status.','Metadaten, Tastaturbedienung und transparente Datenschutzinformationen verbessert.']},
  {version:'1.12.0-test',date:'04.10.2026',changes:['Geführte Erfassung: Code, Rechnung, Produktfoto, Prüfung. Kamera und Galerie getrennt verfügbar.','Beleg- und Etikett-Texterkennung auch im Web; Preise werden erst nach Prüfung übernommen.','Mehrseitige Kamera-PDFs, breitere Web-Barcode-Erkennung und Hersteller-Suche im Web.']},
  {version:'1.11.0-test',date:'04.10.2026',changes:['Schnellerfassung, Volltextsuche, Filter und Tags; Historie bearbeiten und löschen.','Import mit Duplikat-Auswahl, sichere Übergabe und Datum auf QR-Pässen.','Beleg-Assistent, mehrseitige PDFs, PDF-Viewer, Inventar/CSV/ICS und Verkaufstexte.','Optionale Gerätesperre, lokale Erinnerungen, Backup-Ordner und Speicherübersicht.']},
  { version: '1.10.0-test', date: '03.10.2026', changes: [
    'Anleitungen & Hilfe bei jedem Produkt: Über EAN/UPC oder Marke und Modell nach PDF-Anleitungen und Herstellerseiten suchen.',
    'Direkte Anleitungslinks speichern, öffnen, bearbeiten und löschen. PDF-Dateien können lokal als Bedienungsanleitung hinterlegt werden.',
    'Anleitungslinks bleiben privat und sind im Backup enthalten; bei digitaler Übergabe nur nach eigener Freigabe mitgeben.'
  ] },
  { version: '1.9.0-test', date: '03.10.2026', changes: [
    'Etikett live lesen: Kamera auf das Typenschild richten, Text direkt erkennen und Angaben ohne Fotoaufnahme übernehmen.',
    'Marke, Produktname, Modellnummer, Seriennummer und Produkt-/Artikelnummer von Geräteetiketten übernehmen; auch mehrsprachige Beschriftungen lesen.',
    'Versandetiketten werden nicht als Produktdaten übernommen. Seriennummern bleiben aus der Online-Produktsuche ausgeschlossen.'
  ] },
  { version: '1.8.0-test', date: '03.10.2026', changes: [
    'Mehr Produktkataloge: Nach dem Barcode-Scan Produktname, Marke, Modell und Kategorie automatisch ergänzen, soweit verfügbar.',
    'Passende Katalogtreffer werden sofort angezeigt und fehlende Angaben aus weiteren Quellen ergänzt. Eigene Eingaben bleiben erhalten.',
    'Gefundene Produktinfos lokal für spätere Scans merken; weitere Angaben lassen sich nach dem Anlegen ergänzen.'
  ] },
  { version: '1.7.0-test', date: '03.10.2026', changes: [
    'Live-Barcode-Scanner: Kamera direkt öffnen und Produktcodes ohne Fotoaufnahme automatisch übernehmen.',
    'Fokus per Antippen, Licht-Taste und automatische Suche nach passenden Produktinfos über EAN/UPC.',
    'Bei fehlendem Katalogtreffer die Websuche öffnen. Etikettfotos bleiben als separate Erfassung möglich.'
  ] },
  { version: '1.6.0-test', date: '03.10.2026', changes: [
    'Beim Anlegen und Bearbeiten Barcode oder Produktetikett fotografieren und erkannte Angaben übernehmen.',
    'Lokale Barcode- und Texterkennung auf Android; optionale Produktkatalog-Suche über EAN/UPC.',
    'Fehlende Angaben werden im Formular und nach dem Speichern markiert. Eigene Eingaben bleiben erhalten.'
  ] },
  { version: '1.5.0-test', date: '03.10.2026', changes: [
    'Druckbarer Verkaufszettel mit allen freigegebenen Produktangaben und scanbarem QR-Code.',
    'Druckvorschau und Android-Druckdialog zum Drucken oder Speichern als PDF.',
    'Papier und QR enthalten dieselben öffentlichen Angaben; private Daten bleiben ausgeschlossen.'
  ] },
  { version: '1.4.0-test', date: '03.10.2026', changes: [
    'Die Übersichtskarten öffnen alle Produkte, offene Aktionen oder die gesamte Historie.',
    'Neuer Kalender: Kaufdaten, Rückgabefristen, Garantie, Wartung und Historieneinträge automatisch sehen.',
    'Eigene private Termine mit Datum, optionaler Uhrzeit, Notiz und Produktzuordnung anlegen, bearbeiten und löschen.'
  ] },
  { version: '1.3.0-test', date: '03.10.2026', changes: [
    'Verkaufen erstellt einen QR-Verkaufspass, den Interessenten ohne App öffnen können.',
    'Öffentliche Vorschau, separater Verkaufspreis und gezielte Freigabe von Seriennummer, Fristen und Historie.',
    'Private Notizen, Standort, ursprünglicher Kaufpreis, Händler und Dokumente bleiben aus dem Verkaufs-QR ausgeschlossen.'
  ] },
  { version: '1.2.0-test', date: '03.10.2026', changes: [
    'Android-Anzeige: Abstand zur Statusleiste, Kameraaussparung und Navigationsleiste berücksichtigt.',
    'Unter Einstellungen zeigt „Was ist neu?“ die Änderungen je Update.'
  ] },
  { version: '1.1.0-test', date: '03.10.2026', changes: [
    'Fester Test-Schlüssel: Neue Testversionen können über bestehende Testversionen installiert werden.'
  ] }
];
const STORAGE_KEY = 'passpilot-state-v2';
const LEGACY_STORAGE_KEY = 'passpilot-state-v1';
const DB_NAME = 'passpilot-files-v1';
const DB_VERSION = 1;
const FILE_STORE = 'files';

const categoryMeta = {
  vehicle: ['Auto / Fahrzeug', '🚗'],
  building: ['Heizung / Haustechnik', '🏠'],
  ebike: ['E-Bike / Fahrrad', '🚲'],
  electronics: ['Elektronik', '💻'],
  appliance: ['Haushaltsgerät', '🧺'],
  tool: ['Werkzeug', '🛠️'],
  camera: ['Kamera', '📷'],
  instrument: ['Instrument', '🎸'],
  other: ['Sonstiges', '📦']
};

let currentView = 'dashboard';
let toastTimer = null;
let activeSaleSheet = null;
let deferredInstallPrompt = null;
const state = loadState();

function defaultState() {
  return {
    version: 4,
    settings: { ownerAlias: '', publicBaseUrl: '', introSeen: false, demoMode: false, accountLoginRequired:true },
    products: [],
    calendarEvents: []
  };
}

function normalizeProduct(p) {
  const product = {
    id: p.id || uid('prod'), recordKind: p.recordKind==='contract'?'contract':'product',
    ...PassPilotIdentity.normalize(p),
    createdAt: p.createdAt || new Date().toISOString(),
    category: Object.hasOwn(categoryMeta,p.category) ? p.category : '',
    purchaseKind:['new','used','private'].includes(p.purchaseKind)?p.purchaseKind:'',originalBox:['yes','no'].includes(p.originalBox)?p.originalBox:'',name: p.name || '', brand: p.brand || '', model: p.model || '', partNumber: typeof p.partNumber==='string'?p.partNumber.slice(0,100):'', serial: p.serial || '', barcode: typeof p.barcode==='string'?p.barcode.slice(0,180):'',
    location: p.location || '', purchaseDate: p.purchaseDate || '', retailer: p.retailer || '',
    price: p.price ?? '', currency: p.currency || 'EUR', returnUntil: p.returnUntil || '',
    warrantyUntil: p.warrantyUntil || '', nextMaintenance: p.nextMaintenance || '',
    deviceAccess: PassPilotDeviceAccess.normalize(p.deviceAccess),
    obligations: Array.isArray(p.obligations)?p.obligations.map(PassPilotObligations.normalize).filter(Boolean):[],
    handoffPhotos: Array.isArray(p.handoffPhotos)?p.handoffPhotos.slice(0,2).filter(PassPilotPublic.safePhoto):[], notes: p.notes || '', publicNote: p.publicNote || '', coverImage: p.coverImage || '',
    lossReason: ['lost','stolen'].includes(p.lossReason)?p.lossReason:'', lossPreviousStatus: ['active','sale','sold'].includes(p.lossPreviousStatus)?p.lossPreviousStatus:'',
    status: ['active','lost','sale','sold'].includes(p.status) ? p.status : 'active',
    publicSettings: { serial: p.publicSettings?.serial === true, purchaseDate: Boolean(p.publicSettings?.purchaseDate) },
    sale: p.sale && typeof p.sale === 'object' ? normalizeSale(p.sale) : null,
    history: Array.isArray(p.history) ? p.history : [],
    documents: Array.isArray(p.documents) ? p.documents.map(doc=>doc?.kind==='link'?PassPilotManuals.normalizeLink(doc):doc).filter(Boolean) : [],
    parentId: typeof p.parentId==='string'?p.parentId:'', reminders: Array.isArray(p.reminders)?p.reminders.filter(n=>[30,14,7,3,1,0].includes(n)):[14,3,1], maintenancePlans: Array.isArray(p.maintenancePlans)?p.maintenancePlans:[], productInfo: p.productInfo&&typeof p.productInfo==='object'?p.productInfo:{}, invoiceNumber: typeof p.invoiceNumber==='string'?p.invoiceNumber:'', onlineHandoffId: typeof p.onlineHandoffId==='string'?p.onlineHandoffId:'', householdId: typeof p.householdId==='string'?p.householdId:'', onlinePassActive:p.onlinePassActive===true,onlinePassExpires:typeof p.onlinePassExpires==='string'?p.onlinePassExpires:'', onlinePassUrl:typeof p.onlinePassUrl==='string'?p.onlinePassUrl:'', onlinePassId: typeof p.onlinePassId==='string'?p.onlinePassId:'', tags: PassPilotPlus.tags(p.tags), qrCreatedAt: typeof p.qrCreatedAt==='string'?p.qrCreatedAt:'',
    transfers: Array.isArray(p.transfers)?p.transfers.slice(-100):[],
    isDemo: Boolean(p.isDemo)
  };
  return PassPilotLifecycle.restorePurchase(product);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const out = defaultState();
    out.settings = { ...out.settings, ...(parsed.settings || {}) };if(parsed.settings?.accountLoginRequired==null)out.settings.accountLoginRequired=false;
    if(parsed.version < 3 && out.settings.introSeen == null) out.settings.introSeen = false;
    if(out.settings.demoMode == null) out.settings.demoMode = false;
    out.products = Array.isArray(parsed.products) ? parsed.products.map(normalizeProduct) : [];
    out.calendarEvents = Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents.map(normalizeCalendarEvent).filter(Boolean) : [];
    if(Array.isArray(parsed.products)&&parsed.products.some(p=>!/^[a-f0-9]{40}$/.test(p.assetId||''))){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(out));}catch(error){console.warn('Identitäts-IDs konnten noch nicht gespeichert werden. Bestehende Produkte bleiben geladen.');queueMicrotask(()=>toast('Speicher voll: Produkte geladen, neue Identitäts-IDs noch nicht gespeichert. Backup erstellen und Speicher freigeben.'));}}
    return out;
  } catch (err) {
    console.warn('State konnte nicht geladen werden:', err);
    return defaultState();
  }
}

function saveState() {
  for(const p of state.products)PassPilotLifecycle.syncPurchase(p);
  if(window.PassPilotPlus)PassPilotPlus.changed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.PassPilotSync?.changed();
}

function uid(prefix='id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function esc(value='') {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat('de-DE').format(d);
}

function formatMoney(value, currency='EUR') {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '—';
  try { return new Intl.NumberFormat('de-DE',{style:'currency',currency}).format(Number(value)); }
  catch { return `${value} ${currency}`; }
}

function daysUntil(date) {
  if (!date) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target-now)/86400000);
}

function productTitle(p) { return p.name?.trim() || [p.brand,p.model].filter(Boolean).join(' ') || 'Unbenanntes Produkt'; }
function categoryLabel(key) { return categoryMeta[key]?.[0] || categoryMeta.other[0]; }
function categoryIcon(key) { return categoryMeta[key]?.[1] || categoryMeta.other[1]; }
function getProduct(id) { return state.products.find(p=>p.id===id); }

function statusBadge(status) {if(status==='sold')return '<span class="badge">Verkauft / archiviert</span>';
  if (status === 'lost') return '<span class="badge danger">🚨 Verloren</span>';
  if (status === 'sale') return '<span class="badge warn">🏷 Verkauf</span>';
  return '<span class="badge good">● Aktiv</span>';
}

function deadlineBadge(date, horizon=30) {
  const d = daysUntil(date);
  if (d == null || d > horizon) return '';
  if (d < 0) return `<span class="badge danger">${Math.abs(d)} Tage überfällig</span>`;
  const kind = d<=3 ? 'danger' : d<=14 ? 'warn' : 'neutral';
  return `<span class="badge ${kind}">${d===0?'heute':`${d} Tage`}</span>`;
}

function openDb() {
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains(FILE_STORE)) db.createObjectStore(FILE_STORE,{keyPath:'key'}); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}

async function putFile(productId, docId, file) {
  const db=await openDb();
  return new Promise((resolve,reject)=>{ const tx=db.transaction(FILE_STORE,'readwrite'); tx.objectStore(FILE_STORE).put({key:`${productId}:${docId}`,productId,docId,blob:file}); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); });
}

async function getFile(productId, docId) {
  const db=await openDb();
  return new Promise((resolve,reject)=>{ const tx=db.transaction(FILE_STORE,'readonly'); const req=tx.objectStore(FILE_STORE).get(`${productId}:${docId}`); req.onsuccess=()=>resolve(req.result?.blob||null); req.onerror=()=>reject(req.error); });
}

async function deleteFile(productId, docId) {
  const db=await openDb();
  return new Promise((resolve,reject)=>{ const tx=db.transaction(FILE_STORE,'readwrite'); tx.objectStore(FILE_STORE).delete(`${productId}:${docId}`); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); });
}

function blobToDataUrl(blob) {
  return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(blob); });
}

function dataUrlToBlob(dataUrl) {
  const [head,data]=dataUrl.split(',');
  const mime=head.match(/data:(.*?);base64/)?.[1]||'application/octet-stream';
  const binary=atob(data); const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return new Blob([bytes],{type:mime});
}

async function getProductFiles(productId, shareOnly=false) {
  const p=getProduct(productId); if(!p) return [];
  const docs=(p.documents||[]).filter(d=>d.kind!=='link'&&(!shareOnly||d.share));
  const rows=[];
  for(const doc of docs){ const blob=await getFile(productId,doc.id); if(blob) rows.push({productId,doc,data:await blobToDataUrl(blob)}); }
  return rows;
}

function toast(message) {
  const active=document.querySelector('#helpDialog[open]')||document.querySelector('#modal[open]');if(active){let status=active.querySelector('.dialog-feedback');if(!status){status=document.createElement('p');status.className='dialog-feedback';status.setAttribute('role','status');(active.querySelector('.modal-inner')||active).prepend(status);}status.textContent=message;}const el=document.getElementById('toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}

function modal(content) {
  PassPilotDeviceAccess.cleanup();delete document.getElementById('modal').dataset.dirty;
  PassPilotCapture.cleanup(document.getElementById('productForm'));PassPilotScan.cleanup();const d=document.getElementById('modal');const wasOpen=d.open; d.innerHTML=`<div class="modal-inner">${content}</div>`;
  PassPilotExperience.prepareModal(d,wasOpen);if(!d.open) d.showModal();
  if(document.getElementById('productForm')){PassPilotScan.initialize();PassPilotCapture.mount();}
}
function closeModal(){ window.PassPilotDeviceAccess?.cleanup();PassPilotCapture.cleanup(document.getElementById('productForm'));PassPilotScan.cleanup();const d=document.getElementById('modal'); if(d.open)d.close(); }
function setNav(view){ document.querySelectorAll('[data-nav]').forEach(b=>{b.classList.toggle('active',b.dataset.nav===view);if(b.dataset.nav===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}); }

function getActions() {
  const actions=[];
  for(const p of state.products){
    const rd=daysUntil(p.returnUntil);
    if(rd!=null&&rd>=0&&rd<=30) actions.push({productId:p.id,kind:rd<=3?'danger':'warn',icon:'↩️',title:rd===0?'Rückgabefrist endet heute':`Rückgabefrist in ${rd} Tagen`,detail:productTitle(p),date:p.returnUntil});
    const wd=daysUntil(p.warrantyUntil);
    if(wd!=null&&wd>=0&&wd<=90) actions.push({productId:p.id,kind:wd<=14?'warn':'neutral',icon:'🛡️',title:wd===0?'Garantie endet heute':`Garantie endet in ${wd} Tagen`,detail:productTitle(p),date:p.warrantyUntil});
    const md=daysUntil(p.nextMaintenance);
    if(md!=null&&md<=30) actions.push({productId:p.id,kind:md<0?'danger':md<=7?'warn':'neutral',icon:'🔧',title:md<0?`Wartung seit ${Math.abs(md)} Tagen fällig`:md===0?'Wartung heute fällig':`Wartung in ${md} Tagen`,detail:productTitle(p),date:p.nextMaintenance});
    if(p.status!=='sold'&&PassPilotUpgrades.paidCached('contractReminders'))for(const event of PassPilotObligations.events(p)){const d=daysUntil(event.date);if(d!=null&&d<=30)actions.push({productId:p.id,kind:d<0?'danger':d<=7?'warn':'neutral',icon:event.icon,title:event.title+(d<0?' · Frist vergangen':d===0?' · heute':' · in '+d+' Tagen'),detail:event.detail,date:event.date});}
    if(p.status==='lost') actions.push({productId:p.id,kind:'danger',icon:'🚨',title:'Als verloren markiert',detail:productTitle(p),date:''});
    if(!p.serial&&['ebike','electronics','tool','camera','instrument'].includes(p.category)) actions.push({productId:p.id,kind:'neutral',icon:'🔢',title:'Seriennummer ergänzen',detail:productTitle(p),date:'9998-01-01'});
  }
  return actions.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
}

function render() {
  PassPilotNavigation.remember({view:currentView});
  delete document.getElementById('app').dataset.productId;
  if(location.hash.startsWith('#pass=')){ renderPublicPass(location.hash.slice(6)); return; }
  const app=document.getElementById('app'); setNav(currentView);if(state.settings.accountLoginRequired&&(!PassPilotFirebase.user()||(state.settings.localAccountUid&&state.settings.localAccountUid!==PassPilotFirebase.user()))){app.innerHTML='<section class="card"><h1>Bei PassPilot anmelden</h1><p>Deine Produkte bleiben gespeichert. Melde dich an, um sie zu verwalten.</p><button class="primary-btn" data-action="account-open">Anmelden / Konto erstellen</button><button class="ghost-btn" data-action="export-backup">Lokales Backup sichern</button></section>';return;}
  document.body.classList.toggle('demo-mode', Boolean(state.settings.demoMode));
  if(currentView==='products') app.innerHTML=productsView();
  else if(currentView==='actions') app.innerHTML=actionsView();
  else if(currentView==='backup') app.innerHTML=backupView();
  else if(currentView==='history') app.innerHTML=allHistoryView();
  else if(currentView==='calendar') app.innerHTML=calendarView();
  else if(['contracts','maintenance','vault'].includes(currentView)) app.innerHTML=PassPilotOrganizer.view(currentView);
  else app.innerHTML=dashboardView();
  if(state.settings.demoMode && !document.getElementById('demoBanner')){
    app.insertAdjacentHTML('afterbegin', demoBanner());
  }
}

function demoBanner(){
  return `<section id="demoBanner" class="demo-banner"><div><strong>Demo-Modus aktiv</strong><small>Du schaust dir Beispieldaten an. Du kannst den Demo-Modus jederzeit beenden.</small></div><div class="demo-actions"><button class="soft-btn" data-action="intro">Einführung</button><button class="ghost-btn" data-action="exit-demo">Demo beenden</button></div></section>`;
}

function introModal(){
  return `<div class="modal-head"><div><div class="eyebrow">In 60 Sekunden startklar</div><h2>Willkommen bei PassPilot</h2></div><button class="icon-btn" data-action="close-modal">✕</button></div>
  <div class="intro-hero intro-hero-premium">
    <div class="intro-mark">P</div>
    <div><strong>Alles Wichtige zu deinen Dingen an einem Ort.</strong><p>Rechnung, Garantie, Wartung, QR-Pass und Übergabe – übersichtlich und zunächst komplett lokal auf deinem Gerät.</p></div>
  </div>
  <div class="intro-steps">
    <div class="intro-step"><span>1</span><div><strong>Produkt erfassen</strong><small>Code scannen → Rechnung → Produktfoto → Angaben prüfen.</small></div></div>
    <div class="intro-step"><span>2</span><div><strong>Unterlagen & Historie sammeln</strong><small>Belege, Reparaturen und Wartungen bleiben beim Produkt gebündelt.</small></div></div>
    <div class="intro-step"><span>3</span><div><strong>QR-Pass teilen oder übergeben</strong><small>Du entscheidest selbst, welche Informationen öffentlich sichtbar sind.</small></div></div>
  </div>
  <div class="intro-trust"><span>🔒</span><div><strong>Privat bleibt privat</strong><small>Lokal starten; verschlüsselte Synchronisation ist freiwillig. Öffentliche QR-Daten werden nur aus von dir freigegebenen Feldern erzeugt.</small></div></div>
  <div class="form-actions intro-actions"><button type="button" class="ghost-btn" data-action="close-modal">Später</button><button type="button" class="soft-btn" data-action="load-demo">Demo ansehen</button><button type="button" class="primary-btn" data-action="start-guided">Erstes Produkt anlegen</button></div>`;
}

function maybeShowIntro(){if(window.PassPilotPendingHandoff)return;
  if(!state.settings.introSeen){
    state.settings.introSeen = true;
    saveState();
    modal(introModal());
  }
}

function dashboardView() {
  const actions=getActions(),products=state.products.filter(p=>p.recordKind!=='contract').slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  return `<section class="hero compact-hero"><div><div class="eyebrow">Dein Produktarchiv</div><h1>Alles im Blick.</h1><p>Produkte, Unterlagen und nächste Termine.</p></div><button class="primary-btn" data-action="new-product">＋ Produkt</button></section>
  ${PassPilotOrganizer.shortcuts()}
  <div class="section-title"><h2>Jetzt wichtig</h2><button class="ghost-btn" data-nav="actions">${actions.length?'Alle '+actions.length:'Fristen'}</button></div>${actions.length?`<div class="action-list">${actions.slice(0,3).map(actionRow).join('')}</div>`:'<div class="empty compact-empty">Keine dringenden Fristen.</div>'}
  <div class="section-title"><h2>Deine Produkte</h2><button class="ghost-btn" data-nav="products">Alle</button></div>${products.length?`<div class="product-list">${products.slice(0,3).map(productRow).join('')}</div>`:'<div class="empty"><strong>Starte mit deinem ersten Produkt.</strong><p>Code scannen, Rechnung oder Foto auswählen.</p><button class="soft-btn" data-action="new-product">Produkt hinzufügen</button></div>'}`;
}

function productsView() { return PassPilotPlus.productsView(); }

function allHistoryView() {
  const entries=state.products.flatMap(product=>(product.history||[]).map(history=>({product,history}))).sort((a,b)=>(b.history.date||'').localeCompare(a.history.date||''));
  return `<div class="section-title"><h2>Gesamte Historie</h2><span class="muted">${entries.length} ${entries.length===1?'Eintrag':'Einträge'}</span></div>${entries.length?`<div class="action-list">${entries.map(({product,history})=>`<button type="button" class="action-row" data-action="open-calendar-product" data-id="${esc(product.id)}" data-source="history">${product.coverImage?`<img class="product-thumb" src="${esc(product.coverImage)}" alt="Produktfoto">`:`<span class="product-icon">${categoryIcon(product.category)}</span>`}<span class="product-main"><strong>${esc(history.title||'Eintrag')}</strong><small>${esc(productTitle(product))} · ${formatDate(history.date)}</small><small>${esc([product.brand,product.model].filter(Boolean).join(' · '))}${PassPilotLifecycle.hasAmount(product.price)?` · Kaufpreis: ${formatMoney(product.price,product.currency)}`:''}</small>${history.details?`<span class="history-summary">${esc(history.details)}</span>`:''}</span><span class="row-end" aria-hidden="true">›</span></button>`).join('')}</div>`:'<div class="empty">Noch keine Historieneinträge. Öffne ein Produkt, um einen Eintrag hinzuzufügen.</div>'}`;
}

function actionsView() {
  const actions=getActions();
  return `<div class="section-title"><h2>Aktionen</h2><span class="muted">Was Aufmerksamkeit braucht</span></div>${actions.length?`<div class="action-list">${actions.map(actionRow).join('')}</div>`:'<div class="empty">Aktuell gibt es keine offenen Fristen oder Warnungen.</div>'}<div class="card flat-card" style="margin-top:14px"><strong>Das Ziel</strong><p class="muted">PassPilot soll nicht nur Dinge speichern, sondern dir im richtigen Moment sagen, was du mit ihnen tun solltest: zurückgeben, warten, reklamieren, verkaufen oder übergeben.</p></div>`;
}

function backupView() { return PassPilotPlus.backupView(); }

function productRow(p) {
  const media=p.coverImage?`<img class="product-thumb" src="${esc(p.coverImage)}" alt="">`:`<span class="product-icon">${categoryIcon(p.category)}</span>`;
  return `<button class="product-row" data-action="open-product" data-id="${esc(p.id)}">${media}<span class="product-main"><strong>${esc(productTitle(p))}</strong><small>${esc(categoryLabel(p.category))}${p.serial?` · SN ${esc(p.serial)}`:''}</small></span><span>${statusBadge(p.status)}</span><span class="row-end">›</span></button>`;
}

function actionRow(a) {
  return `<button class="action-row" data-action="open-product" data-id="${esc(a.productId)}"><span class="product-icon">${a.icon}</span><span class="product-main"><strong>${esc(a.title)}</strong><small>${esc(a.detail)}${a.date&&a.date<'9998'?` · ${formatDate(a.date)}`:''}</small></span><span class="badge ${a.kind}">${a.kind==='danger'?'wichtig':a.kind==='warn'?'bald':'Info'}</span><span class="row-end">›</span></button>`;
}

function openProduct(id) {
  const p=getProduct(id); if(!p)return;
  if(p.recordKind==='contract')return PassPilotOrganizer.record(p);
  PassPilotNavigation.remember({view:currentView,productId:id});
  setNav('');document.getElementById('app').dataset.productId=id; document.getElementById('app').innerHTML=productDetailView(p);PassPilotSharing.productPhotos(p);window.scrollTo(0,0);
}

function productDetailView(p) {
  const missing=PassPilotScan.missingFields(p);
  const missingBadge='<span class="badge warn" aria-label="Nicht angegeben">⚠ Fehlt</span>';
  const history=(p.history||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')); const docs=(p.documents||[]).filter(doc=>doc.kind!=='link'&&doc.category!=='Bedienungsanleitung');
  const cover=p.coverImage?`<img class="cover-image" src="${esc(p.coverImage)}" alt="Produktfoto">`:`<div class="detail-icon">${categoryIcon(p.category)}</div>`;
  return `<button class="ghost-btn" data-nav="products" style="margin-bottom:12px">← Produkte</button><section class="card"><div class="detail-head">${cover}<div style="flex:1"><div class="eyebrow">${esc(categoryLabel(p.category))}</div><h1>${esc(productTitle(p))}</h1><div class="muted">${esc([p.brand,p.model].filter(Boolean).join(' · '))}</div><div style="margin-top:8px">${p.status==='lost'&&p.lossReason==='stolen'?'<span class="badge danger">🚨 Gestohlen</span>':statusBadge(p.status)}</div></div></div><div id="productPhotos"></div><div class="detail-actions product-primary-actions"><button class="primary-btn" data-action="add-document" data-id="${esc(p.id)}">＋ Unterlage</button><button class="soft-btn" data-action="lifecycle-open" data-id="${esc(p.id)}">Lebenslauf ansehen</button><button class="soft-btn" data-action="sale-product" data-id="${esc(p.id)}">${p.status==='sale'?'Verkaufs-QR öffnen':'Verkaufen'}</button></div><details class="simple-more product-more"><summary>Mehr</summary><div class="detail-actions"><button class="ghost-btn" data-action="edit-product" data-id="${esc(p.id)}">Bearbeiten</button><button class="soft-btn" data-action="show-pass" data-id="${esc(p.id)}">QR-Pass</button><button class="ghost-btn" data-action="assistant" data-id="${esc(p.id)}">Weitere Aktionen</button><button class="ghost-btn" data-action="transfer-product" data-id="${esc(p.id)}">Übergeben</button><button class="ghost-btn" data-action="toggle-lost" data-id="${esc(p.id)}">${p.status==='lost'?'Als gefunden markieren':PassPilotIdentity.theftEligible(p)?'Verloren / gestohlen melden':'Verloren melden'}</button>${p.status==='sale'?`<button class="ghost-btn" data-action="end-sale" data-id="${esc(p.id)}">Verkauf beenden</button>`:''}${p.status==='sale'&&p.sale?`<button class="soft-btn" data-action="sale-sheet" data-id="${esc(p.id)}">Verkaufszettel drucken</button>`:''}</div></details></section>
  ${missing.length?`<details class="card simple-more product-completion-summary" style="margin-top:14px"><summary>Noch ${missing.length} ${missing.length===1?'Angabe':'Angaben'} ergänzen</summary><p>${esc(missing.map(field=>field.label).join(', '))}</p><button type="button" class="soft-btn" data-action="edit-product" data-id="${esc(p.id)}">Angaben ergänzen</button></details>`:''}<section class="grid" style="margin-top:14px"><div class="card span-6"><h3>Kauf & Fristen</h3><div class="kv"><div>Kaufdatum</div><div>${p.purchaseDate?formatDate(p.purchaseDate):missingBadge}</div><div>Händler</div><div>${p.retailer?esc(p.retailer):missingBadge}</div><div>Kaufpreis</div><div>${p.price===''||p.price==null?missingBadge:formatMoney(p.price,p.currency)}</div><div>Rückgabe bis</div><div>${formatDate(p.returnUntil)} ${deadlineBadge(p.returnUntil,30)}</div><div>Garantie bis</div><div>${formatDate(p.warrantyUntil)} ${deadlineBadge(p.warrantyUntil,90)}</div><div>Nächste Wartung</div><div>${formatDate(p.nextMaintenance)} ${deadlineBadge(p.nextMaintenance,30)}</div></div></div><div class="card span-6"><h3>Produktidentität</h3><div class="kv"><div>Marke</div><div>${p.brand?esc(p.brand):missingBadge}</div><div>Modell</div><div>${p.model?esc(p.model):missingBadge}</div>${p.barcode?`<div>Barcode / EAN</div><div>${esc(p.barcode)}</div>`:''}${p.partNumber?`<div>Produkt-/Artikelnummer</div><div>${esc(p.partNumber)}</div>`:''}<div>Internetdaten</div><div><button type="button" class="ghost-btn" data-action="model-facts" data-id="${esc(p.id)}">Preis & Daten prüfen</button></div><div>Seriennummer</div><div>${p.serial?esc(p.serial):missingBadge}</div><div>Ort</div><div>${esc(p.location||'—')}</div><div>Status</div><div>${p.status==='lost'&&p.lossReason==='stolen'?'<span class="badge danger">🚨 Gestohlen</span>':statusBadge(p.status)}</div></div></div>${p.notes?`<div class="card span-12"><h3>Private Notiz</h3><p>${esc(p.notes).replaceAll('\n','<br>')}</p></div>`:''}</section>
  ${PassPilotObligations.section(p)}${PassPilotDeviceAccess.section(p)}${PassPilotIdentity.summary(p)}${PassPilotPlus.productExtras(p)}${PassPilotManuals.section(p)}<div class="section-title" id="productHistory"><h2>Lebenslauf</h2><button class="soft-btn" data-action="add-history" data-id="${esc(p.id)}">＋ Eintrag</button></div>${history.length?`<div class="history-product-context">${p.coverImage?`<img class="product-thumb" src="${esc(p.coverImage)}" alt="Produktfoto">`:''}<span><strong>${esc(productTitle(p))}</strong><small>${p.purchaseDate?formatDate(p.purchaseDate):'Kaufdatum offen'}${PassPilotLifecycle.hasAmount(p.price)?` · ${formatMoney(p.price,p.currency)}`:''}</small></span></div><div class="timeline">${history.map(h=>historyRow(h,p.id)).join('')}</div>`:'<div class="empty">Noch keine Historie.</div>'}
  <div class="section-title"><h2>Dokumente</h2><button class="soft-btn" data-action="add-document" data-id="${esc(p.id)}">＋ Datei</button></div>${docs.length?`<div class="product-list">${docs.map(d=>documentRow(p.id,d)).join('')}</div>`:'<div class="empty">Noch keine lokalen Dokumente hinterlegt.</div>'}
  <div class="danger-zone"><button class="danger-link" data-action="delete-product" data-id="${esc(p.id)}">Produkt vollständig löschen</button></div>`;
}

function historyRow(h,productId) {
  const icons={purchase:'🛒',service:'🔧',repair:'🧰',maintenance:'🧼',note:'📝',transfer:'⇄'};
  return `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-body"><strong>${icons[h.type]||'•'} ${esc(h.title||'Eintrag')}</strong><small>${formatDate(h.date)} · ${h.public?'im öffentlichen Pass':'privat'}</small>${h.cost!==''&&h.cost!=null?`<p>Kosten: ${formatMoney(h.cost,h.currency||'EUR')}</p>`:''}${h.details?`<p>${esc(h.details).replaceAll('\n','<br>')}</p>`:''}<div class="detail-actions"><button class="ghost-btn" data-action="edit-history" data-id="${esc(productId)}" data-history-id="${esc(h.id)}">Bearbeiten</button><button class="danger-btn" data-action="delete-history" data-id="${esc(productId)}" data-history-id="${esc(h.id)}">Löschen</button></div></div></div>`;
}

function documentRow(productId,d) {
  if(d.kind==='link')return PassPilotManuals.row(productId,d);
  return `<div class="document-row"><div class="product-main"><strong>${esc(d.name)}</strong><small>${esc(d.category||'Dokument')} · ${formatBytes(d.size)} · ${d.share?'übergabefähig':'privat'}</small></div><div class="doc-actions"><button class="ghost-btn" data-action="open-document" data-product-id="${esc(productId)}" data-doc-id="${esc(d.id)}">Öffnen</button><button class="danger-btn" data-action="delete-document" data-product-id="${esc(productId)}" data-doc-id="${esc(d.id)}">×</button></div></div>`;
}

function formatBytes(bytes=0){ if(bytes<1024)return`${bytes} B`; if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`; return`${(bytes/1048576).toFixed(1)} MB`; }

function productForm(p={}) {
  const edit=Boolean(p.id);
  return `<div class="modal-head"><h2>${edit?'Produkt bearbeiten':'Produkt hinzufügen'}</h2><button class="icon-btn" data-action="close-modal">✕</button></div><form id="productForm" class="${edit?'':'quick-product'}" data-id="${esc(p.id||'')}"><p class="muted">${edit?'Angaben prüfen und ändern.':'Name oder Modell reicht. Ein Foto ist optional. Weitere Angaben später ergänzen.'}</p>${PassPilotScan.panel(edit)}<div class="form-grid"><div class="field full"><label>Produktfoto</label><input type="file" name="coverPhoto" accept="image/*"><button type="button" class="ghost-btn" data-action="product-photo-camera">Produkt fotografieren</button><div id="editPhotoPreview"></div><small class="muted">Optional. Wird verkleinert und lokal gespeichert.</small></div><div class="field product-category"><label>Kategorie</label><select name="category"><option value="" ${!p.category&&edit?'selected':''}>Bitte auswählen</option>${Object.entries(categoryMeta).map(([k,v])=>`<option value="${k}" ${(p.category||(!edit?'other':''))===k?'selected':''}>${v[1]} ${v[0]}</option>`).join('')}</select></div><div class="field quick-name"><label>Produktname</label><input name="name" value="${esc(p.name||'')}" placeholder="Wird nach dem Scan ergänzt"></div></div><button type="button" class="ghost-btn quick-toggle" data-action="quick-details">Weitere Angaben anzeigen</button><div class="form-grid extra-product-fields"><div class="field"><label>Marke</label><input name="brand" value="${esc(p.brand||'')}" placeholder="Cube"></div><div class="field"><label>Modell</label><input name="model" value="${esc(p.model||'')}" placeholder="Kathmandu Hybrid"></div><div class="field"><label>Produkt-/Artikelnummer (optional)</label><input name="partNumber" maxlength="100" value="${esc(p.partNumber||'')}"></div><div class="field"><label>Serien-/Rahmennummer</label><input name="serial" value="${esc(p.serial||'')}"></div><label class="checkbox-row"><input type="checkbox" name="individualSerial" ${PassPilotIdentity.theftEligible(p)?'checked':''}>Seriennummer gehört nur zu diesem Exemplar (keine EAN / Artikelnummer)</label><div class="field"><label>Barcode / EAN (optional)</label><input name="barcode" maxlength="180" value="${esc(p.barcode||'')}"></div><div class="field"><label>Standort / Zuordnung</label><input name="location" value="${esc(p.location||'')}" placeholder="Garage, Büro …"></div><div class="field"><label>Kaufdatum</label><input type="date" name="purchaseDate" value="${esc(p.purchaseDate||'')}"></div><div class="field"><label>Händler</label><input name="retailer" value="${esc(p.retailer||'')}"></div><div class="field"><label>Kaufpreis</label><input type="number" min="0" step="0.01" name="price" value="${esc(p.price??'')}"></div><div class="field"><label>Währung</label><select name="currency"><option ${p.currency!=='USD'?'selected':''}>EUR</option><option ${p.currency==='USD'?'selected':''}>USD</option></select></div><div class="field"><label>Rückgabe möglich bis</label><input type="date" name="returnUntil" value="${esc(p.returnUntil||'')}"></div><div class="field"><label>Garantie / Zusage bis</label><input type="date" name="warrantyUntil" value="${esc(p.warrantyUntil||'')}"><button type="button" class="ghost-btn" data-action="warranty-suggest">Frist berechnen</button><small class="muted">Dauer laut Unterlagen wählen; keine automatische Garantie-Zusage.</small></div><div class="field"><label>Nächste Wartung</label><input type="date" name="nextMaintenance" value="${esc(p.nextMaintenance||'')}"></div><div class="field full"><label>Gehört zu einem Produkt (optional)</label><select name="parentId"><option value="">Eigenständiges Produkt</option>${state.products.filter(other=>other.id!==p.id&&!PassPilotPlus.wouldCycle(p.id,other.id)).map(other=>`<option value="${esc(other.id)}" ${p.parentId===other.id?'selected':''}>${esc(productTitle(other))}</option>`).join('')}</select></div><div class="field full"><label>Schlagwörter / Tags</label><input name="tags" value="${esc((p.tags||[]).join(', '))}" placeholder="HomeOffice, Leihgabe …"></div><div class="field"><label>Kaufart (optional)</label><select name="purchaseKind"><option value="">Unbekannt</option>${[['new','Neukauf beim Händler'],['used','Gebraucht beim Händler'],['private','Privatkauf']].map(([v,t])=>`<option value="${v}" ${p.purchaseKind===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label>Originalkarton (optional)</label><select name="originalBox"><option value="">Unbekannt</option><option value="yes" ${p.originalBox==='yes'?'selected':''}>Vorhanden</option><option value="no" ${p.originalBox==='no'?'selected':''}>Nicht vorhanden</option></select></div><div class="field full"><label>Private Notiz</label><textarea name="notes">${esc(p.notes||'')}</textarea></div><div class="field full"><label>Öffentlicher Pass-Hinweis</label><textarea name="publicNote" maxlength="180" placeholder="z. B. Original-Ladegerät vorhanden">${esc(p.publicNote||'')}</textarea></div><div class="field full"><label>Im QR-Pass freigeben</label><label class="checkbox-row"><input type="checkbox" name="shareSerial" ${p.publicSettings?.serial===true?'checked':''}> Seriennummer / Rahmennummer</label><label class="checkbox-row"><input type="checkbox" name="sharePurchaseDate" ${p.publicSettings?.purchaseDate?'checked':''}> Kaufdatum</label></div></div><div class="form-actions"><button type="button" class="ghost-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn">${edit?'Speichern':'Produkt anlegen'}</button></div></form>`;
}

function historyForm(id,historyId='') { return PassPilotPlus.historyForm(id,historyId); }

function documentForm(id,category='Rechnung') {
  return `<div class="modal-head"><h2>Dokument lokal speichern</h2><button class="icon-btn" data-action="close-modal">✕</button></div><form id="documentForm" data-id="${esc(id)}"><div class="form-grid"><div class="field full"><label>Datei</label><input required type="file" name="file" accept="image/*,.pdf,.txt,.doc,.docx"></div><div class="field full"><label>Kategorie</label><select name="category">${['Rechnung','Garantie','Bedienungsanleitung','Servicebeleg','Foto','Sonstiges'].map(value=>`<option ${category===value?'selected':''}>${value}</option>`).join('')}</select></div><div class="field full"><label class="checkbox-row"><input type="checkbox" name="share"> Bei digitaler Übergabe mitgeben</label></div></div><div class="card flat-card" style="margin-top:12px"><small class="muted">Die Datei wird lokal gespeichert. Eine Übertragung erfolgt nur nach deiner Freigabe oder aktivierter verschlüsselter Synchronisation.</small></div><div class="form-actions"><button type="button" class="ghost-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn">Speichern</button></div></form>`;
}

function updateHistoryView() {
  return `<section class="card flat-card update-history" aria-labelledby="updateHistoryTitle"><h3 id="updateHistoryTitle">Was ist neu?</h3><p class="muted">Installierte Version: ${esc(APP_VERSION)}</p>${UPDATE_HISTORY.map((release, index) => `<details${index === 0 ? ' open' : ''}><summary>Version ${esc(release.version)} · ${esc(release.date)}</summary><ul>${release.changes.map(change => `<li>${esc(change)}</li>`).join('')}</ul></details>`).join('')}</section>`;
}

function settingsForm() {
 const install=deferredInstallPrompt?'<button type="button" class="soft-btn" data-action="install-app">App installieren</button>':'<span class="muted">Im Browser „App installieren“ wählen.</span>';
 return `<div class="modal-head"><h2>Einstellungen</h2><button class="icon-btn" data-action="close-modal">✕</button></div><form id="settingsForm"><section class="card flat-card settings-quick"><button type="button" class="settings-row" data-action="firebase-connect"><strong>Konto & Synchronisation</strong><span>→</span></button><button type="button" class="settings-row" data-action="updates-open"><strong>Updates & Download</strong><span>→</span></button><button type="button" class="settings-row" data-action="notification-settings"><strong>Benachrichtigungen</strong><span>→</span></button><button type="button" class="settings-row" data-action="upgrades-open"><strong>Abos & Freischaltcode</strong><span>→</span></button><button type="button" class="settings-row" data-nav="backup"><strong>Meine Daten sichern</strong><span>→</span></button></section><details class="simple-more settings-advanced"><summary>Weitere Einstellungen</summary>${PassPilotPlus.settingsSection()}<div class="form-grid"><div class="field full"><label>Name / Alias (optional)</label><input name="ownerAlias" value="${esc(state.settings.ownerAlias||'')}"></div><div class="field full"><label>Andere öffentliche Pass-Adresse (optional)</label><input name="publicBaseUrl" value="${esc(state.settings.publicBaseUrl||'')}" placeholder="${esc(PUBLIC_VIEWER_URL)}"></div></div><p>${install}</p><div class="detail-actions"><button type="button" class="ghost-btn" data-action="intro">Einführung</button>${state.settings.demoMode?'<button type="button" class="ghost-btn" data-action="exit-demo">Demo beenden</button>':'<button type="button" class="ghost-btn" data-action="load-demo">Demo ansehen</button>'}</div></details><details class="simple-more"><summary>Was ist neu?</summary>${updateHistoryView()}</details><details class="simple-more"><summary>Datenschutz & rechtliche Hinweise</summary><div class="detail-actions"><button type="button" class="ghost-btn" data-action="privacy">Datenschutz</button><button type="button" class="ghost-btn" data-action="imprint">Impressum</button><button type="button" class="ghost-btn" data-action="copyright">Copyright & Lizenzen</button></div></details><details class="simple-more"><summary>App zurücksetzen</summary><p>Löscht lokale Produkte und Dateien. Online-Daten bleiben bestehen.</p><button type="button" class="danger-btn" data-action="reset-app">Lokale App-Daten löschen</button></details><div class="form-actions"><button type="button" class="ghost-btn" data-action="close-modal">Schließen</button><button class="primary-btn">Speichern</button></div></form>`;
}

function normalizeSale(sale={}) {
  return {title:clean(sale.title,80),askingPrice:sale.askingPrice===''||sale.askingPrice==null?'':String(sale.askingPrice),currency:sale.currency==='USD'?'USD':'EUR',condition:['new','likeNew','good','used','repair'].includes(sale.condition)?sale.condition:'',description:clean(sale.description,360),includePhotos:sale.includePhotos===true,includeEvidence:sale.includeEvidence===true,includeSerial:sale.includeSerial===true,includePurchaseDate:sale.includePurchaseDate===true,includeWarranty:sale.includeWarranty===true,includeMaintenance:sale.includeMaintenance===true,historyIds:Array.isArray(sale.historyIds)?sale.historyIds.filter(id=>typeof id==='string'):[]};
}
function saleSnapshot(p,sale=p.sale||{}) {
  const selected=normalizeSale(sale);
  const price=Number(selected.askingPrice);
  return {assetStatusUrl:PassPilotIdentity.statusUrl(p),v:2,createdAt:p.qrCreatedAt||new Date().toISOString(),purpose:'sale',title:clean(selected.title||[p.brand,p.model].filter(Boolean).join(' ')||categoryLabel(p.category),80),category:clean(p.category,20),brand:clean(p.brand,50),model:clean(p.model,70),status:'sale',askingPrice:selected.askingPrice!==''&&Number.isFinite(price)&&price>=0?price:null,currency:selected.currency,condition:selected.condition,description:selected.description,serial:selected.includeSerial?clean(p.serial,70):'',purchaseDate:selected.includePurchaseDate?clean(p.purchaseDate,10):'',warrantyUntil:selected.includeWarranty?clean(p.warrantyUntil,10):'',nextMaintenance:selected.includeMaintenance?clean(p.nextMaintenance,10):'',evidence:selected.includeEvidence?{receipt:p.documents.some(d=>d.category==='Rechnung'),manual:p.documents.some(d=>d.category==='Bedienungsanleitung'),serialRecorded:!!p.serial,services:Math.min(9999,p.history.filter(h=>h.type==='service').length),repairs:Math.min(9999,p.history.filter(h=>h.type==='repair').length)}:null,history:(p.history||[]).filter(h=>h.public===true&&selected.historyIds.includes(h.id)).slice(0,5).map(h=>({date:clean(h.date,10),title:clean(h.title,60),details:clean(h.details,80)}))};
}
function saleFromForm(form) {
  const fd=new FormData(form);
  return normalizeSale({title:fd.get('saleTitle'),askingPrice:fd.get('askingPrice'),currency:fd.get('saleCurrency'),condition:fd.get('condition'),description:fd.get('saleDescription'),includeEvidence:fd.has('includeEvidence'),includeSerial:fd.has('includeSerial'),includePurchaseDate:fd.has('includePurchaseDate'),includeWarranty:fd.has('includeWarranty'),includeMaintenance:fd.has('includeMaintenance'),historyIds:fd.getAll('saleHistory')});
}
function updateSalePreview() {
  const form=document.getElementById('saleForm');if(!form)return;
  const p=getProduct(form.dataset.id);if(!p)return;
  document.getElementById('salePreview').innerHTML=PassPilotPublic.render(saleSnapshot(p,saleFromForm(form)));
}
function openSaleModal(id) {
  const p=getProduct(id);if(!p)return;
  const sale=normalizeSale(p.sale||{title:[p.brand,p.model].filter(Boolean).join(' ')||categoryLabel(p.category),description:[`Verkaufe ${[p.brand,p.model].filter(Boolean).join(' ')||categoryLabel(p.category)}.`,p.originalBox==='yes'?'Originalkarton vorhanden.':'',p.documents.some(d=>d.category==='Bedienungsanleitung')?'Bedienungsanleitung vorhanden.':'','Zustand und Lieferumfang bitte ergänzen.'].filter(Boolean).join('\n')});
  const options=[['includeSerial','Seriennummer / Rahmennummer',p.serial],['includePurchaseDate','Kaufdatum',p.purchaseDate],['includeWarranty','Garantie / Zusage bis',p.warrantyUntil],['includeMaintenance','Nächste Wartung',p.nextMaintenance]];
  const history=(p.history||[]).filter(h=>h.public===true);
  modal(`<div class="modal-head"><h2>Produkt verkaufen</h2><button type="button" class="icon-btn" data-action="close-modal">✕</button></div><form id="saleForm" data-id="${esc(id)}"><p>Prüfe die öffentliche Vorschau und erstelle dann deinen Verkaufs-QR.</p>${p.obligations.some(o=>o.active&&o.kind==="lease")?'<p class="badge warn">Aktiver Leasingvertrag: Verkaufsberechtigung und Rückgabe zuerst prüfen.</p>':''}<div class="form-grid"><div class="field full"><label for="saleTitle">Öffentlicher Produkttitel</label><input id="saleTitle" name="saleTitle" required maxlength="80" value="${esc(sale.title)}"><small class="muted">Dein privater Produktname wird nicht automatisch übernommen.</small></div><div class="field"><label for="askingPrice">Verkaufspreis (optional)</label><input id="askingPrice" name="askingPrice" type="number" min="0" step="0.01" value="${esc(sale.askingPrice)}"><small class="muted">Unabhängig vom privaten Kaufpreis.</small></div><div class="field"><label for="saleCurrency">Währung</label><select id="saleCurrency" name="saleCurrency"><option ${sale.currency==='EUR'?'selected':''}>EUR</option><option ${sale.currency==='USD'?'selected':''}>USD</option></select></div><div class="field full"><label for="saleCondition">Zustand (optional)</label><select id="saleCondition" name="condition">${[['','Bitte auswählen'],['new','Neu'],['likeNew','Wie neu'],['good','Gut'],['used','Gebraucht'],['repair','Reparaturbedürftig']].map(([value,label])=>`<option value="${value}" ${sale.condition===value?'selected':''}>${label}</option>`).join('')}</select></div><div class="field full"><label for="saleDescription">Öffentliche Beschreibung (optional)</label><textarea id="saleDescription" name="saleDescription" maxlength="360" placeholder="Ausstattung, Zubehör und bekannte Mängel">${esc(sale.description)}</textarea><small class="muted">Keine Namen, Adresse, Telefonnummer oder andere persönliche Angaben eintragen.</small></div></div><div class="sale-privacy"><strong>Bleibt immer privat</strong><p>Dein Name / Alias, privater Produktname, Standort, private Notizen, Händler, ursprünglicher Kaufpreis, sämtliche privaten Dokumente werden nicht in den Verkaufs-QR übernommen.</p></div>${PassPilotSharing.hasPhotos(p)?`<label class="checkbox-row"><input type="checkbox" name="includePhotos" ${(p.sale?p.sale.includePhotos!==false:true)?'checked':''}>Produktfotos im öffentlichen Verkaufslink zeigen</label><div id="salePhotoPreview">${PassPilotSharing.photoHtml(p.coverImage?[p.coverImage]:[])}</div><p class="muted">Nur Produktfotos. Rechnungen bleiben privat. Fotos benötigen einen Online-Link.</p>`:''}<h3>Zusätzlich freigeben</h3><label class="checkbox-row"><input type="checkbox" name="includeEvidence" ${sale.includeEvidence?'checked':''}>Nachweisübersicht: Rechnung / Anleitung vorhanden, Seriennummer erfasst, Anzahl Wartungen und Reparaturen. Keine Dateien, Kosten oder privaten Texte.</label><p class="muted">Titel, Kategorie, Marke und Modell werden angezeigt. Weitere Angaben nur nach deiner Auswahl.</p>${options.filter(([, ,value])=>value).map(([name,label,value])=>`<label class="checkbox-row"><input type="checkbox" name="${name}" ${sale[name]?'checked':''}> ${label}: ${esc(value)}</label>`).join('')}${history.length?`<h3>Öffentliche Historie auswählen</h3><p class="muted">Bis zu fünf Einträge. Prüfe auch deren Texte auf persönliche Angaben.</p>${history.map(h=>`<label class="sale-history-choice"><span class="checkbox-row"><input type="checkbox" name="saleHistory" value="${esc(h.id)}" ${sale.historyIds.includes(h.id)?'checked':''}> ${esc(h.title)} · ${formatDate(h.date)}</span><small class="muted">${esc(h.details||'')}</small></label>`).join('')}`:''}<button type="button" class="soft-btn" data-action="market-export" data-id="${esc(id)}">Für Kleinanzeigen / eBay vorbereiten</button><h3>Das sehen Interessenten</h3><div id="salePreview" class="sale-preview">${PassPilotPublic.render(saleSnapshot(p,sale))}</div><div class="form-actions"><button type="button" class="ghost-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn">Verkaufs-QR erstellen</button></div></form>`);
}

function clean(v,max){return String(v||'').slice(0,max)}
function publicSnapshot(p) {
  return {assetStatusUrl:PassPilotIdentity.statusUrl(p),v:1,createdAt:p.qrCreatedAt||new Date().toISOString(),id:clean(p.id,70),title:clean([p.brand,p.model].filter(Boolean).join(' ')||categoryLabel(p.category),80),category:clean(p.category,20),brand:clean(p.brand,50),model:clean(p.model,70),serial:p.publicSettings?.serial===true?clean(p.serial,70):'',purchaseDate:p.publicSettings?.purchaseDate?clean(p.purchaseDate,10):'',status:clean(p.status||'active',12),publicNote:clean(p.publicNote,120),history:(p.history||[]).filter(h=>h.public).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5).map(h=>({date:clean(h.date,10),type:clean(h.type,14),title:clean(h.title,60),details:clean(h.details,80)}))};
}

function encodeSnapshot(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function decodeSnapshot(encoded){try{let n=encoded.replaceAll('-','+').replaceAll('_','/');while(n.length%4)n+='=';const bin=atob(n);return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));}catch{return null}}
function getBaseUrl(){
  const configured=(state.settings.publicBaseUrl||'').trim();
  if(configured){try{const url=new URL(configured);if(url.protocol!=='https:'||url.username||url.password)return '';url.hash='';url.search='';return url.href}catch{return ''}}
  return PUBLIC_VIEWER_URL;
}
function publicUrlForProduct(p){if(p.onlinePassActive&&Date.parse(p.onlinePassExpires)>Date.now()&&/^[a-f0-9]{40}$/.test(p.onlinePassId||'')){try{const url=new URL(p.onlinePassUrl),hash=new URLSearchParams(url.hash.slice(1)),base=new URL(getBaseUrl());if(url.protocol==='https:'&&url.origin===base.origin&&hash.get('online')===p.onlinePassId)return url.href;}catch{}}const base=getBaseUrl();return base?`${base}#pass=${encodeSnapshot(p.status==='sale'?saleSnapshot(p):publicSnapshot(p))}`:''}

function showPassModal(id,offline=false) {
  const dated=getProduct(id);if(dated&&!dated.qrCreatedAt){dated.qrCreatedAt=new Date().toISOString();saveState();}
  const p=getProduct(id); if(!p)return; if(p.status==='sale'&&!p.sale)return openSaleModal(id);if(!offline&&PassPilotFirebase.user()&&PassPilotSharing.hasPhotos(p)&&(p.status!=='sale'||p.sale?.includePhotos))return PassPilotFirebase.passModal(id); const snapshot=p.status==='sale'?saleSnapshot(p):publicSnapshot(p); const encoded=encodeSnapshot(snapshot); const url=publicUrlForProduct(p);
  modal(`<div class="modal-head"><h2>${snapshot.purpose==='sale'?'QR-Code zum Verkaufen':'QR-Produktpass'}</h2><button class="icon-btn" data-action="close-modal">✕</button></div><div class="qr-box"><div id="qrcode"></div><strong>${esc(snapshot.title)}</strong><span class="muted">Ohne Anmeldung teilbar · fester Datenstand.</span></div>${PassPilotSharing.hasPhotos(p)?`<p class="muted">Fotos lassen sich im optionalen Online-Pass freigeben. Dieser kontofreie QR enthält Produktdaten ohne Fotos.</p><button type="button" class="soft-btn" data-action="online-pass" data-id="${esc(id)}">Optionaler Link mit Fotos</button>`:''}${snapshot.purpose==='sale'?`<div class="sale-privacy"><strong>Private Daten bleiben aus diesem öffentlichen Pass ausgeschlossen.</strong><p>Keine privaten Notizen, kein Standort, kein Händler, kein ursprünglicher Kaufpreis und keine Dokumente.</p></div><details class="sale-preview"><summary>So sehen Interessenten den Pass</summary>${PassPilotPublic.render(snapshot)}</details><p class="muted">Bereits geteilte QR-Codes behalten ihren Inhalt. Änderungen benötigen einen neuen Code.</p><button class="ghost-btn" data-action="sale-product" data-id="${esc(id)}">Verkaufsangaben bearbeiten</button>`:''}${url?`<div class="field" style="margin-top:12px"><label>Öffentlicher Link</label><div class="code">${esc(url)}</div></div>`:'<div class="pass-banner sale" style="margin-top:12px"><strong>Noch nicht öffentlich scanbar.</strong><br>Hoste die App einmal über HTTPS und trage die Adresse in den Einstellungen ein.</div>'}<div class="form-actions"><button class="ghost-btn" data-action="preview-pass" data-payload="${esc(encoded)}">Vorschau</button>${url?`${snapshot.purpose==='sale'?`<button class="primary-btn" data-action="sale-sheet" data-id="${esc(id)}">Verkaufszettel drucken</button>`:`<button class="ghost-btn" data-action="print-label" data-id="${esc(id)}">QR-Etikett drucken</button>`}<button class="ghost-btn" data-action="share-pass" data-id="${esc(id)}">Teilen</button><button class="primary-btn" data-action="copy-pass-url" data-url="${esc(url)}">Link kopieren</button>`:''}</div>`);
  setTimeout(()=>{const el=document.getElementById('qrcode');if(!el)return;if(url&&window.PassPilotQR){try{window.PassPilotQR.renderToCanvas(url,el,520)}catch(err){console.error(err);el.innerHTML='<div class="muted">QR-Daten sind zu groß. Kürze freigegebene Historie oder Hinweise.</div>'}}else el.innerHTML='<div class="muted" style="padding:36px 10px;text-align:center">QR erscheint nach Angabe einer öffentlichen HTTPS-Adresse.</div>';},0);
}

function renderPublicPass(encoded) {
  const data=PassPilotPublic.decode(encoded);setNav('');
  document.getElementById('app').innerHTML=`<div class="pass-view">${PassPilotPublic.render(data)}<button class="ghost-btn" data-action="exit-pass">PassPilot öffnen</button></div>`;
}

function assistantModal(id) {
  const p=getProduct(id);if(!p)return;
  modal(`<div class="modal-head"><h2>Was möchtest du tun?</h2><button class="icon-btn" data-action="close-modal">✕</button></div><p class="muted">${esc(productTitle(p))}</p><div class="assistant-grid"><button class="assistant-card" data-action="claim-product" data-id="${esc(id)}"><span>⚠️</span><strong>Problem / Reklamation</strong><small>Fehler erfassen und Vorgang vorbereiten</small></button><button class="assistant-card" data-action="add-history" data-id="${esc(id)}"><span>🔧</span><strong>Service eintragen</strong><small>Wartung oder Reparatur dokumentieren</small></button><button class="assistant-card" data-action="sale-product" data-id="${esc(id)}"><span>🏷</span><strong>${p.status==='sale'?'Verkaufs-QR öffnen':'Verkaufen'}</strong><small>Öffentliche Angaben prüfen und QR erstellen</small></button><button class="assistant-card" data-action="transfer-product" data-id="${esc(id)}"><span>⇄</span><strong>Übergeben</strong><small>Freigegebene Akte exportieren</small></button><button class="assistant-card" data-action="gift-product" data-id="${esc(id)}"><span>🎁</span><strong>Verschenken</strong><small>Produkt mit freigegebenen Angaben übergeben</small></button><button class="assistant-card" data-action="identity-loan" data-id="${esc(id)}"><span>🤝</span><strong>Verleihen</strong><small>Person und Rückgabe festhalten</small></button><button class="assistant-card" data-action="show-pass" data-id="${esc(id)}"><span>▦</span><strong>QR-Pass</strong><small>Zeigen, teilen oder Etikett drucken</small></button><button class="assistant-card danger-assistant" data-action="toggle-lost" data-id="${esc(id)}"><span>🚨</span><strong>${p.status==='lost'?'Als gefunden markieren':'Verloren melden'}</strong><small>Status im QR-Pass ändern</small></button>${PassPilotIdentity.theftEligible(p)?`<button class="assistant-card danger-assistant" data-action="loss-confirm" data-kind="stolen" data-id="${esc(id)}"><span>🚨</span><strong>Gestohlen</strong><small>Diebstahl im Lebenslauf festhalten</small></button>`:`<button class="assistant-card" disabled><span>🔒</span><strong>Gestohlen</strong><small>Nur mit bestätigter individueller Seriennummer</small></button>`}</div>`);
}

function claimModal(id) {
  const p=getProduct(id);if(!p)return;
  modal(`<div class="modal-head"><h2>Problem / Reklamation</h2><button class="icon-btn" data-action="close-modal">✕</button></div><form id="claimForm" data-id="${esc(id)}"><div class="form-grid"><div class="field full"><label>Was ist passiert?</label><textarea required name="issue" placeholder="z. B. Gerät lädt seit heute nicht mehr."></textarea></div><div class="field"><label>Problem seit</label><input type="date" name="since" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Gewünschte Lösung</label><select name="wish"><option>Reklamation / Prüfung</option><option>Reparatur</option><option>Ersatzlieferung</option><option>Rückgabe / Erstattung prüfen</option><option>Preisnachlass anfragen</option><option>Garantieanfrage</option><option>Kontaktaufnahme</option></select></div></div><div class="card flat-card" style="margin-top:12px"><small class="muted">Die App entscheidet nicht, ob ein rechtlicher Anspruch besteht. Sie stellt nur deine vorhandenen Daten zusammen.</small></div><div class="form-actions"><button type="button" class="ghost-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn">Vorgang vorbereiten</button></div></form>`);
}

function claimResultModal(p,issue,since,wish) {
  const text=`Betreff: Problem mit ${productTitle(p)}\n\nProdukt: ${productTitle(p)}\nMarke/Modell: ${[p.brand,p.model].filter(Boolean).join(' / ')||'—'}\nSeriennummer: ${p.serial||'—'}\nKaufdatum: ${p.purchaseDate||'—'}\nHändler: ${p.retailer||'—'}\nProblem seit: ${since||'—'}\n\nFehlerbeschreibung:\n${issue}\n\nGewünschte Lösung: ${wish}\n\nKaufbeleg und weitere Unterlagen können bei Bedarf beigefügt werden.`;
  modal(`<div class="modal-head"><h2>Vorgang vorbereitet</h2><button class="icon-btn" data-action="close-modal">✕</button></div><p class="muted">Diesen Text kannst du an Händler, Hersteller oder Werkstatt weitergeben.</p><textarea id="claimText" class="claim-text" readonly>${esc(text)}</textarea><div class="form-actions"><button class="ghost-btn" data-action="save-claim-history" data-id="${esc(p.id)}" data-issue="${esc(issue)}">In Historie speichern</button><button class="ghost-btn" data-action="email-claim">Per E-Mail vorbereiten</button><button class="ghost-btn" data-action="print-claim">PDF / Drucken</button><button class="primary-btn" data-action="copy-claim">Text kopieren</button></div>`);
}

function openTransferModal(id) { return PassPilotPlus.transferModal(id); }

async function compressImage(file,maxSide=900,quality=.82) {
  if(!(file instanceof Blob)||!file.type.startsWith('image/'))return''; const data=await blobToDataUrl(file); const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=data}); const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',quality);
}

async function copyText(value){try{await navigator.clipboard.writeText(value)}catch{const t=document.createElement('textarea');t.value=value;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}

function sharedProductTitle(p){return p.status==='sale'&&p.sale?saleSnapshot(p).title:publicSnapshot(p).title}

function showSaleSheet(id){
  const p=getProduct(id);if(!p)return;
  if(p.status!=='sale'||!p.sale)return openSaleModal(id);
  const snapshot=saleSnapshot(p);const url=publicUrlForProduct(p);
  if(!url)return toast('Bitte eine gültige öffentliche HTTPS-Adresse in den Einstellungen eintragen.');
  try{activeSaleSheet=PassPilotSaleSheet.build(snapshot,url,PassPilotQR.toDataUrl(url,1200))}catch(err){console.error(err);return toast('Verkaufszettel konnte nicht erstellt werden. Bitte Verkaufsangaben prüfen oder kürzen.');}
  modal(`<div class="modal-head"><h2>Verkaufszettel</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">✕</button></div><p class="muted">Nur deine freigegebenen Verkaufsangaben stehen auf dem Zettel und im QR-Code.</p><div class="form-actions print-sheet-actions"><button type="button" class="ghost-btn" data-action="close-modal">Schließen</button><button type="button" class="primary-btn" data-action="print-sale-sheet">Drucken / als PDF speichern</button></div><iframe id="saleSheetPreview" title="Druckvorschau des Verkaufszettels" sandbox="allow-same-origin allow-modals"></iframe>`);
  document.getElementById('saleSheetPreview').srcdoc=activeSaleSheet.html;
}
function printSaleSheet(){
  if(!activeSaleSheet)return;
  if(window.PassPilotAndroid&&typeof window.PassPilotAndroid.printHtml==='function'){
    window.PassPilotAndroid.printHtml(activeSaleSheet.html,activeSaleSheet.title);return;
  }
  const preview=document.getElementById('saleSheetPreview');
  if(!preview?.contentWindow||!preview.contentDocument?.getElementById('saleSheetQr')?.complete)return toast('Druckvorschau wird noch geladen. Bitte kurz warten.');
  preview.contentWindow.focus();preview.contentWindow.print();
}

function printLabel(id) {
  const p=getProduct(id);if(!p)return;const url=publicUrlForProduct(p);if(!url)return toast('Öffentliche Basis-URL fehlt');let data='';
  try{data=window.PassPilotQR?.toDataUrl(url,520)||''}catch(err){console.error(err)} if(!data)return toast('QR-Code konnte nicht erstellt werden');
  const w=window.open('','_blank','width=620,height=760');if(!w)return toast('Pop-up wurde blockiert');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>PassPilot Etikett</title><style>body{font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh}.label{width:320px;text-align:center;border:1px solid #777;border-radius:16px;padding:22px}.label img{width:240px}.brand{font-weight:850}.title{font-size:18px;font-weight:750;margin-top:8px}.small{font-size:11px;color:#555;margin-top:8px}</style></head><body><div class="label"><div class="brand">PassPilot</div><img src="${data}"><div class="title">${esc(sharedProductTitle(p))}</div><div class="small">Scannen für den digitalen Produktpass</div></div><script>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();
}

async function sharePass(id) {
  const p=getProduct(id);if(!p)return;const url=publicUrlForProduct(p);if(!url)return toast('Öffentliche Basis-URL fehlt');
  if(navigator.share){try{await navigator.share({title:`Produktpass – ${sharedProductTitle(p)}`,text:'Digitaler Produktpass',url});return}catch(err){if(err?.name==='AbortError')return}}
  await copyText(url);toast('Pass-Link kopiert');
}

async function exportTransfer(id,options={}) { return PassPilotPlus.exportTransfer(id,options); }

async function exportBackup() { return PassPilotPlus.exportBackup(); }

function downloadJson(data,filename){return PassPilotPlus.download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),filename);}
function safeFilename(name){return String(name||'Produkt').replace(/[^a-z0-9äöüß_-]+/gi,'_').slice(0,60)}

async function importPayload(payload) { return PassPilotPlus.importPayload(payload); }

async function clearIndexedDb(){
  return new Promise((resolve)=>{
    const req=indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess=()=>resolve(true); req.onerror=()=>resolve(false); req.onblocked=()=>resolve(false);
  });
}

function PassPilotAndroidReset(){window.PassPilotAndroid?.resetLocalData?.();}
async function resetApp(){
  if(!confirm('Wirklich alle lokalen PassPilot-Daten auf diesem Gerät löschen?')) return;
  PassPilotFirebase.reset();PassPilotAndroidReset();
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem('passpilot-catalog-v1');
  await clearIndexedDb();
  toast('App wird zurückgesetzt');
  setTimeout(()=>location.reload(), 350);
}

function exitDemo(){
  const hadDemo = state.products.some(p=>p.isDemo);
  state.products = state.products.filter(p=>!p.isDemo);
  state.settings.demoMode = false;
  saveState();
  closeModal();
  currentView='dashboard';
  render();
  toast(hadDemo ? 'Demo beendet' : 'Keine Demo-Daten vorhanden');
}

function loadDemo() {
  state.products = state.products.filter(p=>!p.isDemo);
  const now=new Date();const iso=d=>d.toISOString().slice(0,10);const add=n=>{const d=new Date(now);d.setDate(d.getDate()+n);return iso(d)};
  state.settings.demoMode = true;
  state.products.push(normalizeProduct({id:uid('prod'),createdAt:new Date().toISOString(),category:'ebike',name:'Mein E-Bike',brand:'Cube',model:'Kathmandu Hybrid',serial:'DEMO-RN-2026-4815',location:'Garage',purchaseDate:add(-120),retailer:'Demo Fahrradhaus',price:3999,currency:'EUR',warrantyUntil:add(50),nextMaintenance:add(18),publicNote:'Original-Ladegerät vorhanden. Servicehistorie dokumentiert.',status:'active',publicSettings:{serial:true,purchaseDate:false},history:[{id:uid('hist'),date:add(-120),type:'purchase',title:'Kauf',details:'Neu gekauft.',public:false},{id:uid('hist'),date:add(-70),type:'service',title:'Erstinspektion',details:'Bremsen, Antrieb und Software geprüft.',public:true}],documents:[],isDemo:true}));
  state.products.push(normalizeProduct({id:uid('prod'),createdAt:new Date(Date.now()-1000).toISOString(),category:'electronics',name:'Noise-Cancelling Kopfhörer',brand:'Sony',model:'WH-Serie',purchaseDate:add(-10),retailer:'Demo Shop',price:299,currency:'EUR',returnUntil:add(4),warrantyUntil:add(720),publicSettings:{serial:false,purchaseDate:false},isDemo:true}));
  saveState();closeModal();currentView='dashboard';render();toast('Demo geladen');
}

async function installApp(){if(!deferredInstallPrompt)return toast('Nutze im Browser „Zum Home-Bildschirm“ / „App installieren“');deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;closeModal()}

async function handleClick(e) {
  const el=e.target.closest('[data-action],[data-nav]');if(!el)return;
  if(el.dataset.nav){closeModal();currentView=el.dataset.nav;location.hash='';render();window.scrollTo(0,0);return}
  const action=el.dataset.action;const id=el.dataset.id;if(state.settings.accountLoginRequired&&(!PassPilotFirebase.user()||(state.settings.localAccountUid&&state.settings.localAccountUid!==PassPilotFirebase.user()))&&!['account-open','firebase-connect','firebase-google','firebase-auth-tab','firebase-check-verified','export-backup','close-modal','firebase-reset','firebase-verify','privacy','imprint','feedback-open'].includes(action)&&!el.closest('#firebaseAuth')){PassPilotAccounts.open();return;}if(action==='inventory'&&!await PassPilotUpgrades.requireFeature('inventoryPdf'))return;if(['service-plan','complete-service'].includes(action)&&!await PassPilotUpgrades.requireFeature('maintenanceAssistant'))return;if(action==='model-facts'){PassPilotFacts.open(id);return;}if(action==='model-review'){PassPilotFacts.review(id);return;}if(window.PassPilotAccounts?.click(action,el))return;if(action==='upgrades-open'){PassPilotUpgrades.open();return;}
  if(PassPilotOrganizer.click(action,el)||PassPilotFeedback.click(action,el)||PassPilotNotifications.click(action,el)||PassPilotDeviceAccess.click(action,el)||PassPilotObligations.click(action,el)||PassPilotMarketExport.click(action,el)||PassPilotIdentity.click(action,el)||PassPilotLifecycle.click(action,el)||PassPilotSharing.click(action,el)||PassPilotAssistant.click(action,el)||PassPilotExperience.click(action,el)||PassPilotSync.click(action,el)||PassPilotCapture.click(action,el)||PassPilotFirebase.click(action,el)||PassPilotPlus.click(action,el))return;
  if(action==='home'){closeModal();currentView='dashboard';location.hash='';render();window.scrollTo(0,0)}
  else if(action==='calendar-prev')shiftCalendarMonth(-1);
  else if(action==='calendar-next')shiftCalendarMonth(1);
  else if(action==='calendar-today'){calendarSelectedDate=localDate();calendarMonth=calendarSelectedDate.slice(0,7);render();}
  else if(action==='calendar-day'){if(!calendarDate(el.dataset.date))return;calendarSelectedDate=el.dataset.date;calendarMonth=calendarSelectedDate.slice(0,7);render();openCalendarDay();}
  else if(action==='new-calendar-event')openCalendarEvent();
  else if(action==='edit-calendar-event')openCalendarEvent(id);
  else if(action==='delete-calendar-event'){const event=state.calendarEvents.find(event=>event.id===id);if(event&&confirm(`Termin „${event.title}“ löschen?`)){state.calendarEvents=state.calendarEvents.filter(event=>event.id!==id);saveState();closeModal();render();toast('Termin gelöscht');}}
  else if(action==='open-calendar-product'){closeModal();openProduct(id);window.scrollTo(0,0);if(el.dataset.source==='history')document.getElementById('productHistory')?.scrollIntoView({block:'start'});}
  else if(action==='scan-product')PassPilotScan.start();
  else if(action==='scan-label')PassPilotScan.startLabel();
  else if(action==='scan-photo')PassPilotScan.startPhoto();
  else if(action==='scan-stop')PassPilotScan.cancelLive();
  else if(action==='scan-websearch')PassPilotScan.searchWeb();
  else if(action==='scan-lookup')PassPilotScan.lookup(document.getElementById('productForm')?.elements.barcode.value,undefined,true);
  else if(action==='scan-manual')PassPilotScan.manual();
  else if(action==='scan-select-code')PassPilotScan.chooseCode(el.dataset.code);
  else if(action==='new-product')modal(productForm());
  else if(action==='edit-product')modal(productForm(getProduct(id)));
  else if(action==='open-product')openProduct(id);
  else if(action==='add-history')modal(historyForm(id));
  else if(action==='search-manual'){const p=getProduct(id);if(p)PassPilotManuals.search(p,el.dataset.kind);}
  else if(action==='add-manual-link'){const p=getProduct(id);if(p)modal(PassPilotManuals.form(p));}
  else if(action==='edit-manual-link'){const p=getProduct(el.dataset.productId);const doc=p?.documents.find(doc=>doc.id===el.dataset.docId&&doc.kind==='link');if(doc)modal(PassPilotManuals.form(p,doc));}
  else if(action==='preview-manual-link'){if(!PassPilotManuals.open(document.getElementById('manualUrl')?.value))toast('Bitte einen gültigen https://-Link einfügen.');}
  else if(action==='add-manual-file')modal(documentForm(id,'Bedienungsanleitung'));
  else if(action==='add-document')modal(documentForm(id));
  else if(action==='close-modal')closeModal();
  else if(action==='settings')modal(settingsForm());
  else if(action==='intro')modal(introModal());
  else if(action==='start-guided'){closeModal();modal(productForm());}
  else if(action==='exit-demo')exitDemo();
  else if(action==='reset-app')await resetApp();
  else if(action==='assistant')assistantModal(id);
  else if(action==='claim-product')claimModal(id);
  else if(action==='show-pass')showPassModal(id);
  else if(action==='preview-pass'){closeModal();location.hash=`pass=${el.dataset.payload}`}
  else if(action==='exit-pass'){location.hash='';currentView='dashboard';render()}
  else if(action==='copy-pass-url'){await copyText(el.dataset.url);toast('Link kopiert')}
  else if(action==='sale-sheet')showSaleSheet(id);
  else if(action==='print-sale-sheet')printSaleSheet();
  else if(action==='print-label')printLabel(id);
  else if(action==='share-pass')await sharePass(id);
  else if(action==='transfer-product')openTransferModal(id);
  else if(action==='export-transfer')await exportTransfer(id);
  else if(action==='export-backup')await exportBackup();
  else if(action==='load-demo')loadDemo();
  else if(action==='install-app')await installApp();
  else if(action==='copy-claim'){await copyText(document.getElementById('claimText')?.value||'');toast('Text kopiert')}
  else if(action==='save-claim-history'){const p=getProduct(id);if(p){p.history.push({id:uid('hist'),date:new Date().toISOString().slice(0,10),type:'note',title:'Problem / Reklamation vorbereitet',details:el.dataset.issue||'',public:false});saveState();closeModal();openProduct(id);toast('In Historie gespeichert')}}
  else if(action==='legacy-toggle-lost'){const p=getProduct(id);if(!p)return;p.qrCreatedAt=new Date().toISOString();p.status=p.status==='lost'?'active':'lost';saveState();closeModal();openProduct(id);toast(p.status==='lost'?'Als verloren markiert':'Status zurückgesetzt')}
  else if(action==='sale-product')openSaleModal(id);
  else if(action==='end-sale'){const p=getProduct(id);if(!p)return;p.status='active';saveState();closeModal();openProduct(id);toast('Verkauf beendet. Bereits geteilte QR-Codes bleiben lesbar.')}
  else if(action==='sale-preview')updateSalePreview();
  else if(action==='open-document'){const p=getProduct(el.dataset.productId);const doc=p?.documents.find(doc=>doc.id===el.dataset.docId);if(doc?.kind==='link'){if(!PassPilotManuals.open(doc.url))toast('Dieser Link ist ungültig.');return;}await PassPilotPlus.openFile(el.dataset.productId,el.dataset.docId)}
  else if(action==='delete-document'){const p=getProduct(el.dataset.productId);if(!p)return;const doc=p.documents.find(d=>d.id===el.dataset.docId);if(!doc)return;if(confirm(`„${doc.name}“ wirklich löschen?`)){p.documents=p.documents.filter(d=>d.id!==doc.id);saveState();if(doc.kind!=='link')await deleteFile(p.id,doc.id);openProduct(p.id);toast('Dokument gelöscht')}}
  else if(action==='delete-product'){const p=getProduct(id);if(p&&confirm(`„${productTitle(p)}“ samt lokalen Dokumenten wirklich löschen?`)){for(const d of p.documents)if(d.kind!=='link')await deleteFile(p.id,d.id);state.products=state.products.filter(x=>x.id!==id);saveState();currentView='products';render();toast('Produkt gelöscht')}}
  else if(action)toast('Diese Aktion ist hier noch nicht verfügbar. Bitte die App aktualisieren.');
}

async function handleSubmit(e) {
  const form=e.target;if(!(form instanceof HTMLFormElement))return;e.preventDefault();if(form.id==='productForm'&&PassPilotCapture.guard(form))return;const fd=new FormData(form);
  if(await PassPilotOrganizer.submit(form,fd)||await PassPilotFeedback.submit(form,fd)||await PassPilotNotifications.submit(form,fd)||await PassPilotDeviceAccess.submit(form,fd)||await PassPilotObligations.submit(form,fd)||await (window.PassPilotAccounts?.submit(form,fd)||false)||await PassPilotFacts.submit(form,fd)||await PassPilotUpgrades.submit(form,fd)||await PassPilotIdentity.submit(form,fd)||await PassPilotAssistant.submit(form,fd)||await PassPilotSync.submit(form,fd)||await PassPilotFirebase.submit(form,fd)||await PassPilotPlus.submit(form,fd))return;
  if(form.id==='productForm'){
    const existing=form.dataset.id?getProduct(form.dataset.id):null;const p=existing||normalizeProduct({id:uid('prod'),createdAt:new Date().toISOString()});const previousPurchaseDate=p.purchaseDate;const candidate={...p,brand:fd.get('brand'),model:fd.get('model'),serial:fd.get('serial')};const duplicate=PassPilotIdentity.duplicate(candidate);if(duplicate){form._capture&&(form._capture.saving=false);toast('Dieses Exemplar ist bereits im Bestand. Bestehendes Produkt öffnen oder Seriennummer korrigieren.');return;}
    Object.assign(p,{purchaseKind:String(fd.get('purchaseKind')||''),originalBox:String(fd.get('originalBox')||''),parentId:fd.get('parentId')||'',tags:PassPilotPlus.tags(fd.get('tags')),category:fd.get('category')||'other',name:fd.get('name').trim(),brand:fd.get('brand').trim(),model:fd.get('model').trim(),partNumber:fd.get('partNumber').trim(),serial:fd.get('serial').trim(),barcode:fd.get('barcode').trim(),location:fd.get('location').trim(),purchaseDate:fd.get('purchaseDate'),retailer:fd.get('retailer').trim(),price:fd.get('price'),currency:fd.get('currency')||'EUR',returnUntil:fd.get('returnUntil'),warrantyUntil:fd.get('warrantyUntil'),nextMaintenance:fd.get('nextMaintenance'),notes:fd.get('notes').trim(),publicNote:fd.get('publicNote').trim(),publicSettings:{serial:fd.get('shareSerial')==='on',purchaseDate:fd.get('sharePurchaseDate')==='on'}});
    p.identity.individualSerial=fd.has('individualSerial')&&!!p.serial&&p.serial!==p.barcode&&p.serial!==p.partNumber;p.identity.serialConfirmed=p.identity.individualSerial?p.serial:'';
    const cover=form._capture?.photoFile||form._editPhoto||fd.get('coverPhoto');if(cover instanceof File&&cover.size){try{p.coverImage=await compressImage(cover)}catch(err){console.warn(err);toast('Foto konnte nicht verarbeitet werden')}}
    if(existing&&previousPurchaseDate!==p.purchaseDate)for(const h of p.history)if(h.type==='purchase'&&(h.autoPurchase===true||h.title==='Produkt angelegt')&&(h.autoPurchase===true||h.date===previousPurchaseDate||!previousPurchaseDate))h.date=p.purchaseDate||p.createdAt.slice(0,10);
    if(existing)PassPilotLifecycle.syncPurchase(p,p.price==='');await PassPilotCapture.attachments(p,form);
    if(!existing){PassPilotIdentity.record(p,'Lokal registriert');p.history.push({autoPurchase:true,cost:p.price,currency:p.currency,id:uid('hist'),date:p.purchaseDate||new Date().toISOString().slice(0,10),type:'purchase',title:'Produkt angelegt',details:p.purchaseDate?'Kaufdatum hinterlegt.':'',public:false});state.products.push(p)}
    p.qrCreatedAt=new Date().toISOString();saveState();closeModal();currentView='products';render();openProduct(p.id);if(form.dataset.return==='lifecycle')PassPilotLifecycle.open(p.id);toast(existing?'Gespeichert':'Produkt angelegt');if(!existing&&fd.has('findManualAfterSave')&&p.brand&&p.model)PassPilotPlus.findManual(p.id).catch(error=>toast(error.message));
  } else if(form.id==='calendarEventForm'){
    const existing=state.calendarEvents.find(event=>event.id===form.dataset.id);
    const event=normalizeCalendarEvent({id:existing?.id||uid('event'),title:fd.get('title').trim(),date:fd.get('date'),time:fd.get('time'),notes:fd.get('notes').trim(),productId:fd.get('productId')});
    if(!event||!event.title)return toast('Bitte einen Titel und ein gültiges Datum eingeben.');
    if(event.productId&&!getProduct(event.productId))event.productId='';
    if(existing)Object.assign(existing,event);else state.calendarEvents.push(event);
    calendarSelectedDate=event.date;calendarMonth=event.date.slice(0,7);saveState();closeModal();currentView='calendar';render();toast('Termin gespeichert');
  } else if(form.id==='historyForm'){
    const p=getProduct(form.dataset.id);if(!p)return;p.history.push({id:uid('hist'),type:fd.get('type'),date:fd.get('date'),title:fd.get('title').trim(),details:fd.get('details').trim(),public:fd.get('public')==='on'});saveState();closeModal();openProduct(p.id);toast('Historie gespeichert');
  } else if(form.id==='manualLinkForm'){
    const p=getProduct(form.dataset.id);if(!p)return;
    const existing=p.documents.find(doc=>doc.id===form.dataset.docId&&doc.kind==='link');
    const doc=PassPilotManuals.normalizeLink({id:existing?.id||uid('doc'),name:fd.get('name'),url:fd.get('url'),share:fd.get('share')==='on',createdAt:existing?.createdAt});
    if(!doc)return toast('Bitte einen gültigen https://-Link ohne Zugangsdaten einfügen.');
    if(existing)Object.assign(existing,doc);else p.documents.push(doc);
    saveState();closeModal();openProduct(p.id);toast('Anleitungslink gespeichert');
  } else if(form.id==='documentForm'){
    const p=getProduct(form.dataset.id);if(!p)return;let file=fd.get('file');if(file instanceof File&&file.type.startsWith('image/'))file=await PassPilotPlus.compressFile(file);if(!(file instanceof File)||!file.size)return toast('Bitte Datei auswählen');if(file.size>15*1024*1024&&!confirm('Die Datei ist größer als 15 MB und kann viel lokalen Speicher verbrauchen. Trotzdem speichern?'))return;const doc={id:uid('doc'),name:file.name,type:file.type,size:file.size,category:fd.get('category'),share:fd.get('share')==='on',createdAt:new Date().toISOString()};await putFile(p.id,doc.id,file);p.documents.push(doc);saveState();closeModal();openProduct(p.id);toast('Dokument gespeichert');
  } else if(form.id==='saleForm'){
    const p=getProduct(form.dataset.id);if(!p)return;
    const sale=saleFromForm(form);
    if(sale.historyIds.length>5)return toast('Bitte höchstens fünf öffentliche Historieneinträge auswählen.');
    if(!getBaseUrl())return toast('Bitte eine gültige öffentliche HTTPS-Adresse in den Einstellungen eintragen.');
    const snapshot=saleSnapshot(p,sale);
    try{window.PassPilotQR.toDataUrl(`${getBaseUrl()}#pass=${encodeSnapshot(snapshot)}`,520)}catch{return toast('Zu viele QR-Daten. Bitte Beschreibung kürzen oder weniger Historie auswählen.');}
    sale.includePhotos=fd.has('includePhotos');p.sale=sale;p.status='sale';p.qrCreatedAt=new Date().toISOString();p.transfers.push({id:uid('log'),date:p.qrCreatedAt,type:'qr',recipient:''});saveState();openProduct(p.id);if(sale.includePhotos&&PassPilotFirebase.user()){try{await PassPilotFirebase.savePass(p.id,30,true);}catch(error){toast('Online-Link noch nicht erstellt: '+error.message);PassPilotFirebase.passModal(p.id);}}else showPassModal(p.id);
    toast('Verkaufs-QR erstellt');
  } else if(form.id==='settingsForm'){
    const base=fd.get('publicBaseUrl').trim();if(base){try{const url=new URL(base);if(url.protocol!=='https:'||url.username||url.password)throw Error()}catch{return toast('Bitte eine HTTPS-Adresse ohne Zugangsdaten eingeben.')}}
    state.settings.checkLinks=fd.has('checkLinks');state.settings.ownerAlias=fd.get('ownerAlias').trim();state.settings.publicBaseUrl=fd.get('publicBaseUrl').trim();saveState();closeModal();toast('Einstellungen gespeichert');
  } else if(form.id==='claimForm'){
    const p=getProduct(form.dataset.id);if(!p)return;claimResultModal(p,fd.get('issue').trim(),fd.get('since'),fd.get('wish'));
  }
}

async function handleChange(e){if(await PassPilotCapture.changed(e)||await PassPilotPlus.change(e))return;if(e.target.id==='productScanPhoto'){await PassPilotScan.photoChanged(e.target.files?.[0]);e.target.value='';return;}if(e.target.id==='calendarMode'){calendarMode=e.target.value;render();return;}if(e.target.id==='calendarDateInput'){if(calendarDate(e.target.value)){calendarSelectedDate=e.target.value;calendarMonth=e.target.value.slice(0,7);render();openCalendarDay();}return;}if(e.target.id==='calendarFilter'){calendarFilter=e.target.value;render();return;}if(e.target.id==='calendarMonth'){if(calendarDate(e.target.value+'-01')){calendarMonth=e.target.value;calendarSelectedDate=calendarMonth+'-01';render();}return;}if(e.target.id==='backupImport'||e.target.id==='transferImport'){const file=e.target.files?.[0];if(!file)return;try{await importPayload(JSON.parse(await file.text()));closeModal()}catch(err){console.error(err);toast('Import fehlgeschlagen')}}}

document.addEventListener('input',e=>{PassPilotScan.handleInput(e);if(e.target.closest('#saleForm'))updateSalePreview()});
document.addEventListener('click',event=>handleClick(event).catch(error=>{console.error(error);toast(error.message||'Aktion fehlgeschlagen.')}));document.addEventListener('submit',event=>handleSubmit(event).catch(error=>{if(event.target._capture)event.target._capture.saving=false;console.error(error);toast(error.message||'Speichern fehlgeschlagen.')}));document.addEventListener('change',e=>{PassPilotScan.handleInput(e);handleChange(e).catch(error=>{console.error(error);toast(error.message||'Auswahl konnte nicht verarbeitet werden.')})});window.addEventListener('hashchange',render);
document.getElementById('modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('PassPilot wurde installiert')});
if('serviceWorker'in navigator&&(location.protocol==='http:'||location.protocol==='https:'))navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Service Worker:',err));
try{saveState();}catch(error){queueMicrotask(()=>toast('Speicher voll: Bestand bleibt sichtbar. Backup erstellen und Speicher freigeben.'));}render();maybeShowIntro();PassPilotPlus.start();

document.getElementById('modal').addEventListener('close',event=>{if(!event.target.open)PassPilotScan.cleanup()});

PassPilotExperience.start();
PassPilotAssistant.start();
PassPilotSync.start();

PassPilotAccounts.start();

PassPilotNavigation.start();
PassPilotNotifications.start();
PassPilotFeedback.start();
