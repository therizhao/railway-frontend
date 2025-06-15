import { gql } from "@apollo/client";

export const REDEPLOY_DEPLOYMENT = gql`
  mutation RedeployDeployment($id: String!) {
    deploymentRedeploy(id: $id) {
      id
    }
  }
`;