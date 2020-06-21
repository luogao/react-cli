module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  globals: {
    name: 'off'
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true
    }]
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.ts', '.d.ts', '.tsx', '.js', '.jsx'],
        moduleDirectory: ['node_modules', 'src', './']
      }
    }
  }
}
