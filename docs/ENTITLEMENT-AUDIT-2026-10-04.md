# PassPilot: Audit und Umbauplan für Free, Plus und Family

Stand: 04.10.2026. Geprüfte lokale Codebasis: Android 1.20.0-test, versionCode 21.

## Auftrag und Umfang

Die neue Spezifikation ersetzt das vorbereitete Plus-/Pro-Modell. Ziel:

- Free speichert und organisiert Produkte.
- Plus übernimmt laufende Automatisierung und Überwachung, geplant 3,99 €/Monat.
- Family organisiert einen Haushalt, geplant 5,99 €/Monat mit bis zu fünf Mitgliedern.
- Jahrespläne und Business werden strukturell vorbereitet, nicht als fertige Angebote dargestellt.

Diese Änderung enthält ausschließlich den technischen Audit und einen überprüfbaren Implementierungsplan. Abo-Logik, Firestore-Regeln, Produktdaten und veröffentlichte Apps wurden dabei nicht geändert. Es wurden keine Zahlungen aktiviert. Die tatsächlichen Daten und Einstellungen des produktiven Firebase-Projekts wurden nicht eingesehen; Aussagen darüber wären ohne authentifizierten Zugriff nicht belastbar.

## A. Tatsächlich vorhandene Architektur

| Bereich | Implementierung und Befund |
|---|---|
| Android | Java, Gradle, WebView; `app/build.gradle`, `app/src/main/java/com/passpilot/app/`. Kein React Native oder Expo. |
| Oberfläche | Gemeinsame Vanilla-JavaScript-Dateien in `app/src/main/assets/app/`; Web-Ergänzungen in `web/`. Kein TypeScript, React oder Next.js. |
| Web-Build | `scripts/build-web.cjs`, erzeugtes `web-dist`; Firebase-Hosting-Paket. |
| Lokale Daten | `app.js`: Produktzustand in localStorage `passpilot-state-v2`, Dokumentdateien in IndexedDB `passpilot-files-v1`. Lokale Daten sind nicht automatisch verschlüsselt. |
| Cloud | Firebase Auth und Firestore über REST; `firebase.js`, `sync.js`, `firebase/firestore.rules`. Kein SQL, ORM oder SQL-Migrationssystem. |
| Auth | E-Mail/Passwort, Token-Erneuerung; Firestore-Funktionen verlangen bestätigte E-Mail. Sitzung im Arbeitsspeicher. Kein vorhandenes umfassendes Rollen-/Mandantensystem. |
| Synchronisation | Optionaler verschlüsselter Vault und Chunks, getrennt von öffentlichen Pässen. Ein Downgrade darf Wiederherstellung und eigene Daten nicht sperren. |
| Tarife | `billing-policy.js`: Free 0 €, Plus 3 €, Pro 7 €; zentral definierte Featurelisten, Produktstaffeln nicht mehr als aktiver Haupthebel. |
| Entitlements | `entitlements/{uid}`, `purchaseBindings/{hash}`; serverseitiges Schreiben vorgesehen, Client-Schreibzugriff durch Regeln gesperrt. Nur User-Kontext, keine kontextbezogene Family-Auswertung. |
| Billing | `assistant-backend/functions/billing-service.cjs`: vorbereitete Kaufbindung und Kündigung mit injizierten Provider-Adaptern. Kein eingerichteter Zahlungsanbieter und keine fertige öffentliche Billing-API. |
| Webhooks | `billingEvents` ist clientseitig gesperrt, aber es gibt keinen implementierten signierten Webhook-Prozess mit Ereignisledger und Reihenfolgeschutz. |
| KI-Backend | Node-20-Firebase-Functions-Entwurf: `index.js`, `handler.cjs`, `document-handler.cjs`. Auth-/E-Mail-Prüfung und transaktionale Nutzungskontingente vorhanden; kein produktiver Zahlungsbetrieb. Deployment-/Secret-Status nicht im Cloudprojekt geprüft. |
| Premium-Prüfung | Frontend `upgrades.js`, Backend `index.js`, Regeln: Enforcement ausdrücklich deaktiviert. Eine Aktivierung dieser Schalter allein wäre nicht ausreichend sicher oder kompatibel. |
| Household | `households/{id}` ist bislang eine einzelne Produktfreigabe mit Owner und bis zu zehn Konto-IDs, kein gemeinsamer Haushalt mit kanonischen Produkten und Membership-Rollen. |
| Identität | `identity.js`: zufällige Asset-/Tag-IDs, Hersteller-Claims, private Assets, öffentliche Minimalansicht, atomare Ereignisse und registrierte Übergaben. Diese Architektur weiterverwenden. |
| Übergabe | Klassische Kopie in `handoffs` und registrierter Eigentumswechsel in `assetHandoffs`; Letzterer verlangt Käuferannahme und Verkäuferbestätigung. Noch keine zentrale Transfer-Entitlement-Prüfung. |
| QR | Offline-Snapshots sowie dynamische Online-Pässe; zufällige 40-stellige IDs. Bei aktivierter alter Billing-Regel wären öffentliche Online-Pässe nach Aboablauf nicht mehr lesbar. |
| Hintergrund | Native tägliche AlarmManager-Prüfung in `BackupReminderReceiver.java`; außerdem Linkprüfungen und Sync im Client. Keine vorhandene Cloud-Warranty-Queue oder Notification-Scheduler-Architektur. |
| Analytics | Kein integrierter Conversion-Event-Prozess gefunden. Eine Firebase-Konfiguration mit measurementId beweist keine aktivierte Analytics-Integration. |
| Tests | Browser-Tests unter `tests/`, native Unit-Tests unter `app/src/test/`, Firestore-Emulatortests unter `firebase/`. |

