import { Request, Response } from 'express'
import { OrderProduct } from '../models/order-product.model'

export async function createOrderProduct(req: Request, res: Response) {
  const { product_id, order_code, amount, price } = req.body
  if (!product_id || !order_code) {
    return res.status(400).json({ error: 'product_id and order_code are required' })
  }
  const existing = await OrderProduct.findOne({
    where: { order_code, product_id }
  })
  if (existing) {
    return res.status(409).json({ error: 'order product already exists' })
  }
  const item = await OrderProduct.create({ product_id, order_code, amount, price })
  return res.status(201).json(item)
}

export async function listOrderProducts(req: Request, res: Response) {
  const items = await OrderProduct.findAll()
  return res.json(items)
}

export async function getOrderProduct(req: Request, res: Response) {
  const { order_code } = req.params
  const product_id = Number(req.params.product_id)
  const item = await OrderProduct.findOne({
    where: { order_code, product_id }
  })
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updateOrderProduct(req: Request, res: Response) {
  const { order_code } = req.params
  const product_id = Number(req.params.product_id)
  const item = await OrderProduct.findOne({
    where: { order_code, product_id }
  })
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deleteOrderProduct(req: Request, res: Response) {
  const { order_code } = req.params
  const product_id = Number(req.params.product_id)
  const item = await OrderProduct.findOne({
    where: { order_code, product_id }
  })
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
