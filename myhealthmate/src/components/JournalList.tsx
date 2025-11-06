// @ts-nocheck
import { useState } from 'react';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Heart,
  Zap,
  Hash,
  Link as LinkIcon,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄'
};

export default function JournalList({ entries, onViewEntry, onEditEntry, onDeleteEntry }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [filterLinked, setFilterLinked] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesMood = filterMood === 'all' || entry.mood_rating === parseInt(filterMood);

      const matchesLinked = 
        filterLinked === 'all' || 
        (filterLinked === 'linked' && entry.is_linked_to_weight) ||
        (filterLinked === 'unlinked' && !entry.is_linked_to_weight);

      return matchesSearch && matchesMood && matchesLinked;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'mood':
          return (b.mood_rating || 0) - (a.mood_rating || 0);
        case 'words':
          return (b.word_count || 0) - (a.word_count || 0);
        default:
          return 0;
      }
    });

  const getPreviewText = (content, maxLength = 200) => {
    if (!content) return '';
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = (div.textContent || div.innerText || '').replace(/\n/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (entries.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Edit className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journal</h3>
          <p className="text-gray-600 text-lg">
            Document your health journey, track your mood, and reflect on your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg transition-colors font-medium ${
              showFilters ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mood">Highest Mood</option>
                    <option value="words">Most Words</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mood</label>
                  <select
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Moods</option>
                    <option value="5">😄 Great (5)</option>
                    <option value="4">🙂 Good (4)</option>
                    <option value="3">😐 Okay (3)</option>
                    <option value="2">😕 Bad (2)</option>
                    <option value="1">😢 Terrible (1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight Link</label>
                  <select
                    value={filterLinked}
                    onChange={(e) => setFilterLinked(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Entries</option>
                    <option value="linked">Linked to Weight</option>
                    <option value="unlinked">Not Linked</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entry Grid */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No entries found matching your filters.</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onViewEntry(entry)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(entry.created_at), 'MMM d, yyyy')}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </span>
                      <span>{entry.word_count || 0} words</span>
                    </div>
                  </div>
                  {entry.mood_rating && (
                    <span className="text-4xl ml-4">{MOOD_EMOJIS[entry.mood_rating]}</span>
                  )}
                </div>

                {/* Preview Text */}
                <p className="text-gray-700 leading-relaxed mb-4 text-base">
                  {getPreviewText(entry.content)}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {entry.energy_level && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
                      <Zap className="w-3 h-3" />
                      Energy {entry.energy_level}/10
                    </span>
                  )}
                  
                  {entry.is_linked_to_weight && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      <LinkIcon className="w-3 h-3" />
                      Weight Linked
                    </span>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-sm text-gray-500">+{entry.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewEntry(entry);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEntry(entry);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
