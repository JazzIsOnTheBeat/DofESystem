import AuditLog from "../Models/ModelAuditLog.js";
import { Op } from "sequelize";

// Get all audit logs (pengurus only)
export const getAuditLogs = async (req, res) => {
    try {
        const userRole = req.role;
        const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
        
        if (!pengurusRoles.includes(userRole)) {
            return res.status(403).json({ msg: "Akses ditolak. Hanya pengurus yang dapat melihat audit logs." });
        }

        const { action, search, startDate, endDate, page = 1, limit = 20 } = req.query;
        
        const whereClause = {};
        
        // Filter by action type
        if (action && action !== 'all') {
            whereClause.action = action;
        }
        
        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { description: { [Op.like]: `%${search}%` } },
                { userName: { [Op.like]: `%${search}%` } },
                { targetUser: { [Op.like]: `%${search}%` } }
            ];
        }
        
        // Date range filter
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const { count, rows } = await AuditLog.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            logs: rows,
            totalCount: count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ msg: "Gagal mengambil audit logs", error: error.message });
    }
};

// Get audit log stats
export const getAuditStats = async (req, res) => {
    try {
        const userRole = req.role;
        const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
        
        if (!pengurusRoles.includes(userRole)) {
            return res.status(403).json({ msg: "Akses ditolak" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, todayCount, paymentCount, verificationCount] = await Promise.all([
            AuditLog.count(),
            AuditLog.count({
                where: {
                    createdAt: { [Op.gte]: today }
                }
            }),
            AuditLog.count({
                where: {
                    action: { [Op.like]: 'payment_%' }
                }
            }),
            AuditLog.count({
                where: { action: 'payment_verified' }
            })
        ]);

        res.json({
            total,
            today: todayCount,
            payments: paymentCount,
            verifications: verificationCount
        });
    } catch (error) {
        console.error('Get audit stats error:', error);
        res.status(500).json({ msg: "Gagal mengambil statistik", error: error.message });
    }
};
