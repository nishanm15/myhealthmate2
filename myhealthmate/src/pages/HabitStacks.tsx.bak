// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2,
  Circle,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HabitStacks() {
  const { user } = useAuth();
  const [stacks, setStacks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStack, setEditingStack] = useState(null);
  const [selectedStack, setSelectedStack] = useState(null);
  const [habitLogs, setHabitLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedHabits, setSelectedHabits] = useState([]);

  useEffect(() => {
    if (user) {
      fetchStacks();
      fetchHabits();
      fetchHabitLogs();
    }
  }, [user]);

  const fetchStacks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_stacks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStacks(data || []);
    } catch (error) {
      console.error('Error fetching stacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchHabitLogs = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;
      setHabitLogs(data || []);
    } catch (error) {
      console.error('Error fetching habit logs:', error);
    }
  };

  const addStack = async () => {
    if (!user || !formData.name) return;

    try {
      const { data: stack, error } = await supabase
        .from('habit_stacks')
        .insert({
          user_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;

      // Add selected habits to stack
      if (selectedHabits.length > 0 && stack) {
        const stackItems = selectedHabits.map((habitId, index) => ({
          user_id: user.id,
          habit_stack_id: stack.id,
          habit_id: habitId,
          order_index: index,
        }));

        await supabase.from('habit_stack_items').insert(stackItems);
      }

      await fetchStacks();
      resetForm();
    } catch (error) {
      console.error('Error adding stack:', error);
    }
  };

  const updateStack = async () => {
    if (!user || !editingStack) return;

    try {
      await supabase
        .from('habit_stacks')
        .update({
          name: formData.name,
          description: formData.description,
        })
        .eq('id', editingStack.id);

      // Delete old stack items and add new ones
      await supabase
        .from('habit_stack_items')
        .delete()
        .eq('habit_stack_id', editingStack.id);

      if (selectedHabits.length > 0) {
        const stackItems = selectedHabits.map((habitId, index) => ({
          user_id: user.id,
          habit_stack_id: editingStack.id,
          habit_id: habitId,
          order_index: index,
        }));

        await supabase.from('habit_stack_items').insert(stackItems);
      }

      await fetchStacks();
      resetForm();
    } catch (error) {
      console.error('Error updating stack:', error);
    }
  };

  const deleteStack = async (id) => {
    if (!confirm('Are you sure you want to delete this habit stack?')) return;

    try {
      await supabase.from('habit_stack_items').delete().eq('habit_stack_id', id);
      await supabase.from('habit_stacks').delete().eq('id', id);
      await fetchStacks();
    } catch (error) {
      console.error('Error deleting stack:', error);
    }
  };

  const startEdit = async (stack) => {
    setEditingStack(stack);
    setFormData({
      name: stack.name,
      description: stack.description || '',
    });

    // Fetch stack items
    const { data } = await supabase
      .from('habit_stack_items')
      .select('habit_id')
      .eq('habit_stack_id', stack.id)
      .order('order_index');

    setSelectedHabits(data?.map(item => item.habit_id) || []);
    setShowAddForm(true);
  };

  const viewStack = async (stack) => {
    const { data } = await supabase
      .from('habit_stack_items')
      .select('habit_id, order_index')
      .eq('habit_stack_id', stack.id)
      .order('order_index');

    const stackHabits = data?.map(item => 
      habits.find(h => h.id === item.habit_id)
    ).filter(Boolean) || [];

    setSelectedStack({ ...stack, habits: stackHabits });
  };

  const completeStack = async (stack) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Fetch stack habits
    const { data: stackItems } = await supabase
      .from('habit_stack_items')
      .select('habit_id')
      .eq('habit_stack_id', stack.id);

    const habitIds = stackItems?.map(item => item.habit_id) || [];

    try {
      // Complete all habits in stack
      const logs = habitIds.map(habitId => ({
        user_id: user.id,
        habit_id: habitId,
        date: today,
        is_completed: true,
      }));

      await supabase.from('habit_logs').upsert(logs, {
        onConflict: 'user_id,habit_id,date'
      });

      await fetchHabitLogs();
    } catch (error) {
      console.error('Error completing stack:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedHabits([]);
    setShowAddForm(false);
    setEditingStack(null);
  };

  const toggleHabitSelection = (habitId) => {
    setSelectedHabits(prev =>
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const isStackCompleted = (stack, stackHabits) => {
    if (!stackHabits || stackHabits.length === 0) return false;
    return stackHabits.every(habit =>
      habitLogs.some(log => log.habit_id === habit.id)
    );
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Habit Stacks</h1>
            <p className="text-gray-600">Group habits into routines for efficient tracking.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Stack
          </button>
        </div>

        {habits.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              You need to create some habits first before creating stacks. Go to the Habits page to get started.
            </p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingStack ? 'Edit Habit Stack' : 'Create New Stack'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stack Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Routine"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Habits (in order)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {habits.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No habits available. Create habits first.
                      </p>
                    ) : (
                      habits.map((habit) => (
                        <div
                          key={habit.id}
                          onClick={() => toggleHabitSelection(habit.id)}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedHabits.includes(habit.id)
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                            selectedHabits.includes(habit.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedHabits.includes(habit.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{habit.title}</p>
                            <p className="text-xs text-gray-500">{habit.category}</p>
                          </div>
                          {selectedHabits.includes(habit.id) && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              #{selectedHabits.indexOf(habit.id) + 1}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click habits in the order you want to complete them. Selected habits show their order number.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingStack ? updateStack : addStack}
                    disabled={!formData.name || selectedHabits.length === 0}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingStack ? 'Update Stack' : 'Create Stack'}
                  </button>
                  <button
                    onClick={resetForm}
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

      {/* Stack Detail Modal */}
      <AnimatePresence>
        {selectedStack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStack(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStack.name}</h2>
                <button onClick={() => setSelectedStack(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {selectedStack.description && (
                <p className="text-gray-600 mb-6">{selectedStack.description}</p>
              )}

              <div className="space-y-3 mb-6">
                {selectedStack.habits?.map((habit, index) => {
                  const isCompleted = habitLogs.some(log => log.habit_id === habit.id);
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-500 w-6">{index + 1}.</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{habit.title}</p>
                        <p className="text-xs text-gray-500">{habit.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  completeStack(selectedStack);
                  setSelectedStack(null);
                }}
                disabled={isStackCompleted(selectedStack, selectedStack.habits)}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
              >
                {isStackCompleted(selectedStack, selectedStack.habits) ? 'Stack Completed!' : 'Complete Entire Stack'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stacks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stacks.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No habit stacks yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first stack to group habits into routines!
            </p>
          </div>
        ) : (
          stacks.map((stack, index) => (
            <motion.div
              key={stack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{stack.name}</h3>
                  {stack.description && (
                    <p className="text-sm text-gray-600">{stack.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(stack)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStack(stack.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewStack(stack)}
                  className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    viewStack(stack).then(() => {
                      setTimeout(() => completeStack(stack), 100);
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
                >
                  Complete Stack
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
