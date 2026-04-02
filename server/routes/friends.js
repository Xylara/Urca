import express from 'express';
import { User } from '../models/User.js';
import { Friend } from '../models/Friend.js';
import { logError } from '../logger.js';

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const { username } = req.body;
        const targetUser = await User.findOne({ where: { username } });
        
        if (!targetUser) return res.status(404).json({ error: "User not found" });
        if (req.user.uuid === targetUser.uuid) return res.status(400).json({ error: "Self-friending restricted" });

        const [friendEntry, created] = await Friend.findOrCreate({
            where: {
                userUuid: req.user.uuid,
                friendUuid: targetUser.uuid
            },
            defaults: {
                nickname: targetUser.username,
                status: 'pending'
            }
        });

        if (!created) {
            if (friendEntry.status === 'accepted') {
                return res.status(400).json({ error: "Already friends" });
            }
            friendEntry.status = 'pending';
            await friendEntry.save();
        }

        res.status(201).json(friendEntry);
    } catch (e) {
        logError(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/', async (req, res) => {
    try {
        const friends = await Friend.findAll({
            where: { userUuid: req.user.uuid, status: 'accepted' },
            include: [{ model: User, as: 'FriendDetails', attributes: ['username', 'pfp'] }]
        });
        res.json(friends);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/pending', async (req, res) => {
    try {
        const requests = await Friend.findAll({
            where: { friendUuid: req.user.uuid, status: 'pending' },
            include: [{ model: User, as: 'SenderDetails', attributes: ['username', 'pfp'] }]
        });
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/accept', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await Friend.findByPk(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        request.status = 'accepted';
        await request.save();

        const [reverseEntry, created] = await Friend.findOrCreate({
            where: { 
                userUuid: request.friendUuid, 
                friendUuid: request.userUuid 
            },
            defaults: { 
                status: 'accepted', 
                nickname: request.nickname 
            }
        });

        if (!created) {
            reverseEntry.status = 'accepted';
            await reverseEntry.save();
        }

        res.json({ message: "Accepted" });
    } catch (e) {
        logError(e);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/deny', async (req, res) => {
    try {
        const { requestId } = req.body;
        await Friend.destroy({ where: { id: requestId, friendUuid: req.user.uuid } });
        res.json({ message: "Denied" });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

router.delete('/remove/:id', async (req, res) => {
    try {
        const entry = await Friend.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ error: "Not found" });

        await Friend.destroy({ 
            where: { 
                userUuid: [entry.userUuid, entry.friendUuid],
                friendUuid: [entry.userUuid, entry.friendUuid]
            } 
        });
        res.json({ message: "Friend removed" });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;