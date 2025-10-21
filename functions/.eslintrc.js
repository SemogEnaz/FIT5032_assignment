module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    'linebreak-style': 'off',
    'object-curly-spacing': 'off',
    'quotes': 'off',
    'max-len': 'off',
    'no-multi-spaces': 'off',
    'comma-dangle': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'off',
    'valid-jsdoc': 'off',
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
