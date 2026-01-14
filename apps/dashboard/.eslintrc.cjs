module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Enforce architecture boundaries
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Shared folders (components, hooks, lib, types, utils) cannot import from features or app
          {
            target: './src/components',
            from: ['./src/features', './src/app'],
            message: 'Shared components cannot import from features or app',
          },
          {
            target: './src/hooks',
            from: ['./src/features', './src/app'],
            message: 'Shared hooks cannot import from features or app',
          },
          {
            target: './src/lib',
            from: ['./src/features', './src/app'],
            message: 'Lib cannot import from features or app',
          },
          {
            target: './src/types',
            from: ['./src/features', './src/app'],
            message: 'Shared types cannot import from features or app',
          },
          {
            target: './src/utils',
            from: ['./src/features', './src/app'],
            message: 'Utils cannot import from features or app',
          },
          // Features cannot import from app
          {
            target: './src/features',
            from: './src/app',
            message: 'Features cannot import from app layer',
          },
          // Features cannot cross-import from other features
          {
            target: './src/features/auth',
            from: ['./src/features/!(auth)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/dashboard',
            from: ['./src/features/!(dashboard)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/content',
            from: ['./src/features/!(content)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/distributions',
            from: ['./src/features/!(distributions)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/contacts',
            from: ['./src/features/!(contacts)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/prompts',
            from: ['./src/features/!(prompts)/**'],
            message: 'Features cannot import from other features',
          },
          {
            target: './src/features/analytics',
            from: ['./src/features/!(analytics)/**'],
            message: 'Features cannot import from other features',
          },
        ],
      },
    ],
  },
};
