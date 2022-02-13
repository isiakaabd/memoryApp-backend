import Post from '../model/postsSchema.js'

export const getPosts = async (req, res) => {
  const { id, email } = req.user

  try {
    const postmessage = await Post.find({ email })
    res.status(200).json(postmessage)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const createpost = async (req, res) => {
  const posts = req.body
  const { id, email } = req.user
  posts.email = email

  try {
    const newPost = await Post.create(posts)
    res.status(201).json(newPost)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}
