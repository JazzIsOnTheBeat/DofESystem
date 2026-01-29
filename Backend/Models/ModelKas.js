import db from "../Config/database.js";
import { DataTypes, Sequelize } from "sequelize";
import Users from "./ModelUser.js";

const Kas = db.define(
    'kas',
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jumlah : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bulan: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        bukti: {
            type: DataTypes.STRING(),
            allowNull: false,
            unique: true
        },
        Status: {
            type: DataTypes.ENUM('pending', 'diterima', 'ditolak'),
            allowNull: true,
            defaultValue: "pending"
        },
        catatan: {
            type: DataTypes.ENUM("Diterima", "Kode Referal Tidak Valid"),
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        paranoid: true
    }   
);

Users.hasMany(Kas, { foreignKey: 'userId'});
Kas.belongsTo(Users, { foreignKey: 'userId'});

export default Kas;