import Payment from '../models/payment.model.js'
import Order from '../models/order.model.js'
import User from '../models/user.model.js'

// @desc    Create a new payment
// @route   POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const { order, user, paymentMethod, amount, transactionId } = req.body

    if (!order || !user || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Optional: Verify order and user exist
    const existingOrder = await Order.findById(order)
    const existingUser = await User.findById(user)

    if (!existingOrder || !existingUser) {
      return res.status(404).json({ message: 'Order or User not found' })
    }

    const payment = new Payment({
      order,
      user,
      paymentMethod,
      amount,
      transactionId,
    })

    const savedPayment = await payment.save()
    res.status(201).json(savedPayment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all payments
// @route   GET /api/payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order')
      .populate('user')
      .sort({ createdAt: -1 })

    res.status(200).json(payments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('user')

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    res.status(200).json(payment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body

    if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    payment.paymentStatus = paymentStatus
    await payment.save()

    res.status(200).json(payment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
