import nextConfig from 'eslint-config-next'

const customRules = {
  '@typescript-eslint/ban-ts-comment': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: false,
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^(_|ignore)',
    },
  ],
}

const tsConfig = nextConfig.find((c) => c.name === 'next/typescript')
if (tsConfig) {
  tsConfig.rules = { ...tsConfig.rules, ...customRules }
}

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/', '**/payload-types.ts', '**/payload-generated-schema.ts', '**/importMap.js'],
  },
]

export default eslintConfig
