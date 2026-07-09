import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../repositories'

export class Store extends Model<InferAttributes<Store>, InferCreationAttributes<Store>> {
    declare id: CreationOptional<number>;

    declare name: string;

    declare address?: string;

    declare is_active?: boolean;
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

            allowNull: false,

        },

        address: {

            type: DataTypes.STRING(255),

        },

        is_active: {

            type: DataTypes.BOOLEAN,

            defaultValue: true,

        },

    },

    {

        sequelize,

        tableName: "store",

        timestamps: false,

    }

);