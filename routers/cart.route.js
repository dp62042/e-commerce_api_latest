import express from 'express'

import {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
} from '../controllers/cart.controller.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getCart)
router.post('/add', protect, addItemToCart)
router.put('/update', protect, updateItemQuantity)
router.delete('/delete', protect, removeItemFromCart)

export default router
