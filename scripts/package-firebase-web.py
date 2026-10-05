"""Create a Spark-compatible Hosting ZIP; APK downloads remain in GitHub Releases."""
import json
import argparse
import hashlib
import re
import os
import shlex
import subprocess
import sys
import zipfile
from pathlib import Path
from urllib.parse import urlparse

parser=argparse.ArgumentParser(description='Web-App für Firebase Spark verpacken; APKs werden nicht eingebettet.')
parser.add_argument('output',nargs='?')
parser.add_argument('--apk',type=Path,help='arm64-v8a APK optional gegen Download-Prüfsumme prüfen, nicht einpacken')
parser.add_argument('--apk-32',type=Path,help='armeabi-v7a APK optional gegen Download-Prüfsumme prüfen, nicht einpacken')
args=parser.parse_args()
root = Path(__file__).resolve().parent.parent
subprocess.run(['node', str(root / 'scripts/build-web.cjs')], cwd=root, check=True, env={**os.environ, 'PASSPILOT_MINIFY':'1'})
config = json.loads((root / 'public-firebase-config.json').read_text())
project = config['projectId']
hosting = json.loads((root / 'firebase/firebase.json').read_text())['hosting']
hosting['public'] = 'public'
output = Path(args.output) if args.output else root.parent / 'PassPilot-Firebase-Web.zip'
output.parent.mkdir(parents=True, exist_ok=True)
if args.apk_32 and not args.apk:
    parser.error('--apk-32 benötigt ebenfalls --apk.')
metadata=json.loads((root/'web-dist/download/latest.json').read_text())
version=re.search(r"const APP_VERSION = '([^']+)'",(root/'app/src/main/assets/app/app.js').read_text()).group(1)
code=int(re.search(r'versionCode (\d+)',(root/'app/build.gradle').read_text()).group(1))
if metadata.get('version')!=version or metadata.get('versionCode')!=code:
    raise ValueError('Download-Metadaten müssen zur App-Version passen.')
redirects={entry['source']:entry['destination'] for entry in hosting.get('redirects',[])}
for source,name,abi in [(args.apk,'PassPilot-Test.apk','arm64-v8a'),(args.apk_32,'PassPilot-Test-32bit.apk','armeabi-v7a')]:
    variant=metadata['variants'][abi]
    url=urlparse(variant['url'])
    if url.scheme!='https' or url.hostname!='github.com' or url.username or url.password:
        raise ValueError('Downloads müssen auf das offizielle GitHub-Release verweisen.')
    if not url.path.startswith('/dayplayer100-boop/PassPilot/releases/download/'):
        raise ValueError('Download gehört nicht zum PassPilot-Repository.')
    if redirects.get('/download/'+name)!=variant['url']:
        raise ValueError('Firebase-Download-Weiterleitung stimmt nicht mit latest.json überein.')
    if not re.fullmatch(r'[0-9a-f]{64}',variant.get('sha256','')) or not isinstance(variant.get('bytes'),int) or variant['bytes']<=0:
        raise ValueError('Download-Prüfsumme oder Größe ist ungültig.')
    if source:
        data=source.read_bytes()
        if len(data)!=variant['bytes'] or hashlib.sha256(data).hexdigest()!=variant['sha256']:
            raise ValueError('APK passt nicht zu den veröffentlichten Download-Metadaten.')
        with zipfile.ZipFile(source) as apk:
            if apk.testzip() or 'AndroidManifest.xml' not in apk.namelist():
                raise ValueError('Ungültige APK')
blocked={'.apk','.ipa','.exe','.dll','.bat'}
assets=sorted(file for file in (root/'web-dist').rglob('*') if file.is_file())
if any(file.suffix.lower() in blocked for file in assets):
    raise ValueError('Spark-Hosting darf keine ausführbaren Dateien enthalten; APKs separat veröffentlichen.')

