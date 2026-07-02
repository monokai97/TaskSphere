'use client'

import { TaskList } from '@/components/tasks/TaskList'

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-6">
        <p className="font-body-md text-on-surface-variant">
          Type a search term and press Enter to find tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6">
      <TaskList
        searchQuery={query}
        emptyState={{
          icon: 'search_off',
          title: 'No results found',
          description: `No tasks match "${query}". Try a different search term.`,
        }}
      />
    </div>
  )
}
