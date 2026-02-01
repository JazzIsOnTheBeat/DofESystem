import jwt from "jsonwebtoken";
import Users from "../Models/ModelUser.js";

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.sendStatus(401);
        }

        const user = await Users.findOne({
            where: { refreshToken }
        });

        if (!user) {
            return res.sendStatus(403);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);
            const userId = user.id;
            const nama = user.nama;
            const role = user.role;

            const accessToken = jwt.sign({ userId, nama, role }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '15m'
            });
            res.json({ accessToken });
        })

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};
