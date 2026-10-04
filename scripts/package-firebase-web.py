"""Create a deploy-ready Hosting ZIP; no build tools needed after extraction."""
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

parser=argparse.ArgumentParser(description='Geprüfte Web-App mit optionalen Android-Downloads verpacken.')
parser.add_argument('output',nargs='?')
parser.add_argument('--apk',type=Path,help='Geprüfte arm64-v8a APK')
parser.add_argument('--apk-32',type=Path,help='Geprüfte armeabi-v7a APK')
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
if args.apk:
    download=root/'web-dist/download'
    download.mkdir(parents=True,exist_ok=True)
    variants={}
    for source,name,abi in [(args.apk,'PassPilot-Test.apk','arm64-v8a'),(args.apk_32,'PassPilot-Test-32bit.apk','armeabi-v7a')]:
        if not source: continue
        data=source.read_bytes()
        if len(data)>80*1024*1024: raise ValueError('APK ungewöhnlich groß; vor Veröffentlichung prüfen.')
        with zipfile.ZipFile(source) as apk:
            if apk.testzip() or 'AndroidManifest.xml' not in apk.namelist(): raise ValueError('Ungültige APK')
        (download/name).write_bytes(data)
        variants[abi]={'url':'https://passpilot-app.web.app/download/'+name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
    version=re.search(r"const APP_VERSION = '([^']+)'",(root/'app/src/main/assets/app/app.js').read_text()).group(1)
    code=int(re.search(r'versionCode (\d+)',(root/'app/build.gradle').read_text()).group(1))
    (download/'latest.json').write_text(json.dumps({'version':version,'versionCode':code,'variants':variants},indent=2)+'\n')
    (download/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PassPilot für Android herunterladen</title><link rel="stylesheet" href="../styles.css"><main class="app-shell"><section class="card"><h1>PassPilot für Android</h1><p>Version '+version+'</p><p>Als Update installieren, ohne die bisherige App zu deinstallieren. Vorher ein Backup sichern.</p><a class="primary-btn" href="PassPilot-Test.apk" download>Android-App herunterladen</a>'+('<details><summary>Älteres Android-Gerät</summary><p>Wenn die normale APK nicht kompatibel ist:</p><a class="soft-btn" href="PassPilot-Test-32bit.apk" download>32-Bit-Version herunterladen</a></details>' if args.apk_32 else '')+'<p><a href="../">Zurück zu PassPilot</a></p></section></main></html>')
    hosting['redirects']=[item for item in hosting.get('redirects',[]) if item.get('source')!='/download/PassPilot-Test.apk']

instructions = f'''PassPilot Web – vorbereitet für {project}

Dieses Paket enthält die Web-App und ihre öffentliche Firebase-Konfiguration.
Es enthält keine Produkte, Dokumente oder Backups aus einem Nutzerbestand.
Dieses Update enthält die bisherigen PassPilot-Regeln plus private Sync- und Feedback-Regeln.
Die Regel-Datei ist für das eigene PassPilot-Projekt vorgesehen.

COMPUTER (Node.js muss installiert sein)
1. ZIP vollständig entpacken und ein Terminal im entpackten Ordner öffnen.
2. npx --yes firebase-tools@14.18.0 login
3. npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project {project}

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
{'Dieses Paket enthält die geprüften Android-APKs unter /download/. Downloads erfolgen direkt von der Website, ohne Weiterleitung.' if args.apk else 'Ohne --apk bleibt der vorhandene öffentliche Download als Weiterleitung erhalten.'}

VORAUSSETZUNGEN
Das Google-Konto muss Zugriff auf das Projekt besitzen. E-Mail/Passwort,
Firestore und PassPilot-Regeln müssen im Projekt eingerichtet sein.
Bei einer Fehlermeldung nicht auf Blaze umstellen: dieses Paket benötigt
weder Firebase App Hosting noch Cloud Functions oder Cloud Storage.
Spark ist innerhalb seiner Kontingente ausreichend.

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
    for file in sorted((root / 'web-dist').rglob('*')):
        if file.is_file():
            archive.write(file, 'public/' + file.relative_to(root / 'web-dist').as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert 'public/index.html' in names and 'public/pass/index.html' in names
    assert json.loads(archive.read('firebase.json'))['hosting']['public'] == 'public'
    assert not any('node_modules' in name or 'backup' in name.lower() for name in names)
print(f'Geprüftes Hosting-Paket: {output} ({output.stat().st_size} Bytes)')
