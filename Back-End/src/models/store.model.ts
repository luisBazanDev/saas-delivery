import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../repositories'

export class Store extends Model<InferAttributes<Store>, InferCreationAttributes<Store>> {
    declare id: CreationOptional<number>
    declare name: string
    declare ruc?: string
    declare subscription_id?: number
    declare address?: string
    declare phone?: string
    declare email?: string
    declare logo_url?: string
    declare lat?: number
    declare lon?: number
    declare is_active: CreationOptional<boolean>
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
}

Store.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ruc: {
            type: DataTypes.STRING(50),
        },
        subscription_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'subscription',
                key: 'id',
            },
        },
        address: {
            type: DataTypes.STRING(255),
        },
        phone: {
            type: DataTypes.STRING(50),
        },
        email: {
            type: DataTypes.STRING(255),
        },
        logo_url: {
            type: DataTypes.STRING(500),
        },
        lat: {
            type: DataTypes.DECIMAL(10, 8),
        },
        lon: {
            type: DataTypes.DECIMAL(11, 8),
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "store",
        timestamps: false,
    }
)
