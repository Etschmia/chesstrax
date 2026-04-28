import { lichessDefaults } from '../llmProviders';

const LICHESS_API_BASE_URL = "https://lichess.org/api/games/user/";
const PERF_TYPES = "blitz,rapid,classical,correspondence,standard";

const buildApiParams = (maxGames: number): string =>
  `tags=true&clocks=true&evals=true&opening=true&literate=true&sort=dateDesc&max=${maxGames}&perfType=${PERF_TYPES}`;

/**
 * Fetches the PGN data for a given Lichess user.
 * @param username The Lichess username.
 * @param maxGames Maximum number of games to fetch (newest first; older games drop off).
 * @param onProgress Optional progress callback invoked with the running game count.
 */
export const fetchPgnFromLichess = async (
  username: string,
  maxGames: number = lichessDefaults.defaultGameCount,
  onProgress?: (gameCount: number) => void,
): Promise<string> => {
    const cappedMax = Math.max(1, Math.min(maxGames, lichessDefaults.maxGameCount));
    const url = `${LICHESS_API_BASE_URL}${username}?${buildApiParams(cappedMax)}`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/x-nd-pgn'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from Lichess. Status: ${response.status}`);
    }

    if (onProgress && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const chunks: string[] = [];
        let gameCount = 0;
        const eventRegex = /\[Event\s/g;

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            chunks.push(text);

            const matches = text.match(eventRegex);
            if (matches) {
                gameCount += matches.length;
                onProgress(gameCount);
            }
        }

        const trailing = decoder.decode();
        if (trailing) chunks.push(trailing);

        return chunks.join('');
    }

    return await response.text();
};
