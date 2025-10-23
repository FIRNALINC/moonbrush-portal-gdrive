export default function Pill({ label, onRemove }: { label: string; onRemove?: ()=>void }) {
  return (
    <span className="pill">
      <span>{label}</span>
      {onRemove && <button aria-label="remove" onClick={onRemove}>×</button>}
    </span>
  )
}
