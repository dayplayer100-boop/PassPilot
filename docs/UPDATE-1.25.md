# PassPilot 1.25.0-test

Stand: 05.10.2026, Android Build 26. Bestehende Produkt-, Dokument- und QR-Daten bleiben erhalten. Zahlungen und lokale Premium-Sperren bleiben deaktiviert; vorhandene Plus-Funktionen sind im Testmodus nutzbar.

## Verträge und Termine

Der allgemeine Einstieg heißt „Eintrag hinzufügen“. Unter „Verträge & Termine“ erscheinen alle Arten; „Wartung & Prüfungen“ filtert weiterhin die Wartungen. Beide Einstiege bieten dieselbe Auswahl einschließlich Kredit. Eigene Arten lassen sich unter „Arten verwalten“ hinzufügen und einem passenden Formular zuordnen. Entfernen blendet Standardarten aus bzw. entfernt eigene Arten aus der Auswahl. Vorhandene Einträge bleiben erhalten und behalten ihre Bezeichnung, auch beim Bearbeiten und nach Neuladen. Die Auswahlkonfiguration ist eine lokale Geräteeinstellung; der Eintragsname wird im Produkt gespeichert und synchronisiert.

Bei Finanzierung: Gesamtsumme inklusive vereinbarter Zinsen/Gebühren, tatsächlich bezahlte Anzahlung, Anzahl und Betrag der regulären monatlichen Raten. Schlussrate = Gesamtsumme − Anzahlung − Anzahl × Rate. Berechnung erfolgt in ganzen Cent. Negative Schlussraten werden als widersprüchliche Eingaben abgelehnt. Eine eingegebene Gesamtsumme aktiviert die automatische Berechnung; für vorhandene Verträge ohne Gesamtsumme bleibt die manuelle Schlussrate erhalten. Bezahlte Raten werden ausschließlich nach Nutzerbestätigung gezählt. Finanzierungskarten und Diagramme haben größere Abstände und umbrechende Zahlen; Diagramme bleiben als Plus-Funktion vorbereitet und im Testmodus frei.

Termine können einmalig oder wiederkehrend sein (Tage/Wochen/Monate/Jahre). Erst „Heute erledigt“ erzeugt den Folgetermin, gerechnet ab der tatsächlichen Erledigung. Ein einmaliger Eintrag wird beendet. Ein Vertragsende begrenzt die Wiederholung. Garantieverlängerungen benötigen ein bestehendes physisches Produkt und das Ende der Verlängerung. Eigenständige Verträge stehen nicht in dieser Produktauswahl. Bei einer geänderten Zuordnung werden private Dokumente nicht automatisch verschoben.

## Firebase Authentication

Die öffentliche Projektkonfiguration zeigte beim Audit keine Freigabe für `passpilot-app.web.app` und keinen eingerichteten Google-Anbieter. Das neue Einrichtungsskript `scripts/setup-firebase-auth.py` bzw. `setup-auth.py` im fertigen Hosting-ZIP:

- nutzt ausschließlich die Anmeldung der ausführenden Google Cloud Shell;
- ergänzt die App-Domain, erhält bestehende Domains;
- aktiviert E-Mail/Passwort;
- übernimmt ausschließlich die öffentliche Client-ID eines bereits eingerichteten Google-Anbieters in `billingConfig/public.googleClientId`, ohne Billing-Einstellungen zu verändern;
- registriert bei Bedarf die Android-App `com.passpilot.app` und die öffentlichen SHA-1/SHA-256-Zertifikate der bestehenden signierten Test-App.

Google muss einmal in Firebase Authentication → Anmeldeanbieter aktiviert werden, mit Support-E-Mail und „Speichern“. Externe Client-ID-Zulassungsliste bleibt leer. Das Skript erfindet keine OAuth-IDs oder Secrets. Fehlt die Einrichtung, wird das ausdrücklich gemeldet; nach Aktivierung erneut ausführen. Falls API-/IAM-Zugriff fehlt, bricht es mit einer verständlichen Meldung ab. Es speichert und druckt keine Zugangstokens oder OAuth-Secrets.

Die Bestätigungs-E-Mail führt zurück zur App-Website. Web und Android fordern deutsche E-Mails an. Nach Registrierung und erneutem Versand erscheint ein Status mit Posteingang-/Spam-Hinweis; Rate-Limit-Fehler werden verständlich angezeigt. „Bestätigung prüfen“ aktualisiert den Account und den Firestore-Token ohne Abmelden. Tatsächlicher Empfang hängt von Firebase und dem Mailanbieter ab und muss mit dem eigenen Konto geprüft werden. Google-Anmeldung ist in den Browser-/Native-Brückentests geprüft; produktive Anmeldung setzt die Einrichtung im echten Projekt voraus.

## Veröffentlichungsweg

Projekt `passpilot-69f7c`, Site ausschließlich `passpilot-app`, https://passpilot-app.web.app. Firebase Spark erlaubt keine APKs. Die unverändert signierten APKs werden in GitHub Releases veröffentlicht; die stabilen Downloadpfade auf der Website leiten direkt zur passenden Datei weiter. Hosting-ZIP enthält Web-App, Regeln und `setup-auth.py`, keine APKs oder geheimen Schlüssel. Keine Nutzerdateien, echten Lizenzcodes oder privaten Signierdateien werden veröffentlicht.

Das Update-Skript in Google Cloud Shell entpackt das fertige Web-ZIP, führt `python setup-auth.py` aus und veröffentlicht Hosting/Firestore-Regeln. Kein bezahlter Tarif wird aktiviert. Bestehende App zur Aktualisierung nicht deinstallieren; lokale Daten vorher sichern. Android Play Protect kann trotz gleichbleibender Signatur eine erneute Prüfung durchführen; die App kann diese Betriebssystemprüfung nicht unterbinden.

## Validierung

Cent-genaue Finanzierung, Monatsgrenzen, Kredit-Schlussrate und Eingabefehler; benutzerdefinierte Arten und Entfernung ohne Verlust; bestehende Garantie-/Wartungsdaten; wiederkehrende und einmalige Erledigung; verpflichtende Produktwahl; Persistenz und öffentliche Freigaben. Responsive Formulare/Diagramme mit 320, 360, 412 und 768 px. Bestehende Übersicht, Kontoprüfung, Sync-/Feedback-/Navigationstests. Authentication-Tests verwenden isolierte Testantworten, keine echten Konten. Einrichtungs-Skript ist mit Mock-API auf erhaltende Teilupdates und Geheimnisfreiheit geprüft. Android: Compiler, Unit-Tests, Lint, beide ABI-Builds, Signaturprüfung.
