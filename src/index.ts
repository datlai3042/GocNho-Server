import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

import { config } from 'dotenv'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import bodyParser from 'body-parser'
import { createServer, } from 'http'
import { Server, Socket } from 'socket.io'
import { parse } from 'cookie'
import MongoConnect from './database/mongo.database.js'
import { socketStSService } from './modules/socket/services/socket.service.js'
import router from './routers/index.js'
import { Http } from './type.js'
import errorHandler from './helpers/error.catch.js'
export type UserSocket = { [key: string]: { socket_id: string } }

config()
const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.MODE === 'DEV' ? ['http://localhost:3000', 'http://localhost:5173',] : process.env.CLIENT_URL, // Cho phép truy cập từ origin này

    methods: ['GET', 'POST'], // Chỉ cho phép các phương thức GET và POST
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Chỉ
    credentials: true
  },
  cookie: true
})
global._userSocket = []
global._io = io // cach 2
MongoConnect.Connect()
app.use(helmet())
app.use(compression())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', process.env.CLIENT_URL as string], // Cho phép truy cập từ origin này
    methods: ['GET', 'POST', 'DELETE'], // Chỉ cho phép các phương thức GET và POST
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Chỉ
    credentials: true
  })
)

global._io.use(async (socket: Socket, next: any) => {
  const cookie = socket.handshake.headers.cookie || ''
  const client_id = parse(cookie)

  return next()
})


global._io.on('connect', socketStSService.connection)

app.use('', router)

app.use((error: Http.ServerError, req: Request, res: Response, next: NextFunction) => {
  return errorHandler(error, req, res, next)
})

const PORT = process.env.PORT || 4004
server.listen(PORT, () => {
  console.log('comming', PORT)
})
