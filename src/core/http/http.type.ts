export type TResponseSuccess = {
  code?: number
  message?: string
  metadata: any
}

export type TResponseError = {
  code?: number
  message?: string
  metadata: string | any
}
