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

        const role = req.role;
        const userId = req.userId;

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