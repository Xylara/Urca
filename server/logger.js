import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

export const logError = (error) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(LOGS_DIR, `error-${timestamp}.log`);
    const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    fs.writeFileSync(logPath, errorMessage);
    console.error("\x1b[31m%s\x1b[0m", `[URCA] Error logged to: error-${timestamp}.log`);
};