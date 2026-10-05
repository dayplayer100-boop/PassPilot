# PassPilot 1.26.0-test

Stand 05.10.2026, Android Build 27. Gemeinsames Web-/Android-Update der besprochenen fünf Arbeitsabläufe und der produktbezogenen Assistenten-Hilfe. Vorhandene Produkte, Dateien, QR-IDs und Abodaten bleiben erhalten. Zahlungen und lokale Premium-Sperren bleiben deaktiviert.

## Erfassung

Die Hauptschaltfläche „Hinzufügen“ bietet vier direkte Einstiege: Produkt, Vertrag/Finanzierung, Versicherung/Garantie und Termin/Wartung. Die bekannten Produkt-spezifischen Schaltflächen bleiben direkte Produkteinstiege. Für Verträge, Versicherungen und Termine erscheinen im Formular nur passende Felder; das Produkt kann dort direkt zugeordnet werden. Eine Garantieverlängerung benötigt weiterhin ein bestehendes physisches Produkt.

Unter dem Scan stehen sofort editierbare Produktangaben. Aus Scan/Katalog übernommene Felder sind ausdrücklich Vorschläge; eigene Korrekturen bleiben erhalten. Keine erfundenen OCR-Konfidenz-Prozentwerte. Bei Rechnungen können mehrere Positionen mit Einzelpreisen gewählt werden. Ein ausgewählter Artikelpreis wird vorausgefüllt, bleibt aber sofort korrigierbar. Der gesamte Rechnungsbetrag mehrerer Artikel wird weiterhin nicht ungeprüft übernommen. Beleg und Foto sind optional; von Scan oder Rechnung führt eine direkte Schaltfläche zur Prüfung und Speicherung. Die vorhandene lokale OCR, Kamera, PDF-Erkennung und Dateispeicherung werden weiterverwendet.

Die bestehende Anleitungssuche speichert eindeutige passende Hersteller-PDF-Links und meldet fehlende PDF, fehlende Modellangaben oder einen nicht erreichbaren Suchdienst. Bei Fehlern gibt es „Erneut suchen“ und die Modell-Websuche. Hersteller-/Modellsuche wird nicht als vollständige universelle Suchmaschine dargestellt: der Browser nutzt den vorhandenen Katalog bzw. einen separat eingerichteten Suchdienst. Kein neuer kostenpflichtiger Suchdienst wird automatisch eingerichtet.

## Übersicht

„Als Nächstes“ sammelt Produktfristen, Finanzierungs- und Vertragsfristen, Wartungspläne und eigene Termine, sortiert nach Datum/Uhrzeit. Erledigte eigene Termine erscheinen weiterhin im Kalender, nicht in der Aufgabenkarte. Erledigung ist rückgängig machbar und bleibt nach Neuladen, Export und Sync erhalten. Effektive Garantie einschließlich aktiver Verlängerungen wird für die Anzeige genutzt; gleiche Garantie-Endtermine werden in der Aufgabenkarte zusammengefasst. Historische Kaufdaten und bereits verkaufte Produkte verdrängen keine offenen Aufgaben.

## Sync

Sichtbarer Status auf der Übersicht: lokal, E-Mail bestätigen, gesperrt, ausstehend, läuft, synchronisiert, offline oder Aktion erforderlich. Letzter Erfolg wird pro Projekt/Konto lokal gespeichert und erst nach erfolgreichem Abgleich aktualisiert. Ein gespeicherter Zeitpunkt ersetzt keine aktuelle Statusprüfung. Offline und offene Formulare verhindern einen irreführenden Erfolgsstatus; Daten bleiben lokal erhalten.

Konfliktvorschau nennt geänderte Bereiche und lesbare Angaben statt ungekürzter JSON-Daten. Private Notizen, geschützte Gerätezugänge und Dateiinhalt werden nicht in der Vorschau ausgeschrieben. Bewusste Auswahl der lokalen oder anderen Version bleibt verpflichtend. AES-GCM-Verschlüsselung, PBKDF2, CAS, getrennte Account-Kontexte, Konfliktschutz, Snapshot-Wiederholung und bestehende Sync-Datenformate bleiben bestehen.

