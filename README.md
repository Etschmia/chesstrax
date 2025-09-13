# ChessTrax AI Coach

**Das beste Schach-Lehrbuch, dass es für Dich geben kann, ist eines, das unmittelbar aus Deinen verlorenen Partien entsteht.**

ChessTrax AI Coach ist dein persönlicher Schachtrainer, der deine verlorenen Partien analysiert und dir hilft, die entscheidenden Schwachstellen in deinem Spiel zu erkennen. Gib einfach deinen Lichess-Benutzernamen ein, um deine Partien automatisch zu laden, oder lade eine PGN-Datei hoch. Du erhältst eine detaillierte Auswertung, die dir aufzeigt, wo du dich verbessern kannst.

**Welche Fragen beantwortet dir der ChessTrax AI Coach?**

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
- **(Optional) Experimentiere mit deinem eigenen LLM**: Für technisch versierte Nutzer und Experimentierfreudige gibt es die Möglichkeit, einen eigenen API-Schlüssel für ein anderes unterstütztes Modell (z.B. OpenAI GPT, Anthropic Claude, xAI Grok) zu hinterlegen. Dies ist **keine Notwendigkeit**, sondern ein Zusatzangebot für alle, die bereits eigene LLMs nutzen und diese mit ChessTrax ausprobieren möchten. Dein Schlüssel wird dabei **sicher und ausschließlich in deinem Browser** gespeichert.
- **Eigener Gemini API-Schlüssel**: Um eine übermäßige Nutzung des von mir bereitgestellten API-Schlüssels zu vermeiden, kannst du deinen eigenen, kostenlosen Gemini-API-Schlüssel von [Google AI Studio](https://aistudio.google.com/) hinterlegen. Klicke dazu einfach auf das Schlüssel-Symbol in der Kopfzeile der Anwendung. Dein Schlüssel wird sicher und nur in deinem Browser gespeichert.
- **Lichess-API-Integration**: Die Partien werden direkt über die Lichess-API abgerufen. Es werden die letzten 2000 Partien abgerufen und von denen die Verlustpartien ausgewertet.
- **PGN-Upload**: Benutzer können ihre (z.B. von Lichess exportierten) PGN-Dateien hochladen.
- **Detaillierte Analyse**: Die KI identifiziert wiederkehrende Muster in deinen Partien – von Eröffnungsschwächen über taktische Blindstellen bis hin zu strategischen Fehlkonzepten.
- **Berichte**: Die Ergebnisse werden in einem Analysebericht dargestellt, den du als PDF exportieren kannst.
- **Internationalisierung**: Die Benutzeroberfläche ist mehrsprachig (de, en, hy).

Den Rohbau und die ersten Versionen dieser App habe ich komplett mit [AI Studio](https://aistudio.google.com/) erstellt. Das Wesentliche, was von mir an KnowHow einfloss, liegt unter der Haube: Die Art und Weise, der KI (hier: Gemini) den zu analysierenden Content zu unterbreiten und vor Allem im gezielten Formulieren und Hinterlegen des vorbereiteten Prompts.

### Nächste Feature Implementierungen:

- **Gewichtung nach Aktualität**: Fehler, die du früher gemacht hast, die aber in letzter Zeit in vergleichbarer Stellung nicht mehr vorkamen, sollen nicht mehr in die Analyse einfliessen. (Naja, vielleicht mache ich einen Motivationsblock an den Schluss der Analye, der Deine Fortschritte würdigt)
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

**Live-Demo:** Du kannst die Anwendung hier live testen: [https://chesstrax-ai-coach.vercel.app/](https://chesstrax-ai-coach.vercel.app/)

---

**Hinweis:** Dieses Projekt ist ein Hobbyprojekt und befindet sich in aktiver Entwicklung. Feedback und Beiträge sind willkommen!

---
## Lizenz

Dieses Projekt steht unter der BSD-3-Clause-Lizenz. Die Details findest du in der [LICENSE](LICENSE)-Datei.
