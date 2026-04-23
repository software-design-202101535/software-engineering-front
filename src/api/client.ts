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

const PUBLIC_PATHS = ['/api/auth/login/school', '/api/auth/login/email', '/api/auth/refresh']

client.interceptors.request.use((config) => {
  if (accessToken && !PUBLIC_PATHS.some(p => config.url?.startsWith(p))) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

async function handleTokenRefresh(originalRequest: InternalAxiosRequestConfig) {
  setAccessToken(null)
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
    const isPublic = PUBLIC_PATHS.some(p => originalRequest.url?.startsWith(p))
    if (error.response?.status === 401 && !originalRequest._retry && !isPublic) {
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
