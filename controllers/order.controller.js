import Order from '../models/order.model.js'
import Product from '../models/product.model.js'

// @desc    Place new order
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    // Optional: validate product existence & calculate totalPrice
    let totalPrice = 0
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` })
      }
      totalPrice += product.price * item.quantity
    }

    const order = new Order({
      userId: req.user._id, // Assuming you have auth middleware
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    })

    const createdOrder = await order.save()
    res.status(201).json(createdOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate(
      'items.productId',
      'name price'
    )
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.orderStatus = req.body.status || order.orderStatus
    if (order.orderStatus === 'delivered') {
      order.deliveredAt = new Date()
      order.paymentStatus = 'paid'
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
