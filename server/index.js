import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config.json');
const SALT_ROUNDS = 12;

if (!fs.existsSync(CONFIG_PATH)) {
    const defaultConfig = {
        "JWT_SECRET": "changeme",
        "postgres": {
            "DB_TYPE": "postgres",
            "DB_HOST": "changeme",
            "DB_NAME": "changeme",
            "DB_USER": "changeme",
            "DB_PASS": "changeme",
            "DB_PORT": 5432
        }
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 4));
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Please edit config.json");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
const db = config.postgres;

const sequelize = new Sequelize(db.DB_NAME, db.DB_USER, db.DB_PASS, {
    host: db.DB_HOST,
    port: db.DB_PORT,
    dialect: db.DB_TYPE,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }
});

try {
    await sequelize.authenticate();
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Connected to database");
    await sequelize.sync();
} catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "[URCA] Unable to connect to database.");
    process.exit(1);
}

const app = express();
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/api/user/:uuid', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { uuid: req.params.uuid },
            attributes: ['username']
        });
        if (user) {
            res.json({ username: user.username });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ username, password: hashedPassword });
        const token = jwt.sign({ uuid: user.uuid }, config.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (e) {
        res.status(400).json({ error: "Registration failed" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ uuid: user.uuid }, config.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: "Invalid credentials" });
});

app.listen(3001, () => {
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Started successfully");
    const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
    vite.on('error', (err) => {
        console.error("\x1b[31m%s\x1b[0m", "[URCA] Failed to start frontend: " + err.message);
    });
});