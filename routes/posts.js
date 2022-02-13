import express from 'express'
import { getPosts, createpost } from '../controller/posts.js'
import { verifyToken } from '../middleware/authMiddleware.js'
const router = express.Router()

router.get('/', verifyToken, getPosts)
router.post('/', verifyToken, createpost)

export default router
