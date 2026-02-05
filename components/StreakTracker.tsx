
import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { getISTDate, checkStreak } from '../utils/timeUtils';
import { StreakData } from '../types';

const StreakTracker: React.FC = () => {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastLoginDate: '' });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('solomon_streak');
    let currentStreak: StreakData = saved ? JSON.parse(saved) : { count: 0, lastLoginDate: '' };
    
    const { newCount, shouldUpdate } = checkStreak(currentStreak.lastLoginDate || null);
    
    if (shouldUpdate) {
      const updatedStreak: StreakData = {
        count: newCount === -1 ? 1 : currentStreak.count + 1,
        lastLoginDate: getISTDate().toISOString()
      };
      setStreak(updatedStreak);
      localStorage.setItem('solomon_streak', JSON.stringify(updatedStreak));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setStreak(currentStreak);
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className={`p-4 rounded-full bg-orange-500/10 ${streak.count > 0 ? 'animate-pulse' : ''}`}>
            <Flame className={`w-12 h-12 ${streak.count > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-slate-500'}`} />
          </div>
          {streak.count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-900">
              {streak.count}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Your Tool Mastery Streak</h2>
          <p className="text-slate-400 text-sm">
            Log in daily to keep your focus sharp. Based on IST (GMT+5:30).
          </p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 min-w-[100px] text-center">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3" /> BEST
          </div>
          <div className="text-xl font-bold text-white">{streak.count} Days</div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 min-w-[100px] text-center">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> LAST
          </div>
          <div className="text-sm font-medium text-white">
            {streak.lastLoginDate ? new Date(streak.lastLoginDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Never'}
          </div>
        </div>
      </div>

      {showCelebration && (
        <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none animate-ping opacity-20" />
      )}
    </div>
  );
};

export default StreakTracker;
