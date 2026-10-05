(function(global){
'use strict';
let sdkPromise=null;
const base='https://www.gstatic.com/firebasejs/11.10.0/';
function preload(){if(global.PassPilotAndroid)return Promise.resolve(null);if(!sdkPromise)sdkPromise=Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js')]).catch(e=>{sdkPromise=null;throw e;});return sdkPromise;}
async function login(){
 const cfg=PassPilotFirebase.config();if(!cfg)throw Error('Anmeldung ist noch nicht eingerichtet.');
 if(global.PassPilotAndroid?.googleSignIn){let client=cfg.googleClientId;try{if(!client){const d=await PassPilotFirebase.http(PassPilotFirebase.root()+'/billingConfig/public?key='+cfg.apiKey,'GET');client=d.fields?.googleClientId?.stringValue;}}catch{}
  if(!/^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(client||''))throw Error('Google-Anmeldung für Android ist noch nicht eingerichtet. Du kannst dich mit E-Mail anmelden.');
  const result=await PassPilotPlus.request('googleSignIn',client);if(!result.idToken)throw Error('Google-Anmeldung wurde abgebrochen.');
  return PassPilotFirebase.signInWithGoogle(result.idToken);
 }
 if(!['http:','https:'].includes(location.protocol))throw Error('Google-Anmeldung benötigt die veröffentlichte Website.');
 const [app,auth]=await preload(),name='passpilot-google-'+cfg.projectId;
 const instance=app.getApps().find(a=>a.name===name)||app.initializeApp({apiKey:cfg.apiKey,projectId:cfg.projectId,authDomain:cfg.projectId+'.firebaseapp.com'},name),service=auth.getAuth(instance);
 await auth.setPersistence(service,auth.inMemoryPersistence);
 const provider=new auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
 try{const result=await auth.signInWithPopup(service,provider),credential=auth.GoogleAuthProvider.credentialFromResult(result);if(!credential?.idToken)throw Error('Google konnte keine Anmeldung bestätigen.');return await PassPilotFirebase.signInWithGoogle(credential.idToken);}catch(e){const messages={'auth/operation-not-allowed':'Google-Anmeldung ist im Firebase-Projekt noch nicht aktiviert. E-Mail-Anmeldung funktioniert weiterhin.','auth/unauthorized-domain':'Diese Website ist noch nicht für Google-Anmeldung freigegeben.','auth/popup-blocked':'Dein Browser blockiert das Anmeldefenster. Erlaube es und versuche es erneut.','auth/popup-closed-by-user':'Google-Anmeldung wurde abgebrochen.','auth/account-exists-with-different-credential':'Für diese E-Mail existiert schon ein Konto mit einer anderen Anmeldeart. Melde dich zuerst damit an.'};throw Error(messages[e.code]||e.message||'Google-Anmeldung derzeit nicht erreichbar.');}finally{await auth.signOut(service).catch(()=>{});}
}
global.PassPilotGoogle={preload,login};
})(window);
