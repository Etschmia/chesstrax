# Deployment auf Debian 13

Diese Anleitung beschreibt die Schritte zur Bereitstellung von ChessTrax auf einem Debian 13 Server.

## Voraussetzungen

- Ein Server mit Debian 13.
- Node.js installiert (empfohlen: v20 oder neuer).
- `npm` installiert.
- Caddy Webserver installiert.

## 1. Anwendung vorbereiten

1.  Repository klonen oder Dateien auf den Server kopieren.
2.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```
3.  Anwendung bauen:
    ```bash
    npm run build
    ```

## 2. Logging einrichten

Das Backend schreibt Logs in das Verzeichnis `logs/chesstrax`. Wir müssen sicherstellen, dass dieses Verzeichnis existiert und die richtigen Berechtigungen hat.

### Verzeichnis und Datei erstellen

```bash
# Verzeichnis erstellen (im Projektverzeichnis oder global, hier wird angenommen, dass der Server im Projektverzeichnis läuft)
# Der Server erstellt das Verzeichnis automatisch, wenn es nicht existiert, aber für Berechtigungen ist es besser, es vorzubereiten.

# Wir gehen davon aus, dass die Anwendung unter /opt/chesstrax oder im Home-Verzeichnis eines Users läuft.
# Hier ein Beispiel für ein globales Log-Verzeichnis, falls gewünscht, aber der Server schreibt standardmäßig relativ zu sich selbst.
# Wenn wir dem Server folgen (logs/chesstrax relativ zum Skript):

mkdir -p logs/chesstrax
touch logs/chesstrax/usage.log
```

### Berechtigungen setzen

Es wird empfohlen, die Anwendung unter einem eigenen Benutzer (z.B. `chesstrax`) auszuführen.

```bash
# Benutzer erstellen (falls nicht vorhanden)
sudo adduser --system --group chesstrax

# Eigentümer ändern
sudo chown -R chesstrax:chesstrax logs/chesstrax

# Berechtigungen setzen: Besitzer (chesstrax) darf lesen/schreiben, Gruppe darf lesen.
sudo chmod 640 logs/chesstrax/usage.log
```

## 3. Systemd Service einrichten

Damit die Anwendung automatisch startet, erstellen wir einen Systemd-Service.

Erstelle die Datei `/etc/systemd/system/chesstrax.service`:

```ini
[Unit]
Description=ChessTrax Application
After=network.target

[Service]
# Passe User und Group an deinen Benutzer an
User=chesstrax
Group=chesstrax

# Passe das WorkingDirectory an den Pfad deiner Anwendung an
WorkingDirectory=/path/to/chesstrax

# Pfad zu node (prüfe mit `which node`)
ExecStart=/usr/bin/node server.js

Restart=always
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Service aktivieren und starten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chesstrax
sudo systemctl start chesstrax
```

## 4. Caddy Webserver konfigurieren

Caddy fungiert als Reverse Proxy und kümmert sich um HTTPS.

Erstelle oder bearbeite `/etc/caddy/Caddyfile`:

```caddyfile
chesstrax.martuni.de {
    reverse_proxy localhost:3001

    # Optional: Sicherheits-Header
    header {
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        X-Content-Type-Options "nosniff"
    }
    
    log {
        output file /var/log/caddy/chesstrax.access.log
    }
}
```

Caddy neu laden:

```bash
sudo systemctl reload caddy
```

## Überprüfung

- Rufe `https://chesstrax.martuni.de` auf.
- Führe eine Analyse durch.
- Prüfe das Logfile: `tail -f logs/chesstrax/usage.log`.
