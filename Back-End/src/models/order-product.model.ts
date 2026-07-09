import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from "sequelize"

import { sequelize } from "../repositories"
import { Product } from "./product.model"
import { Order } from "./order.model"

export class OrderProduct extends Model<
  InferAttributes<OrderProduct>,
  InferCreationAttributes<OrderProduct>
> {
  declare product_id: ForeignKey<Product["id"]>

  declare order_code: ForeignKey<Order["code"]>

  declare amount: number;

  declare price: number;
}

OrderProduct.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    order_code: {
      type: DataTypes.CHAR(8),
      primaryKey: true,
    },

    amount: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "order_products",
    timestamps: false,
  }
);