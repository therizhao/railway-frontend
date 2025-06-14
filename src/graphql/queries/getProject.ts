import { gql } from "@apollo/client"

export const GET_PROJECT = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
    }
  }
`
