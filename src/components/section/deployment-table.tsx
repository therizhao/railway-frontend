import { useCallback, useRef, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { toast } from 'sonner'
import {
    format,
    differenceInDays,
    formatDistanceToNowStrict
} from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import {
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { DeploymentStatus, GetDeploymentsQuery, useGetDeploymentsQuery, useRedeployDeploymentMutation, useRestartDeploymentMutation, useStopDeploymentMutation } from "@/graphql/generated/graphql";
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip"
import { DataTable } from '@/components/ui/data-table';
import { PROJECT_ID } from "@/config";

// Special value for service filter show all services
const SERVICE_FILTER_ALL = 'all';

type Node = GetDeploymentsQuery['deployments']['edges'][number]['node'];

const COLUMNS: ColumnDef<Node>[] = [
    {
        accessorKey: "id",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-2 py-2">
                <span className="inline-block max-w-[20ch] truncate font-mono text-xs ">{row.original.id}</span>
                <span className="inline-block text-gray-500 text-xs ">{row.original.environment.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        cell: ({ row }) => <Badge variant={(() => {
            switch (row.original.status) {
                case DeploymentStatus.Success:
                    return 'green'
                case DeploymentStatus.Failed:
                case DeploymentStatus.Crashed:
                    return 'red'
                case DeploymentStatus.Removed:
                    return 'gray'
                default:
                    return 'yellow'
            }
        })()}>
            <span className="capitalize">{row.original.status.toLowerCase()}</span>
        </Badge>,
    },
    {
        id: "service",
        accessorFn: (row) => row.service.name,
        cell: ({ row }) => <Badge>{row.original.service.name}</Badge>,
    },
    {
        accessorKey: "createdAt",
        // ───────────────────────────────────────────────────────────────────
        //  Cell:  8/25/23   (M/D/YY)
        //         tooltip → 1 year, 4 months, 20 days ago
        //                   UTC January 24 2024 01:33:45
        //                   GMT+3 January 24 2024 04:33:45
        // ───────────────────────────────────────────────────────────────────
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt)

            /* short format M/D/YY ------------------------------------------------ */
            const short = format(date, "M/d/yy")

            /* relative distance  ------------------------------------------------- */
            const daysAgo = formatDistanceToNowStrict(date, { addSuffix: true, roundingMethod: "floor" })

            /* absolute times ----------------------------------------------------- */
            const utcTime = formatInTimeZone(
                date,
                "UTC",
                "MMMM dd yyyy HH:mm:ss",
            )
            const localTime = format(date, "MMMM dd yyyy HH:mm:ss")
            const localTimezone = format(new Date(), "O")
            const isYoungerThanADay = differenceInDays(new Date(), date) < 1



            return (
                <TooltipProvider>
                    <Tooltip >
                        <TooltipTrigger asChild>
                            <div className="cursor-default first-letter:uppercase">{isYoungerThanADay ? daysAgo : short}</div>
                        </TooltipTrigger>

                        <TooltipContent className="flex flex-col gap-1 py-4">
                            <div className="first-letter:uppercase mb-2">{daysAgo}</div>
                            <div className="mt-1"><span className="font-mono mr-1">UTC</span> {utcTime}</div>
                            <div className="mt-1"><span className="font-mono mr-1">{localTimezone}</span> {localTime}</div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
]

type Props = {
    // Optional service Id. If provided we will filter output by service ID.
    serviceId?: string
    showServiceFilter?: boolean
    hideServiceColumn?: boolean
}

export function DeploymentTable({
    serviceId,
    showServiceFilter = false,
    hideServiceColumn = false
}: Props) {
    const toastIdRef = useRef<string | number>(0)
    const { data, loading, refetch } = useGetDeploymentsQuery({
        variables: {
            input: {
                projectId: PROJECT_ID,
                serviceId
            }
        }
    })

    const [restartDeployment] =
        useRestartDeploymentMutation(
            {
                onError: (e) => {
                    toast.dismiss(toastIdRef.current)
                    toast.error(e.message)
                },
                onCompleted: () => {
                    toast.dismiss(toastIdRef.current)
                    toast.success("Deployment restarted")
                    refetch()
                },
            }
        )

    const [redeployDeployment] =
        useRedeployDeploymentMutation(
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

    const [stopDeployment] =
        useStopDeploymentMutation(
            {
                onError: (e) => {
                    toast.dismiss(toastIdRef.current)
                    toast.error(e.message)
                },
                onCompleted: () => {
                    toast.dismiss(toastIdRef.current)
                    toast.success("Deployment stopped")
                    refetch()
                },
            }
        )

    const [serviceFilter, setServiceFilter] = useState<string>(SERVICE_FILTER_ALL)

    const nodes = data?.deployments.edges.map(edge => edge.node) ?? []

    /* unique list of service names for the dropdown */
    const serviceNames = useMemo(
        () => [...new Set(nodes.map((n) => n.service.name))],
        [nodes],
    )

    /* apply filter to the dataset */
    const filteredNodes = useMemo(
        () =>
            serviceFilter !== SERVICE_FILTER_ALL
                ? nodes.filter((n) => n.service.name === serviceFilter)
                : nodes,
        [nodes, serviceFilter],
    )

    const renderedColumns = useMemo(() => {
        if (hideServiceColumn) {
            return COLUMNS.filter(column => column.id !== 'service')
        }

        return COLUMNS
    }, [hideServiceColumn])

    const renderActions = useCallback(
        (row: Node) => (
            <>
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => {
                            if (row.staticUrl) {
                                window.open(row.staticUrl, "_blank", "noopener,noreferrer")
                            }
                        }}
                    >
                        View Deployment
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => {
                            restartDeployment({ variables: { id: row.id } })
                            toastIdRef.current = toast.loading("Restarting deployment…")
                        }}
                    >
                        Restart
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            redeployDeployment({ variables: { id: row.id } })
                            toastIdRef.current = toast.loading("Redeploying…")
                        }}
                    >
                        Redeploy
                    </DropdownMenuItem>

                    {!row.deploymentStopped &&
                        <DropdownMenuItem
                            onClick={() => {
                                stopDeployment({ variables: { id: row.id } })
                                toastIdRef.current = toast.loading("Stopping deployment…")
                            }}
                        >
                            Stop
                        </DropdownMenuItem>}
                </DropdownMenuGroup>
            </>
        ),
        [restartDeployment],
    )

    return (
        <>
            {showServiceFilter &&
                <div className="mb-4 flex items-center gap-4">
                    <Select
                        value={serviceFilter}
                        onValueChange={(v) => setServiceFilter(v)}
                    >
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Filter by service" />
                        </SelectTrigger>

                        <SelectContent>
                            {/* “All” option */}
                            <SelectItem key="__all" value={SERVICE_FILTER_ALL}>
                                All Services
                            </SelectItem>

                            {/* dynamic list of services */}
                            {serviceNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>}
            <DataTable<Node>
                loading={loading}
                data={filteredNodes}
                hideHeader
                emptyText="No deployments"
                columns={renderedColumns}
                renderActions={renderActions}
            />
        </>
    )
}

