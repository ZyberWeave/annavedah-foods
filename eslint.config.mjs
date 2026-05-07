import next from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'scripts/**'],
  },
  ...next,
  {
    rules: {
      // Project-specific allowances
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',

      // Pre-existing tech debt — flagged as warnings so they're visible but
      // don't fail CI. Tighten to 'error' once the codebase is cleaned up.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
