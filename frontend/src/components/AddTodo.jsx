import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTodo } from '../hooks/useTodos';

function AddTodo() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const createTodo = useCreateTodo();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTodo.mutate(
      { title: title.trim(), priority },
      {
        onSuccess: () => {

          setTitle('');
          setPriority('medium');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="low">Low</SelectItem>

          <SelectItem value="medium">Medium</SelectItem>

          <SelectItem value="high">High</SelectItem>

        </SelectContent>

      </Select>

      <Button type="submit" disabled={createTodo.isPending}>
        {createTodo.isPending ? 'Adding...' : 'Add'}
      </Button>

    </form>

  );
}

export default AddTodo;