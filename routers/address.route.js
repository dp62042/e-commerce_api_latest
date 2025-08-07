import express from 'express'

import {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
} from '../controllers/address.controller.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getAddresses)
router.get('/:id', protect, getAddressById)
router.post('/', protect, createAddress)
router.delete('/:id', protect, deleteAddress)
router.put('/:id', protect, updateAddress)

export default router
