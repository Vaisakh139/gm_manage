import { useState, useEffect, useRef, useCallback } from 'react';
import { publicApi } from '../../api/axios';
import type { GymPublicResult, PageResponse } from '../../types';
import GymDetailModal from './GymDetailModal';

export default function GymSearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GymPublicResult[]>([]);
  const [pagination, setPagination] = useState<Omit<PageResponse<GymPublicResult>, 'content'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedGym, setSelectedGym] = useState<GymPublicResult | null>(null);
  const [page, setPage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string, p = 0) => {
    setLoading(true);
    try {
      const res = await publicApi.searchGyms(q, p, 9);
      const data: PageResponse<GymPublicResult> = res.data.data;
      setResults(data.content);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        last: data.last,
      });
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced auto-search while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
        setPage(0);
        doSearch(query, 0);
      } else if (query === '') {
        setSearched(false);
        setResults([]);
        setPagination(null);
      }
    }, 380);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    doSearch(query, 0);
  };

  const goToPage = (p: number) => {
    setPage(p);
    doSearch(query, p);
    // Scroll to results
    document.getElementById('gym-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="gym-search" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">Find a Gym</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
            Discover Gyms Near You
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Search by gym name or city to find fitness centres using GymPro.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit}
          className="flex gap-3 max-w-2xl mx-auto mb-10">
          <div className="relative flex-1">
            {/* Search icon */}
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by gym name or city…"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
            />
            {/* Clear button */}
            {query && (
              <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-7 py-4 rounded-xl font-semibold text-base transition-colors duration-200 flex items-center gap-2 disabled:opacity-60 shrink-0">
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
            Search
          </button>
        </form>

        {/* Results count */}
        {searched && !loading && (
          <p className="text-center text-sm text-gray-500 mb-8">
            {pagination && pagination.totalElements > 0
              ? <>Found <strong className="text-gray-900">{pagination.totalElements}</strong> gym{pagination.totalElements !== 1 ? 's' : ''} matching <strong className="text-gray-900">"{query}"</strong></>
              : <>No gyms found for <strong className="text-gray-900">"{query}"</strong></>
            }
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((gym) => (
              <GymCard key={gym.id} gym={gym} onClick={() => setSelectedGym(gym)} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gyms found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Try a different name or city. New gyms are joining GymPro every day!
            </p>
          </div>
        )}

        {/* Default state (before search) */}
        {!searched && !loading && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <p className="text-base">Start typing to search for gyms</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i).map((p) => (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}>
                  {p + 1}
                </button>
              ))}
            </div>
            <button
              disabled={pagination.last}
              onClick={() => goToPage(page + 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Gym Detail Modal */}
      <GymDetailModal gym={selectedGym} onClose={() => setSelectedGym(null)} />
    </section>
  );
}

// ── Gym Card ──────────────────────────────────────────────────

function GymCard({ gym, onClick }: { gym: GymPublicResult; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group text-left bg-white border-2 border-gray-100 hover:border-red-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/8 hover:-translate-y-1 w-full">
      {/* Icon + name row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-900 group-hover:bg-red-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors duration-200">
          🏋️
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full mt-1 shrink-0">
          {gym.totalMembers} member{gym.totalMembers !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Gym name */}
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-1 line-clamp-1">
        {gym.gymName}
      </h3>

      {/* Address */}
      {gym.address && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{gym.address}</span>
        </div>
      )}

      {/* Phone */}
      {gym.phone && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{gym.phone}</span>
        </div>
      )}

      {/* View details hint */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Owner: {gym.ownerName}</span>
        <span className="text-xs font-semibold text-red-500 group-hover:gap-2 flex items-center gap-1 transition-all">
          View details
          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
