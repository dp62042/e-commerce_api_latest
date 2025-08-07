import { body, oneOf, validationResult } from 'express-validator'

// Common validation rules for both create and update
const commonValidations = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  // ✅ Price: validate AND convert to float
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(), // ←←← This converts "122" → 122

  // ✅ Discount: validate AND convert to float
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0-100%')
    .toFloat(), // ←←← Converts string to number

  // ✅ Stock: validate AND convert to integer
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(), // ←←← Converts "10" → 10

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('brand').optional().trim().notEmpty().withMessage('Brand is required'),

  // Colors, Sizes, Tags: your sanitizer already handles conversion
  body('colors')
    .optional()
    .customSanitizer((value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c)
        }
      }
      return []
    })
    .isArray({ min: 1 })
    .withMessage('At least one color is required'),

  body('sizes')
    .optional()
    .customSanitizer((value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s)
        }
      }
      return []
    })
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),

  body('tags')
    .optional()
    .customSanitizer((value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        }
      }
      return []
    })
    .isArray({ min: 1 })
    .withMessage('At least one tag is required'),

  body('isFeatured')
    .optional()
    .toBoolean() // This already converts to boolean
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
]
// Create-specific validations
export const validateProduct = [
  ...commonValidations,
  // Make required fields mandatory for creation
  body('name').exists().withMessage('Name is required'),
  body('description').exists().withMessage('Description is required'),
  body('price').exists().withMessage('Price is required'),
  body('stock').exists().withMessage('Stock is required'),
  body('category').exists().withMessage('Category is required'),
  body('brand').exists().withMessage('Brand is required'),
  body('colors').exists().withMessage('Colors are required'),
  body('sizes').exists().withMessage('Sizes are required'),
  body('tags').exists().withMessage('Tags are required'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      })
    }
    next()
  },
]

// Update-specific validations
export const validateProductUpdate = [
  ...commonValidations,
  // At least one field should be provided
  oneOf(
    [
      body('name').exists(),
      body('description').exists(),
      body('price').exists(),
      body('discount').exists(),
      body('stock').exists(),
      body('category').exists(),
      body('brand').exists(),
      body('colors').exists(),
      body('sizes').exists(),
      body('tags').exists(),
      body('isFeatured').exists(),
    ],
    'At least one field must be provided for update'
  ),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      })
    }
    next()
  },
]
