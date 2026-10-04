# PassPilot 1.12 Test – Funktionsstand

Der Ablauf zum Hinzufügen lautet **Code → Rechnung → Produktfoto → Prüfen → Speichern**. Alle drei Bildschritte besitzen eigene Kamera- und Galerieknöpfe. Jeder Schritt ist überspringbar. „Direkt manuell / schnell erfassen“ braucht nur Name oder Modell. Bilder bleiben lokal; die Rechnung wird privat gespeichert. Die Galerie-Bildauswahl ist getrennt von der Kamera, nicht durch ein erzwungenes `capture`-Attribut ersetzt.

| Bereich | Android-App | Firebase-Web-Version |
| --- | --- | --- |
| Barcode live | ML Kit mit Kamera | BarcodeDetector oder ZXing; Kamerazugriff erforderlich |
| Code / Etikett aus Foto | Barcode- und Texterkennung mit ML Kit | ZXing/BarcodeDetector, bei Bedarf lokale Tesseract-Texterkennung |
| Etiketttext live | Vorhanden | Foto-Texterkennung; kein kontinuierlicher Text-Live-Scan |
| Produktkatalog | EAN/UPC-Suche, Status, 30-Tage-Metadaten-Cache | Vorhanden; Treffer hängen vom Katalog ab |
| Kassenbon / Rechnung | Bild-OCR und erste drei PDF-Seiten | Lokale Bild-OCR; Text oder OCR der ersten drei PDF-Seiten |
| OCR-Vorschläge | Datum, Händler, Betrag, Rechnungsnummer; ausdrückliche Produkt-/Artikel-/Serienangaben | Vorhanden |
| Preis aus Bon | Erst nach ausdrücklicher Prüfung/Übernahme | Vorhanden |
| Produktfoto | Kamera oder Galerie; komprimiert | Kamera oder Galerie; komprimiert |
| Mehrseitiges PDF | Bis 20 Kamera-/Galeriebilder, Reihenfolge ändern | Vorhanden; PDF wird lokal erzeugt |
| PDF-Viewer | Lokal, blättern; Screenshot-Schutz | Lokal, blättern, Zoom, Seitentext, Download |
| Anleitung | Automatische Hersteller-Suche mit Modellabgleich; Ergebnis öffnen / speichern | Hinterlegte exakte Modelltreffer; Hersteller-/Modellsuche als Ausweichweg |
| Automatische Anleitungssuche nach Erfassung | Optional, Produkt wird vorher gespeichert | Optional; keine Garantie für einen verfügbaren PDF-Treffer |
| Link-Prüfung | Manuell; wöchentlich bis 5 Links pro Start nach Freigabe | Ebenso; Browser-Zugriffsschutz führt zu „unklar“, nicht zu „Link kaputt“ |
| Historie | Bearbeiten, löschen; Reparaturfelder, Werkstatt, Beleg, Kosten | Vorhanden |
| Suche / Filter / Tags | Name, Modell, Marke, Seriennummer, EAN, Händler, Notizen, Dokumentnamen; Kategorien/Standorte/Status/Tags | Vorhanden |
| Wartung | Monate, km, Betriebsstunden; Zähler manuell erfassen | Vorhanden |
| Gesamtkosten | Kauf + erfasste Historienkosten, nach Währung getrennt | Vorhanden |
| Fristen | Berechnung mit gewählter Dauer laut Unterlagen; Kalender | Vorhanden |
| System-Erinnerungen | Optional, ungefähr tägliche Prüfung; Vorlauf 30/14/7/3/1/0 Tage | Produktkalender / ICS-Export; keine zuverlässigen lokalen Browser-Alarme |
| Kalenderdatei | Alle Termine oder zukünftige Fristen eines Produkts | Vorhanden |
| Backups | Normal / passwortverschlüsselt; Duplikatauswahl; Import mit Dateiprüfung | Vorhanden, als Download |
| Automatische Sicherung | Gewählter Android-Ordner; neueste drei Versionen, unverschlüsselt | Nicht vorhanden; manuelle Download-Sicherung |
| Speicher | Mediengröße, automatische Bildverkleinerung, Backup-Erinnerung | Vorhanden |
| App-Sperre | Optional Geräte-PIN / unterstützte Biometrie | Gerätesperre des Browsers/Systems; keine eigene biometrische Web-App-Sperre |
| Inventar / Verkauf | PDF/Drucken, CSV, Verkaufstext, Privatvertragsentwurf | Vorhanden |
| Reklamation | Geführter Text, PDF/Drucken, E-Mail-Entwurf, Historie | Vorhanden |
| QR / Verkaufszettel | Private Daten standardmäßig ausgeschlossen; Freigabecheck, Stand-Datum | Vorhanden |
| Nachweisübersicht im Verkauf | Freiwillig: Belege/Anleitung vorhanden, Seriennummer erfasst, Wartungs-/Reparaturanzahl | Vorhanden; keine Dateien, Preise oder privaten Texte |
| Dynamischer Pass | Firebase, Ablaufdatum, aktualisieren/deaktivieren | Vorhanden |
| Übergabe | Dateipaket mit ausgewählten Dateien; Online-Code mit Metadaten und freigegebenen Links | Vorhanden; geführter Einstieg aus dem QR-Link |
| Übergabe-QR scannen | Führt zur Anmeldung / Bestätigung der Übernahme | Führt zur Anmeldung / Bestätigung der Übernahme |
| Übergabeverlauf | QR-/Export-/bestätigte Übernahme protokolliert; verkauft archivieren | Vorhanden |
| Verloren / Finder | Öffentliches Profil; Nachricht von bestätigtem Konto, Besitzer liest sie manuell | Vorhanden |
| Familienfreigabe | Ausgewählte bestätigte Konto-IDs; freigegebene Metadaten | Vorhanden; Momentaufnahme, keine vollständige Synchronisation |
| Produktbeziehungen | Hauptprodukt und Zubehör, eigene Seriennummern/Dokumente | Vorhanden |
| Material / Reparatur / Recycling | Freie strukturierte Produktangaben | Vorhanden; kein zertifizierter EU-Produktpass |
| NFC | HTTPS-Produktpass auf beschreibbaren Tag schreiben | Nicht vorhanden |

