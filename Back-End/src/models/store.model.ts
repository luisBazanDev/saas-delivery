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
    declare address: string
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

    },

    address: {

      type: DataTypes.STRING(255),

    },

  },

  {

    sequelize,

    tableName: "store",

    timestamps: false,

  }

);