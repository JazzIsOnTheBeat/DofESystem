import express from "express";
import { Register, getUsers, Login, Logout, changePass, updateUser, deleteUser } from "../Controllers/User.js";
import { refreshToken } from "../Controllers/RefreshToken.js";
import { verifyToken } from "../Middleware/VerifyToken.js";
import { getKas, getKasMy, postKas, statusKas, deleteKas, createManualKas } from "../Controllers/Kas.js";
import { getPengeluaran, createPengeluaran, deletePengeluaran, getKasSummary } from "../Controllers/Pengeluaran.js";
import { getAuditLogs, getAuditStats } from "../Controllers/AuditLog.js";

const router = express.Router();

// User Routes
router.post("/register", verifyToken, Register);
router.get("/users", verifyToken, getUsers);
router.patch("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);
router.post("/login", Login);
router.get("/refreshToken", refreshToken);
router.patch("/NewPass", verifyToken, changePass)
router.delete("/logout", Logout)

import { upload } from "../Middleware/MulterConfig.js";

// Kas Routes
router.get('/kas/staff', verifyToken, getKas);
router.get('/kas/my', verifyToken, getKasMy);
router.post('/kas', verifyToken, upload.single('bukti'), postKas);
router.post('/kas/manual', verifyToken, createManualKas);
router.patch('/kas/bendahara/:id', verifyToken, statusKas);
router.delete('/kas/staff/:id', verifyToken, deleteKas);

// Pengeluaran Routes
router.get('/pengeluaran', verifyToken, getPengeluaran);
router.post('/pengeluaran', verifyToken, createPengeluaran);
router.delete('/pengeluaran/:id', verifyToken, deletePengeluaran);

// Summary Route
router.get('/kas/summary', verifyToken, getKasSummary);

// Audit Log Routes
router.get('/audit-logs', verifyToken, getAuditLogs);
router.get('/audit-logs/stats', verifyToken, getAuditStats);

export default router;
