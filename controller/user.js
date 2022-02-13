import User from '../model/userSchema.js'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import 'dotenv/config'
import {
  getToken,
  encryptPassword,
  comparePassword,
} from '../Utilities/getToken.js'
export const signup = async (req, res) => {
  const { email, password } = req.body
  try {
    const oldUser = await User.findOne({ email })
    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login')
    }
    const encryptedPassword = encryptPassword(password)
    const newUser = await User.create({
      email,
      password: encryptedPassword,
    })
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
  res.send('welcome')
}
export const createUser = (req, res) => {
  res.send('welcome ')
}
export const loginUser = (req, res) => {
  res.send('Welcome  to Memory App')
}
const generateAccessToken = (user) => {
  const { _id, email } = user
  const token = jwt.sign({ id: _id, email }, process.env.TOKEN_KEY, {
    expiresIn: '1h',
  })
  return token
}
const generateRefreshToken = (user) => {
  const { _id, email } = user
  const token = jwt.sign({ id: _id, email }, process.env.REFRESH_TOKEN_KEY)
  return token
}

let refreshTokens = []
export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'invalid email' })
    const decryptPassword = await comparePassword(password, user.password)
    if (user && decryptPassword) {
      const token = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)
      refreshTokens.push(refreshToken)
      user.token = token
      user.refreshToken = refreshToken
      return res.status(200).json(user)
    } else {
      return res.status(404).json({ message: 'invalid password' })
    }
  } catch (err) {
    res.status(404).json({ message: 'invalid email/password' })
  }
}

export const refreshToken = (req, res) => {
  const refreshToken = req.body.token

  //   const token = getToken(req)
  if (!refreshToken)
    return res.status(401).json({ message: 'You are not authenticated' })
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: 'refresh token is not valid' })

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
    err && console.log(err)
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    refreshTokens.push(newRefreshToken)

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  })
}

export const logout = (req, res) => {
  const refreshToken = req.body.token
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
  res.status(200).json({ message: 'Logout successful' })
}
export const editPassword = async (req, res) => {
  // const token = getToken(req)
  const { id, email } = req.user
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
