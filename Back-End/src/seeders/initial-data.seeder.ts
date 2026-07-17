import argon2 from 'argon2'
import { sequelize } from '../repositories'
import { Subscription } from '../models/subscription.model'
import { Store } from '../models/store.model'
import { User } from '../models/user.model'
import { Product } from '../models/product.model'
import { Category } from '../models/category.model'
import { Order } from '../models/order.model'
import { OrderProduct } from '../models/order-product.model'
import { PaymentMethod } from '../models/payment-method.model'
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
      name: 'admin',
      password_hash: adminPassword,
      email: 'admin@hxdelivery.com',
      role_name: 'ADMIN' as any,
      store_id: null,
    })
    console.log('Created admin user: admin / admin123')

    // --- Subscriptions ---
    const subBasic = await Subscription.create({
      plan_name: 'Básico',
      max_users: 10,
      is_active: true,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })

    const subPro = await Subscription.create({
      plan_name: 'Profesional',
      max_users: 50,
      is_active: true,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })
    console.log('Created 2 subscriptions')

    // --- Stores ---
    const store1 = await Store.create({
      name: 'HX Burger Central',
      ruc: '20123456789',
      subscription_id: subBasic.id,
      address: 'Av. Balta 350, Chiclayo',
      phone: '+51 976 123 456',
      email: 'central@hxdelivery.com',
      lat: -6.7714,
      lon: -79.8390,
      is_active: true,
    })

    const store2 = await Store.create({
      name: 'HX Pizza Norte',
      ruc: '20987654321',
      subscription_id: subPro.id,
      address: 'Av. Chiclayo 1200, Chiclayo',
      phone: '+51 976 765 432',
      email: 'norte@hxdelivery.com',
      lat: -6.7650,
      lon: -79.8340,
      is_active: true,
    })
    console.log('Created 2 stores')

    // --- Store Users ---
    const store1Admin = await User.create({
      name: 'admin_burger',
      password_hash: storePassword,
      email: 'admin@burger.hxdelivery.com',
      role_name: 'STORE_ADMIN' as any,
      store_id: store1.id,
    })

    const store2Admin = await User.create({
      name: 'admin_pizza',
      password_hash: storePassword,
      email: 'admin@pizza.hxdelivery.com',
      role_name: 'STORE_ADMIN' as any,
      store_id: store2.id,
    })

    const store1Manager = await User.create({
      name: 'manager_burger',
      password_hash: storePassword,
      email: 'manager@burger.hxdelivery.com',
      role_name: 'STORE_MANAGER' as any,
      store_id: store1.id,
    })

    const store2Manager = await User.create({
      name: 'manager_pizza',
      password_hash: storePassword,
      email: 'manager@pizza.hxdelivery.com',
      role_name: 'STORE_MANAGER' as any,
      store_id: store2.id,
    })

    const delivery1 = await User.create({
      name: 'repartidor_carlos',
      password_hash: deliveryPassword,
      email: 'carlos@hxdelivery.com',
      role_name: 'STORE_DELIVERY' as any,
      store_id: store1.id,
      lat: -6.7730,
      lon: -79.8410,
    })

    const delivery2 = await User.create({
      name: 'repartidor_maria',
      password_hash: deliveryPassword,
      email: 'maria@hxdelivery.com',
      role_name: 'STORE_DELIVERY' as any,
      store_id: store1.id,
      lat: -6.7690,
      lon: -79.8370,
    })

    const delivery3 = await User.create({
      name: 'repartidor_juan',
      password_hash: deliveryPassword,
      email: 'juan@hxdelivery.com',
      role_name: 'STORE_DELIVERY' as any,
      store_id: store2.id,
      lat: -6.7660,
      lon: -79.8320,
    })

    const chef1 = await User.create({
      name: 'chef_burger',
      password_hash: storePassword,
      email: 'chef@burger.hxdelivery.com',
      role_name: 'STORE_CHEF' as any,
      store_id: store1.id,
    })

    const chef2 = await User.create({
      name: 'chef_pizza',
      password_hash: storePassword,
      email: 'chef@pizza.hxdelivery.com',
      role_name: 'STORE_CHEF' as any,
      store_id: store2.id,
    })
    console.log('Created 9 store users (2 admins, 2 managers, 3 delivery, 2 chefs)')

    // --- Categories ---
    const store1Categories = await Promise.all([
      Category.create({ store_id: store1.id, name: 'Hamburguesas' }),
      Category.create({ store_id: store1.id, name: 'Bebidas' }),
      Category.create({ store_id: store1.id, name: 'Acompañamientos' }),
      Category.create({ store_id: store1.id, name: 'Postres' }),
    ])

    const store2Categories = await Promise.all([
      Category.create({ store_id: store2.id, name: 'Pizzas' }),
      Category.create({ store_id: store2.id, name: 'Bebidas' }),
      Category.create({ store_id: store2.id, name: 'Acompañamientos' }),
      Category.create({ store_id: store2.id, name: 'Postres' }),
    ])
    console.log('Created 4 categories per store')

    // --- Products ---
    const store1Products = await Promise.all([
      Product.create({ store_id: store1.id, name: 'Hamburguesa Clásica', description: 'Carne 150g, lechuga, tomate, queso', price: 89.00, stock: 50, is_available: true, is_archived: false, category_id: store1Categories[0].id }),
      Product.create({ store_id: store1.id, name: 'Hamburguesa Doble', description: 'Doble carne, bacon, queso cheddar', price: 129.00, stock: 40, is_available: true, is_archived: false, category_id: store1Categories[0].id }),
      Product.create({ store_id: store1.id, name: 'Hamburguesa Pollo', description: 'Pechuga empanizada, mayo, lechuga', price: 95.00, stock: 35, is_available: true, is_archived: false, category_id: store1Categories[0].id }),
      Product.create({ store_id: store1.id, name: 'Coca-Cola 600ml', description: 'Refresco Coca-Cola', price: 25.00, stock: 100, is_available: true, is_archived: false, category_id: store1Categories[1].id }),
      Product.create({ store_id: store1.id, name: 'Agua Natural 1L', description: 'Agua embotellada', price: 18.00, stock: 80, is_available: true, is_archived: false, category_id: store1Categories[1].id }),
      Product.create({ store_id: store1.id, name: 'Papas Fritas', description: 'Porción grande de papas fritas', price: 45.00, stock: 60, is_available: true, is_archived: false, category_id: store1Categories[2].id }),
      Product.create({ store_id: store1.id, name: 'Aros de Cebolla', description: '8 piezas de aros de cebolla', price: 55.00, stock: 45, is_available: true, is_archived: false, category_id: store1Categories[2].id }),
      Product.create({ store_id: store1.id, name: 'Brownie con Helado', description: 'Brownie de chocolate con helado de vainilla', price: 65.00, stock: 30, is_available: true, is_archived: false, category_id: store1Categories[3].id }),
    ])

    const store2Products = await Promise.all([
      Product.create({ store_id: store2.id, name: 'Pizza Margherita', description: 'Tomate, mozzarella, albahaca', price: 149.00, stock: 30, is_available: true, is_archived: false, category_id: store2Categories[0].id }),
      Product.create({ store_id: store2.id, name: 'Pizza Pepperoni', description: 'Pepperoni, queso mozzarella', price: 169.00, stock: 25, is_available: true, is_archived: false, category_id: store2Categories[0].id }),
      Product.create({ store_id: store2.id, name: 'Pizza Hawaiana', description: 'Jamón, piña, queso', price: 159.00, stock: 20, is_available: true, is_archived: false, category_id: store2Categories[0].id }),
      Product.create({ store_id: store2.id, name: 'Pizza 4 Quesos', description: 'Mozzarella, gorgonzola, parmesano, cheddar', price: 179.00, stock: 20, is_available: true, is_archived: false, category_id: store2Categories[0].id }),
      Product.create({ store_id: store2.id, name: 'Coca-Cola 600ml', description: 'Refresco Coca-Cola', price: 25.00, stock: 100, is_available: true, is_archived: false, category_id: store2Categories[1].id }),
      Product.create({ store_id: store2.id, name: 'Limonada Natural', description: 'Limonada hecha en casa', price: 30.00, stock: 50, is_available: true, is_archived: false, category_id: store2Categories[1].id }),
      Product.create({ store_id: store2.id, name: 'Pan con Ajo', description: '4 piezas de pan con ajo', price: 40.00, stock: 60, is_available: true, is_archived: false, category_id: store2Categories[2].id }),
      Product.create({ store_id: store2.id, name: 'Tiramisú', description: 'Postre italiano clásico', price: 75.00, stock: 15, is_available: true, is_archived: false, category_id: store2Categories[3].id }),
    ])
    console.log('Created 8 products per store with categories')

    // --- Payment Methods ---
    const pmEfectivo = await PaymentMethod.create({ name: 'cobrar efectivo' })
    const pmYapeCobrar = await PaymentMethod.create({ name: 'cobrar yape' })
    const pmYapePagado = await PaymentMethod.create({ name: 'pagado yape' })
    console.log('Created 3 payment methods')

    // --- Orders ---
    const chiclayoAddresses = [
      { address: 'Calle Los Olmos 456, Chiclayo', lat: -6.7745, lon: -79.8425 },
      { address: 'Av. Balta 780, Chiclayo', lat: -6.7700, lon: -79.8365 },
      { address: 'Jr. Junín 321, Chiclayo', lat: -6.7720, lon: -79.8400 },
      { address: 'Av. San Martín 555, Chiclayo', lat: -6.7680, lon: -79.8350 },
      { address: 'Calle Colón 210, Chiclayo', lat: -6.7755, lon: -79.8440 },
      { address: 'Av. Pardo 890, Chiclayo', lat: -6.7665, lon: -79.8310 },
      { address: 'Jr. Gálvez 145, Chiclayo', lat: -6.7735, lon: -79.8385 },
      { address: 'Av. Bolognesi 670, Chiclayo', lat: -6.7695, lon: -79.8375 },
      { address: 'Calle Sáez Peña 234, Chiclayo', lat: -6.7710, lon: -79.8420 },
      { address: 'Av. Salazar Bondy 415, Chiclayo', lat: -6.7640, lon: -79.8300 },
      { address: 'Jr. Leonardo Ortiz 567, Chiclayo', lat: -6.7760, lon: -79.8455 },
      { address: 'Av. América 320, Chiclayo', lat: -6.7675, lon: -79.8330 },
      { address: 'Calle Miraflores 890, Chiclayo', lat: -6.7780, lon: -79.8470 },
      { address: 'Av. Norte 1250, Chiclayo', lat: -6.7620, lon: -79.8290 },
    ]

    const orderData = [
      // Store 1 - DELIVERED
      { store: store1.id, status: 'DELIVERED', total_amount: 139.00, delivery: delivery1.id, customer: 'Ana García', phone: '555-0001', products: [{ id: store1Products[0].id, amount: 1, price: 89.00 }, { id: store1Products[3].id, amount: 2, price: 25.00 }], addrIdx: 0, payment: pmEfectivo.id },
      { store: store1.id, status: 'DELIVERED', total_amount: 184.00, delivery: delivery2.id, customer: 'Roberto López', phone: '555-0002', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[5].id, amount: 1, price: 45.00 }, { id: store1Products[4].id, amount: 1, price: 18.00 }], addrIdx: 1, payment: pmYapePagado.id },
      { store: store1.id, status: 'DELIVERED', total_amount: 250.00, delivery: delivery1.id, customer: 'Carlos Ruiz', phone: '555-0003', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[2].id, amount: 1, price: 95.00 }, { id: store1Products[6].id, amount: 1, price: 55.00 }], addrIdx: 2, payment: pmEfectivo.id },
      // Store 1 - DONE
      { store: store1.id, status: 'DONE', total_amount: 114.00, delivery: null, customer: 'María Torres', phone: '555-0004', products: [{ id: store1Products[0].id, amount: 1, price: 89.00 }, { id: store1Products[3].id, amount: 1, price: 25.00 }], addrIdx: 3, payment: pmYapeCobrar.id },
      // Store 1 - IN_PROGRESS
      { store: store1.id, status: 'IN_PROGRESS', total_amount: 224.00, delivery: null, customer: 'Pedro Sánchez', phone: '555-0005', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[2].id, amount: 1, price: 95.00 }], addrIdx: 4, payment: pmEfectivo.id },
      // Store 1 - PENDING
      { store: store1.id, status: 'PENDING', total_amount: 95.00, delivery: null, customer: 'Laura Díaz', phone: '555-0006', products: [{ id: store1Products[2].id, amount: 1, price: 95.00 }], addrIdx: 5, payment: pmYapeCobrar.id },
      { store: store1.id, status: 'PENDING', total_amount: 180.00, delivery: null, customer: 'Diego Morales', phone: '555-0007', products: [{ id: store1Products[0].id, amount: 2, price: 89.00 }], addrIdx: 6, payment: pmEfectivo.id },
      // Store 1 - IN_TRANSIT
      { store: store1.id, status: 'IN_TRANSIT', total_amount: 174.00, delivery: delivery2.id, customer: 'Sofía Hernández', phone: '555-0008', products: [{ id: store1Products[1].id, amount: 1, price: 129.00 }, { id: store1Products[5].id, amount: 1, price: 45.00 }], addrIdx: 7, payment: pmYapePagado.id },

      // Store 2 - DELIVERED
      { store: store2.id, status: 'DELIVERED', total_amount: 194.00, delivery: delivery3.id, customer: 'Fernando Castro', phone: '555-0009', products: [{ id: store2Products[0].id, amount: 1, price: 149.00 }, { id: store2Products[4].id, amount: 1, price: 25.00 }, { id: store2Products[6].id, amount: 1, price: 40.00 }], addrIdx: 8, payment: pmEfectivo.id },
      { store: store2.id, status: 'DELIVERED', total_amount: 169.00, delivery: delivery3.id, customer: 'Valentina Reyes', phone: '555-0010', products: [{ id: store2Products[1].id, amount: 1, price: 169.00 }], addrIdx: 9, payment: pmYapePagado.id },
      // Store 2 - DONE
      { store: store2.id, status: 'DONE', total_amount: 328.00, delivery: null, customer: 'Andrés Vargas', phone: '555-0011', products: [{ id: store2Products[1].id, amount: 1, price: 169.00 }, { id: store2Products[3].id, amount: 1, price: 179.00 }], addrIdx: 10, payment: pmEfectivo.id },
      // Store 2 - IN_PROGRESS
      { store: store2.id, status: 'IN_PROGRESS', total_amount: 159.00, delivery: null, customer: 'Isabella Mendoza', phone: '555-0012', products: [{ id: store2Products[2].id, amount: 1, price: 159.00 }], addrIdx: 11, payment: pmYapeCobrar.id },
      // Store 2 - PENDING
      { store: store2.id, status: 'PENDING', total_amount: 254.00, delivery: null, customer: 'Mateo Jiménez', phone: '555-0013', products: [{ id: store2Products[0].id, amount: 1, price: 149.00 }, { id: store2Products[5].id, amount: 1, price: 30.00 }, { id: store2Products[7].id, amount: 1, price: 75.00 }], addrIdx: 12, payment: pmEfectivo.id },
      // Store 2 - IN_TRANSIT
      { store: store2.id, status: 'IN_TRANSIT', total_amount: 204.00, delivery: delivery3.id, customer: 'Camila Ortiz', phone: '555-0014', products: [{ id: store2Products[3].id, amount: 1, price: 179.00 }, { id: store2Products[6].id, amount: 1, price: 40.00 }], addrIdx: 13, payment: pmYapePagado.id },
    ]

    for (const od of orderData) {
      const addr = chiclayoAddresses[od.addrIdx]
      const paymentMethod = od.payment === pmEfectivo.id ? pmEfectivo.name : od.payment === pmYapeCobrar.id ? pmYapeCobrar.name : pmYapePagado.name
      const order = await Order.create({
        code: generateOrderCode(),
        store_id: od.store,
        status: od.status,
        total_amount: od.total_amount,
        delivery_address: addr.address,
        delivery_lat: addr.lat,
        delivery_lon: addr.lon,
        delivery_user_id: od.delivery || undefined,
        customer_name: od.customer,
        phone: od.phone,
        payment_method: paymentMethod,
      })

      for (const p of od.products) {
        await OrderProduct.create({
          order_id: order.id,
          product_id: p.id,
          quantity: p.amount,
          subtotal: p.price,
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
