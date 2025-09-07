import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Checklist, ChecklistItem, ChecklistCategory } from '@/types';

// --- Query Keys Factory ---
const checklistKeys = {
  all: ['checklists'] as const,
  list: () => [...checklistKeys.all, 'list'] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
};

// --- Query Hooks ---

export const useChecklists = () => {
  return useQuery<Checklist[], Error>({
    queryKey: checklistKeys.list(),
    queryFn: api.checklists.getAll,
  });
};

export const useChecklist = (id: string | null | undefined) => {
  return useQuery<Checklist, Error>({
    queryKey: checklistKeys.detail(id!),
    queryFn: () => api.checklists.getById(id!),
    enabled: !!id,
  });
};

// --- Mutation Hooks ---

// Invalidate queries for checklists after a mutation
const useChecklistMutation = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: checklistKeys.all });
  };
};

export const useCreateChecklist = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: api.checklists.create,
    onSuccess: invalidate,
  });
};

export const useUpdateChecklist = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.checklists.update>[1] & { id: string }) => api.checklists.update(data.id, data),
    onSuccess: invalidate,
  });
};

export const useDeleteChecklist = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: api.checklists.delete,
    onSuccess: invalidate,
  });
};

// --- Category Mutations ---

export const useAddCategory = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: (data: { checklistId: string, name: string, icon?: string }) => api.categories.create(data.checklistId, { name: data.name, icon: data.icon }),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: (data: { categoryId: string, name?: string, icon?: string }) => api.categories.update(data.categoryId, { name: data.name, icon: data.icon }),
    onSuccess: invalidate,
  });
};

export const useDeleteCategory = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: api.categories.delete,
    onSuccess: invalidate,
  });
};

// --- Item Mutations ---

export const useAddItem = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: (data: { categoryId: string, name: string, quantity?: number }) => api.items.create(data.categoryId, { name: data.name, quantity: data.quantity }),
    onSuccess: invalidate,
  });
};

export const useUpdateItem = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: (data: { itemId: string } & Parameters<typeof api.items.update>[1]) => api.items.update(data.itemId, data),
    onSuccess: invalidate,
  });
};

export const useDeleteItem = () => {
  const invalidate = useChecklistMutation();
  return useMutation({
    mutationFn: api.items.delete,
    onSuccess: invalidate,
  });
};
