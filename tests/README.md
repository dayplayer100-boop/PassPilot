# Verkaufs-QR testen

Voraussetzungen: Node.js, Playwright mit Chromium und jsqr.

```sh
cd tests
npm install --save-dev playwright jsqr
npx playwright install chromium --only-shell
node sale-privacy.cjs
```

Der Test startet seine lokale Leseseite selbst. Er prüft den Verkaufsdialog, die
Auslesbarkeit des QR-Bilds, private Feld-Ausschlüsse, optionale Freigaben,
Persistenz, Käuferansicht, URL-Fragment und ungültige bzw. manipulierte Inhalte.
Es werden ausschließlich Testdaten verwendet.

## Übersicht und Kalender

`node calendar-navigation.cjs` prüft Übersichtskarten, komplette Historie,
Kalenderdaten, Monatswechsel, Schaltjahr, eigene Termine, Neustart-Persistenz,
Backup-Import mit neuen Produkt-IDs und die Navigation bei 320–1024 Pixeln.

## Verkaufszettel

`node sale-sheet.cjs` prüft öffentliches Druckdokument, QR-Auslesbarkeit,
Datenschutz-Ausschlüsse, optionale Freigaben, Druckvorschau, Browser-Druckaufruf,
Android-Brückenaufruf, PDF und Behandlung von HTML in öffentlichen Texten.

## Produkt erfassen und scannen

`node product-scan.cjs` prüft Etikett-Felder, GTIN-Prüfziffern, UPC-E, GS1,
simulierte Android-Ergebnisse, optionale Katalog-Ergänzung, erlaubte Katalogfelder,
Offline-Modus, Abbruch und fehlende Treffer. Der Test prüft außerdem die Auswahl
mehrerer Codes, Erhalt eigener Eingaben, Warnzeichen für fehlende Felder,
Speichern/Neustart/Bearbeiten, verspätete Antworten, Währungen, QR-Ausschlüsse und
HTML im Etiketttext. Es werden keine echten Kataloganfragen gestellt.

Der Browser-Test ersetzt keinen Android-Gerätetest: **Produkt hinzufügen →
Barcode / Etikett scannen** mit Kamerafoto und Galeriebild ausprobieren. EAN/UPC,
ein Etikett mit Marke/Modell/S/N, undeutliche Bilder, Scan-Abbruch und den Flugmodus
prüfen. Der Offline-Scan soll erkanntes Etiketttextwissen übernehmen; offene
Kaufangaben bleiben markiert. Kein Rohtext oder Scan-Foto darf im Verkaufs-QR landen.

## Live-Barcode-Scanner ab 1.7

`node live-scanner.cjs` prüft, dass der Hauptknopf die native Live-Schnittstelle
aufruft und keine Fotoauswahl öffnet. Er prüft Barcode-Übernahme, automatischen
Katalogaufruf, erlaubte Felder, eigene Eingaben, getrennte Foto-OCR, Websuche nur
über gültige EAN/UPC und verspätete Antworten bei geschlossenem Formular.
Ein laufender Canvas-Videostream simuliert die Browser-Kamera; geprüft werden
kontinuierliche Erkennung sowie Stoppen bei Erfolg, Abbruch, Schließen und
verspäteter Kamera-Freigabe. Echte CameraX/ML-Kit-Kamerabilder werden dadurch nicht
getestet.

Android-Gerätetest: Live-Scanner öffnen, Kamerazugriff erlauben und EAN/UPC ruhig
vor die Kamera halten. Automatische Rückkehr und Produktinfo-Suche prüfen.
Licht, Fokus per Antippen, Rotation, Rücktaste, Abbruch, verweigerte Berechtigung,
Freigabe über Einstellungen, Flugmodus und mehrere Codes ausprobieren. Das Gerät
soll nach Schließen des Scanners keinen aktiven Kamerazugriff anzeigen.

## Automatische Katalogangaben ab 1.8

`node catalog-autofill.cjs` prüft eine Erfassung nur anhand des Barcodes:
Produktname, Marke, Modell, Kategorie, direktes Speichern trotz offener Kaufangaben,
Erhalt eigener Eingaben und ausschließlich Katalogmetadaten im lokalen Cache.
Wiederholte/aufgefüllte Codes, Aktualisieren, abgeschaltete Online-Ergänzung,
verspätete oder falsche Antwortcodes, abgelaufener/beschädigter Cache, erneuter
Scan eines anderen Produkts, Browser-Katalogsuche und vollständiges Zurücksetzen
werden ebenfalls geprüft. API-Antworten sind in diesen Browser-Tests simuliert.

