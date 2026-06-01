import { defineConfig, devices } from '@playwright/test'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // E2E는 모두 page.route 목킹이라 실서버가 필요 없다.
  // .env.e2e가 VITE_API_BASE_URL을 비워 모든 /api 요청이 preview 오리진(상대경로)으로 가
  // 브라우저 레벨에서 가로채진다.
  webServer: {
    command: `npm run dev -- --mode e2e --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
