import { gql } from "@apollo/client";

export const SERVICE_FIELDS = gql`
  fragment ServiceFields on Service {
    name
    icon
    id

    deployments(first: 1) {
      edges {
        node {
          status
          staticUrl
        }
      }
    }
  }
`;
