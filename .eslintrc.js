module.exports = {
  env: {
    browser: true,
    'jest/globals': true
  },
  globals: {
    SELECTED_OBJECTS: true,
    setup: false
  },
  rules: {
    'consistent-return': 0,
    'guard-for-in': 0,
    'no-alert': 0,
    'no-bitwise': 0,
    'no-console': 0,
    //'no-restricted-globals': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-proto': 0,
    'no-restricted-syntax': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'one-var': 0,
    'prefer-template': 0,
    'prefer-destructuring': 0
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['jest']
};