`./gradlew :app:testDebugUnitTest` prüft die native Katalogsuche: HTML-Metadaten
von real abgerufenen Sony-Produktseiten (Go-UPC / Barcode Lookup, EAN
4548736132580), geprüfte Code-Zuordnung, UPC/Facts/ISBN-JSON, Feld-Ergänzung ohne
widersprüchliche Produkte, Abfragelimits, parallele Teilergebnisse und Abbruch.
Die Fixtures enthalten nur öffentliche Produktmetadaten, keine ausführbaren
Webseiten oder privaten Daten. Diese Tests benötigen keine Netzwerkanfragen.

Zusätzlich wurde der native Katalogcode mit echten Online-Antworten für
4548736132580 (Sony WH-1000XM5), 3017620422003 (Nutella) und 9783551551672
(Harry Potter und der Stein der Weisen) ausgeführt. Verfügbarkeit und Angaben
öffentlicher Kataloge können sich ändern. Der echte Kameratest auf Android
bleibt erforderlich.

## Geräteetiketten ab 1.9

`node device-labels.cjs` prüft die Live-Etikett-Schnittstelle, die anhand der
bereitgestellten Etiketten übertragenen Razer-/Casio-Textlayouts, getrennte Modell-,
Serien- und Artikelnummern, mehrsprachige/mehrzeilige Schlüssel, Speichern/Neustart,
QR-Ausschlüsse und Versandetiketten. Seriennummern und Versandangaben im Test sind
synthetisch. Batterie-/CE-Zeichen werden nicht als Modell interpretiert. Auch
GTIN-kompatible S/N-Ziffern dürfen keine Kataloganfrage auslösen. Die OCR-Rückgaben
sind simuliert; dies ersetzt keine ML-Kit-Erkennung auf einem Android-Gerät.

## 1.11

`node improvements.cjs`: Schnellerfassung, Historie-Korrektur/-Löschung, Tags/Suche,
Schaltjahr-Frist, sensible Übergabe-Opt-ins, Duplikatentscheidungen, Beleg-Vorschläge
mit bewusst nicht übernommenem Gesamtpreis, lokale Belegdatei, Anleitungstreffer,
QR-Zeitstand, CSV-/ICS-Escaping und AES-GCM-Backup-Rundlauf.
`node firebase-flow.cjs`: öffentliche Projekt-Konfiguration, nicht gespeicherte
Zugangsdaten, gefilterte Passdaten, Ablauf/Deaktivierung mit simuliertem REST.
Firebase-Regeln: `firebase emulators:exec --only firestore --project demo-passpilot
'node rules-test.cjs'` im Ordner firebase (benötigt firebase/rules-unit-testing SDK).
Native ManualFinderTest: Hersteller-Domain, HTTPS und strenge Modell-Zuordnung.
Echte Android-Hardware und das vom Besitzer eingerichtete Firebase-Projekt separat testen.

## Änderungen 1.15

`node tests/recognition-sharing.cjs` (aus dem Projektordner, nach `node scripts/build-web.cjs`) liest einen echten PDF-Textlayer im Helfer und prüft MIME-Erkennung, Datum-/Betrag-/Artikelvorschläge, echten OCR-Text trotz gefundenem Barcode, persistente Fotos, öffentliche Foto-Ansicht ohne Konto, QR-Auslesbarkeit, Übergabe per Link, E-Mail-Entwurf, serverseitige Versionsprüfung vor Import sowie erneuten Import nach lokalem Schreibfehler. Mobile Stapelreihenfolge wird mit elementFromPoint bei 320×640, 390×844 und 390×400 geprüft.

`node tests/document-backend.cjs` testet den deaktivierten Dokument-KI-Entwurf ausschließlich mit simuliertem Anbieter. Keine kostenpflichtigen API-Aufrufe. `firebase/rules-test.cjs` prüft zusätzlich foto-große Freigaben, Größenbegrenzung und bestätigte Empfänger-E-Mail mit Groß-/Kleinschreibung. Firebase-Zugriffe in Browsertests sind simuliert; die Regeln werden gegen den lokalen Emulator geprüft.

## Produktübersicht und Kaufpreis 1.16

`node tests/lifecycle.cjs` prüft die Gesamtübersicht mit Foto, komplette Historie, gezieltes Bearbeiten mit Rückkehr, Kaufpreis-/Datumsänderungen über beide Wege, Nullpreis, Neustart, nachträgliches Kauf-Ereignis, keine Doppelzählung, sichere ältere Datenübernahme und die ausdrückliche Rechnungsbetrag-Übernahme. Zuerst `node scripts/build-web.cjs` ausführen.

Identitätsregistrierung 1.18: `tests/identity-registry.cjs` gegen den Firestore-Emulator prüft den echten REST-Client mit zwei Konten, Live-Tag-Status und Datenminimierung. `firebase/identity-rules-test.cjs` prüft die atomaren Registrierungs-/Protokoll-Regeln, gleichzeitige Seriennummer-Reservierung, Tag-Wiederverwendung, abgelaufene Übergaben und Bestätigung durch beide Seiten.
