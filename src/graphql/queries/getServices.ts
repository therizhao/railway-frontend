import { gql } from '@apollo/client';
import { SERVICE_FIELDS } from '../fragments/service';

export const GET_SERVICES = gql`
  ${SERVICE_FIELDS}

  query GetServices($projectId: String!) {
    project(id: $projectId) {
        services {
            edges {
                node {
                    ...ServiceFields
                }
            }
        }
    }
  }
`;
