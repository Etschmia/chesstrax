import { useMemo } from 'react';

export interface LostGame {
    pgn: string;
    /** ISO-ish date (YYYY-MM-DD) extracted from PGN headers, or empty string if missing. */
    date: string;
}

interface PgnParseResult {
    lostGames: LostGame[];
    gameDates: string[];
    detectedUser: string | null;
}

/**
 * Detects the most frequent user from a PGN string.
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
 * Finds lost games (with their date) and all game dates for a specific user.
 * Lost games are returned sorted by date descending — newest first.
 */
export const findUserGames = (
    pgnContent: string,
    user: string,
): { lostGames: LostGame[]; gameDates: string[] } => {
    const games = pgnContent.split(/(?=\[Event ")/).filter(p => p.trim() !== '');
    const lostGames: LostGame[] = [];
    const allDates: string[] = [];
    const dateRegex = /\[(UTC)?Date "(.*?)"\]/;
    const resultRegex = /\[Result "(.*?)"\]/;

    const whiteRegex = new RegExp(`\\[White "${user}"\\]`, 'i');
    const blackRegex = new RegExp(`\\[Black "${user}"\\]`, 'i');

    for (const game of games) {
        const dateMatch = game.match(dateRegex);
        const normalizedDate = dateMatch && dateMatch[2] ? dateMatch[2].replace(/\./g, '-') : '';
        if (normalizedDate) {
            allDates.push(normalizedDate);
        }

        const isWhite = whiteRegex.test(game);
        const isBlack = blackRegex.test(game);
        if (!isWhite && !isBlack) continue;

        const resultMatch = game.match(resultRegex);
        if (!resultMatch) continue;
        const result = resultMatch[1];

        if ((isWhite && result === '0-1') || (isBlack && result === '1-0')) {
            lostGames.push({ pgn: game.trim(), date: normalizedDate });
        }
    }

    // Sort newest first; games without a parseable date go to the end.
    lostGames.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
    });

    return { lostGames, gameDates: allDates };
};


/**
 * React hook for reactive PGN parsing in the UI (PGN file preview).
 */
export const usePgnParser = (pgnContent: string | null): PgnParseResult => {
  return useMemo(() => {
    if (!pgnContent) {
      return { lostGames: [], gameDates: [], detectedUser: null };
    }

    const detectedUser = detectUserFromPgn(pgnContent);
    if (!detectedUser) {
        return { lostGames: [], gameDates: [], detectedUser: null };
    }

    const { lostGames, gameDates } = findUserGames(pgnContent, detectedUser);
    return { lostGames, gameDates, detectedUser };
  }, [pgnContent]);
};
