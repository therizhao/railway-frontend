import { gql } from '@apollo/client';
import { DEPLOYMENT_FIELDS } from '../fragments/deployment';

export const GET_DEPLOYMENTS = gql`
  ${DEPLOYMENT_FIELDS}

  query GetDeployments($input: DeploymentListInput!) {
    deployments(input: $input) {
      edges {
        node {
          ...DeploymentFields
        }
      }
    }
  }
`;
