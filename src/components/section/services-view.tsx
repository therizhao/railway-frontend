import { useMemo, useRef, useState } from 'react'
import { PROJECT_ID } from "@/config"
import { useCreateServiceMutation, useGetServicesQuery } from "@/graphql/generated/graphql"
import { Code } from "lucide-react"
import { ServiceFlow } from "@/components/ui/service-flow"
import { toast } from 'sonner'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import { DeploymentTable } from './deployment-table'


export function ServicesView() {
    const { data, loading, refetch } = useGetServicesQuery({
        variables: {
            projectId: PROJECT_ID
        }
    })
    const [createService] =
        useCreateServiceMutation(
            {
                onError: (e) => {
                    toast.dismiss(toastIdRef.current)
                    toast.error(e.message)
                },
                onCompleted: () => {
                    toast.dismiss(toastIdRef.current)
                    toast.success("Deployment done")
                    refetch()
                },
            }
        )
    const toastIdRef = useRef<string | number>(0)
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

    const services = data?.project.services.edges.map((e) => e.node) ?? []
    const serviceById = useMemo(
        () => Object.fromEntries(services.map((s) => [s.id, s])),
        [services],
    )
    const selectedService = selectedServiceId ? serviceById[selectedServiceId] : null

    return (
        <>
            {loading && <Skeleton className="w-full h-[80vh] border border-gray-200 rounded-lg" />}
            {data &&
                <ServiceFlow
                    onServiceClick={(id) => setSelectedServiceId(id)}
                    onAdd={() => {
                        createService({ variables: { input: { projectId: PROJECT_ID } } })
                        toastIdRef.current = toast.loading("Creating empty service…")
                    }}
                    data={data.project.services.edges.map(edge => edge.node)}
                />}
            <Sheet
                open={Boolean(selectedServiceId)}
                /* when closed (Esc / overlay click / X-button) → clear selection */
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedServiceId(null)
                    }
                }}
            >
                <SheetContent
                    wide
                    side="right"
                >
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            {selectedService?.icon ? (
                                <img
                                    src={selectedService.icon}
                                    alt=""
                                    className="h-6 w-6 object-contain"
                                />
                            ) : <Code className="h-6 w-6 text-gray-400" />}
                            {selectedService?.name}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col px-4">

                        {selectedServiceId &&

                            <div>
                                <h2 className="text-sm mb-4 font-semibold">Deployments</h2>
                                <DeploymentTable serviceId={selectedServiceId} hideServiceColumn />
                            </div>}
                    </div>
                    <SheetClose />
                </SheetContent>
            </Sheet>
        </>
    )
}

