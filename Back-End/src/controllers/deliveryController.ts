import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { User } from '../models/user.model'
import { OrderProduct } from '../models/order-product.model'
import { Product } from '../models/product.model'
import { Op } from 'sequelize'

export async function getDeliveryOrders(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const userId = (req as any).user?.sub
  const where: any = {
    store_id: storeId,
    status: { [Op.in]: ['IN_TRANSIT', 'DELIVERED'] },
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
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  })

  return res.json({ orders })
}

export async function getOrderWithMap(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  const orderId = Number(req.params.orderId)

  const order = await Order.findOne({
    where: { id: orderId, store_id: storeId },
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
  })

  if (!order) return res.status(404).json({ error: 'Order not found' })

  return res.json({
    order,
    delivery_location: {
      address: order.delivery_address,
    },
  })
}

export async function assignDelivery(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  const orderId = Number(req.params.orderId)
  const { delivery_user_id } = req.body

  if (!delivery_user_id) return res.status(400).json({ error: 'delivery_user_id is required' })

  const order = await Order.findOne({ where: { id: orderId, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const deliveryUser = await User.findOne({
    where: { id: delivery_user_id, store_id: storeId, role_name: 'STORE_DELIVERY' },
  })
  if (!deliveryUser) return res.status(404).json({ error: 'Delivery user not found or not available' })

  await order.update({ delivery_user_id, status: 'IN_TRANSIT' })

  const updated = await Order.findByPk(orderId, {
    include: [
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
  })

  return res.json(updated)
}

export async function updateDeliveryStatus(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  const orderId = Number(req.params.orderId)
  const { status } = req.body

  if (!status) return res.status(400).json({ error: 'status is required' })

  const order = await Order.findOne({ where: { id: orderId, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  await order.update({ status })

  return res.json(order)
}

export async function getActiveDeliveries(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const deliveries = await Order.findAll({
    where: {
      store_id: storeId,
      status: 'IN_TRANSIT',
    },
    include: [
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  })

  const filteredDeliveries = deliveries.filter((o) => o.delivery_user_id != null)

  return res.json({ deliveries: filteredDeliveries })
}

export async function updateDeliveryUserLocation(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  const userId = Number(req.params.userId)
  const { lat, lon } = req.body

  if (!storeId) return res.status(400).json({ error: 'store_id is required' })
  if (lat == null || lon == null) return res.status(400).json({ error: 'lat and lon are required' })

  const deliveryUser = await User.findOne({
    where: { id: userId, store_id: storeId, role_name: 'STORE_DELIVERY' },
  })
  if (!deliveryUser) return res.status(404).json({ error: 'Delivery user not found' })

  await deliveryUser.update({ lat, lon })

  return res.json({ success: true, user: { id: deliveryUser.id, name: deliveryUser.name, lat: deliveryUser.lat, lon: deliveryUser.lon } })
}

export async function getActiveDeliveryUsers(req: Request, res: Response) {
  const user = (req as any).user
  const storeId = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const deliveryUsers = await User.findAll({
    where: { store_id: storeId, role_name: 'STORE_DELIVERY' },
    attributes: ['id', 'name', 'lat', 'lon'],
  })

  return res.json({ users: deliveryUsers })
}
