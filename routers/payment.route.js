import express from 'express'

import {
  createPayment,
  updatePaymentStatus,
  getAllPayments,
  getPaymentById,
} from '../controllers/payment.controller.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getAllPayments)
router.post('/', protect, createPayment)
router.get('/:id', protect, getPaymentById)
router.put('/:id/status', protect, updatePaymentStatus)

export default router
