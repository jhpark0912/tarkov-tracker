import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Key, DoorOpen, ScrollText, MapPin, ExternalLink, Loader2, Coins } from 'lucide-react';
import { useKeyStore } from '../../store/keyStore';

export default function KeyDetailPage() {
  const { apiId } = useParams<{ apiId: string }>();
  const { currentDetail: detail, loading, error, fetchDetail, clearDetail } = useKeyStore();

  useEffect(() => {
    if (apiId) fetchDetail(apiId);
    return () => clearDetail();
  }, [apiId, fetchDetail, clearDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-sm text-red-400 py-4">{error}</p>;
  }

  if (!detail) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link to="/keys">
          <ArrowLeft size={20} className="text-text-muted hover:text-text transition-colors" />
        </Link>
        <div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center overflow-hidden">
          {detail.iconUrl ? (
            <img src={detail.iconUrl} alt={detail.name} className="w-10 h-10 object-contain" />
          ) : (
            <Key size={20} className="text-text-muted" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{detail.name}</h1>
          {detail.shortName && <p className="text-sm text-text-muted">{detail.shortName}</p>}
          <p className="flex items-center gap-1 text-sm text-gold">
            <Coins size={14} />
            {detail.price != null ? `₽ ${detail.price.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        {detail.wikiLink && (
          <a
            href={detail.wikiLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors no-underline"
          >
            <ExternalLink size={12} /> Wiki
          </a>
        )}
      </div>

      {/* 문 목록 */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
          <DoorOpen size={16} className="text-text-secondary" />
          문 위치 ({detail.doors.length}개)
        </h2>
        <div className="space-y-3">
          {detail.doors.map((door) => (
            <div key={door.lockId} className="flex items-center justify-between bg-surface-alt rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-text-muted" />
                <div>
                  <span className="text-sm text-text">{door.mapName}</span>
                  {door.floorId && (
                    <span className="text-xs text-text-muted ml-2">({door.floorId})</span>
                  )}
                  {door.lockType && (
                    <span className="text-[10px] text-text-muted ml-2 uppercase">{door.lockType}</span>
                  )}
                </div>
              </div>
              {door.positionX != null && door.positionY != null && (
                <Link
                  to={`/map/${door.mapNormalizedName}`}
                  className="text-xs text-gold hover:text-gold/80 transition-colors no-underline"
                >
                  맵에서 보기
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 관련 퀘스트 */}
      {detail.quests.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
            <ScrollText size={16} className="text-text-secondary" />
            관련 퀘스트 ({detail.quests.length}개)
          </h2>
          <div className="space-y-2">
            {detail.quests.map((quest) => (
              <Link
                key={quest.questId}
                to={`/quests/${quest.questId}`}
                className="flex items-center justify-between bg-surface-alt rounded-xl px-4 py-3 hover:bg-elevated/50 transition-colors no-underline"
              >
                <div>
                  <span className="text-sm text-text">{quest.questName}</span>
                  {quest.traderName && (
                    <span className="text-xs text-text-muted ml-2">{quest.traderName}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
