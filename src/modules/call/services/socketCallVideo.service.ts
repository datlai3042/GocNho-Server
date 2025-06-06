import { parse } from 'cookie'
import { Socket } from 'socket.io'
import userModel from '~/models/User'
import { callModel } from '../models/call.model'
import { Types } from 'mongoose'
export type TSocketEventCall = {
  caller_id: string
  receiver_id: string
  onwer_id: string
  call_id?: string
}

export enum SocketVideoCallEvent {
  emitInitVideoCall = 'emitInitVideoCall',
  emitRejectCall = 'emitRejectCall',
  emitAccpetCall = "emitAccpetCall",

  onAcceptCall = 'onAcceptCall',
  onRejectCall = 'onRejectCall',
  onPendingCall = 'onPendingCall',
  onConnectStream = 'onConnectStream'
}

class SocketCallVideo {
  static async findUserEmiter({ user_id }: { user_id: string }) {
    const findUserCall = await userModel.findOne({ _id: new Types.ObjectId(user_id) }).select({ user_atlas: true, user_avatar_system: true, user_email: true })
    console.log('step1')
    if (!findUserCall) {
      return { user_emiter: null }
    }
    const user_socket = global._userSocket.find((user) => user.client_id === findUserCall?._id.toString())
    console.log('step2')

    if (!user_socket) {
      return { user_emiter: null }
    }
    console.log('step3')

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
    if (!findUserReceiver || !findUserCall) {
      socket.to(caller_id).emit('onPendingCallIsError', 'Không tìm thấy user')
      return
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
    socket.to(findUserReceiver.socket_id).emit(SocketVideoCallEvent.onPendingCall, newData)
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
    console.log('bat may di')
    socket.to(user_emiter.socket_id).emit(SocketVideoCallEvent.onAcceptCall, { ...data, ...newCall.toObject() })

  }

}

export { SocketCallVideo }
