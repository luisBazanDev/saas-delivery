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
import { Category } from "./category.model"

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;

  declare store_id: ForeignKey<Store["id"]>

  declare name: string

  declare description: string

  declare category_id: ForeignKey<Category["id"]>
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

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false,
  }
);