## B. Probleme, priorisiert

### Vor jeder Aktivierung von Premium-Sperren beheben

1. **Entitlement-Abruf funktioniert für normale Auth-UIDs nicht.** `upgrades.js:refresh()` ruft `PassPilotFirebase.get('entitlements', uid)` auf. `firebase.js:get()` erlaubt jedoch ausschließlich 40-stellige Freigabe-IDs. Eine typische Firebase-UID wird vor dem Netzaufruf abgewiesen; der Fehler wird von refresh verschluckt. Mit aktivierten Sperren würden Nutzer auf Free fallen. Reproduziert im Audit. Lösung: getrennte, collectionspezifische ID-Validierung, weiterhin streng für öffentliche Tokens; eigene UID nicht blind vom Client übernehmen.

2. **Kündigung entspricht nicht dem neuen Auftrag.** `billing-policy.js:cancel()` gewährt aktuell mindestens Kündigungszeitpunkt + 30 Tage. Die neue Logik verwendet ausschließlich das bezahlte Periodenende. Status und Verlängerungsflag getrennt modellieren; vorhandene zugesagte Rechte bei einer Migration nicht still verkürzen.

3. **QR-Downgrade würde einen physischen Sticker unbrauchbar machen.** `firestore.rules` verlangt im Produktionsmodus Premium für den öffentlichen Passabruf. Einfach die alte payload-Leseregel freizugeben wäre ebenfalls falsch: Damit würden sämtliche früher freigegebenen Smart-Daten sichtbar bleiben. Benötigt wird ein stabiler Resolver mit getrennten öffentlichen Basic- und Smart-Projektionen.

4. **User-/Household-Berechtigungen fehlen.** Ein MEMBER kann bisher keinen Family-Plan für gemeinsame Ressourcen nutzen. Die vorhandene Freigabe darf nicht blind zur neuen Household-Mitgliedschaft umgedeutet werden.

