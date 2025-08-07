import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minLength: [2, 'Product name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minLength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
      set: (v) => {
        const num = parseFloat(v)
        if (isNaN(num)) throw new Error('Price must be a number')
        return parseFloat(num.toFixed(2))
      },
    },
    discount: {
      type: Number,
      min: [0, 'Discount must be positive'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
      set: (v) => {
        const num = parseFloat(v)
        if (isNaN(num)) throw new Error('Discount must be a number')
        return parseFloat(num.toFixed(2))
      },
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      set: (v) => Math.max(0, Math.floor(v)), // Ensure integer and non-negative
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                return /^https?:\/\/.+\..+/.test(v)
              },
              message: 'Invalid image URL',
            },
          },
          fileId: {
            type: String,
            required: true,
          },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0
        },
        message: 'At least one image is required',
      },
    },
    colors: {
      type: [String],
      set: function (arr) {
        // Ensure non-empty strings and trim
        return arr.map((c) => c.trim()).filter((c) => c !== '')
      },
      validate: {
        validator: function (arr) {
          return arr.length > 0
        },
        message: 'At least one color is required',
      },
    },
    sizes: {
      type: [String],
      set: function (arr) {
        // Ensure non-empty strings and trim
        return arr.map((s) => s.trim()).filter((s) => s !== '')
      },
      validate: {
        validator: function (arr) {
          return arr.length > 0
        },
        message: 'At least one size is required',
      },
    },
    tags: {
      type: [String],
      set: function (arr) {
        // Ensure non-empty strings and trim
        return arr.map((t) => t.trim()).filter((t) => t !== '')
      },
      validate: {
        validator: function (arr) {
          return arr.length > 0
        },
        message: 'At least one tag is required',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      set: function (v) {
        // Handle various boolean representations
        if (typeof v === 'string') {
          return v.toLowerCase() === 'true'
        }
        return !!v
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
    toObject: { virtuals: true },
  }
)

// Add pre-save hook to trim all string fields
productSchema.pre('save', function (next) {
  const stringFields = ['name', 'description', 'category', 'brand']

  stringFields.forEach((field) => {
    if (this[field]) {
      this[field] = this[field].trim()
    }
  })

  next()
})

// Virtual for sale price
productSchema.virtual('salePrice').get(function () {
  return this.price * (1 - this.discount / 100)
})

const Product = mongoose.model('Product', productSchema)
export default Product
