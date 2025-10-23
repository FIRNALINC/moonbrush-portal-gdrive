export default function CodeBlock({ code }: { code: string }) {
  return <pre className="p-4 rounded-lg bg-black/60 overflow-auto text-sm"><code>{code}</code></pre>
}
