// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Plus, 
  TrendingUp,
  List,
  Heart,
  Zap,
  Target
} from 'lucide-react';
import JournalEditor from '@/components/JournalEditor';
import JournalList from '@/components/JournalList';
import JournalReader from '@/components/JournalReader';
import JournalAnalytics from '@/components/JournalAnalytics';

type ViewMode = 'list' | 'editor' | 'reader' | 'analytics';

export default function Journal() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    averageMood: 0,
    writingStreak: 0
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchEntries(), fetchStats()]);
    setLoading(false);
  };

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('word_count, mood_rating')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalWords = data.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
        const moods = data.filter(entry => entry.mood_rating);
        const averageMood = moods.length > 0 
          ? moods.reduce((sum, entry) => sum + entry.mood_rating, 0) / moods.length 
          : 0;

        setStats({
          totalEntries: data.length,
          totalWords,
          averageMood: Math.round(averageMood * 10) / 10,
          writingStreak: await calculateStreak()
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateStreak = async () => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return 0;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const entry of data) {
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak || (streak === 0 && diffDays === 0)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const handleCreateNew = () => {
    setSelectedEntry(null);
    setViewMode('editor');
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setViewMode('editor');
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setViewMode('reader');
  };

  const handleSaveComplete = () => {
    fetchData();
    setViewMode('list');
    setSelectedEntry(null);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Delete this journal entry? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (!error) {
        fetchData();
        if (viewMode === 'reader' && selectedEntry?.id === entryId) {
          setViewMode('list');
          setSelectedEntry(null);
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If in editor, reader, or analytics mode, show those views directly
  if (viewMode === 'editor') {
    return (
      <JournalEditor
        entry={selectedEntry}
        onSave={handleSaveComplete}
        onCancel={() => {
          setViewMode('list');
          setSelectedEntry(null);
        }}
      />
    );
  }

  if (viewMode === 'reader' && selectedEntry) {
    return (
      <JournalReader
        entry={selectedEntry}
        onEdit={() => handleEditEntry(selectedEntry)}
        onDelete={() => handleDeleteEntry(selectedEntry.id)}
        onClose={() => setViewMode('list')}
        entries={entries}
        onNavigate={(entry) => {
          setSelectedEntry(entry);
        }}
      />
    );
  }

  if (viewMode === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Journal Analytics</h1>
                  <p className="text-gray-600 mt-1">Insights into your wellness journey</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <List className="w-5 h-5" />
                <span>Back to Entries</span>
              </button>
            </div>
          </div>
        </div>
        <JournalAnalytics entries={entries} stats={stats} />
      </div>
    );
  }

  // Default: List view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Health Journal</h1>
                <p className="text-gray-600 mt-1">Document your wellness journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>New Entry</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Total Entries</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{stats.totalEntries}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Words</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalWords.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-700 font-medium">Average Mood</p>
                  <p className="text-3xl font-bold text-pink-900 mt-1">
                    {stats.averageMood > 0 ? `${stats.averageMood}/5` : 'N/A'}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-pink-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Writing Streak</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.writingStreak} days</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry List */}
      <JournalList
        entries={entries}
        onViewEntry={handleViewEntry}
        onEditEntry={handleEditEntry}
        onDeleteEntry={handleDeleteEntry}
      />
    </div>
  );
}
