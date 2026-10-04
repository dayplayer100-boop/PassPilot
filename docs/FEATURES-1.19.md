# PassPilot 1.19 – Erfassung, Kalender und Korrekturen

## Enthalten

- Alle Änderungen aus 1.18: dauerhafte Asset-ID, getrennte Modell-/Exemplaridentität, QR-Tag, private Verleihnotiz, Duplikatprüfung, geschütztes Online-Protokoll und beidseitige registrierte Übergabe.
- Diebstahlmeldung nur bei einer ausdrücklich als individuell bestätigten Seriennummer. Bestätigung gilt genau für diese Nummer; Änderung, EAN oder Artikelnummer hebt sie auf. Online ist zusätzlich eine reservierte Herstellerkennung erforderlich. Selbstbestätigung ist kein unabhängiger Eigentumsnachweis.
- Rechnungspositionen über mehrere Textzeilen erkennen: Produktname, bekannte Marke, Modell und Artikelnummer. Garantie-Zusatzleistungen und Versand nicht als Produkt behandeln. Einzelpreis getrennt vom Rechnungs-Gesamtbetrag.
- Produktangaben sofort unter dem Beleg bearbeiten; Kamera, Galerie und PDF-Auswahl bleiben getrennt. „Prüfen & speichern“ überspringt optionale Schritte.
- Originalkarton und Kaufart optional erfassen; im privaten PDF-/CSV-Inventar ausgeben.
- Verkauf mit vorgeschlagener Beschreibung. Daten-QR und Link ohne Konto; Fotos und aktualisierbarer Online-Link weiterhin optional mit bestätigtem Konto. Kontofreie Links sind Schnappschüsse ohne Fotos und lassen sich nicht zurückrufen.
- Kalender: Tag öffnet ein Fenster; Monatskalender, Tagesansicht oder chronologische Monatsliste. Filter für Käufe, eigene Termine sowie Fristen/Erinnerungen.
- App-Sperre und Erinnerungen als einzelne Status-Schalter. Anzeige wird erst nach Antwort der Android-App aktualisiert.
- Android-Zoom deaktiviert; Rücksprung vom lokalen App-Verzeichnis auf index.html korrigiert. Lange Produkttitel umbrechen innerhalb der Karte. Browser-Zoom bleibt aus Gründen der Zugänglichkeit möglich.
- Direkter APK-Download unter https://passpilot-app.web.app/download/PassPilot-Test.apk. Firebase leitet direkt zur APK-Datei weiter, ohne externe Download-Seite zu öffnen.
- Bei vollem lokalen Speicher bleibt der Bestand beim Start sichtbar. Vor Registrierung muss die Asset-ID erfolgreich lokal gespeichert sein.

## Vorbereitet, noch ohne bezahlte Dienste

- Monatsabos: kostenlos bis 7; bis 15 für 1 €/Monat; bis 50 für 3 €; bis 100 für 5 €; darüber 7 € für unbegrenzt. Zahlungsbuttons und Begrenzung in der Testversion deaktiviert. Kein automatischer Einzug, keine Zahlungsdaten.
- Signierte Freischaltcodes mit Ablaufdatum unter Einstellungen → Upgrades. Verifikation mit ECDSA P-256/SHA-256. Private Ausstellerdatei liegt getrennt vom Repository und wird nicht veröffentlicht. Kein Ersatz für später serverseitig geprüfte Zahlungsberechtigungen; Offline-Gerätezeit ist nicht vertrauenswürdig.
- Geprüfte Modelldaten können aus `modelFacts` geladen werden: genau Marke/Modell, freigegebener Datensatz, HTTPS-Quelle und Prüfdatum erforderlich. Spezifikationen besitzen eigene Quellen; Preise sind beobachtete Angebote, keine zeitlosen Garantien.
- Nutzer können Rezensionen mit bestätigtem Konto zur Prüfung einreichen. `modelReviewSubmissions` bleibt privat; Clients können weder freigeben noch Fakten schreiben. Öffentliche Daten muss ein verantwortlicher Moderator pflegen.
- Es ist noch kein automatischer Webrecherche-/Preisprüfungsdienst und kein aktiver Moderationsbetrieb angeschlossen. Ohne freigegebene Daten werden keine Preise/Bewertungen/technischen Werte behauptet.
- Die schwebende lokale Hilfe erklärt diese Abläufe und liest Bilder/PDFs lokal. Online-KI und Dokument-KI bleiben vorbereitet und deaktiviert. Kein selbstständig trainierendes Modell, kein heimliches Lernen aus Rechnungen, keine bezahlten Firebase Functions aktiviert.

## Prüfung und Grenzen

- Browser-Regressionen: reale lokale OCR und Barcode-Erkennung, PDF-Texte, Medien entfernen/ersetzen, private Anhänge, Historie/Kaufpreis, verschlüsselte Synchronisation, Verkauf und responsive Kalendernavigation.
- Emulator: eindeutige Registrierung, nur deklarierte individuelle Kennung für Diebstahl, unveränderliche Ereignisse, Rechtewechsel erst nach beidseitiger Bestätigung, keine öffentlichen privaten Rezensionen und keine Freigabe durch Nutzer.
- OTTO-Textbeispiel: Rowenta Dual Force / RH6737, Artikel 5116651863, Einzelpreis 137,05 €, Gesamt 176,99 €, Datum 13.08.2026. Zusatzgarantie 34,99 € und Versand 4,95 € bleiben vom Artikelpreis getrennt. Echtes unscharfes Screenshot-OCR bleibt unzuverlässig; bevorzugt Original-PDF oder scharfes Belegfoto verwenden.
- Android-Build und Lint; passende APKs für 64/32 Bit mit bisherigem Test-Signierer. Keine reale Handykamera-/NFC-/Biometrieprüfung in dieser Umgebung.
- Die Hauptwebsite muss im eigenen Firebase-Projekt noch mit Hosting und den neuen Regeln deployt werden.
