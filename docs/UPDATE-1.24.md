# PassPilot 1.24.0-test

Dieser Stand verbessert die gemeinsame Oberfläche und die vorhandenen Abläufe. Bestehende Produkte, Dokumente, Lebensläufe, verschlüsselte Gerätezugänge und QR-Zuordnungen bleiben erhalten. Zahlungen und Abo-Sperren bleiben deaktiviert; alle bereits implementierten lokalen Plus-Funktionen können getestet werden. Nicht eingerichtete Cloud-Dienste werden dadurch nicht freigeschaltet.

## Fertiggestellt

- Kompakte Übersicht mit vier Zugängen: Produkte, Verträge & Tarife, Wartung und Gerätepasswörter. Fünf Navigationspunkte unten; Historie, Aufgaben und Backup unter „Mehr“.
- Verträge und Wartungen direkt anlegen, mit oder ohne Gerät. Eigenständige Verträge erscheinen nicht in der Produktliste und nicht im Versicherungsinventar. Sie bleiben im vollständigen Backup und verschlüsselten Sync enthalten.
- Wartung zeigt zuerst Aufgabe, Termin und optionales Intervall. Ratenkauf/Leasing zeigen Betrag, Anzahl, erste Fälligkeit und bestätigte Zahlungen. Weitere Angaben sind aufklappbar. Vorhandene Wartungspläne bleiben erreichbar.
- Gemeinsame Einstellungen in Web und Android, einheitliche Auswahlfelder und Schalter. Konto/Sync, Benachrichtigungen und Abos/Codes sind direkt erreichbar. Diagramme und Vertrags-Erinnerungen funktionieren im offenen Testmodus.
- E-Mail-Bestätigung ohne erneutes Anmelden prüfen; Token mit aktueller Bestätigung erneuern. Anmeldekennwörter und Tokens werden nicht dauerhaft im Browser gespeichert.
- Sync verträgt unterschiedliche Salze bei gleichzeitiger Ersteinrichtung und das Ersetzen alter Datei-Chunks während eines laufenden Lesens. Konflikte benötigen weiterhin eine bewusste Auswahl. Ein falsches Passwort ersetzt keine Daten. Sperren bricht eine noch laufende Einrichtung ab.
- Android-Zurücktaste schließt zuerst den obersten Dialog und navigiert dann zwischen App-Ansichten. Sie beendet die App nicht schon bei der ersten Rückbewegung. Die bestehende Zoom-Sperre bleibt aktiv.
- „!“ öffnet eine private Fehlermeldung oder Idee mit lokaler Bildschirmvorschau. Zugangsdaten- und Anmeldebereiche werden ohne Aufnahme gemeldet. Bild vor dem Versand prüfen oder entfernen; kein automatischer Versand. Das ursprüngliche Formular bleibt erhalten.
- Feedback wird nur mit bestätigtem Konto gespeichert. Regeln erzwingen Eigentumsbindung, atomare Bericht-/Zähler-Schreibvorgänge, Serverzeit, 30 Sekunden Abstand und höchstens 20 Meldungen in 24 Stunden. Wiederholungen desselben erfolgreichen Sendeversuchs erzeugen keinen zweiten Bericht.
- Popup-Erinnerungen in der geöffneten App und lokale Android-Benachrichtigungen sind wählbar. E-Mail/SMS sind ausdrücklich vorgemerkte Wünsche; es besteht noch kein Versanddienst.

## Firebase und Google-Anmeldung

Projekt: `passpilot-69f7c`. Hosting-Site: **`passpilot-app`**, nicht `passpilot-69f7c`. Website: `https://passpilot-app.web.app`.

Für E-Mail-/Passwort-Anmeldung den Anbieter unter Firebase Authentication aktivieren. Für Google ebenfalls den Google-Anbieter aktivieren und `passpilot-app.web.app` als autorisierte Domain prüfen. Die Website verwendet den offiziellen Firebase-Web-SDK mit Sitzung im Arbeitsspeicher.

