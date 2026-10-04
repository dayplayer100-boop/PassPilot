'use strict';
function showPublicPass() {
  if(!location.hash||location.hash.startsWith('#online=')||location.hash.startsWith('#asset=')) return;
  if(location.hash.startsWith('#handoff=')){const params=new URLSearchParams(location.hash.slice(1)),id=params.get('handoff'),project=params.get('project'),valid=/^[a-z0-9]{40}$/.test(id||'')&&(!project||project==='passpilot-69f7c'),base=document.documentElement.dataset.appRoot?new URL(document.documentElement.dataset.appRoot,location.href):new URL('https://passpilot-app.web.app/'),url=new URL('#receive='+id+(params.get('registry')==='1'?'&registry=1':''),base);document.getElementById('publicPass').innerHTML=valid?'<section class="card"><h1>Produkt mit PassPilot übernehmen</h1><p>Öffne PassPilot, melde dich mit deinem bestätigten Konto an und übernimm das Produkt. Eine installierte App ist nicht nötig.</p><a class="soft-btn" href="'+url.href+'">Produkt in PassPilot öffnen</a><p>Die Übernahme ist nur einmal möglich. Hat der Absender eine Empfänger-E-Mail festgelegt, muss dein Konto diese Adresse verwenden.</p></section>':'<section class="card"><h1>Ungültiger Übergabelink</h1></section>';return;}

  const data=location.hash.startsWith('#pass=') ? PassPilotPublic.decode(location.hash.slice(6)) : null;
  document.getElementById('publicPass').innerHTML=PassPilotPublic.render(data);
  document.title=data?.title ? `${data.title} – PassPilot` : 'Ungültiger Produktpass – PassPilot';
}
window.addEventListener('hashchange',showPublicPass);
showPublicPass();
