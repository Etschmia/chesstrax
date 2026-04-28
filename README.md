# ChessTrax

**Das beste Schach-Lehrbuch, dass es für Dich geben kann, ist eines, das unmittelbar aus Deinen verlorenen Partien entsteht.**

ChessTrax ist dein persönlicher Schachtrainer, der deine verlorenen Partien analysiert und dir hilft, die entscheidenden Schwachstellen in deinem Spiel zu erkennen. Gib einfach deinen Lichess-Benutzernamen ein, um deine Partien automatisch zu laden, oder lade eine PGN-Datei hoch. Du erhältst eine detaillierte Auswertung, die dir aufzeigt, wo du dich verbessern kannst.

**Welche Fragen beantwortet dir der ChessTrax?**

*   **Taktische Motive:** Welche taktischen Muster übersiehst du immer wieder?
*   **Eröffnungen:** Welche Eröffnungen bereiten dir als Weißer oder Schwarzer die größten Schwierigkeiten?
*   **Endspiele:** Welche Arten von Endspielen solltest du gezielt trainieren?
*   **Strategische Fehler:** Welche strategischen Konzepte wendest du fehlerhaft an?

**So einfach geht's:**

1.  **Partien laden:** Gib deinen Lichess-Benutzernamen ein, um deine Partien automatisch abzurufen, ODER lade eine PGN-Datei hoch.
2.  **Analyse starten:** Klicke auf "Meinen Trainingsplan erstellen", um die Analyse zu starten.
3.  **Ergebnisse erhalten:** Erhalte einen umfassenden Bericht mit deinem persönlichen Trainingsplan.

**Beginne noch heute, deine schachlichen Schwächen in Stärken zu verwandeln!**

### Kernfunktionen

