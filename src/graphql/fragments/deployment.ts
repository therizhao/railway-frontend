import { gql } from "@apollo/client";

export const DEPLOYMENT_FIELDS = gql`
  fragment DeploymentFields on Deployment {
    id
    status
    createdAt
    updatedAt
    statusUpdatedAt

    projectId
    serviceId
    environmentId

    url
    staticUrl

    canRollback
    canRedeploy
    suggestAddServiceDomain
    deploymentStopped

    environment {
      name
    }

    service {
      id
      name
    }

    creator {
      id
      name
      avatar
    }
  }
`;
