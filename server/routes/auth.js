import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { logError } from '../logger.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));
const SALT_ROUNDS = 12;

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ username, password: hashedPassword });
        const token = jwt.sign({ uuid: user.uuid }, config.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (e) {
        logError(e);
        res.status(400).json({ error: "Registration failed" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ uuid: user.uuid }, config.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token });
        }
        res.status(401).json({ error: "Invalid credentials" });
    } catch (e) {
        logError(e);
        res.status(500).json({ error: "Login error" });
    }
});

export default router;