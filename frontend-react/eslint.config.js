import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // 设计系统检查规则
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{3,8}$/]",
          message: "禁止使用硬编码颜色值，请使用设计令牌或Tailwind颜色类",
        },
        {
          selector: "TemplateElement[value.raw=/p-\[[^\]]+\]/]",
          message: "禁止使用任意间距值，请使用标准间距类 (p-1, p-2, p-4等)",
        },
        {
          selector: "TemplateElement[value.raw=/m-\[[^\]]+\]/]",
          message: "禁止使用任意间距值，请使用标准间距类 (m-1, m-2, m-4等)",
        },
        {
          selector: "TemplateElement[value.raw=/text-\[[^\]]+\]/]",
          message: "禁止使用任意颜色值，请使用标准颜色类",
        },
        {
          selector: "TemplateElement[value.raw=/bg-\[[^\]]+\]/]",
          message: "禁止使用任意颜色值，请使用标准颜色类",
        },
      ],
    },
  },
]