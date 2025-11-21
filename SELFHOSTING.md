# Konzept: Self-Hosting auf eigenem Server mit Caddy und einfachem Logfile

Dieses Konzept beschreibt den Umstieg von einer Vercel-basierten Bereitstellung mit externem Logging (BetterStack) zu einer vollständig selbst gehosteten Lösung auf einem Debian-13-Server mit dem Caddy-Webserver.

## 1. Analyse der aktuellen Situation

-   **Hosting**: Die Anwendung wird auf Vercel gehostet.
-   **Logging**: Nutzungsdaten (Lichess-Benutzer bei Analyse) werden über eine Vercel Serverless Function (`api/log-usage.ts`) an den externen Dienst **BetterStack** gesendet.
-   **Ziel des Loggings**: Erfassen, welcher Lichess-Benutzer wann eine Analyse anfordert.

## 2. Zielsetzung

-   **Unabhängigkeit**: Vollständige Unabhängigkeit von der Vercel-Plattform und externen Logging-Diensten.
-   **Datenhoheit**: Alle Daten, einschließlich der Nutzungslogs, verbleiben auf dem eigenen Server.
-   **Einfachheit**: Eine simple, wartungsarme Logging-Lösung, die ohne komplexe Stacks wie Loki/Grafana auskommt.
-   **Infrastruktur**: Einsatz eines Debian-13-Servers mit Caddy als Webserver für einfache Konfiguration und automatisches HTTPS.
-   **Domain**: Die Anwendung soll unter `chesstrax.martuni.de` erreichbar sein.

## 3. Vorgeschlagene Lösung

Die Lösung besteht aus zwei Hauptteilen:
1.  **Anpassung der Anwendung**: Die React-Anwendung wird um eine kleine, serverseitige Komponente (z.B. mit Express.js) erweitert, die für das Logging zuständig ist.
2.  **Server-Setup**: Der Caddy-Webserver dient als Reverse-Proxy für die Anwendung und sorgt für die Bereitstellung über HTTPS.

### Schritt 1: Anpassung der ChessTrax-Anwendung

#### a) Backend für das Logging erstellen

Wir erstellen einen minimalen Node.js-Server mit Express, der zwei Aufgaben hat:
1.  Die gebaute React-Anwendung (statische Dateien) ausliefern.
2.  Einen API-Endpunkt `/api/log` bereitstellen, der die Log-Einträge in eine Datei schreibt.

**Beispiel für `server.js` im Hauptverzeichnis des Projekts:**
```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001; // Interner Port, Caddy leitet dorthin weiter

// Middleware, um JSON-Body zu parsen
app.use(express.json());

// API-Endpunkt zum Loggen
app.post('/api/log', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send('Username is required.');
    }

    const logfilePath = '/var/log/chesstrax/usage.log'; // Absoluter Pfad auf dem Server
    const timestamp = new Date().toISOString(); // ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)
    const logLine = `${username},${timestamp}\n`;

    // Asynchrones Anhängen an die Logdatei
    fs.appendFile(logfilePath, logLine, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
            return res.status(500).send('Internal Server Error.');
        }
        res.status(200).send('Logged successfully.');
    });
});

// Statische Dateien der React-App ausliefern
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

// Alle anderen Anfragen an die index.html weiterleiten (für React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

#### b) Frontend anpassen

Der Aufruf an die Logging-Funktion im Frontend (vermutlich in `App.tsx` oder einem Service) muss von `/api/log-usage` auf den neuen Endpunkt `/api/log` geändert werden.

**Beispiel für die Anpassung im Frontend:**
```typescript
// ... irgendwo in einer Funktion, die die Analyse startet ...

const logUsage = async (username: string) => {
  try {
    // Der Pfad ist relativ, da der gleiche Server bedient
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
  } catch (error) {
    console.error('Error logging usage:', error);
  }
};

// Aufruf mit dem Lichess-Benutzernamen
logUsage(lichessUsername);

// ...
```

#### c) Code-Bereinigung

-   Die Datei `api/log-usage.ts` kann gelöscht werden.
-   Abhängigkeiten und Konfigurationen, die nur für Vercel relevant waren, können entfernt werden.
-   Die Umgebungsvariablen für BetterStack werden nicht mehr benötigt.

### Schritt 2: Server-Setup (Debian 13)

#### a) Log-Verzeichnis und Datei erstellen

Auf dem Server müssen das Verzeichnis und die Log-Datei vorbereitet werden.

```bash
# Verzeichnis für die Logs erstellen
sudo mkdir -p /var/log/chesstrax

# Leere Logdatei erstellen
sudo touch /var/log/chesstrax/usage.log
```

#### b) Dateiberechtigungen setzen

Der Prozess, der den Node.js-Server ausführt, benötigt Schreibrechte für die Log-Datei. Angenommen, wir führen den Server unter einem dedizierten Benutzer `chesstrax` aus:

```bash
# Einen Benutzer für die Anwendung erstellen (optional, aber empfohlen)
sudo adduser --system --group chesstrax

# Dem Benutzer das Projektverzeichnis und die Log-Dateien zuweisen
sudo chown -R chesstrax:chesstrax /pfad/zum/chesstrax-projekt
sudo chown -R chesstrax:chesstrax /var/log/chesstrax

