module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	settings: {
		react: {
			version: 'detect',
		},
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
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:jest-dom/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	plugins: ['react-refresh', 'jsx-a11y', 'jest-dom'],
	rules: {
		eqeqeq: 'error',
		'func-style': ['error', 'declaration'],
		'object-shorthand': 'error',
		'prefer-template': 'error',
		'no-restricted-imports': [
			'error',
			{
				patterns: ['../*'],
			},
		],

		// turn this off to allow the use of useEffect on mount
		'react-hooks/exhaustive-deps': 'off',
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
		'import/order': [
			'error',
			{
				alphabetize: { order: 'asc' },
				'newlines-between': 'always',
				warnOnUnassignedImports: true,
				pathGroups: [
					{
						pattern: '{.,..}/*.css',
						group: 'type',
						position: 'after',
					},
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
		'jsx-a11y/label-has-associated-control': [
			'error',
			{
				controlComponents: ['ThemedTextArea'],
				depth: 2,
			},
		],
		'no-mixed-spaces-and-tabs': 0, // disable rule
		'@typescript-eslint/consistent-type-definitions': 0, // disable rule. Eventually use below rule to enforce type over interface
		// '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
		'@typescript-eslint/restrict-template-expressions': [
			'error',
			{
				allowNumber: true,
				allowBoolean: true,
			},
		],
	},
	overrides: [
		{
			files: ['*.test.ts{,x}'],
			rules: {
				'@typescript-eslint/no-empty-function': 'off',
			},
		},
	],
};
