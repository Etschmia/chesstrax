
import { useMemo } from 'react';

interface PgnParseResult {
    lostGamesPgn: string[];
    gameDates: string[];
    detectedUser: string | null;
}

export const usePgnParser = (pgnContent: string | null): PgnParseResult => {
  return useMemo(() => {
    if (!pgnContent) {
      return { lostGamesPgn: [], gameDates: [], detectedUser: null };
    }

    const games = pgnContent.split(/(?=\[Event ")/).filter(p => p.trim() !== '');
    if (games.length === 0) {
        return { lostGamesPgn: [], gameDates: [], detectedUser: null };
    }

    // Step 1: Find the most frequent user by counting occurrences in White and Black tags.
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
    const detectedUser = sortedUsers.length > 0 ? sortedUsers[0][0] : null;

    // If no user could be detected, return early.
    if (!detectedUser) {
        return { lostGamesPgn: [], gameDates: [], detectedUser: null };
    }

    // Step 2: Using the detected user, find their lost games and all game dates.
    const lostGames: string[] = [];
    const gameDates: string[] = [];
    const dateRegex = /\[(UTC)?Date "(.*?)"\]/;
    const resultRegex = /\[Result "(.*?)"\]/;

    for (const game of games) {
        // Extract date from every game to establish the full range
        const dateMatch = game.match(dateRegex);
        if (dateMatch && dateMatch[2]) {
            // Normalize date to YYYY-MM-DD for consistent parsing
            gameDates.push(dateMatch[2].replace(/\./g, '-'));
        }

        // Check if the detected user played and lost this game
        const isWhite = new RegExp(`\\[White "${detectedUser}"\\]`, 'i').test(game);
        const isBlack = new RegExp(`\\[Black "${detectedUser}"\\]`, 'i').test(game);
        
        // This check is important because a user might be the most frequent player,
        // but a specific game in the PGN might not involve them (e.g., a mixed PGN).
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
    
    return { lostGamesPgn: lostGames, gameDates, detectedUser };
  }, [pgnContent]);
};
