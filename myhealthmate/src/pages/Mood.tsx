// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Smile, Zap, Wind, Calendar, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😄', '😁', '😃', '😍', '🤩'];

export default function Mood() {
  const { user } = useAuth();
  const [todayMood, setTodayMood] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [historicalLogs, setHistoricalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [formData, setFormData] = useState({
    mood_level: 5,
    energy_level: 5,
    stress_level: 5,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchMoodData();
    }
  }, [user]);

  const fetchMoodData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Today's mood
      const { data: todayData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      setTodayMood(todayData);

      // Weekly data
      const { data: weekData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date');

      const chartData = weekData?.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: d.mood_level,
        energy: d.energy_level,
        stress: d.stress_level,
      })) || [];

      setWeeklyData(chartData);

      // Historical logs (past 30 days, excluding today)
      const { data: histData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .lt('date', today)
        .order('date', { ascending: false });

      setHistoricalLogs(histData || []);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (todayMood) {
        // Update existing
        await supabase
          .from('mood_logs')
          .update(formData)
          .eq('id', todayMood.id);
      } else {
        // Insert new
        await supabase.from('mood_logs').insert({
          user_id: user.id,
          date: today,
          ...formData,
        });
      }

      await fetchMoodData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const deleteTodayMood = async () => {
    if (!confirm('Are you sure you want to delete today\'s mood entry?')) return;

    try {
      if (todayMood) {
        await supabase
          .from('mood_logs')
          .delete()
          .eq('id', todayMood.id);

        await fetchMoodData();
      }
    } catch (error) {
      console.error('Error deleting mood:', error);
    }
  };

  const startEditHistorical = (log: any) => {
    setEditingLog(log);
    setFormData({
      mood_level: log.mood_level,
      energy_level: log.energy_level,
      stress_level: log.stress_level,
      notes: log.notes || '',
    });
  };

  const updateHistoricalMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      await supabase
        .from('mood_logs')
        .update(formData)
        .eq('id', editingLog.id);

      await fetchMoodData();
      setEditingLog(null);
      setFormData({
        mood_level: 5,
        energy_level: 5,
        stress_level: 5,
        notes: '',
      });
    } catch (error) {
      console.error('Error updating mood:', error);
    }
  };

  const deleteHistoricalMood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return;

    try {
      await supabase
        .from('mood_logs')
        .delete()
        .eq('id', id);

      await fetchMoodData();
    } catch (error) {
      console.error('Error deleting mood:', error);
    }
  };

  const getCorrelationInsights = () => {
    if (weeklyData.length < 3) return null;

    const avgMood = weeklyData.reduce((sum, d) => sum + d.mood, 0) / weeklyData.length;
    const avgEnergy = weeklyData.reduce((sum, d) => sum + d.energy, 0) / weeklyData.length;
    const avgStress = weeklyData.reduce((sum, d) => sum + d.stress, 0) / weeklyData.length;

    const insights = [];

    if (avgEnergy > 7) {
      insights.push('Your energy levels are high - keep up the great work!');
    } else if (avgEnergy < 4) {
      insights.push('Consider improving sleep quality to boost energy levels.');
    }

    if (avgStress > 7) {
      insights.push('Stress levels are elevated. Consider relaxation techniques.');
    }

    if (avgMood < 5) {
      insights.push('Your mood could use a boost. Exercise and good sleep can help!');
    }

    return insights;
  };

  const insights = getCorrelationInsights();

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
        <p className="text-gray-600">Track your emotional well-being and identify patterns</p>
      </motion.div>

      {/* Today's Mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Check-in</h2>
          {todayMood && !showForm && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormData({
                    mood_level: todayMood.mood_level,
                    energy_level: todayMood.energy_level,
                    stress_level: todayMood.stress_level,
                    notes: todayMood.notes || '',
                  });
                  setShowForm(true);
                }}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={deleteTodayMood}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>

        {todayMood && !showForm ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <Smile className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Mood</p>
              <p className="text-4xl mb-2">{moodEmojis[todayMood.mood_level - 1]}</p>
              <p className="text-2xl font-bold text-gray-900">{todayMood.mood_level}/10</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Energy</p>
              <p className="text-2xl font-bold text-gray-900">{todayMood.energy_level}/10</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Wind className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Stress</p>
              <p className="text-2xl font-bold text-gray-900">{todayMood.stress_level}/10</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mood Level: {formData.mood_level}/10 {moodEmojis[formData.mood_level - 1]}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood_level}
                onChange={(e) => setFormData({ ...formData, mood_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Energy Level: {formData.energy_level}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Exhausted</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stress Level: {formData.stress_level}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Relaxed</span>
                <span>Very Stressed</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="How are you feeling? Any reflections?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Check-in
              </button>
              {todayMood && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {!todayMood && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
          >
            Log Today's Mood
          </button>
        )}
      </motion.div>

      {/* Weekly Trends */}
      {weeklyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">7-Day Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#22c55e" strokeWidth={2} name="Energy" />
              <Line type="monotone" dataKey="stress" stroke="#a855f7" strokeWidth={2} name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Historical Mood Logs */}
      {historicalLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mood History (Past 30 Days)</h2>
          <div className="space-y-4">
            {historicalLogs.map((log) => (
              <div key={log.id}>
                {editingLog?.id === log.id ? (
                  <form onSubmit={updateHistoricalMood} className="p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium text-gray-900">
                        {new Date(log.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLog(null);
                            setFormData({
                              mood_level: 5,
                              energy_level: 5,
                              stress_level: 5,
                              notes: '',
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    
                    {/* Edit Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mood Level: {formData.mood_level}/10 {moodEmojis[formData.mood_level - 1]}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.mood_level}
                          onChange={(e) => setFormData({ ...formData, mood_level: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Energy Level: {formData.energy_level}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.energy_level}
                          onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stress Level: {formData.stress_level}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.stress_level}
                          onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={2}
                          placeholder="How were you feeling?"
                          className="w-full px-3 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(log.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditHistorical(log)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHistoricalMood(log.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg">
                        <Smile className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="text-xs text-gray-600">Mood</p>
                          <p className="text-sm font-medium text-gray-900">
                            {moodEmojis[log.mood_level - 1]} {log.mood_level}/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                        <Zap className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Energy</p>
                          <p className="text-sm font-medium text-gray-900">{log.energy_level}/10</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                        <Wind className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-600">Stress</p>
                          <p className="text-sm font-medium text-gray-900">{log.stress_level}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
