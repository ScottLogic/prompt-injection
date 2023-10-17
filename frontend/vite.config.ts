/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    testTimeout: 10000,
    setupFiles: ["./vitest-setup.ts"],
    reporters: process.env.CI ? ["default", "junit"] : undefined,
    outputFile: process.env.CI ? "reports/test-output.xml" : undefined,
  },
});
