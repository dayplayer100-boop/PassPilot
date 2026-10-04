# PassPilot 1.20 – Funktionsabos vorbereitet

- Alle Verbesserungen aus 1.18/1.19 bleiben enthalten.
- Produktstaffeln entfallen. Lokale Produktakten mit Fotos, Rechnungen, manuellem Bearbeiten, lokalem Scan/OCR und einfachem Daten-QR bleiben kostenlos. Keine Produktzählung als Zahlungsgrenze.
- Vorläufig Plus 3 €/Monat: Synchronisation, dynamische Online-Verkaufslinks, Inventar-PDF, Wartungsassistent. Pro 7 €/Monat: Plus und zusätzlich Online-/Dokument-KI mit festem Kontingent; keine unbegrenzte KI-Zusage. Preise und Kontingente müssen vor Zahlungsstart festgelegt werden.
- Nach bestätigter Kündigung 30 Tage weiter aktiv, mindestens bis zum Ende des bereits bezahlten Zeitraums. Die erste bestätigte Kündigung bestimmt das Ende; Wiederholungen verlängern es nicht. Danach Premium-Aktionen gesperrt und öffentliche dynamische Verkaufslinks nicht mehr aktiv. Eine erneute bezahlte Aktivierung kann den Dienst wieder freischalten.
- Daten werden nicht gelöscht: Produkte, Fotos, Rechnungen und Historie bleiben lokal lesbar und bearbeitbar; Backup, Wiederherstellung, CSV und Deaktivieren/Löschen eigener Online-Freigaben bleiben möglich. Geschützte Cloud-Daten bleiben für den berechtigten Nutzer lesbar und abrufbar. Beidseitige Eigentumsübergabe, Verluststatus und kostenlose Daten-QRs bleiben unabhängig davon nutzbar.
- Abos sind serverseitige Berechtigungen, keine vom Nutzer editierbaren Einstellungen. Produktionsregeln beschränken Premium-Uploads und Online-Pässe; die App fragt vor Premium-Aktionen den aktuellen Serverstand ab. Freischaltcodes aus der Testvorbereitung sind keine Zahlungsbestätigung und ersetzen keine Produktionsberechtigung.
- Ein verifizierter Zahlungskauf wird nur einem Konto zugeordnet; Client-Zugriff auf Kaufbindungen und Schreibzugriff auf Berechtigungen sind gesperrt. KI-Kontingente lassen sich am Kauf statt an wechselnden Konten zählen. Kostenlose Zweitkonten bringen keine Premium-Rechte.
- Aktivierung fehlt bewusst noch: kein Zahlungsprovider, keine Abrechnung, keine aktive Kündigungs-API, keine Zahlungssperren. Die App ist weiter im offenen Testbetrieb. Produktions-Flags in App, Firestore-Regeln und KI-Backend sind deaktiviert.
- Ein vollständig lokaler Premium-Export lässt sich in einer manipulierten App nicht zuverlässig schützen. Der belastbare Abo-Mehrwert liegt deshalb vor allem bei laufenden Serverdiensten. Ein hundertprozentiger Schutz vor Mehrfachkonten ist nicht behauptet.

## Prüfung

- Laufzeitpolitik: exakter Ablauf nach 30 Tagen, bezahlten Restzeitraum bewahren, wiederholte Kündigung, widerrufene Berechtigung, Plus-/Pro-Funktionen.
- Kaufbindung: verifizierter Kauf kann nicht an ein anderes Konto erneut vergeben werden; ungültiger Nachweis wird abgewiesen. Die Tests verwenden einen simulierten Provider, keine echten Zahlungen.
- Firestore-Emulator mit aktivierten Produktionsregeln: kein Selbst-Upgrade, keine Premium-Rechte für ein Zweitkonto, keine Änderungen nach Ablauf, Online-Lesen/Deaktivieren/Löschen für Besitzer bleibt möglich. Öffentliche dynamische Pässe sind bei abgelaufenem Abo nicht mehr abrufbar.
- Bestehende Identitätsregeln und Browserabläufe sowie Android-Build/Lint geprüft. Zahlungsintegration, Provider-Wiederherstellung und Kündigung beim echten Anbieter sind noch nicht getestet, da nicht eingerichtet.
