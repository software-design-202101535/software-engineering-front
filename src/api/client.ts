import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

let accessToken: string | null = localStorage.getItem('accessToken')

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

export const getAccessToken = () => accessToken

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

async function handleTokenRefresh(originalRequest: InternalAxiosRequestConfig) {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/refresh`,
    null,
    { withCredentials: true },
  )
  setAccessToken(data.accessToken)
  originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
  return client(originalRequest)
}

function handleAuthFailure() {
  setAccessToken(null)
  localStorage.removeItem('user')
  window.location.href = '/login'
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        return await handleTokenRefresh(originalRequest)
      } catch {
        handleAuthFailure()
      }
    }
    return Promise.reject(error)
  },
)
