import Product from '../models/product.model.js'
import imagekit from '../config/cloud.js'

// GET all products with full filters & pagination
export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand
    }

    // Is Featured filter
    if (req.query.isFeatured === 'true') {
      filter.isFeatured = true
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
    }

    // Discount filter
    if (req.query.discount) {
      filter.discount = { $gte: Number(req.query.discount) }
    }

    // In Stock filter
    if (req.query.stock) {
      filter.stock = { $gt: 0 }
    }

    // Colors filter
    if (req.query.color) {
      filter.colors = req.query.color // Exact match
    }

    // Sizes filter
    if (req.query.size) {
      filter.sizes = req.query.size // Exact match
    }

    // Tags filter
    if (req.query.tag) {
      filter.tags = req.query.tag
    }

    // Search filter (name or description)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    // Sort & order
    const sortBy = req.query.sort || 'createdAt'
    const order = req.query.order === 'asc' ? 1 : -1

    const total = await Product.countDocuments(filter)

    const products = await Product.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      count: products.length,
      products,
    })
  } catch (error) {
    next(error)
  }
}

// get single product by ID(GET:ID)

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

// create new product (admin) (post)
export const createProduct = async (req, res, next) => {
  try {
    // Admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can create products',
      })
    }

    // Development error logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Request Body:', req.body)
      console.log('Request Files:', req.files)
    }

    // Check images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      })
    }

    // Upload images to ImageKit
    const imageUploadPromises = req.files.map((file) => {
      return imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: '/ecommerce-products',
      })
    })

    const imageResults = await Promise.all(imageUploadPromises)

    const images = imageResults.map((result) => ({
      url: result.url,
      fileId: result.fileId,
    }))

    // Parse array fields
    const parseArray = (input) => {
      if (Array.isArray(input)) return input
      if (typeof input === 'string') {
        try {
          return JSON.parse(input)
        } catch {
          return input.split(',').map((item) => item.trim())
        }
      }
      return []
    }

    // Create product
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount || 0,
      stock: req.body.stock,
      category: req.body.category,
      brand: req.body.brand,
      images: images,
      colors: parseArray(req.body.colors),
      sizes: parseArray(req.body.sizes),
      tags: parseArray(req.body.tags),
      isFeatured: req.body.isFeatured || false,
    })

    const createdProduct = await product.save()

    res.status(201).json({
      success: true,
      product: createdProduct,
    })
  } catch (error) {
    // Development error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation Error Details:', error)
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      })
    }

    next(error)
  }
}

// update product (admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    // If admin uploaded new images → upload and merge
    if (req.files && req.files.length > 0) {
      const newUploadedImages = []

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream_async(
          { folder: 'products' },
          file.buffer
        )
        newUploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        })
      }

      product.images = [...product.images, ...newUploadedImages]
    }

    product.name = req.body.name || product.name
    product.description = req.body.description || product.description

    if (typeof req.body.price !== 'undefined') {
      product.price = req.body.price
    }

    if (typeof req.body.discount !== 'undefined') {
      product.discount = req.body.discount
    }

    product.stock = req.body.stock || product.stock
    product.category = req.body.category || product.category
    product.brand = req.body.brand || product.brand

    product.colors = req.body.colors || product.colors
    product.sizes = req.body.sizes || product.sizes
    product.tags = req.body.tags || product.tags

    if (typeof req.body.isFeatured !== 'undefined') {
      product.isFeatured = req.body.isFeatured
    }

    const updatedProduct = await product.save()

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct,
    })
  } catch (error) {
    next(error)
  }
}

// delete product (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.deleteOne()
    res.status(200).json({ message: 'Product removed successfully!' })
  } catch (error) {
    next(error)
  }
}
