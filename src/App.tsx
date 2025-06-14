import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGetDeploymentsQuery } from "@/graphql/generated/graphql";
import { useQuery } from "@apollo/client";

const PROJECT_ID = 'e0818fff-92ff-4d0c-bbd9-8df3848883ba'

function App() {
  const { data, loading, error } = useGetDeploymentsQuery({
    variables: {
      projectId: PROJECT_ID
    }
  })

  return (
    <>
      <Button>start</Button>
      <Button>end</Button>
    </>
  )
}

export default App
