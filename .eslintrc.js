module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
  ignorePatterns: ['node_modules', 'dist', '*.js', '**/*.d.ts', '**/dist/**'],
  overrides: [
    {
      files: ['packages/frontend/**/*.{ts,tsx}'],
      extends: ['next'],
      settings: {
        next: {
          rootDir: 'packages/frontend',
        },
      },
    },
  ],
};
