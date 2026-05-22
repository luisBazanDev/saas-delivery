import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize'
import { sequelize } from '../repositories'

import { Store } from './store.model'

import { UserRole } from './user-role.enum'

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>
    declare username: string
    declare password: string
    declare role: UserRole
    declare store_id: ForeignKey<Store['id']>
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("ADMIN", "STORE_MANAGER", "STORE_ADMIN"),
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
    tableName: "users",
    timestamps: false,
}
)