# Schreibrechte für den Besitzer setzen, Leserechte für die Gruppe
sudo chmod 640 /var/log/chesstrax/usage.log
```
-   `640` bedeutet:
    -   **Besitzer (`chesstrax`)**: Lesen und Schreiben (`rw-`)
    -   **Gruppe (`chesstrax`)**: Nur Lesen (`r--`)
    -   **Andere**: Keine Rechte (`---`)
Dies ist sicher, da nur der Anwendungsprozess schreiben kann. Administratoren (in der `chesstrax`-Gruppe oder `root`) können die Datei lesen.

#### c) Caddy als Webserver einrichten

Caddy ist ideal, da es extrem einfach zu konfigurieren ist und automatisch HTTPS-Zertifikate von Let's Encrypt bezieht.

1.  **Caddy installieren** (Anleitung auf der offiziellen Caddy-Website folgen).

2.  **Caddyfile anpassen** (`/etc/caddy/Caddyfile`):

    ```
    chesstrax.martuni.de {
        # Anfragen an den Node.js-Backend-Server weiterleiten
        reverse_proxy localhost:3001

        # Komprimierung aktivieren
        encode zstd gzip

        # Sicherheit-Header setzen
        header {
            # Schutz vor Clickjacking
            X-Frame-Options "SAMEORIGIN"
            # Schutz vor XSS
            X-XSS-Protection "1; mode=block"
            # Inhaltstyp-Sniffing verhindern
            X-Content-Type-Options "nosniff"
            # Referrer-Policy
            Referrer-Policy "strict-origin-when-cross-origin"
            # Berechtigungen
            Permissions-Policy "interest-cohort=()"
        }

        # Logging für den Webserver selbst
        log {
            output file /var/log/caddy/chesstrax.access.log
            format json
        }
    }
    ```

3.  **Caddy neustarten**: `sudo systemctl reload caddy`

#### d) Anwendung als Dienst ausführen (systemd)

Damit der Node.js-Server dauerhaft läuft und bei einem Neustart automatisch startet, erstellen wir eine `systemd`-Service-Datei.

**`/etc/systemd/system/chesstrax.service`:**
```ini
[Unit]
Description=ChessTrax Application
After=network.target

[Service]
User=chesstrax
Group=chesstrax
WorkingDirectory=/home/librechat/chesstrax
ExecStart=/home/librechat/.nvm/versions/node/v25.1.0/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Dienst aktivieren und starten:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable chesstrax
sudo systemctl start chesstrax
```

## 4. Prompt für eine KI zur Umsetzung

Hier ist ein Prompt, der eine KI anleiten könnte, diese Änderungen durchzuführen:

---

**KI-Anweisung:**

"Hallo! Bitte passe die ChessTrax-Anwendung für ein Self-Hosting-Szenario an. Ziel ist es, Vercel und BetterStack vollständig zu entfernen und die Anwendung auf einem eigenen Debian-Server mit Caddy zu betreiben.

**Aufgaben:**

1.  **Backend erstellen:**
    -   Füge dem Projekt die `express`-Abhängigkeit hinzu (`npm install express`).
    -   Erstelle eine neue Datei `server.js` im Hauptverzeichnis.
    -   Dieser Server soll:
        -   Die statischen Dateien aus dem `dist`-Verzeichnis ausliefern.
        -   Einen API-Endpunkt unter `POST /api/log` bereitstellen.
        -   Dieser Endpunkt soll den `username` aus dem JSON-Body empfangen und eine neue Zeile in die Datei `logs/chesstrax/usage.log` im Format `Lichess-Nutzer,Datum,Uhrzeit` (ISO 8601) schreiben.

2.  **Frontend anpassen:**
    -   Finde die Stelle im Code, an der die Nutzungsdaten an `/api/log-usage` gesendet werden.
    -   Ändere den API-Aufruf so, dass er stattdessen eine `POST`-Anfrage an den neuen Endpunkt `/api/log` mit dem Lichess-Benutzernamen im Body sendet.

3.  **Aufräumen:**
    -   Lösche die Vercel-spezifische Serverless Function `api/log-usage.ts`.
    -   Entferne alle Verweise auf die Umgebungsvariablen `BETTERSTACK_SOURCE_TOKEN` und `BETTERSTACK_INGEST_URL` aus dem Code und der Dokumentation.

4.  **Dokumentation:**
    -   Erstelle eine neue Datei `DEPLOYMENT.md`, die die serverseitigen Schritte für die Bereitstellung auf Debian 13 beschreibt. Erkläre darin:
        -   Wie das Log-Verzeichnis (`logs/chesstrax`) und die Log-Datei (`usage.log`) erstellt werden.
        -   Welche Dateiberechtigungen (`chown chesstrax:chesstrax` und `chmod 640`) für die Log-Datei gesetzt werden sollten und warum.
        -   Ein Beispiel für eine `Caddyfile`-Konfiguration, die `chesstrax.martuni.de` als Host verwendet und Anfragen an den Node.js-Server auf Port 3001 weiterleitet.
        -   Ein Beispiel für eine `systemd`-Service-Datei (`chesstrax.service`), um den Node.js-Server als Dienst auszuführen.

Bitte führe diese Schritte sorgfältig durch."

---

