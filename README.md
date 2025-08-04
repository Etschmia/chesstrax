# ChessTrax AI Coach

**Entdecke die verborgenen Muster in deinen Schachpartien und verbessere dein Spiel mit der Kraft von Gemini!**

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

---

## Lokale Ausführung

**Voraussetzungen:** Node.js

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```
2.  **Gemini API Key setzen:** Erstelle eine `.env.local`-Datei und setze deinen Gemini API Key:
    ```
    GEMINI_API_KEY=DEIN_API_KEY
    ```
3.  **Anwendung starten:**
    ```bash
    npm run dev
    ```

**Live-Demo:** Du kannst die Anwendung hier live testen: [https://chesstrax-ai-coach.vercel.app/](https://chesstrax-ai-coach.vercel.app/)