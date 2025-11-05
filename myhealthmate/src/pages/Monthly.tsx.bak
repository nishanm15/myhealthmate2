// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Download, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Monthly() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMonthlyData();
    }
  }, [user, selectedMonth]);

  const fetchMonthlyData = async () => {
    if (!user) return;

    const startDate = `${selectedMonth}-01`;
    const endDate = new Date(new Date(selectedMonth).setMonth(new Date(selectedMonth).getMonth() + 1))
      .toISOString()
      .split('T')[0];

    try {
      // Fetch workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate);

      // Fetch meals
      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate);

      // Fetch sleep logs
      const { data: sleep } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('sleep_start', startDate)
        .lt('sleep_start', endDate);

      // Fetch water logs
      const { data: water } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate);

      // Fetch mood logs
      const { data: mood } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate);

      // Fetch health scores
      const { data: healthScores } = await supabase
        .from('health_scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date');

      // Calculate statistics
      const stats = {
        workouts: {
          total: workouts?.length || 0,
          totalCalories: workouts?.reduce((sum, w) => sum + w.calories, 0) || 0,
          avgDuration: workouts?.length 
            ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length 
            : 0,
        },
        meals: {
          total: meals?.length || 0,
          totalCalories: meals?.reduce((sum, m) => sum + m.calories, 0) || 0,
          avgCalories: meals?.length 
            ? meals.reduce((sum, m) => sum + m.calories, 0) / meals.length 
            : 0,
        },
        sleep: {
          total: sleep?.length || 0,
          totalHours: sleep?.reduce((sum, s) => sum + s.duration, 0) || 0,
          avgHours: sleep?.length 
            ? sleep.reduce((sum, s) => sum + s.duration, 0) / sleep.length 
            : 0,
        },
        water: {
          totalIntake: water?.reduce((sum, w) => sum + w.amount_ml, 0) || 0,
          avgDaily: water?.length 
            ? water.reduce((sum, w) => sum + w.amount_ml, 0) / new Set(water.map(w => w.date)).size
            : 0,
        },
        mood: {
          avgMood: mood?.length 
            ? mood.reduce((sum, m) => sum + m.mood_level, 0) / mood.length 
            : 0,
          avgEnergy: mood?.length 
            ? mood.reduce((sum, m) => sum + m.energy_level, 0) / mood.length 
            : 0,
          avgStress: mood?.length 
            ? mood.reduce((sum, m) => sum + m.stress_level, 0) / mood.length 
            : 0,
        },
        healthScore: {
          avg: healthScores?.length
            ? healthScores.reduce((sum, h) => sum + h.total_score, 0) / healthScores.length
            : 0,
          trend: healthScores || [],
        },
      };

      setMonthlyData(stats);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!monthlyData) return;

    const csvContent = [
      ['MyHealthMate Monthly Report'],
      [`Month: ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`],
      [],
      ['Category', 'Metric', 'Value'],
      ['Workouts', 'Total Sessions', monthlyData.workouts.total],
      ['Workouts', 'Total Calories Burned', Math.round(monthlyData.workouts.totalCalories)],
      ['Workouts', 'Average Duration (min)', Math.round(monthlyData.workouts.avgDuration)],
      ['Nutrition', 'Total Meals', monthlyData.meals.total],
      ['Nutrition', 'Total Calories', Math.round(monthlyData.meals.totalCalories)],
      ['Nutrition', 'Average Calories', Math.round(monthlyData.meals.avgCalories)],
      ['Sleep', 'Total Nights', monthlyData.sleep.total],
      ['Sleep', 'Total Hours', Math.round(monthlyData.sleep.totalHours * 10) / 10],
      ['Sleep', 'Average Hours', Math.round(monthlyData.sleep.avgHours * 10) / 10],
      ['Hydration', 'Total Water Intake (ml)', Math.round(monthlyData.water.totalIntake)],
      ['Hydration', 'Average Daily (ml)', Math.round(monthlyData.water.avgDaily)],
      ['Mood', 'Average Mood (1-10)', Math.round(monthlyData.mood.avgMood * 10) / 10],
      ['Mood', 'Average Energy (1-10)', Math.round(monthlyData.mood.avgEnergy * 10) / 10],
      ['Mood', 'Average Stress (1-10)', Math.round(monthlyData.mood.avgStress * 10) / 10],
      ['Health Score', 'Average Score', Math.round(monthlyData.healthScore.avg * 10) / 10],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePDFContent = () => {
    if (!monthlyData) return;

    const content = `
MyHealthMate Monthly Report
Month: ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

WORKOUTS
- Total Sessions: ${monthlyData.workouts.total}
- Total Calories Burned: ${Math.round(monthlyData.workouts.totalCalories)} kcal
- Average Duration: ${Math.round(monthlyData.workouts.avgDuration)} minutes

NUTRITION
- Total Meals: ${monthlyData.meals.total}
- Total Calories: ${Math.round(monthlyData.meals.totalCalories)} kcal
- Average Calories: ${Math.round(monthlyData.meals.avgCalories)} kcal

SLEEP
- Total Nights: ${monthlyData.sleep.total}
- Total Hours: ${Math.round(monthlyData.sleep.totalHours * 10) / 10} hours
- Average Hours: ${Math.round(monthlyData.sleep.avgHours * 10) / 10} hours

HYDRATION
- Total Water Intake: ${Math.round(monthlyData.water.totalIntake)} ml
- Average Daily: ${Math.round(monthlyData.water.avgDaily)} ml

MOOD & WELL-BEING
- Average Mood: ${Math.round(monthlyData.mood.avgMood * 10) / 10} / 10
- Average Energy: ${Math.round(monthlyData.mood.avgEnergy * 10) / 10} / 10
- Average Stress: ${Math.round(monthlyData.mood.avgStress * 10) / 10} / 10

HEALTH SCORE
- Average Score: ${Math.round(monthlyData.healthScore.avg * 10) / 10} / 100

Generated by MyHealthMate
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${selectedMonth}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Summary</h1>
            <p className="text-gray-600">Comprehensive overview of your health journey</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={generatePDFContent}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Month Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
      >
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={new Date().toISOString().slice(0, 7)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {monthlyData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Workout Sessions</h3>
              <p className="text-3xl font-bold text-gray-900">{monthlyData.workouts.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {Math.round(monthlyData.workouts.totalCalories)} kcal burned
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Meals</h3>
              <p className="text-3xl font-bold text-gray-900">{monthlyData.meals.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {Math.round(monthlyData.meals.avgCalories)} kcal avg
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sleep Average</h3>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(monthlyData.sleep.avgHours * 10) / 10}
              </p>
              <p className="text-sm text-gray-500 mt-1">hours per night</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Health Score</h3>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(monthlyData.healthScore.avg)}
              </p>
              <p className="text-sm text-gray-500 mt-1">average score</p>
            </motion.div>
          </div>

          {/* Health Score Trend */}
          {monthlyData.healthScore.trend.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Health Score Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData.healthScore.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_score" stroke="#3b82f6" strokeWidth={2} name="Health Score" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Additional Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Monthly Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Daily Water Intake</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(monthlyData.water.avgDaily)} ml
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Mood</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(monthlyData.mood.avgMood * 10) / 10} / 10
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Energy</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(monthlyData.mood.avgEnergy * 10) / 10} / 10
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
