module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  rules: {
    'arrow-parens': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
  },
  globals: {
    document: 1,
    localStorage: 1,
  },
};
