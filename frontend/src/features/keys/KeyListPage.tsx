import { useEffect, useState, useMemo } from 'react';
import { Key, Loader2 } from 'lucide-react';
import { useKeyStore } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';
import KeyCard from './components/KeyCard';
import KeyFilterBar from './components/KeyFilterBar';

export default function KeyListPage() {
  const [search, setSearch] = useState('');
  const [mapFilter, setMapFilter] = useState('');
  const { keys, ownedKeys, loading, error, fetchKeys, fetchProgress, toggleOwned } = useKeyStore();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    if (token) fetchProgress();
  }, [token, fetchProgress]);

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (search) {
        const lower = search.toLowerCase();
        const nameMatch = k.name?.toLowerCase().includes(lower);
        const shortMatch = k.shortName?.toLowerCase().includes(lower);
        if (!nameMatch && !shortMatch) return false;
      }
      if (mapFilter && !k.mapNames.includes(mapFilter)) return false;
      return true;
    });
  }, [keys, search, mapFilter]);

  const mapNames = useMemo(() => {
    const names = new Set<string>();
    keys.forEach((k) => k.mapNames.forEach((m) => names.add(m)));
    return [...names].sort();
  }, [keys]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Key size={24} className="text-gold" />
        <div>
          <h1 className="text-xl font-bold text-text">키 / 키카드</h1>
          <p className="text-sm text-text-muted">{keys.length}개 키</p>
        </div>
      </div>

      {/* 필터 */}
      <KeyFilterBar
        search={search}
        onSearchChange={setSearch}
        mapFilter={mapFilter}
        onMapFilterChange={setMapFilter}
        mapNames={mapNames}
      />

      {/* 로딩 / 에러 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

      {/* 키 그리드 */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <KeyCard
              key={k.apiId}
              keyItem={k}
              owned={ownedKeys.has(k.apiId)}
              onToggleOwned={() => toggleOwned(k.apiId)}
              isLoggedIn={!!token}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && keys.length > 0 && (
        <p className="text-center text-sm text-text-muted py-8">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
