import { Router } from 'express'
import { AuthController } from '~/controllers'
import asyncHandler from '~/helpers/asyncHandler'
import authentication from '~/middlewares/authentication'

const routerAuthentication = Router()
routerAuthentication.post('/register', asyncHandler(AuthController.register))
routerAuthentication.post('/login', asyncHandler(AuthController.login))

routerAuthentication.use(authentication)
routerAuthentication.post('/logout', asyncHandler(AuthController.logout))
routerAuthentication.get('/refresh-token', asyncHandler(AuthController.refreshToken))

export default routerAuthentication
