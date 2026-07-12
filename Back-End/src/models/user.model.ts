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
    declare email?: string
    declare phone?: string
    declare role: UserRole
    declare store_id: ForeignKey<Store['id']> | null
    declare is_active: CreationOptional<boolean>
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
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
    email: {
        type: DataTypes.STRING(255),
    },
    phone: {
        type: DataTypes.STRING(50),
    },
    role: {
        type: DataTypes.ENUM("ADMIN", "STORE_MANAGER", "STORE_ADMIN", "STORE_DELIVERY", "STORE_CHEF"),
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
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    tableName: "users",
    timestamps: false,
}
)
