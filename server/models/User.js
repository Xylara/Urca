import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';
import config from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    pfp: { 
        type: DataTypes.STRING, 
        defaultValue: `${config.Nimbus.CDN_URL.replace(/\/$/, '')}/pfp/default.png` 
    }
});