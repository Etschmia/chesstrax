# Plan: Umstellung des Loggings auf BetterStack

**Ziel:** Die Standard-Logs (`console.log`) in der Vercel Serverless Function durch ein externes, persistentes Logging über BetterStack ersetzen, um Kosten zu sparen und die Log-Aufbewahrung zu verbessern.

**Datum:** 5. August 2025

---

### Schritt 1: BetterStack-Konto und Source Token (Aufgabe für den Benutzer)

1.  **Registrieren:** Erstelle ein kostenloses Konto auf [https://betterstack.com/](https://betterstack.com/).
2.  **Source erstellen:** Navigiere im BetterStack-Dashboard zu "Logs" -> "Sources". Klicke auf "Connect source".
3.  **Plattform auswählen:** Wähle "JavaScript / Node.js" als Plattform aus.
4.  **Source benennen:** Gib der Source einen aussagekräftigen Namen, z. B. `chesstrax-ai-coach-prod`.
5.  **Token kopieren:** Nach dem Erstellen wird dir ein **"Source token"** angezeigt. Kopiere diesen Token. Er wird im nächsten Schritt benötigt.

---

### Schritt 2: Konfiguration der Umgebungsvariablen (Gemeinsam)

1.  **Vercel-Dashboard öffnen:** Gehe zu den Einstellungen deines `chesstrax-ai-coach`-Projekts auf Vercel.
2.  **Umgebungsvariable hinzufügen:** Navigiere zum Abschnitt "Environment Variables".
3.  **Variable erstellen:**
    *   **Name:** `BETTERSTACK_SOURCE_TOKEN`
    *   **Wert:** Füge den im vorherigen Schritt kopierten "Source token" ein.
4.  **Speichern:** Stelle sicher, dass die Variable für die Produktionsumgebung (und ggf. Preview/Development) verfügbar ist und speichere die Änderungen.

---

### Schritt 3: Implementierung des Logging-Clients (Aufgabe für Gemini)

1.  **Abhängigkeit prüfen:** Wir werden die eingebaute `fetch`-API von Node.js verwenden, um externe Abhängigkeiten zu vermeiden.
2.  **Logik anpassen:** Die Datei `/var/www/app/chesstrax-ai-coach/api/log-usage.ts` wird wie folgt modifiziert:
    *   Der `console.log`-Aufruf wird entfernt.
    *   Stattdessen wird eine `fetch`-Anfrage an den Ingest-Endpunkt von BetterStack (`https://in.logs.betterstack.com`) gesendet.
    *   Die Log-Nachricht wird als JSON-Payload im Body der Anfrage gesendet.
    *   Der `BETTERSTACK_SOURCE_TOKEN` wird aus den Umgebungsvariablen (`process.env.BETTERSTACK_SOURCE_TOKEN`) gelesen und als `Authorization`-Header (`Bearer <token>`) gesetzt.
    *   Fehlerbehandlung wird hinzugefügt, falls das Senden des Logs fehlschlägt.

---

### Schritt 4: Testen und Verifizieren

1.  **Deployment:** Nach den Code-Änderungen wird das Projekt erneut auf Vercel deployed, um die neuen Umgebungsvariablen zu übernehmen.
2.  **Funktion auslösen:** Wir lösen die Analyse-Funktion in der Anwendung aus, die den `/api/log-usage`-Endpunkt aufruft.
3.  **Logs überprüfen:** Wir überprüfen das BetterStack-Dashboard, um zu bestätigen, dass die neuen Log-Einträge dort wie erwartet ankommen.
