import { TResponseError } from "./http.type.js"
import { reasonCode, statusCode } from "./index.js"

export class ResponseError extends Error {
  code: number
  message: string
  metadata: string | any

  constructor({ code = statusCode.INTERNAL_SERVER_ERROR, message = reasonCode.INTERNAL_SERVER_ERROR, metadata }: TResponseError) {
    super(message)
    this.code = code
    this.message = message
    this.metadata = metadata
  }
}

export class BadRequestError extends ResponseError {
  constructor({ code = statusCode.BAD_REQUEST, message = reasonCode.BAD_REQUEST, metadata = '' }: TResponseError) {
    super({ code, message, metadata })
  }
}

export class AuthFailedError extends ResponseError {
  constructor({ code = statusCode.UNAUTHORIZED, message = reasonCode.UNAUTHORIZED, metadata = '' }: TResponseError) {
    super({ code, message, metadata })
  }
}

export class ForbiddenError extends ResponseError {
  constructor({ code = statusCode.FORBIDDEN, message = reasonCode.FORBIDDEN, metadata = '' }: TResponseError) {
    super({ code, message, metadata })
  }
}

export class NotFoundError extends ResponseError {
  constructor({ code = statusCode.NOT_FOUND, message = reasonCode.NOT_FOUND, metadata = '' }: TResponseError) {
    super({ code, message, metadata })
  }
}

export class InternalError extends ResponseError {
  constructor({ code = statusCode.INTERNAL_SERVER_ERROR, message = reasonCode.INTERNAL_SERVER_ERROR, metadata = '' }: TResponseError) {
    super({ code, message, metadata })
  }
}