5. **Feature-Checks sind teilweise nur lokal.** Inventar-PDF und Wartungsassistent sind Client-Funktionen; lokale OCR ist frei nutzbar. Solche Checks sind veränderbar und kein Schutz eines bezahlten Serverdienstes. Premium-Serveraktionen benötigen eigene Auth-, Ressourcen- und Entitlement-Prüfung.

6. **Provider-Lifecycle ist unvollständig.** Keine authentifizierten, idempotenten, gegen ältere Ereignisse geschützten Webhooks; keine vollständige Trial-/Grace-/Past-Due-Auswertung. Ein Kaufbinding verhindert Kaufweitergabe zwischen Konten, ersetzt aber diese Logik nicht.

7. **KI-Featurezuordnung ist zu grob.** Beide Functions verwenden dieselbe quota-Funktion mit `assistantAI`. Dokumentanalyse braucht ihren eigenen Feature-Key und Kostenbudget; Chat darf nicht unbeabsichtigt Dokumentrechte verleihen.

### Weitere Zielabweichungen

- Keine Lifetime-Trial-Reservierungen, keine normalisierten Trial-Identitäten und kein Risk-Evaluator.
- Keine typed Entitlements für Limits oder Konfiguration; Regeln wiederholen eine Teilmenge der Planlogik.
- Native Erinnerungen prüfen gespeicherte Einstellungen, nicht Subscription-Kontext. Keine Cloud-Job-Entitlement-Auswertung vorhanden.
- Keine vollständige serverseitige Kontolöschungsfunktion gefunden. Lokales Zurücksetzen, Cloud-Vault-Löschen und Firebase-Verbindung entfernen sind keine Kontolöschung.
- Household-Freigaben übertragen lokale Kopien; Dokumente und gemeinsame Änderungsrechte entsprechen noch nicht Family.
- Preise und Begriffe im UI entsprechen nicht dem neuen Ziel; root `package.json` nennt noch 1.18, Android 1.20. Release-Metadaten künftig konsistent erzeugen.
- Es gibt kein Anzeichen für Datenlöschung bei Aboablauf im geprüften Billing-Code. Dennoch sind Erhalt von Produkten, Dokumentdateien und freigegebenen Links ausdrücklich als Regressionstests nötig.

## C. Verbesserungen an der Spezifikation

