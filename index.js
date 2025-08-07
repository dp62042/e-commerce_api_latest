import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const app = express()
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use join(__dirname, 'views') etc.
app.set('views', join(__dirname, 'views'))
app.use(express.static(join(__dirname, 'public')))

import cors from 'cors'

const port = process.env.PORT || 5500

// Enable CORS
app.use(cors())

// Set EJS as template engine
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views')) // Now this works!

// Serve static files
app.use(express.static(join(__dirname, 'public')))

// Custom Methods & Headers in CORS
app.use(
  cors({
    origin: ['http://localhost:8080', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Middleware to parse JSON
app.use(express.json())
import connectDb from './config/db.js'
import userRouter from './routers/user.route.js'
import productRouter from './routers/product.route.js'
import reviewRouter from './routers/review.route.js'
import paymentRouter from './routers/payment.route.js'
import orderRouter from './routers/order.route.js'
import cartRouter from './routers/cart.route.js'
import addressRouter from './routers/address.route.js'
import cloudRouter from './routers/cloud.route.js'

connectDb()
  .then(() => {
    console.log('db connected successfully!')
  })
  .catch((err) => {
    console.log(err)
  })

// Mount routers
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/orders', orderRouter)
app.use('/api/cart', cartRouter)
app.use('/api/addresses', addressRouter)
app.use('/api/cloud', cloudRouter)

app.get('/', (req, res, next) => {
  res.render('profile', {
    title: 'e-commerce api',
    socials: {
      twitter: process.env.X_LINK,
      github: process.env.GITHUB_LINK,
      linkedin: process.env.LINKEDIN_LINK,
    },
  })
})

app.get('/api-docs', (req, res, next) => {
  res.render('read')
})

app.listen(port, () => {
  console.log(`server is live on http://localhost:${port}`)
})
