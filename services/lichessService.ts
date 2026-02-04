

const LICHESS_API_BASE_URL = "https://lichess.org/api/games/user/";
const MAX_GAMES = 2000;
const PERF_TYPES = "blitz,rapid,classical,correspondence,standard";
const API_PARAMS = `tags=true&clocks=true&evals=true&opening=true&literate=true&max=${MAX_GAMES}&perfType=${PERF_TYPES}`;

/**
 * Fetches the PGN data for a given Lichess user.
 * @param username The Lichess username.
 * @returns A promise that resolves to the PGN string.
 * @throws An error if the fetch request fails or the user is not found.
 */
export const fetchPgnFromLichess = async (
  username: string,
  onProgress?: (gameCount: number) => void,
): Promise<string> => {
    const url = `${LICHESS_API_BASE_URL}${username}?${API_PARAMS}`;

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

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            chunks.push(text);

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

    return await response.text();
};
