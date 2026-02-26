import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../config.json');

const defaultConfig = {
    "JWT_SECRET": "changeme",
    "Nimbus": {
        "API_KEY": "changeme",
        "CDN_URL": "http://localhost:4000"
    },
    "Database": {
        "DB_TYPE": "postgres",
        "DB_HOST": "changeme",
        "DB_NAME": "changeme",
        "DB_USER": "changeme",
        "DB_PASS": "changeme",
        "DB_PORT": 5432
    }
};

if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 4));
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Created config.json. Please edit it and restart.");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
export default config;