import { Request, Response } from 'express'
import { Store } from '../models/store.model'

export async function createStore(req: Request, res: Response) {
  const { name, address } = req.body
  const s = await Store.create({ name, address })
  return res.status(201).json(s)
}

export async function listStores(req: Request, res: Response) {
  const items = await Store.findAll()
  return res.json(items)
}

export async function getStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updateStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deleteStore(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Store.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
