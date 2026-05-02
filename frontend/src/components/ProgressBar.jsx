import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

function ProgressBar() {
  const { data } = useQuery({
    queryKey: ['todos', 'all-for-progress'],
    queryFn: () => api.get('/todos'),
    select: (data) => {
      const todos = data.todos;
      if (todos.length === 0) return { completed: 0, total: 0, percentage: 0 };
      const completed = todos.filter((t) => t.done).length;
      return {
        completed,
        total: todos.length,
        percentage: Math.round((completed / todos.length) * 100),
      };
    },
    staleTime: 1000 * 10,
  });

  const stats = data || { completed: 0, total: 0, percentage: 0 };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>

        <span className="font-medium">
          {stats.completed}/{stats.total} completed ({stats.percentage}%)

        </span>

      </div>

      {}
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${stats.percentage}%` }}
        />

      </div>

    </div>

  );
}

export default ProgressBar;