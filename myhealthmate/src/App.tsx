import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Workouts from '@/pages/Workouts';
import Diet from '@/pages/Diet';
import Sleep from '@/pages/Sleep';
import Water from '@/pages/Water';
import Mood from '@/pages/Mood';
import Habits from '@/pages/Habits';
import HabitStacks from '@/pages/HabitStacks';
import Todos from '@/pages/Todos';
import WeightTracking from '@/pages/WeightTracking';
import Journal from '@/pages/Journal';
import Notes from '@/pages/Notes';
import Achievements from '@/pages/Achievements';
import Monthly from '@/pages/Monthly';
import Analytics from '@/pages/Analytics';
import Profile from '@/pages/Profile';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="diet" element={<Diet />} />
            <Route path="sleep" element={<Sleep />} />
            <Route path="water" element={<Water />} />
            <Route path="mood" element={<Mood />} />
            <Route path="habits" element={<Habits />} />
            <Route path="habit-stacks" element={<HabitStacks />} />
            <Route path="todos" element={<Todos />} />
            <Route path="weight" element={<WeightTracking />} />
            <Route path="journal" element={<Journal />} />
            <Route path="notes" element={<Notes />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="monthly" element={<Monthly />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