1. **Ownership geht vor Entitlement.** Household-Kontext und Besitzer werden aus der Ressource und bestätigter Mitgliedschaft geladen. Ein frei mitgesendetes householdId darf keine Rechte gewähren. Direkte Plus-Rechte berechtigen nicht zum Bearbeiten fremder Daten.
2. **Free bleibt ohne Anmeldung lokal nutzbar.** Serverbasierte Smart-Dienste verlangen Auth. E-Mail-Verifizierung gilt für Trials; eine Telefonnummer ist kein Zwang für das Archiv.
3. **Offline-Schutz realistisch halten.** Kostenintensive Cloud-Funktionen lassen sich serverseitig absichern. Manipulierte lokale Web-/Android-Dateien können lokale Berechnungen nicht verlässlich als Abo schützen. Laufender Servernutzen ist der wirtschaftliche Schutz; kein Versprechen manipulationssicherer Client-Sperren.
4. **Historie bleibt lesbar.** Bestehende Wartungen, Reparaturen und Eigentumsereignisse bleiben sichtbar/exportierbar. Plus finanziert neue Automatisierung und Aufbereitung, nicht Zugang zu eigenen Nachweisen.
5. **Family-Downgrade gesondert definieren.** Eigentum und gemeinsame Daten bleiben erhalten. Berechtigte Mitglieder dürfen vorhandene Daten weiterhin lesen und grundlegend exportieren; neue Family-Automatisierung und Einladungen pausieren. Austritt oder Ausschluss entzieht Rechte als eigenständiger Authorization-Vorgang.
6. **Garantie ist kein universeller 24-Monatswert.** Gesetzliche Gewährleistung, Herstellergarantie und gekaufte Zusatzgarantie unterscheiden. OCR-Werte als überprüfbare Vorschläge kennzeichnen und keine Fristen erfinden.
7. **Testcredits sind Aktionsrechte, keine dauerhaften Smart-Abos.** Ein einzelner OCR-Credit kann eine einmalige Analyse erlauben. Ein Smart-QR-Test braucht eine ausdrücklich begrenzte Laufzeit, sonst entsteht ein dauerhaftes Gratisrecht. Scannen verbraucht keine Trial-Credits.
8. **Trial-Identitäten nur aus vertrauenswürdigen Quellen.** Provider-/Store-Nachweise und bestätigte Telefonnummern nicht aus unbestätigten Client-Hashes übernehmen. Hashing allein ist keine Anonymisierung; bei Bedarf serverseitiges HMAC, minimale Speicherung und Löschfristen. Gleiche bestätigte Trial-Identität verhindert Doppeltrial unabhängig vom optionalen Risk-Score.
9. **Risk Engine erst mit nützlichen Signalen ergänzen.** Kein invasives Fingerprinting als Startvoraussetzung. Kostenbudget, atomare Lifetime-Credits, Rate Limits und verifizierte E-Mail zuerst; Free oder zahlende Kunden nicht aufgrund eines Scores sperren.
10. **Free-Fundkontakt braucht ebenfalls Missbrauchsschutz.** Ein anonymes Formular erfordert Rate Limits, Größenbegrenzungen und riskabhängige CAPTCHA-Prüfung. Keine automatische Veröffentlichung der Eigentümerdaten.
11. **Echte Zahlungen bleiben deaktiviert.** Preise zentral vorbereiten. Ein nicht eingerichteter Provider oder signierter lokaler Testcode darf keine produktiven Rechte erzeugen. Neue Freischaltcodes später serverseitig als begrenzte, nachvollziehbare Promotion einlösen.
12. **Kosten prüfen, keine kostenlose Cloud garantieren.** Firebase-Functions, KI, SMS und regelmäßige Jobs können kostenpflichtige Infrastruktur benötigen. Der Audit aktiviert keine davon; kein zweites Backend neben Firebase einführen.

## D. Zielarchitektur im vorhandenen Stack

Gemeinsame deterministische JavaScript-Policy statt neuer TypeScript-/SQL-Architektur. Server löst den Kontext auf; dieselbe Policy entscheidet für APIs und Jobs. Frontend bekommt nur die für seine Darstellung notwendigen Rechte.

```text
Firebase Auth → Ressourcen-/Membership-Authorization → Entitlement-Evaluator
                                                        ├ User-Subscription
                                                        ├ Household-Subscription
                                                        ├ typisierte Planwerte
                                                        ├ begrenzte Overrides
                                                        └ reservierbare Trial-Rechte
                                                             ↓
                                                    geschützte Serveraktion
```

Firestore-Regeln können keine Node-Funktion aufrufen. Deshalb die Regel-Policy aus der zentralen Definition ableiten oder ein servergeschriebenes Zugriffsmodell verwenden, mit Paritätstests. Subscription-Enddaten müssen auch innerhalb der Regeln wirksam bleiben; kein dauerhaft gecachtes `isPremium=true`.

Entscheidung enthält Feature, Scope, Grund und Gültigkeitsende. Numeric Limits werden separat atomar geprüft; `hasEntitlement=true` ist keine Quota-Reservierung. Unbekannte Pläne/Features liefern den sicheren Free-Default. Rollen begrenzen Aktionen zusätzlich.

## E. Konkreter Migrations- und Implementierungsplan

### Phase 1: Subscription-Domain und Kompatibilität

Dateien: vorhandene `billing-policy.js`, Backend-Kopie `billing-policy.cjs`, `billing-service.cjs`, `upgrades.js`, `tests/billing-policy.cjs` erweitern. Keine erfundenen Services oder Tabellen voraussetzen.

