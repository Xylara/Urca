import { Sequelize } from 'sequelize';
import config from './config.js';

const db = config.Database;

export const sequelize = new Sequelize(db.DB_NAME, db.DB_USER, db.DB_PASS, {
    host: db.DB_HOST,
    port: db.DB_PORT,
    dialect: db.DB_TYPE,
    dialectOptions: { 
        ssl: { require: true, rejectUnauthorized: false } 
    },
    logging: false
});