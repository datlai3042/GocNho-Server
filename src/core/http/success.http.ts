import { Response } from 'express'
import statusCode from './statusCode.http'
import reasonCode from './reasonsStatusCode.http'
import { TResponseSuccess } from './http.type'

class ResponseSuccess {
  private code: number
  private message: string
  private metadata: any

  constructor({ code = statusCode.OK, message = reasonCode.OK, metadata }: TResponseSuccess) {
    this.code = code
    this.message = message
    this.metadata = metadata
  }

  send(res: Response) {
    return res.json(this)
  }

  sendStream(res: Response) {
    const boundary = 'boundary'
    res.setHeader('Content-Type', `multipart/mixed; boundary=${boundary}`)
    return res.end()
  }
}

class CREATE extends ResponseSuccess {
  constructor({ code = statusCode.CREATED, message = reasonCode.CREATED, metadata = {} }: TResponseSuccess) {
    super({ code, message, metadata })
  }
}

class OK extends ResponseSuccess {
  constructor({ code = statusCode.OK, message = reasonCode.OK, metadata = {} }: TResponseSuccess) {
    super({ code, message, metadata })
  }
}

export { CREATE, ResponseSuccess, OK }
