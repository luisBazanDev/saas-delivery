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

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>

  declare name: string

  declare store_id: ForeignKey<Store["id"]>
}

Category.init(
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

    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Store,
        key: 'id'
      }
    },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false,
  }
);