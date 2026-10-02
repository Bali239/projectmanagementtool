import axios, { AxiosError, type AxiosRequestConfig } from "axios"

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "")

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

type RefreshableRequest = AxiosRequestConfig & { refreshRetried?: boolean }

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RefreshableRequest | undefined
  const url = config?.url || ""
  const isAuthRequest = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/verify-email", "/auth/resend-verification"].some((path) => url.includes(path))

  if (error.response?.status !== 401 || !config || config.refreshRetried || isAuthRequest) {
    return Promise.reject(error)
  }

  config.refreshRetried = true
  try {
    await apiClient.post("/auth/refresh")
    return await apiClient.request(config)
  } catch {
    return Promise.reject(error)
  }
})

export async function apiRequest<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>({ ...config, url })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { error?: string; message?: string } | undefined
      const message = data?.error || data?.message
      throw new Error(message || error.message || "The task request failed.")
    }
    throw error
  }
}
