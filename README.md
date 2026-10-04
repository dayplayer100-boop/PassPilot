# PassPilot 1.24 – Web und Android (Testversion)

Aktueller gemeinsamer Quellcode für die Web-App und die native Android-Hülle. Die lokalen Plus-Funktionen bleiben zum Testen offen; Zahlungen sind deaktiviert.

Der aktuelle Funktionsstand, die Einrichtung und die Grenzen stehen in [UPDATE-1.24.md](docs/UPDATE-1.24.md); die technische Prüfung in [AUDIT-1.24.md](docs/AUDIT-1.24.md). Google-Anmeldung braucht die dort beschriebene Firebase-Konfiguration. E-Mail/SMS-Versand, produktives Family-Billing und selbstlernende KI sind nicht aktiviert.

## Was enthalten ist
- komplette PassPilot-Web-App offline im APK
- lokale Datenspeicherung im Android WebView
- Kamera- und Datei-Auswahl für Fotos/PDFs
- lokale Barcode- und Etikett-Texterkennung mit optionaler Produktkatalog-Suche
- QR-Pässe, Fristen, Historie, Übergabe und Backups aus der bestehenden App
- kompakte Übersicht, Verträge/Tarife, Wartung und verschlüsselte Gerätezugänge
- lokale Verwaltung mit optionaler Konto-Anmeldung und verschlüsselter Geräte-Synchronisation

## Web bauen und Firebase aktualisieren

Node.js 22 verwenden:

```sh
npm ci
npm run prepare:vendor
npm run build:web
```

Ausgabe: `web-dist/`. Projekt: `passpilot-69f7c`; Hosting-Site: **`passpilot-app`**. Die andere Site `passpilot-69f7c` nicht überschreiben. GitHub und der Quellcode-Export enthalten `firebase.json` und `.firebaserc` im Hauptordner.

Nach dem Web-Build und mit eigener Firebase-Anmeldung:

```sh
npx --yes firebase-tools@14.18.0 deploy --only hosting,firestore:rules --project passpilot-69f7c
```

Ein GitHub-Push veröffentlicht kein Firebase. Ein Web-Build enthält keine Android-APKs; ohne APK-Paket bleibt der bisherige Download-Fallback erhalten. Für aktuelle Android-Downloads das vollständige Hosting-Paket mit den passend signierten APKs verwenden, siehe [Update-Anleitung](docs/UPDATE-1.24.md).

## Automatischer APK-Build mit GitHub Actions
1. Projekt in ein GitHub-Repository hochladen.
2. Reiter **Actions** öffnen.
3. Workflow **Build PassPilot APK** starten (oder einmal auf `main` pushen).
4. Nach erfolgreichem Build unter **Artifacts** `PassPilot-Android-APK` herunterladen.
5. Enthaltene Test-APK auf Android installieren.

Android kann beim direkten Installieren nach Erlaubnis für „Unbekannte Apps installieren“ fragen.

## Hinweis
Das erzeugte APK ist ein Debug/Test-Build. Für Google Play wird später ein eigener Release-Key und ein signierter Release-Build benötigt.

## Signatur der Test-APK
Die separat bereitgestellten Test-APKs werden mit dem bisherigen privaten Test-Schlüssel signiert. **Private Signierschlüssel sind im GitHub-Repository und im Quellcode-Export nicht enthalten.** GitHub Actions erzeugt einen normalen Debug-Build mit einem eigenen Debug-Schlüssel; dieser kann eine vorhandene, anders signierte Installation nicht aktualisieren. Für ein Update ist derselbe bisherige Signierschlüssel erforderlich. Die bisherige App nicht zur Umgehung eines Signaturfehlers deinstallieren, da lokale Daten verloren gehen könnten.

## Archiv: ältere Funktionsbeschreibungen

Die folgenden Abschnitte dokumentieren frühere Versionen. Für Version 1.24 gelten die Angaben und Grenzen der oben verlinkten Update-Anleitung.


## Verkaufen mit öffentlichem QR-Code

