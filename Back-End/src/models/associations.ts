import { Store } from "./store.model";
import { User } from "./user.model";
import { Category } from "./category.model";
import { Product } from "./product.model";
import { Order } from "./order.model";
import { OrderProduct } from "./order-product.model";

Store.hasMany(User, {
  foreignKey: "store_id",
});

User.belongsTo(Store, {
  foreignKey: "store_id",
});

Store.hasMany(Category, {
  foreignKey: "store_id",
});

Category.belongsTo(Store, {
  foreignKey: "store_id",
});

Store.hasMany(Product, {
  foreignKey: "store_id",
});

Product.belongsTo(Store, {
  foreignKey: "store_id",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
});

Store.hasMany(Order, {
  foreignKey: "store_id",
});

Order.belongsTo(Store, {
  foreignKey: "store_id",
});

Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: "order_code",
  otherKey: "product_id",
});

Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: "product_id",
  otherKey: "order_code",
});