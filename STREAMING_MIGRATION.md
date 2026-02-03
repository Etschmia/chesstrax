# Handlungsanweisung: Lichess/Chess.com auf Streaming umstellen

## Kontext

In `pgn-db` wurde der Online-Import bereits auf Streaming umgestellt (siehe `pgn-db/services/lichessImportService.ts`). Diese Anweisung beschreibt, wie dieselbe Umstellung in ChessTrax durchgeführt wird.

## Ist-Zustand (ChessTrax)

**`services/lichessService.ts`** — Nur Lichess, kein Chess.com, kein Streaming:

```ts
export const fetchPgnFromLichess = async (username: string): Promise<string> => {
    const url = `${LICHESS_API_BASE_URL}${username}?${API_PARAMS}`;
    const response = await fetch(url, {
        headers: { 'Accept': 'application/x-nd-pgn' }
    });
    if (!response.ok) throw new Error(...);
    return await response.text();  // ← wartet auf gesamte Antwort
};
```

**`App.tsx`** — Zeigt während des Fetches nur statischen Text (`fetchingGames` / `fetchingGamesDescription`):

```ts
setIsFetchingPgn(true);
const pgn = await fetchPgnFromLichess(user);
// ...
setIsFetchingPgn(false);
```

## Soll-Zustand

### 1. `services/lichessService.ts` — Streaming mit Progress-Callback

Signatur ändern:

```ts
export const fetchPgnFromLichess = async (
  username: string,
  onProgress?: (gameCount: number) => void,
): Promise<string> => {
```

Kernlogik nach dem Response-Check:

```ts
if (onProgress && response.body) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let gameCount = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    chunks.push(text);

    // Jede Partie beginnt mit [Event "..."]
    const matches = text.match(/\[Event\s/g);
    if (matches) {
      gameCount += matches.length;
      onProgress(gameCount);
    }
  }

  const trailing = decoder.decode();
  if (trailing) chunks.push(trailing);

  return chunks.join('');
}

// Fallback ohne Callback
return await response.text();
```

**Wichtig:** Kein `AbortSignal.timeout()` verwenden! Die Lichess-API streamt langsam bei vielen Partien. Ein 30s-Timeout führt zu `"The user aborted a request."` Fehlern.

### 2. Chess.com-Support hinzufügen (optional)

Falls gewünscht, Chess.com-Import in derselben Datei ergänzen:

```ts
export const fetchPgnFromChessCom = async (
  username: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> => {
  // 1. Archiv-Liste holen: GET https://api.chess.com/pub/player/{user}/games/archives
  //    → { archives: ["https://api.chess.com/pub/player/.../2024/01", ...] }
  // 2. Jede Archiv-URL + "/pgn" parallel fetchen
  // 3. Nach jedem abgeschlossenen Monat: onProgress(loaded, total)
  // 4. Alle PGN-Teile zusammenfügen
};
```

### 3. `App.tsx` — Live-Fortschrittsanzeige

Neuen State hinzufügen:

```ts
const [progressText, setProgressText] = useState<string | null>(null);
```

Beim Fetch den Callback übergeben:

```ts
setIsFetchingPgn(true);
setProgressText(t('connecting'));

const pgn = await fetchPgnFromLichess(user, (gameCount) => {
  setProgressText(t('gamesLoaded', { count: gameCount }));
});

setProgressText(null);
setIsFetchingPgn(false);
```

In der Loading-Anzeige `progressText` statt des statischen `fetchingGamesDescription` anzeigen:

```tsx
{isFetchingPgn && (
  <p className="text-text-secondary text-sm mt-2">
    {progressText || t('fetchingGamesDescription')}
  </p>
)}
```

### 4. i18n-Keys ergänzen

```json
{
  "connecting": "Connecting...",
  "gamesLoaded": "{{count}} games loaded..."
}
```

## Hinweise

- Accept-Header: ChessTrax nutzt `application/x-nd-pgn` (ndjson-PGN), pgn-db nutzt `application/x-chess-pgn` (Standard-PGN). Beides streamt. Den bestehenden Accept-Header beibehalten.
- Die ChessTrax API-Parameter enthalten `clocks=true&evals=true&literate=true` — das ist gewollt, da ChessTrax die Analyse-Daten nutzt. Nicht ändern.
- Referenz-Implementierung: `pgn-db/services/lichessImportService.ts`
