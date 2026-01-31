import { json } from "sequelize";
import Kas from "../Models/ModelKas.js";
import Users from "../Models/ModelUser.js";


export const getKas = async (req, res) => {
    try {

        const role = req.role;
        const userId = req.userId;

        if(role == "anggota") {
            return res.status(403).json({ msg: "Akses ditolak"})
        }

        const response = await Kas.findAll({
            include: [{
                model: Users,
                attributes: ['nama', 'role']
            }]
        });

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan"})
    }
}

export const getKasMy = async (req, res) => {
    try {
        const response = await Kas.findAll(
            {where: { userId: req.userId}},
            {
            include: [{
                model: Users,
                attributes: ['nama', 'role']
            }]
        });

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan"})
    }
}

export const postKas = async (req, res) => {
    
    const {jumlah, bulan, bukti} = req.body;
        
        if(!jumlah || !bulan || !bukti){
            return res.status(400).json({ msg : "Data tidak boleh kosong"})
        }

    try {
        
        await Kas.create({
            userId: req.userId,
            jumlah: parseInt(jumlah),
            bulan: bulan,
            bukti: bukti,
            Status: "pending",
            
        })

        res.status(201).json({ msg : "Data kas berhasil dikirim"});

    } catch (error) {
        res.status(500).json({ msg : "Gagal menyimpan data"});
    }
}

export const statusKas = async (req, res) => {
    try {
        if(role !== "bendahara"){
        return res.status(403).json({ msg: "Akses ditolak"})
    }

    const {id} = req.params;
    const {Status, catatan} = req.body;
    
    const kas = await Kas.findByPk(id);
    if (!kas) {
        return res.status(404).json({msg: "Data tidak ditemukan"})
    } 

    await Kas.update({
        Status:  Status,
        catatan: catatan,   
    }, {
        where: {id, id}
    });

    res.status(200).json({ msg: `Tabungan berhasil di-${Status}`});

    } catch (error) {
        res.status(500).json({ msg: `Gagal memproses data`});
    }
    
}

export const deleteKas = async (req, res) => {
    try {
        const {id} = req.params;

        const kas = await Kas.findOne({
            where: {id: id}
        });

        if(!kas) {
            return res.status(404).json({msg: "Data tidak ditemukan"});
        }

        if (req.role === "anggota") {
            return res.status(403).json({ msg: "Akses terlarang"})
        }

        await Kas.destroy({
            where: {id: id}
        });

        res.status(200).json({ msg: "Data berhasil dihapus"})
    } catch (error) {
        res.status(500).json({ msg: error.message});
        }
    }