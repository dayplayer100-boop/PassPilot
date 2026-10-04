# Betrieb: Modelldaten und Abos

## Abo-Vorbereitung

Die Produktstaffeln aus 1.19 entfallen. Free ist die lokale Produktakte ohne Produktzählung. Vorläufig Plus 3 €/Monat (Sync, dynamische Pässe, Inventar-PDF, Wartungsassistent), Pro 7 €/Monat (Plus und begrenzte Online-/Dokument-KI). Produktdaten, grundlegendes Lesen/Bearbeiten, CSV und Backup/Wiederherstellung bleiben unabhängig vom Abo. Keine Bezahlung/Sperre ist jetzt aktiviert.

`billing-policy.js` und die identische Backend-Kopie definieren Ablauf und Funktionen. Nach vom Provider bestätigter Kündigung `accessUntil = max(bisheriges accessUntil, paidThrough, bestätigte Kündigung + 30 Tage)`. Wiederholte Kündigung behält das Datum. Widerruf/Erstattung und past_due gewähren keine Premium-Aktionen. Keine Datenlöschung. Gleichzeitige neue Zahlungen/Kündigung prüfen die aktuelle Kaufbindung; Provider-Anfragen müssen idempotent sein.

`billing-service.cjs` ist ein vorbereiteter Adapter ohne öffentlichen Endpoint. `verifyPurchase` muss den Anbieter serverseitig prüfen (Stripe/Google Play/App Store); Produkt, Preis, Kaufzustand und Kontobindung nicht aus Client-Tier/Ablaufdatum übernehmen. `cancelRenewal` muss die Kündigung beim Anbieter bestätigen, bevor die lokale Berechtigung als gekündigt gespeichert wird. Ein Webhook muss Erstattung, Verlängerung, Zahlungsprobleme und Kaufwiederherstellung abgleichen. Keine echte Provider-Anbindung existiert.

`purchaseBindings/{sha256(provider:originalPurchaseId)}` bindet einen Anbieter-Kauf dauerhaft an genau ein Konto. Google-Play-Kauf-Token/Originaltransaktion beziehungsweise Stripe-Abonnement-ID zuverlässig beim Anbieter validieren. Andere Konten können den Kauf nicht wiederverwenden. Kontowechsel nur als kontrollierter Support-/Transferablauf mit Widerruf des bisherigen Zugriffs, nicht durch Kopieren der Berechtigung. KI-Kontingent zählt im vorbereiteten Backend die Kaufbindung, nicht wechselnde Konten. Mehrfachkonten an sich können nicht vollständig verhindert werden; sie erhalten aber keine Premium-Rechte ohne einen eigenen geprüften Kauf.

`entitlements/{uid}` wird nur vom vertrauenswürdigen Server geschrieben: ownerUid, tier (plus/pro), status (active/cancelled/revoked/past_due), accessUntil und paidThrough (Firestore timestamps), purchaseBinding, autoRenew und gegebenenfalls cancelledAt. Die Adapter schreiben JavaScript-Date-Werte, die das Admin SDK als Firestore Timestamp speichert. Die Laufzeitpolitik unterstützt ISO-Strings, Date und Firestore-Timestamps. App-Clients können weder schreiben noch fremde Berechtigungen lesen. Eigene Daten/Cloud-Backups bleiben abrufbar; neue Premium-Uploads und öffentliche Online-Pässe werden bei Ablauf eingeschränkt.

Aktivierungsflags sind bewusst false: `BILLING_ENFORCED` in upgrades.js und dem KI-Backend sowie `billingEnforced()` in Firestore-Regeln. Nicht aktivieren, bevor echte Zahlungskäufe, Kündigung, Wiederherstellung, Widerruf, Serverzeit und kontogebundene Rechte vollständig getestet sind. Anbieter-Rechte müssen serverseitig durchgesetzt werden; UI-Sperren allein sind kein Schutz. Rein lokale Premium-Funktionen können durch modifizierte Apps umgangen werden.

Signierte Codes aus 1.19 bleiben nur eine private Testvorbereitung. Der private Aussteller-PEM gehört nicht in Git, Website oder APK. Historische Produkt-CAP-Codes vergeben keine serverseitigen Abo-Rechte. Für spätere Gutscheine ist ein kontogebundener, serverseitig geprüfter und einmalig einlösbarer Redemption-Flow nötig.

## Geprüfte Modelldaten

`modelFacts/{key}` nur nach verantwortlicher redaktioneller Prüfung über Administrator/Admin SDK veröffentlichen. KEY ist SHA-256 von `model|NORMALISIERTE_MARKE|NORMALISIERTES_MODELL|` (NFKC, trim, Großschreibung, Leerzeichen zusammenfassen). Felder: approved, brand, model, sourceUrl (HTTPS), checkedAt, optional price/currency, rating/ratingCount und specs (label, value, sourceUrl). Keine privaten Rechnungs-/Seriennummerndaten. Variantentreue und Aktualität prüfen, unbekannte Werte weglassen.

`modelReviewSubmissions` bleibt ein privater Moderationseingang. Clients können nicht freigeben. Ein Betreiberbereich und automatische Quellenrecherche sind noch nicht aktiv. Die Online-KI bleibt deaktiviert und erfordert später Providerzugang, sichere serverseitige Secrets, festes Kontingent und Kostenlimits.
