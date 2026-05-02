import { useUIStore } from "@/stores/useUIStore"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";

export const todoKeys = {
  all:     ['todos'],

  list:    (filters) => ['todos', 'list', filters],
  detail:  (id) => ['todo', 'detail', id],
}

export function useTodos(){
  const statusFilter = useUIStore((s) => s.statusFilter);
  const priorityFilter = useUIStore((s) => s.priorityFilter);

  const filters = { status: statusFilter, priority: priorityFilter};

  return useQuery({
    queryKey: todoKeys.list(filters),

    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      const query = params.toString();
      return api.get(`/todos${query ? `?${query}` : ''}`);
    },

    staleTime: 1000 * 30,
    select: (data) => data.todos,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (newTodo) => api.post('/todos', newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }) => api.patch(`/todos/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/todos/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all});
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }

  });
}