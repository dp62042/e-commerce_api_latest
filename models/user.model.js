import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Email is required'],
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
      },
      message: 'Invalid email format',
    },
  },
  password: {
    type: String,
    trim: true,
    minlength: [6, 'Password must be at least 6 characters long'],
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

const User = mongoose.model('User', userSchema)
export default User
