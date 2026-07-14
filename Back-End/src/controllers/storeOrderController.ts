import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { OrderProduct } from '../models/order-product.model'
import { Product } from '../models/product.model'
import { User } from '../models/user.model'
import { Op } from 'sequelize'

function generateOrderCode(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

export async function listOrders(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const status = req.query.status ? String(req.query.status) : undefined
  const where: any = { store_id: storeId }
  if (status) where.status = status

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  })

  const kanban = {
    PENDING: orders.filter((o) => o.status === 'PENDING'),
    IN_PROGRESS: orders.filter((o) => o.status === 'IN_PROGRESS'),
    DONE: orders.filter((o) => o.status === 'DONE'),
    IN_TRANSIT: orders.filter((o) => o.status === 'IN_TRANSIT'),
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED'),
  }

  return res.json({ orders, kanban })
}

export async function createOrder(req: Request, res: Response) {
  console.log('[ORDER] createOrder called')
  console.log('[ORDER] req.params:', req.params)
  console.log('[ORDER] req.path:', req.path)
  console.log('[ORDER] req.body:', JSON.stringify(req.body))
  
  const storeId = Number(req.params.id)
  console.log('[ORDER] storeId:', storeId)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const { customer_name, phone, delivery_address, total_amount, products } = req.body
  if (!customer_name || !products || products.length === 0) {
    return res.status(400).json({ error: 'customer_name and products are required' })
  }

  const code = generateOrderCode()
  const order = await Order.create({
    code,
    store_id: storeId,
    status: 'PENDING',
    customer_name,
    phone,
    delivery_address,
    total_amount: total_amount || 0,
  })

  for (const p of products) {
    await OrderProduct.create({
      order_id: order.id,
      product_id: p.product_id,
      quantity: p.amount,
      subtotal: p.price,
    })
  }

  const created = await Order.findByPk(order.id, {
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
    ],
  })

  return res.status(201).json(created)
}

export async function updateOrderStatus(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderId = Number(req.params.id)
  const { status, delivery_user_id } = req.body
  if (!status) return res.status(400).json({ error: 'status is required' })

  const order = await Order.findOne({ where: { id: orderId, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const updateData: any = { status }
  if (delivery_user_id !== undefined) {
    updateData.delivery_user_id = delivery_user_id
  }

  await order.update(updateData)

  const updated = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
  })

  return res.json(updated)
}

export async function deleteOrder(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderId = Number(req.params.id)

  const order = await Order.findOne({ where: { id: orderId, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  await OrderProduct.destroy({ where: { order_id: orderId } })
  await order.destroy()

  return res.status(204).send()
}
