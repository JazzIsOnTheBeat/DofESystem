import { json } from "sequelize";
import Kas from "../Models/ModelKas.js";
import Users from "../Models/ModelUser.js";
import { createAuditLog } from "../Models/ModelAuditLog.js";


export const getKas = async (req, res) => {
    try {

        const role = req.role;
        const userId = req.userId;

        if (role == "anggota") {
            return res.status(403).json({ msg: "Akses ditolak" })
        }

        const response = await Kas.findAll({
            include: [{
                model: Users,
                attributes: ['nama', 'role']
            }]
        });

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan" })
    }
}

export const getKasMy = async (req, res) => {
    try {
        const response = await Kas.findAll(
            { where: { userId: req.userId } },
            {
                include: [{
                    model: Users,
                    attributes: ['nama', 'role']
                }]
            });

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan" })
    }
}

export const postKas = async (req, res) => {

    const { jumlah, bulan } = req.body;

    if (!req.file) {
        return res.status(400).json({ msg: "Bukti pembayaran wajib diupload" });
    }

    if (!jumlah || !bulan) {
        return res.status(400).json({ msg: "Data tidak boleh kosong" })
    }

    const buktiUrl = `${req.protocol}://${req.get("host")}/public/images/${req.file.filename}`;

    try {

        await Kas.create({
            userId: req.userId,
            jumlah: parseInt(jumlah),
            bulan: bulan,
            bukti: buktiUrl,
            Status: "pending",

        })

        res.status(201).json({ msg: "Data kas berhasil dikirim" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal menyimpan data" });
    }
}

export const statusKas = async (req, res) => {
    try {
        const role = req.role;
        if (role !== "bendahara") {
            return res.status(403).json({ msg: "Akses ditolak" })
        }

        const { id } = req.params;
        const { Status, catatan } = req.body;

        const kas = await Kas.findByPk(id);
        if (!kas) {
            return res.status(404).json({ msg: "Data tidak ditemukan" })
        }

        await Kas.update({
            Status: Status,
            catatan: catatan,
        }, {
            where: { id, id }
        });
        
        const user = await Users.findByPk(kas.userId);
        const actionType = Status === 'diterima' ? 'payment_verified' : 'payment_rejected';
        await createAuditLog(
            actionType,
            `Pembayaran kas bulan ${kas.bulan} ${Status === 'diterima' ? 'diterima' : 'ditolak'}${catatan ? ': ' + catatan : ''}`,
            req.userId,
            req.nama,
            kas.userId,
            user?.nama
        );

        res.status(200).json({ msg: `Tabungan berhasil di-${Status}` });

    } catch (error) {
        res.status(500).json({ msg: `Gagal memproses data` });
    }

}

export const deleteKas = async (req, res) => {
    try {
        const { id } = req.params;

        const kas = await Kas.findOne({
            where: { id: id }
        });

        if (!kas) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        if (req.role === "anggota") {
            return res.status(403).json({ msg: "Akses terlarang" })
        }

        await Kas.destroy({
            where: { id: id }
        });

        res.status(200).json({ msg: "Data berhasil dihapus" })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createManualKas = async (req, res) => {
    try {
        const role = req.role;
        if (role !== "bendahara") return res.status(403).json({ msg: "Akses ditolak" });

        const { userId, bulan, jumlah } = req.body;

        const newKas = await Kas.create({
            userId: userId,
            jumlah: jumlah,
            bulan: bulan,
            bukti: null,
            Status: "diterima",
            catatan: "Diterima"
        });

        res.status(201).json({ msg: "Data kas berhasil ditambahkan", data: newKas });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menyimpan data" });
    }
}