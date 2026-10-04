# PassPilot 1.16 Test – Produktübersicht und Kaufpreis

- **Lebenslauf ansehen** öffnet zuerst eine Gesamtübersicht: Produktfoto, Name/Modell, Status, Kaufpreis, Kaufdatum, Händler, Garantiefrist und alle Ereignisse. Weitere Fotos und Produktinfos bleiben beim Produkt. Die Übersicht ist deine private Produktakte, keine öffentliche Freigabe.
- **Angaben bearbeiten** öffnet die Produktdaten; ein Ereignis hat eigene Knöpfe für Bearbeiten/Löschen. Nach dem Speichern kommst du wieder in die Gesamtübersicht. Ein neuer Eintrag wird bewusst über **＋ Ereignis** angelegt.
- Der Kaufpreis wird im automatischen Kauf-Eintrag mitgeführt. Änderungen am Produkt aktualisieren diesen Eintrag. Beim Bearbeiten eines Kauf-Ereignisses kannst du Kaufdatum und Kaufpreis des Produkts ausdrücklich mit ändern. Auch beim nachträglichen Kauf-Ereignis werden diese Optionen angezeigt. Preise einschließlich 0 € bleiben nach Neustart gespeichert.
- Kaufpreis plus Reparatur-/Wartungs-/sonstige Kosten bildet die Gesamtsumme. Kauf-Ereignisse werden nicht nochmals addiert, damit derselbe Kauf nicht doppelt zählt. EUR und USD werden getrennt angezeigt.
- Ein fehlender Produktpreis kann aus genau einem vorhandenen verknüpften/automatischen Kauf-Eintrag übernommen werden. Mehrdeutige ältere Beträge werden erhalten und nicht geraten. War bisher gar kein Betrag gespeichert, muss er ergänzt werden.
- Im letzten Erfassungsschritt sind Kaufdatum, Händler, Kaufpreis und Währung sofort sichtbar. Ein erkannter Rechnungsbetrag, der noch nicht übernommen wurde, wird ausdrücklich angezeigt. **Als Kaufpreis übernehmen** setzt ihn erst nach deiner Auswahl; bei mehreren Bon-Artikeln zuerst den passenden Betrag prüfen. Eigene Eingaben bleiben erhalten.
- Originale Kaufkosten aus Kauf-Ereignissen werden bei Online-/Offline-Übergabe nicht unbemerkt mitgegeben. Öffentliche QR-Pässe behalten die bisherige Auswahl der freigegebenen Felder.

## Prüfung und Veröffentlichung

Browser-Test: Übersicht mit Foto/gesamter Historie, gezieltes Bearbeiten und Rückkehr, Kaufpreis-/Datumsänderung, 0 €, Neustart, nachträglicher Kauf, keine Doppelzählung, sichere ältere Datenübernahme und bewusste Rechnungsbetrag-Übernahme. Erfassung, verschlüsselte Synchronisation, Assistent und Foto-/QR-Übergabe wurden ebenfalls geprüft. Android-Build, Lint und bestehende Java-Tests sind bestanden. Native Kamera/Dateiauswahl weiterhin am echten Handy prüfen.

Für denselben Stand App und Firebase-Website auf 1.16 aktualisieren. Kein kostenpflichtiger Dienst wird freigeschaltet. Die Erkennungs- und Datenschutzgrenzen aus 1.15 bleiben gültig.
