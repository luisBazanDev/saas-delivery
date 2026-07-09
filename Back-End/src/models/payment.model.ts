import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from '../repositories'

interface PaymentAttributes {
    payment_id: number;
    name: string;
    logo_url?: string;
}

interface PaymentCreationAttributes
    extends Optional<PaymentAttributes, "payment_id" | "logo_url"> {}

export class Payment extends Model<
    PaymentAttributes,
    PaymentCreationAttributes
> implements PaymentAttributes {

    public payment_id!: number;
    public name!: string;
    public logo_url?: string;
}

Payment.init(
    {
        payment_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        logo_url: {
            type: DataTypes.STRING(255),
        },
    },
    {
        sequelize,
        tableName: "payment",
        timestamps: false,
    }
);