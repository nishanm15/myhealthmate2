import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Activity, 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  Moon, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  Droplet,
  Trophy,
  Smile,
  Calendar,
  CheckSquare,
  FileText,
  TrendingUp,
  Layers,
  Scale,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileBottomNav from './MobileBottomNav';
import MobileFAB from './MobileFAB';
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { path: '/diet', icon: Apple, label: 'Diet' },
  { path: '/sleep', icon: Moon, label: 'Sleep' },
  { path: '/water', icon: Droplet, label: 'Water' },
  { path: '/weight', icon: Scale, label: 'Weight' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/mood', icon: Smile, label: 'Mood' },
  { path: '/habits', icon: TrendingUp, label: 'Habits' },
  { path: '/habit-stacks', icon: Layers, label: 'Habit Stacks' },
  { path: '/todos', icon: CheckSquare, label: 'Todos' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/monthly', icon: Calendar, label: 'Monthly' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Enable swipe navigation on mobile
  useSwipeNavigation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">MyHealthMate</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header - Sticky */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 min-h-[60px]">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-lg font-bold text-gray-900">MyHealthMate</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-[60px] left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white border-r border-gray-200 shadow-xl"
          >
            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px]"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-[60px] pb-20 lg:pt-0 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Floating Action Button */}
      <MobileFAB />
    </div>
  );
}
