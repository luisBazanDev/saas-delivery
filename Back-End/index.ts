import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { sequelize } from './src/repositories'
import './src/models/associations'

import healthRoutes from './src/routes/healthRoutes'
import authRoutes from './src/routes/authRoutes'
import productRoutes from './src/routes/productRoutes'
import storeRoutes from './src/routes/storeRoutes'
import orderRoutes from './src/routes/orderRoutes'
import orderProductRoutes from './src/routes/orderProductRoutes'
import adminRoutes from './src/routes/adminRoutes'

import adminStoreRoutes from './src/routes/adminStoreRoutes'
import userRoutes from './src/routes/userRoutes'
import dashboardRoutes from './src/routes/dashboardRoutes'
import storeOrderRoutes from './src/routes/storeOrderRoutes'
import kitchenRoutes from './src/routes/kitchenRoutes'
import deliveryRoutes from './src/routes/deliveryRoutes'
import reportRoutes from './src/routes/reportRoutes'

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

app.use((req, res, next) => {
  console.log(`[ROUTE] ${req.method} ${req.originalUrl}`)
  console.log(`[ROUTE] req.params:`, req.params)
  console.log(`[ROUTE] req.baseUrl:`, req.baseUrl)
  next()
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/order-products', orderProductRoutes)
app.use('/api', adminRoutes)

app.use('/api/admin/stores', adminStoreRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stores/:id/dashboard', dashboardRoutes)
app.use('/api/stores/:id/orders', storeOrderRoutes)
app.use('/api/stores/:id/kitchen', kitchenRoutes)
app.use('/api/stores/:id/delivery', deliveryRoutes)
app.use('/api/stores/:id/reports', reportRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/orders', orderRoutes)

app.use(errorHandler)

async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('Database connection established.')

    await sequelize.sync({ alter: true })
    console.log('Database synced.')

    app.listen(3000, () => {
      console.log('HX Delivery Server is running on http://localhost:3000')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
