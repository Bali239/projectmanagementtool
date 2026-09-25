import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import { getFirebaseAuth } from "@/lib/firebase/client"

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use(async (config) => {
  const user = getFirebaseAuth().currentUser
  if (!user) throw new Error("You must be signed in to manage tasks.")

  config.headers.Authorization = `Bearer ${await user.getIdToken()}`
  return config
})

export async function apiRequest<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>({ ...config, url })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message || "The task request failed.")
    }
    throw error
  }
}
