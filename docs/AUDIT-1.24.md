# PassPilot 1.24 – geprüfter Ausgangspunkt und Umbau

Stand vor Änderungen: 1.23.0-test. Android-Java-WebView, gemeinsame JavaScript-Oberfläche, localStorage/IndexedDB und freiwilliger verschlüsselter Firebase-REST-Abgleich. Kein aktiver Zahlungsanbieter. Keine Produktions-Zugangsdaten in dieser Arbeitsumgebung.

Festgestellte Probleme:

- `upgrades.js`: allgemeine Abo-Sperren aus, neue Diagramm-/Vertrags-Funktionen trotzdem gesperrt.
- `MainActivity.java`: Zurück navigiert nur in der WebView-Historie; die eigentlichen App-Ansichten erzeugen keine Navigationseinträge.
- `firebase.js`: Registrierung und Anmeldung in einem Auswahlfeld; E-Mail-Bestätigung erfordert bisher eine erneute Anmeldung. Keine Google-Anmeldung.
- `sync.js`: ein generischer Text für alle Zugriffsfehler. Keine Prüfung des aktuellen Bestätigungsstatus vor dem Abgleich. Alte Chunks werden nach einem Upload sofort gelöscht, obwohl ein anderes Gerät sie noch lesen kann.
- `app.js`: große Startkarte, sechs Navigationspunkte; Verträge/Wartung/Gerätezugänge nur tief am Produkt erreichbar.
- `obligations.js`: alle grundlegenden Felder zuerst sichtbar, auch bei Wartungen. Standard-Auswahlfeld außerhalb der bisherigen `.field`-Formatierung.
- `assistant.js`: lokale Abo-Antwort nennt überholte Preise und Kündigungsregeln.
- Kein eigener Feedback-Ablauf und keine zentrale Kanal-Auswahl für Erinnerungen.

Geplanter Umbau:

1. Bestehende Datensätze und Verschlüsselung unverändert erhalten; keine Datenbankmigration für Produkte. Verträge bleiben im bestehenden Produkt-Datenmodell und werden in eigenen Übersichten zusammengeführt. Verträge ohne Gerät erhalten einen ausdrücklich als Vertragsablage markierten Eintrag.
2. Alle vorhandenen Plus-Funktionen im Testmodus verfügbar machen. Serverseitige Eigentumsregeln, Anmeldung und Verschlüsselung bleiben wirksam; Zahlungen bleiben aus.
3. Kompakte Übersicht, direkte Zugriffe, einheitliche Auswahlfelder und Schiebeschalter. Neue Eingabewege nutzen die bestehenden Vertrag-/Wartungs-Funktionen.
4. Anmeldung vereinfachen, Bestätigung ohne Abmelden aktualisieren, Google über Firebase vorbereiten. Google muss im Projekt als Anbieter eingerichtet sein; Android benötigt zusätzlich die passende öffentliche OAuth-Client-ID und registrierte Signatur.
5. Sync-Voraussetzungen prüfen, Fehler differenzieren und Leserennen beim Austausch verschlüsselter Chunks abfangen. Keine automatische Überschreibung bei Konflikten.
6. Meldungen mit Vorschau/ausdrücklichem Versand und geschützter Ablage. Gerätezugänge und sensible Formulare werden von Aufnahmen ausgeschlossen. Betreiber liest Meldungen zunächst in der Firebase-Konsole; keine öffentliche Meldungsübersicht.
7. Erinnerungskanäle transparent anzeigen. Android/In-App funktionieren lokal; E-Mail/SMS erst nach Einrichtung eines Versanddienstes. Keine Versandversprechen ohne Dienst.

Betroffene Dateien: bestehende App-, Firebase-, Sync-, Abo-, Assistenten-, Vertrags-, Style- und Android-Navigationsmodule; kleine gemeinsame Module für Übersichten, Navigation, Feedback und Benachrichtigungen. Zusätzliche Firestore-Regeln ausschließlich für private Meldungen.

Prüfungen: zwei Geräte mit gleichzeitigen Änderungen und Dateien, Bestätigung/Token-Erneuerung, falsche Konto-Zuordnung, Testmodus/Produktpersistenz, neue Eingabewege, Formular-/Mobilansichten, geschützte Screenshots, Feedback-Zugriffsregeln, Android-Compiler/Tests/Lint und unveränderte APK-Signatur. Firebase-Veröffentlichung benötigt eine autorisierte Cloud-Shell-Sitzung; der abschließende Befehl enthält Hosting und Firestore-Regeln.