## Finanzierung und Wiederholungen

Reguläre Monatsraten und Schlussrate sind getrennt bezeichnet. Finanzübersicht zeigt bezahlt inklusive Anzahlung, offen, Anzahl offener Monatsraten, Schlussrate, nächste offene Zahlung und Vertragsende. Eine eigene Schlussraten-Fälligkeit ist optional; bestehende Verträge ohne dieses Feld behalten ihre bisherigen Datumsregeln. Keine Bankabfrage, keine erfundenen Zinsen: die Berechnung verwendet die eingegebenen Vertragswerte und bestätigten Zahlungen.

Wiederholungen: ab tatsächlicher Erledigung oder fester Rhythmus ab dem ursprünglichen Termin. Monats-/Jahresrhythmus behält den ursprünglichen Anker, z. B. 31.01. → 28.02. → 31.03. Verspätete Erledigung überspringt abgelaufene feste Termine und zeigt den nächsten Zukunftstermin. Altbestände behalten standardmäßig die bisherige Berechnung ab Erledigung. Eine einmalig erledigte Erinnerung beendet keine Versicherung oder Vertragsdeckung; bei einmaligen Wartungseinträgen wird der Eintrag beendet.

## Assistent

Lokale Produktauswahl und konkrete Antworten zu gespeicherter Garantie, Rückgabe, Rechnungen, Anleitungen, Wartung und Finanzierung. Quellen-Schaltflächen öffnen das Produkt oder zugeordnete Dokumente. Technische Daten/Preise werden ausschließlich aus dem bestehenden, modellgenau geprüften Datenbestand mit Quellen und Prüfdatum verwendet; fehlende Werte werden benannt und nicht geschätzt. Dokumentnamen und Links werden nicht als gelesener Herstellerinhalt ausgegeben.

Das ist eine Erweiterung der lokalen Produkt-Hilfe und der bestehenden optionalen Online-KI. Kein selbst trainiertes Modell oder neue Online-KI ohne Backend/Schlüssel. Ein ausdrücklich aktivierter Online-Aufruf sendet weiterhin nur die eingegebene Frage. Keine automatische Übertragung des Archivs oder von Dokumenten; verschlüsselte PINs/Passwörter bleiben gesperrt.

## Veröffentlichung und Prüfung

Firebase-Projekt `passpilot-69f7c`, Site ausschließlich `passpilot-app`. Web und aktuelle Download-Metadaten in Spark Hosting; signierte Android-APKs in GitHub Releases. Private Signatur unverändert, höhere Buildnummer. `setup-auth.py` im Web-ZIP bleibt idempotent: App-Domain, E-Mail/Passwort und die Zertifikate der Test-App; für einen konfigurierten Google-Anbieter wird nur die öffentliche Client-ID synchronisiert. Billing- und Premium-Einstellungen werden nicht verändert. Google muss einmal mit Support-E-Mail in Firebase Authentication aktiviert sein.

Geprüft: neue Einstiege, Produktzuordnung, sofortige Scan-Korrekturen, echte lokale OCR/PDF-/Barcode-Verarbeitung, Einzelpreise, Dateierhaltung, Aufgaben-Erledigung, feste/relative Monats- und Wochenrhythmen, Versicherungserhaltung, Assistenten-Quellen, geprüfte Specs, weiterhin fragebasierter Online-Opt-in, Sync-Konflikte/offline/CAS/Zwei-Geräte, mobile Layouts 320–768 px, bestehende Konto-/Garantie-/QR-/Exportpfade. Android Compiler, acht Unit-Tests, Lint, beide ABI-APKs und unveränderte Signatur. Echte Kontoanmeldung und Mailzustellung benötigen die Einrichtung im eigenen Firebase-Projekt.

Keine privaten Signierschlüssel, Zugangstokens, echten Lizenzcodes oder Nutzerbestände werden mit Source-/Web-Paketen veröffentlicht.
