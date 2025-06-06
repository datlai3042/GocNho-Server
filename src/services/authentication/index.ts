import { NextFunction, Response } from 'express'
import { omit } from 'lodash'
import { Types } from 'mongoose'
import { Http } from '~/type.js'
import { TRegisterBody } from './authentication.type.js'
import { AuthFailedError } from '~/core/http/index.js'
import { checkDataUser, checkMailAndCreateUser, handleCookieAndKeyRefreshToken, handleKeyAndCookie } from './authentication.utils.js'
import { UserDocument } from '~/models/User/index.js'
import { clearCookieAuth } from '~/utils/cookie.util.js'
import keyModel from '~/models/Key/index.js'

class AuthService {
  static async register(req: Http.RequestCutome<TRegisterBody>, res: Response, next: NextFunction) {
    const { user_email, user_password } = req.body

    if (!user_email || !user_password) throw new AuthFailedError({ metadata: 'Request thiếu các field bắt buốc' })

    const { user } = await checkMailAndCreateUser({ email: user_email, password: user_password })
    // await createANotification({ user_id: user?._id, type: 'System', core: { message: 'Cảm ơn bạn đã tạo tài khoản' } })

    const { access_token, expireToken, refresh_token, expireCookie } = await handleKeyAndCookie({ user, res })

    return {
      user: omit(user.toObject(), ['user_password']),
      token: { access_token, refresh_token },
      expireToken,
      client_id: user._id,
      expireCookie
    }
  }
  static async login(req: Http.RequestCutome<TRegisterBody>, res: Response, next: NextFunction) {
    const { user_email, user_password } = req.body
    const { user } = await checkDataUser({ email: user_email, password: user_password })

    const { access_token, expireToken, refresh_token, expireCookie } = await handleKeyAndCookie({ user, res })
    // await createANotification({ user_id: user?._id, type: 'System', core: { message: 'Chào mừng bạn quay trở lại' } })
    return {
      user: omit(user.toObject(), ['user_password']),
      token: { access_token, refresh_token },
      expireCookie,
      expireToken,
      client_id: user._id
    }
  }
  static async logout(req: Http.RequestCutome<TRegisterBody>, res: Response, next: NextFunction) {
    const user = req.user as UserDocument
    const { force } = req
    // await createANotification({
    //       user_id: user?._id as Types.ObjectId,
    //       type: 'System',
    //       core: { message: 'Đăng xuất thành công' }
    // })
    clearCookieAuth({ res })

    await keyModel.findOneAndDelete({ user_id: user._id })

    return force ? { message: 'Bắt buộc logout' } : { message: 'Logout thành công' }
  }
  static async refreshToken(req: Http.RequestCutome<TRegisterBody>, res: Response, next: NextFunction) {
    const { refresh_token } = req
    const { user } = req
    const { access_token, expireToken, new_refresh_token, expireCookie } = await handleCookieAndKeyRefreshToken({
      user: user as UserDocument,
      refresh_token_used: refresh_token as string,
      res
    })
    return {
      user: omit(user?.toObject(), ['user_password']),
      token: { access_token, refresh_token: new_refresh_token },
      expireToken,
      expireCookie,
      client_id: (user?._id as Types.ObjectId).toString()
    }
  }
}

export default AuthService
