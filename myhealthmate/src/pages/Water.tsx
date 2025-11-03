// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Droplet, Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Water() {
  const { user } = useAuth();
  const [waterGoal, setWaterGoal] = useState(2000);
  const [todayIntake, setTodayIntake] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchWaterData();
      fetchUserGoal();
    }
  }, [user]);

  const fetchUserGoal = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('water_goal')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data?.water_goal) {
      setWaterGoal(data.water_goal);
    }
  };

  const fetchWaterData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Today's water intake
      const { data: todayLogs } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('timestamp', { ascending: false });

      const todayTotal = todayLogs?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;
      setTodayIntake(todayTotal);
      setWaterLogs(todayLogs || []);

      // Weekly data
      const { data: weekLogs } = await supabase
        .from('water_logs')
        .select('date, amount_ml')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date');

      const waterMap = new Map();
      for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        waterMap.set(date, { date, total: 0 });
      }

      weekLogs?.forEach(log => {
        if (waterMap.has(log.date)) {
          waterMap.get(log.date).total += log.amount_ml;
        }
      });

      const chartData = Array.from(waterMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          intake: d.total,
        }));

      setWeeklyData(chartData);
    } catch (error) {
      console.error('Error fetching water data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWaterIntake = async (amount: number) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase.from('water_logs').insert({
        user_id: user.id,
        date: today,
        amount_ml: amount,
        timestamp: new Date().toISOString(),
      });

      if (!error) {
        await fetchWaterData();
        await updateStreak();
      }
    } catch (error) {
      console.error('Error adding water intake:', error);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', 'water')
        .maybeSingle();

      const todayTotal = todayIntake + (customAmount ? parseInt(customAmount) : 0);
      const goalMet = todayTotal >= waterGoal;

      if (goalMet) {
        if (!streak) {
          await supabase.from('streaks').insert({
            user_id: user.id,
            streak_type: 'water',
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
          });
        } else {
          const newStreak = streak.last_activity_date === yesterday 
            ? streak.current_streak + 1 
            : 1;
          
          await supabase
            .from('streaks')
            .update({
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, streak.longest_streak),
              last_activity_date: today,
            })
            .eq('id', streak.id);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      addWaterIntake(amount);
      setCustomAmount('');
    }
  };

  const deleteWaterLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this water log?')) return;

    try {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchWaterData();
      }
    } catch (error) {
      console.error('Error deleting water log:', error);
    }
  };

  const startEdit = (log) => {
    setEditingLog(log);
    setEditAmount(log.amount_ml.toString());
  };

  const updateWaterLog = async () => {
    if (!editingLog || !editAmount) return;

    const amount = parseInt(editAmount);
    if (amount <= 0) return;

    try {
      const { error } = await supabase
        .from('water_logs')
        .update({ amount_ml: amount })
        .eq('id', editingLog.id);

      if (!error) {
        await fetchWaterData();
        setEditingLog(null);
        setEditAmount('');
      }
    } catch (error) {
      console.error('Error updating water log:', error);
    }
  };

  const quickAddButtons = [
    { label: '250ml', amount: 250 },
    { label: '500ml', amount: 500 },
    { label: '750ml', amount: 750 },
    { label: '1L', amount: 1000 },
  ];

  const progress = Math.min((todayIntake / waterGoal) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Tracker</h1>
        <p className="text-gray-600">Stay hydrated! Track your daily water intake.</p>
      </motion.div>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Today's Hydration</h2>
            <p className="text-gray-600 mt-1">
              {todayIntake}ml / {waterGoal}ml
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-full">
            <Droplet className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {quickAddButtons.map((btn) => (
            <button
              key={btn.amount}
              onClick={() => addWaterIntake(btn.amount)}
              className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
            >
              + {btn.label}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-3">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount (ml)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomAdd}
            disabled={!customAmount}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">7-Day Water Intake</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="intake" stroke="#3b82f6" strokeWidth={2} name="Water (ml)" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Today's Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Logs</h2>
        {waterLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No water intake logged today</p>
        ) : (
          <div className="space-y-3">
            {waterLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {editingLog?.id === log.id ? (
                  <div className="flex items-center gap-3">
                    <Droplet className="w-5 h-5 text-blue-600" />
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amount (ml)"
                      autoFocus
                    />
                    <button
                      onClick={updateWaterLog}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingLog(null);
                        setEditAmount('');
                      }}
                      className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Droplet className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">{log.amount_ml}ml</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <button
                        onClick={() => startEdit(log)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWaterLog(log.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
