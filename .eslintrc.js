module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    node: true
  },
  rules: {
    'linebreak-style': 0, // <----------
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],
    'comma-dangle': ['error', 'never'],
    'one-var': ['error', 'consecutive'],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'arrow-parens': ['error', 'as-needed'],
    'max-len': ['error', { code: 125 }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }]
  }
};
