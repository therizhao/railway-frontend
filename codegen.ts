import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://express-service-production.up.railway.app/gql', // remote endpoint
  documents: ['src/**/*.{ts,tsx,js,jsx}'],                          // where your .gql / gql`` live
  overwrite: true,
  generates: {
    // 1) Single output file with EVERYTHING
    'src/graphql/generated/graphql.tsx': {
      plugins: [
        'typescript',                // basic types
        'typescript-operations',     // types for each query / mutation / fragment
        'typescript-react-apollo'    // ready-to-use hooks (useGetUsersQuery, etc.)
      ],
      config: {
        withHooks: true,             // create useXyzQuery/useXyzMutation
        withHOC: false,
        withComponent: false,
      },
    },

    // 2) (Optional) Persisted introspection JSON for IDEs & linting
    './schema.graphql.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