- Zentrale FREE/PLUS/FAMILY-Definitionen, Feature-Keys und Limits; monatlich/jährlich vorbereiten.
- Versionierter Adapter für bestehende `tier`, `status`, `paidThrough`, `accessUntil`, `autoRenew`.
- ACTIVE/TRIALING/PAST_DUE/GRACE_PERIOD/EXPIRED/CANCELED plus `cancelAtPeriodEnd`; Periodenende, Trialende und Grace-Ende getrennt.
- XOR-Validierung USER/USER-ID oder HOUSEHOLD/HOUSEHOLD-ID für serverseitige Subscription-Schreibvorgänge; Firestore besitzt keinen SQL-CHECK-Constraint.
- Alt-Pro nicht blind nach Plus mit geringeren Rechten mappen: Legacy-Rechte und bereits zugesagte accessUntil erhalten, Vertrags-/Preisänderung separat behandeln.
- Trockenlauf mit Anzahl/Typ der vorhandenen Datensätze und Konfliktliste vor produktivem Backfill. Lokaler Audit kann nicht feststellen, welche Entitlement-Dokumente tatsächlich in Firebase existieren.
- Additive Felder und versionierter Reader ermöglichen Rollback. Keine Produkt-/Dokumentmigration in dieser Phase.

Tests: genaue Zeitgrenzen, Kündigung ohne neue 30 Tage, Wiederholung, gültige Legacy-Zusagen, ungültige Datensätze, UTC/Timestamp-Formate, reaktivierte Rechte.

### Phase 2: Contextual Entitlements und Household-Modell

- UID-Abruffehler beheben, ID-Validatoren nach Collection trennen.
- Bestehende Household-Snapshot-Freigaben weiter lesen; neue echte Haushalte versionieren statt automatisch umdeuten.
- Neue Membership-Dokumente mit OWNER/MEMBER, Einladung/Annahme und atomarem Mitgliederlimit; Owner zählt zum Fünferlimit.
- Subscription-Scope und Ressourcenbesitz serverseitig ableiten. Family-Rechte gelten für Household-Ressourcen, nicht automatisch für private User-Ressourcen.
- Schema/Indexdatei erst anhand dieser konkreten Queries ergänzen. Keine SQL-Indizes nach Firebase übertragen.

Tests: eigene/fremde Ressourcen, manipulierte householdId, ausgetretene Mitglieder, private Ressourcen außerhalb Household, Downgrade-Lesezugriff, Ownerwechsel.

### Phase 3: Backend-Guards, Provider-State und Quotas

Vorhandene `index.js`, Handler und Firestore-Regeln gezielt erweitern.

- Kostenpflichtige Chat-/Dokumentaktionen separat schützen; keine aktivierte Prüfung auf nur Client-Eingaben stützen.
- Provider-Adapter, Signaturprüfung, Event-ID-Deduplizierung und Provider-Zeit/Version; Refund/Revocation getrennt von Kündigung behandeln.
- Serverseitiger lokaler Subscription-State statt Billing-Provider-Liveaufruf pro Feature.
- Cached Ergebnisse an Ablaufzeit begrenzen und bei Subscription-/Membership-Änderung invalidieren.
- Regeln/Backend zuerst kompatibel bereitstellen, anschließend passende Clients; Enforcement erst nach erfolgreicher Validierung und Provider-Anbindung.

Tests: gefälschte Proofs, doppelte/ältere Webhooks, Kündigung parallel zur Zahlung, Owner-Prüfung zusätzlich zum Feature, Budget-/Quotagrenzen. Kein echter Zahlungsaufruf im Test.

### Phase 4: Downgrade, Reaktivierung und Hintergrunddienste

