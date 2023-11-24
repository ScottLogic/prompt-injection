/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@src': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'happy-dom',
		testTimeout: 10000,
		setupFiles: ['./vitest-setup.ts'],
		reporters: process.env.CI ? ['default', 'junit'] : undefined,
		outputFile: process.env.CI ? 'reports/test-output.xml' : undefined,
	},
});
