# PassPilot – aktueller Quellcode 1.26.0-test

Geprüfter Entwicklungsstand vom 05.10.2026, Android versionCode 27. Vollständige gemeinsame Web-App, Android/Java, Firebase-Regeln, optionales Backend, Build-Skripte, Lockfiles, Tests und vorhandener GitHub-Android-Workflow. Der separate Export 1.23 bleibt unverändert erhalten.

## Web bauen

Node.js 22. Im ZIP-Hauptordner:

```sh
npm ci
npm run prepare:vendor
npm run build:web
```

Ausgabe: `web-dist/`. Browser-Abhängigkeiten werden in festgelegten Versionen rekonstruiert; OCR-Sprachdaten werden per SHA-256 geprüft. Optional komprimieren: `PASSPILOT_MINIFY=1 npm run build:web`. PowerShell: `$env:PASSPILOT_MINIFY='1'; npm run build:web`.

## Firebase

Projekt: `passpilot-69f7c`. **Site: `passpilot-app`; https://passpilot-app.web.app**. Die andere Site `passpilot-69f7c` nicht überschreiben. Die `firebase.json` im ZIP-Hauptordner verwendet `web-dist/` und `firebase/firestore.rules`. `.firebaserc` enthält das Projekt.

Aus dem Hauptordner nach dem Build und mit vorhandener Firebase-Anmeldung:

```sh
npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project passpilot-69f7c
```

Firebase wird aus diesem Export nicht automatisch veröffentlicht. APKs sind absichtlich nicht im Quellcode-ZIP: Firebase Spark verbietet ausführbare Dateien. Das normale Web-Build enthält die Download-Seite und Update-Metadaten. Stabile APK-Pfade leiten direkt zu GitHub Releases weiter. `scripts/package-firebase-web.py` erzeugt ein Spark-kompatibles Web-ZIP; `--apk ... --apk-32 ...` prüft lokale APKs, ohne sie einzubetten. Google, E-Mail- und Feedback-Einrichtung sind in `docs/UPDATE-1.26.md` beschrieben. Ein Hosting-Deploy veröffentlicht keine optionalen Cloud Functions.

## Android und GitHub

JDK 17, Android SDK 35 und Gradle 8.9 installieren. `gradle :app:assembleDebug`. Der enthaltene Workflow `.github/workflows/main.yml` baut Android; er deployt kein Firebase. Google Credential Manager ist integriert und benötigt die Projekt-/OAuth-/Zertifikatskonfiguration aus dem Update-Dokument.

Private Signierschlüssel sind absichtlich nicht enthalten. Der Export nutzt für Debug-Builds den normalen lokal erzeugten Debug-Schlüssel. Zum Aktualisieren einer vorhandenen App ist deren bisheriger Signierschlüssel erforderlich. Nicht zum Update deinstallieren; lokale Daten vorher sichern. Produktionssignierung ist über eigene, separat verwaltete Umgebungsvariablen vorbereitet.

## Umgebungsvariablennamen – ohne Werte

Für Web sind keine geheimen Werte erforderlich. `public-firebase-config.json` enthält die öffentliche Projekt-ID und den öffentlichen Firebase-Web-API-Key. Regeln und Anmeldung sichern Cloud-Zugriffe.

- `PASSPILOT_MINIFY`: optional `1` für komprimierte Projekt-Skripte.
- `GOOGLE_APPLICATION_CREDENTIALS`: optional eigener ADC-Dateipfad außerhalb des Repositorys; alternativ CLI/ADC-Anmeldung.
- `PASSPILOT_OPENAI_API_KEY`: optionales **serverseitiges** Secret für KI-Functions, niemals für den Web-Build.
- `PASSPILOT_RELEASE_KEYSTORE`, `PASSPILOT_RELEASE_STORE_PASSWORD`, `PASSPILOT_RELEASE_KEY_ALIAS`, `PASSPILOT_RELEASE_KEY_PASSWORD`: eigene Android-Release-Signierung.
- `JAVA_HOME`, `ANDROID_HOME` bzw. `ANDROID_SDK_ROOT`: lokale Toolchain-Pfade.

Für Functions zusätzlich `npm ci` unter `assistant-backend/functions` ausführen. Das Backend-Dokument beschreibt weitere öffentliche/Firestore-Konfiguration. `python scripts/setup-firebase-auth.py` richtet Domains, E-Mail und einen bereits konfigurierten Google-Anbieter in der angemeldeten Google Cloud Shell ein. Google-Web-OAuth-Client-ID ist öffentlich und wird für Android in `billingConfig/public.googleClientId` gespeichert; kein OAuth-Secret in der App.

## Validierung und Grenzen

Browser-Abläufe einschließlich echter lokaler OCR/PDF-Verarbeitung, Zwei-Geräte-Sync, private Freigaben und Feedback wurden geprüft. Firestore-Regeln mit Emulator; Android mit Compiler, acht Unit-Tests, Lint und unveränderter Signatur der bereitgestellten Test-APKs. Details siehe `docs/UPDATE-1.26.md`.

Browser-Tests: `npx playwright install chromium` und beispielsweise `node tests/experience-124.cjs`. Private Lizenzcode-Tests benötigen eigene Fixtures; echte Codes und Aussteller-Schlüssel fehlen bewusst. Regeln-Tests benötigen einen lokalen Firestore-Emulator; Delegations-/Lizenztests zusätzlich die Backend-Abhängigkeiten. Tests deployen kein Firebase.

Nicht enthalten: Zugangsdaten, echte Nutzerbestände/Backups, private Schlüssel/Keystores, Aktivierungs-/Premiumcodes, APKs, node_modules, Vendor-Builds und Build-Caches. Alle vorhandenen Plus-Funktionen bleiben im Testmodus offen, Zahlungen deaktiviert. E-Mail/SMS-Versand, produktives Family-Billing und eine selbstlernende KI sind nicht aktiviert.
