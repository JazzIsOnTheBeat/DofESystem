import Users from "../Models/ModelUser.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const Register = async (req, res) => {
    if (!nama || !nim || !password) {
        return res.status(400).json({ msg: "Data wajib (nama, nim, password) tidak boleh kosong" });
    }

    const { nama, nim, password, confPass, role } = req.body;


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
        const user = await Users.findOne({
            where: {
                nim: req.body.nim,
            }
        });

        // Bila NIM user tidak ada
        if (!user) {
            return res.status(404).json({ msg: "User Tidak ditemukan" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).json({ msg: 'Password salah' })


        const userId = user.id;
        const name = user.username;
        const role = user.role;

        const accessToken = jwt.sign({ userId, name, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        const refreshToken = jwt.sign({ userId, name, role }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await Users.update(
            { refreshToken: refreshToken },
            {
                where: {
                    id: userId,
                },
            }
        )
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({ msg: "Terjadi Kesalahan" });
    }
};


