import Users from "../Models/ModelUser.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const Register = async (req, res) => {
    const { nama, nim, password, confPass, role } = req.body;
    if (!nama || !nim || !password) {
        return res.status(400).json({ msg: "Data wajib (nama, nim, password) tidak boleh kosong" });
    }




    const sameNim = await Users.findOne({
        where: { nim }
    })

    if (sameNim) {
        return res.status(409).json({ msg: "NIM sudah terdaftar" })
    }

    if (password !== confPass)
        return res
            .status(400)
            .json({ msg: `Password dan Confirm Password tidak cocok` });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {


        await Users.create({
            nama: nama,
            nim: nim,
            password: hashPassword,
            role: role,
        });
        res.json({ msg: 'Register Berhasil' })
    } catch (error) {
        console.log(error);

    }
};


export const Login = async (req, res) => {
    try {
        const { nim, password } = req.body;

        // Validate input
        if (!nim || !password) {
            return res.status(400).json({ msg: "NIM dan Password harus diisi" });
        }

        const user = await Users.findOne({
            where: {
                nim: nim,
            }
        });

        // Bila NIM user tidak ada
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ msg: 'Password salah' });
        }

        const userId = user.id;
        const nama = user.nama;
        const role = user.role;

        const accessToken = jwt.sign({ userId, nama, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '2m'
        });
        const refreshToken = jwt.sign({ userId, nama, role }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '6h'
        });

        await Users.update(
            { refreshToken: refreshToken },
            {
                where: {
                    id: userId,
                },
            }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        // Store user role and id for frontend
        res.json({
            accessToken,
            userId,
            role,
            nama
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const user = await Users.findAll();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal Server Error` });
    }
};

export const Logout = async (req, res) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(204);
    }

    const user = await Users.findOne({
        where: { refreshToken }
    });

    if (!user) {
        return res.sendStatus(403);
    }

    if (!user) return res.sendStatus(204);
    const userId = user.id;
    await Users.update({ refreshToken: null }, {
        where: {
            id: userId
        }
    });

    res.clearCookie('refreshToken');
    return res.sendStatus(200);

}

export const changePass = async (req, res) => {
    try {
        const { password, confPass } = req.body;

        if (password !== confPass) {
            return res.status(400).json({ msg: "Password dan Konfirmasi Password tidak cocok" })
        }

        const user = await Users.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt)

        await Users.update({ password: hashPassword }, {
            where: {
                id: user.id
            }
        });

        res.json({ msg: "Data berhasil diperbarui" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi Kesalahan" })
    }

}