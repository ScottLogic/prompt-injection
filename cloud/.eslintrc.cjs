/* eslint-env node */
module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint'],
	root: true,
	ignorePatterns: ['node_modules', 'cdk*.out'],
	rules: {
		eqeqeq: 'error',
		'func-style': ['error', 'expression', { allowArrowFunctions: true }],
		'object-shorthand': ['error', 'always', { avoidExplicitReturnArrows: true }],
		'prefer-template': 'error',
		'import/order': [
			'error',
			{
				alphabetize: { order: 'asc' },
				'newlines-between': 'always',
				warnOnUnassignedImports: true,
				groups: [
					['builtin', 'external'],
					['internal', 'parent', 'index', 'sibling'],
					['object', 'type'],
				],
			},
		],
		'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
		'@typescript-eslint/init-declarations': 'error',
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/restrict-template-expressions': [
			'error',
			{
				allowNumber: true,
				allowBoolean: true,
			},
		],
		'@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
	},
};
