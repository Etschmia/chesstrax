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

### Kernfunktionen, Stand heute:

- **Lichess-API-Integration**: Die Partien werden direkt über die Lichess-API abgerufen, anstatt einen manuellen PGN-Upload zu erfordern. Es werden die letzten 2000 Partien abgerufen und von denen die Verlustpartien ausgewertet
- **PGN-Upload**: Benutzer können ihre (z.B. von Lichess exportierten) PGN-Dateien hochladen. Hier ist keine Begrenzung eingebaut. Bedenke: das Ganze läuft in Deinem Browser. 
- **Analyse**: Die Anwendung sendet die Spieldaten an die Gemini-API, um taktische, strategische und eröffnungsspezifische Fehler zu identifizieren. Es wird der Hauptfokus gezeigt, den Du beim Schachtraining befolgen solltest, und dann geht es im Detail um die als wiederkehrendes Muster erkannten Schwächen als Weiß- und Schwarzspieler, welche Eröffnungsthemen hast Du, welche strategischen Schwächen kennzeichnen Dein Spiel, welche taktischen Motive übersiehst Du häufig, worauf solltest Du im ENdspieltraining achten.
- **Berichte**: Die Ergebnisse werden in einem Analysebericht dargestellt, den man sich auch als PDF oder Googel Doc exportieren kann.
- **Internationalisierung**: Die Benutzeroberfläche ist mehrsprachig (de, en, hy).

Den Rohbau und die ersten Versionen dieser App habe ich komplett mit [AI Studio](https://aistudio.google.com/) erstellt. Das Wesentliche, was von mir an KnowHow einfloss, liegt unter der Haube: Die Art und Weise, der KI (hier: Gemini) den zu analysierenden Content zu unterbreiten und vor Allem im gezielten Formulieren und Hinterlegen des vorbereiteten Prompts.

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