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
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes('@aws-amplify')) {
						return 'amplify';
					}
				},
			},
		},
	},
	test: {
		environment: 'happy-dom',
		testTimeout: 10000,
		setupFiles: ['./vitest-setup.ts'],
		reporters: process.env.CI ? ['default', 'junit'] : 'default',
		outputFile: process.env.CI ? 'reports/test-output.xml' : undefined,
		globals: false,
	},
});
