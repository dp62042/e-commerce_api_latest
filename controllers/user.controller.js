import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// generate jwt
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '30d',
    }
  )
}

// register new user(post)
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body
  // check if user exists

  const userExists = await User.findOne({
    email,
  })

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' })
  }

  // hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
  })
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(400).json({ message: 'Invalid user data' })
  }
}

// login
export const loginUser = async (req, res) => {
  const { email, password } = req.body

  //check for user
  const user = await User.findOne({ email })

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(401).json({ message: 'Invalid email or password' })
  }
}

// logout user (POST)
export const logoutUser = (req, res) => {
  res.status(200).json({ message: 'User logged out successfully' })
}
