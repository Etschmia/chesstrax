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

- **Flexibel bei der Wahl der KI**: Du kannst frei wählen, welches der unterstützten Large Language Models (LLMs) wie **Google Gemini** oder **OpenAI GPT** du für die Analyse nutzen möchtest.
- **Nutzung eigener API-Keys**: Fortgeschrittene Nutzer können ihre eigenen API-Schlüssel für die LLMs hinterlegen. Die Schlüssel werden **sicher und ausschließlich in deinem Browser** gespeichert und verlassen niemals deinen Client. Das ermöglicht dir den Zugriff auf leistungsfähigere oder aktuellere Modelle, die über das kostenlose Kontingent hinausgehen.
- **Lichess-API-Integration**: Die Partien werden direkt über die Lichess-API abgerufen. Es werden die letzten 2000 Partien abgerufen und von denen die Verlustpartien ausgewertet.
- **PGN-Upload**: Benutzer können ihre (z.B. von Lichess exportierten) PGN-Dateien hochladen.
- **Detaillierte Analyse**: Die KI identifiziert wiederkehrende Muster in deinen Partien – von Eröffnungsschwächen über taktische Blindstellen bis hin zu strategischen Fehlkonzepten.
- **Berichte**: Die Ergebnisse werden in einem Analysebericht dargestellt, den du als PDF exportieren kannst.
- **Internationalisierung**: Die Benutzeroberfläche ist mehrsprachig (de, en, hy).

Den Rohbau und die ersten Versionen dieser App habe ich komplett mit [AI Studio](https://aistudio.google.com/) erstellt. Das Wesentliche, was von mir an KnowHow einfloss, liegt unter der Haube: Die Art und Weise, der KI (hier: Gemini) den zu analysierenden Content zu unterbreiten und vor Allem im gezielten Formulieren und Hinterlegen des vorbereiteten Prompts.

### Nächste Feature Implementierungen:

- **Gewichtung nach Aktualität**: Fehler, die du früher gemacht hast, die aber in letzter Zeit in vergleichbarer Stellung nicht mehr vorkamen, sollen nicht mehr in die Analyse einfliessen. (Naja, vielleicht mache ich einen Motivationsblock an den Schluss der Analye, der Deine Fortschritte würdigt)
- **Unterstützung weiterer LLMs**: Die Architektur ist darauf ausgelegt, zukünftig einfach weitere Modelle wie z.B. Anthropic Claude oder andere leistungsstarke KIs zu integrieren.

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
Die Anwendung nutzt standardmäßig ein von mir bereitgestelltes, kostenloses Kontingent des Gemini-Modells. Wenn du ein anderes LLM mit deinem eigenen API-Schlüssel verwenden möchtest, kannst du dies direkt in den Einstellungen der Anwendung im Browser tun. Es ist keine `.env.local`-Datei mehr nötig.

**Live-Demo:** Du kannst die Anwendung hier live testen: [https://chesstrax-ai-coach.vercel.app/](https://chesstrax-ai-coach.vercel.app/)

---

**Hinweis:** Dieses Projekt ist ein Hobbyprojekt und befindet sich in aktiver Entwicklung. Feedback und Beiträge sind willkommen!
