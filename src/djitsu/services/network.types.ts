export interface NetworkResponse {
  error: NetworkErrorValue
  response: Response
}
export type RequestPath = string
export type RequestBody = string | Record<string, unknown> | undefined
export type onRequestSuccess = (data: unknown) => Record<string, unknown>
export type onRequestError = (error: unknown) => Record<string, unknown>
export type onRequestDenied = (error: unknown) => Record<string, unknown>

export type NetworkErrorValue = Error | NetworkError | string | null
export interface NetworkError {
  code: number
  message: string
}
