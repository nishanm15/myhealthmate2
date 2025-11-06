// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  X, 
  Smile,
  Zap,
  Hash,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

const MOOD_OPTIONS = [
  { value: 1, label: 'Terrible', emoji: '😢', color: 'text-red-500' },
  { value: 2, label: 'Bad', emoji: '😕', color: 'text-orange-500' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'text-green-500' },
  { value: 5, label: 'Great', emoji: '😄', color: 'text-blue-500' }
];

const WRITING_PROMPTS = [
  "What am I grateful for today?",
  "What challenges did I face and how did I overcome them?",
  "How am I feeling physically and mentally?",
  "What progress have I made toward my health goals?",
  "What did I learn about myself today?",
  "What would I like to improve tomorrow?"
];

export default function JournalEditor({ entry = null, onSave, onCancel }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [weightEntries, setWeightEntries] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_rating: null,
    energy_level: 5,
    is_linked_to_weight: false,
    weight_entry_id: null,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        mood_rating: entry.mood_rating || null,
        energy_level: entry.energy_level || 5,
        is_linked_to_weight: entry.is_linked_to_weight || false,
        weight_entry_id: entry.weight_entry_id || null,
        tags: entry.tags || []
      });
    }
    fetchRecentWeightEntries();
  }, [entry]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!entry || !formData.title || !formData.content) return;

    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, entry]);

  const fetchRecentWeightEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (!error) {
        setWeightEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching weight entries:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!entry || saving) return;

    setAutoSaving(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: formData.title,
          content: formData.content,
          mood_rating: formData.mood_rating,
          energy_level: formData.energy_level,
          is_linked_to_weight: formData.is_linked_to_weight,
          weight_entry_id: formData.weight_entry_id,
          tags: formData.tags
        })
        .eq('id', entry.id);

      if (!error) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.title || !formData.content) return;

    setSaving(true);
    try {
      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: formData.title,
            content: formData.content,
            mood_rating: formData.mood_rating,
            energy_level: formData.energy_level,
            is_linked_to_weight: formData.is_linked_to_weight,
            weight_entry_id: formData.weight_entry_id,
            tags: formData.tags
          })
          .eq('id', entry.id);

        if (!error) {
          onSave();
        }
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            title: formData.title,
            content: formData.content,
            mood_rating: formData.mood_rating,
            energy_level: formData.energy_level,
            is_linked_to_weight: formData.is_linked_to_weight,
            weight_entry_id: formData.weight_entry_id,
            tags: formData.tags
          });

        if (!error) {
          onSave();
        }
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate word count from HTML content (strip tags for accurate count)
  const getTextContent = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  
  const wordCount = getTextContent(formData.content).trim().split(/\s+/).filter(w => w).length;
  const readingTime = Math.ceil(wordCount / 200);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const insertPrompt = (prompt) => {
    const newContent = formData.content 
      ? `${formData.content}<p>${prompt}</p>` 
      : `<p>${prompt}</p>`;
    setFormData({
      ...formData,
      content: newContent
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {entry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              {autoSaving && (
                <span className="text-sm text-purple-600">Auto-saving...</span>
              )}
              {lastSaved && !autoSaving && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.content}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Entry'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Title Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your entry a title..."
              className="w-full text-3xl font-bold border-none outline-none focus:ring-0 p-0 placeholder-gray-300"
            />
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Rich Text Editor Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Start writing your journal entry..."
            />
          </div>

          {/* Two Column Layout for Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Mood Selector */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-base font-semibold text-gray-900 mb-4">How are you feeling?</label>
                <div className="grid grid-cols-5 gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setFormData({ ...formData, mood_rating: mood.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        formData.mood_rating === mood.value
                          ? 'border-purple-600 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className={`text-xs font-medium ${formData.mood_rating === mood.value ? 'text-purple-600' : 'text-gray-600'}`}>
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-base font-semibold text-gray-900 mb-4">
                  Energy Level: <span className="text-purple-600">{formData.energy_level}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Low Energy</span>
                  <span>High Energy</span>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-base font-semibold text-gray-900 mb-4">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Writing Prompts */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Writing Prompts</h3>
                <div className="space-y-2">
                  {WRITING_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => insertPrompt(prompt)}
                      className="w-full text-left text-sm p-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Weight Entry */}
              {weightEntries.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_linked_to_weight}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        is_linked_to_weight: e.target.checked,
                        weight_entry_id: e.target.checked ? weightEntries[0]?.id : null
                      })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-base font-semibold text-gray-900">Link to weight entry</span>
                  </label>
                  {formData.is_linked_to_weight && (
                    <select
                      value={formData.weight_entry_id || ''}
                      onChange={(e) => setFormData({ ...formData, weight_entry_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select weight entry</option>
                      {weightEntries.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.weight_kg}kg - {new Date(entry.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
