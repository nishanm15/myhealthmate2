// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Utensils, Moon, Dumbbell, TrendingUp, Heart, Droplet, Smile, CheckSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  todayCaloriesEaten: number;
  todayCaloriesBurned: number;
  todaySleepHours: number;
  weeklyWorkouts: number;
  avgSleepHours: number;
  todayWaterIntake: number;
  waterGoal: number;
  todayMood: any;
  healthScore: number;
}

interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
  priority: string;
  due_date?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Habit {
  id: string;
  title: string;
  category: string;
}

interface HabitLog {
  habit_id: string;
  date: string;
  is_completed: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayCaloriesEaten: 0,
    todayCaloriesBurned: 0,
    todaySleepHours: 0,
    weeklyWorkouts: 0,
    avgSleepHours: 0,
    todayWaterIntake: 0,
    waterGoal: 2000,
    todayMood: null,
    healthScore: 0,
  });
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const calculateHealthScore = async (today: string) => {
    if (!user) return 0;

    try {
      // Fetch today's data
      const [sleepData, workoutsData, mealsData, waterData] = await Promise.all([
        supabase.from('sleep_logs').select('duration').eq('user_id', user.id).gte('sleep_start', today).maybeSingle(),
        supabase.from('workouts').select('id').eq('user_id', user.id).eq('date', today),
        supabase.from('meals').select('calories').eq('user_id', user.id).eq('date', today),
        supabase.from('water_logs').select('amount_ml').eq('user_id', user.id).eq('date', today),
      ]);

      // Sleep Score (25%): 7-9 hours is optimal
      const sleepHours = sleepData.data?.duration || 0;
      let sleepScore = 0;
      if (sleepHours >= 7 && sleepHours <= 9) {
        sleepScore = 25;
      } else if (sleepHours >= 6 && sleepHours <= 10) {
        sleepScore = 20;
      } else if (sleepHours >= 5 && sleepHours <= 11) {
        sleepScore = 15;
      } else if (sleepHours > 0) {
        sleepScore = 10;
      }

      // Exercise Score (25%): At least 1 workout is good
      const workoutCount = workoutsData.data?.length || 0;
      const exerciseScore = workoutCount > 0 ? 25 : 0;

      // Nutrition Score (25%): Based on calorie tracking
      const mealCount = mealsData.data?.length || 0;
      let nutritionScore = 0;
      if (mealCount >= 3) {
        nutritionScore = 25;
      } else if (mealCount === 2) {
        nutritionScore = 20;
      } else if (mealCount === 1) {
        nutritionScore = 15;
      }

      // Water Score (25%): Based on goal achievement
      const waterIntake = waterData.data?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;
      const waterGoal = stats.waterGoal || 2000;
      const waterPercentage = (waterIntake / waterGoal) * 100;
      let waterScore = 0;
      if (waterPercentage >= 100) {
        waterScore = 25;
      } else if (waterPercentage >= 75) {
        waterScore = 20;
      } else if (waterPercentage >= 50) {
        waterScore = 15;
      } else if (waterPercentage >= 25) {
        waterScore = 10;
      }

      const totalScore = sleepScore + exerciseScore + nutritionScore + waterScore;

      // Save health score to database
      await supabase.from('health_scores').upsert({
        user_id: user.id,
        date: today,
        sleep_score: sleepScore,
        exercise_score: exerciseScore,
        nutrition_score: nutritionScore,
        water_score: waterScore,
        total_score: totalScore,
      }, {
        onConflict: 'user_id,date'
      });

      return totalScore;
    } catch (error) {
      console.error('Error calculating health score:', error);
      return 0;
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Fetch user profile for water goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('water_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      const waterGoal = profile?.water_goal || 2000;

      // Today's meals
      const { data: todayMeals } = await supabase
        .from('meals')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', today);

      const todayCaloriesEaten = todayMeals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

      // Today's workouts
      const { data: todayWorkouts } = await supabase
        .from('workouts')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', today);

      const todayCaloriesBurned = todayWorkouts?.reduce((sum, w) => sum + w.calories, 0) || 0;

      // Today's sleep
      const { data: todaySleep } = await supabase
        .from('sleep_logs')
        .select('duration')
        .eq('user_id', user.id)
        .gte('sleep_start', today)
        .order('created_at', { ascending: false })
        .maybeSingle();

      const todaySleepHours = todaySleep?.duration || 0;

      // Weekly workouts count
      const { data: weeklyWorkouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', weekAgo);

      // Weekly sleep average
      const { data: weeklySleep } = await supabase
        .from('sleep_logs')
        .select('duration')
        .eq('user_id', user.id)
        .gte('sleep_start', weekAgo);

      const avgSleepHours = weeklySleep?.length
        ? weeklySleep.reduce((sum, s) => sum + s.duration, 0) / weeklySleep.length
        : 0;

      // Today's water intake
      const { data: todayWater } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today);

      const todayWaterIntake = todayWater?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;

      // Today's mood
      const { data: todayMood } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Last 7 days calorie data
      const { data: weekMeals } = await supabase
        .from('meals')
        .select('date, calories')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date');

      const { data: weekWorkouts } = await supabase
        .from('workouts')
        .select('date, calories')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date');

      // Group by date
      const calorieMap = new Map();
      for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        calorieMap.set(date, { date, eaten: 0, burned: 0 });
      }

      weekMeals?.forEach(meal => {
        if (calorieMap.has(meal.date)) {
          calorieMap.get(meal.date).eaten += meal.calories;
        }
      });

      weekWorkouts?.forEach(workout => {
        if (calorieMap.has(workout.date)) {
          calorieMap.get(workout.date).burned += workout.calories;
        }
      });

      const chartData = Array.from(calorieMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          eaten: d.eaten,
          burned: d.burned,
        }));

      // Calculate health score
      const healthScore = await calculateHealthScore(today);

      // Fetch pending todos
      const { data: pendingTodos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true, nullsLast: true })
        .limit(5);

      setTodos(pendingTodos || []);

      // Fetch recent notes
      const { data: recentNotes } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setNotes(recentNotes || []);

      // Fetch active habits
      const { data: activeHabits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(5);

      setHabits(activeHabits || []);

      // Fetch today's habit logs
      const { data: todayHabitLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      setHabitLogs(todayHabitLogs || []);

      setStats({
        todayCaloriesEaten,
        todayCaloriesBurned,
        todaySleepHours,
        weeklyWorkouts: weeklyWorkouts?.length || 0,
        avgSleepHours: Math.round(avgSleepHours * 10) / 10,
        todayWaterIntake,
        waterGoal,
        todayMood,
        healthScore,
      });
      setCalorieData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Excellent' };
    if (score >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Good' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Needs Improvement' };
  };

  const healthScoreStyle = getHealthScoreColor(stats.healthScore);
  const waterProgress = Math.min((stats.todayWaterIntake / stats.waterGoal) * 100, 100);

  const statCards = [
    {
      title: 'Calories Eaten',
      value: stats.todayCaloriesEaten,
      unit: 'kcal',
      icon: Utensils,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Calories Burned',
      value: stats.todayCaloriesBurned,
      unit: 'kcal',
      icon: Flame,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Sleep Today',
      value: stats.todaySleepHours,
      unit: 'hrs',
      icon: Moon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Workouts This Week',
      value: stats.weeklyWorkouts,
      unit: 'sessions',
      icon: Dumbbell,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your health summary for today.</p>
      </motion.div>

      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`mb-6 sm:mb-8 rounded-xl shadow-sm p-4 sm:p-6 border ${healthScoreStyle.bg} border-gray-100`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${healthScoreStyle.color} mr-3 sm:mr-4`} />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Today's Health Score</h2>
              <p className={`text-xs sm:text-sm font-medium ${healthScoreStyle.color}`}>{healthScoreStyle.label}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className={`text-4xl sm:text-5xl font-bold ${healthScoreStyle.color}`}>{stats.healthScore}</p>
            <p className="text-xs sm:text-sm text-gray-500">out of 100</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions: Water & Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Water Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Water Intake</h3>
            </div>
            <a href="/water" className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              View Details
            </a>
          </div>
          <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${waterProgress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {stats.todayWaterIntake}ml / {stats.waterGoal}ml ({Math.round(waterProgress)}%)
          </p>
        </motion.div>

        {/* Mood Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today's Mood</h3>
            </div>
            <a href="/mood" className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              {stats.todayMood ? 'Update' : 'Log Mood'}
            </a>
          </div>
          {stats.todayMood ? (
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">Mood</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todayMood.mood_level}/10</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">Energy</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todayMood.energy_level}/10</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">Stress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todayMood.stress_level}/10</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No mood logged today</p>
          )}
        </motion.div>
      </div>

      {/* Todo & Notes Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Todos Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pending Tasks</h3>
            </div>
            <a href="/todos" className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              View All
            </a>
          </div>
          {todos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No pending tasks</p>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{todo.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        todo.priority === 'High' ? 'bg-red-100 text-red-700' :
                        todo.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {todo.priority}
                      </span>
                      {todo.due_date && (
                        <span className="text-xs text-gray-500">
                          {new Date(todo.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notes Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Notes</h3>
            </div>
            <a href="/notes" className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              View All
            </a>
          </div>
          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{note.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{note.content}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Habits Widget */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today's Habits</h3>
            </div>
            <a href="/habits" className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              View All
            </a>
          </div>
          <div className="space-y-2">
            {habits.map((habit) => {
              const isCompleted = habitLogs.some(log => log.habit_id === habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{habit.title}</p>
                    <span className="text-xs text-gray-500">{habit.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {card.value}
                <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">{card.unit}</span>
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Calorie Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
      >
        <div className="flex items-center mb-4 sm:mb-6">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">7-Day Calorie Trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <LineChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="eaten" stroke="#f97316" strokeWidth={2} name="Calories Eaten" />
            <Line type="monotone" dataKey="burned" stroke="#ef4444" strokeWidth={2} name="Calories Burned" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm text-gray-600">Calories Eaten</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Calories Burned</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Weekly Averages</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Average Sleep</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgSleepHours} hrs</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Calories</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.todayCaloriesEaten - stats.todayCaloriesBurned} kcal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
