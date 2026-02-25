import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  // Ignora archivos
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  // Configuración base JavaScript
  js.configs.recommended,

  // Configuración para archivos .js y .ts
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Convenciones del proyecto según CLAUDE.md
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2],

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Configuración para archivos .vue
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        parser: typescriptParser,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
    },
    rules: {
      // Vue específico
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, { baseIndent: 0 }],

      // Convenciones del proyecto
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: 'off', // Desactivar para archivos .vue (usa vue/html-indent)
    },
  },

  // Prettier debe ser el último para sobrescribir reglas de formato
  prettier,
]
