import { useMemo, useRef, useState } from 'react'
import { PROJECT_ID } from "@/config"
import { useCreateServiceMutation, useDeleteServiceMutation, useGetServicesQuery } from "@/graphql/generated/graphql"
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
                            <TabsContent value="deployments" className="mt-4">
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

