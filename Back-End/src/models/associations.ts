import { Store } from "./store.model"
import { User } from "./user.model"
import { Product } from "./product.model"
import { Order } from "./order.model"
import { OrderProduct } from "./order-product.model"
import { Subscription } from "./subscription.model"

Subscription.hasMany(Store, {
    foreignKey: "subscription_id"
})

Store.belongsTo(Subscription, {
    foreignKey: "subscription_id"
})

Store.hasMany(User, {
    foreignKey: "store_id"
})

User.belongsTo(Store, {
    foreignKey: "store_id"
})

Store.hasMany(Product, {
    foreignKey: "store_id"
})

Product.belongsTo(Store, {
    foreignKey: "store_id"
})

Store.hasMany(Order, {
    foreignKey: "store_id"
})

Order.belongsTo(Store, {
    foreignKey: "store_id"
})

Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: "product_id",
    otherKey: "order_id"
})

Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: "order_id",
    otherKey: "product_id"
})

Order.hasMany(OrderProduct, {
    foreignKey: "order_id"
})

OrderProduct.belongsTo(Order, {
    foreignKey: "order_id"
})

Product.hasMany(OrderProduct, {
    foreignKey: "product_id"
})

OrderProduct.belongsTo(Product, {
    foreignKey: "product_id"
})

User.hasMany(Order, {
    foreignKey: "delivery_user_id",
    as: "deliveryOrders"
})

Order.belongsTo(User, {
    foreignKey: "delivery_user_id",
    as: "deliveryUser"
})
