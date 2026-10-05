const CACHE='passpilot-1.25.0-web-1';
const ASSETS=['./navigation.js','./organizer.js','./notifications.js','./feedback.js','./google-auth.js','./device-access.js','./obligations.js','./market-export.js','./accounts.js','./billing-policy.js','./model-facts.js','./upgrades.js','./identity.js','./lifecycle.js','./image-editor.js','./document-ai.js','./sharing.js','./recognition.js','./licenses/qrcode-MIT.txt','./third-party-notices.txt','./assistant.js','./assistant-config.js','./copyright.html','./icons/icon-maskable-512.png','./experience.js','./sync.js','./legal-config.js','./privacy.html','./imprint.html','./icons/share-banner.png','./project-config.js','./capture.js','./','./index.html','./styles.css','./app.js','./product-scan.js','./manuals.js','./improvements.js','./firebase.js','./sale-sheet.js','./calendar.js','./public-pass.js','./qrcode-lite.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
const OPTIONAL=[];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('passpilot-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url),base=new URL('./',self.registration.scope);
  // Cache only our application files. Never intercept Firebase, authenticated
  // requests, shared online passes, or arbitrary document/third-party URLs.
  if(url.origin!==base.origin||url.search||event.request.headers.has('Authorization'))return;
  const allowed=[...ASSETS,...OPTIONAL].some(path=>new URL(path,base).href===url.href);
  if(!allowed)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request);if(cached)return cached;
    try{const response=await fetch(event.request);if(response.ok){const copy=response.clone();event.waitUntil(cache.put(event.request,copy));}return response;}catch{return Response.error();}
  }));
});
