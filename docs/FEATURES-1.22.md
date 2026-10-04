# PassPilot 1.22 – sichtbare Rückmeldungen, Freigaben und Einmalcodes

- Rückmeldungen erscheinen auch innerhalb geöffneter Dialoge; zuvor konnten sie hinter dem Dialog unsichtbar bleiben.
- Online-Status, Eigentumsanfragen und Protokoll prüfen Anmeldung/Registrierung und melden fehlende Voraussetzungen. Nach Anmeldung werden angeforderte Aktionen fortgesetzt.
- Verleih ansehen und Rückgabe dokumentieren; Aktionen Verkaufen, Verschenken, Verleihen, Verloren und Gestohlen. Diebstahl weiterhin nur mit bestätigter individueller Seriennummer.
- Eindeutig zugeordnete Hersteller-PDF-Links werden bei erfolgreicher Anleitungssuche privat gespeichert, ohne Einfügen des Links. Vorhandene Anleitungen werden nicht überschrieben; mehrdeutige Zuordnungen nicht automatisch übernommen. Ein gespeicherter Link bedeutet nicht, dass die PDF offline heruntergeladen wurde.
- Zusätzlicher begrenzter Firebase-Suchdienst für die Webversion vorbereitet; Android nutzt vorhandene Hersteller-Suche mit zusätzlichen Rowenta-/Tefal-Quellen.
- Neue Installationen starten mit Konto-Anmeldung. Bestehende lokale Bestände bleiben kompatibel; Anmeldung bei jedem Start kann unter Konto aktiviert werden. Im Kontomodus ist die lokale Oberfläche dem angemeldeten Konto zugeordnet; beim Abmelden verschwindet der Bestand aus der Ansicht. Firebase-E-Mail/Passwort vorhanden; Google-Anmeldung ist nicht eingerichtet.
- Widerrufbare Verwaltungsfreigaben für ausgewählte Produktangaben an eine bestätigte E-Mail. Rollen Ansehen/Bearbeiten; Erstellung und Aktivierung verlangen frische Owner-Anmeldung. Keine Kontopasswörter, Zahlungsdaten, privaten Rechnungen, Standortdaten oder private Notizen freigeben. Neue gemeinsame Notizen möglich.
- Eine Freigabe ist eine getrennte gemeinsame Produktübersicht, keine automatische Synchronisation der ursprünglichen lokalen Akte. Sie verändert keine registrierte Eigentumszuordnung und erlaubt keinen Verkauf im Namen des Account-Inhabers.
- Vormerkung für später gibt keinen Zugriff. Ein aktiver, zuvor eingerichteter Verwalter kann die freigegebene Übersicht weiter verwalten. Rechtliche Vollmacht und Todesfall-/Nachlassprüfung sind nicht implementiert; ein Vormerkstatus kann nicht durch den Empfänger selbst aktiviert werden.
- 25 individuell signierte Premium-Dauercodes erstellt. Serverseitige Einlösung bindet jeden an genau ein bestätigtes Konto. Erneute Eingabe durch dasselbe Konto ist idempotent. Diese neuen Codes schalten offline nichts frei und benötigen den veröffentlichten Freischaltdienst.

## Getestet

Dialog-Rückmeldungen, Screenshot-Aktionen, Verleih-Rückgabe, Login-Voraussetzungen, Offline-Status, automatische Anleitungslink-Speicherung, Duplikate und Nachbarmodelle, 25 unterschiedliche gültige Codes, mobile Darstellung. Firestore-Emulator prüft Viewer/Manager, fremde Empfänger, Widerruf, vorgemerkte Freigaben, frische Anmeldung, unerlaubte Ownership-Felder und parallele Einlösung desselben Codes durch zwei Konten. Bestehende Identity-/Billing-Regeltests bestehen. Der echte Frontend-REST-Ablauf für Freigabe, Bearbeitung, Datenminimierung und Widerruf wurde zusätzlich gegen den Emulator geprüft. Erfassung, Lebenslauf, verschlüsselte Zwei-Geräte-Synchronisation, Fotos und öffentliche Übergaben bestehen die Regressionstests.

## Veröffentlichung und Grenzen

Das Hosting-Paket veröffentlicht keine Cloud Functions. Allgemeine Web-Anleitungssuche und Einmalcode-Einlösung benötigen die separat vorbereiteten Functions passpilotFindManual und passpilotRedeemLicense. Firebase kann dafür Blaze verlangen; keine automatische Tarifumstellung und keine Veröffentlichung in das private Google-Projekt aus diesem Arbeitsbereich.

Private Codes und Signierschlüssel nicht öffentlich veröffentlichen. Lokale UI-Anmeldung verschlüsselt keine lokalen Dateien und ersetzt keine Gerätesperre. Bereits heruntergeladene freigegebene Angaben lassen sich durch Widerruf nicht zurückholen. Echte Kamera/NFC/Biometrie und ein echter Firebase-Produktions-Deploy benötigen weiterhin Gerät-/Kontoprüfung. Kein pauschales Versprechen, dass jeder externe Hersteller-Link oder jede Hardwarefunktion immer funktioniert.
