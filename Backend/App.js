import db from "./Config/database.js";
import express from "express";
// import Users from "./Models/ModelUser.js";
import Kas from "./Models/ModelKas.js";
import router from "./Routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config()
const app = express()

console.log("Menyambungkan ke Database");

    try {
        await db.authenticate();
        console.log(`Koneksi Terhubung`);
        // await Users.sync();
        await Kas.sync();
    } catch (error) {
        console.log('Tidak bisa terhubung ke database', error);
    }

app.use(cors({ credentials: true, origin: 'origin: http://localhost:3000'}))
app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser())
app.use(router)

app.listen(3000, () => {
    console.log("Sudah Masuk ke Database")
});