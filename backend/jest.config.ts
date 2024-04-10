import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
	moduleNameMapper: {
		'^@src/(.*)': '<rootDir>/src/$1',
		importMetaUtils$: '<rootDir>/test/importMetaUtils.mock.ts',
	},
	modulePathIgnorePatterns: ['build', 'coverage', 'node_modules'],
	testEnvironment: 'node',
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: './test/tsconfig.json',
				useESM: true,
			},
		],
	},
	silent: true,
	setupFiles: ['./test/setupEnvVars.ts'],
};

export default jestConfig;
