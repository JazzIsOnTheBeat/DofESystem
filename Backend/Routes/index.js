import express from "express";
import { Register , getUsers, Login, Logout, changePass } from "../Controllers/User.js";
import { refreshToken } from "../Controllers/RefreshToken.js";
import { verifyToken } from "../Middleware/VerifyToken.js";
import { getKas, getKasMy } from "../Controllers/Kas.js";

const router = express.Router();

// User Routes
router.post("/register", Register);
router.get("/users", verifyToken , getUsers);
router.post("/login", Login);
router.get("/refreshToken", refreshToken);
router.patch("/NewPass",verifyToken ,changePass)
router.delete("/logout", Logout)

// Kas Routes
router.get('/kas/staff', verifyToken, getKas);
router.get('/kas/my', verifyToken, getKas);

export default router;
