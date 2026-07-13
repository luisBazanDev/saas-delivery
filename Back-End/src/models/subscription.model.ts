import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../repositories'

export class Subscription extends Model<InferAttributes<Subscription>, InferCreationAttributes<Subscription>> {
    declare id: CreationOptional<number>
    declare plan_name: string
    declare max_users: number
    declare is_active: boolean
    declare expires_at: Date
    declare created_at: CreationOptional<Date>
}

Subscription.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        plan_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        max_users: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'subscription',
        timestamps: false,
    }
)
