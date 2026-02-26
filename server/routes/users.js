import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import { User } from '../models/User.js';
import { logError } from '../logger.js';

const router = express.Router();
const upload = multer({ dest: 'temp/' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));

router.get('/:uuid', async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { uuid: req.params.uuid },
            attributes: ['username', 'pfp']
        });
        if (user) res.json(user);
        else res.status(404).json({ error: "User not found" });
    } catch (e) {
        logError(e);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/upload-pfp', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image provided" });
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        const response = await axios.post('http://localhost:3000/upload?dir=pfp', formData, {
            headers: { ...formData.getHeaders(), 'x-api-key': config.Nimbus.API_KEY }
        });

        await User.update({ pfp: response.data.cdn_url }, { where: { uuid: req.user.uuid } });
        fs.unlinkSync(req.file.path);
        res.json({ url: response.data.cdn_url });
    } catch (e) {
        logError(e);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;