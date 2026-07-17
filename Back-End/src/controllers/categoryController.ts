import { Request, Response } from 'express'
import { Category } from '../models/category.model'
import { Product } from '../models/product.model'

export async function listCategories(req: Request, res: Response) {
  const user = (req as any).user
  const { active } = req.query
  const where: any = {}
  if (user.role_name !== 'ADMIN' && user.store_id) {
    where.store_id = user.store_id
  }
  if (active !== 'false') {
    where.is_active = true
  }
  const categories = await Category.findAll({ where, order: [['name', 'ASC']] })
  return res.json(categories)
}

export async function createCategory(req: Request, res: Response) {
  const user = (req as any).user
  const store_id = user.role_name === 'ADMIN' ? req.body.store_id : user.store_id
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const category = await Category.create({ store_id, name, is_active: true })
  return res.status(201).json(category)
}

export async function updateCategory(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.catId)
  const category = await Category.findByPk(id)
  if (!category) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && category.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  const { name, is_active } = req.body
  await category.update({ name: name ?? category.name, is_active: is_active ?? category.is_active })
  return res.json(category)
}

export async function deleteCategory(req: Request, res: Response) {
  const user = (req as any).user
  const id = Number(req.params.catId)
  const category = await Category.findByPk(id)
  if (!category) return res.status(404).json({ error: 'not found' })
  if (user.role_name !== 'ADMIN' && category.store_id !== user.store_id) {
    return res.status(403).json({ error: 'forbidden' })
  }
  const productCount = await Product.count({ where: { category_id: id } })
  if (productCount > 0) {
    return res.status(409).json({ error: 'Cannot delete category with assigned products' })
  }
  await category.update({ is_active: false })
  return res.json({ message: 'Category deactivated' })
}
