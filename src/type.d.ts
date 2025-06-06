import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import { UserDocument } from './models/User'
import { KeyManagerDocument } from './models/Key'

namespace Http {
  interface RequestCutome<TBody = any, TQuery = any> extends Request {
    user?: UserDocument
    key?: KeyManagerDocument
    force?: boolean
    body: TBody
    query: TQuery
    refresh_token?: string
  }

  type RequestInstance<TBody = any, TQuery = any> = {
    req: RequestCutome<TBody, TQuery>
    res: Response
    next: NextFunction
  }

  interface ServerError extends Error {
    code?: number
    detail?: string
    metadata: any
  }
}

namespace Application {
  namespace Account {
    namespace User {
      type Gender = 'MALE' | 'FEMALE' | 'OTHER'
      type UserRole = 'USER' | 'ADMIN' | 'GUEST'

      type UserAvatar = string

      type UserAuth = 'email' | 'oAuth'
      type UserSchema = {
        _id: Types.ObjectId
        user_email: string
        user_password: string
        // user_first_name: string
        // user_last_name: string
        user_birthday: Date
        user_gender: Gender
        user_roles: UserRole
        user_avatar_system: string
        user_avatar_current: UserAvatar
        user_avater_used: UserAvatar[]
        user_auth: UserAuth
        user_create_password: boolean
        user_atlas: string
      }
    }

    namespace Key {
      type KeySchema = {
        user_id: Types.ObjectId
        public_key: string
        private_key: string
        refresh_token: string
        refresh_token_used: string[]
      }
    }
  }

  namespace Token {
    export type Key = {
      public_key: string
      private_key: string
    }

    export type PairToken = {
      access_token: string
      refresh_token: string
    }

    export type PayloadJWT = {
      _id: Types.ObjectId
      user_email: string
      user_roles: string
    }
  }
}
