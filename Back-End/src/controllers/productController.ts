import { Request, Response } from 'express'
import { Product } from '../models/product.model'

export async function createProduct(req: Request, res: Response) {
  const { store_id, name, price, is_available, description, stock } = req.body
  const product = await Product.create({ store_id, name, price, is_available, description, stock, is_archived: false })
  return res.status(201).json(product)
}

export async function listProducts(req: Request, res: Response) {
  const { archived } = req.query
  const where: any = {}
  if (archived !== 'true') {
    where.is_archived = false
  }
  const products = await Product.findAll({ where })
  return res.json(products)
}

export async function getProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  return res.json(product)
}

export async function updateProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  await product.update(req.body)
  return res.json(product)
}

export async function archiveProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  await product.update({ is_archived: true })
  return res.json(product)
}

export async function unarchiveProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  await product.update({ is_archived: false })
  return res.json(product)
}
