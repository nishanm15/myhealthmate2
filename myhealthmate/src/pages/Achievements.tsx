// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trophy, Flame, Award, Target, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  criteria: any;
}

interface UserAchievement {
  achievement_id: string;
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string;
}

interface Streak {
  streak_type: string;
  current_streak: number;
  longest_streak: number;
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('achievement_type');

      // Fetch user achievements
      const { data: userAchData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      // Fetch streaks
      const { data: streaksData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);

      setAchievements(achievementsData || []);
      setUserAchievements(userAchData || []);
      setStreaks(streaksData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementStatus = (achievement: Achievement) => {
    const userAch = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return {
      unlocked: userAch?.is_unlocked || false,
      progress: userAch?.progress || 0,
      unlockedAt: userAch?.unlocked_at,
    };
  };

  const getStreakInfo = (type: string) => {
    const streak = streaks.find(s => s.streak_type === type);
    return {
      current: streak?.current_streak || 0,
      longest: streak?.longest_streak || 0,
    };
  };

  const handleResetProgress = async () => {
    if (!user) return;
    
    setResetting(true);
    try {
      // Reset all streaks
      await supabase
        .from('streaks')
        .delete()
        .eq('user_id', user.id);

      // Reset all user achievements
      await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user.id);

      // Refresh data
      await fetchData();
      setShowResetModal(false);
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Failed to reset progress. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const streakCards = [
    {
      type: 'workout',
      label: 'Workout Streak',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      type: 'sleep',
      label: 'Sleep Streak',
      icon: Target,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      type: 'water',
      label: 'Hydration Streak',
      icon: Trophy,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      type: 'diet',
      label: 'Diet Streak',
      icon: Award,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  const groupedAchievements = achievements.reduce((acc, ach) => {
    if (!acc[ach.achievement_type]) {
      acc[ach.achievement_type] = [];
    }
    acc[ach.achievement_type].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      workout_streak: 'Workout Achievements',
      sleep_streak: 'Sleep Achievements',
      water_streak: 'Hydration Achievements',
      diet_streak: 'Nutrition Achievements',
      health_score: 'Health Score Achievements',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Achievements & Streaks</h1>
            <p className="text-gray-600">Track your progress and celebrate your milestones!</p>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progress
          </button>
        </div>
      </motion.div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {streakCards.map((card, index) => {
          const Icon = card.icon;
          const info = getStreakInfo(card.type);
          return (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {info.current}
                <span className="text-sm font-normal text-gray-500 ml-2">days</span>
              </p>
              <p className="text-sm text-gray-500">Longest: {info.longest} days</p>
            </motion.div>
          );
        })}
      </div>

      {/* Achievements */}
      {Object.entries(groupedAchievements).map(([type, achs], typeIndex) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + typeIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">{getTypeLabel(type)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achs.map((achievement) => {
              const status = getAchievementStatus(achievement);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    status.unlocked
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Trophy
                      className={`w-8 h-8 ${
                        status.unlocked ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                    />
                    {status.unlocked && (
                      <span className="text-xs text-yellow-700 font-medium px-2 py-1 bg-yellow-100 rounded">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  {status.unlocked && status.unlockedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(status.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {achievements.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No achievements available yet. Keep tracking your health!</p>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Reset All Progress?</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                This will permanently delete all your streaks and achievement progress. This action cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-800 font-medium">Warning: You will lose:</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>All current streaks</li>
                  <li>All unlocked achievements</li>
                  <li>All streak history</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  disabled={resetting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={resetting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                >
                  {resetting ? 'Resetting...' : 'Reset Progress'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
