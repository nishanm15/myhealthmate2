// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Health', 'Fitness', 'Nutrition', 'Sleep', 'Mindfulness', 'Personal Development'];
const FREQUENCIES = ['Daily', 'Weekly', 'Custom'];

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health',
    target_frequency: 'Daily',
    target_count: 1,
  });

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchHabitLogs();
    }
  }, [user, selectedDate]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitLogs = async () => {
    if (!user) return;

    try {
      // Fetch logs for current week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date', { ascending: false });

      if (error) throw error;
      setHabitLogs(data || []);
    } catch (error) {
      console.error('Error fetching habit logs:', error);
    }
  };

  const addHabit = async () => {
    if (!user || !formData.title) return;

    try {
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        ...formData,
      });

      if (!error) {
        await fetchHabits();
        resetForm();
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const updateHabit = async () => {
    if (!user || !editingHabit) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update(formData)
        .eq('id', editingHabit.id);

      if (!error) {
        await fetchHabits();
        resetForm();
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const deleteHabit = async (id) => {
    if (!confirm('Are you sure you want to delete this habit? This will also delete all associated logs.')) return;

    try {
      // Delete habit logs first
      await supabase.from('habit_logs').delete().eq('habit_id', id);
      
      // Delete habit
      const { error } = await supabase.from('habits').delete().eq('id', id);

      if (!error) {
        await fetchHabits();
        await fetchHabitLogs();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    if (!user) return;

    const existingLog = habitLogs.find(
      log => log.habit_id === habitId && log.date === selectedDate
    );

    try {
      if (existingLog) {
        // Delete log (uncomplete)
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id);

        if (!error) {
          await fetchHabitLogs();
        }
      } else {
        // Create log (complete)
        const { error } = await supabase.from('habit_logs').insert({
          user_id: user.id,
          habit_id: habitId,
          date: selectedDate,
          is_completed: true,
        });

        if (!error) {
          await fetchHabitLogs();
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Health',
      target_frequency: 'Daily',
      target_count: 1,
    });
    setShowAddForm(false);
    setEditingHabit(null);
  };

  const startEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      target_frequency: habit.target_frequency,
      target_count: habit.target_count,
    });
    setShowAddForm(true);
  };

  const isHabitCompleted = (habitId) => {
    return habitLogs.some(
      log => log.habit_id === habitId && log.date === selectedDate && log.is_completed
    );
  };

  const getHabitStreak = (habitId) => {
    const logs = habitLogs
      .filter(log => log.habit_id === habitId && log.is_completed)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (logs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      const daysDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
      
      currentDate = logDate;
    }

    return streak;
  };

  const getCompletionRate = (habitId) => {
    const logs = habitLogs.filter(log => log.habit_id === habitId && log.is_completed);
    const daysInWeek = 7;
    return Math.round((logs.length / daysInWeek) * 100);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Health': 'bg-blue-100 text-blue-700',
      'Fitness': 'bg-green-100 text-green-700',
      'Nutrition': 'bg-orange-100 text-orange-700',
      'Sleep': 'bg-purple-100 text-purple-700',
      'Mindfulness': 'bg-pink-100 text-pink-700',
      'Personal Development': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: habits.length,
    completedToday: habits.filter(h => isHabitCompleted(h.id)).length,
    avgStreak: habits.length > 0 
      ? Math.round(habits.reduce((sum, h) => sum + getHabitStreak(h.id), 0) / habits.length)
      : 0,
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Habit Tracker</h1>
            <p className="text-gray-600">Build consistency with daily habit tracking.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Habit
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Active Habits</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.avgStreak}</div>
            <div className="text-sm text-gray-600">Avg Streak (days)</div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habit Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Morning Meditation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.target_frequency}
                      onChange={(e) => setFormData({ ...formData, target_frequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FREQUENCIES.map(freq => (
                        <option key={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingHabit ? updateHabit : addHabit}
                    disabled={!formData.title}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingHabit ? 'Update Habit' : 'Add Habit'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No habits yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first habit to start tracking!</p>
          </div>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = isHabitCompleted(habit.id);
            const streak = getHabitStreak(habit.id);
            const completionRate = getCompletionRate(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm p-5 border ${
                  isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`mt-1 transition-colors ${
                      isCompleted 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Circle className="w-8 h-8" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          isCompleted ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {habit.title}
                        </h3>
                        {habit.description && (
                          <p className="text-gray-600 text-sm mt-1">{habit.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getCategoryColor(habit.category)
                          }`}>
                            {habit.category}
                          </span>
                          <span className="text-xs text-gray-600">
                            {habit.target_frequency}
                          </span>
                          {streak > 0 && (
                            <span className="flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {streak} day streak
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {completionRate}% this week
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(habit)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
