import { Request, Response } from 'express'
import { Order } from '../models/order.model'

export async function createOrder(req: Request, res: Response) {
  const { code, store_id, status, start_time, payment_id, total, end_time, address, lat, lon } = req.body
  if (!code) {
    return res.status(400).json({ error: 'order code is required' })
  }
  const existing = await Order.findByPk(code)
  if (existing) {
    return res.status(409).json({ error: 'order already exists' })
  }
  const item = await Order.create({ code, store_id, status, start_time, payment_id, total, end_time, address, lat, lon })
  return res.status(201).json(item)
}

export async function listOrders(req: Request, res: Response) {
  const items = await Order.findAll()
  return res.json(items)
}

export async function getOrder(req: Request, res: Response) {
  const code = req.params.code as string
  const item = await Order.findByPk(code)
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updateOrder(req: Request, res: Response) {
  const code = req.params.code as string
  const item = await Order.findByPk(code)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deleteOrder(req: Request, res: Response) {
  const code = req.params.code as string
  const item = await Order.findByPk(code)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
