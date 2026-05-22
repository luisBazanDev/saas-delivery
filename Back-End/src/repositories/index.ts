import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'saas_delivery',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
    }
)