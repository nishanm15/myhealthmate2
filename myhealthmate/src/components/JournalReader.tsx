// @ts-nocheck
import { useState } from 'react';
import { 
  X, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Zap,
  Calendar,
  Hash,
  Link as LinkIcon,
  Download,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const MOOD_DISPLAY = {
  1: { emoji: '😢', label: 'Terrible', color: 'text-red-500' },
  2: { emoji: '😕', label: 'Bad', color: 'text-orange-500' },
  3: { emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
  4: { emoji: '🙂', label: 'Good', color: 'text-green-500' },
  5: { emoji: '😄', label: 'Great', color: 'text-blue-500' }
};

export default function JournalReader({ entry, onEdit, onDelete, onClose, entries, onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Find current entry index and get prev/next
  const currentIndex = entries.findIndex(e => e.id === entry.id);
  const hasPrevious = currentIndex < entries.length - 1;
  const hasNext = currentIndex > 0;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(entries[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(entries[currentIndex - 1]);
    }
  };

  const handleScroll = (e) => {
    const element = e.target;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setScrollProgress(Math.min(scrollPercentage, 100));
  };

  const exportToPDF = () => {
    // Simple export - could be enhanced with proper PDF library
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${entry.title}</title>
          <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
            h1 { font-size: 32px; margin-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .content { white-space: pre-wrap; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>${entry.title}</h1>
          <div class="meta">${format(new Date(entry.created_at), 'MMMM d, yyyy')}</div>
          <div class="content">${entry.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const wordCount = entry.word_count || 0;
  const readingTime = Math.ceil(wordCount / 200);
  const moodInfo = entry.mood_rating ? MOOD_DISPLAY[entry.mood_rating] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {entries.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Actions */}
            <button
              onClick={exportToPDF}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export to PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {entry.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {format(new Date(entry.created_at), 'MMMM d, yyyy')}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </span>
            <span className="text-sm text-gray-500">
              {wordCount} words
            </span>
            <span className="text-sm text-gray-500">
              {readingTime} min read
            </span>
          </div>

          {/* Mood & Energy Card */}
          {(moodInfo || entry.energy_level) && (
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex flex-wrap items-center gap-6">
                {moodInfo && (
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{moodInfo.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Mood</p>
                      <p className={`text-lg font-bold ${moodInfo.color}`}>
                        {moodInfo.label}
                      </p>
                    </div>
                  </div>
                )}
                {entry.energy_level && (
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Energy</p>
                      <p className="text-lg font-bold text-gray-900">
                        {entry.energy_level}/10
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weight Link Indicator */}
          {entry.is_linked_to_weight && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">Linked to weight entry</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                This journal entry is connected to your weight tracking data.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            Last updated: {format(new Date(entry.updated_at), 'MMM d, yyyy h:mm a')}
          </div>
        </article>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
