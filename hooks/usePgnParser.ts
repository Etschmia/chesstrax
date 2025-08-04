import { useMemo } from 'react';

interface PgnParseResult {
    lostGamesPgn: string[];
    gameDates: string[];
    detectedUser: string | null;
}

/**
 * Detects the most frequent user from a PGN string.
 * This is a pure function and can be called from anywhere.
 * @param pgnContent The full PGN string.
 * @returns The detected username or null.
 */
export const detectUserFromPgn = (pgnContent: string | null): string | null => {
    if (!pgnContent) return null;

    const games = pgnContent.split(/(?=\[Event ")/).filter(p => p.trim() !== '');
    if (games.length === 0) return null;

    const userFrequencies: { [key: string]: number } = {};
    const whiteUserRegex = /\[White "(.*?)"\]/;
    const blackUserRegex = /\[Black "(.*?)"\]/;

    for (const game of games) {
        const whiteMatch = game.match(whiteUserRegex);
        if (whiteMatch && whiteMatch[1]) {
            const user = whiteMatch[1].trim();
            if (user && user !== '?') userFrequencies[user] = (userFrequencies[user] || 0) + 1;
        }
        
        const blackMatch = game.match(blackUserRegex);
        if (blackMatch && blackMatch[1]) {
            const user = blackMatch[1].trim();
            if (user && user !== '?') userFrequencies[user] = (userFrequencies[user] || 0) + 1;
        }
    }

    const sortedUsers = Object.entries(userFrequencies).sort((a, b) => b[1] - a[1]);
    return sortedUsers.length > 0 ? sortedUsers[0][0] : null;
};

/**
 * Finds lost games and all game dates for a specific user from a PGN string.
 * This is a pure function and can be called from anywhere.
 * @param pgnContent The full PGN string.
 * @param user The username to search for.
 * @returns An object with the user's lost games and all game dates found.
 */
export const findUserGames = (pgnContent: string, user: string): { lostGamesPgn: string[], gameDates: string[] } => {
    const games = pgnContent.split(/(?=\[Event ")/).filter(p => p.trim() !== '');
    const lostGames: string[] = [];
    const allDates: string[] = [];
    const dateRegex = /\[(UTC)?Date "(.*?)"\]/;
    const resultRegex = /\[Result "(.*?)"\]/;

    for (const game of games) {
        // Extract date from every game to establish the full range
        const dateMatch = game.match(dateRegex);
        if (dateMatch && dateMatch[2]) {
            // Normalize date to YYYY-MM-DD for consistent parsing
            allDates.push(dateMatch[2].replace(/\./g, '-'));
        }

        const isWhite = new RegExp(`\\[White "${user}"\\]`, 'i').test(game);
        const isBlack = new RegExp(`\\[Black "${user}"\\]`, 'i').test(game);
        
        if (!isWhite && !isBlack) {
            continue;
        }
        
        const resultMatch = game.match(resultRegex);
        if (resultMatch) {
            const result = resultMatch[1];
            if ((isWhite && result === '0-1') || (isBlack && result === '1-0')) {
                lostGames.push(game.trim());
            }
        }
    }
    return { lostGamesPgn: lostGames, gameDates: allDates };
};


/**
 * A React hook that parses a PGN string to provide reactive data for the UI.
 * It detects the most frequent user and finds their lost games.
 * Primarily used for displaying info about a PGN file as it's uploaded.
 */
export const usePgnParser = (pgnContent: string | null): PgnParseResult => {
  return useMemo(() => {
    if (!pgnContent) {
      return { lostGamesPgn: [], gameDates: [], detectedUser: null };
    }

    const detectedUser = detectUserFromPgn(pgnContent);
    if (!detectedUser) {
        return { lostGamesPgn: [], gameDates: [], detectedUser: null };
    }

    const { lostGamesPgn, gameDates } = findUserGames(pgnContent, detectedUser);
    
    return { lostGamesPgn, gameDates, detectedUser };
  }, [pgnContent]);
};
