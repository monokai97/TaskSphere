import { TopBar } from '@/components/layout/TopBar'
import { SearchResults } from '@/components/tasks/SearchResults'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  return (
    <>
      <TopBar title={q ? `Search: "${q}"` : 'Search'} />
      <SearchResults query={q || ''} />
    </>
  )
}
