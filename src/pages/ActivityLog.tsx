import React from 'react';
import { motion } from 'motion/react';
import { Clock, Tag, Sparkles, Plus, CheckCircle2, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityLogItem } from '../types';

interface ActivityLogProps {
  onNavigate: (route: string) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ onNavigate }) => {
  const { activityLogs, user } = useApp();

  const roomNum = user?.roomNumber || 'B-204';

  const getActivityIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'submitted':
        return <Tag className="w-4 h-4 text-[#F4796F]" />;
      case 'collected':
        return <CheckCircle2 className="w-4 h-4 text-[#2FBF9F]" />;
      case 'item_added':
        return <Plus className="w-4 h-4 text-[#FFC93C]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#6C7BFF]" />;
    }
  };

  const getActivityBadge = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'submitted':
        return 'bg-[#F4796F]/20 text-[#23241F] border-[#F4796F]/40';
      case 'collected':
        return 'bg-[#2FBF9F]/20 text-[#23241F] border-[#2FBF9F]/40';
      case 'item_added':
        return 'bg-[#FFC93C]/30 text-[#23241F] border-[#FFC93C]/50';
      default:
        return 'bg-[#6C7BFF]/20 text-[#23241F] border-[#6C7BFF]/40';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Page Header */}
      <div className="bg-[#23241F] text-[#F7F5F1] rounded-3xl p-5 shadow-lg border border-white/10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#6C7BFF] text-white flex items-center justify-center shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center space-x-2.5">
              <h2 className="font-heading font-extrabold text-xl text-white tracking-tight truncate">
                Activity Log
              </h2>
              <span className="shrink-0 bg-[#2FBF9F] text-[#23241F] px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                RM #{roomNum}
              </span>
            </div>
            <p className="text-[11px] text-[#F7F5F1]/70 mt-1 font-medium tracking-wide truncate">
              Timestamped laundry events and updates.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      {activityLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-[#23241F]/10 shadow-sm space-y-4 mt-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6C7BFF]/10 to-[#6C7BFF]/5 text-[#6C7BFF] mx-auto flex items-center justify-center border border-[#6C7BFF]/20 shadow-inner">
            <History className="w-10 h-10 drop-shadow-sm" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-heading font-extrabold text-lg text-[#23241F] tracking-tight">
              No Activity Yet
            </h3>
            <p className="text-xs text-[#23241F]/60 max-w-[240px] mx-auto leading-relaxed font-medium">
              Your laundry events, wash cycles, and wardrobe updates will automatically appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#23241F]/15">
          {activityLogs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative bg-white rounded-2xl p-4 shadow-sm border border-[#23241F]/10 space-y-1.5"
              >
                {/* Timeline Dot Icon */}
                <div
                  className={`absolute -left-[30px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${getActivityBadge(
                    log.type
                  )}`}
                >
                  {getActivityIcon(log.type)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#23241F]/5 text-[#23241F]">
                    {log.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#23241F]/50">
                    {dateStr} • {timeStr}
                  </span>
                </div>

                <p className="font-heading font-semibold text-sm text-[#23241F]">
                  {log.message}
                </p>

                <div className="pt-1 flex items-center space-x-1 text-[10px] font-mono text-[#23241F]/50">
                  <span>ROOM TAG: #{log.roomNumber || roomNum}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
