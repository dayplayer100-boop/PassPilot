"""Configure existing Firebase Authentication using the operator's gcloud login.
No credentials are saved, displayed or bundled. Payments and entitlements untouched.
"""
import json
import re
import subprocess
import sys
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PROJECT = 'passpilot-69f7c'
DOMAIN = 'passpilot-app.web.app'
PACKAGE = 'com.passpilot.app'
CERTIFICATES = {
    'SHA_1': 'dd2385d140e7822782263ad14f56e73e31607bec',
    'SHA_256': '20040c1afadb0e3f648d76455111c6b88806c808e528fd91be5a7f6338aa1225',
}
AUTH = 'https://identitytoolkit.googleapis.com/v2/projects/' + PROJECT
FIREBASE = 'https://firebase.googleapis.com/v1beta1/'

class SetupError(Exception):
    pass

class Api:
    def __init__(self, token):
        self.token = token

    def call(self, url, method='GET', body=None, allow_missing=False):
        data = None if body is None else json.dumps(body).encode()
        request = Request(url, data=data, method=method, headers={
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json',
            'x-goog-user-project': PROJECT,
        })
        try:
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            if allow_missing and error.code == 404:
                return None
            # API responses can contain sensitive configuration; never print their body.
            raise SetupError(f'Einrichtung fehlgeschlagen (HTTP {error.code}). '
                             f'Projektzugriff und aktivierte APIs für {PROJECT} prüfen.') from None


def setup(api):
    config = api.call(AUTH + '/config')
    domains = sorted(set(config.get('authorizedDomains', [])) | {DOMAIN})
    mask = 'authorizedDomains,signIn.email.enabled,signIn.email.passwordRequired'
    api.call(AUTH + '/config?' + urlencode({'updateMask': mask}), 'PATCH', {
        'authorizedDomains': domains,
        'signIn': {'email': {'enabled': True, 'passwordRequired': True}},
    })
    print('E-Mail/Passwort aktiviert; bestehende Domains erhalten, App-Domain freigegeben.')

    google = api.call(AUTH + '/defaultSupportedIdpConfigs/google.com', allow_missing=True)
    client = (google or {}).get('clientId', '')
    if not re.fullmatch(r'\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com', client):
        print('Google noch nicht eingerichtet. Im folgenden Formular Google aktivieren, '
              'Support-E-Mail wählen und speichern. Danach diesen Befehl erneut ausführen:')
        print(f'https://console.firebase.google.com/project/{PROJECT}/authentication/providers')
        return False
    if not google.get('enabled'):
        api.call(AUTH + '/defaultSupportedIdpConfigs/google.com?updateMask=enabled',
                 'PATCH', {'enabled': True})
    document = ('https://firestore.googleapis.com/v1/projects/' + PROJECT +
                '/databases/(default)/documents/billingConfig/public?'+
                urlencode({'updateMask.fieldPaths': 'googleClientId'}))
    api.call(document, 'PATCH', {'fields': {'googleClientId': {'stringValue': client}}})
    print('Google-Anbieter aktiviert; öffentliche Android-Client-ID hinterlegt. '
          'Zahlungen und Premium-Einstellungen unverändert.')

    parent = 'projects/' + PROJECT
    apps = api.call(FIREBASE + parent + '/androidApps').get('apps', [])
    app = next((a for a in apps if a.get('packageName') == PACKAGE), None)
    if app is None:
        operation = api.call(FIREBASE + parent + '/androidApps', 'POST', {
            'packageName': PACKAGE, 'displayName': 'PassPilot Android',
        })
        for _ in range(20):
            if operation.get('done'):
                break
            time.sleep(1)
            operation = api.call(FIREBASE + operation['name'])
        if not operation.get('done') or operation.get('error'):
            raise SetupError('Android-App konnte nicht eingerichtet werden. Firebase-Konsole prüfen.')
        app = operation.get('response', {})
    app_id = app.get('appId')
    if not app_id:
        raise SetupError('Android-App-ID fehlt; Firebase-Konsole prüfen.')
    endpoint = FIREBASE + parent + '/androidApps/' + app_id + '/sha'
    existing = api.call(endpoint).get('certificates', [])
    for kind, digest in CERTIFICATES.items():
        if not any(c.get('certType') == kind and c.get('shaHash', '').replace(':', '').lower() == digest
                   for c in existing):
            api.call(endpoint, 'POST', {'certType': kind, 'shaHash': digest})
    print('Zertifikate der bestehenden signierten Test-App registriert. '
          'Google-Anmeldung ist für Web und Android vorbereitet.')
    return True


def main():
    try:
        token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'],
                                        text=True, stderr=subprocess.DEVNULL).strip()
        if not token:
            raise SetupError('Bitte zuerst in der Google Cloud Shell anmelden.')
        setup(Api(token))
    except (SetupError, subprocess.CalledProcessError, OSError, ValueError, KeyError) as error:
        message = str(error) if isinstance(error, SetupError) else 'Einrichtung nicht vollständig. Cloud-Shell-Anmeldung und Projektzugriff prüfen.'
        print(message, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
