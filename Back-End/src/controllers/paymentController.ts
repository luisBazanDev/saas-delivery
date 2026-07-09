import { Request, Response } from 'express'
import { Payment } from '../models/payment.model'

export async function createPayment(req: Request, res: Response) {
  const { name, logo_url } = req.body
  if (!name) {
    return res.status(400).json({ error: 'payment name is required' })
  }
  const existing = await Payment.findOne({ where: { name } })
  if (existing) {
    return res.status(409).json({ error: 'payment method already exists' })
  }
  const item = await Payment.create({ name, logo_url })
  return res.status(201).json(item)
}

export async function listPayments(req: Request, res: Response) {
  const items = await Payment.findAll()
  return res.json(items)
}

export async function getPayment(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Payment.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  return res.json(item)
}

export async function updatePayment(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Payment.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.update(req.body)
  return res.json(item)
}

export async function deletePayment(req: Request, res: Response) {
  const id = Number(req.params.id)
  const item = await Payment.findByPk(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  await item.destroy()
  return res.status(204).send()
}
