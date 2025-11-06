// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Scale, 
  Plus, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, subMonths } from 'date-fns';

export default function WeightTracking() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showSetGoal, setShowSetGoal] = useState(false);
  const [timeRange, setTimeRange] = useState('3m'); // 1w, 1m, 3m, 6m, 1y, all
  
  // Form states
  const [entryForm, setEntryForm] = useState({
    weight_kg: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [goalForm, setGoalForm] = useState({
    target_weight_kg: '',
    start_weight_kg: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchEntries(), fetchActiveGoal()]);
    
    // Sync profile weight with latest entry
    const { data: latestEntries } = await supabase
      .from('weight_entries')
      .select('weight_kg')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (latestEntries && latestEntries.length > 0) {
      await supabase
        .from('profiles')
        .update({ weight: parseFloat(latestEntries[0].weight_kg) })
        .eq('user_id', user.id);
    }
    
    setLoading(false);
  };

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
    }
  };

  const fetchActiveGoal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      setActiveGoal(data);
    } catch (error) {
      console.error('Error fetching active goal:', error);
    }
  };

  const addEntry = async () => {
    if (!user || !entryForm.weight_kg) return;

    try {
      const { error } = await supabase.from('weight_entries').insert({
        user_id: user.id,
        weight_kg: parseFloat(entryForm.weight_kg),
        date: entryForm.date,
        notes: entryForm.notes || null
      });

      if (!error) {
        // Update profile weight with the latest entry
        await supabase
          .from('profiles')
          .update({ weight: parseFloat(entryForm.weight_kg) })
          .eq('user_id', user.id);

        await fetchEntries();
        setEntryForm({ weight_kg: '', date: new Date().toISOString().split('T')[0], notes: '' });
        setShowAddEntry(false);
      }
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this weight entry?')) return;

    try {
      const { error } = await supabase.from('weight_entries').delete().eq('id', id);
      
      if (!error) {
        await fetchEntries();
        
        // Update profile weight with the latest remaining entry
        const { data: latestEntries } = await supabase
          .from('weight_entries')
          .select('weight_kg')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (latestEntries && latestEntries.length > 0) {
          await supabase
            .from('profiles')
            .update({ weight: parseFloat(latestEntries[0].weight_kg) })
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const setGoal = async () => {
    if (!user || !goalForm.target_weight_kg || !goalForm.start_weight_kg || !goalForm.target_date) return;

    try {
      // Deactivate existing goals
      await supabase
        .from('weight_goals')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Create new goal
      const { error } = await supabase.from('weight_goals').insert({
        user_id: user.id,
        target_weight_kg: parseFloat(goalForm.target_weight_kg),
        start_weight_kg: parseFloat(goalForm.start_weight_kg),
        start_date: goalForm.start_date,
        target_date: goalForm.target_date,
        is_active: true
      });

      if (!error) {
        await fetchActiveGoal();
        setGoalForm({ target_weight_kg: '', start_weight_kg: '', start_date: new Date().toISOString().split('T')[0], target_date: '' });
        setShowSetGoal(false);
      }
    } catch (error) {
      console.error('Error setting goal:', error);
    }
  };

  const cancelGoal = async () => {
    if (!activeGoal || !confirm('Cancel your current weight goal?')) return;

    try {
      const { error } = await supabase
        .from('weight_goals')
        .update({ is_active: false })
        .eq('id', activeGoal.id);

      if (!error) {
        setActiveGoal(null);
      }
    } catch (error) {
      console.error('Error canceling goal:', error);
    }
  };

  // Calculate stats
  const latestEntry = entries[0];
  const previousEntry = entries[1];
  const weightChange = latestEntry && previousEntry 
    ? (parseFloat(latestEntry.weight_kg) - parseFloat(previousEntry.weight_kg)).toFixed(1)
    : null;

  // Goal progress
  const goalProgress = activeGoal && latestEntry ? {
    current: parseFloat(latestEntry.weight_kg),
    target: parseFloat(activeGoal.target_weight_kg),
    start: parseFloat(activeGoal.start_weight_kg),
    percentage: Math.round(
      Math.abs((parseFloat(latestEntry.weight_kg) - parseFloat(activeGoal.start_weight_kg)) / 
      (parseFloat(activeGoal.target_weight_kg) - parseFloat(activeGoal.start_weight_kg))) * 100
    ),
    remaining: (parseFloat(latestEntry.weight_kg) - parseFloat(activeGoal.target_weight_kg)).toFixed(1),
    isGain: parseFloat(activeGoal.target_weight_kg) > parseFloat(activeGoal.start_weight_kg)
  } : null;

  // Filter chart data by time range
  const getFilteredChartData = () => {
    let filteredEntries = [...entries].reverse();
    const now = new Date();

    switch (timeRange) {
      case '1w':
        filteredEntries = filteredEntries.filter(e => new Date(e.date) >= subDays(now, 7));
        break;
      case '1m':
        filteredEntries = filteredEntries.filter(e => new Date(e.date) >= subMonths(now, 1));
        break;
      case '3m':
        filteredEntries = filteredEntries.filter(e => new Date(e.date) >= subMonths(now, 3));
        break;
      case '6m':
        filteredEntries = filteredEntries.filter(e => new Date(e.date) >= subMonths(now, 6));
        break;
      case '1y':
        filteredEntries = filteredEntries.filter(e => new Date(e.date) >= subMonths(now, 12));
        break;
      default:
        break;
    }

    return filteredEntries.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      weight: parseFloat(entry.weight_kg),
      fullDate: entry.date
    }));
  };

  const chartData = getFilteredChartData();

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
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Weight Tracking</h1>
            <p className="text-gray-600">Monitor your weight progress and achieve your goals.</p>
          </div>
          <button
            onClick={() => setShowAddEntry(true)}
            className="flex items-center px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Weight
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Weight */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Weight</span>
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {latestEntry ? `${latestEntry.weight_kg} kg` : '--'}
            </div>
            {weightChange && (
              <div className={`flex items-center text-sm mt-2 ${
                parseFloat(weightChange) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {parseFloat(weightChange) > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(parseFloat(weightChange))} kg from last entry
              </div>
            )}
            {latestEntry && (
              <div className="text-xs text-gray-500 mt-1">
                {format(new Date(latestEntry.date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {/* Goal Weight */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Goal Weight</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {activeGoal ? `${activeGoal.target_weight_kg} kg` : '--'}
            </div>
            {!activeGoal && (
              <button
                onClick={() => setShowSetGoal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
              >
                Set a goal
              </button>
            )}
            {activeGoal && (
              <div className="text-xs text-gray-500 mt-1">
                Target: {format(new Date(activeGoal.target_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            {goalProgress ? (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {goalProgress.percentage}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {Math.abs(parseFloat(goalProgress.remaining))} kg to goal
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm">Set a goal to track progress</div>
            )}
          </div>
        </div>

        {/* Active Goal Card */}
        {activeGoal && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Active Goal</h3>
              </div>
              <button
                onClick={cancelGoal}
                className="text-white hover:text-purple-100 text-sm font-medium"
              >
                Cancel Goal
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-purple-100 text-sm">Start</div>
                <div className="text-xl font-bold">{activeGoal.start_weight_kg} kg</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">Current</div>
                <div className="text-xl font-bold">{latestEntry?.weight_kg || '--'} kg</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">Target</div>
                <div className="text-xl font-bold">{activeGoal.target_weight_kg} kg</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">Time Left</div>
                <div className="text-xl font-bold">
                  {Math.max(0, Math.ceil((new Date(activeGoal.target_date) - new Date()) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weight Trend</h3>
              <div className="flex gap-2">
                {['1w', '1m', '3m', '6m', '1y', 'all'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range === '1w' ? '1W' : range === '1m' ? '1M' : range === '3m' ? '3M' : range === '6m' ? '6M' : range === '1y' ? '1Y' : 'All'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Legend />
                {activeGoal && (
                  <ReferenceLine 
                    y={parseFloat(activeGoal.target_weight_kg)} 
                    stroke="#9333ea" 
                    strokeDasharray="5 5"
                    label={{ value: 'Goal', fill: '#9333ea', fontSize: 12 }}
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No weight entries yet</p>
              <p className="text-gray-400 text-sm mt-2">Start tracking your weight to see progress!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {entry.weight_kg} kg
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-600 italic">"{entry.notes}"</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddEntry(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Log Weight</h2>
                <button onClick={() => setShowAddEntry(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryForm.weight_kg}
                    onChange={(e) => setEntryForm({ ...entryForm, weight_kg: e.target.value })}
                    placeholder="75.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    placeholder="Feeling great today!"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addEntry}
                    disabled={!entryForm.weight_kg}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setShowAddEntry(false)}
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

      {/* Set Goal Modal */}
      <AnimatePresence>
        {showSetGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSetGoal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set Weight Goal</h2>
                <button onClick={() => setShowSetGoal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalForm.start_weight_kg}
                    onChange={(e) => setGoalForm({ ...goalForm, start_weight_kg: e.target.value })}
                    placeholder={latestEntry?.weight_kg || "75.5"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalForm.target_weight_kg}
                    onChange={(e) => setGoalForm({ ...goalForm, target_weight_kg: e.target.value })}
                    placeholder="70.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={setGoal}
                    disabled={!goalForm.target_weight_kg || !goalForm.start_weight_kg || !goalForm.target_date}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    Set Goal
                  </button>
                  <button
                    onClick={() => setShowSetGoal(false)}
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
    </div>
  );
}
