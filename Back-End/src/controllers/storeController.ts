import { Request, Response } from 'express'
import { Store } from '../models/store.model'

export async function createStore(req: Request, res: Response) {
  const { name, address } = req.body
  const s = await Store.create({ name, address })
  return res.status(201).json(s)
}

export async function list(req: Request, res: Response) {
  const user = (req as any).user
  if (user.role_name === 'ADMIN') {
    const stores = await Store.findAll()
    return res.status(200).json(stores)
  }
  if (user.store_id) {
    const store = await Store.findByPk(user.store_id)
    return res.status(200).json(store ? [store] : [])
  }
  return res.status(200).json([])
}

export async function listStores(req: Request, res: Response) {
  const user = (req as any).user
  if (user.role_name === 'ADMIN') {
    const items = await Store.findAll()
    return res.json(items)
  }
  if (user.store_id) {
    const store = await Store.findByPk(user.store_id)
    return res.json(store ? [store] : [])
  }
  return res.json([])
}

export async function getStore(req: Request, res: Response) {
  const user = (req as any).user
  const id = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!id) return res.status(400).json({ error: 'store_id is required' })
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updateStore(req: Request, res: Response) {
  const user = (req as any).user
  const id = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!id) return res.status(400).json({ error: 'store_id is required' })
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deleteStore(req: Request, res: Response) {
  const user = (req as any).user
  const id = user.role_name === 'ADMIN' ? Number(req.params.id) : user.store_id
  if (!id) return res.status(400).json({ error: 'store_id is required' })
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
