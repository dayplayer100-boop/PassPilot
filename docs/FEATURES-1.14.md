# PassPilot 1.14 Test – einfacher im Alltag

- Drei direkte Produktaktionen: **Unterlage**, **Lebenslauf**, **Verkaufen**. Bearbeiten, QR-Pass, Übergabe und Verlustmeldung bleiben unter **Mehr** erreichbar. Fehlende Angaben lassen sich später ergänzen, ohne einen großen Warnblock beim Produkt.
- Beim Erfassen zuerst **Code live scannen** oder **Bild auswählen**. Etikett-Kamera und weitere Scanmöglichkeiten sind aufklappbar. Rechnung und Produktfoto behalten Kamera/Galerie; Schritte sind überspringbar.
- Einstellungen zeigen zuerst vier Zugänge: **App & Website verbinden**, **Updates & Download**, **Hilfe-Assistent**, **Meine Daten sichern**. Gerätesperre, Erinnerungen und weitere Einstellungen werden bei Bedarf aufgeklappt.
- Eine schwebende Hilfe-Bubble lässt sich verschieben, per Tastatur auswählen und minimieren. Sie öffnet einen Chat mit freien Fragen und drei Themenvorschlägen. Lokal passende Hilfe antwortet ohne Konto oder Internet. Fragen bleiben nur in der Sitzung; ein minimierter Chat behält sie bis zum Beenden oder Leeren.
- Im normalen Bildschirm bleibt die App bei offenem Chat bedienbar. Über einem Formular schützt ein Dialog die Eingaben. Escape schließt den Helfer und führt zurück.

## Echte KI: sicher vorbereitet, noch ausgeschaltet

Die normale Version liefert **lokale Themen-Hilfe**, kein kostenlos vorgetäuschtes Sprachmodell. Für Online-KI ist ein separater Backend-Entwurf vorbereitet. Er benötigt ein freigeschaltetes Firebase-Functions-Backend und einen privaten OpenAI-API-Schlüssel. Beides ist nicht eingerichtet oder veröffentlicht. Firebase Blaze und OpenAI API können Kosten verursachen. Das normale Hosting-Update aktiviert keine Functions und ändert keinen Tarif.

Nach bewusster Freischaltung wird Online-KI zusätzlich im Chat gewählt. Nur die eingegebene Frage wird übertragen, niemals automatisch die Produktakte oder Rechnung. Konto und bestätigte E-Mail sind Pflicht. Das Backend schützt den API-Schlüssel, begrenzt Anfragen und Antwortlänge und liefert ausschließlich Text; KI-Antworten führen keine App-Aktionen aus. Tests verwenden eine simulierte Provider-Antwort, keine echte kostenpflichtige Anfrage. Eine produktive Aktivierung braucht zusätzlich Betreiber- und Anbieter-Datenschutzprüfung.

## Copyright und praktische Schutzmaßnahmen

**© 2026 PassPilot** steht in App, Website und den Projekthinweisen. Der tatsächliche rechtliche Rechteinhaber ist vom Betreiber noch zu ergänzen. Der Hinweis macht einen Anspruch sichtbar, ist aber keine Registrierung und kein technischer Kopierschutz.

In Deutschland entsteht Urheberrecht grundsätzlich ohne Registrierung für schutzfähige eigene Werke. Ideen, Funktionen und rein maschinell erzeugte Inhalte werden nicht durch den Hinweis automatisch exklusiv geschützt. Drittanbieter-Komponenten behalten ihre eigenen Lizenzen. PassPilot beansprucht keine Rechte an deren Code; ihre Attributionen und Lizenztexte bleiben erhalten.

Der öffentliche Quellcode-Download wurde entfernt. Betreiber-Quellkopien bleiben lokal gesichert. Bereits heruntergeladene Kopien werden dadurch nicht zurückgerufen. Ist ein GitHub-Repository öffentlich, sollte der Betreiber dessen Sichtbarkeit gesondert prüfen; dessen Sichtbarkeit wurde hier nicht geändert.

Öffentliche eigene Web-Skripte werden für Release-Pakete minimiert, ohne Source-Maps. Servercode und private Schlüssel werden nicht als Web-Dateien veröffentlicht. JavaScript im Browser und Dateien in einer APK bleiben grundsätzlich auslesbar. Eine Sperre von Rechtsklick oder Textauswahl wäre kein wirksamer Schutz und wird nicht verwendet.

Ein Produktions-Android-Build ist mit R8 und Ressourcenkürzung vorbereitet. Der Produktionssignierer wird ausschließlich aus privaten Umgebungswerten eingebunden. **Die aktuelle Test-APK bleibt mit dem bisherigen Testschlüssel signiert**, damit bestehende Testinstallationen aktualisiert werden können. Ein geheimer Produktionsschlüssel wurde nicht erzeugt oder verteilt. Alte öffentlich angebotene Test-Quellpakete enthielten den Testschlüssel; das Entfernen des Downloads macht ihn nicht nachträglich geheim.

## Unverändert verfügbar

Verschlüsselte Synchronisation, Backups, Diebstahl-Lebenslauf, Barcode-/OCR-Erfassung, Verkauf und Kalender bleiben erhalten. [Version 1.13](../FEATURES-1.13.md) und [Version 1.12](../FEATURES-1.12.md) dokumentieren diese Funktionen und Grenzen. Betreiberangaben für ein vollständiges Impressum fehlen weiterhin.
