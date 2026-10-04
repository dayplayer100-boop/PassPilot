# PassPilot 1.21 – Vergleichen, erkennen und freischalten

- Direkte Suche bei Geizhals und idealo mit Marke/Modell oder gültiger EAN; auch bei nicht erreichbaren Zusatzdaten. Keine Seriennummern oder Rechnungsdaten in der Suche.
- Fehler beim Abruf von geprüften Modelldaten korrigiert: 64-stellige Modell-IDs werden akzeptiert. Auth-UIDs für eigene Entitlements und Lizenzen werden separat geprüft.
- Eigener Bereich für Free (0 €), Plus (3,99 €/Monat) und Family (5,99 €/Monat), mit Code-Eingabe. Buchung bleibt bis zur Zahlungsintegration deaktiviert; Family-Haushaltsfunktionen sind weiterhin in Vorbereitung.
- Signierte Dauerfreischaltung für alle vorhandenen lokalen Premium-Funktionen. Vorbereiteter Cloud-Einlösedienst bindet einen Code transaktional an ein bestätigtes Konto. Code und Signierschlüssel werden nicht veröffentlicht.
- Automatische Erkennung heller Typenschilder auf dunklem Hintergrund, engerer Ausschnitt, Schräglagenkorrektur und zusätzliche OCR-Versuche im Browser. Android-Erfassung versucht bei schwachem Ergebnis einen vorbereiteten Ausschnitt.
- Rowenta als Marke ergänzt; Erkennung prüft Angaben statt Seriennummern zu erfinden.
- Anleitungssuche unterscheidet Herstellerseite ohne PDF, fehlende automatische Browserzuordnung und Fehler. Verspätete Suchantworten überschreiben keine neuere Anfrage.

## Grenzen und Veröffentlichung

Echte Zahlungen, allgemeine Web-Anleitungssuche und vollständige neue Entitlement-/Family-Architektur sind noch nicht aktiviert. Das bisherige Billing-Lifecycle-Modell bleibt kompatibel; die neue Abo-Ansicht bezeichnet das zukünftige Angebot. Der Audit-/Migrationsplan gilt weiter.

Das Hosting-ZIP enthält keinen Cloud-Functions-Deploy. Für Cloud-Dauercodes muss der Eigentümer den vorbereiteten passpilotRedeemLicense-Dienst separat veröffentlichen; dafür kann ein kostenpflichtiger Firebase-Tarif nötig sein. Die lokale signierte Freischaltung funktioniert ohne diesen Dienst. Keine automatische Tarifumstellung.

Ein unscharfes oder sehr kleines Typenschildfoto kann weiterhin unvollständig erkannt werden. Tests mit synthetischem schrägem LG-Typenschild ersetzen keinen Test des Originalfotos oder der realen Kamera.
