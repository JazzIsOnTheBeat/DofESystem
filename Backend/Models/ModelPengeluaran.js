import db from "../Config/database.js";
import { DataTypes } from "sequelize";
import Users from "./ModelUser.js";

const Pengeluaran = db.define(
    'pengeluaran',
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        deskripsi: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        paranoid: true
    }
);

Users.hasMany(Pengeluaran, { foreignKey: 'userId' });
Pengeluaran.belongsTo(Users, { foreignKey: 'userId' });

export default Pengeluaran;