- Native AlarmManager-Erinnerungen und vorhandene Einstellungen behalten; Monitoring anhand zeitlich begrenzter verifizierter Rechte pausieren.
- Offline-Strategie explizit begrenzen: signierte Berechtigungsnachweise können Darstellung unterstützen, ersetzen Serverprüfungen nicht.
- Cloud-Jobs erst einführen, wo benötigt: Kandidaten vorfiltern und unmittelbar vor Ausführung mit derselben Policy auswerten; Trial/Grace/Family einschließen.
- Keine Iteration über alle Produkte zum Setzen von Premium-Flags. Konfiguration bleibt unverändert, Reaktivierung nutzt dieselben Termine.
- Basic Backup-Erinnerungen und manuelle Kalendereinträge nicht versehentlich als Warranty-Premium sperren.

Tests: vor/nach Ablauf, verzögerte Jobs, Reaktivierung ohne Neueinrichtung, Daten-/Dokumenterhalt. Native Hardwaretests zusätzlich zur Policy nötig.

### Phase 5: Stabiler QR-Resolver und Transfers

- Bestehende `#online`, Offline- und Asset-Links erhalten; Resolver unter bestehender Firebase-Domain ergänzen, Legacy-URLs weiter auflösen.
- Öffentliches Basic-Modell ausdrücklich minimieren; Smart-Ansicht nur nach gültiger Owner-/Household-Policy. Kein Billing-Status oder privates Dokument im öffentlichen Payload.
- Kündigung pausiert Smart-Service, explizite Deaktivierung durch Owner bleibt wirksam. Produktlöschung, Tokenwiderruf und Aboablauf sind unterschiedliche Vorgänge.
- Registrierten Übergabeflow erweitern statt ersetzen: Entitlement beim Start/Abschluss klar definieren; laufende Angebote nicht nach Bezahlung des Käufers ausrichten.
- Käufer muss kein Plus kaufen, um einen berechtigt gestarteten Transfer anzunehmen. Verkäuferrechte und abgelaufene Angebote serverseitig prüfen; keine zweite Ownership durch Token-Replay.

Tests: identische QR-URL vor/nach Downgrade/Reaktivierung, Tracking aus für Basic, widerrufener Pass, anonyme Privacy, Legacy-Code, einmaliger Transfer, private Daten ausgeschlossen.

### Phase 6: Lifetime-Trials und verhältnismäßiger Abuse-Schutz

- Serverseitige Identitäten/Redemptions/Reservierungen; transaktionale Prüfung und Verbrauch, Idempotency-Key pro Aktion.
- Providerjob außerhalb der Transaktion; bei technischem Fehler einmalige Rückgabe, bei Retry kein Gratis-Doppelaufruf. Globale Kostenbudgets zusätzlich.
- E-Mail-Verifizierung, Rate Limits und gegebenenfalls App Check/CAPTCHA; riskbasierte Zusatzsignale nur bei belegtem Bedarf.
- Trial-Ablehnung lässt Free und normales kostenpflichtiges Abo verfügbar.

Tests: paralleler letzter Credit, Accountwechsel mit gleicher bestätigter Identität, technische Fehler, doppelte Rückgabe, Score-False-Positive ohne Accountblock.

### Phase 7: Premium-UI, Family und Beobachtbarkeit

- Zentrale Vanilla-JS-Komponente für available/locked/trial/paused/payment-failed/family-required; keine neue React-Abhängigkeit.
- Kontextbezogene Upgrade-Quellen und verständliche Kündigungsseite mit tatsächlichem Datum.
- Server-Kontolöschung getrennt vom Subscription-Lifecycle ergänzen; Haushalts-Ownership vorher auflösen.
- Kritische Audit-Ereignisse und sparsame technische Logs; Analytics nur mit bewusst aktivierter Integration/Datenschutzentscheidung, ohne Rechnungs- oder Seriennummerninhalte.

## F. Anleitungssuche: geprüfter Ist-Zustand

