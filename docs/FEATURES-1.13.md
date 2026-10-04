# PassPilot 1.13 Test – Neuerungen und Prüfung

Der schnelle Ablauf bleibt **Code → Rechnung → Produktfoto → Prüfen** mit Kamera und Galerie. Version 1.13 ergänzt:

- Titel, Beschreibung, Open Graph mit eigenem Vorschau-Banner, Canonical, Sitemap und PWA-Beschreibung. Icons mit separatem sicheren Maskable-Icon.
- Sofortiger Start aus dem vorbereiteten Offline-Cache. Nur eigene statische App-Dateien werden gecacht; keine Firebase-Antworten, Authentifizierung oder privaten Online-Daten.
- Hilfe über das Fragezeichen, auch innerhalb eines Formulars. Lokaler Themen-Assistent mit Suche, ohne KI-Dienst. Hilfe schließen erhält nicht gespeicherte Eingaben.
- Beschriftete Formulare, sichtbarer Tastaturfokus, Tab-Begrenzung und Escape in Dialogen, Fokus zurück zum Auslöser und Sprunglink zum Inhalt.
- Android-Download auf der Website und unter Einstellungen. Updateprüfung aus der App; Android bestätigt eine neue APK-Installation. Web-Updates werden bewusst neu geladen. Keine automatische Deinstallation.
- Verlustauswahl: **Verloren** ändert nur den Status. **Gestohlen** erzeugt einen privaten Historieneintrag. Wiedergefunden setzt den vorherigen Status zurück, der Diebstahleintrag bleibt bestehen. Ein Eintrag ist eine Angabe des Besitzers, keine Verifizierung.
- Datenschutz und Impressum sind in Footer und Einstellungen auffindbar. **Betreiberangaben fehlen noch**, daher ist das Impressum ausdrücklich unvollständig. Name/Firma, ladungsfähige Anschrift und Kontakt-E-Mail müssen vom Betreiber ergänzt werden. Auch die Datenschutzerklärung ist erst nach Ergänzung der Verantwortlichen und betrieblichen Rechtsgrundlagen vollständig.

## App und Web synchronisieren

1. Neue App installieren und Firebase-Website samt den neuen Regeln aktualisieren.
2. Auf beiden Geräten im selben Projekt mit demselben Firebase-Konto anmelden. E-Mail bestätigen und erneut anmelden.
3. **Einstellungen → App und Web synchronisieren** öffnen. Ein eigenes Sync-Passwort mit mindestens 12 Zeichen wählen und auf beiden Geräten dasselbe verwenden.
4. Freiwillig zustimmen. Fotos und private Dokumente besitzen eine zusätzliche Auswahl. Ohne sie werden nur Produktdaten, Links, Historie und Kalender synchronisiert; lokale Dateien bleiben lokal.

Die Inhalte werden vor dem Hochladen mit **AES-256-GCM** verschlüsselt. Schlüsselableitung: **PBKDF2-SHA-256, 250.000 Durchläufe**, zufälliger 16-Byte-Salt und je Upload neuer 12-Byte-IV. Das Passwort und der Schlüssel werden nicht dauerhaft gespeichert. Firebase sieht Konto, verschlüsselte Datenmenge und Zeitpunkte. Der Sync-Schlüssel bleibt nur in der Sitzung; neue Anmeldung / Abmeldung sperrt ihn.

Änderungen an verschiedenen Produkten werden zusammengeführt. Für gleichzeitig geänderte Produkte oder Termine wird eine bewusste Auswahl angezeigt. Löschungen werden übertragen. Ein Vergleich der serverseitigen Dokumentversion verhindert, dass zwei Geräte einander still überschreiben. Bei Fehlern bleibt der lokale Bestand erhalten. Abgebrochene Konflikte pausieren bis zum nächsten manuellen Abgleich.

Der Abgleich läuft bei geöffneter App, nach lokalen Änderungen und ungefähr alle 45 Sekunden im sichtbaren Fenster. Bei unverändertem Manifest wird nur dessen Version geprüft, nicht der gesamte Dateibestand erneut geladen. Bearbeitete Formulare werden nicht durch einen Hintergrundabgleich ersetzt. Der gesamte unverschlüsselte Sync-Bestand ist auf **20 MB** begrenzt. Größere Bestände werden vollständig abgewiesen; nichts wird unbemerkt weggelassen. Bilder verkleinern oder Dateien lokal halten. Gerätesperre und Backup-Ordner bleiben gerätespezifisch.

Spark-Kontingente für Firestore, Hosting, Netzwerk und Speicherung gelten. Die Umsetzung benötigt weder Functions noch Cloud Storage oder eine automatische Umstellung auf Blaze. Der verschlüsselte Sync-Bestand ist kein Ersatz für unabhängige Backups.

## Sicherheit und verbleibende Grenzen

- Lokale Produktdaten liegen in **localStorage**, Dateien in **IndexedDB**. Sie sind **nicht zusätzlich durch PassPilot verschlüsselt**. Android bietet eine optionale Gerätesperre. Geräteverschlüsselung, ein geschütztes Browserprofil und regelmäßige verschlüsselte Backups bleiben relevant.
- AES-256-GCM wird für verschlüsselte Backups und die freiwillige Synchronisation verwendet, nicht pauschal für den gesamten lokalen Speicher.
- Native Navigation hält fremde Webseiten vom App-WebView und seiner Java-Schnittstelle fern. Externe HTTPS-Seiten öffnen separat. Dateiseiten erhalten keinen universellen Zugriff auf fremde Ursprünge.
- Firebase-Regeln erlauben Zugriff auf einen privaten Sync-Bestand ausschließlich dessen bestätigtem Kontoinhaber. Inhalte sind zusätzlich verschlüsselt. Öffentlich freigegebene Pässe behalten ihre gesonderten Regeln.
- Die Web-Version erhält eine Content Security Policy, Frame-Schutz, keine Mikrofon-/Standortfreigabe, nosniff und no-referrer. Bild-/OCR-Verarbeitung bleibt lokal; die echte OCR und PDF-Erzeugung wurden auch unter dieser CSP geprüft.
- Offline-Nutzung braucht einmal vorbereitete App-Dateien. Online-Pässe, Kontoanmeldung und Synchronisation benötigen Internet. Manche Browser entfernen lokale Caches oder Daten bei Speicherknappheit.
- Nicht jeder Barcode hat Katalogdaten; nicht jede Anleitung ist automatisch auffindbar. Modell und OCR-Vorschläge weiterhin prüfen.
- Dies bleibt eine **Testversion mit dem bisherigen Test-Installationsschlüssel**. Ein regulärer Release braucht einen eigenen geheimen Produktionssignierer und einen geplanten Übergang von den Testinstallationen. Der Testschlüssel ist im Quellpaket enthalten und kein geheim verwahrter Produktionsschlüssel.
- Automatische Tests umfassen getrennte Browserprofile mit echter Verschlüsselung, Dateien, konkurrierende Änderungen, Löschungen, Konflikte, falsches Passwort, Verlust/Diebstahl, Hilfe, Tastatur, echte lokale OCR und Offline-Neuladen. Datenbankregeln wurden im Firebase-Emulator geprüft. Kamera, Android-Installationsdialog und echte Konten auf dem Handy müssen zusätzlich geprüft werden.
