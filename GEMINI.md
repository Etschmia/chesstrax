## Projektübersicht: chesstrax-ai-coach

Dieses Projekt ist eine Webanwendung, die als KI-gestützter Schachtrainer fungiert. Sie analysiert die Schachpartien eines Benutzers (im PGN-Format), um wiederkehrende Fehler und Verbesserungspotenziale aufzuzeigen. Die Kernanalyse wird durch die Gemini-API von Google durchgeführt.

### Technologie-Stack

- **Framework**: React (mit TypeScript/TSX)
- **Build-Tool**: Vite
- **Abhängigkeiten (Auswahl)**:
  - `@google/genai`: Für die Kommunikation mit der Gemini-API.
  - `react-i18next`, `i18next`: Für die Internationalisierung (i18n).
  - `lucide-react`: Für Icons.
  - `html2canvas`, `jspdf`: Für das Erstellen von PDF-Berichten.

### Kernfunktionen

- **PGN-Upload**: Benutzer können ihre von Lichess exportierten PGN-Dateien hochladen.
- **Analyse**: Die Anwendung sendet die Spieldaten an die Gemini-API, um taktische, strategische und eröffnungsspezifische Fehler zu identifizieren.
- **Berichte**: Die Ergebnisse werden in einem Analysebericht dargestellt.
- **Internationalisierung**: Die Benutzeroberfläche ist mehrsprachig (de, en, hy).

### Implementierte Features

- **Lichess-API-Integration**: Die Partien werden direkt über die Lichess-API abgerufen, anstatt einen manuellen PGN-Upload zu erfordern.

### Wichtige Dateien

- `App.tsx`: Hauptkomponente der React-Anwendung.
- `package.json`: Definiert Skripte und Abhängigkeiten.
- `services/geminiService.ts`: Enthält die Logik für die Interaktion mit der Gemini-API.
- `hooks/usePgnParser.ts`: Ein React-Hook zur Verarbeitung von PGN-Daten.
- `components/`: Verzeichnis für die React-Komponenten.
- `src/locales/`: Enthält die Übersetzungsdateien.

### Befehle

- **Entwicklungsserver starten**: `npm run dev`
- **Produktions-Build erstellen**: `npm run build`
- **Build-Vorschau**: `npm run preview`
