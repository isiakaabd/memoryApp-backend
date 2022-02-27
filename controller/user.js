import User from '../model/userSchema.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { encryptPassword, comparePassword } from '../Utilities/getToken.js'
import Post from '../model/postsSchema.js'

export const signup = async (req, res) => {
  const { email, password, firstname, lastname } = req.body
  try {
    const oldUser = await User.findOne({ email })
    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login')
    }
    if (password.length >= 5) {
      const encryptedPassword = await encryptPassword(password)
      const newUser = await User.create({
        email,
        password: encryptedPassword,
        firstname,
        lastname,
      })
      newUser.password = undefined
      res.status(201).json(newUser)
    } else {
      res.status(400).json({
        message: 'Password too short',
      })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
export const createUser = (_, res) => {
  res.send('welcome ')
}
export const loginUser = (_, res) => {
  res.send('Welcome  to Memory App')
}
const generateAccessToken = (user) => {
  const { _id, email } = user
  const token = jwt.sign({ id: _id, email }, process.env.TOKEN_KEY, {
    expiresIn: '1d',
  })
  return token
}
const generateRefreshToken = (user) => {
  const { _id, email } = user
  const token = jwt.sign({ id: _id, email }, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: '1d',
  })

  return token
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: 'invalid email' })
    const decryptPassword = await comparePassword(password, user.password)
    if (user && decryptPassword) {
      const token = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)

      user.token = token
      user.password = undefined
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        // sameSite: 'None',
        // secure: true,
      })
      return res.status(200).json(user)
    } else {
      return res.status(404).json({ message: 'invalid password' })
    }
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const refreshToken = (req, res) => {
  const cookies = req.cookies
  const refreshToken = cookies.jwt

  if (!cookies?.jwt)
    return res.status(401).json({ message: 'You are not authenticated' })
  else {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(403)
      const newAccessToken = generateAccessToken(user)
      res.status(200).json({
        accessToken: newAccessToken,
      })
    })
  }
}
export const logout = (req, res) => {
  const token = req.cookies
  const jwt = token.jwt
  if (!jwt) return res.sendStatus(204)
  else {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    })
    return res.status(200).json({
      message: 'User logout successful',
    })
  }
}
export const editPassword = async (req, res) => {
  const { email } = req.user
  const { password, confirmPassword } = req.body
  if (!password || password.length < 5)
    return res
      .status(404)
      .json({ message: 'Password too short or not provided' })
  else if (password !== confirmPassword)
    return res.status(404).json({ message: 'Password mismatch' })
  else {
    try {
      const encryptedPassword = await encryptPassword(password)
      const newPassword = { password: encryptedPassword }
      await User.findOneAndUpdate({ email }, newPassword, {
        new: true,
      })
      res.status(200).json({ message: 'password successful updated' })
    } catch (error) {
      res.status(404).json({ message: error.message })
    }
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.user
  const token = req.cookies
  const jwt = token.jwt
  try {
    if (jwt) {
      await Post.findOneAndDelete({ userId: id })
      await User.findByIdAndDelete(id)
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      })

      res.status(200).json({ message: 'user successfully deleted' })
    } else {
      res.sendStatus(204)
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
