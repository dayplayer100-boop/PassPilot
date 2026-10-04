# Dein PassPilot-Projekt

Projekt-ID: `passpilot-69f7c`

Konsole: https://console.firebase.google.com/project/passpilot-69f7c/overview

Web-App registrieren / Konfiguration öffnen:
https://console.firebase.google.com/project/passpilot-69f7c/settings/general

Das lokale Firebase-CLI-Projekt ist über `.firebaserc` zugeordnet. Eine Veröffentlichung oder Google-Anmeldung ist damit noch nicht erfolgt.

Die vom Eigentümer bereitgestellte öffentliche Web-App-Konfiguration liegt in `../public-firebase-config.json`. `node scripts/build-web.cjs` bindet die erforderlichen öffentlichen Werte automatisch ein. Analytics wird nicht initialisiert; Storage wird nicht verwendet. Keine Service-Account-Schlüssel erforderlich. Authentication, Firestore und ein Hosting-Deploy sind dadurch noch nicht bestätigt.

Zusätzliche Hosting-Site laut Bestätigung in der Cloud Shell erstellt: `passpilot-app`. Die lokale Hosting-Konfiguration verwendet diese Site. Ihr Inhalts-Deploy steht noch aus.

Vorgesehene Adresse nach erfolgreichem Hosting-Deploy:
`https://passpilot-app.web.app`

Öffentliche QR-Leseseite:
`https://passpilot-app.web.app/pass/`

Build und Veröffentlichung siehe `README.md`. Die Adressen sind vorbereitet; ihre Erreichbarkeit wurde noch nicht bestätigt. Zum Deploy ist ein berechtigter Google-Zugang erforderlich, der in diesem Arbeitsbereich bisher nicht eingerichtet ist.
