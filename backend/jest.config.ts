import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
	moduleNameMapper: {
		'^@src/(.*)': '<rootDir>/src/$1',
		importMetaUtils$: '<rootDir>/test/importMetaUtils.mock.ts',
	},
	testEnvironment: 'node',
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/test/tsconfig.json',
				useESM: true,
			},
		],
	},
	silent: true,
	setupFiles: ['<rootDir>/test/setupEnvVars.ts'],
	reporters:
		process.env.CI === 'true'
			? ['default', ['jest-junit', { outputDirectory: 'reports' }]]
			: ['default'],
};

export default jestConfig;
