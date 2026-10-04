# PassPilot 1.18 – Identität und registrierte Übergabe

## Einfacher Einstieg

- Produkt wie bisher per Typenschild, Barcode, Rechnung/PDF und Foto anlegen.
- Jedes physische Exemplar bekommt eine zufällige Asset-ID mit 160 Bit. Bestehende Produkte werden einmalig migriert; die ID bleibt bei Neustart, Backup und registrierter Übergabe gleich.
- Bei „Identität & Besitz“ private Farbe, besondere Merkmale, Nachweise und selbst durchgeführten Abgleich ansehen. Kein Pflicht-Assistent und keine zusätzlichen Pflichtfelder.
- Eine EAN ist eine Modellkennung und wird nicht als individuelle Seriennummer behandelt.

## Modell, Exemplar, Tag und Konto

- Die optionale Firebase-Registrierung trennt Modelle (`models`), Exemplare (`assets`), unveränderliche Tag-Zuordnungen (`tagClaims`) und Konto-Zuordnung mit Ereignissen (`assets/.../events`).
- Modellangaben stammen vom Nutzer, nicht aus einer verifizierten Herstellerdatenbank.
- Hersteller und Seriennummer werden normalisiert und als Kombination auf Duplikate geprüft. Online wird ein SHA-256-Schlüssel der Kombination reserviert; die Seriennummer selbst wird nicht veröffentlicht.
- Die Reservierung verhindert parallele Doppelregistrierung derselben Kennung. Sie beweist nicht, dass der Erstregistrierende Eigentümer ist; falsche Nummern oder andere Hersteller-Schreibweisen können zu Fehlern führen.
- Eine vorhandene Registrierung desselben Kontos lässt sich für dasselbe Exemplar wieder mit der lokalen Akte verbinden. Private Belege und Preise werden dabei nicht rekonstruiert.
- Bei einer bestehenden Registrierung kann eine private Eigentumsanfrage / ein Streitfall hinterlegt werden. Eine Anfrage pro Konto und Asset, keine automatische Konto-Änderung oder amtliche Entscheidung.

## QR und NFC

- Einen zufälligen QR-Tag erstellen, ausdrucken und am Gegenstand anbringen. Produkt und Tag gemeinsam fotografieren und das Foto unter Unterlagen hinzufügen.
- Der Link lädt den aktuellen öffentlichen Serverstand auch ohne App oder Anmeldung. Normale QR- und NFC-Links sind kopierbar; es handelt sich nicht um kryptografische Sicherheits-Tags.
- Auf Android kann derselbe Link auf einen normalen NFC-Tag geschrieben werden. Das bestehende Gerät muss NFC unterstützen.
- Tag deaktivieren oder durch eine neue Kennung ersetzen. Alte Zuordnungen bleiben gesperrt; eine deaktivierte Kennung lässt sich nicht einem anderen Asset zuordnen oder erneut aktivieren.
- Ein gültiger Tag kann mit dem Exemplar an das nächste registrierte Konto übergehen. Der neue registrierte Nutzer kann ihn verwalten.

## Beidseitige Übergabe

1. „Übergeben“ → registrierte beidseitige Übergabe wählen. Falls nötig, ausdrücklich der optionalen Online-Registrierung zustimmen.
2. Empfänger erhält QR, Link oder einen selbst zu sendenden E-Mail-Entwurf und akzeptiert mit bestätigtem Konto.
3. Absender ruft den Übergabestand ab und bestätigt „Endgültig übertragen“.
4. Erst jetzt wechselt das registrierte Konto. Der Empfänger holt die Produktakte ab; ein unterbrochener Import kann erneut versucht werden.

- Freigegebene Fotos und Links werden übernommen; private Namen, Notizen, Standort, Merkmale, Kaufpreis, Belege und Verleihnotizen werden standardmäßig ausgeschlossen.
- Optional Empfänger-E-Mail festlegen. Die Übertragung ist sieben Tage gültig und kann vor Abschluss abgebrochen werden.
- Bei aktiver Verlust-/Diebstahlmeldung oder lokalem Verleih wird keine neue registrierte Übergabe angeboten.
- Alte Übergabelinks und Offline-Dateien bleiben Datenkopien. Sie verändern die neue registrierte Konto-Zuordnung nicht.
- „Registrierter Eigentümer“ bezeichnet die Konto-Zuordnung und ist kein Beweis für rechtmäßiges Eigentum.

## Verleih und Meldungen

- Verleih mit privatem Empfänger-Vermerk und geplantem Rückgabetermin; das registrierte Eigentümerkonto bleibt unverändert. Der Vermerk ist eine Nutzerangabe, keine Bestätigung des Entleihers.
- Der tatsächliche Besitzer wird nicht aus dem registrierten Eigentümer abgeleitet. Die Server-Zuordnung zum Besitzer bleibt unbestätigt; der lokale Verleih-Vermerk ist getrennt gespeichert.
- Verlust/Diebstahl und Wiederfinden werden als Nutzerangaben erfasst. Bei vorhandener Anmeldung wird versucht, den öffentlich registrierten Status zu aktualisieren; andernfalls steht „Online-Verluststatus noch nicht aktualisiert“.
- Ein normaler Verlust erzeugt weiterhin keinen Eintrag im normalen Lebenslauf. Das separate Identitätsprotokoll dokumentiert Statusänderungen.
- Der öffentliche Status zeigt weder Kontaktdaten noch Namen oder Seriennummern. „Keine aktuelle Meldung in PassPilot“ ist kein Beweis für einen rechtmäßigen Verkauf.

## Protokoll und Grenzen

- Registrierung, Tagwechsel, Meldungsänderungen und Kontoübertragung werden atomar mit fortlaufendem Stand und Serverzeit protokolliert.
- Firebase-Regeln verbieten App-Nutzern das Ändern und Löschen dieser Serverereignisse. Projektadministratoren haben weiterhin administrativen Zugriff.
- Der lokale Verlauf hat keine Bearbeiten-/Löschen-Funktion, ist technisch aber wie andere lokale Daten und Backups veränderbar. Er ist kein manipulationssicherer Nachweis.
- Keine behauptete „94 %“-Sicherheit, keine automatische Eigentums-, Echtheits- oder Diebstahlverifizierung. Eine Rechnung ist zunächst nur hinterlegt.
- Echte Sicherheits-NFCs / zerstörbare Etiketten, automatische Bilderkennung als physischer Fingerabdruck und eine unabhängige Prüf-/Streitstelle sind noch nicht umgesetzt. Dazu braucht es Hardware und einen verantwortlichen Prüfprozess.
- Keine Blockchain, keine bezahlten Firebase Functions, keine automatische KI-Prüfung. Spark bleibt innerhalb seiner Kontingente nutzbar.

## Prüfung

- Browser-Client gegen den echten Firestore-Emulator: Registrierung, Merkmale, private Verleihnotiz, Live-QR, Tag-Deaktivierung, Eigentumsanfrage und zwei Konten mit beidseitiger Übertragung.
- Datenbank-Regeln: gleichzeitige Doppelregistrierung, gefälschte Verifizierung, Privatsphäre, unveränderliche Ereignisse, Tag-Wiederverwendung, abgelaufene Übergabe, Abbruch und Entzug der Rechte des Vorbesitzers.
- Bestehende Scan-/PDF-/Foto-, Historien-, Backup-, Verkaufs-, Kalender-, Offline- und Sync-Abläufe geprüft.
