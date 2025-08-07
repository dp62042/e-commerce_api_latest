import Review from '../models/review.model.js'
import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
// create new review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    // check product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // check product delivered or not
    const userOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: 'delivered',
    })
    if (!userOrder) {
      return res.status(400).json({
        message: 'You can only review products you have purchased and received',
      })
    }

    // check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    })

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this product' })
    }

    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    })

    await review.save()

    res.status(201).json({ message: 'Review added', review })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username email') // adjust fields as needed
      .populate('product', 'name')

    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET reviews for a specific product
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params

    const reviews = await Review.find({ product: productId }).populate(
      'user',
      'username email'
    )

    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// update reviews
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, comment } = req.body

    const review = await Review.findById(reviewId)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You can only update your own review' })
    }

    // Extra safety: verify order & delivery again
    const userOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': review.product,
      orderStatus: 'delivered',
    })

    if (!userOrder) {
      return res.status(400).json({
        message:
          'You can only update reviews for products you have purchased and received',
      })
    }

    review.rating = rating || review.rating
    review.comment = comment || review.comment

    await review.save()

    res.status(200).json({ message: 'Review updated', review })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    // Check if the logged in user is the review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own review' })
    }

    await review.remove()

    res.status(200).json({ message: 'Review deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
