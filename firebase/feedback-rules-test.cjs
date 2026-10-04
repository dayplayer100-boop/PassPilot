'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,updateDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp}=require('firebase/firestore');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-passpilot',firestore:{host:'127.0.0.1',port:8081,rules:fs.readFileSync(__dirname+'/firestore.rules','utf8')}});
 try{
  await env.clearFirestore();
  const one=env.authenticatedContext('one',{email_verified:true}).firestore(),two=env.authenticatedContext('two',{email_verified:true}).firestore(),admin=env.authenticatedContext('admin',{email_verified:true,passpilotAdmin:true}).firestore(),unverified=env.authenticatedContext('unverified',{email_verified:false}).firestore(),anon=env.unauthenticatedContext().firestore();
  const id=()=>crypto.randomBytes(20).toString('hex');
  const report=(ownerUid='one')=>({ownerUid,type:'bug',message:'Die Wartungsübersicht zeigt einen Fehler.',version:'1.24.0-test',page:'maintenance',platform:'web',screenshot:'',status:'new',createdAt:serverTimestamp()});
  const send=(db,rid,count=1,start=serverTimestamp(),ownerUid='one',extra={})=>{const batch=writeBatch(db);batch.set(doc(db,'feedbackReports/'+rid),{...report(ownerUid),...extra});batch.set(doc(db,'feedbackCounters/'+ownerUid),{ownerUid,count,lastReportId:rid,lastSentAt:serverTimestamp(),windowStartAt:start});return batch.commit();};
  const first=id();await assertFails(setDoc(doc(one,'feedbackReports/'+first),report()));await assertSucceeds(send(one,first));
  await assertSucceeds(getDoc(doc(one,'feedbackReports/'+first)));await assertSucceeds(getDoc(doc(admin,'feedbackReports/'+first)));await assertSucceeds(getDocs(collection(admin,'feedbackReports')));
  await assertFails(getDoc(doc(two,'feedbackReports/'+first)));await assertFails(getDoc(doc(anon,'feedbackReports/'+first)));await assertFails(getDocs(collection(one,'feedbackReports')));
  await assertFails(updateDoc(doc(one,'feedbackReports/'+first),{message:'Rewritten report'}));await assertFails(deleteDoc(doc(one,'feedbackCounters/one')));
  const start=(await getDoc(doc(one,'feedbackCounters/one'))).data().windowStartAt;
  await assertFails(send(one,id(),2,start)); // Server enforces minimum spacing.
  await assertFails(send(unverified,id(),1,serverTimestamp(),'unverified'));
  await assertFails(send(two,id(),1,serverTimestamp(),'one'));
  await assertFails(send(anon,id(),1,serverTimestamp(),'anon'));
  await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'feedbackCounters/one'),{lastSentAt:Timestamp.fromMillis(Date.now()-31000)}));
  await assertFails(send(one,id(),2,start,'one',{screenshot:'data:image/png;base64,AAAA'}));await assertFails(send(one,id(),2,start,'one',{screenshot:'data:image/jpeg;base64,'+'A'.repeat(420000)}));
  await assertFails(send(one,id(),2,start,'one',{privateDocument:'Forbidden extension'}));await assertFails(send(one,id(),1,serverTimestamp()));
  const a=id(),b=id(),outcomes=await Promise.allSettled([send(one,a,2,start),send(one,b,2,start)]);assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal((await getDoc(doc(one,'feedbackCounters/one'))).data().count,2);
  await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'feedbackCounters/one'),{count:20,lastSentAt:Timestamp.fromMillis(Date.now()-31000)}));await assertFails(send(one,id(),21,start));
  await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'feedbackCounters/one'),{windowStartAt:Timestamp.fromMillis(Date.now()-86401000),lastSentAt:Timestamp.fromMillis(Date.now()-31000)}));
  const reset=id();await assertSucceeds(send(one,reset));assert.equal((await getDoc(doc(one,'feedbackCounters/one'))).data().count,1);
  await assertSucceeds(deleteDoc(doc(one,'feedbackReports/'+reset)));await assertSucceeds(getDoc(doc(one,'feedbackCounters/one')));
  console.log('PASS: private verified feedback, admin-only overview, paired atomic writes, server timestamps, 30-second and 20-per-day throttling, concurrent send, reset, bounded screenshots and no client rewrites.');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exit(1);});