Im Produkt auf **Verkaufen** drücken, den öffentlichen Titel, Zustand und optionalen
Verkaufspreis eintragen, Freigaben auswählen und **Verkaufs-QR erstellen** drücken.
Die Vorschau zeigt genau die Angaben für Interessenten. Über QR-Scan können sie
[die öffentliche Leseseite](https://passpilot-product-pass.dayplayer100.chatgpt.site/)
ohne App und Anmeldung öffnen.

Private Notizen, privater Produktname, Name/Alias, Standort, Händler,
ursprünglicher Kaufpreis, Fotos und Dokumente werden nicht übernommen.
Seriennummer, Kaufdatum, Garantie, Wartungsdatum und bis zu fünf bereits öffentlich
markierte Historieneinträge sind optional. In öffentliche Texte keine persönlichen
Angaben eintragen.

Die Angaben stehen im URL-Fragment und werden von der Leseseite im Browser
angezeigt. Die Leseseite speichert keine Produktdaten. Ein bereits geteilter
QR-Code bleibt ein lesbarer Stand beim Erstellen; Verkauf beenden oder Angaben
ändern widerruft frühere Codes nicht.

Die reine öffentliche Leseseite liegt in `public-viewer/`, der gemeinsame
Renderer in `app/src/main/assets/app/public-pass.js`. Der Verkaufstest wird in
`tests/README.md` beschrieben.


## Übersicht und Kalender

Die vier Übersichtskarten öffnen Produkte, Aktionen, die gesamte Historie oder den
Kalender. Kalender ist außerdem in der unteren Navigation erreichbar.

Kaufdaten, Rückgabefristen, Garantie, nächste Wartung und Historieneinträge werden
automatisch aus den Produkten angezeigt. Wähle einen Tag oder Monat und öffne
einen Eintrag, um zum passenden Produkt zu springen. Kaufdatum und zugehöriger
Kauf-Historieneintrag werden am gleichen Tag nur einmal angezeigt.

Über **＋ Termin** kannst du private Termine mit Datum, optionaler Uhrzeit, Notiz
und Produktzuordnung speichern. Eigene Termine lassen sich bearbeiten und löschen.
Sie bleiben lokal, werden mit dem vollständigen Backup gesichert und erscheinen
nicht im Verkaufs-QR. Es gibt in dieser Testversion keine automatischen
Benachrichtigungen und keine Synchronisation mit dem Android-Systemkalender.

Der UI-Test `node tests/calendar-navigation.cjs` prüft Navigation, Datumsgrenzen,
Termine, Persistenz, Backup und die Darstellung auf schmalen Bildschirmen.


## Verkaufszettel drucken

Nach dem Erstellen des Verkaufs-QR auf **Verkaufszettel drucken** drücken.
Der Knopf ist auch direkt beim zum Verkauf markierten Produkt verfügbar.
Die Druckvorschau zeigt die freigegebenen Produktangaben mit einem QR-Code.
Über **Drucken / als PDF speichern** öffnet die Android-App den Systemdruckdialog;
im Browser wird die Vorschau gedruckt. Ein PDF-Druckziel kann dort gewählt werden.

Der Zettel und der QR-Link werden aus derselben gefilterten Verkaufsfreigabe erzeugt.
Private Notizen, Standort, Name/Alias, Original-Kaufpreis, Händler, Kalendernotizen,
Fotos und Dokumente werden nicht übernommen. Seriennummer, Kaufdatum, Garantie,
Wartung und ausgewählte öffentliche Historie erscheinen nur nach Freigabe.
QR-Scan öffnet die öffentliche Leseseite mit oder ohne installierte App.
Bereits ausgegebene Zettel und QR-Codes behalten den Stand beim Erstellen.

Android druckt in einer separaten WebView ohne JavaScript, Datei- oder Netzwerkladen.
Die Druckschnittstelle akzeptiert Aufrufe nur aus der gebündelten App. Ihr WebView-
Druckadapter bleibt bis zum Abschluss des Druckdialogs bestehen.

`node tests/sale-sheet.cjs` prüft Druckvorschau, QR-Auslesbarkeit, öffentliche Felder,
private Ausschlüsse, Browserdruck, Aufruf der Android-Druckschnittstelle und PDF.
Der echte Android-Systemdruckdialog muss zusätzlich auf einem Gerät geprüft werden.

## Live-Barcode-Scanner und Etikett-Erfassung

Bei **Produkt hinzufügen** oder **Bearbeiten** auf **Barcode live scannen** drücken.
PassPilot öffnet eine eigene Kameravorschau und liest laufend die Kamerabilder.
Es muss kein Foto aufgenommen werden. Den Kamerazugriff beim ersten Aufruf erlauben,
den Barcode ruhig vor die Kamera halten und gegebenenfalls das Licht einschalten
oder zum Fokussieren auf die Vorschau tippen. Ein stabil erkannter Code wird
automatisch übernommen; der Scanner schließt sich und startet die freigegebene
EAN/UPC-Katalogsuche. Kamera-Frames werden weder gespeichert noch hochgeladen.
Abbrechen und der Android-Zurück-Knopf schließen den Scanner. Kamera-Fehler oder
abgelehnte Berechtigungen zeigen eine Erklärung mit erneuter Freigabe oder den
App-Einstellungen. Rotation erhält das offene Produktformular.

**Etikett / Foto lesen** bleibt eine separate Funktion für Marke, Modell und S/N
auf einem Etikett. Ein Foto aufnehmen oder ein vorhandenes Bild auswählen.
Die Android-App erkennt Barcodes und Text mit im APK enthaltenen ML-Kit-Modellen
auf dem Gerät. Erkannte Marke, Modell, Seriennummer, Produktbezeichnung und eine
passende Kategorie werden vorgefüllt. Bereits selbst ausgefüllte Felder bleiben
erhalten. Erkannte Angaben bitte vor dem Speichern prüfen.

EAN/UPC identifiziert einen Produkttyp, nicht die Seriennummer des einzelnen Geräts.
GS1-Codes können eine ausdrücklich codierte Seriennummer enthalten. Bei mehreren
EAN/UPC-Codes wird zunächst eine Auswahl angezeigt. Kaufdaten und Kaufpreise werden
nur aus ausdrücklich so beschrifteten Etikettangaben übernommen; Herstellungsdatum,
allgemeine Preisangaben und eine Garantiedauer werden nicht zu Kaufdaten umgedeutet.

**Produktinfos online ergänzen** ist abschaltbar. Diese Suche überträgt ausschließlich
die EAN/UPC an Go-UPC, Barcode Lookup, UPCitemdb und die offenen Facts-Kataloge
(Open Products Facts, Open Food Facts und Open Beauty Facts). ISBN-Codes werden
zusätzlich in Open Library gesucht. Die Abfragen laufen parallel und ein
passender Treffer wird sofort übernommen; weitere Quellen ergänzen fehlende Felder.
Katalogantworten müssen dieselbe gültige EAN/UPC enthalten. Widersprüchliche Marken
oder Modelle werden nicht kombiniert. HTML-Seiten werden nur als Text geparst;
Skripte, Bilder, Tracker und Verkaufsangebote werden nicht geladen. Fotos, Etiketttext, private Produktangaben und Seriennummern werden
nicht übertragen. Die Kataloge können zusätzliche Marke, Modell, Bezeichnung und
Kategorie liefern. Abdeckung, Internetzugang und öffentliche API-Limits bestimmen,
ob ein Treffer verfügbar ist; es gibt keine vollständige Datenbank aller Produkte.
Bei fehlendem Treffer können **Produktinfos suchen** und **Im Internet suchen**
verwendet werden. Die Websuche öffnet den normalen Browser mit ausschließlich der
EAN/UPC als Suchbegriff; sie übernimmt keine erfundenen Ergebnisse in das Formular.
Hersteller-/Lagercodes ohne gültige EAN/UPC bleiben lokal im Barcode-Feld, werden
nicht zu Seriennummern umgedeutet und lösen keine Katalog- oder Websuche aus.

Marke und eindeutige Modellbezeichnungen können auch aus einem gefundenen
Katalogtitel erkannt werden. Technische Größen wie 256GB, 5GHz oder 500g werden
nicht als Modell eingetragen. Ohne passende Kategorie wird „Sonstiges“ gewählt.
Ein zusätzlicher Knopf **Produkt jetzt anlegen** erlaubt das Speichern direkt nach
dem Treffer; Kaufdaten, Preis und Seriennummer können später ergänzt werden.

Erfolgreiche Kataloginfos werden getrennt von privaten Produkteingaben lokal
für höchstens 30 Tage und 100 Produkte gemerkt. Wiederholte Scans desselben
EAN/UPC-Typs können diese Infos ohne erneuten Netzwerkaufruf übernehmen.
**Produktinfos suchen** aktualisiert den Katalogtreffer; **App komplett zurücksetzen**
löscht auch diese gespeicherten Kataloginfos. Eigene Namen, Notizen, Kaufpreise,
Seriennummern und Rohtext werden nicht im Katalogspeicher abgelegt.

Fehlende wichtige Angaben erhalten direkt am Feld ein **⚠ Noch nicht angegeben**.
Nach dem Speichern zeigt die Produktseite die Lücken und **Angaben ergänzen**.
Ein unvollständiges Produkt kann gespeichert und später ergänzt werden. Standort,
private Notizen und produktabhängige Fristen sind freiwillig.

Das Scan-Foto und der erkannte Rohtext werden nicht als Produktfoto oder Dokument
gespeichert. Der Text ist nur während der Erfassung zur Kontrolle sichtbar. Die
ausgewählten Produktfelder und der Barcode werden lokal gespeichert und durch das
vollständige Backup gesichert. Der Barcode und der Rohtext erscheinen nicht im
Verkaufs-QR oder Verkaufszettel. Für ein dauerhaftes Produktfoto das separate
Feld **Produktfoto** verwenden.

Im normalen Browser öffnet der Live-Scan eine laufende Video-Kamera über
`getUserMedia`, sofern Kamerazugriff und `BarcodeDetector` unterstützt werden.
Die Kamera wird bei Erfolg, Abbruch, Schließen des Formulars oder Verlassen der
Seite beendet. Der Browser-Live-Scan umfasst keine Etikett-Texterkennung. Die manuelle Übernahme von Barcode oder Etiketttext steht
als Alternative bereit. Vollständige Fotoerkennung erfolgt in der Android-App.

`node tests/product-scan.cjs` prüft Parsing und den Erfassungsdialog mit simulierten
Erkennungsergebnissen. `node tests/live-scanner.cjs` prüft die Live-Scan-Schnittstelle,
automatische Katalogübernahme, separate Fotofunktion, Websuche, Berechtigungsfehler
und Kamera-Lebensdauer mit einem simulierten laufenden Browser-Video. Kamera-Auswahl und echte Barcode-/ML-Kit-Texterkennung müssen
zusätzlich auf einem Android-Gerät mit echten Etiketten geprüft werden.

## Geräteetiketten live lesen ab 1.9

**Produkt hinzufügen → Etikett live lesen** öffnet eine laufende Kamera mit lokaler
ML-Kit-Texterkennung. Typenschild nah und ruhig halten, den erkannten Text prüfen
und **Angaben übernehmen** tippen. Es wird kein Foto aufgenommen oder gespeichert.
Alternativ ein vorhandenes Foto über **Etikett / Foto lesen** auswählen.

Marke, Produktname, Modellnummer, Seriennummer und Produkt-/Artikelnummer werden
aus lesbaren, ausdrücklich zugeordneten Angaben übernommen. Mehrsprachige
Beschriftungen wie `MODEL NUMBER [型号/型號]` und mehrzeilige Werte sind unterstützt.
Produkt-/Artikelnummer bleibt ein separates lokales Feld; sie wird nicht mit
Seriennummer oder EAN verwechselt und erscheint nicht automatisch im öffentlichen
QR-Pass. Ein Typenschild ohne Modellnummer kann keine sichere Modellangabe liefern.
Batterietypen, CE-Kennzeichen, Spannungen und Herstelleradressen werden nicht zu
Modellen oder persönlichen Kaufangaben umgedeutet.

Versandetiketten, z. B. mit GLS, werden abgewiesen. Erkannte Paketdaten werden
weder in Produkte übernommen noch online gesucht. Ausdrücklich als S/N erkannte
Codes bleiben lokal, auch wenn ihre Ziffern zufällig eine gültige GTIN bilden.
Der Live-Etikett-Scanner verwendet die vorhandenen Kamera-Berechtigungen und
beendet seine Kamera mit Übernehmen, Abbrechen oder Zurück. Eine echte
Android-Kameraprüfung ist weiterhin erforderlich.

## Anleitungen ab 1.10

Im Produkt unter **Anleitungen & Hilfe** mit gültiger EAN/UPC oder Marke und Modell
nach einer PDF bzw. Herstellerseite suchen. Die Suche öffnet den externen Browser.
Den passenden Treffer prüfen und als HTTPS-Link speichern; Links lassen sich
öffnen, bearbeiten und löschen. Es werden keine ungeprüften PDF-Adressen erraten.
Seriennummern, private Produktnamen und Notizen werden nicht in die Suche übernommen.
Über **PDF lokal speichern** kann eine heruntergeladene Anleitung offline hinterlegt werden.
Links und Dateien bleiben standardmäßig privat, sind im Backup enthalten und werden
nur mit ausdrücklicher Freigabe in das digitale Übergabepaket aufgenommen. Sie
erscheinen nicht im öffentlichen Verkaufs-QR.

`node tests/manuals.cjs` prüft Suche, URL-Prüfung, Speicherung, Bearbeitung, Löschung,
Backup/Übergabe, QR-Ausschlüsse, lokale PDF-Speicherung und kleine Bildschirme.
Die externe Browser-/PDF-Öffnung muss zusätzlich auf Android geprüft werden.

## Praktische Abläufe ab 1.11

- Neue Produkte: Name oder Modell genügt, Kategorie zunächst Sonstiges. Weitere Angaben im Formular einklappen; automatische Scans können die Kategorie ersetzen, eigene Kategorie-Auswahl bleibt erhalten.
- Volltextsuche inklusive Händler/Notizen/Dateinamen, Kategorie/Status/Standort/Tag-Filter und freie Tags. Kein Inhaltssuche-Index innerhalb PDFs. Verkauftes Produkt archivieren und wieder aktivieren.
- Historie ändern/löschen, Kosten und Währung sowie optionale Reparaturdetails/Belegverknüpfung. Kaufdatum auf Wunsch gleichzeitig ändern; automatisch erzeugte Kauf-Historie folgt korrigierten Produkt-Kaufdaten.
- Import vergleicht IDs und Seriennummern. Überspringen (Standard), Ersetzen, Ergänzen ohne Überschreiben eigener Angaben oder Kopie. Dateischreibvorgänge sind eine gemeinsame IndexedDB-Transaktion. Import ist kein vollständiger Ersatz des gesamten Bestands.
- Digitale Übergabe mit standardmäßig ausgeschlossenen Namen, Standort, Seriennummer, Foto, Artikelnummer/Barcode. Nur ausdrückliche Freigaben. QR-Schnappschüsse zeigen Datum, sind weiterhin nicht widerrufbar.
- Beleg-Assistent mit lokalem ML-Kit-OCR für Bild oder erste drei Seiten einer PDF-Rechnung. Datum, Händler, Summe und ausdrücklich zugeordnete Kennzeichnungen/Rechnungsnummer vorschlagen. Mehrdeutige Datums-/Summenangaben bleiben offen. Produktpreis wird nicht automatisch ausgewählt. Belegdatei optional lokal sichern.
- Bilddokumente werden bis 1920px längster Seite komprimiert; Produktfoto bis 900px. Speicherübersicht zeigt tatsächliche gespeicherte Medien. Keine automatische Bereinigung alter Unterlagen.
- Bis 20 Bilder in gewählter Reihenfolge zu PDF, integrierter seitenweiser Android-PDF-Viewer. Keine digitale Signatur, kein Perspektivenscanner, keine passwortgeschützten PDFs.
- Inventar mit Bildern/Kaufwerten/Seriennummern, CSV mit Schutz gegen Tabellen-Formeln, ICS-Export. Android-Dateiexporte verwenden Storage Access Framework. PDF-Ausgaben verwenden Systemdruckdialog.
- Verkaufstext aus freigegebenen Verkaufsangaben; einfacher Privatvertrag-Entwurf mit leeren Unterschriftsfeldern; Reklamations-PDF und E-Mail-Entwurf. Keine automatische Nachricht wird versendet. Keine automatischen Rechts-/Garantie-Zusagen.
- Gerätesperre optional: Biometrie oder Geräte-PIN/Passwort, Sperre beim Verlassen der App. Kein eigenes PassPilot-PIN-System, keine zugesicherte Datenbankverschlüsselung.
- Lokale Android-Fristhinweise ungefähr täglich (Batterie-/Herstellerregeln können verzögern). Vorlauf je Produkt wählbar, keine sekundengenauen Alarme. Sperrbildschirm nur allgemeiner Hinweis.
- Automatische lokale Sicherung nach Änderungen vorbereiten und regelmäßig in gewählten SAF-Ordner schreiben. Standard unverschlüsseltes JSON, die neuesten drei Sicherungen behalten; ältere automatisch erzeugte Versionen erst nach erfolgreichem Schreiben entfernen. Der gewählte Ordner auf demselben Handy schützt nicht vor Geräteverlust. Manuell passwortverschlüsselte, geprüfte Backups: AES-GCM 256, PBKDF2 SHA256 250000, zufälliger Salt/IV. Passwort nicht gespeichert, keine Wiederherstellung ohne Passwort.
- Hersteller-Anleitungssuche mit Modellabgleich. Deutsche Sony WH-1000XM5-Hilfe direkt erfolgreich online überprüft; sonst Suchtreffer offizieller Herstellerdomains mit Modellzuordnung. Keine universelle Trefferquote, keine erfundene PDF. Offline-PDF-Download explizit durch Nutzer, maximal 20MB. Linkprüfung manuell oder nach ausdrücklicher Freigabe bis fünf Links pro Start/frühestens sieben Tage; 404/410 als fehlend, Offline/403 als unklar.
- Wartungspläne nach Monaten/km/Stunden, Zählerstand manuell. Zubehör-Verknüpfung, Produktakte-Grundangaben und Kostensummen je Währung. Selbst eingegebene Materialien/Herkunft/Reparatur/Ersatzteile/Recycling; keine Verifizierung oder offizieller EU-DPP. NFC-Schreiben benötigt beschreibbaren Tag ausreichender Größe; lange Offline-Pässe können kleine Tags überschreiten.

## Optionales Firebase

`firebase/README.md` beschreibt Einrichtung im Eigentümer-Konto. Kein echtes Projekt ist durch die lokale Entwicklung automatisch angelegt. E-Mail-/Passwort-Anmeldung mit E-Mail-Bestätigung, Sitzung nur im Arbeitsspeicher. Firestore verwaltet dynamische öffentliche Pässe, Finder-Nachrichten, bestätigte Metadaten-/Link-Übergaben und ausdrücklich ausgewählte Familien-Konto-IDs. Große Fotos/PDFs bleiben lokal; keine automatische Synchronisation kompletter Akten. Nur öffentliche Passdaten gelangen in öffentliche Datensätze. Firestore-Regeln mit lokalem Emulator geprüft. Die Funktionen müssen nach Projekt-Einrichtung auch mit echten Konten getestet werden. Spark-Kontingente können begrenzen; kein automatischer Wechsel zu Blaze, keine Cloud-Functions-/Storage-Abhängigkeit.

Die Android-Gerätetests für Kamera, OCR, App-Sperre, PDF-Viewer, SAF-Ordner, Systembenachrichtigungen und NFC sind zusätzlich notwendig. Automatische Browser-/Native-Tests ersetzen sie nicht.
