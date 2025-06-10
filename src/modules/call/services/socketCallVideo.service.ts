import { parse } from 'cookie'
import { Socket } from 'socket.io'
import userModel from '~/models/User'
import { callModel } from '../models/call.model'
import { Types } from 'mongoose'
import { Application } from '~/type'
export type TSocketEventCall = {
  caller_id: string
  receiver_id: string
  onwer_id: string
  call_id?: string
  user_emitter_id: Application.Account.User.UserSchema['_id']
}

export enum SocketVideoCallEvent {
  emitInitVideoCall = 'emitInitVideoCall',
  emitRequestCall = 'emitRequestCall',
  onWaitingConnect = 'onWaitingConnect',

  emitRejectCall = 'emitRejectCall',
  emitAccpetCall = "emitAccpetCall",
  emitCancelCall = 'emitCancelCall',
  onCancelCall = 'onCancelCall',
  onOpenConnect = 'onOpenConnect',
  onAcceptCall = 'onAcceptCall',
  onRejectCall = 'onRejectCall',
  onPendingCall = 'onPendingCall',
  onConnectStream = 'onConnectStream'
}

class SocketCallVideo {
  static async findUserEmiter({ user_id }: { user_id: string }) {
    const findUserCall = await userModel.findOne({ _id: new Types.ObjectId(user_id) }).select({ user_atlas: true, user_avatar_system: true, user_email: true })
    if (!findUserCall) {
      return { user_emiter: null }
    }
    const user_socket = global._userSocket.find((user) => user.client_id === findUserCall?._id.toString())

    if (!user_socket) {
      return { user_emiter: null }
    }

    return {
      user_emiter: {
        socket_id: user_socket?.socket_id,
        user: findUserCall
      }
    }
  }
  async emitCall(socket: Socket, data: TSocketEventCall) {
    const { caller_id, onwer_id, receiver_id } = data
    const findUserReceiver = global._userSocket.find((user) => user?.client_id === receiver_id)
    const findUserCall = await userModel.findOne({ _id: onwer_id }).select({ user_atlas: true, user_avatar_system: true, user_email: true })
    const socketUserCall = global._userSocket.find((user) => user?.client_id === findUserCall?._id.toString())

    if (!findUserReceiver) {
      socket.emit('onPendingCallIsError', 'Không tìm thấy user')
    }

    const newCreatCall = {
      call_caller_id: onwer_id,
      call_receiver_id: receiver_id,
      call_status: 'CREATE',
      call_type: 'VIDEO',
      call_active: true
    }
    const createCall = await callModel.create(newCreatCall)
    const newData = {
      ...data,
      infoUserCall: findUserCall,
      findUserReceiver,
      call_id: createCall?._id,
      call_status: createCall?.call_status
    }
    console.log({ socketUserCall })
    if (findUserReceiver) {
      socket.to(findUserReceiver!.socket_id).emit(SocketVideoCallEvent.onPendingCall, newData)

    }
    console.log('OK', newData)
    socket.emit(SocketVideoCallEvent.onWaitingConnect, newData)

  }

  async emitRecjectCall(socket: Socket, data: TSocketEventCall) {
    const { caller_id, onwer_id, receiver_id } = data
    const { user_emiter } = await SocketCallVideo.findUserEmiter({ user_id: onwer_id })
    if (!user_emiter) {
      socket._error('Không thể thực hiện')
      return
    }
    const newCall = await callModel
      .findOneAndUpdate(
        { _id: caller_id! },
        {
          $set: {
            call_active: false,
            call_status: 'REJECT'
          }
        },
        { new: true, upsert: true }
      )
      .select({ _id: true, call_status: true })
    socket.to(user_emiter.socket_id).emit(SocketVideoCallEvent.emitRejectCall, { ...data, ...newCall.toObject() })
  }

  async emitAccpetCall(socket: Socket, data: TSocketEventCall) {
    const { caller_id, onwer_id, receiver_id, call_id } = data
    const newCall = await callModel
      .findOneAndUpdate(
        { _id: call_id! },
        {
          $set: {
            call_active: true,
            call_status: 'ACCPET'
          }
        },
        { new: true, upsert: true }
      )
      .select({ _id: true, call_status: true })
    const { user_emiter } = await SocketCallVideo.findUserEmiter({ user_id: caller_id })
    console.log({ user_emiter })

    if (!user_emiter) {
      socket._error('Không thể thực hiện')
      return
    }
    console.clear()

    const newData = { ...data, ...newCall.toObject() }
    socket.emit(SocketVideoCallEvent.onOpenConnect, newData)
    socket.to(user_emiter.socket_id).emit(SocketVideoCallEvent.onAcceptCall, newData)

  }
  async emitCancelCall(socket: Socket, data: TSocketEventCall) {
    const { caller_id, onwer_id, receiver_id, call_id, user_emitter_id } = data
    console.log({data})
    const newCall = await callModel
      .findOneAndUpdate(
        { _id: call_id! },
        {
          $set: {
            call_active: true,
            call_status: 'COMPLETE'
          }
        },
        { new: true, upsert: true }
      )
      .select({ _id: true, call_status: true })
    console.log({ user_emitter_id, receiver_id })
    if (user_emitter_id.toString() === receiver_id) {
      const { user_emiter } = await SocketCallVideo.findUserEmiter({ user_id: caller_id })
      console.log({user_emiter})
      if (!user_emiter) {
        socket._error('Không thể thực hiện')
      }
      const newData = { ...data, ...newCall.toObject() }
      socket.to(user_emiter!.socket_id).emit(SocketVideoCallEvent.onCancelCall, newData)
    } else {
      const { user_emiter } = await SocketCallVideo.findUserEmiter({ user_id: receiver_id })
      console.log({user_emiter})

      if (!user_emiter) {
        socket._error('Không thể thực hiện')
      }
      const newData = { ...data, ...newCall.toObject() }
      socket.to(user_emiter!.socket_id).emit(SocketVideoCallEvent.onCancelCall, newData)
    }






  }
}

export { SocketCallVideo }
