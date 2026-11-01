import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { onSiteOrigin } from '@/lib/seo'

const components: Components = {
  a: ({ node: _node, href, ...props }) => <a href={href && onSiteOrigin(href)} {...props} />
}

export function SiteMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
