# Optionale echte Online-KI – noch nicht aktiviert

Der normale PassPilot-Download bleibt beim bisherigen Firebase-Spark-Betrieb und aktiviert keine kostenpflichtigen Funktionen. Die lokale Chat-Hilfe ist ohne Konto kostenlos verfügbar.

Dieser Backend-Entwurf nutzt Firebase Cloud Functions und die OpenAI Responses API. **Er benötigt eine bewusst freigeschaltete Abrechnung (Firebase Blaze und OpenAI-API-Konto) und ist nicht kostenlos zugesichert. Nicht automatisch deployen.** Die Frage wird nur nach Online-KI-Auswahl an den Anbieter geschickt. Keine Produktakten, Rechnungen oder Seriennummern werden automatisch angehängt.

Vor Aktivierung Kosten prüfen, passenden Datenschutzhinweis vervollständigen und Provider-Verträge prüfen. Limits: 5 Fragen je Minute / 30 je Tag pro bestätigtem Konto, 100 je Tag insgesamt, höchstens eine Functions-Instanz, max500 Ausgabetokens. Diese Limits sind keine Garantie für null oder einen festen Höchstbetrag: Infrastruktur, unberechtigte Anfragen und andere Projektnutzung können Kosten verursachen.

1. In einer privaten Arbeitskopie Functions in den bereits bestehenden Firebase-Ordner integrieren. Abhängigkeiten im Ordner functions mit `npm ci` installieren.
2. API-Schlüssel **nur** im eigenen Terminal mit `npx firebase-tools@14.18.0 functions:secrets:set PASSPILOT_OPENAI_API_KEY --project passpilot-69f7c` hinterlegen. Niemals im Chat, Browsercode oder APK speichern.
3. Nach bewusster Kostenfreigabe `npx firebase-tools@14.18.0 deploy --only functions --project passpilot-69f7c` verwenden.
4. Die `/api/assistant`-Rewrite aus firebase.json mit der bestehenden Hosting-Konfiguration zusammenführen; bestehende Header, Regeln und public-Ordner erhalten. Anschließend die öffentliche Capability-Datei `public/assistant-config.js` auf `window.PassPilotAssistantConfig={enabled:true};` setzen und Hosting neu veröffentlichen. Android benötigt dasselbe aktivierte Flag in seinem neuen Build.
5. Konten/E-Mail-Verifizierung, unbestätigte und fremde Zugriffe, CORS, Limits sowie echte Antwort prüfen. App Check vor breiter Freigabe zusätzlich evaluieren. assistantUsage-Dokumente enthalten nur Nutzungszähler; optional Firestore-TTL für expiresAt aktivieren, damit alte Zähler automatisch bereinigt werden. Client-Zugriff bleibt durch PassPilot-Regeln gesperrt.

Der vorhandene Verschlüsselungsschlüssel der Synchronisation wird nie an die KI weitergegeben. KI-Antworten sind Hilfe-Texte und werden nicht als Befehle ausgeführt. `store:false` deaktiviert die optionale Speicherung der Responses; das ist keine pauschale Zusage, dass der Anbieter keinerlei technische Daten oder Sicherheitsprotokolle speichert.

## Dokument-KI (1.15, ebenfalls deaktiviert)

Der zusätzliche `passpilotDocument`-Handler liest ein ausdrücklich ausgewähltes Bild oder lokal extrahierten PDF-Text. Dafür `/api/document` ebenfalls mit der vorbereiteten Rewrite verbinden und `documentEnabled:true` setzen. Der Chat zeigt einen gesonderten Bestätigungsdialog, da ein Beleg persönliche Daten enthalten kann. Maximal 2,5 MB Bild-Data-URL oder 24.000 Zeichen PDF-Text, 700 Ausgabetokens und dieselben Nutzungsgrenzen wie der Chat (gemeinsames Kontingent). Nur neun freigegebene Vorschlagsfelder, keine Käuferadresse oder Kontodaten. Datum/Preis werden clientseitig validiert. Der Gesamtbetrag wird nicht automatisch als Preis eines einzelnen Produkts übernommen. Keine automatischen Aktionen oder Übernahme ungeprüfter Modellnummern.

Dies ist im normalen Hosting-Paket **nicht aktiviert und nicht deployt**. Kein privater API-Schlüssel vorhanden; Tests simulieren ausschließlich Provider-Antworten.
