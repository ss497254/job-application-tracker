/** @type {import('eslint').Linter.Config} */
module.exports = {
	env: {
		browser: true,
	},
	extends: ["next", "next/core-web-vitals"],
	parserOptions: {
		babelOptions: {
			presets: [require.resolve("next/babel")],
		},
	},
	rules: {
		"import/no-anonymous-default-export": [
			"error",
			{
				allowObject: true,
			},
		],
	},
	settings: {
		next: {
			rootDir: "./web",
		},
		"import/resolver": {
			alias: {
				map: [["@", "./web"]],
			},
		},
	},
};
