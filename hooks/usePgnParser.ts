import { useMemo } from 'react';

interface PgnParseResult {
    lostGamesPgn: string[];
    gameDates: string[];
}

export const usePgnParser = (pgnContent: string | null, lichessUser: string): PgnParseResult => {
  return useMemo(() => {
    if (!pgnContent || !lichessUser.trim()) {
      return { lostGamesPgn: [], gameDates: [] };
    }

    const trimmedUser = lichessUser.trim();
    const games = pgnContent.split(/(?=\[Event ")/).filter(p => p.trim() !== '');
    
    const lostGames: string[] = [];
    const gameDates: string[] = [];
    const dateRegex = /\[(UTC)?Date "(.*?)"\]/;

    for (const game of games) {
        // Extract date from every game to establish the full range
        const dateMatch = game.match(dateRegex);
        if (dateMatch && dateMatch[2]) {
            // Normalize date to YYYY-MM-DD for consistent parsing
            gameDates.push(dateMatch[2].replace(/\./g, '-'));
        }

        // Check if the current user played and lost this game
        const isWhite = new RegExp(`\\[White "${trimmedUser}"\\]`, 'i').test(game);
        const isBlack = new RegExp(`\\[Black "${trimmedUser}"\\]`, 'i').test(game);
        
        if (!isWhite && !isBlack) {
            continue;
        }
        
        const resultMatch = game.match(/\[Result "(.*?)"\]/);
        if (resultMatch) {
            const result = resultMatch[1];
            if ((isWhite && result === '0-1') || (isBlack && result === '1-0')) {
                lostGames.push(game.trim());
            }
        }
    }
    
    return { lostGamesPgn: lostGames, gameDates };
  }, [pgnContent, lichessUser]);
};