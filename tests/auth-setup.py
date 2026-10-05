import contextlib
import importlib.util
import io
from pathlib import Path
spec=importlib.util.spec_from_file_location('setup_auth',Path(__file__).resolve().parents[1]/'scripts/setup-firebase-auth.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Mock:
 def __init__(self,google=True): self.google=google;self.calls=[]
 def call(self,url,method='GET',body=None,allow_missing=False):
  self.calls.append((url,method,body))
  if url.endswith('/config'):return {'authorizedDomains':['localhost','existing.example'], 'signIn':{'email':{'enabled':False}}}
  if url.endswith('/google.com'):return {'enabled':False,'clientId':'123456-public_client.apps.googleusercontent.com','clientSecret':'SECRET_MUST_NOT_LOG'} if self.google else None
  if url.endswith('/androidApps'):return {'apps':[{'packageName':'com.passpilot.app','appId':'1:123:android:abc'}]}
  if url.endswith('/sha') and method=='GET':return {'certificates':[{'certType':'SHA_1','shaHash':m.CERTIFICATES['SHA_1']}]}
  return {}
mock=Mock();stdout=io.StringIO()
with contextlib.redirect_stdout(stdout):assert m.setup(mock)
assert 'SECRET_MUST_NOT_LOG' not in stdout.getvalue()
patch=next(c for c in mock.calls if c[1]=='PATCH' and '/config?' in c[0]);assert patch[2]['authorizedDomains']==['existing.example','localhost','passpilot-app.web.app']
assert set(patch[2])=={'authorizedDomains','signIn'}
firestore=next(c for c in mock.calls if 'firestore.googleapis.com' in c[0]);assert 'updateMask.fieldPaths=googleClientId' in firestore[0];assert set(firestore[2]['fields'])=={'googleClientId'}
sha=[c for c in mock.calls if c[1]=='POST' and c[0].endswith('/sha')];assert len(sha)==1 and sha[0][2]['certType']=='SHA_256'
missing=Mock(False)
with contextlib.redirect_stdout(io.StringIO()):assert not m.setup(missing)
assert not any('firestore.googleapis.com' in c[0] for c in missing.calls)
print('PASS: auth setup preserves domains and billing fields, never logs provider secrets, registers only missing certificates, and handles unconfigured Google.')
