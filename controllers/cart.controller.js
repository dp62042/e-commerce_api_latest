import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      'items.productId'
    )
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Add item to cart
export const addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body
  try {
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: req.user._id,
        items: [{ productId, quantity, price: product.price }],
      })
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      )
      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity
      } else {
        // Add new item
        cart.items.push({ productId, quantity, price: product.price })
      }
    }

    cart.updatedAt = Date.now()
    await cart.save()
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update item quantity
export const updateItemQuantity = async (req, res) => {
  const { productId, quantity } = req.body
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    )
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    cart.items[itemIndex].quantity = quantity
    cart.updatedAt = Date.now()
    await cart.save()
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Remove item from cart
export const removeItemFromCart = async (req, res) => {
  const { productId } = req.body
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    )
    cart.updatedAt = Date.now()
    await cart.save()
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
