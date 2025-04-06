module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/prettier',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
    'plugin:vue/base',
    'plugin:vuetify/base'
  ],
  plugins: ['vuetify'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    curly: ['error', 'all'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'no-console': ['warn'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn'],
    'prettier/prettier': 'warn',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'no-underscore-dangle': 0,
    'class-methods-use-this': ['off'],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false
      }
    ],
    'arrow-parens': [
      // 'off',
      // There are too much erros caused by
      //   functions with single argument and arrow-parens
      'error',
      'always',
      {
        requireForBlockBody: false
      }
    ]
  }
}
