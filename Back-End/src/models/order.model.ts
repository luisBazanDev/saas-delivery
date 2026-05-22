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
  declare code: string

  declare store_id: ForeignKey<Store["id"]>

  declare status: OrderStatus

  declare start_time: Date

  declare end_time: Date | null
}

Order.init(
  {
    code: {
      type: DataTypes.CHAR(8),
      primaryKey: true,
    },

    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Store,
        key: 'id'
      }
    },

    status: {
      type: DataTypes.ENUM(
        "ORDERED",
        "ACCEPTED",
        "IN_KITCHEN",
        "IN_TRANSIT",
        "FAILED",
        "RECEIVED"
      ),
      allowNull: false,
      defaultValue: "ORDERED",
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: false,
  }
);