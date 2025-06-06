import autoBind from 'auto-bind'
import { parse } from 'cookie'
import { Socket } from 'socket.io'
import { SocketCallVideo, SocketVideoCallEvent, TSocketEventCall } from '~/modules/call/services/socketCallVideo.service.js'
class SocketService {
  constructor(private socketCallVideo: SocketCallVideo) {
    autoBind(this)
  }
  async connection(socket: Socket) {
    const cookie = parse(socket.handshake.headers.cookie || '')
    const client_id = cookie?.client_id || ''
    if (client_id) {
      const found_user = global._userSocket.some((user) => user.client_id === client_id)
      if (!found_user) {
        global._userSocket.push({ client_id, socket_id: socket.id })
      }
    }

    socket.on('disconnect', () => {
      const client_id = cookie?.client_id || ''

      const user_index = global._userSocket.findIndex((user) => user.client_id === client_id)
      if (user_index !== -1) {
        global._userSocket.splice(user_index, 1)
      }
    })

    socket.on(SocketVideoCallEvent.emitInitVideoCall, (data: TSocketEventCall) => {
      this.socketCallVideo.emitCall(socket, data)
    })

    socket.on(SocketVideoCallEvent.emitRejectCall, (data: TSocketEventCall) => {
      this.socketCallVideo.emitRecjectCall(socket, data)
    })

    socket.on(SocketVideoCallEvent.onAcceptCall, (data: TSocketEventCall) => {
      this.socketCallVideo.emitAccpetCall(socket, data)
    })
  }
}

const socketStSService = new SocketService(new SocketCallVideo())

export { SocketService, socketStSService }
