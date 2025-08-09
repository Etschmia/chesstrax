import React from 'react';

// Regex to find and capture blocks of text starting with "GameId"
const GAME_ID_BLOCK_REGEX = /(GameId(?:\s[a-zA-Z0-9,]+)+)/g;
// Regex to find and capture 8-character alphanumeric Game IDs
const LICHESS_ID_REGEX = /(\b[a-zA-Z0-9]{8}\b)/g;

interface LinkifyProps {
  text: string;
}

/**
 * A component that takes a string and replaces any Lichess Game IDs with clickable links,
 * but only if they appear in a block of text starting with "GameId".
 */
export const Linkify: React.FC<LinkifyProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  const mainParts = text.split(GAME_ID_BLOCK_REGEX);

  return (
    <>
      {mainParts.map((mainPart, index) => {
        // A global regex needs its lastIndex reset before being used for testing.
        GAME_ID_BLOCK_REGEX.lastIndex = 0;
        // Check if the current part is a block of Game IDs (it will be captured by the regex)
        if (GAME_ID_BLOCK_REGEX.test(mainPart)) {
          
          const subParts = mainPart.split(LICHESS_ID_REGEX);
          
          return (
            <React.Fragment key={index}>
              {subParts.map((subPart, subIndex) => {
                // Reset the second global regex as well.
                LICHESS_ID_REGEX.lastIndex = 0;
                // Check if the sub-part is a valid 8-character ID
                if (LICHESS_ID_REGEX.test(subPart) && subPart.length === 8) {
                  return (
                    <a
                      key={subIndex}
                      href={`https://lichess.org/${subPart}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-dark underline font-semibold transition-colors"
                    >
                      {subPart}
                    </a>
                  );
                }
                // Return the text in between IDs (e.g., "GameId ", ", ")
                return subPart;
              })}
            </React.Fragment>
          );
        }
        // Otherwise, return the plain text part
        return mainPart;
      })}
    </>
  );
};
