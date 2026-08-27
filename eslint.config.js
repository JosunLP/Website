import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'content/blog/index.json',
		],
	},
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		// Tests query rendered DOM whose presence they assert first.
		files: ['tests/**/*.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
	prettier,
);
