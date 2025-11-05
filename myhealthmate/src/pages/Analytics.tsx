// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [workoutFrequency, setWorkoutFrequency] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    const days = timeRange === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Fetch all data
      const [mealsRes, workoutsRes, sleepRes] = await Promise.all([
        supabase.from('meals').select('date, calories').eq('user_id', user.id).gte('date', startDate),
        supabase.from('workouts').select('date, calories, type').eq('user_id', user.id).gte('date', startDate),
        supabase.from('sleep_logs').select('sleep_start, duration').eq('user_id', user.id).gte('sleep_start', startDate),
      ]);

      // Create daily map
      const dailyMap = new Map();
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dailyMap.set(date, {
          date,
          caloriesIn: 0,
          caloriesOut: 0,
          sleep: 0,
        });
      }

      // Aggregate meals
      mealsRes.data?.forEach(meal => {
        if (dailyMap.has(meal.date)) {
          dailyMap.get(meal.date).caloriesIn += meal.calories;
        }
      });

      // Aggregate workouts
      workoutsRes.data?.forEach(workout => {
        if (dailyMap.has(workout.date)) {
          dailyMap.get(workout.date).caloriesOut += workout.calories;
        }
      });

      // Aggregate sleep
      sleepRes.data?.forEach(sleep => {
        const date = sleep.sleep_start.split('T')[0];
        if (dailyMap.has(date)) {
          dailyMap.get(date).sleep = sleep.duration;
        }
      });

      const chartData = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          caloriesIn: d.caloriesIn,
          caloriesOut: d.caloriesOut,
          sleep: d.sleep,
        }));

      setAnalyticsData(chartData);

      // Workout frequency by type
      const typeMap = new Map();
      workoutsRes.data?.forEach(workout => {
        if (!typeMap.has(workout.type)) {
          typeMap.set(workout.type, 0);
        }
        typeMap.set(workout.type, typeMap.get(workout.type) + 1);
      });

      const frequencyData = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count,
      }));

      setWorkoutFrequency(frequencyData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Comprehensive health insights and trends</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calorie Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
      >
        <div className="flex items-center mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Calorie Trends</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="caloriesIn" stroke="#f97316" strokeWidth={2} name="Calories In" />
            <Line type="monotone" dataKey="caloriesOut" stroke="#ef4444" strokeWidth={2} name="Calories Out" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sleep Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
      >
        <div className="flex items-center mb-6">
          <Activity className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Sleep Patterns</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sleep" fill="#6366f1" name="Sleep Hours" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Workout Frequency */}
      {workoutFrequency.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Workout Frequency by Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workoutFrequency} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="type" />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Calorie Balance</h3>
          <p className="text-sm text-blue-700">
            {analyticsData.reduce((sum, d) => sum + d.caloriesIn - d.caloriesOut, 0) > 0
              ? 'You are in a caloric surplus'
              : 'You are in a caloric deficit'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <h3 className="font-semibold text-indigo-900 mb-2">Sleep Quality</h3>
          <p className="text-sm text-indigo-700">
            Average: {(analyticsData.reduce((sum, d) => sum + d.sleep, 0) / analyticsData.filter(d => d.sleep > 0).length || 0).toFixed(1)} hrs/night
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Activity Level</h3>
          <p className="text-sm text-green-700">
            {workoutFrequency.reduce((sum, w) => sum + w.count, 0)} workouts in {timeRange === 'week' ? '7 days' : '30 days'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