- **Hochwertige Analyse mit Google Gemini**: Die Standardanalyse wird vom Modell **Gemini 2.5 Flash** durchgeführt. Dieses Modell ist extrem schnell und liefert qualitativ hochwertige und tiefgehende Einblicke in deine Partien. Für die allermeisten Nutzer ist diese Analyse völlig ausreichend und der empfohlene Weg.
- **OpenRouter Integration (Umgebungsvariable)**: Wenn die Umgebungsvariable `OPENROUTER_API_KEY` in der `.env.local` konfiguriert ist, wird automatisch das Modell **xAI Grok 4 Fast** über OpenRouter verwendet, anstelle von Gemini. Dies überschreibt die Standardkonfiguration und ermöglicht die Nutzung von Grok ohne weitere Einstellungen. Der API-Schlüssel wird sicher im Browser verarbeitet und nicht an Server gesendet. Stelle sicher, dass nach Änderungen der `.env.local` der Dev-Server neu gestartet wird (`npm run dev`).
- **(Optional) Experimentiere mit deinem eigenen LLM**: Für technisch versierte Nutzer und Experimentierfreudige gibt es die Möglichkeit, einen eigenen API-Schlüssel für ein anderes unterstütztes Modell (z.B. OpenAI GPT, Anthropic Claude, xAI Grok) zu hinterlegen. Dies ist **keine Notwendigkeit**, sondern ein Zusatzangebot für alle, die bereits eigene LLMs nutzen und diese mit ChessTrax ausprobieren möchten. Dein Schlüssel wird dabei **sicher und ausschließlich in deinem Browser** gespeichert.
- **Eigener Gemini API-Schlüssel**: Um eine übermäßige Nutzung des von mir bereitgestellten API-Schlüssels zu vermeiden, kannst du deinen eigenen, kostenlosen Gemini-API-Schlüssel von [Google AI Studio](https://aistudio.google.com/) hinterlegen. Klicke dazu einfach auf das Schlüssel-Symbol in der Kopfzeile der Anwendung. Dein Schlüssel wird sicher und nur in deinem Browser gespeichert.
- **Lichess-API-Integration mit wählbarer Partienzahl**: Du wählst im Eingabefeld, wie viele Partien geladen werden (Voreinstellung **300**, Maximum **900**). Die Partien werden direkt über die Lichess-API abgerufen, **chronologisch absteigend sortiert** (`sort=dateDesc`) — geladen werden also stets die jüngsten Partien, ältere fallen heraus.
- **Recency-Weighting**: Aus den geladenen Partien werden die Verluste extrahiert und absteigend nach Datum sortiert. Nur die jüngsten Verluste (aktuell die letzten 50, konfigurierbar in [`llm.config.json`](llm.config.json)) gehen in die Analyse, und der System-Prompt weist das LLM explizit an, jüngere Partien stärker zu gewichten — denn sie spiegeln dein aktuelles Spielniveau wider.
- **PGN-Upload**: Benutzer können ihre (z.B. von Lichess exportierten) PGN-Dateien hochladen. Auch hier werden die Verluste nach Datum absteigend sortiert.
- **Detaillierte Analyse**: Die KI identifiziert wiederkehrende Muster in deinen Partien – von Eröffnungsschwächen über taktische Blindstellen bis hin zu strategischen Fehlkonzepten.
- **Berichte**: Die Ergebnisse werden in einem Analysebericht dargestellt, den du als PDF exportieren kannst.
- **Internationalisierung**: Die Benutzeroberfläche ist mehrsprachig (de, en, hy).

### Konfiguration: `llm.config.json`

Die Provider, ihre Modelle und einige Defaults sind zentral in [`llm.config.json`](llm.config.json) gepflegt — **keine Modellnamen mehr im Code**. Wenn du z. B. das Gemini-Modell auf eine neuere Version umstellen oder einen Provider hinzufügen willst, geschieht das ausschließlich hier:

```json
{
  "providers": {
    "gemini":     { "name": "Google Gemini", "model": "gemini-2.5-flash", ... },
    "openrouter": { "name": "xAI Grok 4 Fast", "model": "x-ai/grok-4-fast:free", ... }
  },
  "lichess":  { "defaultGameCount": 300, "maxGameCount": 900 },
  "analysis": { "maxLostGamesForLlm": 50 }
}
```

- `providers.<id>.model` — Modell-ID, die der jeweilige Service-Wrapper an die API schickt
- `lichess.defaultGameCount` / `maxGameCount` — Voreinstellung und Obergrenze für den Schieberegler im UI
- `analysis.maxLostGamesForLlm` — wie viele (jüngste) Verlustpartien an das LLM gehen

Die Datei wird zur Bauzeit von Vite eingebunden — nach Änderungen also `npm run build` bzw. `npm run dev` neu starten.

Welche Modell-IDs ein Provider gerade anbietet, lässt sich z. B. mit dem mitgelieferten Skript [`scripts/list-gemini-models.mjs`](scripts/list-gemini-models.mjs) abfragen (siehe [Skripte](#skripte)).

Den Rohbau und die ersten Versionen dieser App habe ich komplett mit [AI Studio](https://aistudio.google.com/) erstellt. Das Wesentliche, was von mir an KnowHow einfloss, liegt unter der Haube: Die Art und Weise, der KI (hier: Gemini) den zu analysierenden Content zu unterbreiten und vor Allem im gezielten Formulieren und Hinterlegen des vorbereiteten Prompts.

### Nächste Feature Implementierungen:

- **Motivationsblock**: Ein abschließender Abschnitt im Bericht, der explizit würdigt, welche Schwächen aus älteren Partien in den jüngsten Partien nicht mehr auftauchen — also dokumentiert, *was du schon gelöst hast*. (Die jüngsten-zuerst-Sortierung und das Recency-Weighting im Prompt sind bereits umgesetzt.)
- **Unterstützung weiterer LLMs**: Die Architektur ist darauf ausgelegt, zukünftig einfach weitere Modelle zu integrieren.

---

## Lokale Ausführung

**Voraussetzungen:** Node.js

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```
2.  **Anwendung starten:**
    ```bash
    npm run dev
    ```
Die Anwendung nutzt standardmäßig das leistungsstarke Gemini 2.5 Flash Modell über ein von mir bereitgestelltes Kontingent. Es ist keine weitere Konfiguration nötig. Wenn du dennoch ein anderes LLM mit deinem eigenen API-Schlüssel verwenden möchtest, kannst du dies direkt in den Einstellungen der Anwendung im Browser tun.

**Live-Demo:** Du kannst die Anwendung hier live testen: [https://chesstrax.martuni.de/](https://chesstrax.martuni.de/)

---

## Skripte

### `npm run models:gemini`

Listet alle Modelle, die der aktuelle `GEMINI_API_KEY` aufrufen darf — praktisch, wenn du in [`llm.config.json`](llm.config.json) ein neueres Gemini-Modell eintragen möchtest und prüfen willst, was verfügbar ist.

```bash
npm run models:gemini
```

Das Skript ([`scripts/list-gemini-models.mjs`](scripts/list-gemini-models.mjs)) liest `GEMINI_API_KEY` aus der Umgebung oder aus `.env.local` und ruft `https://generativelanguage.googleapis.com/v1beta/models` auf. Keine zusätzlichen Abhängigkeiten — reines Node 18+ mit globalem `fetch`.

---

**Hinweis:** Dieses Projekt ist ein Hobbyprojekt und befindet sich in aktiver Entwicklung. Feedback und Beiträge sind willkommen!

---
## Lizenz

Dieses Projekt steht unter der GPL-v3-Lizenz. Die Details findest du in der [LICENSE](LICENSE)-Datei.
