import { Document, Schema, model } from 'mongoose'
import { Application } from '~/type'

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'keys'

export type KeyManagerDocument = Document & Application.Account.Key.KeySchema

const keySchema = new Schema<Application.Account.Key.KeySchema>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    public_key: { type: String, required: true },
    private_key: { type: String, required: true },
    refresh_token: { type: String, required: true },
    refresh_token_used: { type: [String], required: true }
  },
  { collection: COLLECTION_NAME, timestamps: true }
)

const keyModel = model(DOCUMENT_NAME, keySchema)

export default keyModel
