import { Router } from 'express'
import { routerUser } from '~/modules/users/routers/index.js'
import routerAuthentication from './authentication/index.js'

//flag
const router = Router()
router.use('/v1/api/auth', routerAuthentication)
router.use('/v1/api/users', routerUser)

export default router
