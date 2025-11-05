import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  BarChart3, 
  User 
} from 'lucide-react';

const primaryNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { path: '/diet', icon: Apple, label: 'Diet' },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom" 
      data-bottom-nav
    >
      <div className="flex justify-around items-center h-16 px-2">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              data-bottom-nav
            >
              <motion.div
                className="flex flex-col items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <div className={`relative ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
