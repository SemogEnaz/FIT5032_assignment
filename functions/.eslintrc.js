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
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    'linebreak-style': 'off',
    'object-curly-spacing': 'off',
    'quotes': 'off',
    'max-len': 'off',
    'no-multi-spaces': 'off',
    'comma-dangle': 'off',
    'valid-jsdoc': 'off',
    'arrow-parens': 'off',
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
