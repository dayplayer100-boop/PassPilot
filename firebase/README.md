# Firebase verbinden (kostenloser Start)

Das Projekt wird im Google-Konto des Eigentümers angelegt. Im aktuellen Codex-Arbeitsbereich ist kein berechtigter Google-Zugang vorhanden. Ein produktives Projekt und eine veröffentlichte Datenbank werden daher nicht als eingerichtet ausgegeben.

1. https://console.firebase.google.com/ öffnen, anmelden, **Projekt erstellen**, Name **PassPilot**. Analytics für den Start ausschalten, **Spark** wählen.
2. **Projekteinstellungen → Deine Apps → Web-App (</>)** registrieren. Name PassPilot. `projectId` und `apiKey` aus `firebaseConfig` kopieren. Diese zwei Werte sind öffentliche Konfiguration, keine Administrator-Schlüssel. Keine Service-Account-Dateien in die App einfügen.
3. **Authentication → Jetzt starten → Anmeldemethode → E-Mail/Passwort** aktivieren. E-Mail-Link-Anmeldung ist nicht erforderlich.
4. **Firestore Database → Datenbank erstellen → Standard Edition → Produktionsmodus**, Region passend wählen (z. B. europe-west3). Kein offener Testmodus.
5. Unter **Regeln** den kompletten Inhalt von `firestore.rules` einsetzen und veröffentlichen. Alternativ mit angemeldetem Firebase CLI: `firebase deploy --only firestore:rules --project DEINE_PROJEKT_ID` aus diesem Ordner.
6. In PassPilot unter **Einstellungen → Firebase verbinden** Projekt-ID und API-Key eintragen. Dann registrieren, Bestätigungs-E-Mail öffnen und erneut anmelden.
7. Mit zwei getrennten Konten prüfen: eigenes Konto darf eigenen Pass aktualisieren/deaktivieren, anderes Konto nicht; deaktivierte/abgelaufene Pässe dürfen öffentlich nicht abrufbar sein. Erst danach echte Daten freigeben.

Spark hat feste kostenlose Kontingente. Bei ausgeschöpften Kontingenten können Anfragen scheitern. Keine Garantie für dauerhaft kostenlose Skalierung. Cloud Functions und Firebase Storage werden für diesen Start nicht vorausgesetzt; insbesondere Storage kann bei neuen Projekten einen Blaze-Tarif verlangen. Keine kostenpflichtige Umstellung automatisch durchführen. Fotos/PDFs bleiben lokal. Online-Übergaben enthalten freigegebene Metadaten und Links, keine großen Datei-Anhänge. Der Import beim Empfänger ist eine separate Bestätigung; eine technische Bestätigung begründet keinen rechtlichen Eigentumsnachweis.

Firestore-Pass-URLs sind öffentliche Links: jeder mit dem Link kann freigegebene Inhalte bis zum Ablauf lesen. Zufällige IDs sind kein Ersatz für Zugriffsschutz bei privaten Datensätzen. Nachrichten erfordern ein bestätigtes Konto und sind nur für den Passbesitzer lesbar. Benachrichtigung/E-Mail-Weiterleitung von Finder-Nachrichten ist nicht vorhanden; Abruf in der App erfolgt manuell. Familienfreigaben sind ausdrücklich auf ausgewählte Konto-IDs beschränkt; sie übertragen freigegebene Produktdaten, keine komplette automatische Kontosynchronisation.

## Vollständige Web-Version auf Firebase Hosting

Für dieses Projekt ist die zusätzliche Hosting-Site `passpilot-app` konfiguriert. Nach dem Deploy lautet die Adresse `https://passpilot-app.web.app`, die öffentliche Leseseite liegt unter `/pass/`.

Das Projekt enthält jetzt auch einen Web-Build der vollständigen lokalen App. Auf `/` öffnet sich PassPilot; `/pass/` enthält die öffentliche QR-Leseseite. Die Web-Version benötigt keinen Android-Download. In unterstützten Browsern kann sie über „App installieren“ oder „Zum Home-Bildschirm“ installiert werden.

1. Im bereits angelegten Projekt unter **Projekteinstellungen → Deine Apps → Web-App (</>)** die Web-App registrieren. Name beispielsweise „PassPilot Web“. Falls schon vorhanden, ihre Konfiguration öffnen.
2. Eine lokale Datei `public-firebase-config.json` mit den öffentlichen Werten anlegen:

   ```json
   { "projectId": "DEINE_PROJEKT_ID", "apiKey": "DEIN_OEFFENTLICHER_WEB_API_KEY" }
   ```

