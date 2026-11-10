import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi/openapi.json',
  output: {
    format: null,
    lint: null,
    path: './src/api/generated',
  },
  plugins: [
    '@hey-api/client-fetch',
    { name: '@hey-api/typescript', enums: 'javascript' },
    '@hey-api/sdk',
    '@tanstack/react-query',
  ],
});
