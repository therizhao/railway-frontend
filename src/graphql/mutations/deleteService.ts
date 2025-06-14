import { gql } from "@apollo/client"

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: String!) {
    serviceDelete(id: $id)
  }`