3. Im Hauptordner des entpackten App-Quellcodes bauen:

   ```sh
   node scripts/prepare-web-vendor.cjs
   node scripts/build-web.cjs public-firebase-config.json
   ```

   Ohne Konfigurationsdatei funktioniert `node scripts/build-web.cjs` ebenfalls; die Projektverbindung wird dann in der Web-App unter Einstellungen eingegeben. Keine privaten Schlüssel erforderlich. Der Build veröffentlicht ausschließlich App-Dateien und die öffentliche Projektkonfiguration, keine lokal erfassten Produkte oder Backups.

4. Auf dem eigenen Computer mit installiertem Node.js anmelden und veröffentlichen:

   ```sh
   npx firebase-tools login
   cd firebase
   npx firebase-tools deploy --only hosting,firestore:rules --project DEINE_PROJEKT_ID
   ```

   Bei einem bestehenden Projekt vor dem Regel-Deploy prüfen, ob es bereits andere Apps/Daten enthält: diese Regeln sind für ein eigenes PassPilot-Projekt vorgesehen. Im aktuellen Codex-Arbeitsbereich ist kein Google-Zugang eingerichtet; der Build allein veröffentlicht nichts.

5. Die Firebase-CLI gibt die tatsächliche Hosting-Adresse aus. Beim standardmäßigen Hosting-Site ist sie `https://DEINE_PROJEKT_ID.web.app` (zusätzlich `.firebaseapp.com`). Unter **Authentication → Einstellungen → Autorisierte Domains** die verwendete Domain prüfen / ergänzen. E-Mail/Passwort und die Datenbank müssen wie oben eingerichtet sein.
6. Für die Android-App unter **Einstellungen → Andere öffentliche Pass-Adresse** `https://DEINE_PROJEKT_ID.web.app/pass/` hinterlegen und dasselbe Firebase-Projekt verbinden. Bestehende QR-Codes behalten ihre alte Adresse; neue Codes nutzen die neue Adresse.

**Eigene Domain:** Unter **Hosting → Benutzerdefinierte Domain hinzufügen** eine bereits gekaufte Domain verbinden und die angezeigten DNS-Einträge beim Domainanbieter setzen. Firebase stellt HTTPS-Zertifikate bereit. Die `web.app`-Adresse ist ohne Domainkauf verwendbar; eine eigene Domain kostet normalerweise beim Domainanbieter Geld. Spark reicht für diesen statischen Start innerhalb seiner Kontingente. Kein Blaze-Wechsel, Cloud Functions oder Storage erforderlich.

**Was die Web-Version leistet:** lokale Produkterfassung, Fotos und Dokumente, Suche/Filter, Historie, Kalender, Backup-Import/-Export, CSV/ICS, Verkaufszettel und QR-Pässe sowie die vorbereiteten Firebase-Freigaben. Lokal gespeicherte PDFs werden im eigenen PDF.js-Viewer angezeigt. Web-Barcodescans verwenden BarcodeDetector oder ZXing mit Kamerafreigabe.

**Grenzen:** Android-Fingerabdrucksperre, lokale System-Erinnerungen, automatische Ordner-Backups, und NFC sind im Web ausgeblendet. Beleg-/Etikett-OCR und mehrseitige Kamera-PDFs sind ab 1.12 auch im Web verfügbar. Anleitungen können per Modell-/Barcode-Websuche gesucht, als Link hinterlegt und als heruntergeladene PDF importiert werden; die Web-Version findet hinterlegte exakte Modelltreffer und bietet sonst eine gezielte Hersteller-Suche. Eine beliebige automatische Hersteller-Suche benötigt zusätzliche Infrastruktur. Ab 1.13 ist eine freiwillige AES-256-GCM-Synchronisation mit demselben bestätigten Konto und eigenem Sync-Passwort verfügbar. Produktdaten, Historie und Kalender werden abgeglichen; Fotos und Dokumente nur nach zusätzlicher Auswahl. Maximal 20 MB Gesamtgröße, bei geöffneter App. Neue private Vault-Regeln müssen ebenfalls veröffentlicht werden. Geräteeinstellungen bleiben lokal.

Der Offline-Cache speichert ausschließlich App-Dateien der eigenen Domain. Firebase-Antworten, Kontodaten und externe Dokumente werden nicht durch den Service Worker zwischengespeichert. Öffentliche Online-Pässe benötigen Internet und bleiben von Ablauf/Deaktivierung abhängig.
