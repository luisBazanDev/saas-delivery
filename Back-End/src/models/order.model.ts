import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from "sequelize"

import { sequelize } from "../repositories"
import { Store } from "./store.model"
import { OrderStatus } from "./order-status.enum"

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
    declare code: string;

    declare store_id?: number;

    declare status?: string;

    declare start_time?: Date;

    declare payment_id?: number;

    declare total?: number;

    declare end_time?: Date;

    declare address?: string;

    declare lat?: number;

    declare lon?: number;
}

Order.init(

    {

        code: {

            type: DataTypes.STRING(50),

            primaryKey: true,

        },

        store_id: {

            type: DataTypes.INTEGER,

        },

        status: {

            type: DataTypes.STRING(50),

        },

        start_time: {

            type: DataTypes.DATE,

        },

        payment_id: {

            type: DataTypes.INTEGER,

        },

        total: {

            type: DataTypes.DECIMAL(10, 2),

        },

        end_time: {

            type: DataTypes.DATE,

        },

        address: {

            type: DataTypes.STRING(255),

        },

        lat: {

            type: DataTypes.DECIMAL(10, 8),

        },

        lon: {

            type: DataTypes.DECIMAL(11, 8),

        },

    },

    {

        sequelize,

        tableName: "order",

        timestamps: false,

    }

);