module.exports = {
  root: true, // This will make sure ESLint stops looking in parent folders once it finds this config file.
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'max-len': ['error', { 'code': 120 }], // Or whatever max length you're comfortable with
  },
};
