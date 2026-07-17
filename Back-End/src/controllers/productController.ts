import { Request, Response } from 'express'
import { Product } from '../models/product.model'
import { Category } from '../models/category.model'

export async function createProduct(req: Request, res: Response) {
  const user = (req as any).user
  const store_id = user.role_name === 'ADMIN' ? req.body.store_id : user.store_id
  const { name, price, is_available, description, stock, category_id } = req.body
  const product = await Product.create({ store_id, name, price, is_available, description, stock, category_id: category_id || null, is_archived: false })
  return res.status(201).json(product)
}

export async function listProducts(req: Request, res: Response) {
  const user = (req as any).user
  const { archived, category_id } = req.query
  const where: any = {}
  if (archived !== 'true') {
    where.is_archived = false
  }
  if (category_id) {
    where.category_id = Number(category_id)
  }
  if (user.role_name !== 'ADMIN' && user.store_id) {
    where.store_id = user.store_id
  }
  const products = await Product.findAll({
    where,
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'is_active'] }],
  })
  return res.json(products)
}

export async function getProduct(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'is_active'] }],
  })
  if (!product) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && product.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  return res.json(product)
}

export async function updateProduct(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && product.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  await product.update(req.body)
  return res.json(product)
}

export async function archiveProduct(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && product.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  await product.update({ is_archived: true })
  return res.json(product)
}

export async function unarchiveProduct(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.id)
  const product = await Product.findByPk(id)
  if (!product) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && product.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  await product.update({ is_archived: false })
  return res.json(product)
}
