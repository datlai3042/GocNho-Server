import { compare } from 'bcrypt'
import { Response } from 'express'
import { BadRequestError, ResponseError } from '~/core/http'
import keyModel from '~/models/Key'
import userModel, { UserDocument } from '~/models/User'
import { hassPassword } from '~/utils/Bcrypt.util'
import { setCookieAuth } from '~/utils/cookie.util'
import { createPayload, fillDataKeyModel, generatePaidKey, generatePaidToken } from '~/utils/tokenKey.util'

export const handleCookieAndKeyRefreshToken = async ({ user, refresh_token_used, res }: { user: UserDocument; refresh_token_used: string; res: Response }) => {
  const { public_key, private_key } = generatePaidKey()
  if (!public_key || !private_key) throw new ResponseError({ metadata: 'Server không thể tạo key sercet' })
  const payload = createPayload(user as UserDocument)

  const { access_token, refresh_token } = generatePaidToken(payload, { public_key, private_key })

  const keyModelQuery = { user_id: user?._id }
  const keyModelUpdate = {
    $set: { refresh_token, private_key, public_key },
    $addToSet: { refresh_token_used: refresh_token_used }
  }
  const keyModelOption = { new: true, upsert: true }

  await keyModel.findOneAndUpdate(keyModelQuery, keyModelUpdate, keyModelOption)

  const dataCookie = {
    client_id: user?._id.toString() || '',
    refresh_token,
    access_token,
    res
  }

  const { expireToken, expireCookie } = setCookieAuth(dataCookie)
  return { expireToken, access_token, new_refresh_token: refresh_token, expireCookie }
}
export const handleKeyAndCookie = async ({ user, res }: { user: UserDocument; res: Response }) => {
  await keyModel.findOneAndDelete({ user_id: user._id })

  const { public_key, private_key } = generatePaidKey()
  if (!public_key || !private_key) throw new ResponseError({ metadata: 'Server không thể tạo key sercet' })

  const payload = createPayload(user)
  const { access_token, refresh_token } = generatePaidToken(payload, { public_key, private_key })

  const { modelKeyOption, modelKeyUpdate, modelKeyQuery } = fillDataKeyModel(user, public_key, private_key, refresh_token)
  const keyStore = await keyModel.findOneAndUpdate(modelKeyQuery, modelKeyUpdate, modelKeyOption)

  if (!keyStore) throw new ResponseError({ metadata: 'Server không thể tạo model key' })

  const dataCookie = {
    client_id: user._id.toString(),
    refresh_token: refresh_token,
    access_token: access_token,
    res
  }

  const { expireToken, expireCookie } = setCookieAuth(dataCookie)

  return { expireToken, access_token, refresh_token, expireCookie }
}

export const checkDataUser = async ({ email, password }: { email: string; password: string }) => {
  const foundUser = await userModel.findOne({ user_email: email })
  if (!foundUser) throw new BadRequestError({ metadata: 'Không tìm thấy thông tin tài khoản' })

  const checkPassword = await compare(password, foundUser?.user_password)
  if (!checkPassword) throw new BadRequestError({ metadata: 'Thông tin tài khoản không chính xác' })
  return { user: foundUser }
}

export const checkMailAndCreateUser = async ({ email, password }: { email: string; password: string }) => {
  const foundEmail = await userModel.findOne({ user_email: email })
  if (foundEmail) throw new BadRequestError({ metadata: 'Email đã tồn tại' })

  const hashPassword = await hassPassword(password?.toString())

  const user_atlas = email.split('@')[0]

  const createUser = await userModel.create({
    user_email: email,
    user_password: hashPassword,
    user_auth: 'email',
    user_password_state: true,
    user_atlas
  })
  if (!createUser) throw new ResponseError({ metadata: 'Không thể đăng kí user do lỗi' })

  return { user: createUser }
}
