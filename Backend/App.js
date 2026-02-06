import dotenv from "dotenv";
dotenv.config();
import db from "./Config/database.js";
import express from "express";
import Users from "./Models/ModelUser.js";
import Kas from "./Models/ModelKas.js";
import Pengeluaran from "./Models/ModelPengeluaran.js";
import AuditLog from "./Models/ModelAuditLog.js";
import router from "./Routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
    console.log("Menyambungkan ke Database");

    try {
        await db.authenticate();
        console.log(`Koneksi Terhubung`);
        await Users.sync({ alter: true });
        await Kas.sync({ alter: true });
        await Pengeluaran.sync({ alter: true });
        await AuditLog.sync({ alter: true });
        console.log("Semua model sudah disinkronkan");
    } catch (error) {
        console.log('Tidak bisa terhubung ke database', error);
        process.exit(1);
    }

    app.use(cors({ credentials: true, origin: 'https://dofe.jass-production.me' }))
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser())
    app.use('/public', express.static('public'));
    app.use(router)

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server berjalan di port ${PORT}`)
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});