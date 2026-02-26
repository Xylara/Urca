import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';
import { User } from './User.js';

export const Friend = sequelize.define('Friend', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userUuid: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'uuid' } },
    friendUuid: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'uuid' } },
    nickname: { type: DataTypes.STRING, allowNull: true }
}, {
    indexes: [{ unique: true, fields: ['userUuid', 'friendUuid'] }]
});

User.hasMany(Friend, { foreignKey: 'userUuid', sourceKey: 'uuid' });
Friend.belongsTo(User, { foreignKey: 'friendUuid', targetKey: 'uuid', as: 'FriendDetails' });