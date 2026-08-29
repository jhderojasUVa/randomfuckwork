module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],
  overrides: [],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    indent: ['error', 2],
    'no-multi-spaces': ['error'],
    'eol-last': ['error', 'always'],
    'no-unused-expressions': 'warn',
    'no-sequences': 'off',
    'no-return-assign': 'off',
    'no-fallthrough': 'warn',
    'no-void': 'off',
    'react/react-in-jsx-scope': 'off',
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-empty-object-type': ['off'],
  },
};