instructions = f'''PassPilot Web – vorbereitet für {project}

Dieses Paket enthält die Web-App und ihre öffentliche Firebase-Konfiguration.
Es enthält keine Produkte, Dokumente oder Backups aus einem Nutzerbestand.
Dieses Update enthält die bisherigen PassPilot-Regeln plus private Sync- und Feedback-Regeln.
Die Regel-Datei ist für das eigene PassPilot-Projekt vorgesehen.

COMPUTER (Node.js muss installiert sein)
1. ZIP vollständig entpacken und ein Terminal im entpackten Ordner öffnen.
2. npx --yes firebase-tools@14.18.0 login
3. python setup-auth.py  # Google Cloud Shell: einmalige Anmelde-Einrichtung
4. npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project {project}

NUR HANDY / GOOGLE CLOUD SHELL
1. https://shell.cloud.google.com/ öffnen und im eigenen Google-Konto anmelden.
   Falls nötig in Chrome „Desktopwebsite“ aktivieren. Beim ersten Öffnen kann
   die Einrichtung der Cloud Shell etwas dauern.
2. Dieses ZIP auf das Handy herunterladen und im Cloud-Shell-Menü über
   „Datei hochladen“ ins Home-Verzeichnis hochladen.
3. Im Terminal:
   unzip -q {shlex.quote(output.name)} -d passpilot-web
   cd passpilot-web
   npx --yes firebase-tools@14.18.0 login --no-localhost
   npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project {project}
4. Falls Firebase einen Anmeldelink/Bestätigungscode anbietet, diesen nur
   im eigenen Browser/Terminal verwenden. Keine Zugangsdaten in Chats senden.

Die Standardadresse ist nach erfolgreicher Veröffentlichung:
https://passpilot-app.web.app
QR-Leseseite: https://passpilot-app.web.app/pass/
Die tatsächliche Hosting-Adresse steht in der Ausgabe des Deploy-Befehls.

DOWNLOADS
Dieses Paket enthält keine APKs. Die geprüften Android-APKs sind in GitHub Releases.
/download/ bleibt auf derselben Website. Die Schaltflächen und die stabilen
APK-URLs leiten direkt auf die passende GitHub-Datei weiter, ohne fremde Download-Seite.
/download/latest.json enthält Version, Buildnummer, Größe und SHA-256 beider APKs.
Die APK-Parameter prüfen lokale Dateien gegen diese Metadaten; sie betten nichts ein.

VORAUSSETZUNGEN
Das Google-Konto muss Zugriff auf das Projekt besitzen. E-Mail/Passwort,
Firestore und PassPilot-Regeln müssen im Projekt eingerichtet sein.
Bei einer Fehlermeldung nicht auf Blaze umstellen: dieses Paket benötigt
weder Firebase App Hosting noch Cloud Functions oder Cloud Storage.
Spark ist für diese Web-Dateien innerhalb seiner Kontingente ausreichend.
Spark verbietet APK/IPA/EXE/DLL/BAT; deshalb werden APKs nicht über Firebase gehostet.

PRÜFUNG NACH VERÖFFENTLICHUNG
Website öffnen, Testprodukt speichern und Seite neu laden. Konto registrieren,
E-Mail bestätigen und in der App „Bestätigung prüfen“ wählen. Nur ausdrücklich öffentliche Daten
freigeben. Ein öffentlicher Online-Pass muss nach seiner Deaktivierung
unzugänglich sein. Optional auf beiden Geräten mit demselben bestätigten Konto anmelden und
Synchronisation mit demselben eigenen Sync-Passwort einrichten. Fotos und
Dokumente bewusst auswählen. Die Synchronisation läuft bei geöffneter App
bis zu 20 MB Gesamtgröße; Geräteeinstellungen bleiben lokal.
'''
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('firebase.json', json.dumps({'hosting': hosting,'firestore':{'rules':'firestore.rules'}}, indent=2))
    archive.writestr('.firebaserc', json.dumps({'projects': {'default': project}}, indent=2))
    archive.writestr('ANLEITUNG.txt', instructions)
    archive.write(root/'firebase/firestore.rules','firestore.rules')
    archive.write(root/'scripts/setup-firebase-auth.py','setup-auth.py')
    for file in assets:
        archive.write(file, 'public/' + file.relative_to(root / 'web-dist').as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert 'public/index.html' in names and 'public/pass/index.html' in names
    assert json.loads(archive.read('firebase.json'))['hosting']['public'] == 'public'
    assert not any('node_modules' in name or 'backup' in name.lower() for name in names)
    assert not any(Path(name).suffix.lower() in blocked for name in names)
print(f'Geprüftes Hosting-Paket: {output} ({output.stat().st_size} Bytes)')
