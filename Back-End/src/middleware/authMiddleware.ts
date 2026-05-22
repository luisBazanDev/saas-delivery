import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicKey = fs.readFileSync(path.join(__dirname, '../../private/public.pem'), 'utf-8')

const JWT_SECRET = fs.readFileSync(path.join(__dirname, '../../private/private.pem'), 'utf-8')

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = header.split(' ')[1]
  try {
    const payload = publicKey ? jwt.verify(token, publicKey) : jwt.verify(token, JWT_SECRET)
    ;(req as any).user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}
