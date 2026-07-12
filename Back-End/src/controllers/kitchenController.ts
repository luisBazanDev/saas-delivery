import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { OrderProduct } from '../models/order-product.model'
import { Product } from '../models/product.model'
import { Op } from 'sequelize'

export async function getKitchenOrders(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const orders = await Order.findAll({
    where: {
      store_id: storeId,
      status: { [Op.in]: ['PENDING', 'IN_PROGRESS'] },
    },
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
    ],
    order: [['start_time', 'ASC']],
  })

  return res.json({ orders })
}

export async function markOrderReady(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code

  const order = await Order.findOne({ where: { code: orderCode, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const nextStatus = order.status === 'PENDING' ? 'IN_PROGRESS' : 'DONE'
  const updateData: any = { status: nextStatus }

  if (nextStatus === 'IN_PROGRESS' && !order.start_time) {
    updateData.start_time = new Date()
  }
  if (nextStatus === 'DONE') {
    updateData.end_time = new Date()
  }

  await order.update(updateData)

  const updated = await Order.findByPk(orderCode, {
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
    ],
  })

  return res.json(updated)
}

export async function cancelOrderReady(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  const orderCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code

  const order = await Order.findOne({ where: { code: orderCode, store_id: storeId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  if (order.status !== 'DONE') return res.status(400).json({ error: 'Order is not marked as done' })

  if (!order.end_time) return res.status(400).json({ error: 'Order has no end_time' })

  const endTimestamp = new Date(order.end_time).getTime()
  const now = Date.now()
  const fiveMinutesMs = 5 * 60 * 1000

  if (now - endTimestamp > fiveMinutesMs) {
    return res.status(403).json({ error: 'Cancellation window expired (5 minutes)' })
  }

  await order.update({ status: 'IN_PROGRESS', end_time: undefined as any })

  const updated = await Order.findByPk(orderCode, {
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      },
    ],
  })

  return res.json(updated)
}
