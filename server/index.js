import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

import config from './config.js';
import { sequelize } from './database.js';
import { User } from './models/User.js';
import { Friend } from './models/Friend.js';
import { logError } from './logger.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import friendRoutes from './routes/friends.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

try {
    await sequelize.authenticate();
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Connected to database");
    
    await User.sync({ alter: true });
    await Friend.sync({ alter: true });
    
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Tables synchronized");
} catch (error) {
    logError(error);
    process.exit(1);
}

app.use('/api', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/friends', authenticateToken, friendRoutes);

process.on('uncaughtException', (err) => {
    logError(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logError(reason);
});

app.listen(7002, () => {
    console.log("\x1b[32m%s\x1b[0m", "[URCA] Dev server started on port 7001");
    
    const vite = spawn('npx', ['vite', '--force'], { 
        stdio: 'inherit', 
        shell: true,
        env: { ...process.env, CHOKIDAR_USEPOLLING: 'true' }
    });

    vite.on('error', (err) => {
        logError(err);
    });
});