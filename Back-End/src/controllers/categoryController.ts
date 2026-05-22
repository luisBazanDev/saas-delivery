import { Request, Response } from 'express'
import { Category } from '../models/category.model'

export async function createCategory(req: Request, res: Response) {
  const { name, store_id } = req.body
  const cat = await Category.create({ name, store_id })
  res.status(201).json(cat)
}

export async function listCategories(req: Request, res: Response) {
  const items = await Category.findAll()
  res.json(items)
}

export async function getCategory(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Category.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  res.json(item)
}

export async function updateCategory(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Category.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  res.json(item)
}

export async function deleteCategory(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Category.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  res.status(204).send()
}
