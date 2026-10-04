'use strict';
const {onRequest}=require('firebase-functions/v2/https'),{defineSecret}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app'),{getAuth}=require('firebase-admin/auth'),{getFirestore}=require('firebase-admin/firestore');
const {createHandler}=require('./handler.cjs');initializeApp();
const key=defineSecret('PASSPILOT_OPENAI_API_KEY');
const BILLING_ENFORCED=false; // Enable only together with verified provider/webhooks and production rules.
const billingPolicy=require('./billing-policy.cjs');
async function quota(uid){const db=getFirestore();let quotaOwner=uid;if(BILLING_ENFORCED&&(await db.doc('licenses/'+uid).get()).data()?.active!==true){const entitlement=(await db.doc('entitlements/'+uid).get()).data();if(!billingPolicy.permits(entitlement,'assistantAI',Date.now()))return false;const binding=entitlement.purchaseBinding;if(!/^[a-f0-9]{64}$/.test(binding||''))return false;const owner=(await db.doc('purchaseBindings/'+binding).get()).data();if(owner?.ownerUid!==uid)return false;quotaOwner=binding;}const day=new Date().toISOString().slice(0,10),minute=Math.floor(Date.now()/60000);return db.runTransaction(async tx=>{const a=db.doc('assistantUsage/'+day+'_'+quotaOwner),b=db.doc('assistantUsage/'+day+'_global'),[user,total]=await Promise.all([tx.get(a),tx.get(b)]),u=user.data()||{},t=total.data()||{};const count=u.minute===minute?(u.minuteCount||0):0;if((u.dayCount||0)>=30||count>=5||(t.dayCount||0)>=100)return false;const expiresAt=new Date(Date.now()+7*86400000);tx.set(a,{dayCount:(u.dayCount||0)+1,minute,minuteCount:count+1,expiresAt});tx.set(b,{dayCount:(t.dayCount||0)+1,expiresAt});return true;});}
exports.passpilotAssistant=onRequest({region:'europe-west3',secrets:[key],maxInstances:1,concurrency:4,timeoutSeconds:30,memory:'256MiB'},createHandler({verifyToken:token=>getAuth().verifyIdToken(token,true),quota,providerKey:()=>key.value()}));

const {createDocumentHandler}=require('./document-handler.cjs');
exports.passpilotDocument=onRequest({region:'europe-west3',secrets:[key],maxInstances:1,concurrency:2,timeoutSeconds:45,memory:'256MiB'},createDocumentHandler({verifyToken:token=>getAuth().verifyIdToken(token,true),quota,providerKey:()=>key.value()}));

const {createLicenseHandler}=require('./license-handler.cjs');
exports.passpilotRedeemLicense=onRequest({region:'europe-west3',maxInstances:1,concurrency:4,timeoutSeconds:20,memory:'256MiB'},createLicenseHandler({verifyToken:token=>getAuth().verifyIdToken(token,true),db:getFirestore()}));
const {createManualHandler}=require('./manual-handler.cjs');
exports.passpilotFindManual=onRequest({region:'europe-west3',maxInstances:1,concurrency:4,timeoutSeconds:20,memory:'256MiB'},createManualHandler({verifyToken:token=>getAuth().verifyIdToken(token,true),db:getFirestore()}));
