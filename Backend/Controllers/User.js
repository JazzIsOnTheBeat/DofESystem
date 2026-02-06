import Users from "../Models/ModelUser.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createAuditLog } from "../Models/ModelAuditLog.js";
import { Op } from "sequelize";

export const Register = async (req, res) => {
    const { nama, nim, password, confPass, role } = req.body;

    // Check if user has permission (only pengurus can add members)
    const userRole = req.role;
    const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
    if (!pengurusRoles.includes(userRole)) {
        return res.status(403).json({ msg: "Akses ditolak. Hanya pengurus yang dapat menambahkan anggota." });
    }

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

        // Create audit log
        await createAuditLog(
            'user_created',
            `Anggota baru "${nama}" dengan NIM ${nim} telah didaftarkan`,
            req.userId,
            req.nama,
            null,
            nama
        );

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
            expiresIn: '15m'
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
            maxAge: 6 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        // Store user role and id for frontend

        // Create login audit log
        await createAuditLog(
            'login',
            `User ${nama} berhasil login ke sistem`,
            userId,
            nama
        );

        res.json({
            accessToken,
            userId,
            role,
            nama
        });
    } catch (error) {
        console.error('Login error detailed:', error);
        console.log('Access Secret exists:', !!process.env.ACCESS_TOKEN_SECRET);
        console.log('Refresh Secret exists:', !!process.env.REFRESH_TOKEN_SECRET);
        res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
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

        // Validation Criteria:
        // 1. Min 8 characters
        // 2. Alphanumeric only (letters and numbers)
        // 3. No special characters
        if (password.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" });
        }

        // Regex for alphanumeric only, ensuring at least one letter and one number
        const alphanumericRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(password)) {
            return res.status(400).json({ msg: "Password must be alphanumeric (letters and numbers only) with no special characters" });
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

// Update user (pengurus only)
export const updateUser = async (req, res) => {
    try {
        const userRole = req.role;
        const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];

        if (!pengurusRoles.includes(userRole)) {
            return res.status(403).json({ msg: "Akses ditolak. Hanya pengurus yang dapat mengedit anggota." });
        }

        const { id } = req.params;
        const { nama, nim, role, password } = req.body;

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const updateData = {};
        if (nama) updateData.nama = nama;
        if (nim) {
            // Check if NIM already exists for another user
            const existingNim = await Users.findOne({ where: { nim, id: { [Op.ne]: id } } });
            if (existingNim) {
                return res.status(409).json({ msg: "NIM sudah digunakan oleh user lain" });
            }
            updateData.nim = nim;
        }
        if (role) updateData.role = role;
        if (password) {
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(password, salt);
        }

        await Users.update(updateData, { where: { id } });

        // Create audit log
        await createAuditLog(
            'user_updated',
            `Data anggota "${user.nama}" telah diupdate`,
            req.userId,
            req.nama,
            parseInt(id),
            user.nama
        );

        res.json({ msg: "Data anggota berhasil diperbarui" });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ msg: "Terjadi kesalahan", error: error.message });
    }
};

// Delete user (pengurus only)
export const deleteUser = async (req, res) => {
    try {
        const userRole = req.role;
        const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];

        if (!pengurusRoles.includes(userRole)) {
            return res.status(403).json({ msg: "Akses ditolak. Hanya pengurus yang dapat menghapus anggota." });
        }

        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.userId) {
            return res.status(400).json({ msg: "Tidak dapat menghapus akun sendiri" });
        }

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const deletedUserName = user.nama;

        await Users.destroy({ where: { id } });

        // Create audit log
        await createAuditLog(
            'user_deleted',
            `Anggota "${deletedUserName}" telah dihapus dari sistem`,
            req.userId,
            req.nama,
            null,
            deletedUserName
        );

        res.json({ msg: "Anggota berhasil dihapus" });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ msg: "Terjadi kesalahan", error: error.message });
    }
};