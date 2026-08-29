module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'standard'],
  overrides: [],
  plugins: ['react'],
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
  },
};
