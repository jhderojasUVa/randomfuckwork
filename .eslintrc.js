module.exports = {
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended', 'standard'],
  overrides: [],
  plugins: ['react'],
  rules: {
    quotes: ['error', 'single'],
    // we want to force semicolons
    semi: ['error', 'always'],
    // we use 2 spaces to indent our code
    indent: ['error', 2],
    // we want to avoid extraneous spaces
    'no-multi-spaces': ['error'],
    // new line at the end always
    'eol-last': ['error', 'always'],
    // no un used expresions (WARNING possible memory leak)
    'no-unused-expressions': 'warn',
    // comma operator
    'no-sequences': 'off',
    // no return needed
    'no-return-assign': 'off',
    // no break on case (WARNING)
    'no-fallthrough': 'warn',
    // no void
    'no-void': 'off'
  }
};
