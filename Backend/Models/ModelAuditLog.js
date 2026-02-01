import { Sequelize } from "sequelize";
import db from "../Config/database.js";

const { DataTypes } = Sequelize;

const AuditLog = db.define('audit_logs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    targetUser: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('metadata');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('metadata', value ? JSON.stringify(value) : null);
        }
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default AuditLog;

// Helper function to create audit log
export const createAuditLog = async (action, description, userId = null, userName = null, targetUserId = null, targetUser = null, metadata = null) => {
    try {
        await AuditLog.create({
            action,
            description,
            userId,
            userName,
            targetUserId,
            targetUser,
            metadata
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};
