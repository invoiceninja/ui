import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import eslint from '@eslint/js';

export default tseslint.config({
  files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-loss-of-precision': "off",
    'no-use-before-define': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'unused-imports/no-unused-imports': 'error',
    'no-loss-of-precision': 'off',
    'no-constant-binary-expression': 'off',
  },
  plugins: {
    'unused-imports': unusedImports,
    react,
  },
});

// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {
//     files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
//     plugins: {
//       'unused-imports': unusedImports,
//     },
//     rules: {
//       'unused-imports/no-unused-imports': 'error',
//       'no-use-before-define': 'off',
//       '@typescript-eslint/no-use-before-define': 'off',
//       '@typescript-eslint/no-empty-function': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//       'no-loss-of-precision': 'off',
//       '@typescript-eslint/no-loss-of-precision': ['off'],
//       '@typescript-eslint/no-non-null-assertion': 'off',
//     },
//   },
//   { languageOptions: { globals: globals.browser } },
//   pluginJs.configs.recommended,
//   {

//   },
//   {
//     ...pluginReact.configs.flat.recommended,
//     settings: {
//       react: {
//         version: 'detect',
//       },
//     },
//     rules: {
//       'react/display-name': 'off',
//       'react/prop-types': 'off',
//       'react/react-in-jsx-scope': 'off',
//     },
//   },
// ];
