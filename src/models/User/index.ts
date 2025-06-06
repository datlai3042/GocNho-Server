import { Document, model, Schema } from 'mongoose'
import { Application } from '~/type'

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'users'

export type UserDocument = Document & Application.Account.User.UserSchema

const userSchema = new Schema<Application.Account.User.UserSchema>(
  {
    user_email: { type: String, required: true },
    user_password: { type: String, required: true },
    // user_first_name: { type: String, required: true },
    user_atlas: { type: String, required: true },
    user_create_password: { type: Boolean, default: false },
    // user_last_name: { type: String, required: true },
    user_birthday: { type: Date },
    user_gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'MALE', required: true },
    user_roles: { type: String, enum: ['USER', 'ADMIN', 'GUEST'], default: 'USER', required: true },
    user_avatar_system: { type: String, default: '123', required: true },
    user_avatar_current: { type: String },
    user_auth: { type: String, enum: ['email', 'oAuth'], default: 'email' },
    user_avater_used: {
      type: [
        {
          secure_url: String,
          public_id: String,
          date: Date
        }
      ],
      default: []
    }
  },
  { collection: COLLECTION_NAME, timestamps: true }
)

const userModel = model(DOCUMENT_NAME, userSchema)
export default userModel
