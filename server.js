import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint for logging usage
app.post('/api/log', (req, res) => {
    console.log('Received request to /api/log');
    console.log('Request body:', req.body);
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
        console.error('Invalid username received:', username);
        return res.status(400).json({ error: 'Invalid username' });
    }

    const logDir = path.join(__dirname, 'logs', 'chesstrax');
    const logFile = path.join(logDir, 'usage.log');
    const timestamp = new Date().toISOString();
    const logEntry = `${username},${timestamp.split('T')[0]},${timestamp.split('T')[1].replace('Z', '')}\n`;

    console.log(`Attempting to write to log file: ${logFile}`);

    // Ensure log directory exists
    fs.mkdir(logDir, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating log directory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Append to log file
        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log(`Successfully logged usage for user: ${username}`);
            res.status(200).json({ message: 'Log saved' });
        });
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Log directory configured as: ${path.join(__dirname, 'logs', 'chesstrax')}`);
});
