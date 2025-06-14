import { gql } from "@apollo/client"
import { SERVICE_FIELDS } from "../fragments/service"

export const CREATE_SERVICE = gql`
  ${SERVICE_FIELDS}

  mutation CreateService($input: ServiceCreateInput!) {
    serviceCreate(input: $input) {
        ...ServiceFields
    }
  }`