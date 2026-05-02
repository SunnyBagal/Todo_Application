import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

function TodoItem({ todo }) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const toggleDone = () => {
    updateTodo.mutate({ id: todo._id, done: !todo.done });
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo._id);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      {}
      <button
        onClick={toggleDone}
        disabled={updateTodo.isPending}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          todo.done
            ? 'bg-primary border-primary'
            : 'border-muted-foreground/40 hover:border-primary'
        }`}
      >
        {todo.done && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            />
          </svg>

        )}
      </button>

      {}
      <span
        className={`flex-1 ${
          todo.done ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {todo.title}
      </span>

      {}
      <Badge variant="secondary" className={priorityColors[todo.priority]}>
        {todo.priority}
      </Badge>

      {}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleteTodo.isPending}
        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

      </Button>

    </div>

  );
}

export default TodoItem;