import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    './src/generated/resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: { DateTime: 'string' },
        mappers: { NewsItem: '@fa/contracts#NewsItem as NewsItemModel' },
      },
    },
  },
};

export default config;
