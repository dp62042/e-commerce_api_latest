import express from 'express'

import {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  getProductById,
} from '../controllers/product.controller.js'
import { protect } from '../middlewares/authMiddleware.js'
import admin from '../middlewares/admin.js'
import upload from '../config/upload.js'
import {
  validateProduct,
  validateProductUpdate,
} from '../middlewares/validationMiddleware.js'

const router = express.Router()

//public
router.get('/', getAllProducts)
router.get('/:id', getProductById)

//admin
router.post(
  '/',
  protect,
  admin,
  upload.array('images', 5), // <-- Add this middleware
  validateProduct,

  createProduct
)
router.put('/:id', validateProductUpdate, protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router
