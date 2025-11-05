// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Moon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SleepLog {
  id: string;
  sleep_start: string;
  sleep_end: string;
  duration: number;
}

export default function Sleep() {
  const { user } = useAuth();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sleep_start: '',
    sleep_end: '',
  });

  useEffect(() => {
    if (user) {
      fetchSleepLogs();
    }
  }, [user]);

  const fetchSleepLogs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('sleep_start', { ascending: false });

    if (!error && data) {
      setSleepLogs(data);
    }
    setLoading(false);
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const duration = calculateDuration(formData.sleep_start, formData.sleep_end);

    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    const sleepData = {
      user_id: user.id,
      sleep_start: formData.sleep_start,
      sleep_end: formData.sleep_end,
      duration,
    };

    if (editingId) {
      const { error } = await supabase
        .from('sleep_logs')
        .update(sleepData)
        .eq('id', editingId);

      if (!error) {
        await fetchSleepLogs();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('sleep_logs')
        .insert([sleepData]);

      if (!error) {
        await fetchSleepLogs();
        resetForm();
      }
    }
  };

  const handleEdit = (log: SleepLog) => {
    setEditingId(log.id);
    setFormData({
      sleep_start: log.sleep_start.slice(0, 16),
      sleep_end: log.sleep_end.slice(0, 16),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sleep log?')) return;

    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchSleepLogs();
    }
  };

  const resetForm = () => {
    setFormData({
      sleep_start: '',
      sleep_end: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Weekly sleep data
  const getWeeklySleepData = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLogs = sleepLogs.filter(log => new Date(log.sleep_start) >= weekAgo);

    const dailyMap = new Map();
    weeklyLogs.forEach(log => {
      const date = new Date(log.sleep_start).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, duration: 0 });
      }
      dailyMap.get(date).duration = log.duration;
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: d.duration,
      }));
  };

  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.slice(0, 7).reduce((sum, log) => sum + log.duration, 0) / Math.min(sleepLogs.length, 7)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sleep Tracker</h1>
          <p className="text-gray-600">Track your sleep patterns and quality</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Sleep
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Sleep Log' : 'Add New Sleep Log'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Start</label>
                  <input
                    type="datetime-local"
                    value={formData.sleep_start}
                    onChange={(e) => setFormData({ ...formData, sleep_start: e.target.value })}
                    className="w-full px-3 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleep End</label>
                  <input
                    type="datetime-local"
                    value={formData.sleep_end}
                    onChange={(e) => setFormData({ ...formData, sleep_end: e.target.value })}
                    className="w-full px-3 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              {formData.sleep_start && formData.sleep_end && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Duration: <span className="font-bold">{calculateDuration(formData.sleep_start, formData.sleep_end)} hours</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Log
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 min-h-[48px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Average Sleep</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {Math.round(avgSleep * 10) / 10}
            <span className="text-sm font-normal text-gray-500 ml-2">hrs</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Last Night</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {sleepLogs.length > 0 ? sleepLogs[0].duration : 0}
            <span className="text-sm font-normal text-gray-500 ml-2">hrs</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Moon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Sleep Quality</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {avgSleep >= 7 ? 'Good' : avgSleep >= 6 ? 'Fair' : 'Poor'}
          </p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">7-Day Sleep Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getWeeklySleepData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} name="Sleep Hours" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-900">
            Recommended sleep: <span className="font-bold">7-9 hours</span> per night for optimal health
          </p>
        </div>
      </div>

      {/* Sleep Logs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Sleep History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {sleepLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No sleep logs yet. Click "Log Sleep" to get started!
            </div>
          ) : (
            sleepLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {log.duration} hours
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        log.duration >= 7
                          ? 'bg-green-100 text-green-700'
                          : log.duration >= 6
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.duration >= 7 ? 'Good' : log.duration >= 6 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>
                        {new Date(log.sleep_start).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>to</span>
                      <span>
                        {new Date(log.sleep_end).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
