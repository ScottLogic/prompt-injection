/* eslint-env node */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:import/recommended',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['node_modules'],
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
		'import/no-unresolved': [ 
			'error',
			{
				ignore: ['k6/*']
			}
		],
		'import/order': [
			'error',
			{
				alphabetize: { order: 'asc' },
				'newlines-between': 'always',
				warnOnUnassignedImports: true,
				pathGroups: [
					{
						pattern: '@src/**',
						group: 'internal',
						position: 'before',
					},
				],
				groups: [
					['builtin', 'external'],
					['internal', 'parent', 'index', 'sibling'],
					['object', 'type'],
				],
			},
		],
		'no-mixed-spaces-and-tabs': 0, // disable rule
	},
};
