/* eslint-env node */
module.exports = {
	root: true,
	settings: {
		'import/resolver': {
			alias: {
				map: [['@src', './src']],
				extensions: ['.ts', '.js', '.jsx', '.tsx', '.json', '.css'],
			},
		},
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json', './test/tsconfig.json'],
	},
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['build', 'coverage', 'node_modules'],
	rules: {
		eqeqeq: 'error',
		'func-style': ['error', 'declaration'],
		'object-shorthand': 'error',
		'no-restricted-imports': [
			'error',
			{
				patterns: ['../*'],
			},
		],
		'prefer-template': 'error',

		'@typescript-eslint/init-declarations': 'error',
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
		'import/order': [
			'error',
			{
				alphabetize: { order: 'asc' },
				'newlines-between': 'always',
				warnOnUnassignedImports: true,
				pathGroups: [
					{
						pattern: '@src/**',
						group: 'parent',
						position: 'after',
					},
				],
				groups: [
					'builtin',
					'external',
					'internal',
					'sibling',
					'parent',
					'index',
					'object',
					'type',
				],
			},
		],
		'no-mixed-spaces-and-tabs': 0, // disable rule
	},
};