Dateien: `manuals.js`, `improvements.js:findManual`, `web/web-tools.js`, Java `ManualFinder.java`, `AppTools.java`, `tests/manuals.cjs`, `ManualFinderTest.java`.

- Marke und Modell sind erforderlich. Eine EAN kann eine externe Google-Suche öffnen; eine Seriennummer wird nicht als Suchkennung versendet.
- Android nutzt bekannte Herstellerdomains, Bing-RSS und einige Herstellerseiten. Modellzuordnung wird am Treffertext/Link geprüft. Netzwerkfehler werden dabei verschluckt und erscheinen als leere Trefferliste.
- Web `findManual` durchsucht ausschließlich eine statische Sony-WH-1000XM5-Zuordnung. Eine allgemeine automatische Websuche ist damit nicht implementiert.
- Für leere Ergebnisse existiert bereits ein Status: „Kein sicher zugeordnetes Hersteller-Ergebnis gefunden …“. Er unterscheidet jedoch keinen fehlenden PDF-Treffer von Herstellerseite, unbekanntem Hersteller oder Suchausfall.
- PDF-Kandidaten werden oft anhand der URL erkannt. Das ist noch keine Bestätigung des PDF-Inhalts oder richtigen Modells. Android prüft die hinterlegte Sony-PDF zusätzlich per HEAD; der tatsächliche Download prüft die Datei gesondert.
- Web-Downloads können an CORS scheitern. Das bedeutet nicht, dass keine Anleitung existiert.
- UI kann eine Anfrage für ein bereits geschlossenes Produkt ignorieren, unterscheidet aber nicht sauber mehrere parallele Suchanfragen im selben Ergebnisfeld. Auch ein fehlendes Ergebnisfeld wird vor dem Zugriff nicht geprüft.
- Vorhandene Browser-Tests decken sichere Links und Speichern ab, aber nicht vollständig die automatische Suche, PDF-Validierung und ihre Fehlerzustände.

### Geplanter einfacherer Ablauf

Ein Hauptbutton „Anleitung finden“. Nach bestätigter Marke/Modell optional automatisch suchen, ohne eigene Angaben zu überschreiben. Suche nur mit öffentlichen Modellangaben; keine Seriennummer oder Rechnungsadresse versenden.

| Zustand | Rückmeldung und nächste Aktion |
|---|---|
| Angaben fehlen | „Für die Suche fehlen Marke oder Modell.“ Direkt die fehlenden Felder bearbeiten. |
| Suche läuft | „Anleitung wird gesucht …“; derselbe Auftrag nicht mehrfach starten. |
| PDF gefunden | Quelle, Modell, Sprache und Prüfstatus zeigen; „Öffnen“ und „Beim Produkt speichern“. |
| Nur Herstellerseite | „Herstellerseite gefunden, aber noch keine passende PDF.“ Seite öffnen oder Link speichern. |
| Keine Zuordnung | „Keine passende Anleitung gefunden.“ Einmal erneut versuchen oder Hersteller-/Modellsuche öffnen. |
| Quelle nicht unterstützt | „Für diesen Hersteller gibt es noch keine automatische Suche.“ Passende Supportsuche anbieten. |
| Offline/Suchfehler | „Suche gerade nicht möglich.“ Ursache und Wiederholen; nicht behaupten, es gebe keine Anleitung. |
| Download blockiert | „Anleitung gefunden; direkter Download wird vom Hersteller blockiert.“ Link bleibt speicherbar. |

Weitere Umsetzung:

