import { Button } from '@/components/ui/button';
import { useUIStore } from '../stores/useUIStore';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function TodoFilters() {

  const statusFilter = useUIStore((s) => s.statusFilter);
  const priorityFilter = useUIStore((s) => s.priorityFilter);
  const setStatusFilter = useUIStore((s) => s.setStatusFilter);
  const setPriorityFilter = useUIStore((s) => s.setPriorityFilter);

  return (
    <div className="flex flex-wrap gap-4">
      {}
      <div className="flex gap-1">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>

        ))}
      </div>

      {}
      <div className="flex gap-1">
        {priorityOptions.map((option) => (
          <Button
            key={option.value}
            variant={priorityFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter(option.value)}
          >
            {option.label}
          </Button>

        ))}
      </div>

    </div>

  );
}

export default TodoFilters;