Android verwendet Credential Manager. Dafür zusätzlich eine Android-App für `com.passpilot.app` im selben Firebase-Projekt registrieren, die SHA-1-/SHA-256-Fingerabdrücke des tatsächlich verwendeten Signierzertifikats hinterlegen und die passende **öffentliche Web-OAuth-Client-ID** als String `googleClientId` im Firestore-Dokument `billingConfig/public` ergänzen. Bestehende Felder dieses Dokuments beibehalten. Keine Client-Secrets in Website oder APK eintragen.

Diese Projekt-/Provider-Konfiguration wurde hier nicht live geändert. Die Android-Anmeldung und Google-Adapter kompilieren und sind vorbereitet; ein echter Google-Login benötigt diese Betreiber-Konfiguration und einen Gerätetest.

## Fehlermeldungen ansehen

Nach Veröffentlichung der Regeln in der Firebase-Konsole unter Firestore → `feedbackReports` die Meldungen ansehen. `message`, `type`, `version`, `page`, `platform` und gegebenenfalls `screenshot` stehen dort. Inhalte sind nicht öffentlich. Betreiberzugriff über Firebase-IAM; eine App-Übersicht wäre nur mit serverseitig vergebenem `passpilotAdmin`-Claim zulässig. Normale Nutzer können nur eigene Berichte lesen/löschen und keine Quoten zurücksetzen. Keine normale Nutzerrolle zum Admin machen.

Die Vorschau kann noch private sichtbare Produktangaben enthalten. Darum ist die Bildprüfung vor dem Senden erforderlich. Zugangsdaten werden nie automatisch an einen KI- oder Meldungsdienst gesendet.

## Build und Veröffentlichung

Node.js 22, JDK 17 und Android SDK 35 verwenden. Web:

```sh
npm ci
npm run prepare:vendor
npm run build:web
```

Ausgabe: `web-dist`. Firebase-Konfiguration liegt derzeit unter `firebase/`. Ohne APK-Parameter bleibt der bisherige öffentliche Download-Fallback bestehen. Für ein vollständiges Hosting-Paket mit geprüften APKs:

```sh
python scripts/package-firebase-web.py PassPilot-Firebase-Web-1.24.zip --apk PassPilot-1.24-Test.apk --apk-32 PassPilot-1.24-Test-32bit.apk
```

Dieses Paket enthält Hosting-Dateien, Regeln und beide APKs. Nach dem Entpacken im Paketordner veröffentlichen:

```sh
npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project passpilot-69f7c
```

APKs liegen dann direkt unter `/download/`; keine externe Download-Weiterleitung. `latest.json` enthält Version, Buildnummer, Größe und SHA-256 für beide Varianten. Die Android-Updateprüfung benutzt diesen Zugang; Android bestätigt und prüft die Installation weiterhin selbst.

Keine Veröffentlichung wurde während der separaten Windows-Einrichtung ausgeführt. Der lokale Quellcode-Export enthält weder APKs noch private Signierschlüssel, Premium-Codes, Nutzerbestände, Abhängigkeiten oder Build-Caches. Für installierbare Updates muss derselbe bisherige Signierschlüssel verwendet werden. Ein neuer Schlüssel kann eine bestehende Installation nicht aktualisieren.

## Grenzen

Echte Zahlungen, E-Mail/SMS-Versand, ein vollständig produktives Family-Billing und selbstlernende KI sind nicht aktiviert. Der vorbereitete KI-Backend nutzt den serverseitigen Secret-Namen `PASSPILOT_OPENAI_API_KEY`; die lokale Hilfe funktioniert weiterhin ohne dieses Secret. Cloud-Abgleich läuft bei geöffneter App mit bis zu 20 MB. Seriennummern- und Modellprüfungen sowie manuelle Kontrolle erkannter Rechnungswerte bleiben wichtig.
