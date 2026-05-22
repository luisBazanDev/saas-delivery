import { Request, Response } from 'express'
import { Product } from '../models/product.model'

export async function createProduct(req: Request, res: Response) {
  const { store_id, name, description, category_id } = req.body
  const product = await Product.create({ store_id, name, description, category_id })
  res.status(201).json(product)
}

export async function listProducts(req: Request, res: Response) {
  const products = await Product.findAll()
  res.json(products)
}

export async function getProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  res.json(product)
}

export async function updateProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  await product.update(req.body)
  res.json(product)
}

export async function deleteProduct(req: Request, res: Response) {
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  await product.destroy()
  res.status(204).send()
}
