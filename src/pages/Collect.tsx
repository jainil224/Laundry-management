import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, History, AlertTriangle, Check, ArrowRight, Calendar, CheckCircle2, Tag, ArrowUpDown, Filter, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CollectProps {
  onNavigate: (route: string) => void;
}

export const Collect: React.FC<CollectProps> = ({ onNavigate }) => {
  const { batches, markClothWashed, markClothMissing, user, wardrobe, categories, deleteBatch, clearAllBatches } = useApp();

  const [activeTab, setActiveTab] = useState<'in_wash' | 'history'>('in_wash');
  const [actionSuccessId, setActionSuccessId] = useState<string | null>(null);

  // History filtering & sorting state
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  const roomNum = user?.roomNumber || '207';

  // Clothes currently in wash (For 'In Wash' Tab)
  const clothesInWash = wardrobe.filter((w) => w.inWash === true);

  const handleMarkWashed = async (itemId: string) => {
    setActionSuccessId(`washed-${itemId}`);
    await markClothWashed(itemId);
    setTimeout(() => setActionSuccessId(null), 2000);
  };

  const handleMarkMissing = async (itemId: string) => {
    setActionSuccessId(`missing-${itemId}`);
    await markClothMissing(itemId);
    setTimeout(() => setActionSuccessId(null), 2000);
  };

  const getBatchItems = (itemIds: string[]) => {
    return wardrobe.filter((w) => itemIds.includes(w.id));
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '---';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Color Swatch Helper ──
  const getColorHex = (colorName: string | null | undefined) => {
    if (!colorName) return '#000000';
    const name = colorName.toLowerCase();
    if (name.includes('black')) return '#000000';
    if (name.includes('white')) return '#FFFFFF';
    if (name.includes('blue') || name.includes('navy')) return '#1E3A8A';
    if (name.includes('red')) return '#DC2626';
    if (name.includes('green')) return '#16A34A';
    if (name.includes('yellow')) return '#EAB308';
    if (name.includes('grey') || name.includes('gray')) return '#6B7280';
    if (name.includes('brown')) return '#78350F';
    return '#3B82F6';
  };

  // ── Stats Calculations for History Hero Section ──
  const totalClothesSubmitted = batches.reduce((acc, b) => acc + b.itemCount, 0);
  const totalClothesCollected = batches
    .filter((b) => b.status === 'collected')
    .reduce((acc, b) => acc + b.itemCount, 0);

  // ── Sorting and Filtering logic for History Tab ──
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    batches.forEach((b) => {
      const d = new Date(b.submittedAt);
      if (!isNaN(d.getTime())) {
        months.add(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
      }
    });
    return ['All', ...Array.from(months)];
  }, [batches]);

  const processedBatches = useMemo(() => {
    let filtered = [...batches];

    if (selectedMonth !== 'All') {
      filtered = filtered.filter((b) => {
        const d = new Date(b.submittedAt);
        const m = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        return m === selectedMonth;
      });
    }

    filtered.sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [batches, selectedMonth, sortOrder]);

  return (
    <div className="space-y-4 pb-4">
      {/* Navigation Tabs (In Wash & History) */}
      <div className="flex rounded-2xl bg-white p-1 border border-neutral-200 shadow-xs">
        <button
          onClick={() => setActiveTab('in_wash')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'in_wash'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Wash ({clothesInWash.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({batches.length})</span>
        </button>
      </div>

      {/* TAB 1: CLOTHES IN WASH */}
      {activeTab === 'in_wash' && (
        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-black">
              Garments Currently in Wash
            </h2>
            <span className="text-xs font-mono font-bold text-black">
              {clothesInWash.length} ITEMS
            </span>
          </div>

          {clothesInWash.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-black text-white mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-black">
                No Clothes in Wash
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto font-medium">
                Submit clothes from your wardrobe to send them for washing!
              </p>
              <button
                onClick={() => onNavigate('submit')}
                className="mt-2 inline-flex items-center gap-2 bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-transform shadow-md"
              >
                <span>Submit Clothes for Wash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {clothesInWash.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-xs flex flex-col justify-between"
                >
                  {/* Photo area */}
                  <div className="relative aspect-4/5 w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={item.photoUrl}
                      alt={item.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
                      }}
                    />

                    {/* Room tag badge */}
                    <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium">
                      RM {roomNum}
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-white text-black px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shadow-xs border border-neutral-200">
                      IN WASH
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-3 space-y-2">
                    <h4 className="font-extrabold text-xs text-black truncate uppercase" title={item.label}>
                      {item.label}
                    </h4>

                    {/* 2 ACTION OPTIONS: WASHED & MISSING */}
                    <div className="flex gap-1.5 pt-1">
                      {/* Washed Button */}
                      <button
                        onClick={() => handleMarkWashed(item.id)}
                        className="flex-1 py-2 bg-black text-white rounded-xl font-bold text-[11px] hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Washed</span>
                      </button>

                      {/* Missing Button */}
                      <button
                        onClick={() => handleMarkMissing(item.id)}
                        className="flex-1 py-2 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl font-bold text-[11px] hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Missing</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORY (All Batches: Submitted & Collected) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* 📊 HERO SECTION: CLOTHES SUBMITTED VS COLLECTED */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white rounded-3xl p-5 border border-neutral-800 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm">
                  📊
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white leading-none">History Summary</h3>
                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5">ALL TIME METRICS</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
              <div className="bg-neutral-900 rounded-2xl p-3 border border-neutral-800 flex flex-col justify-center">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Clothes Submitted</span>
                <p className="text-2xl font-extrabold text-white mt-1">{totalClothesSubmitted}</p>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-3 border border-neutral-800 flex flex-col justify-center">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Clothes Collected</span>
                <p className="text-2xl font-extrabold text-white mt-1">{totalClothesCollected}</p>
              </div>
            </div>
          </motion.div>

          <div className="px-1 flex items-center justify-between pt-1">
            <h2 className="font-extrabold text-base text-black">
              Activity History
            </h2>
            <span className="text-xs font-mono font-bold text-black">
              {processedBatches.length} RECORD{processedBatches.length !== 1 ? 'S' : ''}
            </span>
          </div>

          {/* Sorting, Filtering, and Clear All Controls */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none bg-white border border-neutral-200 text-black text-xs font-bold rounded-xl py-2.5 pl-3 pr-8 shadow-xs outline-none focus:border-black transition-colors"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m === 'All' ? 'All Months' : m}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="bg-white border border-neutral-200 px-4 py-2.5 rounded-xl text-black flex items-center justify-center shadow-xs active:scale-95 transition-transform min-w-[100px]"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <span className="ml-1.5 text-xs font-bold">
                  {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                </span>
              </button>
            </div>
            
            {processedBatches.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
                    clearAllBatches();
                  }
                }}
                className="w-full bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All History
              </button>
            )}
          </div>

          {processedBatches.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200 space-y-2 shadow-xs">
              <History className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-extrabold text-black">No Wash History Found</p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto font-medium">
                Try clearing your filters or submit new clothes for washing to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedBatches.map((batch) => {
                const batchItems = getBatchItems(batch.itemIds);
                const isCollected = batch.status === 'collected';
                const isSubmitted = batch.status === 'submitted' || batch.status === 'in_wash';

                return (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-dashed border-neutral-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center gap-1 ${
                              isCollected
                                ? 'bg-black text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isCollected ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {isCollected ? 'COLLECTED' : 'SUBMITTED'}
                          </span>
                        </div>
                        <p className="font-extrabold text-sm text-black mt-1">
                          {batch.itemCount} Garment{batch.itemCount !== 1 ? 's' : ''}{' '}
                          {isCollected ? 'Washed & Returned' : 'Submitted for Wash'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (confirm('Delete this history record?')) {
                            deleteBatch(batch.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Submitted & Collected Date and Time */}
                    <div className="bg-neutral-50 rounded-2xl p-3 space-y-1.5 font-mono text-xs text-neutral-800 border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-black" /> Submitted:
                        </span>
                        <span className="font-extrabold text-black">
                          {formatDateTime(batch.submittedAt)}
                        </span>
                      </div>

                      {isCollected && (
                        <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-black" /> Collected:
                          </span>
                          <span className="font-extrabold text-black">
                            {formatDateTime(batch.collectedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Clothes List with Submitted Colors & Garment Images */}
                    <div>
                      <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-black" /> GARMENT DETAILS:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {batchItems.map((item) => {
                          const colorName = item.color || 'Black';
                          const hex = getColorHex(colorName);

                          return (
                            <div
                              key={item.id}
                              className="bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 p-2 flex flex-col items-center text-center space-y-1.5 shadow-2xs"
                            >
                              <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-200 relative">
                                <img
                                  src={item.photoUrl}
                                  alt={item.label}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                                <div className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                                  RM #{roomNum}
                                </div>
                              </div>

                              <span className="text-xs font-extrabold text-black truncate w-full uppercase">
                                {item.label}
                              </span>

                              {/* Submitted Color Pill Badge */}
                              <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-neutral-300 text-[10px] font-mono font-bold text-black shadow-2xs">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-neutral-400 shrink-0"
                                  style={{ backgroundColor: hex }}
                                />
                                <span className="truncate max-w-[80px]">{colorName}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

