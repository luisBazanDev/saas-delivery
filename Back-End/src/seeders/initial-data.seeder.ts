import argon2 from 'argon2'
import { sequelize } from '../repositories'
import { Store } from '../models/store.model'
import { User } from '../models/user.model'
import { Category } from '../models/category.model'
import { Product } from '../models/product.model'
import { Payment } from '../models/payment.model'
import { Order } from '../models/order.model'
import { OrderProduct } from '../models/order-product.model'
import '../models/associations'

function generateOrderCode(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

function randomDate(daysBack: number): Date {
  const now = new Date()
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()))
}

export async function seed() {
  console.log('HX Delivery - Running database seeder...')

  try {
    await sequelize.authenticate()
    console.log('Database connection established.')

    await sequelize.sync({ force: true })
    console.log('Database synced (all tables dropped and recreated).')

    // --- Users ---
    const adminPassword = await argon2.hash('admin123')
    const storePassword = await argon2.hash('store123')
    const deliveryPassword = await argon2.hash('delivery123')

    const adminUser = await User.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@hxdelivery.com',
      role: 'ADMIN' as any,
      store_id: null,
      is_active: true,
    })
    console.log('Created admin user: admin / admin123')

    // --- Stores ---
    const store1 = await Store.create({
      name: 'HX Burger Central',
      address: 'Av. Principal 123, Centro',
      phone: '+52 555 123 4567',
      email: 'central@hxdelivery.com',
      lat: 19.4326,
      lon: -99.1332,
      is_active: true,
    })

    const store2 = await Store.create({
      name: 'HX Pizza Norte',
      address: 'Calle Norte 456, Col. Industrial',
      phone: '+52 555 765 4321',
      email: 'norte@hxdelivery.com',
      lat: 19.4500,
      lon: -99.1400,
      is_active: true,
    })
    console.log('Created 2 stores')

    // --- Store Users ---
    const store1Admin = await User.create({
      username: 'admin_burger',
      password: storePassword,
      email: 'admin@burger.hxdelivery.com',
      role: 'STORE_ADMIN' as any,
      store_id: store1.id,
      is_active: true,
    })

    const store2Admin = await User.create({
      username: 'admin_pizza',
      password: storePassword,
      email: 'admin@pizza.hxdelivery.com',
      role: 'STORE_ADMIN' as any,
      store_id: store2.id,
      is_active: true,
    })

    const store1Manager = await User.create({
      username: 'manager_burger',
      password: storePassword,
      email: 'manager@burger.hxdelivery.com',
      role: 'STORE_MANAGER' as any,
      store_id: store1.id,
      is_active: true,
    })

    const store2Manager = await User.create({
      username: 'manager_pizza',
      password: storePassword,
      email: 'manager@pizza.hxdelivery.com',
      role: 'STORE_MANAGER' as any,
      store_id: store2.id,
      is_active: true,
    })

    const delivery1 = await User.create({
      username: 'repartidor_carlos',
      password: deliveryPassword,
      email: 'carlos@hxdelivery.com',
      role: 'STORE_DELIVERY' as any,
      store_id: store1.id,
      is_active: true,
    })

    const delivery2 = await User.create({
      username: 'repartidor_maria',
      password: deliveryPassword,
      email: 'maria@hxdelivery.com',
      role: 'STORE_DELIVERY' as any,
      store_id: store1.id,
      is_active: true,
    })

    const delivery3 = await User.create({
      username: 'repartidor_juan',
      password: deliveryPassword,
      email: 'juan@hxdelivery.com',
      role: 'STORE_DELIVERY' as any,
      store_id: store2.id,
      is_active: true,
    })

    const chef1 = await User.create({
      username: 'chef_burger',
      password: storePassword,
      email: 'chef@burger.hxdelivery.com',
      role: 'STORE_CHEF' as any,
      store_id: store1.id,
      is_active: true,
    })

    const chef2 = await User.create({
      username: 'chef_pizza',
      password: storePassword,
      email: 'chef@pizza.hxdelivery.com',
      role: 'STORE_CHEF' as any,
      store_id: store2.id,
      is_active: true,
    })
    console.log('Created 9 store users (2 admins, 2 managers, 3 delivery, 2 chefs)')

    // --- Payments ---
    const payCash = await Payment.create({ name: 'Efectivo' })
    const payCard = await Payment.create({ name: 'Tarjeta' })
    const payTransfer = await Payment.create({ name: 'Transferencia' })
    console.log('Created 3 payment methods')

    // --- Categories ---
    const store1Categories = await Promise.all([
      Category.create({ name: 'Hamburguesas', store_id: store1.id }),
      Category.create({ name: 'Bebidas', store_id: store1.id }),
      Category.create({ name: 'Acompañamientos', store_id: store1.id }),
      Category.create({ name: 'Postres', store_id: store1.id }),
    ])

    const store2Categories = await Promise.all([
      Category.create({ name: 'Pizzas', store_id: store2.id }),
      Category.create({ name: 'Bebidas', store_id: store2.id }),
      Category.create({ name: 'Entradas', store_id: store2.id }),
      Category.create({ name: 'Postres', store_id: store2.id }),
    ])
    console.log('Created categories for both stores')

    // --- Products ---
    const store1Products = await Promise.all([
      Product.create({ store_id: store1.id, name: 'Hamburguesa Clásica', description: 'Carne 150g, lechuga, tomate, queso', category_id: store1Categories[0].id, price: 89.00, stock: 50 }),
      Product.create({ store_id: store1.id, name: 'Hamburguesa Doble', description: 'Doble carne, bacon, queso cheddar', category_id: store1Categories[0].id, price: 129.00, stock: 40 }),
      Product.create({ store_id: store1.id, name: 'Hamburguesa Pollo', description: 'Pechuga empanizada, mayo, lechuga', category_id: store1Categories[0].id, price: 95.00, stock: 35 }),
      Product.create({ store_id: store1.id, name: 'Coca-Cola 600ml', description: 'Refresco Coca-Cola', category_id: store1Categories[1].id, price: 25.00, stock: 100 }),
      Product.create({ store_id: store1.id, name: 'Agua Natural 1L', description: 'Agua embotellada', category_id: store1Categories[1].id, price: 18.00, stock: 80 }),
      Product.create({ store_id: store1.id, name: 'Papas Fritas', description: 'Porción grande de papas fritas', category_id: store1Categories[2].id, price: 45.00, stock: 60 }),
      Product.create({ store_id: store1.id, name: 'Aros de Cebolla', description: '8 piezas de aros de cebolla', category_id: store1Categories[2].id, price: 55.00, stock: 45 }),
      Product.create({ store_id: store1.id, name: 'Brownie con Helado', description: 'Brownie de chocolate con helado de vainilla', category_id: store1Categories[3].id, price: 65.00, stock: 30 }),
    ])

    const store2Products = await Promise.all([
      Product.create({ store_id: store2.id, name: 'Pizza Margherita', description: 'Tomate, mozzarella, albahaca', category_id: store2Categories[0].id, price: 149.00, stock: 30 }),
      Product.create({ store_id: store2.id, name: 'Pizza Pepperoni', description: 'Pepperoni, queso mozzarella', category_id: store2Categories[0].id, price: 169.00, stock: 25 }),
      Product.create({ store_id: store2.id, name: 'Pizza Hawaiana', description: 'Jamón, piña, queso', category_id: store2Categories[0].id, price: 159.00, stock: 20 }),
      Product.create({ store_id: store2.id, name: 'Pizza 4 Quesos', description: 'Mozzarella, gorgonzola, parmesano, cheddar', category_id: store2Categories[0].id, price: 179.00, stock: 20 }),
      Product.create({ store_id: store2.id, name: 'Coca-Cola 600ml', description: 'Refresco Coca-Cola', category_id: store2Categories[1].id, price: 25.00, stock: 100 }),
      Product.create({ store_id: store2.id, name: 'Limonada Natural', description: 'Limonada hecha en casa', category_id: store2Categories[1].id, price: 30.00, stock: 50 }),
      Product.create({ store_id: store2.id, name: 'Pan con Ajo', description: '4 piezas de pan con ajo', category_id: store2Categories[2].id, price: 40.00, stock: 60 }),
      Product.create({ store_id: store2.id, name: 'Tiramisú', description: 'Postre italiano clásico', category_id: store2Categories[3].id, price: 75.00, stock: 15 }),
    ])
    console.log('Created 8 products per store')

    // --- Orders ---
    const orderData = [
      // Store 1 - DELIVERED
      { store: store1.id, status: 'DELIVERED', payment: payCash.payment_id, total: 139.00, delivery: delivery1.id, customer: 'Ana García', phone: '555-0001', products: [{ id: store1Products[0].id, amount: 1, price: 89.00 }, { id: store1Products[3].id, amount: 2, price: 25.00 }] },
      { store: store1.id, status: 'DELIVERED', payment: payCard.payment_id, total: 184.00, delivery: delivery2.id, customer: 'Roberto López', phone: '555-0002', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[5].id, amount: 1, price: 45.00 }, { id: store1Products[4].id, amount: 1, price: 18.00 }] },
      { store: store1.id, status: 'DELIVERED', payment: payTransfer.payment_id, total: 250.00, delivery: delivery1.id, customer: 'Carlos Ruiz', phone: '555-0003', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[2].id, amount: 1, price: 95.00 }, { id: store1Products[6].id, amount: 1, price: 55.00 }] },
      // Store 1 - DONE
      { store: store1.id, status: 'DONE', payment: payCash.payment_id, total: 114.00, delivery: null, customer: 'María Torres', phone: '555-0004', products: [{ id: store1Products[0].id, amount: 1, price: 89.00 }, { id: store1Products[3].id, amount: 1, price: 25.00 }] },
      // Store 1 - IN_PROGRESS
      { store: store1.id, status: 'IN_PROGRESS', payment: payCard.payment_id, total: 224.00, delivery: null, customer: 'Pedro Sánchez', phone: '555-0005', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[2].id, amount: 1, price: 95.00 }] },
      // Store 1 - PENDING
      { store: store1.id, status: 'PENDING', payment: payCash.payment_id, total: 95.00, delivery: null, customer: 'Laura Díaz', phone: '555-0006', products: [{ id: store1Products[2].id, amount: 1, price: 95.00 }] },
      { store: store1.id, status: 'PENDING', payment: payCard.payment_id, total: 180.00, delivery: null, customer: 'Diego Morales', phone: '555-0007', products: [{ id: store1Products[0].id, amount: 2, price: 89.00 }] },
      // Store 1 - IN_TRANSIT
      { store: store1.id, status: 'IN_TRANSIT', payment: payTransfer.payment_id, total: 174.00, delivery: delivery2.id, customer: 'Sofía Hernández', phone: '555-0008', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[5].id, amount: 1, price: 45.00 }] },

      // Store 2 - DELIVERED
      { store: store2.id, status: 'DELIVERED', payment: payCard.payment_id, total: 194.00, delivery: delivery3.id, customer: 'Fernando Castro', phone: '555-0009', products: [{ id: store2Products[0].id, amount: 1, price: 149.00 }, { id: store2Products[4].id, amount: 1, price: 25.00 }, { id: store2Products[6].id, amount: 1, price: 40.00 }] },
      { store: store2.id, status: 'DELIVERED', payment: payCash.payment_id, total: 169.00, delivery: delivery3.id, customer: 'Valentina Reyes', phone: '555-0010', products: [{ id: store2Products[1].id, amount: 1, price: 169.00 }] },
      // Store 2 - DONE
      { store: store2.id, status: 'DONE', payment: payTransfer.payment_id, total: 328.00, delivery: null, customer: 'Andrés Vargas', phone: '555-0011', products: [{ id: store2Products[1].id, amount: 1, price: 169.00 }, { id: store2Products[3].id, amount: 1, price: 179.00 }] },
      // Store 2 - IN_PROGRESS
      { store: store2.id, status: 'IN_PROGRESS', payment: payCash.payment_id, total: 159.00, delivery: null, customer: 'Isabella Mendoza', phone: '555-0012', products: [{ id: store2Products[2].id, amount: 1, price: 159.00 }] },
      // Store 2 - PENDING
      { store: store2.id, status: 'PENDING', payment: payCard.payment_id, total: 254.00, delivery: null, customer: 'Mateo Jiménez', phone: '555-0013', products: [{ id: store2Products[0].id, amount: 1, price: 149.00 }, { id: store2Products[5].id, amount: 1, price: 30.00 }, { id: store2Products[7].id, amount: 1, price: 75.00 }] },
      // Store 2 - IN_TRANSIT
      { store: store2.id, status: 'IN_TRANSIT', payment: payCash.payment_id, total: 204.00, delivery: delivery3.id, customer: 'Camila Ortiz', phone: '555-0014', products: [{ id: store2Products[3].id, amount: 1, price: 179.00 }, { id: store2Products[6].id, amount: 1, price: 40.00 }] },
    ]

    for (const od of orderData) {
      const startTime = randomDate(7)
      const endTime = od.status === 'DELIVERED' || od.status === 'DONE' ? new Date(startTime.getTime() + 30 * 60 * 1000) : undefined

      const order = await Order.create({
        code: generateOrderCode(),
        store_id: od.store,
        status: od.status,
        start_time: startTime,
        end_time: endTime,
        payment_id: od.payment,
        total: od.total,
        address: 'Calle Ejemplo #123',
        lat: 19.4300 + Math.random() * 0.03,
        lon: -99.1400 + Math.random() * 0.03,
        delivery_user_id: od.delivery || undefined,
        customer_name: od.customer,
        customer_phone: od.phone,
      })

      for (const p of od.products) {
        await OrderProduct.create({
          order_code: order.code,
          product_id: p.id,
          amount: p.amount,
          price: p.price,
        })
      }
    }
    console.log(`Created ${orderData.length} orders with products`)

    console.log('\n=== SEED COMPLETED ===')
    console.log('Admin: admin / admin123')
    console.log('Store Admins: admin_burger / store123, admin_pizza / store123')
    console.log('Store Managers: manager_burger / store123, manager_pizza / store123')
    console.log('Chefs: chef_burger / store123, chef_pizza / store123')
    console.log('Delivery: repartidor_carlos / delivery123, repartidor_maria / delivery123, repartidor_juan / delivery123')
    console.log('=====================')

  } catch (error) {
    console.error('Seeder error:', error)
    throw error
  } finally {
    await sequelize.close()
  }
}
