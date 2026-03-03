/**
 * HTTP Client Type Declarations
 */

export interface HTTPClientConfig {
  baseURL?: string
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export default class HTTPClient {
  baseURL: string
  timeout: number
  maxRetries: number
  retryDelay: number
  headers: Record<string, string>

  constructor(config?: HTTPClientConfig)

  request<T = any>(url: string, options?: RequestOptions): Promise<T>
  get<T = any>(url: string, options?: RequestOptions): Promise<T>
  post<T = any>(url: string, data: any, options?: RequestOptions): Promise<T>

  private _fetchWithTimeout(url: string, options: RequestOptions): Promise<Response>
  private _delay(ms: number): Promise<void>
}
