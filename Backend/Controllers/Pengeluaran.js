import Pengeluaran from "../Models/ModelPengeluaran.js";
import Users from "../Models/ModelUser.js";
import { createAuditLog } from "../Models/ModelAuditLog.js";

// Get all pengeluaran
export const getPengeluaran = async (req, res) => {
    try {
        const response = await Pengeluaran.findAll({
            include: [{
                model: Users,
                attributes: ['nama', 'role']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan" });
    }
};

// Create pengeluaran (only bendahara)
export const createPengeluaran = async (req, res) => {
    try {
        const role = req.role;
        if (role !== "bendahara") {
            return res.status(403).json({ msg: "Akses ditolak. Hanya Bendahara yang dapat menambah pengeluaran." });
        }

        const { jumlah, deskripsi } = req.body;

        if (!jumlah || !deskripsi) {
            return res.status(400).json({ msg: "Jumlah dan deskripsi tidak boleh kosong" });
        }

        await Pengeluaran.create({
            userId: req.userId,
            jumlah: parseInt(jumlah),
            deskripsi: deskripsi,
            tanggal: new Date()
        });
        
        // Create audit log
        await createAuditLog(
            'expense_created',
            `Pengeluaran sebesar Rp ${parseInt(jumlah).toLocaleString('id-ID')} untuk "${deskripsi}"`,
            req.userId,
            req.nama
        );

        res.status(201).json({ msg: "Pengeluaran berhasil ditambahkan" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal menyimpan pengeluaran" });
    }
};

// Delete pengeluaran (only bendahara)
export const deletePengeluaran = async (req, res) => {
    try {
        const role = req.role;
        if (role !== "bendahara") {
            return res.status(403).json({ msg: "Akses ditolak" });
        }

        const { id } = req.params;

        const pengeluaran = await Pengeluaran.findByPk(id);
        if (!pengeluaran) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }
        
        const deletedDesc = pengeluaran.deskripsi;
        const deletedAmount = pengeluaran.jumlah;

        await Pengeluaran.destroy({
            where: { id: id }
        });
        
        // Create audit log
        await createAuditLog(
            'expense_deleted',
            `Pengeluaran "${deletedDesc}" (Rp ${deletedAmount.toLocaleString('id-ID')}) telah dihapus`,
            req.userId,
            req.nama
        );

        res.status(200).json({ msg: "Pengeluaran berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal menghapus pengeluaran" });
    }
};

// Get summary statistics
export const getKasSummary = async (req, res) => {
    try {
        const Kas = (await import("../Models/ModelKas.js")).default;

        // Get total income (accepted kas)
        const kasData = await Kas.findAll({
            where: { Status: 'diterima' }
        });

        const totalIncome = kasData.reduce((sum, k) => sum + parseInt(k.jumlah || 0), 0);

        // Get total expenses
        const expenseData = await Pengeluaran.findAll();
        const totalExpense = expenseData.reduce((sum, e) => sum + parseInt(e.jumlah || 0), 0);

        // Calculate balance
        const balance = totalIncome - totalExpense;

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan" });
    }
};
