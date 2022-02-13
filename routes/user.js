import express from 'express'
import {
  createUser,
  signup,
  loginUser,
  login,
  logout,
  refreshToken,
  editPassword
} from '../controller/user.js'
import { verifyToken } from '../middleware/authMiddleware.js'
const authrouter = express.Router()

// create a get route
authrouter.post('/signup', signup)
authrouter.get('/signup', createUser)
authrouter.post('/logout', verifyToken, logout)

authrouter.get('/login', loginUser)
authrouter.post('/login', login)
authrouter.post('/refreshtoken',verifyToken, refreshToken)
authrouter.post("/editpassword",verifyToken, editPassword)


export default authrouter
