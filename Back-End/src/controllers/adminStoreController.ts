import { Request, Response } from 'express'
import { Store } from '../models/store.model'

export async function listStores(req: Request, res: Response) {
  const stores = await Store.findAll({
    order: [['created_at', 'DESC']],
  })
  return res.json(stores)
}

export async function getStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const store = await Store.findByPk(id)
  if (!store) return res.status(404).json({ error: 'Store not found' })
  return res.json(store)
}

export async function createStore(req: Request, res: Response) {
  const { name, address, phone, email, logo_url, lat, lon } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const store = await Store.create({
    name,
    address,
    phone,
    email,
    logo_url,
    lat,
    lon,
    is_active: true,
  })
  return res.status(201).json(store)
}

export async function updateStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const store = await Store.findByPk(id)
  if (!store) return res.status(404).json({ error: 'Store not found' })

  await store.update(req.body)
  return res.json(store)
}

export async function deleteStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const store = await Store.findByPk(id)
  if (!store) return res.status(404).json({ error: 'Store not found' })

  await store.destroy()
  return res.status(204).send()
}

export async function toggleStoreStatus(req: Request, res: Response) {
  const id = Number(req.params.id)
  const store = await Store.findByPk(id)
  if (!store) return res.status(404).json({ error: 'Store not found' })

  await store.update({ is_active: !store.is_active })
  return res.json({ id: store.id, is_active: store.is_active })
}
