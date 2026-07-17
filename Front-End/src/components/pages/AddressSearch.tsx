import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/http'
import { Search } from 'lucide-react'

interface PlaceResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface AddressSearchProps {
  onSelect: (address: string, lat: number, lon: number) => void
  initialValue?: string
}

export default function AddressSearch({ onSelect, initialValue = '' }: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialValue) setQuery(initialValue)
  }, [initialValue])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query || query.length < 3) {
      setResults([])
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.get<PlaceResult[]>(`/geocode/search?q=${encodeURIComponent(query)}&limit=5`)
        setResults(data)
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleSelect(place: PlaceResult) {
    setQuery(place.display_name)
    setShowResults(false)
    onSelect(place.display_name, parseFloat(place.lat), parseFloat(place.lon))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Dirección de entrega</label>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar dirección en Chiclayo..."
          className="w-full bg-bg-base border border-border pl-9 pr-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
        />
      </div>

      {loading && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-lg shadow-lg p-3 text-center text-sm text-text-secondary">
          Buscando...
        </div>
      )}

      {showResults && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 cursor-pointer hover:bg-bg-elevated text-[13px] text-text-primary border-b border-border last:border-b-0"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {showResults && query.length >= 3 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-lg shadow-lg p-3 text-center text-sm text-text-secondary">
          No se encontraron resultados
        </div>
      )}
    </div>
  )
}
