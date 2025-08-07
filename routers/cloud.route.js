import express from 'express'

import upload from '../config/upload.js'
import imagekit from '../config/cloud.js'
import Product from '../models/product.model.js'

const router = express.Router()

// Upload images to imagekit and update product's images array
router.post(
  '/upload/:productId',
  upload.array('images', 5),
  async (req, res) => {
    try {
      const files = req.files
      const imageUrls = []

      for (const file of files) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
        })
        imageUrls.push(result.url)
      }

      // Update the product's images array
      const product = await Product.findByIdAndUpdate(
        req.params.productId,
        { $push: { images: { $each: imageUrls } } },
        { new: true }
      )

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' })
      }

      res.status(200).json({ success: true, images: imageUrls, product })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

export default router
