import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  CreationOptional,
} from "sequelize"

import { sequelize } from "../repositories"
import { Product } from "./product.model"
import { Order } from "./order.model"

export class OrderProduct extends Model<
  InferAttributes<OrderProduct>,
  InferCreationAttributes<OrderProduct>
> {
  declare id: CreationOptional<number>

  declare product_id: ForeignKey<Product["id"]>

  declare order_id: ForeignKey<Order["id"]>

  declare quantity: number;

  declare subtotal: number;
}

OrderProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id'
      }
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: 'id'
      }
    },

    quantity: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: false,
  }
);