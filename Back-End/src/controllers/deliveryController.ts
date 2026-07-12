import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { User } from '../models/user.model'
import { OrderProduct } from '../models/order-product.model'
import { Product } from '../models/product.model'
import { Op } from 'sequelize'

export async function getDeliveryOrders(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const userId = (req as any).user?.sub
  const where: any = {
    store_id: storeId,
    status: { [Op.in]: ['DONE', 'IN_TRANSIT'] },
  }

  if (userId) {
    where.delivery_user_id = userId
  }

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['id', 'username', 'phone'] },
    ],
    order: [['start_time', 'DESC']],
  })

  return res.json({ orders })
}

export async function getOrderWithMap(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code

  const order = await Order.findOne({
    where: { code: orderCode, store_id: storeId },
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['id', 'username', 'phone'] },
    ],
  })

  if (!order) return res.status(404).json({ error: 'Order not found' })

  return res.json({
    order,
    delivery_location: {
      lat: order.lat,
      lon: order.lon,
      address: order.address,
    },
  })
}

export async function assignDelivery(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code
  const { delivery_user_id } = req.body

  if (!delivery_user_id) return res.status(400).json({ error: 'delivery_user_id is required' })

  const order = await Order.findOne({ where: { code: orderCode, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const deliveryUser = await User.findOne({
    where: { id: delivery_user_id, store_id: storeId, role: 'STORE_DELIVERY', is_active: true },
  })
  if (!deliveryUser) return res.status(404).json({ error: 'Delivery user not found or not available' })

  await order.update({ delivery_user_id, status: 'IN_TRANSIT' })

  const updated = await Order.findByPk(orderCode, {
    include: [
      { model: User, as: 'deliveryUser', attributes: ['id', 'username', 'phone'] },
    ],
  })

  return res.json(updated)
}

export async function updateDeliveryStatus(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code
  const { status, lat, lon } = req.body

  if (!status) return res.status(400).json({ error: 'status is required' })

  const order = await Order.findOne({ where: { code: orderCode, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const updateData: any = { status }
  if (lat !== undefined) updateData.lat = lat
  if (lon !== undefined) updateData.lon = lon
  if (status === 'DELIVERED') updateData.end_time = new Date()

  await order.update(updateData)

  return res.json(order)
}

export async function getActiveDeliveries(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const deliveries = await Order.findAll({
    where: {
      store_id: storeId,
      status: 'IN_TRANSIT',
    },
    include: [
      { model: User, as: 'deliveryUser', attributes: ['id', 'username', 'phone'] },
    ],
    order: [['start_time', 'DESC']],
  })

  const filteredDeliveries = deliveries.filter((o) => o.delivery_user_id != null)

  return res.json({ deliveries: filteredDeliveries })
}
