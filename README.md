# ChessTrax AI Coach

**Entdecke die verborgenen Muster in deinen Schachpartien und verbessere dein Spiel mit der Kraft von Gemini!**

ChessTrax AI Coach ist dein persönlicher Schachtrainer, der deine verlorenen Partien analysiert und dir hilft, die entscheidenden Schwachstellen in deinem Spiel zu erkennen. Lade einfach deine Partien im PGN-Format von Lichess hoch (dein Benutzername wird erkannt) und erhalte eine detaillierte Auswertung, die dir aufzeigt, wo du dich verbessern kannst.

**Welche Fragen beantwortet dir der ChessTrax AI Coach?**

*   **Taktische Motive:** Welche taktischen Muster übersiehst du immer wieder?
*   **Eröffnungen:** Welche Eröffnungen bereiten dir als Weißer oder Schwarzer die größten Schwierigkeiten?
*   **Endspiele:** Welche Arten von Endspielen solltest du gezielt trainieren?
*   **Strategische Fehler:** Welche strategischen Konzepte wendest du fehlerhaft an?

**So einfach geht's:**

1.  **PGN-Datei exportieren:** Lade deine Partien von Lichess als PGN-Datei herunter.
2.  **Hochladen und analysieren:** Lade die PGN-Datei in der App hoch, gib deinen Lichess-Benutzernamen ein und starte die Analyse.
3.  **Ergebnisse erhalten:** Erhalte einen umfassenden Bericht, der dir deine persönlichen Verbesserungspotenziale aufzeigt.

**Beginne noch heute, deine schachlichen Schwächen in Stärken zu verwandeln!**

## Zukünftige Funktionen

Wir arbeiten derzeit an einer Funktion, die das manuelle Hochladen von PGN-Dateien überflüssig macht. In Zukunft kannst du einfach deinen Lichess-Benutzernamen eingeben, und die App wird deine Partien automatisch über die Lichess-API beziehen.

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