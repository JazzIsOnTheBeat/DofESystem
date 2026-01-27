import db from "../Config/database.js";
import { DataTypes, Sequelize } from "sequelize";

const Users = db.define(
    'users',
    {
        nama: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nim : {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('ketua', 'wakilKetua', 'sekretaris', 'admin','bendahara', 'anggota'),
            allowNull: true,
            defaultValue: "anggota"
        },
        refreshToken: {
            type: DataTypes.TEXT
        },
    },
    {
        freezeTableName: true,
    }
);

export default Users;