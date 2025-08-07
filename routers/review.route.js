import express from 'express'

import {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getReviewsByProduct,
} from '../controllers/review.controller.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', getAllReviews)
router.get('/product/:productId', getReviewsByProduct)
router.post('/', protect, createReview)
router.post('/:reviewId', protect, updateReview)
router.post('/:reviewId', protect, deleteReview)

export default router
