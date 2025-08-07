'use client'

import { memo } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer = memo(({ content, className = '' }: MarkdownRendererProps) => {
  // Simple markdown parsing for demo purposes
  // In production, you'd use a library like react-markdown
  const parseMarkdown = (text: string) => {
    return text
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-2 text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-3 text-gray-100">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-200">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-2 text-gray-300">')
      .replace(/\n- /g, '</p><ul class="list-disc list-inside mb-2 text-gray-300"><li>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-2 text-gray-300">${parseMarkdown(content)}</p>` 
      }}
    />
  )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'
