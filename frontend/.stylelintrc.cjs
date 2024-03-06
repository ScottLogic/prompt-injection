module.exports = {
	extends: ['stylelint-config-standard', 'stylelint-config-hudochenkov/order'],
	ignoreFiles: ['node_modules/**/*', 'dist/**/*'],
	rules: {
		'selector-class-pattern': null,
	},
};
