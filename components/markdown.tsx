export function Markdown({ content }: { content: string }) {
  // Simple markdown renderer
  const lines = content.split('\n')
  
  return (
    <div className="prose prose-sm max-w-none text-gray-900">
      {lines.map((line, idx) => {
        if (line.startsWith('##')) {
          return <h3 key={idx} className="font-bold text-base mt-2 mb-1">{line.replace('##', '').trim()}</h3>
        }
        if (line.startsWith('**')) {
          return <strong key={idx} className="block my-1">{line.replace(/\*\*/g, '').trim()}</strong>
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />
        }
        return <p key={idx} className="text-sm leading-relaxed">{line}</p>
      })}
    </div>
  )
}
