import { Request, Response } from 'express'

export function ping(req: Request, res: Response) {
  return res.status(200).json({ status: 'ok' })
}