## Grenzen, die weiterhin bestehen

- Ein Barcode enthält meist keine vollständige Produktbeschreibung. Für unbekannte Katalogcodes bleiben Felder leer. Fehlende Modelle und Garantiebedingungen werden nicht erfunden.
- Alle Hersteller-Anleitungen automatisch zu finden ist nicht verlässlich möglich. Die Android-Suche bevorzugt bekannte Hersteller-Domains; im Web führen fehlende Treffer zur gezielten Hersteller-/Modellsuche. Ein PDF-Titel ist kein vollständiger Inhaltsnachweis. Nutzer prüfen Modell und Sprache vor der Übernahme.
- Browser-OCR verarbeitet Bilder auf dem Gerät. Erkennungsdateien sind Teil der eigenen Hosting-Dateien und werden bei Bedarf geladen. Erster Start benötigt Internet; später helfen lokale Caches. Keine Garantie für einen komplett vorbereiteten Offline-Cache bei jedem Browser.
- Kamera-Dokumente werden verkleinert und zu PDF zusammengefügt. Automatischer Randzuschnitt / Perspektivenkorrektur und handschriftliche Unterschriften sind nicht integriert.
- Native Kameras, Biometrie, NFC und System-Alarme benötigen einen Test auf einem echten Handy. Build-, Browser-, Sicherheits- und Schnittstellentests ersetzen das nicht.
- Cloud-Dateispeicher, vollständige Inventarsynchronisation zwischen Geräten, automatische Finder-E-Mails/Push-Weiterleitung und ein gemeinsamer editierbarer Haushaltsbestand sind nicht implementiert. Online-Übergaben enthalten keine großen Fotos/PDFs. Diese bleiben in Dateipaketen oder auf dem eigenen Gerät.
- Ein normaler Eigentums-Übernahmecode bestätigt einen technischen Import, keinen rechtlichen Eigentumsnachweis. Seriennummer „erfasst“ bedeutet nicht unabhängig verifiziert. Der Vertrag ist ein druckbarer Entwurf, keine integrierte elektronische Signatur.
- Firebase Spark wird ohne Functions oder Cloud Storage verwendet. Es gelten kostenlose Kontingente; bei ausgeschöpften Kontingenten sind Anfragen nicht verfügbar. Keine automatische Umstellung auf Blaze.

## Web-Version neu bauen

Im Quellpaket sind die großen Browser-Bibliotheken nicht doppelt enthalten. Mit Node.js zunächst `node scripts/prepare-web-vendor.cjs`, dann `node scripts/build-web.cjs`. Exakte Bibliotheksversionen und Prüfsummen der OCR-Sprachdaten liegen in `web/vendor-manifest.json`. Das fertige Firebase-Hosting-Paket enthält alle benötigten Bibliotheken bereits.
