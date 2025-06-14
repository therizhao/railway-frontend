import { GetServicesQuery } from "@/graphql/generated/graphql";

export type Service = GetServicesQuery['project']['services']['edges'][number]['node']