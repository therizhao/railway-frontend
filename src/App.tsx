import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

import { DeploymentTable } from "@/components/section/deployment-table"
import { ServicesView } from "@/components/section/services-view"
import { useGetProjectQuery } from "@/graphql/generated/graphql"
import { PROJECT_ID } from "@/config"
import { Skeleton } from "@/components/ui/skeleton"

export default function App() {
  const { data, loading } = useGetProjectQuery({ variables: { id: PROJECT_ID } })
  const [tab, setTab] = useState<"deployments" | "services">("services")

  return (
    <div className="py-8 px-16 flex flex-col gap-4">
      <h1 className="text-lg font-mono">
        {loading ? <Skeleton className="h-8 w-10" /> : data?.project.name}
      </h1>
      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments">
          <DeploymentTable showServiceFilter />
        </TabsContent>

        <TabsContent value="services">
          <ServicesView />
        </TabsContent>
      </Tabs>

      {/* ── Global toaster ──────────────────────────────────────────────── */}
      <Toaster position="top-center" richColors />
    </div>
  )
}
