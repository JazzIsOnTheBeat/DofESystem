import db from "./Config/database.js";
import express from "express";
import Users from "./Models/ModelUser.js";

console.log("Menyambungkan ke Database");

    try {
        await db.authenticate();
        console.log(`Koneksi Terhubung`);
        await Users.sync()
    } catch (error) {
        console.log('Tidak bisa terhubung ke database', error);
    }

