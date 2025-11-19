import { Sequelize } from "sequelize";

/* 
    const sequelize = new Sequelize(
    process.env.DB_NAME || "respondeya",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD ?? "",
    {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
    }
);
*/

// asi no hay error en los logs de la bd de la nube
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

export default sequelize;