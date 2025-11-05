// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Check,
  Calendar,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Todos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    if (user) {
      cleanupOldTodos();
      fetchTodaysTodos();
    }
  }, [user]);

  // Get today's date in YYYY-MM-DD format (using local time)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Clean up todos older than yesterday
  const cleanupOldTodos = async () => {
    if (!user) return;

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await supabase
        .from('todos')
        .delete()
        .eq('user_id', user.id)
        .lt('date', yesterdayStr);
    } catch (error) {
      console.error('Error cleaning up old todos:', error);
    }
  };

  // Fetch only today's todos
  const fetchTodaysTodos = async () => {
    if (!user) return;

    try {
      const todayDate = getTodayDate();
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching today\'s todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!user || !newTaskText.trim() || addingTask) return;

    setAddingTask(true);
    try {
      const todayDate = getTodayDate();
      
      const { error } = await supabase.from('todos').insert({
        user_id: user.id,
        title: newTaskText.trim(),
        description: '',
        category: 'General',
        priority: 'Medium',
        date: todayDate,
        is_completed: false,
        due_date: null
      });

      if (!error) {
        setNewTaskText('');
        await fetchTodaysTodos();
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setAddingTask(false);
    }
  };

  const toggleComplete = async (todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !todo.is_completed })
        .eq('id', todo.id);

      if (!error) {
        await fetchTodaysTodos();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (!error) {
        await fetchTodaysTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  };

  // Calculate progress
  const completedCount = todos.filter(t => t.is_completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get today's date formatted nicely
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Daily Tasks</h1>
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{todayFormatted}</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Start fresh each day. Uncompleted tasks disappear at midnight.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-6 h-6 mr-2" />
              <h2 className="text-lg font-semibold">Today's Progress</h2>
            </div>
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-700 rounded-full h-3 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded-full h-3"
            />
          </div>
          <div className="text-sm text-blue-100">
            {progressPercentage}% Complete
            {totalCount === 0 && " - Add your first task to get started!"}
            {totalCount > 0 && completedCount === totalCount && " - Great job! All tasks completed!"}
          </div>
        </div>

        {/* Add Task Input */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task for today..."
              className="flex-1 px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={addingTask}
            />
            <button
              onClick={addTodo}
              disabled={!newTaskText.trim() || addingTask}
              className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center"
            >
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No tasks for today</p>
              <p className="text-gray-400 text-sm mt-2">Add your first task to get started!</p>
            </motion.div>
          ) : (
            todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all ${
                  todo.is_completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(todo)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg transition-all ${
                      todo.is_completed 
                        ? 'bg-green-500 text-white' 
                        : 'border-2 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {todo.is_completed && <Check className="w-6 h-6" />}
                  </button>

                  {/* Task Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-medium break-words ${
                      todo.is_completed 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info Footer */}
      {todos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-blue-800 text-center">
            Tasks reset daily at midnight. Uncompleted tasks will not carry over to tomorrow.
          </p>
        </motion.div>
      )}
    </div>
  );
}
