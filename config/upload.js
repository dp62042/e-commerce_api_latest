import multer from 'multer'

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG, WEBP formats allowed'), false)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Increased to 5MB
    files: 5,
  },
})

export default upload
