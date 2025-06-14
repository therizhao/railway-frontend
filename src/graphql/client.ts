import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://express-service-production.up.railway.app/gql",
  }),
  cache: new InMemoryCache(),
});

