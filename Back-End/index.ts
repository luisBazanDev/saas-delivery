import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import healthRoutes from './src/routes/healthRoutes'
import authRoutes from './src/routes/authRoutes'
import productRoutes from './src/routes/productRoutes'
import categoryRoutes from './src/routes/categoryRoutes'
import storeRoutes from './src/routes/storeRoutes'
import adminRoutes from './src/routes/adminRoutes'
import { requestLogger } from './src/middleware/requestLogger'
import { errorHandler } from './src/middleware/errorHandler'

const app: Express = express()

app.use(helmet())
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))
app.use(express.json())
app.use(requestLogger)

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api', adminRoutes)

app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000')
})
