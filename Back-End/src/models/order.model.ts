import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  CreationOptional,
  NonAttribute,
} from "sequelize"

import { sequelize } from "../repositories"
import { Store } from "./store.model"
import { User } from "./user.model"
import { OrderProduct } from "./order-product.model"

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
    declare id: CreationOptional<number>
    declare code?: string
    declare store_id?: number
    declare status?: string
    declare total_amount?: number
    declare delivery_address?: string
    declare delivery_user_id?: ForeignKey<User['id']>
    declare customer_name?: string
    declare phone?: string
    declare created_at: CreationOptional<Date>

    declare OrderProducts?: NonAttribute<OrderProduct[]>
    declare deliveryUser?: NonAttribute<User | null>
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING(50),
            unique: true,
        },
        store_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING(50),
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
        },
        delivery_address: {
            type: DataTypes.STRING(255),
        },
        delivery_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User,
                key: 'id'
            }
        },
        customer_name: {
            type: DataTypes.STRING(255),
        },
        phone: {
            type: DataTypes.STRING(50),
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "order",
        timestamps: false,
    }
)
