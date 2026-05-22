import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import fs from 'fs'

const privateKey = fs.readFileSync('../private/private.key', 'utf-8')

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, privateKey, { algorithm: 'RS256', expiresIn: '1h' })
    ;(req as any).user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}
