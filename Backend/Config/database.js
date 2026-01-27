import { Sequelize } from "sequelize";

const db = new Sequelize('DofE_DB', 'frendi', 'frendi123', {
    host : "146.190.96.16",
    dialect : "mysql",
    logging : false,
    port : 3306,
    define: {
        timestamps: true
    }
});

export default db;