// This is a Vercel Serverless Function that logs usage.
// It's designed to be deployed on Vercel and will be available at `/api/log-usage`.
// It uses built-in Node.js modules to avoid external dependencies.

import type { ServerResponse } from 'http';

// Vercel's request object is based on http.IncomingMessage but includes a
// pre-parsed body. We define a simple interface for the properties we use,
// avoiding stream handling which is managed by the Vercel runtime.
interface VercelRequest {
    method?: string;
    body?: { username?: string };
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
    // Set CORS headers to allow requests from any origin.
    // This is important for local development and production environments.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
    }

    try {
        // On Vercel, the body is automatically parsed for requests with
        // a 'Content-Type' header like 'application/json'. We can access it directly.
        const { username } = req.body || {};

        if (typeof username === 'string' && username.trim()) {
            // This is the key part: logging to standard output.
            // On Vercel, this will appear in the function's logs.
            console.log(`[ChessTrax Usage] Analysis requested for user: "${username}"`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Log received successfully.' }));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Username is required and must be a non-empty string.' }));
        }
    } catch (error) {
        console.error('[Usage Log Error] Failed to process request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
}
