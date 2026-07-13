import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

import { sequelize } from "../repositories"
import { Store } from "./store.model"

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>

  declare store_id: ForeignKey<Store["id"]>

  declare name: string

  declare price: number

  declare is_available: boolean

  declare is_archived: CreationOptional<boolean>

  declare description?: string

  declare stock?: number
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false,
  }
);