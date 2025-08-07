import express from 'express'

import {
  placeOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js'
import { protect } from '../middlewares/authMiddleware.js'
import admin from '../middlewares/admin.js'

const router = express.Router()

router.get('/', protect, admin, getAllOrders)
router.post('/', protect, placeOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router
