import { Request, Response } from 'express'
import { Order } from '../models/order.model'

export async function createOrder(req: Request, res: Response) {
  const user = (req as any).user
  const store_id = user.role_name === 'ADMIN' ? req.body.store_id : user.store_id
  const { code, status, total_amount, delivery_address, customer_name, phone, payment_method } = req.body
  const item = await Order.create({ code, store_id, status, total_amount, delivery_address, customer_name, phone, payment_method })
  return res.status(201).json(item)
}

export async function listOrders(req: Request, res: Response) {
  const user = (req as any).user
  const where: any = {}
  if (user.role_name !== 'ADMIN' && user.store_id) {
    where.store_id = user.store_id
  }
  const items = await Order.findAll({ where })
  return res.json(items)
}

export async function getOrder(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && item.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  return res.json(item)
}

export async function updateOrder(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && item.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  await item.update(req.body)
  return res.json(item)
}

export async function deleteOrder(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && item.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  await item.destroy()
  return res.status(204).send()
}
