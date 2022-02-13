import mongoose from 'mongoose'

const UserSchema = mongoose.Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 5, required: true },
    token: { type: String },
    refreshToken: { type: String },
    image: String,
    // posts: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Posts',
    //   },
    // ],
  },
  { timestamps: true },
)

const User = mongoose.model('users', UserSchema)

export default User
