import { Request, Response } from 'express'
import { Order } from '../models/order.model'

export async function createOrder(req: Request, res: Response) {
  const { code, store_id, status, total_amount, delivery_address, customer_name, phone } = req.body
  const item = await Order.create({ code, store_id, status, total_amount, delivery_address, customer_name, phone })
  return res.status(201).json(item)
}

export async function listOrders(req: Request, res: Response) {
  const items = await Order.findAll()
  return res.json(items)
}

export async function getOrder(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updateOrder(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deleteOrder(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Order.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
