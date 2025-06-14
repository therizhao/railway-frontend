import { gql } from "@apollo/client"

export const STOP_DEPLOYMENT = gql`
  mutation StopDeployment($id: String!) {
    deploymentStop(id: $id)
  }
`