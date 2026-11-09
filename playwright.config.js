import { defineConfig, devices } from "@playwright/test";

const emulatorClientEnv = {
  VITE_USE_FIREBASE_EMULATORS: "true",
  VITE_FIREBASE_API_KEY: "demo-key",
  VITE_FIREBASE_AUTH_DOMAIN: "demo-manuela.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "demo-manuela",
  VITE_FIREBASE_STORAGE_BUCKET: "demo-manuela.appspot.com",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  VITE_FIREBASE_APP_ID: "1:1234567890:web:demo",
  VITE_SIMULATION_API_URL: "http://127.0.0.1:8000",
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    locale: "es-CO",
    trace: "on-first-retry",
    acceptDownloads: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        ...emulatorClientEnv,
      },
    },
    {
      command:
        "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000",
      url: "http://127.0.0.1:8000/api/health",
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...process.env,
        FIREBASE_PROJECT_ID: "demo-manuela",
        FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      },
    },
  ],
});
