import { Router } from "express";
import UserController from "../controllers/user.controller";
import UserService from "../services/user.service";
import asyncHandler from "~/helpers/asyncHandler";
import authentication from "~/middlewares/authentication";

const routerUser = Router()
const userController = new UserController(new UserService)
routerUser.get('/get-all-list', asyncHandler(userController.getListAll))
routerUser.get('/get-list-for-me')
routerUser.use(authentication)
routerUser.get('/get-me', asyncHandler(userController.getMe))
export { routerUser }



