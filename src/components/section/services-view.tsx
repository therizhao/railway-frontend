import { useMemo, useRef, useState } from 'react'
import { PROJECT_ID } from "@/config"
import { useCreateServiceMutation, useDeleteServiceMutation, useGetServicesQuery, DeploymentStatus } from "@/graphql/generated/graphql"
import { Code, Globe } from "lucide-react"
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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'


export function ServicesView() {
    const toastIdRef = useRef<string | number>(0)
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
    const [deleteService] =
        useDeleteServiceMutation(
            {
                onError: (e) => {
                    toast.dismiss(toastIdRef.current)
                    toast.error(e.message)
                },
                onCompleted: () => {
                    toast.dismiss(toastIdRef.current)
                    toast.success("Service deleted")
                    refetch()
                },
            }
        )
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
                    /* -------------------------------------------------------------------
                        React will reuse a component as long as its `key` stays the same.
                        `ServiceFlow` keeps its own internal node state that is ONLY
                        initialised on mount (via useNodesState). If the list of services
                        changes after a refetch, the component would otherwise keep showing
                        the stale nodes.
                    
                        By concatenating every service id we get a fingerprint of the
                        current list. Whenever a service is added / removed / renamed,
                        the string changes → the key changes → React unmounts the old
                        instance and mounts a fresh one with the updated node data.
                    ------------------------------------------------------------------- */
                    key={services.map((s) => s.id).join("-")}
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
                {selectedService &&
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
                        {/* ------------------------- Tabs ---------------------------- */}
                        <Tabs defaultValue="deployments" className="px-4">
                            <TabsList>
                                <TabsTrigger value="deployments">Deployments</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            {/* Deployments tab */}
                            <TabsContent value="deployments" className="mt-2 flex flex-col">
                                {(() => {
                                    const deployment = selectedService.deployments.edges[0].node;
                                    if (!deployment) {
                                        return null
                                    }

                                    const url = deployment.staticUrl ?? ''
                                    const display = url.replace(/^https?:\/\//, "")
                                    const globeColor =
                                        deployment.status === DeploymentStatus.Success
                                            ? "text-emerald-600"   // nice pastel-green
                                            : "text-gray-400"


                                    {/* link ---------------------------------------------------------------- */ }
                                    return <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        /* Tailwind: blue link, underline, ellipsis when too long */
                                        className="flex items-center gap-2 text-gray-600 hover:text-black-800 pl-1 pb-4"
                                    >
                                        <Globe className={`h-4 w-4 shrink-0 top-[1px] ${globeColor}`} />
                                        <span>{display}</span>
                                    </a>

                                })()}
                                <DeploymentTable
                                    serviceId={selectedService.id}
                                    hideServiceColumn
                                />
                            </TabsContent>

                            {/* Settings tab */}
                            <TabsContent value="settings" className="mt-4 space-y-4 px-1">
                                <p className="font-semibold">Danger zone</p>
                                <AlertDialog>
                                    {/* trigger = red button */}
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete service</Button>
                                    </AlertDialogTrigger>

                                    {/* confirmation dialog */}
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. All deployments and data associated with
                                                <span className="font-semibold px-1">
                                                    {selectedService?.name ?? "(unknown)"}
                                                </span>
                                                will be permanently removed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                                            {/* confirm action */}
                                            <AlertDialogAction
                                                onClick={() => {
                                                    deleteService({ variables: { id: selectedService.id } })
                                                    toastIdRef.current = toast.loading(`Deleting ${selectedService.name}…`)
                                                }}
                                            >
                                                Confirm
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TabsContent>
                        </Tabs>

                        <SheetClose />
                    </SheetContent>}
            </Sheet>
        </>
    )
}

