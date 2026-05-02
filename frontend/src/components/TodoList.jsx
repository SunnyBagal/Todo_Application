import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';

function TodoList() {
  const { data: todos, isLoading, isError, error } = useTodos();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>

    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive py-4">
        Failed to load todos: {error.message}
      </p>

    );
  }

  if (!todos || todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No todos found. Add one above!
      </p>

    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />

      ))}
    </div>

  );
}

export default TodoList;