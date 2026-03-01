import express from 'express';
import { User } from '../models/User.js';
import { Friend } from '../models/Friend.js';
import { logError } from '../logger.js';

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const { username, nickname } = req.body;
        const userUuid = req.user.uuid;

        const targetUser = await User.findOne({ where: { username } });
        if (!targetUser) return res.status(404).json({ error: "User not found" });

        const friendUuid = targetUser.uuid;
        if (userUuid === friendUuid) return res.status(400).json({ error: "Self-friending restricted" });

        const friendEntry = await Friend.create({
            userUuid,
            friendUuid,
            nickname: nickname || targetUser.username
        });
        res.status(201).json(friendEntry);
    } catch (e) {
        logError(e);
        res.status(400).json({ error: "Friendship already exists or invalid" });
    }
});

router.get('/', async (req, res) => {
    try {
        const friends = await Friend.findAll({
            where: { userUuid: req.user.uuid },
            include: [{ model: User, as: 'FriendDetails', attributes: ['username', 'pfp'] }]
        });
        res.json(friends);
    } catch (e) {
        logError(e);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;