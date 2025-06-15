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
import { RailwayLogo } from "@/components/ui/logo"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default function App() {
  const { data, loading } = useGetProjectQuery({ variables: { id: PROJECT_ID } })
  const { logout } = useAuth();
  const [tab, setTab] = useState<"deployments" | "services">("services")

  return (
    <div className="py-8 px-16 flex flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-2 flex items-center justify-between">
        {/* Left ‑ project name */}
        <div className="flex items-center gap-3">
          <RailwayLogo />
          <span className="text-gray-400">/</span>
          <h1 className="font-mono text-lg">
            {loading ? <Skeleton className="h-8 w-10" /> : data?.project.name}
          </h1>
        </div>

        {/* Right ‑ logout */}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
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
