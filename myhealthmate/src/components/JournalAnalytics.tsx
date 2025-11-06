// @ts-nocheck
import { useMemo } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Heart, 
  Zap,
  Calendar,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

const MOOD_COLORS = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#3b82f6'  // blue
};

export default function JournalAnalytics({ entries, stats }) {
  // Prepare data for charts
  const analyticsData = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    // Mood distribution
    const moodDistribution = [
      { name: 'Terrible', value: 0, color: MOOD_COLORS[1] },
      { name: 'Bad', value: 0, color: MOOD_COLORS[2] },
      { name: 'Okay', value: 0, color: MOOD_COLORS[3] },
      { name: 'Good', value: 0, color: MOOD_COLORS[4] },
      { name: 'Great', value: 0, color: MOOD_COLORS[5] }
    ];

    entries.forEach(entry => {
      if (entry.mood_rating) {
        moodDistribution[entry.mood_rating - 1].value++;
      }
    });

    // Writing frequency over time (last 30 days)
    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push({
        date: format(date, 'MMM d'),
        entries: 0,
        words: 0,
        avgMood: 0
      });
    }

    entries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const daysAgo = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      if (daysAgo < 30) {
        const index = 29 - daysAgo;
        if (index >= 0) {
          last30Days[index].entries++;
          last30Days[index].words += entry.word_count || 0;
          if (entry.mood_rating) {
            last30Days[index].avgMood = (
              (last30Days[index].avgMood * (last30Days[index].entries - 1) + entry.mood_rating) /
              last30Days[index].entries
            );
          }
        }
      }
    });

    // Energy levels distribution
    const energyDistribution = Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      count: 0
    }));

    entries.forEach(entry => {
      if (entry.energy_level) {
        energyDistribution[entry.energy_level - 1].count++;
      }
    });

    // Monthly writing stats
    const monthlyStats = {};
    entries.forEach(entry => {
      const month = format(new Date(entry.created_at), 'MMM yyyy');
      if (!monthlyStats[month]) {
        monthlyStats[month] = { entries: 0, words: 0 };
      }
      monthlyStats[month].entries++;
      monthlyStats[month].words += entry.word_count || 0;
    });

    const monthlyData = Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        entries: data.entries,
        words: data.words
      }))
      .slice(-6); // Last 6 months

    // Tags frequency
    const tagFrequency = {};
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      moodDistribution: moodDistribution.filter(m => m.value > 0),
      writingFrequency: last30Days,
      energyDistribution,
      monthlyData,
      topTags
    };
  }, [entries]);

  if (!analyticsData || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Yet</h3>
          <p className="text-gray-600">
            Start writing journal entries to see your analytics and insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-purple-500" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalEntries}</span>
            </div>
            <p className="text-sm text-gray-600">Total Entries</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600">Words Written</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-pink-500" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.averageMood > 0 ? stats.averageMood.toFixed(1) : 'N/A'}
              </span>
            </div>
            <p className="text-sm text-gray-600">Average Mood</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.writingStreak}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>

        {/* Writing Frequency Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Writing Activity (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.writingFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entries" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Entries"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mood & Energy Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Distribution */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Levels */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Energy Levels</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.energyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Writing Stats</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="entries" fill="#8b5cf6" name="Entries" />
              <Bar yAxisId="right" dataKey="words" fill="#3b82f6" name="Words" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tags */}
        {analyticsData.topTags.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Most Used Tags</h3>
            <div className="space-y-3">
              {analyticsData.topTags.map((tag, index) => (
                <motion.div
                  key={tag.tag}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 font-medium">#{tag.tag}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(tag.count / entries.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[60px] text-right">
                      {tag.count} {tag.count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <p className="text-gray-700">
                You've written <strong>{stats.totalWords.toLocaleString()} words</strong> across{' '}
                <strong>{stats.totalEntries} entries</strong>. That's an average of{' '}
                <strong>{Math.round(stats.totalWords / stats.totalEntries || 0)} words per entry</strong>.
              </p>
            </div>
            {stats.writingStreak > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <p className="text-gray-700">
                  You're on a <strong>{stats.writingStreak}-day writing streak</strong>. Keep it up!
                </p>
              </div>
            )}
            {stats.averageMood > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
                <p className="text-gray-700">
                  Your average mood rating is <strong>{stats.averageMood.toFixed(1)}/5</strong>, 
                  showing a {stats.averageMood >= 4 ? 'positive' : stats.averageMood >= 3 ? 'balanced' : 'challenging'} emotional state.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
