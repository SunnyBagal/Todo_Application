import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ProgressBar';

import AddTodo from '@/components/AddTodo';
import TodoFilters from '@/components/TodoFilters';
import TodoList from '@/components/TodoList';

import AnalyticsChart from '@/components/AnalyticsChart';

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.username || 'User'}
        </h1>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleDarkMode}>
            {darkMode ? 'Light' : 'Dark'}
          </Button>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>

        </div>

      </div>

      {}
      <ProgressBar />

      {}
      <AddTodo />

      {}
      <TodoFilters />

      {}
      <TodoList />

      {}
      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>

        <AnalyticsChart />
      </div>

    </div>

  );
}

export default DashboardPage;