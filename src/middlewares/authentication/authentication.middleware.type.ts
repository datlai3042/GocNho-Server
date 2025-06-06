export type MiddlewareAuthentication = {
  Header: {
    CLIENT_ID: string
    AUTHORIZATION: string
  }
  Cookies: {
    access_token: string
    client_id: string
    refresh_token: string
  }
}
