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
    declare name: string
    declare password_hash: string
    declare email?: string
    declare role_name: UserRole
    declare store_id: ForeignKey<Store['id']> | null
    declare lat?: number
    declare lon?: number
    declare created_at: CreationOptional<Date>
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
    },
    role_name: {
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
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    lon: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    created_at: {
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
