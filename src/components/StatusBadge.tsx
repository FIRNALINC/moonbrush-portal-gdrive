export function StatusBadge({ status }: { status: "SUBMITTED"|"IN_PROGRESS"|"DELAYED"|"COMPLETE" }) {
  const color = { SUBMITTED: "bg-blue-600", IN_PROGRESS: "bg-amber-500", DELAYED: "bg-red-600", COMPLETE: "bg-green-600" }[status]
  return <span className={`px-2 py-1 rounded-md text-xs ${color}`}>{status.replace("_", " ")}</span>
}
