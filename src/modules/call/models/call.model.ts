import { model, Schema } from 'mongoose'

const DOCUMENT_NAME = 'Call'
const COLLECTION_NAME = 'calls'
export type TCallSchema = {
  call_caller_id: Schema.Types.ObjectId
  call_receiver_id: Schema.Types.ObjectId
  call_status: 'ACCPET' | 'REJECT' | 'UNANSWERED' | 'CREATE'
  call_type: 'VIDEO' | 'SOUND'
  call_active: boolean
  call_time: Date,
}
export type TCallSchemaDocument = Document & TCallSchema

export const callSchema = new Schema<TCallSchema>(
  {
    call_active: { type: Boolean, default: false },
    call_caller_id: {
      type: Schema.ObjectId,
      ref: 'Users',
      required: true
    },
    call_receiver_id: {
      type: Schema.ObjectId,
      ref: 'Users',
      required: true
    },
    call_time: { type: Date },
    call_status: { type: String, enum: ['ACCPET', 'REJECT', 'UNANSWERED', 'CREATE'], default: 'CREATE' },
    call_type: { type: String, enum: ['VIDEO', 'SOUND'], default: 'VIDEO' }
  },
  { collection: COLLECTION_NAME, timestamps: true }
)

export const callModel = model<TCallSchema>(DOCUMENT_NAME, callSchema)
