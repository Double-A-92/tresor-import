module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true,
  },
  extends: ['eslint:recommended', 'plugin:vue/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    Vue: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['vue', 'jest', 'es'],
  rules: {
    'es/no-regexp-lookbehind-assertions': 'error',
    'es/no-regexp-named-capture-groups': 'error',
    'es/no-regexp-s-flag': 'error',
    'es/no-regexp-unicode-property-escapes': 'error',
  },
};
