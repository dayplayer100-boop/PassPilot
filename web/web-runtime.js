(function () {
  'use strict';
  const plus = window.PassPilotPlus;
  const sharedSettings = plus.settingsSection;
  plus.settingsSection = function () {
    const template = document.createElement('template');
    template.innerHTML = sharedSettings();
    template.content.querySelector('.native-settings')?.remove();
    for(const button of template.content.querySelectorAll('[data-action="toggle-native-lock"],[data-action="backup-folder"]'))button.remove();
    return `<section class="card flat-card"><h3>Web-Version</h3><p>Deine Produkte und Dateien liegen in diesem Browser. Konto, Plus-Testmodus und verschlüsselter Abgleich sind dieselben wie in Android. Für die Aufbewahrung regelmäßig ein Backup außerhalb dieses Geräts sichern.</p></section>` + template.innerHTML;
  };
  const backupView = plus.backupView;
  plus.backupView = function () {
    const template = document.createElement('template');
    template.innerHTML = backupView();
    const section = template.content.querySelector('[data-action="toggle-native-backup"]')?.closest('.card');
    if (section) section.innerHTML = '<h3>Browser-Backup</h3><p>Lade dein Backup herunter und bewahre es auch außerhalb dieses Geräts auf. Automatische Android-Ordner-Backups stehen in der Handy-App zur Verfügung.</p>';
    return template.innerHTML;
  };
  const openFile = plus.openFile;
  plus.openFile = async function (productId, docId) {
    const blob = await getFile(productId, docId);
    const doc = getProduct(productId)?.documents.find(d => d.id === docId);
    if (!blob || !(blob.type === 'application/pdf' || /\.pdf$/i.test(doc?.name || ''))) return openFile(productId, docId);
    await globalThis.PassPilotWebTools.openPdf(blob, doc?.name || 'Dokument.pdf');
  };
  function incomingHandoff(){
    const params=new URLSearchParams(location.hash.slice(1)),code=params.get('receive');
    if(!/^[a-z0-9]{40}$/.test(code||''))return;
    window.PassPilotPendingHandoff=code;window.PassPilotPendingAssetTransfer=params.get('registry')==='1';
    const open=()=>PassPilotFirebase.beginHandoff(code,params.get('registry')==='1');
    if(document.readyState==='complete')open();else document.addEventListener('DOMContentLoaded',open,{once:true});
  }
  incomingHandoff();window.addEventListener('hashchange',incomingHandoff);
  document.querySelector('.mode-pill').textContent = 'Web · lokal gespeichert';
})();
