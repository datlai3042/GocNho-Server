import autoBind from "auto-bind";
import UserService from "../services/user.service";
import { Http } from "~/type";
import { NextFunction, Request, Response } from "express";
import { OK } from "~/core/http";

class UserController {
  constructor(private userService: UserService) {
    autoBind(this)
  }

  async getListAll(request: Http.RequestCutome, response: Response, next: NextFunction) {
    new OK({ metadata: await this.userService.getAllListUsers(request, response, next) }).send(response)
  }

  async getMe(request: Http.RequestCutome, response: Response, next: NextFunction) {
    new OK({ metadata: await this.userService.getMe(request, response, next) }).send(response)
  }

}

export default UserController