1. Einheitliches strukturiertes Ergebnis für Android und Web: Suchstatus, Kandidaten, PDF-Status, Quelle und Prüfzeit. Alte `results`-Antworten per Adapter kompatibel lesen.
2. Gemeinsame Hersteller-/Modellzuordnungen; Android-Suche beibehalten. Breitere Websuche über begrenzten Firebase-Resolver nur nach Kosten-/Deploymentprüfung. Kein beliebiger offener URL-Proxy und kein Google-HTML-Scraping im Browser.
3. Positive und kurzlebige negative Modell-Ergebnisse cachen, erneute Suche ausdrücklich ermöglichen; Fehler nicht als dauerhaften Negativtreffer speichern.
4. HTML-/PDF-Ziele, Redirects, Content-Type und Dateisignatur prüfen; serverseitig private/Loopback-Adressen und DNS-Rebinding verhindern, Größen-/Zeitlimits einhalten.
5. PDF-Inhalt bei vertretbarem Aufwand auf Modell/Sprache prüfen; bei unsicherer Zuordnung nur Vorschlag, niemals „100 % verifiziert“ behaupten.
6. PDF mit einer bewussten Aktion offline beim Produkt ablegen; Duplikate vermeiden. Herstellerseite niemals als PDF-Datei speichern. CORS und Android-Download getrennt behandeln.
7. Suchaufträge an Produkt-ID und aktuelle Marke/Modell binden; ältere Antworten ignorieren, beim Schließen abbrechen bzw. nicht mehr anzeigen.
8. Zusatzoptionen unter „Weitere Möglichkeiten“ reduzieren; keine sechs gleichgewichtigen Hauptbuttons.

### Neue Tests für diesen Umbau

- Kein Treffer, nur Herstellerseite, offline, Timeout, unbekannte Marke, kaputte Antwort und mehrfacher Klick.
- Wechsel von Produkt/Modell während laufender Suche, geschlossene Ansicht und verspätete Ergebnisse.
- Falsches Nachbarmodell, falsche Sprache, kaputte PDF, HTML unter `.pdf`, Redirect auf fremde/private Domain.
- Erfolgreiches Speichern und erneutes Öffnen offline; Link-Fallback bei CORS; keine doppelte Datei.
- Mobile Statusanzeige/Screenreader und weiterhin keine privaten Suchdaten.

## G. Tatsächlich ausgeführte Prüfungen dieses Audits

- `node tests/billing-policy.cjs`: bestanden. Bestätigt die bisherige Policy mit zusätzlichen 30 Tagen, nicht die neue Zielpolicy.
- `NODE_PATH=… node tests/manuals.cjs`: bestanden. Link-Sicherheit, Bearbeiten/Speichern, Persistenz, lokale PDF, Privacy und responsive Darstellung.
- Isolierte Ausführung von `firebase.js:get()` mit einer normalen Firebase-UID: Fehler „Ungültige Freigabe-ID“ reproduziert.
- Browser-Aufruf von `PassPilotPlus.findManual()` mit leerer Antwort: bestehender Kein-Treffer-Text bestätigt. Abgelehnter Web-Aufruf zeigt den Fehlertext.
- Native Kandidaten-/Domain-Testcode geprüft; native Live-Websuche und echtes Android-Gerät in diesem Audit nicht erneut ausgeführt.
- Keine neuen Compiler-/Linter-/DB-Migrationsresultate behauptet: Es wurde keine Implementierungsphase begonnen. Cloud-Regeln/Provider und reale Zahlungen nicht live getestet.

## Entscheidung vor dem Umbau

Der geplante erste Implementierungsschritt ist Phase 1 mit kompatibler Subscription-Policy und korrigiertem UID-Abruf, weiterhin ohne aktivierte Zahlungen oder Sperren. Die Anleitungssuche kann als eigenständige kleine UX-Änderung danach bzw. parallel in der Umsetzung erfolgen, ohne das Billing vorzeitig zu aktivieren.

Für jede weitere Phase werden konkrete Schema-/Dateiänderungen, Migrationswirkung und Tests vorab festgelegt. Produktive Backfills erfolgen erst nach einem echten Cloud-Daten-Trockenlauf. Bestehende Daten, Asset-Identitäten und QR-Zuordnungen bleiben getrennt vom Abo-Lifecycle.
