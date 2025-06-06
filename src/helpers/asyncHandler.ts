import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Http } from '~/type'

const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request | Http.RequestCutome, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler
