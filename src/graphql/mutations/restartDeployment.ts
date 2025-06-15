import { gql } from "@apollo/client";

export const RESTART_DEPLOYMENT = gql`
  mutation RestartDeployment($id: String!) {
    deploymentRestart(id: $id)
  }`;