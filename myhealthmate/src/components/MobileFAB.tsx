import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Dumbbell, Apple, Moon, Droplet, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FABAction {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  path: string;
}

const quickActions: FABAction[] = [
  { icon: Dumbbell, label: 'Workout', color: 'bg-orange-500', path: '/workouts' },
  { icon: Apple, label: 'Meal', color: 'bg-green-500', path: '/diet' },
  { icon: Moon, label: 'Sleep', color: 'bg-purple-500', path: '/sleep' },
  { icon: Droplet, label: 'Water', color: 'bg-blue-500', path: '/water' },
  { icon: Smile, label: 'Mood', color: 'bg-yellow-500', path: '/mood' },
];

export default function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40" data-fab>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
            data-fab
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ 
                    scale: 1, 
                    y: 0,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }
                  }}
                  exit={{ scale: 0, y: 20, transition: { delay: (quickActions.length - index - 1) * 0.05 } }}
                  onClick={() => handleActionClick(action.path)}
                  className={`${action.color} text-white p-4 rounded-full shadow-lg flex items-center gap-3 min-w-[140px]`}
                  whileTap={{ scale: 0.95 }}
                  data-fab
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{action.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-800' : 'bg-blue-600'} text-white p-4 rounded-full shadow-lg`}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        data-fab
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
