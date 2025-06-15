import { BACKEND_URL } from "@/config";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${BACKEND_URL}/gql`,
    credentials: "include"
  }),
  cache: new InMemoryCache(),
});

